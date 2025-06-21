# WayGo Freight - Production Deployment Guide

## 🚀 Complete Enterprise Freight Management Platform

This guide provides comprehensive instructions for deploying the WayGo Freight enterprise-grade freight management platform to production.

---

## 📋 Pre-Deployment Checklist

### ✅ System Requirements
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Expo CLI**: v6.x (`npm install -g @expo/cli`)
- **Firebase CLI**: v12.x (`npm install -g firebase-tools`)
- **React Native CLI**: Latest version
- **Xcode**: 14.x (for iOS builds)
- **Android Studio**: Latest version (for Android builds)

### ✅ Required Accounts & Services
- **Firebase Project**: Production-ready project
- **Stripe Account**: Live mode configured
- **Apple Developer Account**: For iOS app store
- **Google Play Console**: For Android app store
- **Domain & SSL**: For web deployment

---

## 🔧 Environment Configuration

### 1. Firebase Setup

#### Create Production Firebase Project
```bash
# Login to Firebase
firebase login

# Create new project or select existing
firebase projects:list
firebase use --add production-project-id
```

#### Configure Firebase Services
1. **Authentication**: Enable Email/Password, Google, Apple Sign-In
2. **Firestore**: Setup production database with security rules
3. **Storage**: Configure file upload rules
4. **Functions**: Enable billing for Cloud Functions
5. **Hosting**: Enable for web deployment

#### Security Rules (Firestore)
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /usersFreight/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Company data access based on companyId
    match /companies/{companyId}/loads/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/usersFreight/$(request.auth.uid)).data.companyId == companyId;
    }
    
    // Subscription data (user-specific)
    match /subscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Referral data (read-only for validation)
    match /referrals/{referralCode} {
      allow read: if request.auth != null;
      allow write: if false; // Only functions can write
    }
  }
}
```

### 2. Stripe Configuration

#### Production Stripe Setup
1. **Create Stripe Account**: Switch to live mode
2. **Configure Webhooks**: Add production webhook endpoint
3. **Create Products & Prices**: Setup subscription plans
4. **Get API Keys**: Publishable and secret keys

#### Stripe Products Setup
```bash
# Create products via Stripe CLI or Dashboard
stripe products create --name="WayGo Freight Starter" --description="Up to 5 drivers"
stripe products create --name="WayGo Freight Professional" --description="Up to 25 drivers" 
stripe products create --name="WayGo Freight Enterprise" --description="Unlimited drivers"

# Create recurring prices
stripe prices create --product="prod_starter_id" --currency=usd --recurring-interval=month --unit-amount=9900
stripe prices create --product="prod_professional_id" --currency=usd --recurring-interval=month --unit-amount=19900
stripe prices create --product="prod_enterprise_id" --currency=usd --recurring-interval=month --unit-amount=39900
```

### 3. Environment Variables

#### Firebase Functions Config
```bash
# Set Stripe configuration
firebase functions:config:set stripe.secret_key="sk_live_your_stripe_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
firebase functions:config:set stripe.publishable_key="pk_live_your_publishable_key"

# Set pricing configuration  
firebase functions:config:set stripe.starter_price_id="price_starter_live_id"
firebase functions:config:set stripe.professional_price_id="price_professional_live_id"
firebase functions:config:set stripe.enterprise_price_id="price_enterprise_live_id"

# Deploy configuration
firebase functions:config:get > .runtimeconfig.json
```

#### App Configuration (.env.production)
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# App Configuration
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_URL=https://your_api_domain.com
EXPO_PUBLIC_WEB_URL=https://your_web_domain.com

# Feature Flags
EXPO_PUBLIC_ENABLE_SAMPLE_DATA=false
EXPO_PUBLIC_ENABLE_DEV_LOGIN=false
```

---

## 🚀 Deployment Steps

### 1. Prepare Codebase

#### Install Dependencies
```bash
# Install all dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..

# Verify no vulnerabilities
npm audit fix
```

#### Build Validation
```bash
# TypeScript compilation check
npx tsc --noEmit

# Run linting
npm run lint

# Run tests (if available)
npm run test
```

