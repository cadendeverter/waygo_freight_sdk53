// waygo-freight/functions/src/stripe-pricing.ts
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

const db = admin.firestore();

// Define secrets for v6
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

// Function configuration with extended timeout
const functionConfig = {
  timeoutSeconds: 120, // 2 minutes timeout
  memory: '512MiB' as const,
  region: 'us-central1',
  secrets: [stripeSecretKey]
};

// Initialize Stripe - will be done inside functions with secrets
const createStripeInstance = (secretKey: string) => new Stripe(secretKey, {
  typescript: true,
});

// Pricing Plans Configuration
export const PRICING_PLANS = {
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 100,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    features: [
      'Up to 25 drivers',
      'Advanced load management',
      'Route optimization',
      'Real-time tracking',
      'Customer portal access',
      'Mobile app access',
      'Priority support',
      'Analytics dashboard'
    ],
    driverLimit: 25,
    loadLimit: 1000
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 200,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: [
      'Unlimited drivers',
      'Advanced load management',
      'Route optimization',
      'Real-time tracking',
      'Customer portal access',
      'Mobile app access',
      'White-label options',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
      'API access'
    ],
    driverLimit: -1, // Unlimited
    loadLimit: -1   // Unlimited
  }
};

// Referral configuration
const REFERRAL_DISCOUNT_PERCENTAGE = 50;
const REFERRAL_REWARD_AMOUNT = 50; // $50 credit for referrer
const EXISTING_REFERRAL_COUPON_ID = process.env.STRIPE_REFERRAL_COUPON_ID;

// Tax Configuration - Using Stripe's built-in automatic tax
const TAX_CONFIG = {
  // Enable Stripe's automatic tax calculation
  automaticTaxEnabled: true,
  // Stripe Tax handles all tax compliance automatically
  stripeAutomaticTax: {
    enabled: true,
    liability: {
      type: 'self' as const // We handle tax compliance ourselves
    }
  }
};

// Function to get Stripe's automatic tax settings
const getAutomaticTaxSettings = () => {
  if (TAX_CONFIG.automaticTaxEnabled) {
    return {
      automatic_tax: {
        enabled: true,
        liability: TAX_CONFIG.stripeAutomaticTax.liability
      }
    };
  }
  return {};
};

// Function to get tax settings for a customer or subscription
const getTaxSettingsForCustomer = async (customerId?: string) => {
  try {
    if (TAX_CONFIG.automaticTaxEnabled) {
      // Use Stripe's automatic tax calculation
      return getAutomaticTaxSettings();
    } else {
      // Fallback - return empty object to disable automatic tax
      return {};
    }
  } catch (error) {
    logger.error('Error getting tax settings for customer:', error);
    // Return automatic tax as fallback
    return getAutomaticTaxSettings();
  }
};

interface UserSubscription {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  plan: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  referralApplied: boolean;
  referralCode?: string;
  referredBy?: string;
}

interface CreateSubscriptionData {
  planId: string;
  referralCode?: string;
  paymentMethodId: string;
}

