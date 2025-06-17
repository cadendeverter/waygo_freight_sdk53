import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../theme/ThemeContext';
import Heading from '../../components/typography/Heading';
import { Text, Card, Button, Chip, Searchbar } from 'react-native-paper';
import { Truck, MapPin, Clock, Package } from '../../utils/icons';
import LoadingSpinner from '../../components/LoadingSpinner';

// Mock data for shipments
const mockShipments = [
  {
    id: 'SH001',
    status: 'in_transit',
    customerName: 'ABC Manufacturing',
    pickupLocation: 'Los Angeles, CA',
    deliveryLocation: 'Phoenix, AZ',
    pickupDate: '2025-06-16T08:00:00Z',
    estimatedDelivery: '2025-06-17T14:00:00Z',
    weight: '15,000 lbs',
    value: '$25,000',
    trackingNumber: 'WG123456789',
    driverName: 'John Smith',
    truckNumber: 'T-001'
  },
  {
    id: 'SH002',
    status: 'delivered',
    customerName: 'XYZ Corp',
    pickupLocation: 'Dallas, TX',
    deliveryLocation: 'Houston, TX',
    pickupDate: '2025-06-15T10:00:00Z',
    estimatedDelivery: '2025-06-16T16:00:00Z',
    actualDelivery: '2025-06-16T15:30:00Z',
    weight: '20,000 lbs',
    value: '$40,000',
    trackingNumber: 'WG987654321',
    driverName: 'Sarah Johnson',
    truckNumber: 'T-002'
  },
  {
    id: 'SH003',
    status: 'pending',
    customerName: 'Tech Solutions Inc',
    pickupLocation: 'Seattle, WA',
    deliveryLocation: 'Portland, OR',
    pickupDate: '2025-06-18T09:00:00Z',
    estimatedDelivery: '2025-06-18T17:00:00Z',
    weight: '8,500 lbs',
    value: '$15,000',
    trackingNumber: 'WG456789123',
    driverName: null,
    truckNumber: null
  }
];

function ShipmentsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [shipments, setShipments] = useState(mockShipments);
  const [filteredShipments, setFilteredShipments] = useState(mockShipments);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShipments(mockShipments);
    setFilteredShipments(mockShipments);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShipments();
    }, [fetchShipments])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchShipments();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredShipments(shipments);
    } else {
      const filtered = shipments.filter(shipment =>
        shipment.customerName.toLowerCase().includes(query.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(query.toLowerCase()) ||
        shipment.pickupLocation.toLowerCase().includes(query.toLowerCase()) ||
        shipment.deliveryLocation.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredShipments(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.primary;
      case 'in_transit':
        return '#FF9500';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderShipment = ({ item }: { item: any }) => (
    <Card style={[{ marginHorizontal: 16, marginVertical: 8 }]}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {item.customerName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.trackingNumber}
            </Text>
          </View>
          <Chip 
            mode="outlined" 
            textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
            style={{ alignSelf: 'flex-start' }}
          >
            {item.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MapPin size={16} color={theme.colors.onSurface} />
            <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
              From: {item.pickupLocation}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color={theme.colors.onSurface} />
            <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
              To: {item.deliveryLocation}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Clock size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
              Pickup: {formatDate(item.pickupDate)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Clock size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
              Delivery: {formatDate(item.estimatedDelivery)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Package size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
              Weight: {item.weight} • Value: {item.value}
            </Text>
          </View>

          {item.driverName && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Truck size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                Driver: {item.driverName} • Truck: {item.truckNumber}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button 
            mode="outlined" 
            onPress={() => router.push(`/shipments/${item.id}`)}
            style={{ marginRight: 8 }}
          >
            Track
          </Button>
          <Button mode="contained" onPress={() => router.push(`/shipments/${item.id}/details`)}>
            Details
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
      <Stack.Screen options={{ title: 'Shipments' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <Heading variant="h1">Shipments</Heading>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, marginBottom: 16 }}>
          Track and manage freight shipments
        </Text>
        
        <Searchbar
          placeholder="Search shipments..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        />
      </View>

      <FlatList
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        renderItem={renderShipment}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Package size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
              No shipments found
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              {searchQuery ? 'Try adjusting your search' : 'Your shipments will appear here'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

export default ShipmentsScreen;