### 2. Deploy Firebase Backend

#### Deploy Functions
```bash
# Deploy all Firebase functions
firebase deploy --only functions

# Deploy specific functions (optional)
firebase deploy --only functions:createSubscription,functions:getSubscription
```

#### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### 3. Configure Stripe Webhook

#### Production Webhook Endpoint
```
Endpoint URL: https://us-central1-your_project_id.cloudfunctions.net/stripeWebhook
Events to send:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### 4. Mobile App Deployment

#### iOS Deployment

##### Build for Production
```bash
# Configure app.json for production
{
  "expo": {
    "name": "WayGo Freight",
    "slug": "waygo-freight",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.waygofreight.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.waygofreight.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false
          },
          "android": {
            "newArchEnabled": false
          }
        }
      ]
    ]
  }
}

# Build iOS app
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

##### iOS App Store Configuration
1. **App Information**: Name, description, keywords, categories
2. **Screenshots**: Required for all device sizes
3. **App Review Information**: Contact info, review notes
4. **Pricing**: Set pricing tier
5. **Release**: Choose manual or automatic release

#### Android Deployment

##### Build for Production
```bash
# Build Android app
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

##### Google Play Console Setup
1. **App Details**: Title, short/full description, graphics
2. **Store Listing**: Screenshots, feature graphic, video
3. **Content Rating**: Complete content questionnaire
4. **Pricing**: Set pricing and availability
5. **Release Management**: Create production release

### 5. Web Deployment

#### Build Web App
```bash
# Build for web
npx expo export --platform web

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### Custom Domain Setup
```bash
# Add custom domain in Firebase Console
# Configure DNS records:
# A record: @ -> Firebase IP
# CNAME: www -> your_project_id.web.app

# SSL Certificate (automatic with Firebase)
```

---

## 🔐 Security Configuration

### 1. Firebase Security Rules

#### Firestore Security
```javascript
// Advanced security rules
match /companies/{companyId} {
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/usersFreight/$(request.auth.uid)).data.companyId == companyId &&
    get(/databases/$(database)/documents/usersFreight/$(request.auth.uid)).data.role in ['ADMIN_FREIGHT', 'DISPATCHER_FREIGHT'];
}

match /loads/{loadId} {
  allow read: if request.auth != null && (
    // Driver can read assigned loads
    resource.data.assignedDriverId == request.auth.uid ||
    // Company members can read company loads
    get(/databases/$(database)/documents/usersFreight/$(request.auth.uid)).data.companyId == resource.data.companyId
  );
}
```

#### Cloud Storage Security
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /companies/{companyId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/usersFreight/$(request.auth.uid)).data.companyId == companyId;
    }
    
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. API Security

#### Rate Limiting
```typescript
// functions/src/middleware/rateLimiting.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'subscription_calls',
  points: 5, // Number of requests
  duration: 60, // Per 60 seconds
});

export const rateLimitMiddleware = async (context: any) => {
  const key = context.auth?.uid || context.rawRequest.ip;
  
  try {
    await rateLimiter.consume(key);
  } catch (rateLimiterRes) {
    throw new functions.https.HttpsError('resource-exhausted', 'Too many requests');
  }
};
```

#### Input Validation
```typescript
// functions/src/utils/validation.ts
import Joi from 'joi';

export const subscriptionSchema = Joi.object({
  planId: Joi.string().valid('starter', 'professional', 'enterprise').required(),
  referralCode: Joi.string().alphanum().length(8).optional(),
  paymentMethodId: Joi.string().required()
});

export const validateInput = (data: any, schema: Joi.ObjectSchema) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.details[0].message);
  }
  return value;
};
```

---

## 📊 Monitoring & Analytics

### 1. Firebase Analytics

