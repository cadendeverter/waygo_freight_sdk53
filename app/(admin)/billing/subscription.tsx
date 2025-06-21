// waygo-freight/app/(admin)/billing/subscription.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Linking } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, Surface, 
  ActivityIndicator, List, Divider, Dialog, Portal,
  TextInput, HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe, CardField, useConfirmPayment } from '../../../utils/stripe';

import { 
  CheckCircle, XCircle, Clock, CreditCard, Gift,
  Users, Truck, BarChart, Shield, Zap, Crown
} from '../../../utils/icons';
import { useAuth } from '../../../state/authContext';
import { functions } from '../../../firebase/config';
import { httpsCallable } from 'firebase/functions';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  stripePriceId: string;
  features: string[];
  driverLimit: number;
  loadLimit: number;
}

interface SubscriptionData {
  plan: PricingPlan;
  status: string;
  stripeStatus: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  referralDiscountApplied: boolean;
}

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  totalRewards: number;
  availableCredits: number;
}

interface TaxInfo {
  automaticTaxEnabled: boolean;
  taxBehavior: 'inclusive' | 'exclusive';
  defaultTaxRates: { [key: string]: number };
  stripeTaxRates: Array<{
    id: string;
    displayName: string;
    jurisdiction: string;
    percentage: number;
    inclusive: boolean;
  }>;
}

interface TaxCalculation {
  taxAmount: number;
  totalAmount: number;
  taxBreakdown: Array<{
    jurisdiction: string;
    taxRate: number;
    taxAmount: number;
    taxType: string;
  }>;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'professional',
    name: 'Professional',
    price: 199,
    stripePriceId: 'price_professional',
    features: [
      'Up to 25 drivers',
      'Advanced analytics',
      'Route optimization',
      'ELD integration',
      'Priority support',
      'API access'
    ],
    driverLimit: 25,
    loadLimit: 500
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    stripePriceId: 'price_enterprise',
    features: [
      'Unlimited drivers',
      'Multi-tenant management',
      'White-label options',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    driverLimit: -1,
    loadLimit: -1
  }
];

