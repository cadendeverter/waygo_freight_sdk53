import React from 'react';
import { Platform } from 'react-native';
import { View, Text } from 'react-native';

// Platform-specific Stripe imports and fallbacks
let StripeProvider: any = React.Fragment;
let useStripe: any = () => ({ presentPaymentSheet: () => {}, createPaymentMethod: () => {} });
let CardField: any = ({ style, ...props }: any) => (
  <View style={[{ height: 50, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, style]} {...props}>
    <Text>Card input not available on web</Text>
  </View>
);
let CardForm: any = ({ style, ...props }: any) => (
  <View style={[{ height: 100, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, style]} {...props}>
    <Text>Card form not available on web</Text>
  </View>
);
let useConfirmPayment: any = () => ({ confirmPayment: () => {} });
let useConfirmSetupIntent: any = () => ({ confirmSetupIntent: () => {} });
let usePaymentSheet: any = () => ({ 
  initPaymentSheet: () => {}, 
  presentPaymentSheet: () => {}, 
  confirmPaymentSheetPayment: () => {} 
});

if (Platform.OS !== 'web') {
  try {
    const stripe = require('@stripe/stripe-react-native');
    StripeProvider = stripe.StripeProvider;
    useStripe = stripe.useStripe;
    CardField = stripe.CardField;
    CardForm = stripe.CardForm;
    useConfirmPayment = stripe.useConfirmPayment;
    useConfirmSetupIntent = stripe.useConfirmSetupIntent;
    usePaymentSheet = stripe.usePaymentSheet;
  } catch (error) {
    console.warn('Stripe React Native not available');
  }
}

export { 
  StripeProvider, 
  useStripe, 
  CardField, 
  CardForm, 
  useConfirmPayment, 
  useConfirmSetupIntent, 
  usePaymentSheet 
};
