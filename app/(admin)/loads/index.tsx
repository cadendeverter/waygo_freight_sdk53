import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { Truck, MapPin, DollarSign } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

// Mock data for loads
const mockLoads = [
  {
    id: '1',
    status: 'available',
    pickupLocation: 'Los Angeles, CA',
    deliveryLocation: 'Phoenix, AZ',
    distance: '372 miles',
    rate: '$1,200',
    pickupDate: '2025-06-17',
    deliveryDate: '2025-06-18',
    cargoType: 'Electronics',
    weight: '15,000 lbs'
  },
  {
    id: '2',
    status: 'in_transit',
    pickupLocation: 'Dallas, TX',
    deliveryLocation: 'Houston, TX',
    distance: '240 miles',
    rate: '$800',
    pickupDate: '2025-06-16',
    deliveryDate: '2025-06-17',
    cargoType: 'Food Products',
    weight: '20,000 lbs',
    assignedDriver: 'John Smith'
  }
];

export default function AdminLoadsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loads, setLoads] = useState(mockLoads);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoads(mockLoads);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLoads();
    }, [fetchLoads])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLoads();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.primary;
      case 'in_transit':
        return theme.colors.secondary;
      case 'delivered':
        return theme.colors.onSurface;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const renderLoad = ({ item }: { item: any }) => (
    <Card style={[{ marginHorizontal: 16, marginVertical: 8 }]}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
              Load #{item.id}
            </Text>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getStatusColor(item.status) }}
              style={{ alignSelf: 'flex-start' }}
            >
              {item.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            {item.rate}
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MapPin size={16} color={theme.colors.onSurface} />
            <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
              From: {item.pickupLocation}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MapPin size={16} color={theme.colors.onSurface} />
            <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
              To: {item.deliveryLocation}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Distance: {item.distance} • Weight: {item.weight}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Pickup: {item.pickupDate}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Delivery: {item.deliveryDate}
            </Text>
          </View>
          <Button mode="outlined" onPress={() => router.push(`/(admin)/loads/${item.id}`)}>
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Load Management' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <Heading variant="h1">Load Management</Heading>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Manage and assign freight loads
        </Text>
      </View>

      <FlatList
        data={loads}
        keyExtractor={(item) => item.id}
        renderItem={renderLoad}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}
