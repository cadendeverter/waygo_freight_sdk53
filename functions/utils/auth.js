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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRole = exports.ensureAuth = void 0;
const functions = __importStar(require("firebase-functions"));
// Helper function to ensure authentication
const ensureAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    return context.auth;
};
exports.ensureAuth = ensureAuth;
// Helper function to ensure user has required role
const ensureRole = (context, allowedRoles) => {
    const auth = (0, exports.ensureAuth)(context);
    if (!allowedRoles.includes(auth.token.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Role not authorized');
    }
    return auth;
};
exports.ensureRole = ensureRole;
//# sourceMappingURL=auth.js.map