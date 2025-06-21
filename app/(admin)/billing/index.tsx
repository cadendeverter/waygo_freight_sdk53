import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { Stack, router } from 'expo-router';
import { DollarSign, FileText, BarChart, Calculator } from '../../../utils/icons';

export default function BillingScreen() {
  const theme = useTheme();

  const billingFeatures = [
    {
      id: 'automated-billing',
      title: 'Automated Billing',
      description: 'Set up automated billing and invoice generation',
      icon: DollarSign,
      route: '/(admin)/finance/automated-billing'
    },
    {
      id: 'invoices',
      title: 'Invoices & Statements',
      description: 'View and manage customer invoices',
      icon: FileText,
      route: '/(admin)/billing/invoices'
    },
    {
      id: 'reports',
      title: 'Billing Reports',
      description: 'Financial reports and billing analytics',
      icon: BarChart,
      route: '/(admin)/finance/reports'
    },
    {
      id: 'expenses',
      title: 'Expense Management',
      description: 'Track business expenses and costs',
      icon: Calculator,
      route: '/(admin)/finance/expense-tracking'
    }
  ];

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Billing & Invoices' }} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text variant="headlineMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
          Billing & Invoices
        </Text>
        
        <Text variant="bodyLarge" style={{ marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
          Manage billing, invoices, and financial operations for your freight business.
        </Text>

        {billingFeatures.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card key={feature.id} style={{ marginBottom: 16 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ 
                    backgroundColor: theme.colors.primaryContainer, 
                    padding: 12, 
                    borderRadius: 8,
                    marginRight: 16
                  }}>
                    <IconComponent size={24} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {feature.title}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  onPress={() => router.push(feature.route)}
                  style={{ marginTop: 8 }}
                >
                  Open {feature.title}
                </Button>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}
