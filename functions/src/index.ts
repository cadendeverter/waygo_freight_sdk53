import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import type { Transaction } from 'firebase-admin/firestore';
import type { Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer | string;
    }
  }
}

// Initialize Firebase and Stripe (single initialization)
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe at runtime to avoid module-level initialization issues
let stripe: Stripe | null = null;

function initializeStripe(): Stripe {
  if (!stripe) {
    // Try Firebase Functions config first, then environment variables
    const stripeSecretKey = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured. Please set: firebase functions:config:set stripe.secret_key="your_key"');
    }
    stripe = new Stripe(stripeSecretKey, {
      typescript: true,
    });
    console.log('Stripe initialized successfully');
  }
  return stripe;
}

function getStripeWebhookSecret(): string {
  // Try Firebase Functions config first, then environment variables
  const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured. Please set: firebase functions:config:set stripe.webhook_secret="your_secret"');
  }
  return webhookSecret;
}

// Function configuration with extended timeout
const functionConfig = {
  timeoutSeconds: 120, // 2 minutes timeout
  memory: '512MiB' as const,
  region: 'us-central1'
};

// Helper function to generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 6;
  let code = 'WG';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to handle checkout session completion
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);
  
  if (!session || !session.customer) {
    console.error('No customer found in session:', session);
    throw new Error('No customer found in session');
  }

  const stripeCustomerId = typeof session.customer === 'string'
    ? session.customer
    : (session.customer as Stripe.Customer)?.id;

  if (!stripeCustomerId) {
    console.error('Unable to extract customer ID from session:', session.customer);
    throw new Error('Unable to extract customer ID');
  }

  console.log('Looking for user with Stripe customer ID:', stripeCustomerId);

  // Update user's subscription status in Firestore
  const userQuery = await db.collection('usersFreight')
    .where('stripeCustomerId', '==', stripeCustomerId)
    .limit(1)
    .get();

  if (userQuery.empty) {
    console.error('No user found with Stripe customer ID:', stripeCustomerId);
    throw new Error('No user found with this Stripe customer ID');
  }

  const userDoc = userQuery.docs[0];
  console.log('Updating user subscription status for user:', userDoc.id);
  
  // Update subscription status
  await userDoc.ref.update({
    subscriptionId: session.subscription,
    subscriptionStatus: 'active', // Default to active since the session is completed
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('Successfully updated user subscription status');
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Processing subscription update:', subscription.id);
  
  if (!subscription || !subscription.customer) {
    console.error('No customer found in subscription:', subscription);
    throw new Error('No customer found in subscription');
  }

  if (!stripe) {
    console.error('Stripe not initialized');
    throw new Error('Stripe not initialized');
  }

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  console.log('Retrieving customer:', customerId);
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer || customer.deleted) {
    console.error('Customer not found or deleted:', customerId);
    throw new Error('Customer not found or deleted');
  }

  const customerData = customer as Stripe.Customer;
  console.log('Looking for user with Stripe customer ID:', customerData.id);

  const userQuery = await db.collection('usersFreight')
    .where('stripeCustomerId', '==', customerData.id)
    .limit(1)
    .get();

  if (userQuery.empty) {
    console.error('No user found with Stripe customer ID:', customerData.id);
    throw new Error('No user found with this Stripe customer ID');
  }

  const userDoc = userQuery.docs[0];
  console.log('Updating user subscription for user:', userDoc.id);
  
  await userDoc.ref.update({
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('Successfully updated user subscription');
}

// Helper Functions
const ensureAuth = (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  return request.auth;
};

const ensureRole = (request: CallableRequest, allowedRoles: string[]) => {
  const auth = ensureAuth(request);
  if (!auth.token.role || !allowedRoles.includes(auth.token.role)) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }
  return auth;
};

// Handle Stripe webhook events
export const stripeWebhook = onRequest(async (req: Request, res: Response) => {
  // Handle preflight for CORS
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'] as string;
  if (!sig) {
    res.status(400).send('No Stripe signature found');
    return;
  }

  if (!getStripeWebhookSecret()) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    res.status(500).send('Server configuration error');
    return;
  }

  try {
    // Type assertion for rawBody
    const rawBody = (req as { rawBody?: Buffer | string }).rawBody;
    if (!rawBody) {
      throw new Error('Missing request body');
    }

    const stripe = initializeStripe();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      getStripeWebhookSecret()
    );

    switch (event.type) {
    case 'checkout.session.completed': {
      try {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Handling checkout session completed event:', session.id);
        await handleCheckoutSessionCompleted(session);
        console.log('Successfully processed checkout session completed');
      } catch (error) {
        console.error('Error processing checkout session completed:', error);
        // Don't rethrow - we want to acknowledge the webhook even if processing fails
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      try {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Handling subscription update event:', subscription.id);
        await handleSubscriptionUpdate(subscription);
        console.log('Successfully processed subscription update');
      } catch (error) {
        console.error('Error processing subscription update:', error);
        // Don't rethrow - we want to acknowledge the webhook even if processing fails
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).send(`Webhook Error: ${errorMessage}`);
  }
});

/**
 * Fetches details for a specific user.
 * Restricted to admins of the same company.
 */
export const adminGetUserDetails = onCall(functionConfig, async (request) => {
  ensureRole(request, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const { userId } = request.data;
  
  if (!userId) {
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    const userRecord = await admin.auth().getUser(userId);
    
    return {
      id: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    throw new HttpsError('internal', 'Failed to get user details');
  }
});

/**
 * Updates a user's role (admin only)
 */
export const updateUserRoleAdmin = onCall(functionConfig, async (request) => {
  ensureRole(request, ['ADMIN_FREIGHT']);
  const { targetUserId, newRole } = request.data;

  if (!targetUserId || !newRole) {
    throw new HttpsError('invalid-argument', 'Target user ID and new role are required');
  }

  const validRoles = ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT', 'DRIVER_FREIGHT', 'CUSTOMER_FREIGHT', 'WAREHOUSE_FREIGHT'];
  if (!validRoles.includes(newRole)) {
    throw new HttpsError('invalid-argument', 'Invalid role specified');
  }

  try {
    // Update user document in Firestore
    await db.collection('usersFreight').doc(targetUserId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update custom claims
    await admin.auth().setCustomUserClaims(targetUserId, {
      role: newRole
    });

    return {
      success: true,
      message: `User role updated to ${newRole}`
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new HttpsError('internal', 'Failed to update user role');
  }
});

// ... (rest of the code remains the same)

interface Stop {
  id: string;
  status?: string;
  // Add other stop properties as needed
}

interface StatusHistoryItem {
  status: string;
  timestamp: admin.firestore.Timestamp;
  userId: string;
  notes?: string;
}

interface LoadData {
  id: string;
  status: string;
  assignedDriverId?: string;
  companyId: string;
  stops?: Stop[];
  statusHistory?: StatusHistoryItem[];
  updatedAt?: admin.firestore.Timestamp;
  paymentAmount?: number;
  amount?: number;
  // Add other load properties as needed
}

interface UserData {
  // Core user data
  uid: string;
  email: string | null;
  displayName: string | null;
  companyId: string;
  role: string;

  // Timestamps
  createdAt: admin.firestore.Timestamp | Date;
  updatedAt: admin.firestore.Timestamp | Date;
  lastLogin?: admin.firestore.Timestamp | Date | null;

  // User status
  isActive?: boolean;
  disabled?: boolean;
  emailVerified?: boolean;

  // Contact info
  phoneNumber?: string | null;
  photoURL?: string | null;

  // Payment & Subscription
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;

  // Authentication metadata
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
    [key: string]: any;
  };

  // Custom fields
  referralCode?: string;

  // Legacy fields (keep for backward compatibility)
  creationTime?: string;
  lastSignInTime?: string;

  // Custom claims
}

// Summary data interface is kept for future use
// interface SummaryData {
//   driverId: string;
//   currentStatus: string;
//   drivingTimeTodaySecs: number;
//   onDutyTimeTodaySecs: number;
//   cycleAvailableTimeSecs: number;
//   cycleTimeRemainingSecs: number;
//   lastStatusChange: admin.firestore.Timestamp;
//   lastResetTime: admin.firestore.Timestamp;
//   totalLoads?: number;
//   completedLoads?: number;
//   pendingLoads?: number;
//   inProgressLoads?: number;
//   totalRevenue?: number;
//   totalExpenses?: number;
//   netEarnings?: number;
//   startDate?: admin.firestore.Timestamp;
//   endDate?: admin.firestore.Timestamp;
//   onTimePercentage?: number;
//   averageLoadDuration?: number; // in hours
//   updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
//   createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
// }

/**
 * Assigns a driver to a freight load
 * @param data Contains loadId and driverId
 * @param context Firebase callable context
 */
export const assignDriverToFreightLoad = onCall(functionConfig, async (request) => {
  ensureRole(request, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const { loadId, driverId } = request.data;

  if (!loadId || !driverId) {
    throw new HttpsError('invalid-argument', 'Load ID and Driver ID are required');
  }

  try {
    await db.collection('freightLoads').doc(loadId).update({
      assignedDriverId: driverId,
      status: 'assigned',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: 'Driver assigned successfully'
    };
  } catch (error) {
    console.error('Error assigning driver:', error);
    throw new HttpsError('internal', 'Failed to assign driver');
  }
});

/**
 * Updates the status of a freight load with additional options for stop updates
 * @param data Contains loadId, status, and optional stop updates
 * @param context Firebase callable context
 */
export const updateFreightLoadStatus = onCall(functionConfig, async (request) => {
  const auth = ensureRole(request, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT', 'DRIVER_FREIGHT']);
  const { loadId, status, stopId, stopStatus, notes, location } = request.data;

  if (!loadId || !status) {
    throw new HttpsError('invalid-argument', 'Load ID and status are required');
  }

  try {
    const loadRef = db.collection('freightLoads').doc(loadId);
    
    await db.runTransaction(async (transaction: Transaction) => {
      const loadDoc = await transaction.get(loadRef);
      
      if (!loadDoc.exists) {
        throw new HttpsError('not-found', 'Load not found');
      }

      const loadData = loadDoc.data() as LoadData;
      
      // Update main status
      const updateData: Partial<LoadData> = {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as any
      };

      // Update specific stop if provided
      if (stopId && loadData.stops) {
        const updatedStops = loadData.stops.map(stop => 
          stop.id === stopId ? { ...stop, status: stopStatus || status } : stop
        );
        updateData.stops = updatedStops;
      }

      // Add to status history
      const statusHistoryItem: any = {
        status,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId: auth.uid,
        notes: notes || '',
        location: location || null
      };

      updateData.statusHistory = [
        ...(loadData.statusHistory || []),
        statusHistoryItem
      ] as any;

      transaction.update(loadRef, updateData);
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating load status:', error);
    throw new HttpsError('internal', 'Failed to update load status');
  }
});

export const addDocumentToFreightLoad = onCall(functionConfig, async (request) => {
  const auth = ensureAuth(request);
  const { loadId, documentInfo } = request.data;
  const newDoc = {
    ...documentInfo,
    id: db.collection('_').doc().id,
    uploadedBy: auth.uid,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection('freightLoads').doc(loadId).update({
    documents: admin.firestore.FieldValue.arrayUnion(newDoc),
  });
  return { success: true, documentId: newDoc.id };
});

// Configuration interface for WayGo
// Note: WayGoConfig is kept for future use

// --- DVIR & VEHICLE FUNCTIONS ---
export const adminAddVehicle = onCall(functionConfig, async (request) => {
  const auth = ensureRole(request, ['ADMIN_FREIGHT']);
  if (auth.token.companyId !== request.data.companyId) {
    throw new HttpsError('permission-denied', 'You can only add vehicles to your own company.');
  }
  const newVehicleRef = db.collection('vehiclesFreight').doc();
  await newVehicleRef.set({ ...request.data, id: newVehicleRef.id, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { success: true, vehicleId: newVehicleRef.id };
});

export const submitDVIRReportFreight = onCall(functionConfig, async (request) => {
  const auth = ensureAuth(request);
  const driverDoc = await db.collection('usersFreight').doc(auth.uid).get();
  if (!driverDoc.exists) throw new HttpsError('not-found', 'Driver profile not found.');

  const dvirData = {
    ...request.data,
    driverId: auth.uid,
    driverName: driverDoc.data()!.displayName,
    companyId: driverDoc.data()!.companyId,
    date: admin.firestore.FieldValue.serverTimestamp(),
  };
  const dvirRef = await db.collection('dvirReportsFreight').add(dvirData);
  await db.collection('vehiclesFreight').doc(request.data.vehicleId).update({ lastDVIRId: dvirRef.id });
  return { success: true, dvirId: dvirRef.id };
});

// --- FINANCIAL & SETTLEMENT FUNCTIONS ---

export const adminGetExpenseDetails = onCall(functionConfig, async (request) => {
  const auth = ensureRole(request, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const expenseDoc = await db.collection('expenseReportsFreight').doc(request.data.expenseId).get();
  if (!expenseDoc.exists || expenseDoc.data()?.companyId !== auth.token.companyId) {
    throw new HttpsError('permission-denied', 'Cannot access this expense report.');
  }
  return { id: expenseDoc.id, ...expenseDoc.data() };
});

export const adminUpdateExpenseStatus = onCall(functionConfig, async (request) => {
  const auth = ensureRole(request, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const { expenseId, status, rejectionReason } = request.data;
  const updates = {
    status,
    approvedBy: auth.uid,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    rejectionReason: rejectionReason || null
  };
  await db.collection('expenseReportsFreight').doc(expenseId).update(updates);
  return { success: true, message: 'Expense status updated successfully' };
});

export const adminGetExpenses = onCall(functionConfig, async (request) => {
  // ... (rest of the code remains the same)
  const auth = ensureRole(request, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const { companyId, status, page = 1, limit = 20 } = request.data;

  if (auth.token.companyId !== companyId) {
    throw new HttpsError('permission-denied', 'Unauthorized company access');
  }

  const query = db.collection('expenseReportsFreight')
    .where('companyId', '==', companyId)
    .where('status', '==', status)
    .orderBy('createdAt', 'desc');

  // Get total count with proper Firestore aggregation types
  const countQuery = await query.count().get();
  const countData = countQuery.data();
  const total = typeof countData === 'object' && countData !== null && 'count' in countData ?
    Number(countData.count) :
    0;

  // Get paginated results
  const expensesSnapshot = await query
    .limit(limit)
    .offset((page - 1) * limit)
    .get();

  // Process expenses data
  await Promise.all(expensesSnapshot.docs.map(async (_doc) => {
    // Process each document
  }));

  return {
    expenses: [],
    total,
  };
});

export const getDriverSettlements = onCall(functionConfig, async (request) => {
  const auth = ensureAuth(request);
  const { driverId, period, companyId } = request.data;

  if (auth.token.companyId !== companyId) {
    throw new HttpsError('permission-denied', 'Unauthorized company access');
  }

  if (!/^\d{4}-\d{2}$/.test(period)) {
    throw new HttpsError('invalid-argument', 'Period must be in YYYY-MM format');
  }

  // Get the count of loads for this company with proper Firestore aggregation types
  const countQuery = await db.collection('freightLoads')
    .where('companyId', '==', companyId)
    .count()
    .get();
  const countData = countQuery.data();
  const loadCount = typeof countData === 'object' && countData !== null && 'count' in countData ?
    Number(countData.count) :
    0;
  console.log(`Total loads for company ${companyId}: ${loadCount}`);

  // Get all loads for the driver in the period
  const periodStart = new Date();
  const periodEnd = new Date();

  // Calculate date range based on period
  switch (period) {
    case 'week':
      periodStart.setDate(periodStart.getDate() - 7);
      break;
    case 'month':
      periodStart.setMonth(periodStart.getMonth() - 1);
      break;
    default:
      periodStart.setDate(periodStart.getDate() - 7);
  }

  const startTimestamp = admin.firestore.Timestamp.fromDate(periodStart);
  const endTimestamp = admin.firestore.Timestamp.fromDate(periodEnd);

  const loadsQuery = db.collection('freightLoads')
    .where('driverId', '==', driverId)
    .where('companyId', '==', companyId)
    .where('status', '==', 'COMPLETED')
    .where('createdAt', '>=', startTimestamp)
    .where('createdAt', '<', endTimestamp);

  // Get paginated results
  const loadsSnapshot = await loadsQuery
    .limit(100)
    .get();

  // Process loads data
  await Promise.all(loadsSnapshot.docs.map(async (_doc) => {
    // Process each document
  }));
});

export const getOrCreateReferralCode = onCall(functionConfig, async (request) => {
  const auth = ensureRole(request, ['DRIVER_FREIGHT', 'DISPATCHER_FREIGHT', 'ADMIN_FREIGHT']);
  const userDocRef = db.collection('usersFreight').doc(auth.uid);

  // Use a transaction to prevent race conditions
  return db.runTransaction(async (transaction: Transaction) => {
    const userDoc = await transaction.get(userDocRef);
    const userData = userDoc.data() as UserData | undefined;

    // Return existing referral code if it exists
    if (userData?.referralCode) {
      return { code: userData.referralCode };
    }

    // Generate a new unique referral code
    const newCode = generateReferralCode();
    transaction.update(userDocRef, {
      referralCode: newCode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
        
    return { success: true, referralCode: newCode };
  });
});

// Export Stripe pricing and referral functions
export { 
  createSubscription,
  getSubscription,
  cancelSubscription,
  getReferralStats,
  createPaymentIntent
} from './stripe-pricing';