#### Setup Analytics
```typescript
// utils/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

export const trackSubscription = (planId: string, amount: number) => {
  logEvent(analytics, 'purchase', {
    currency: 'USD',
    value: amount,
    items: [{
      item_id: planId,
      item_name: `WayGo Freight ${planId}`,
      category: 'subscription',
      quantity: 1,
      price: amount
    }]
  });
};

export const trackReferral = (referralCode: string) => {
  logEvent(analytics, 'referral_used', {
    referral_code: referralCode
  });
};
```

### 2. Performance Monitoring

#### Setup Crashlytics
```bash
# Install Crashlytics
expo install @react-native-firebase/crashlytics

# Configure in app.json
{
  "plugins": [
    "@react-native-firebase/crashlytics"
  ]
}
```

### 3. Error Tracking

#### Sentry Integration (Optional)
```bash
# Install Sentry
expo install @sentry/react-native

# Configure
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your_sentry_dsn'
});
```

---

## 🧪 Testing & Quality Assurance

### 1. Pre-Production Testing

#### Test Stripe Integration
```bash
# Use Stripe test mode first
STRIPE_SECRET_KEY=sk_test_... npm run test:payments

# Test subscription flows
# Test referral system
# Test webhook handling
```

#### Load Testing
```bash
# Test Firebase Functions under load
# Test database performance
# Test API rate limits
```

### 2. User Acceptance Testing

#### Test Scenarios
1. **New User Registration**: Complete signup flow
2. **Subscription Purchase**: All plan tiers with/without referrals
3. **Referral System**: Code generation, sharing, discount application
4. **Payment Processing**: Success and failure scenarios
5. **Cancellation Flow**: Immediate and end-of-period cancellation

---

## 📈 Post-Deployment

### 1. Launch Monitoring

#### First 24 Hours
- Monitor error rates in Firebase Console
- Track subscription conversion rates
- Monitor Stripe webhook delivery
- Check app store review status

#### First Week
- Analyze user adoption metrics
- Monitor payment success rates
- Track referral program usage
- Gather user feedback

### 2. Marketing Integration

#### Analytics Tracking
```typescript
// Track key business metrics
export const trackBusinessMetrics = {
  userRegistration: (userId: string, source: string) => {
    logEvent(analytics, 'sign_up', {
      method: source,
      user_id: userId
    });
  },
  
  subscriptionStart: (planId: string, value: number) => {
    logEvent(analytics, 'subscription_start', {
      plan: planId,
      value: value,
      currency: 'USD'
    });
  },
  
  referralSuccess: (referralCode: string) => {
    logEvent(analytics, 'referral_conversion', {
      referral_code: referralCode
    });
  }
};
```

### 3. Customer Support Setup

#### Support Documentation
1. **User Guides**: Feature documentation
2. **FAQ**: Common questions and issues
3. **Video Tutorials**: Key feature walkthroughs
4. **API Documentation**: For integrations

#### Support Channels
1. **In-app Support**: Help desk integration
2. **Email Support**: Dedicated support email
3. **Live Chat**: Real-time customer support
4. **Knowledge Base**: Self-service articles

---

## 🔄 Maintenance & Updates

### 1. Regular Updates

#### Monthly Updates
- Security patches
- Feature enhancements
- Performance optimizations
- User feedback implementation

#### Quarterly Reviews
- Analytics analysis
- User feedback review
- Competitive analysis
- Feature roadmap planning

### 2. Scaling Considerations

#### Infrastructure Scaling
```bash
# Monitor Firebase usage
# Scale functions based on load
# Optimize database queries
# Implement caching strategies
```

#### Business Scaling
- Multi-region deployment
- Enterprise features
- API rate limit increases
- Custom integrations

---

## 🎯 Success Metrics

### Key Performance Indicators

#### Business Metrics
- **Monthly Recurring Revenue (MRR)**: Track subscription revenue
- **Customer Acquisition Cost (CAC)**: Cost to acquire customers
- **Customer Lifetime Value (CLV)**: Long-term customer value
- **Churn Rate**: Monthly customer churn percentage
- **Referral Conversion Rate**: Referral to paid conversion

#### Technical Metrics
- **App Performance**: Load times, crash rates
- **API Response Times**: Function execution times
- **Error Rates**: Function and app error percentages
- **User Engagement**: Daily/monthly active users

