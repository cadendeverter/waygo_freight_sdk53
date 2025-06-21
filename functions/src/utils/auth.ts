import * as admin from 'firebase-admin';
import { HttpsError, CallableRequest } from 'firebase-functions/v2/https';

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

/**
 * Ensures the user is authenticated
 * @param request - The callable request object
 * @returns Authentication object
 */
export const ensureAuth = (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  return request.auth;
};

/**
 * Ensures the user has one of the specified roles
 * @param request - The callable request object
 * @param allowedRoles - Array of allowed roles
 * @returns Authentication object
 */
export const ensureRole = (request: CallableRequest, allowedRoles: string[]) => {
  const auth = ensureAuth(request);
  if (!auth.token.role || !allowedRoles.includes(auth.token.role)) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }
  return auth;
};
