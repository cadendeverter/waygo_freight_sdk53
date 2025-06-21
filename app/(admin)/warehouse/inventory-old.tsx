import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { Archive } from '../../../utils/icons';

export default function InventoryTrackingScreen() {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Archive size={32} color={theme.colors.primary} style={{ marginRight: 12 }} />
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
              Inventory Tracking
            </Text>
          </View>

          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Real-time Inventory
              </Text>
              <Text variant="bodyMedium">
                Track inventory levels, locations, and movements in real-time.
              </Text>
            </Card.Content>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Stock Management
              </Text>
              <Text variant="bodyMedium">
                Manage stock levels, reorder points, and automated replenishment.
              </Text>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Barcode Scanning
              </Text>
              <Text variant="bodyMedium">
                Use mobile devices for barcode scanning and inventory updates.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