// Create Stripe customer and setup subscription
export const createSubscription = onCall(
  functionConfig,
  async (request: CallableRequest<CreateSubscriptionData>) => {
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planId, referralCode, paymentMethodId } = data;
    const userId = auth.uid;

    try {
      // Validate plan
      const plan = Object.values(PRICING_PLANS).find(p => p.id === planId);
      if (!plan) {
        throw new HttpsError('invalid-argument', 'Invalid plan selected');
      }

      // Get user data
      const userDoc = await db.collection('usersFreight').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData) {
        throw new HttpsError('not-found', 'User not found');
      }

      let stripeCustomerId = userData.stripeCustomerId;
      const stripe = createStripeInstance(stripeSecretKey.value());

      // Create customer if doesn't exist
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userData.email,
          name: userData.displayName || userData.email,
          metadata: { userId },
          // Enable tax collection for new customers
          tax_exempt: 'none'
        });
        
        stripeCustomerId = customer.id;
        
        // Update user document with Stripe customer ID
        await db.collection('usersFreight').doc(userId).update({
          stripeCustomerId: stripeCustomerId
        });
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
        // Ensure customer is not tax exempt
        tax_exempt: 'none'
      });

      // Validate referral code if provided
      let referralValid = false;
      let referralCouponId: string | undefined;

      if (referralCode) {
        const referralResult = await validateReferralCode(userId, referralCode);
        if (referralResult.valid) {
          referralValid = true;
          // Use existing referral coupon
          if (EXISTING_REFERRAL_COUPON_ID) {
            referralCouponId = EXISTING_REFERRAL_COUPON_ID;
          } else {
            throw new HttpsError('failed-precondition', 'Referral coupon not configured. Please set STRIPE_REFERRAL_COUPON_ID.');
          }
        }
      }

      // Get tax settings for this customer
      const taxSettings = await getTaxSettingsForCustomer(stripeCustomerId);

      // Create subscription with customer and tax settings
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price: plan.stripePriceId,
        }],
        default_payment_method: paymentMethodId,
        discounts: referralCouponId ? [{ coupon: referralCouponId }] : undefined,
        // Set customer as not tax-exempt (allows tax calculation)
        ...taxSettings, // This includes automatic_tax settings
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
          referralCode: referralCode || '',
          referralCodeUsed: referralCouponId ? 'true' : 'false'
        }
      });

      // Save subscription data
      const subscriptionData: UserSubscription = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: stripeCustomerId,
        plan: planId,
        status: subscription.status,
        currentPeriodStart: (subscription as any).current_period_start,
        currentPeriodEnd: (subscription as any).current_period_end,
        createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        referralApplied: referralValid,
        referralCode: referralCode || undefined,
        referredBy: referralValid ? referralCode : undefined
      };

      await db.collection('subscriptions').doc(userId).set(subscriptionData);

      // Handle referral reward if applicable
      if (referralValid && referralCode) {
        await processReferralReward(referralCode, userId);
      }

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = (invoice as any)?.payment_intent as Stripe.PaymentIntent;

      return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret || null,
        status: subscription.status,
        referralApplied: referralValid,
        discountAmount: referralCouponId ? (plan.price * REFERRAL_DISCOUNT_PERCENTAGE / 100) : 0
      };

    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw new HttpsError('internal', 'Failed to create subscription');
    }
  }
);

// Validate referral code function
async function validateReferralCode(userId: string, referralCode: string): Promise<{ valid: boolean, referrerId?: string }> {
  return db.runTransaction(async (transaction) => {
    // Check if user already used a referral discount
    const userDoc = await transaction.get(db.collection('usersFreight').doc(userId));
    const userData = userDoc.data();
    
    if (userData?.referralDiscountApplied) {
      return { valid: false }; // User already used a referral discount
    }

    // Find the referrer by referral code
    const referrerQuery = await db.collection('usersFreight')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      return { valid: false }; // Referral code doesn't exist
    }

    const referrerDoc = referrerQuery.docs[0];
    const referrerId = referrerDoc.id;

    // Can't refer yourself
    if (referrerId === userId) {
      return { valid: false };
    }

    // Mark user as having used referral discount
    transaction.update(db.collection('usersFreight').doc(userId), {
      referralDiscountApplied: true
    });

    return { valid: true, referrerId };
  });
}

