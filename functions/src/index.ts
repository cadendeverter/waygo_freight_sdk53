import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
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

// Get Stripe secret key from Firebase Functions config
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not configured. Run `firebase functions:config:set stripe.secret_key="your-secret-key"`');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil' as const,
});

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
  if (!session.customer) {
    throw new Error('No customer found in session');
  }

  const stripeCustomerId = typeof session.customer === 'string'
    ? session.customer
    : (session.customer as Stripe.Customer).id;

  // Update user's subscription status in Firestore
  const userQuery = await db.collection('usersFreight')
    .where('stripeCustomerId', '==', stripeCustomerId)
    .limit(1)
    .get();

  if (userQuery.empty) {
    throw new Error('No user found with this Stripe customer ID');
  }

  const userDoc = userQuery.docs[0];
  // Update subscription status
  await userDoc.ref.update({
    subscriptionId: session.subscription,
    subscriptionStatus: 'active', // Default to active since the session is completed
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  if (!subscription.customer) {
    throw new Error('No customer found in subscription');
  }

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const userQuery = await db.collection('usersFreight')
    .where('stripeCustomerId', '==', customer.id)
    .limit(1)
    .get();

  if (userQuery.empty) {
    throw new Error('No user found with this Stripe customer ID');
  }

  const userDoc = userQuery.docs[0];
  await userDoc.ref.update({
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

// Handle Stripe webhook events
export const stripeWebhook = functions.https.onRequest(async (req: Request, res: Response) => {
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

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
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

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
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

// Helper Functions
const ensureAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  return context.auth;
};

const ensureRole = (context: functions.https.CallableContext, allowedRoles: string[]) => {
  const auth = ensureAuth(context);
  const userRole = auth.token.role || '';
  if (!allowedRoles.includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }
  return auth;
};

/**
 * Creates a user profile document in Firestore and sets a custom claim
 * when a new Firebase Auth user is created.
 */
export const onUserCreateFreight = functions.auth.user().onCreate(async (user) => {
  functions.logger.info('New user created:', { email: user.email });

  // Default role for new signups. In a real scenario, this might need manual admin assignment.
  const defaultRole = 'DRIVER_FREIGHT';
  const companyId = 'default_company'; // In a real app, this would be dynamically assigned.

  const userProfile: UserData = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || user.email?.split('@')[0] || null,
    phoneNumber: user.phoneNumber || null,
    companyId: companyId,
    role: defaultRole,
    createdAt: admin.firestore.FieldValue.serverTimestamp() as unknown as admin.firestore.Timestamp,
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as unknown as admin.firestore.Timestamp,
    isActive: true,
    emailVerified: user.emailVerified || false,
    disabled: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
  };

  try {
    // Set the user profile document in Firestore
    await db.collection('usersFreight').doc(user.uid).set(userProfile);
    functions.logger.info(`Successfully created profile for ${user.email}`);

    // Set custom claim for role-based access control
    await admin.auth().setCustomUserClaims(user.uid, {
      role: defaultRole,
      companyId: companyId,
    });
    functions.logger.info(`Successfully set custom claims for ${user.email}`);

    return { success: true };
  } catch (error) {
    functions.logger.error(`Error in onUserCreate for ${user.email}:`, error);
    throw error;
  }
});

/**
 * [PRODUCTION READY]
 * Callable function for a user to get their own profile
 */
export const getUserProfileFreight = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  const { uid } = context.auth;

  try {
    const userDoc = await db.collection('usersFreight').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    functions.logger.error('Error getting user profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user profile');
  }
});

/**
 * Fetches details for a specific user.
 * Restricted to admins of the same company.
 */
export const adminGetUserDetails = functions.https.onCall(async (data: { userId: string }, context) => {
  const auth = ensureRole(context, ['ADMIN_FREIGHT']);
  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    const [userRecord, userDoc] = await Promise.all([
      admin.auth().getUser(userId),
      db.collection('usersFreight').doc(userId).get(),
    ]);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userData = userDoc.data();
    if (!userData || userData.companyId !== auth.token.companyId) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot access this user');
    }

    return {
      id: userDoc.id,
      ...userData,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
    };
  } catch (error) {
    functions.logger.error('Error in adminGetUserDetails:', error);
    throw error;
  }
});

