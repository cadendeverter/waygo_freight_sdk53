import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Divider,
  IconButton,
  Surface,
  List,
  ActivityIndicator
} from 'react-native-paper';
import { useTheme } from '../../theme/ThemeContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { 
  Package, 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  Phone, 
  ArrowLeft,
  Navigation,
  MessageCircle,
  FileText,
  Eye
} from '../../utils/icons';

interface ShipmentDetails {
  id: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedPickup: string;
  estimatedDelivery: string;
  weight: string;
  value: string;
  trackingNumber: string;
  driverName?: string | null;
  truckNumber?: string | null;
  driverPhone?: string;
  notes?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
  };
}

// Mock data - in production this would come from API
const mockShipmentDetails: Record<string, ShipmentDetails> = {
  '1': {
    id: '1',
    customerName: 'ABC Manufacturing',
    pickupLocation: 'Dallas, TX',
    deliveryLocation: 'Houston, TX',
    status: 'in_transit',
    estimatedPickup: '2025-06-15T08:00:00Z',
    estimatedDelivery: '2025-06-15T16:00:00Z',
    weight: '12,000 lbs',
    value: '$25,000',
    trackingNumber: 'WG123456789',
    driverName: 'John Smith',
    truckNumber: 'TRK-001',
    driverPhone: '+1 (555) 123-4567',
    notes: 'Handle with care - fragile electronics',
    currentLocation: {
      lat: 29.7604,
      lng: -95.3698,
      address: 'Huntsville, TX - US-45',
      lastUpdated: '2025-06-15T12:30:00Z'
    }
  },
  '2': {
    id: '2',
    customerName: 'XYZ Electronics',
    pickupLocation: 'Austin, TX',
    deliveryLocation: 'San Antonio, TX',
    status: 'pending',
    estimatedPickup: '2025-06-16T10:00:00Z',
    estimatedDelivery: '2025-06-16T15:00:00Z',
    weight: '5,500 lbs',
    value: '$45,000',
    trackingNumber: 'WG987654321',
    driverName: null,
    truckNumber: null,
    notes: 'Appointment required for delivery'
  },
  '3': {
    id: '3',
    customerName: 'Tech Solutions Inc',
    pickupLocation: 'Fort Worth, TX',
    deliveryLocation: 'El Paso, TX',
    status: 'delivered',
    estimatedPickup: '2025-06-14T09:00:00Z',
    estimatedDelivery: '2025-06-14T18:00:00Z',
    weight: '3,200 lbs',
    value: '$8,500',
    trackingNumber: 'WG456123789',
    driverName: 'Sarah Johnson',
    truckNumber: 'TRK-002',
    driverPhone: '+1 (555) 987-6543',
    notes: 'Delivery completed successfully'
  },
  '4': {
    id: '4',
    customerName: 'Global Industries',
    pickupLocation: 'Plano, TX',
    deliveryLocation: 'Lubbock, TX',
    status: 'cancelled',
    estimatedPickup: '2025-06-17T11:00:00Z',
    estimatedDelivery: '2025-06-18T17:00:00Z',
    weight: '8,500 lbs',
    value: '$15,000',
    trackingNumber: 'WG456789123',
    driverName: null,
    truckNumber: null,
    notes: 'Cancelled due to customer request'
  }
};