// Process referral reward
async function processReferralReward(referralCode: string, newUserId: string): Promise<void> {
  const referrerQuery = await db.collection('usersFreight')
    .where('referralCode', '==', referralCode)
    .limit(1)
    .get();

  if (!referrerQuery.empty) {
    const referrerDoc = referrerQuery.docs[0];
    const referrerId = referrerDoc.id;

    // Add reward to referrer's account
    const accountRef = db.collection('accounts').doc(referrerId);
    
    await db.runTransaction(async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      const currentCredits = accountDoc.exists ? (accountDoc.data()?.credits || 0) : 0;
      
      transaction.set(accountRef, {
        credits: currentCredits + REFERRAL_REWARD_AMOUNT
      }, { merge: true });

      // Log the referral
      const referralRef = db.collection('referrals').doc();
      transaction.set(referralRef, {
        referrerId: referrerId,
        referredUserId: newUserId,
        referralCode: referralCode,
        rewardAmount: REFERRAL_REWARD_AMOUNT,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }
}

// Get subscription details
export const getSubscription = onCall(
  functionConfig,
  async (request: CallableRequest) => {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = auth.uid;

    try {
      const subscriptionDoc = await db.collection('subscriptions').doc(userId).get();
      
      if (!subscriptionDoc.exists) {
        return null;
      }

      const subscriptionData = subscriptionDoc.data() as UserSubscription;
      const stripe = createStripeInstance(stripeSecretKey.value());
      
      // Get latest Stripe subscription data
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionData.stripeSubscriptionId);
      
      // Get plan details
      const plan = Object.values(PRICING_PLANS).find(p => p.id === subscriptionData.plan);

      return {
        stripeStatus: stripeSubscription.status,
        plan: plan,
        currentPeriodStart: (stripeSubscription as any).current_period_start,
        currentPeriodEnd: (stripeSubscription as any).current_period_end,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        referralApplied: subscriptionData.referralApplied,
        referralCode: subscriptionData.referralCode,
        referredBy: subscriptionData.referredBy
      };

    } catch (error) {
      logger.error('Error getting subscription:', error);
      throw new HttpsError('internal', 'Failed to get subscription');
    }
  }
);

interface CancelSubscriptionData {
  immediately?: boolean;
}

// Cancel subscription
export const cancelSubscription = onCall(
  functionConfig,
  async (request: CallableRequest<CancelSubscriptionData>) => {
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { immediately = false } = data;
    const userId = auth.uid;

    try {
      const subscriptionDoc = await db.collection('subscriptions').doc(userId).get();
      
      if (!subscriptionDoc.exists) {
        throw new HttpsError('not-found', 'Subscription not found');
      }

      const subscriptionData = subscriptionDoc.data() as UserSubscription;
      const stripe = createStripeInstance(stripeSecretKey.value());

      if (immediately) {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscriptionData.stripeSubscriptionId);
        
        // Update local data
        await db.collection('subscriptions').doc(userId).update({
          status: 'canceled'
        });
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(subscriptionData.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      }

      return { success: true, immediately };

    } catch (error) {
      logger.error('Error canceling subscription:', error);
      throw new HttpsError('internal', 'Failed to cancel subscription');
    }
  }
);

// Get referral statistics
export const getReferralStats = onCall(
  functionConfig,
  async (request: CallableRequest) => {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = auth.uid;

    try {
      // Get user's referral code
      const userDoc = await db.collection('usersFreight').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData) {
        throw new HttpsError('not-found', 'User not found');
      }

      const referralCode = userData.referralCode;
      
      if (!referralCode) {
        return {
          referralCode: null,
          totalReferrals: 0,
          totalRewards: 0,
          availableCredits: 0
        };
      }

      // Get referral statistics
      const referralsQuery = await db.collection('referrals')
        .where('referrerId', '==', userId)
        .get();

      const totalReferrals = referralsQuery.size;
      const totalRewards = referralsQuery.docs.reduce((sum, doc) => {
        return sum + (doc.data().rewardAmount || 0);
      }, 0);

      // Get available credits
      const accountDoc = await db.collection('accounts').doc(userId).get();
      const availableCredits = accountDoc.exists ? (accountDoc.data()?.credits || 0) : 0;

      // Get referred user emails for display
      const referralUsers = referralsQuery.docs.map(doc => doc.data().referredUserId);

      return {
        referralCode,
        totalReferrals,
        totalRewards,
        availableCredits,
        referralUsers
      };

    } catch (error) {
      logger.error('Error getting referral stats:', error);
      throw new HttpsError('internal', 'Failed to get referral stats');
    }
  }
);

interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  description?: string;
}