export default function SubscriptionManagement() {
  const theme = useTheme();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { confirmPayment } = useConfirmPayment();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [planTaxCalculations, setPlanTaxCalculations] = useState<{ [key: string]: TaxCalculation }>({});
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [upgradeInProgress, setUpgradeInProgress] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    loadSubscriptionData();
    loadReferralStats();
    loadTaxInfo();
    calculateTaxForAllPlans();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const getSubscription = httpsCallable(functions, 'getSubscription');
      const result = await getSubscription();
      setSubscription(result.data as SubscriptionData);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferralStats = async () => {
    try {
      const getReferralStats = httpsCallable(functions, 'getReferralStats');
      const result = await getReferralStats();
      setReferralStats(result.data as ReferralStats);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  const loadTaxInfo = async () => {
    try {
      const getTaxInfo = httpsCallable(functions, 'getTaxInfo');
      const result = await getTaxInfo();
      setTaxInfo(result.data as TaxInfo);
    } catch (error) {
      console.error('Error loading tax info:', error);
    }
  };

  const calculateTaxForPlan = async (planPrice: number) => {
    try {
      const calculateTax = httpsCallable(functions, 'calculateTax');
      const result = await calculateTax({ 
        amount: planPrice * 100, // Convert to cents for Stripe
        location: { 
          country: 'US', 
          state: 'TX' // Default location, could be dynamic based on user
        }
      });
      
      const data = result.data as any;
      return {
        taxAmount: data.taxAmount / 100, // Convert from cents to dollars
        totalAmount: data.totalAmount / 100, // Convert from cents to dollars
        taxBreakdown: data.taxBreakdown
      };
    } catch (error) {
      console.error('Error calculating tax for plan:', error);
      // Fallback to no tax if calculation fails
      return {
        taxAmount: 0,
        totalAmount: planPrice,
        taxBreakdown: []
      };
    }
  };

  const calculateTaxForAllPlans = async () => {
    const taxCalculations: { [key: string]: TaxCalculation } = {};
    for (const plan of PRICING_PLANS) {
      const taxCalculation = await calculateTaxForPlan(plan.price);
      if (taxCalculation) {
        taxCalculations[plan.id] = taxCalculation;
      }
    }
    setPlanTaxCalculations(taxCalculations);
  };

  const formatCurrency = (amountInCents: number): string => {
    return `$${(amountInCents / 100).toFixed(2)}`;
  };

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  const processSubscription = async () => {
    if (!selectedPlan) return;

    setUpgradeInProgress(true);
    try {
      const createSubscription = httpsCallable(functions, 'createSubscription');
      const result = await createSubscription({
        planId: selectedPlan,
        referralCode: referralCode || undefined
      });

      const { clientSecret, status } = result.data as any;

      if (status === 'requires_payment_method' || status === 'requires_confirmation') {
        const { error } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card'
        });

        if (error) {
          Alert.alert('Payment Error', error.message);
        } else {
          Alert.alert('Success', 'Subscription created successfully!');
          setShowUpgradeDialog(false);
          loadSubscriptionData();
        }
      } else if (status === 'active') {
        Alert.alert('Success', 'Subscription activated!');
        setShowUpgradeDialog(false);
        loadSubscriptionData();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpgradeInProgress(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
              await cancelSubscription({ immediately: false });
              Alert.alert('Success', 'Subscription will be canceled at the end of your billing period.');
              loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const shareReferralCode = () => {
    if (referralStats?.referralCode) {
      const message = `Join WayGo Freight with my referral code ${referralStats.referralCode} and get 20% off your first month! https://waygofreight.com/signup?ref=${referralStats.referralCode}`;
      
      // On mobile, you can use share functionality
      // For now, we'll copy to clipboard or show share dialog
      setShowReferralDialog(true);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'professional': return BarChart;
      case 'enterprise': return Crown;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'canceled': return '#f44336';
      case 'past_due': return '#FF9800';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading subscription details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ elevation: 1, padding: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Subscription & Billing</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage your subscription and referral rewards
        </Text>
      </Surface>

      <ScrollView style={{ flex: 1 }}>
        {/* Current Subscription */}
        {subscription && (
          <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>Current Plan</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ 
                backgroundColor: 'rgba(70, 130, 180, 0.12)', 
                padding: 12, 
                borderRadius: 8, 
                marginRight: 12 
              }}>
                {React.createElement(getPlanIcon(subscription.plan.id), { 
                  size: 24, 
                  color: theme.colors.primary 
                })}
              </View>
              
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{subscription.plan.name}</Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  ${subscription.plan.price}/month
                </Text>
              </View>
              
              <Chip 
                style={{ backgroundColor: getStatusColor(subscription.stripeStatus) + '20' }}
                textStyle={{ color: getStatusColor(subscription.stripeStatus) }}
              >
                {subscription.stripeStatus.toUpperCase()}
              </Chip>
            </View>

            <View style={{ marginVertical: 8 }}>
              {subscription.plan.features.map((feature, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text variant="bodyMedium" style={{ marginLeft: 8 }}>{feature}</Text>
                </View>
              ))}
            </View>

            <Divider style={{ marginVertical: 16 }} />

            <List.Item
              title="Next billing date"
              description={new Date(subscription.nextBillingDate).toLocaleDateString()}
              left={() => <Clock size={20} color={theme.colors.onSurfaceVariant} />}
            />

            {subscription.referralDiscountApplied && (
              <List.Item
                title="Referral discount applied"
                description="20% off first month"
                left={() => <Gift size={20} color="#4CAF50" />}
                titleStyle={{ color: '#4CAF50' }}
              />
            )}

            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button 
                mode="outlined" 
                onPress={handleCancelSubscription}
                style={{ flex: 1, marginRight: 8 }}
                disabled={subscription.cancelAtPeriodEnd}
              >
                {subscription.cancelAtPeriodEnd ? 'Canceling...' : 'Cancel Plan'}
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => {/* Open billing portal */}}
                style={{ flex: 1, marginLeft: 8 }}
              >
                Manage Billing
              </Button>
            </View>
          </Surface>
        )}

        {/* Pricing Plans */}
        {!subscription && (
          <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>Choose Your Plan</Text>
            
            {PRICING_PLANS.map(plan => {
              const PlanIcon = getPlanIcon(plan.id);
              const taxCalculation = planTaxCalculations[plan.id];

              return (
                <Card key={plan.id} style={{ marginBottom: 12 }}>
                  <Card.Content style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ 
                        backgroundColor: 'rgba(70, 130, 180, 0.12)', 
                        padding: 12, 
                        borderRadius: 8, 
                        marginRight: 12 
                      }}>
                        <PlanIcon size={24} color={theme.colors.primary} />
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{plan.name}</Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                          ${plan.price}/month
                        </Text>
                      </View>
                      
                      {plan.id === 'professional' && (
                        <Chip style={{ backgroundColor: '#4CAF50' }} textStyle={{ color: 'white' }}>
                          POPULAR
                        </Chip>
                      )}
                    </View>

                    <View style={{ marginBottom: 16 }}>
                      {plan.features.map((feature, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <CheckCircle size={16} color="#4CAF50" />
                          <Text variant="bodyMedium" style={{ marginLeft: 8 }}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                      Tax: {formatCurrency(taxCalculation?.taxAmount || 0)}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                      Total: {formatCurrency(taxCalculation?.totalAmount || 0)}
                    </Text>

                    <Button 
                      mode="contained" 
                      onPress={() => handleUpgrade(plan.id)}
                      style={{ width: '100%' }}
                    >
                      Choose {plan.name}
                    </Button>
                  </Card.Content>
                </Card>
              );
            })}
          </Surface>
        )}

        {/* Referral Program */}
        {referralStats && (
          <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>Referral Program</Text>
            
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Card style={{ flex: 1, marginRight: 8 }}>
                <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                  <Gift size={32} color={theme.colors.primary} />
                  <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                    {referralStats.totalReferrals}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Total Referrals
                  </Text>
                </Card.Content>
              </Card>
              
              <Card style={{ flex: 1, marginLeft: 8 }}>
                <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                  <CreditCard size={32} color="#4CAF50" />
                  <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8, color: '#4CAF50' }}>
                    ${referralStats.availableCredits}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Available Credits
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {referralStats.referralCode && (
              <View style={{ 
                backgroundColor: 'rgba(70, 130, 180, 0.12)',
                padding: 16,
                borderRadius: 8,
                marginBottom: 16
              }}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  Your Referral Code
                </Text>
                <Text variant="headlineMedium" style={{ 
                  fontWeight: 'bold', 
                  fontFamily: 'monospace',
                  color: theme.colors.primary
                }}>
                  {referralStats.referralCode}
                </Text>
              </View>
            )}

            <View style={{ 
              backgroundColor: '#E3F2FD',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16
            }}>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                How it works:
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 4 }}>
                • Share your referral code with other freight companies
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 4 }}>
                • They get 20% off their first month (one-time discount)
              </Text>
              <Text variant="bodyMedium">
                • You earn $50 credit for each successful referral
              </Text>
            </View>

            <Button 
              mode="contained" 
              onPress={shareReferralCode}
              icon="share"
              style={{ width: '100%' }}
            >
              Share Referral Code
            </Button>
          </Surface>
        )}
      </ScrollView>

      {/* Upgrade Dialog */}
      <Portal>
        <Dialog visible={showUpgradeDialog} onDismiss={() => setShowUpgradeDialog(false)}>
          <Dialog.Title>Subscribe to {selectedPlan && PRICING_PLANS.find(p => p.id === selectedPlan)?.name}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Referral Code (Optional)"
              value={referralCode}
              onChangeText={setReferralCode}
              mode="outlined"
              style={{ marginBottom: 16 }}
              placeholder="Enter referral code for 20% off"
            />
            <HelperText type="info">
              Enter a referral code to get 20% off your first month
            </HelperText>
            
            <View style={{ marginVertical: 16 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Payment Method</Text>
              <CardField
                postalCodeEnabled={true}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#000000',
                }}
                style={{
                  width: '100%',
                  height: 50,
                  marginVertical: 8,
                }}
                onCardChange={(cardDetails) => {
                  // setCardComplete(cardDetails.complete);
                }}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowUpgradeDialog(false)}>Cancel</Button>
            <Button 
              onPress={processSubscription}
              disabled={upgradeInProgress}
              loading={upgradeInProgress}
            >
              Subscribe
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Referral Share Dialog */}
      <Portal>
        <Dialog visible={showReferralDialog} onDismiss={() => setShowReferralDialog(false)}>
          <Dialog.Title>Share Your Referral Code</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Share this message with other freight companies:
            </Text>
            <Surface style={{ padding: 16, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant }}>
              <Text variant="bodyMedium">
                Join WayGo Freight with my referral code {referralStats?.referralCode} and get 20% off your first month! 
                https://waygofreight.com/signup?ref={referralStats?.referralCode}
              </Text>
            </Surface>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowReferralDialog(false)}>Close</Button>
            <Button onPress={() => {
              // Copy to clipboard or share
              setShowReferralDialog(false);
            }}>
              Copy Link
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
