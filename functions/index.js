"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateReferralCode = exports.getDriverSettlements = exports.adminGetExpenses = exports.adminUpdateExpenseStatus = exports.adminGetExpenseDetails = exports.submitDVIRReportFreight = exports.adminAddVehicle = exports.addDocumentToFreightLoad = exports.updateFreightLoadStatus = exports.assignDriverToFreightLoad = exports.updateUserRoleAdmin = exports.adminGetUserDetails = exports.getUserProfileFreight = exports.onUserCreateFreight = exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Firebase and Stripe (single initialization)
admin.initializeApp();
const db = admin.firestore();
// Get Stripe secret key from Firebase Functions config
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key);
if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not configured. Run `firebase functions:config:set stripe.secret_key="your-secret-key"`');
}
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
});
// Helper function to generate a unique referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 6;
    let code = 'WG';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
// Helper function to handle checkout session completion
async function handleCheckoutSessionCompleted(session) {
    if (!session.customer) {
        throw new Error('No customer found in session');
    }
    const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer.id;
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
        subscriptionStatus: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription) {
    if (!subscription.customer) {
        throw new Error('No customer found in subscription');
    }
    const customer = await stripe.customers.retrieve(subscription.customer);
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
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
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
    const sig = req.headers['stripe-signature'];
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
        const rawBody = req.rawBody;
        if (!rawBody) {
            throw new Error('Missing request body');
        }
        const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await handleCheckoutSessionCompleted(session);
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await handleSubscriptionUpdate(subscription);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (err) {
        console.error('Webhook error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).send(`Webhook Error: ${errorMessage}`);
    }
});
// Helper Functions
const ensureAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    return context.auth;
};
const ensureRole = (context, allowedRoles) => {
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
exports.onUserCreateFreight = functions.auth.user().onCreate(async (user) => {
    var _a;
    functions.logger.info('New user created:', { email: user.email });
    // Default role for new signups. In a real scenario, this might need manual admin assignment.
    const defaultRole = 'DRIVER_FREIGHT';
    const companyId = 'default_company'; // In a real app, this would be dynamically assigned.
    const userProfile = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || ((_a = user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || null,
        phoneNumber: user.phoneNumber || null,
        companyId: companyId,
        role: defaultRole,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        functions.logger.error(`Error in onUserCreate for ${user.email}:`, error);
        throw error;
    }
});
/**
 * [PRODUCTION READY]
 * Callable function for a user to get their own profile
 */
exports.getUserProfileFreight = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    const { uid } = context.auth;
    try {
        const userDoc = await db.collection('usersFreight').doc(uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User profile not found');
        }
        return Object.assign({ id: userDoc.id }, userDoc.data());
    }
    catch (error) {
        functions.logger.error('Error getting user profile:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get user profile');
    }
});
/**
 * Fetches details for a specific user.
 * Restricted to admins of the same company.
 */
exports.adminGetUserDetails = functions.https.onCall(async (data, context) => {
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
        return Object.assign(Object.assign({ id: userDoc.id }, userData), { email: userRecord.email, emailVerified: userRecord.emailVerified, disabled: userRecord.disabled, metadata: {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
            } });
    }
    catch (error) {
        functions.logger.error('Error in adminGetUserDetails:', error);
        throw error;
    }
});
/**
 * Updates a user's role (admin only)
 */
exports.updateUserRoleAdmin = functions.https.onCall(async (data, context) => {
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
        await admin.auth().setCustomUserClaims(targetUserId, Object.assign(Object.assign({}, auth.token), { role: newRole }));
        // Update Firestore
        await db.collection('usersFreight').doc(targetUserId).update({
            appRole: newRole,
            updatedAt: admin.firestore.Timestamp.now(),
        });
        return {
            success: true,
            message: 'User role updated successfully',
        };
    }
    catch (error) {
        functions.logger.error('Error in updateUserRoleAdmin:', error);
        throw error;
    }
});
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
exports.assignDriverToFreightLoad = functions.https.onCall(async (data, context) => {
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
            const loadData = loadDoc.data();
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
            const driverData = driverDoc.data();
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
    }
    catch (error) {
        functions.logger.error('Error in assignDriverToFreightLoad:', error);
        throw error;
    }
});
/**
 * Updates the status of a freight load with additional options for stop updates
 * @param data Contains loadId, status, and optional stop updates
 * @param context Firebase callable context
 */
