import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { Calculator } from '../../../utils/icons';

export default function ExpensesScreen() {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Calculator size={32} color={theme.colors.primary} style={{ marginRight: 12 }} />
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
              Expense Tracking
            </Text>
          </View>

          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Expense Categories
              </Text>
              <Text variant="bodyMedium">
                Track fuel, maintenance, insurance, and other operational expenses.
              </Text>
            </Card.Content>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Expense Reports
              </Text>
              <Text variant="bodyMedium">
                Generate detailed expense reports for tax and accounting purposes.
              </Text>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Budget Management
              </Text>
              <Text variant="bodyMedium">
                Set budgets and track spending against targets.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