// Create one-time payment intent
export const createPaymentIntent = onCall(
  functionConfig,
  async (request: CallableRequest<CreatePaymentIntentData>) => {
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { amount, currency = 'usd', description } = data;
    const userId = auth.uid;

    try {
      const userDoc = await db.collection('usersFreight').doc(userId).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new HttpsError('not-found', 'User not found');
      }

      let stripeCustomerId = userData.stripeCustomerId;
      const stripe = createStripeInstance(stripeSecretKey.value());

      // Create customer if doesn't exist
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userData.email,
          name: userData.displayName || userData.email,
          metadata: { userId },
          // Enable tax collection for new customers
          tax_exempt: 'none'
        });

        stripeCustomerId = customer.id;
        await db.collection('usersFreight').doc(userId).update({
          stripeCustomerId: stripeCustomerId
        });
      }

      // Get tax settings
      const taxSettings = await getTaxSettingsForCustomer(stripeCustomerId);

      // Create payment intent with customer, amount, and tax settings
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        customer: stripeCustomerId,
        ...taxSettings, // This includes automatic_tax settings
        metadata: {
          userId,
          description: description || 'One-time payment',
          customerEmail: userData.email || ''
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };

    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw new HttpsError('internal', 'Failed to create payment intent');
    }
  }
);

// Calculate tax for a given amount and location (for display purposes)
export const calculateTax = onCall(
  {
    secrets: [stripeSecretKey],
  },
  async ({ auth, data }) => {
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { amount, location } = data;
    
    if (!amount || amount <= 0) {
      throw new HttpsError('invalid-argument', 'Valid amount is required');
    }

    try {
      const stripe = createStripeInstance(stripeSecretKey.value());
      
      // With Stripe automatic tax, we use tax calculation API for preview
      const calculation = await stripe.tax.calculations.create({
        currency: 'usd',
        line_items: [
          {
            amount: amount,
            reference: 'preview-calculation'
          }
        ],
        customer_details: {
          address: {
            country: location?.country || 'US',
            state: location?.state || 'TX'
          },
          address_source: 'shipping'
        }
      });

      return {
        amount: amount,
        taxAmount: calculation.tax_amount_exclusive,
        totalAmount: calculation.amount_total,
        taxBreakdown: calculation.tax_breakdown,
        location: location || { country: 'US', state: 'TX' }
      };
    } catch (error) {
      logger.error('Error calculating tax:', error);
      throw new HttpsError('internal', 'Failed to calculate tax');
    }
  }
);

// Get current tax configuration and Stripe tax information
export const getTaxInfo = onCall(
  {
    secrets: [stripeSecretKey],
  },
  async ({ auth }) => {
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    try {
      return {
        automaticTaxEnabled: TAX_CONFIG.automaticTaxEnabled,
        taxSystem: 'stripe_automatic',
        liability: TAX_CONFIG.stripeAutomaticTax.liability,
        supportedRegions: ['US', 'CA', 'EU', 'GB', 'AU'] // Stripe Tax supports many regions
      };
    } catch (error) {
      logger.error('Error getting tax info:', error);
      throw new HttpsError('internal', 'Failed to get tax information');
    }
  }
);

interface UpdateTaxExemptionData {
  customerId?: string;
  taxExempt: 'none' | 'exempt' | 'reverse';
}

export const updateTaxExemption = onCall(
  functionConfig,
  async (request: CallableRequest<UpdateTaxExemptionData>) => {
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { customerId, taxExempt } = data;
    const userId = auth.uid;

    try {
      const stripe = createStripeInstance(stripeSecretKey.value());
      
      // Get user's customer ID if not provided
      let stripeCustomerId = customerId;
      if (!stripeCustomerId) {
        const userDoc = await db.collection('usersFreight').doc(userId).get();
        const userData = userDoc.data();
        
        if (!userData?.stripeCustomerId) {
          throw new HttpsError('not-found', 'Customer not found');
        }
        
        stripeCustomerId = userData.stripeCustomerId;
      }

      // Update customer tax exemption status
      if (!stripeCustomerId) {
        throw new HttpsError('not-found', 'Customer ID is required');
      }
      
      const customer = await stripe.customers.update(stripeCustomerId, {
        tax_exempt: taxExempt
      });

      return {
        customerId: customer.id,
        taxExempt: customer.tax_exempt,
        message: `Tax exemption status updated to: ${taxExempt}`
      };

    } catch (error) {
      logger.error('Error updating tax exemption:', error);
      throw new HttpsError('internal', 'Failed to update tax exemption status');
    }
  }
);