/**
 * Updates a user's role (admin only)
 */
export const updateUserRoleAdmin = functions.https.onCall(
  async (data: { targetUserId: string; newRole: string }, context) => {
    const auth = ensureRole(context, ['ADMIN_FREIGHT']);
    const { targetUserId, newRole } = data;

    if (!targetUserId || !newRole) {
      throw new functions.https.HttpsError('invalid-argument', 'User ID and new role are required');
    }

    const validRoles = ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT', 'DRIVER_FREIGHT'];
    if (!validRoles.includes(newRole)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid role specified');
    }

    try {
      // Update custom claims
      await admin.auth().setCustomUserClaims(targetUserId, {
        ...auth.token,
        role: newRole,
      });

      // Update Firestore
      await db.collection('usersFreight').doc(targetUserId).update({
        appRole: newRole,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      return {
        success: true,
        message: 'User role updated successfully',
      };
    } catch (error) {
      functions.logger.error('Error in updateUserRoleAdmin:', error);
      throw error;
    }
  });

// --- LOAD & DISPATCH FUNCTIONS ---

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
export const assignDriverToFreightLoad = functions.https.onCall(
  async (data: { loadId: string; driverId: string }, context) => {
    const auth = ensureRole(context, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
    const { loadId, driverId } = data;

    if (!loadId || !driverId) {
      throw new functions.https.HttpsError('invalid-argument', 'Load ID and Driver ID are required');
    }

    const loadRef = db.collection('freightLoads').doc(loadId);
    const driverRef = db.collection('usersFreight').doc(driverId);

    try {
      // Use a transaction to ensure data consistency
      await db.runTransaction(async (transaction) => {
        // Get the load data
        const loadDoc = await transaction.get(loadRef);
        if (!loadDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'Load not found');
        }

        const loadData = loadDoc.data() as LoadData;

        // Verify the load belongs to the same company
        if (loadData.companyId !== auth.token.companyId) {
          throw new functions.https.HttpsError('permission-denied', 'Cannot access this load');
        }

        // Check if load is already assigned
        if (loadData.status === 'ASSIGNED' || loadData.assignedDriverId) {
          throw new functions.https.HttpsError('failed-precondition', 'Load is already assigned to a driver');
        }

        // Get the driver data
        const driverDoc = await transaction.get(driverRef);
        if (!driverDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'Driver not found');
        }

        const driverData = driverDoc.data() as UserData;

        // Verify driver belongs to the same company and is actually a driver
        if (driverData.companyId !== auth.token.companyId || driverData.role !== 'DRIVER_FREIGHT') {
          throw new functions.https.HttpsError('permission-denied', 'Invalid driver assignment');
        }

        // Update the load with the driver assignment
        transaction.update(loadRef, {
          assignedDriverId: driverId,
          status: 'ASSIGNED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Optionally, update the driver's current load
        transaction.update(driverRef, {
          currentLoadId: loadId,
          isAvailable: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      return {
        success: true,
        message: 'Driver assigned to load successfully',
      };
    } catch (error) {
      functions.logger.error('Error in assignDriverToFreightLoad:', error);
      throw error;
    }
  });

/**
 * Updates the status of a freight load with additional options for stop updates
 * @param data Contains loadId, status, and optional stop updates
 * @param context Firebase callable context
 */
export const updateFreightLoadStatus = functions.https.onCall(async (data: {
  loadId: string;
  status: string;
  stopId?: string;
  stopStatus?: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}, context) => {
  const auth = ensureRole(context, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT', 'DRIVER_FREIGHT']);
  const { loadId, status, stopId, stopStatus, notes, location } = data;

  if (!loadId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'Load ID and status are required');
  }

  const loadRef = db.collection('freightLoads').doc(loadId);

  try {
    return await db.runTransaction(async (transaction) => {
      const loadDoc = await transaction.get(loadRef);
      if (!loadDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Load not found');
      }

      const loadData = loadDoc.data() as LoadData;

      // Verify the load belongs to the same company
      if (loadData.companyId !== auth.token.companyId) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot access this load');
      }

      // If user is a driver, verify they are assigned to this load
      if (auth.token.role === 'DRIVER_FREIGHT' && loadData.assignedDriverId !== auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'You are not the assigned driver for this load');
      }

      // Prepare updates
      const updates: FirebaseFirestore.UpdateData<Partial<LoadData>> = {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: auth.uid,
          notes,
          location,
        }),
      };

      // Update specific stop status if provided
      if (stopId && stopStatus) {
        const stops = Array.isArray(loadData.stops) ?
          loadData.stops.map((s: any) =>
            s.id === stopId ? { ...s, status: stopStatus } : s
          ) :
          [];
        updates.stops = stops;
      }

      transaction.update(loadRef, updates);
      return { success: true };
    });
  } catch (error) {
    functions.logger.error('Error in updateFreightLoadStatus:', error);
    throw error;
  }
});

export const addDocumentToFreightLoad = functions.https.onCall(async (data, context) => {
  const auth = ensureAuth(context);
  const { loadId, documentInfo } = data;
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
export const adminAddVehicle = functions.https.onCall(async (data, context) => {
  const auth = ensureRole(context, ['ADMIN_FREIGHT']);
  if (auth.token.companyId !== data.companyId) {
    throw new functions.https.HttpsError('permission-denied', 'You can only add vehicles to your own company.');
  }
  const newVehicleRef = db.collection('vehiclesFreight').doc();
  await newVehicleRef.set({ ...data, id: newVehicleRef.id, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { success: true, vehicleId: newVehicleRef.id };
});

export const submitDVIRReportFreight = functions.https.onCall(async (data, context) => {
  const auth = ensureAuth(context);
  const driverDoc = await db.collection('usersFreight').doc(auth.uid).get();
  if (!driverDoc.exists) throw new functions.https.HttpsError('not-found', 'Driver profile not found.');

  const dvirData = {
    ...data,
    driverId: auth.uid,
    driverName: driverDoc.data()!.displayName,
    companyId: driverDoc.data()!.companyId,
    date: admin.firestore.FieldValue.serverTimestamp(),
  };
  const dvirRef = await db.collection('dvirReportsFreight').add(dvirData);
  await db.collection('vehiclesFreight').doc(data.vehicleId).update({ lastDVIRId: dvirRef.id });
  return { success: true, dvirId: dvirRef.id };
});

// --- FINANCIAL & SETTLEMENT FUNCTIONS ---

export const adminGetExpenseDetails = functions.https.onCall(async (data, context) => {
  const auth = ensureRole(context, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const expenseDoc = await db.collection('expenseReportsFreight').doc(data.expenseId).get();
  if (!expenseDoc.exists || expenseDoc.data()?.companyId !== auth.token.companyId) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot access this expense report.');
  }
  return { id: expenseDoc.id, ...expenseDoc.data() };
});

export const adminUpdateExpenseStatus = functions.https.onCall(async (data, context) => {
  const auth = ensureRole(context, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const { expenseId, status, rejectionReason } = data;
  const updates = {
    status,
    approvedBy: auth.uid,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    rejectionReason: rejectionReason || null
  };
  await db.collection('expenseReportsFreight').doc(expenseId).update(updates);
  return { success: true, message: 'Expense status updated successfully' };
});

export const adminGetExpenses = functions.https.onCall(async (data, context) => {
  // ... (rest of the code remains the same)
  const auth = ensureRole(context, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
  const { companyId, status, page = 1, limit = 20 } = data;

  if (auth.token.companyId !== companyId) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized company access');
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

export const getDriverSettlements = functions.https.onCall(async (data, context) => {
  const auth = ensureAuth(context);
  const { driverId, period, companyId } = data;

  if (auth.token.companyId !== companyId) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized company access');
  }

  if (!/^\d{4}-\d{2}$/.test(period)) {
    throw new functions.https.HttpsError('invalid-argument', 'Period must be in YYYY-MM format');
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
  functions.logger.info(`Total loads for company ${companyId}: ${loadCount}`);

  // Get all loads for the driver in the period
  const periodStart = new Date(period + '-01');
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodStart.getMonth() + 1);

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

export const getOrCreateReferralCode = functions.https.onCall(async (data, context) => {
  const auth = ensureRole(context, ['DRIVER_FREIGHT', 'DISPATCHER_FREIGHT', 'ADMIN_FREIGHT']);
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