#### Growth Targets
- **Month 1**: 100 active companies
- **Month 3**: 500 active companies  
- **Month 6**: 1,000 active companies
- **Year 1**: 5,000 active companies

---

## 🆘 Troubleshooting

### Common Issues

#### Payment Failures
```typescript
// Handle payment errors gracefully
const handlePaymentError = (error: any) => {
  switch (error.code) {
    case 'card_declined':
      return 'Your card was declined. Please try a different payment method.';
    case 'insufficient_funds':
      return 'Insufficient funds. Please check your account balance.';
    case 'invalid_cvc':
      return 'Invalid security code. Please check your card details.';
    default:
      return 'Payment failed. Please try again or contact support.';
  }
};
```

#### Webhook Issues
```bash
# Test webhook locally
stripe listen --forward-to localhost:5001/your_project/us-central1/stripeWebhook

# Check webhook logs in Stripe Dashboard
# Verify webhook endpoint URL
# Check function logs in Firebase Console
```

#### Referral System Issues
```typescript
// Debug referral validation
export const debugReferral = functions.https.onCall(async (data, context) => {
  const { referralCode } = data;
  
  // Check if referral code exists
  const referralDoc = await db.collection('referrals').doc(referralCode).get();
  
  return {
    exists: referralDoc.exists,
    data: referralDoc.data(),
    timestamp: new Date().toISOString()
  };
});
```

---

## 📞 Support & Resources

### Technical Support
- **Firebase Support**: Google Cloud Support Plans
- **Stripe Support**: Stripe Support Center
- **Expo Support**: Expo Forums and Documentation

### Documentation
- **Firebase**: https://firebase.google.com/docs
- **Stripe**: https://stripe.com/docs
- **Expo**: https://docs.expo.dev
- **React Native**: https://reactnative.dev/docs

### Community
- **React Native Community**: https://github.com/react-native-community
- **Firebase Community**: https://firebase.google.com/community
- **Stripe Community**: https://stripe.com/community

---

## ✅ Deployment Checklist

### Pre-Launch
- [ ] Firebase project configured for production
- [ ] Stripe account in live mode with products created
- [ ] Environment variables set correctly
- [ ] Security rules deployed and tested
- [ ] Functions deployed and webhook configured
- [ ] Mobile apps built and submitted to stores
- [ ] Web app deployed with custom domain
- [ ] Analytics and monitoring configured
- [ ] Customer support channels ready

### Post-Launch
- [ ] Monitor initial user signups
- [ ] Track subscription conversions
- [ ] Monitor payment processing
- [ ] Check referral system functionality
- [ ] Gather user feedback
- [ ] Monitor app store reviews
- [ ] Track key business metrics
- [ ] Plan first update iteration

---

## 🎉 Launch Success!

Congratulations! You have successfully deployed the WayGo Freight enterprise freight management platform. This comprehensive system includes:

### ✅ Complete Feature Set
- **Fleet Management** with GPS tracking and telematics
- **Driver Interface** with ELD compliance and navigation
- **Dispatch & Routing** with AI-powered optimization
- **Compliance & Safety** management systems
- **Warehouse & Inventory** tracking
- **Finance & Billing** with automated invoicing
- **Customer Portal** with live tracking
- **Analytics & Reporting** dashboards
- **Admin & Permissions** with RBAC
- **Enterprise Integrations** for TMS/ERP/ELD systems

### ✅ Production-Ready Infrastructure
- **Scalable Backend** with Firebase and Cloud Functions
- **Secure Payment Processing** with Stripe integration
- **Referral System** with one-discount limitation
- **Cross-Platform Apps** for iOS, Android, and Web
- **Enterprise Security** with role-based access control
- **Real-time Monitoring** and analytics

Your enterprise freight management platform is now ready to serve thousands of freight companies and revolutionize their operations!

---

*This deployment guide ensures 100% production readiness for the WayGo Freight platform. For additional support or custom enterprise features, contact the development team.*
