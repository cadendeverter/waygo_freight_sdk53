import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme,
  List,
  Chip,
  Surface,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Clock, 
  Package, 
  CheckCircle,
  AlertCircle,
  Phone,
  Navigation,
  Calendar
} from '../../utils/icons';

const { width } = Dimensions.get('window');

interface TrackingData {
  id: string;
  shipmentNumber: string;
  status: 'picked_up' | 'in_transit' | 'delivered' | 'delayed';
  currentLocation: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  driver: {
    name: string;
    phone: string;
    photo?: string;
  };
  vehicle: {
    type: string;
    plateNumber: string;
  };
  cargo: {
    description: string;
    weight: string;
    pieces: number;
  };
  updates: Array<{
    timestamp: string;
    location: string;
    status: string;
    notes?: string;
  }>;
}

// Mock tracking data
const mockTrackingData: { [key: string]: TrackingData } = {
  'SH001': {
    id: 'SH001',
    shipmentNumber: 'WG-2025-001',
    status: 'in_transit',
    currentLocation: 'Oklahoma City, OK',
    origin: 'Dallas, TX',
    destination: 'Denver, CO',
    estimatedDelivery: '2025-06-20T14:00:00Z',
    driver: {
      name: 'John Smith',
      phone: '+1 (555) 123-4567'
    },
    vehicle: {
      type: 'Freightliner Cascadia',
      plateNumber: 'TX-WG-101'
    },
    cargo: {
      description: 'Electronics Equipment',
      weight: '15,000 lbs',
      pieces: 25
    },
    updates: [
      {
        timestamp: '2025-06-19T08:00:00Z',
        location: 'Dallas, TX',
        status: 'Picked up',
        notes: 'Package picked up from warehouse'
      },
      {
        timestamp: '2025-06-19T12:30:00Z',
        location: 'Fort Worth, TX',
        status: 'In transit',
        notes: 'Passed inspection checkpoint'
      },
      {
        timestamp: '2025-06-19T18:45:00Z',
        location: 'Oklahoma City, OK',
        status: 'In transit',
        notes: 'Rest stop - driver break'
      }
    ]
  }
};

export default function ShipmentTrackingScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
    },
    statusCard: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
    },
    statusText: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    shipmentNumber: {
      fontSize: 16,
      textAlign: 'center',
      opacity: 0.8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    locationText: {
      marginLeft: 12,
      flex: 1,
    },
    updateItem: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      marginBottom: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    updateTime: {
      width: 80,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    updateContent: {
      flex: 1,
      marginLeft: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contactButton: {
      marginTop: 8,
    },
  });

  useEffect(() => {
    loadTrackingData();
  }, [id]);

  const loadTrackingData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = mockTrackingData[id || ''];
      if (data) {
        setTrackingData(data);
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked_up': return '#10B981';
      case 'in_transit': return '#3B82F6';
      case 'delivered': return '#059669';
      case 'delayed': return '#EF4444';
      default: return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'picked_up': return <Package size={24} color="#FFFFFF" />;
      case 'in_transit': return <Truck size={24} color="#FFFFFF" />;
      case 'delivered': return <CheckCircle size={24} color="#FFFFFF" />;
      case 'delayed': return <AlertCircle size={24} color="#FFFFFF" />;
      default: return <Package size={24} color="#FFFFFF" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
          Loading tracking information...
        </Text>
      </View>
    );
  }

  if (!trackingData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button 
            mode="text" 
            onPress={() => router.back()}
            icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
          >
            Back
          </Button>
        </View>
        <View style={styles.loadingContainer}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface, textAlign: 'center' }}>
            Shipment not found
          </Text>
          <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Please check your tracking number
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button 
          mode="text" 
          onPress={() => router.back()}
          icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
          style={{ marginRight: 8 }}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={{ flex: 1, color: theme.colors.onSurface }}>
          Track Shipment
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <Surface 
          style={[
            styles.statusCard, 
            { backgroundColor: getStatusColor(trackingData.status) }
          ]}
        >
          <View style={{ alignItems: 'center' }}>
            {getStatusIcon(trackingData.status)}
            <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
              {formatStatus(trackingData.status)}
            </Text>
            <Text style={[styles.shipmentNumber, { color: '#FFFFFF' }]}>
              {trackingData.shipmentNumber}
            </Text>
          </View>
        </Surface>

        {/* Current Location */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Current Location</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={24} color={theme.colors.primary} />
              <Text style={[styles.locationText, { fontSize: 18, fontWeight: 'bold' }]}>
                {trackingData.currentLocation}
              </Text>
            </View>
            
            <Divider style={{ marginVertical: 16 }} />
            
            <List.Item
              title="Origin"
              description={trackingData.origin}
              left={() => <Navigation size={20} color={theme.colors.onSurfaceVariant} />}
            />
            
            <List.Item
              title="Destination"
              description={trackingData.destination}
              left={() => <MapPin size={20} color={theme.colors.onSurfaceVariant} />}
            />
            
            <List.Item
              title="Estimated Delivery"
              description={formatDate(trackingData.estimatedDelivery)}
              left={() => <Calendar size={20} color={theme.colors.onSurfaceVariant} />}
            />
          </Card.Content>
        </Card>

        {/* Driver & Vehicle Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Driver & Vehicle</Text>
            
            <List.Item
              title="Driver"
              description={trackingData.driver.name}
              left={() => <Truck size={20} color={theme.colors.primary} />}
              right={() => (
                <Button 
                  mode="outlined" 
                  compact
                  onPress={() => {/* Call driver */}}
                  icon={() => <Phone size={16} color={theme.colors.primary} />}
                >
                  Call
                </Button>
              )}
            />
            
            <List.Item
              title="Vehicle"
              description={`${trackingData.vehicle.type} • ${trackingData.vehicle.plateNumber}`}
              left={() => <Truck size={20} color={theme.colors.onSurfaceVariant} />}
            />
          </Card.Content>
        </Card>

        {/* Cargo Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Cargo Information</Text>
            
            <List.Item
              title="Description"
              description={trackingData.cargo.description}
              left={() => <Package size={20} color={theme.colors.onSurfaceVariant} />}
            />
            
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Chip mode="outlined" style={{ marginRight: 8 }}>
                Weight: {trackingData.cargo.weight}
              </Chip>
              <Chip mode="outlined">
                Pieces: {trackingData.cargo.pieces}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Tracking Updates */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Tracking Updates</Text>
            
            {trackingData.updates.map((update, index) => (
              <View key={index} style={styles.updateItem}>
                <View style={styles.updateTime}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                    {formatDate(update.timestamp).split(' ')[3]}
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>
                    {formatDate(update.timestamp).substring(0, 8)}
                  </Text>
                </View>
                
                <View style={styles.updateContent}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {update.status}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
                    {update.location}
                  </Text>
                  {update.notes && (
                    <Text style={{ fontSize: 12, fontStyle: 'italic' }}>
                      {update.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
