import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// User data interface
export interface UserData {
    uid: string;
    email: string;
    role: string;
    referralCode?: string;
    subscriptionId?: string;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

// Helper function to ensure authentication
export const ensureAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  return context.auth;
};

// Helper function to ensure user has required role
export const ensureRole = (context: functions.https.CallableContext, allowedRoles: string[]) => {
  const auth = ensureAuth(context);
  if (!allowedRoles.includes(auth.token.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Role not authorized');
  }
  return auth;
};