export default function ShipmentDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const shipmentData = mockShipmentDetails[id];
      setShipment(shipmentData || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'in_transit':
        return '#007AFF';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleCallDriver = () => {
    if (shipment?.driverPhone) {
      Linking.openURL(`tel:${shipment.driverPhone}`);
    }
  };

  const handleViewTracking = () => {
    router.push(`/tracking/${shipment?.trackingNumber}`);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading shipment details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!shipment) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: 'Shipment Not Found',
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: { color: theme.colors.onSurface },
            headerLeft: () => (
              <IconButton
                icon={() => <ArrowLeft size={24} color={theme.colors.onSurface} />}
                onPress={() => router.back()}
              />
            ),
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Package size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
            Shipment Not Found
          </Text>
          <Text variant="bodyMedium" style={{ 
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginBottom: 24
          }}>
            The shipment you're looking for doesn't exist or has been removed.
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Shipment Details',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerLeft: () => (
            <IconButton
              icon={() => <ArrowLeft size={24} color={theme.colors.onSurface} />}
              onPress={() => router.back()}
            />
          ),
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header Card */}
        <Card style={{ margin: 16, marginBottom: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text variant="headlineSmall" style={{ fontWeight: '600', marginBottom: 4 }}>
                  {shipment.customerName}
                </Text>
                <Text variant="bodyLarge" style={{ 
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8 
                }}>
                  {shipment.trackingNumber}
                </Text>
              </View>
              
              <Chip 
                mode="flat"
                style={{ 
                  backgroundColor: getStatusColor(shipment.status) + '20'
                }}
                textStyle={{ 
                  color: getStatusColor(shipment.status),
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                {getStatusText(shipment.status)}
              </Chip>
            </View>

            {/* Location Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ 
                marginLeft: 12, 
                flex: 1
              }}>
                {shipment.pickupLocation} → {shipment.deliveryLocation}
              </Text>
            </View>

            {/* Current Location for In Transit */}
            {shipment.status === 'in_transit' && shipment.currentLocation && (
              <Surface style={{ 
                padding: 12, 
                borderRadius: 8, 
                backgroundColor: 'rgba(70, 130, 180, 0.25)',
                marginBottom: 12
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Navigation size={16} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={{ 
                    marginLeft: 8,
                    color: theme.colors.primary,
                    fontWeight: '500'
                  }}>
                    Current Location: {shipment.currentLocation.address}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ 
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                  marginLeft: 24
                }}>
                  Last updated: {formatDateTime(shipment.currentLocation.lastUpdated)}
                </Text>
              </Surface>
            )}

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button
                mode="contained"
                onPress={handleViewTracking}
                style={{ flex: 1 }}
                icon={() => <Eye size={18} color="#FFFFFF" />}
              >
                Live Tracking
              </Button>
              {shipment.driverPhone && (
                <Button
                  mode="outlined"
                  onPress={handleCallDriver}
                  style={{ flex: 1 }}
                  icon={() => <Phone size={18} color={theme.colors.primary} />}
                >
                  Call Driver
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Timeline Card */}
        <Card style={{ margin: 16, marginVertical: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>
              Schedule
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Clock size={20} color="#4CAF50" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  Pickup
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDateTime(shipment.estimatedPickup)}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={20} color="#F44336" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  Delivery
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDateTime(shipment.estimatedDelivery)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Load Details Card */}
        <Card style={{ margin: 16, marginVertical: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>
              Load Details
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Weight
                </Text>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                  {shipment.weight}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Value
                </Text>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                  {shipment.value}
                </Text>
              </View>
            </View>

            {shipment.notes && (
              <>
                <Divider style={{ marginVertical: 16 }} />
                <Text variant="bodyMedium" style={{ fontWeight: '500', marginBottom: 8 }}>
                  Notes
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {shipment.notes}
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Driver & Vehicle Info */}
        {(shipment.driverName || shipment.truckNumber) && (
          <Card style={{ margin: 16, marginVertical: 8 }}>
            <Card.Content style={{ padding: 20 }}>
              <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>
                Driver & Vehicle
              </Text>

              {shipment.driverName && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <User size={20} color={theme.colors.onSurfaceVariant} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                      {shipment.driverName}
                    </Text>
                    {shipment.driverPhone && (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {shipment.driverPhone}
                      </Text>
                    )}
                  </View>
                  {shipment.driverPhone && (
                    <IconButton
                      icon={() => <Phone size={20} color={theme.colors.primary} />}
                      onPress={handleCallDriver}
                    />
                  )}
                </View>
              )}

              {shipment.truckNumber && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Truck size={20} color={theme.colors.onSurfaceVariant} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                      {shipment.truckNumber}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Vehicle ID
                    </Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Actions Card */}
        <Card style={{ margin: 16, marginTop: 8, marginBottom: 32 }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>
              Actions
            </Text>

            <List.Item
              title="View Documents"
              description="Bills of lading, receipts, and more"
              left={() => <FileText size={24} color={theme.colors.onSurface} />}
              onPress={() => Alert.alert('Documents', 'Document viewer coming soon')}
              style={{ paddingHorizontal: 0 }}
            />
            
            <List.Item
              title="Contact Support"
              description="Get help with this shipment"
              left={() => <MessageCircle size={24} color={theme.colors.onSurface} />}
              onPress={() => Alert.alert('Support', 'Support chat coming soon')}
              style={{ paddingHorizontal: 0 }}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