exports.updateFreightLoadStatus = functions.https.onCall(async (data, context) => {
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
            const loadData = loadDoc.data();
            // Verify the load belongs to the same company
            if (loadData.companyId !== auth.token.companyId) {
                throw new functions.https.HttpsError('permission-denied', 'Cannot access this load');
            }
            // If user is a driver, verify they are assigned to this load
            if (auth.token.role === 'DRIVER_FREIGHT' && loadData.assignedDriverId !== auth.uid) {
                throw new functions.https.HttpsError('permission-denied', 'You are not the assigned driver for this load');
            }
            // Prepare updates
            const updates = {
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
                    loadData.stops.map((s) => s.id === stopId ? Object.assign(Object.assign({}, s), { status: stopStatus }) : s) :
                    [];
                updates.stops = stops;
            }
            transaction.update(loadRef, updates);
            return { success: true };
        });
    }
    catch (error) {
        functions.logger.error('Error in updateFreightLoadStatus:', error);
        throw error;
    }
});
exports.addDocumentToFreightLoad = functions.https.onCall(async (data, context) => {
    const auth = ensureAuth(context);
    const { loadId, documentInfo } = data;
    const newDoc = Object.assign(Object.assign({}, documentInfo), { id: db.collection('_').doc().id, uploadedBy: auth.uid, uploadedAt: admin.firestore.FieldValue.serverTimestamp() });
    await db.collection('freightLoads').doc(loadId).update({
        documents: admin.firestore.FieldValue.arrayUnion(newDoc),
    });
    return { success: true, documentId: newDoc.id };
});
// Configuration interface for WayGo
// Note: WayGoConfig is kept for future use
// --- DVIR & VEHICLE FUNCTIONS ---
exports.adminAddVehicle = functions.https.onCall(async (data, context) => {
    const auth = ensureRole(context, ['ADMIN_FREIGHT']);
    if (auth.token.companyId !== data.companyId) {
        throw new functions.https.HttpsError('permission-denied', 'You can only add vehicles to your own company.');
    }
    const newVehicleRef = db.collection('vehiclesFreight').doc();
    await newVehicleRef.set(Object.assign(Object.assign({}, data), { id: newVehicleRef.id, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { success: true, vehicleId: newVehicleRef.id };
});
exports.submitDVIRReportFreight = functions.https.onCall(async (data, context) => {
    const auth = ensureAuth(context);
    const driverDoc = await db.collection('usersFreight').doc(auth.uid).get();
    if (!driverDoc.exists)
        throw new functions.https.HttpsError('not-found', 'Driver profile not found.');
    const dvirData = Object.assign(Object.assign({}, data), { driverId: auth.uid, driverName: driverDoc.data().displayName, companyId: driverDoc.data().companyId, date: admin.firestore.FieldValue.serverTimestamp() });
    const dvirRef = await db.collection('dvirReportsFreight').add(dvirData);
    await db.collection('vehiclesFreight').doc(data.vehicleId).update({ lastDVIRId: dvirRef.id });
    return { success: true, dvirId: dvirRef.id };
});
// --- FINANCIAL & SETTLEMENT FUNCTIONS ---
exports.adminGetExpenseDetails = functions.https.onCall(async (data, context) => {
    var _a;
    const auth = ensureRole(context, ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT']);
    const expenseDoc = await db.collection('expenseReportsFreight').doc(data.expenseId).get();
    if (!expenseDoc.exists || ((_a = expenseDoc.data()) === null || _a === void 0 ? void 0 : _a.companyId) !== auth.token.companyId) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot access this expense report.');
    }
    return Object.assign({ id: expenseDoc.id }, expenseDoc.data());
});
exports.adminUpdateExpenseStatus = functions.https.onCall(async (data, context) => {
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
exports.adminGetExpenses = functions.https.onCall(async (data, context) => {
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
exports.getDriverSettlements = functions.https.onCall(async (data, context) => {
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
exports.getOrCreateReferralCode = functions.https.onCall(async (data, context) => {
    const auth = ensureRole(context, ['DRIVER_FREIGHT', 'DISPATCHER_FREIGHT', 'ADMIN_FREIGHT']);
    const userDocRef = db.collection('usersFreight').doc(auth.uid);
    // Use a transaction to prevent race conditions
    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        const userData = userDoc.data();
        // Return existing referral code if it exists
        if (userData === null || userData === void 0 ? void 0 : userData.referralCode) {
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
//# sourceMappingURL=index.js.map