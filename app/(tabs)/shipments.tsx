import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, Animated, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../theme/ThemeContext';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { 
  Text, 
  Card, 
  Chip, 
  Searchbar, 
  FAB, 
  IconButton,
  Badge,
  Divider,
  Menu,
  Button,
  Surface
} from 'react-native-paper';
import { 
  Package, 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  Phone, 
  MoreVertical, 
  Filter,
  Plus,
  Trash2,
  Search
} from '../../utils/icons';
import { Swipeable } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Shipment {
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
}

const mockShipments: Shipment[] = [
  {
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
    truckNumber: 'TRK-001'
  },
  {
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
    truckNumber: null
  },
  {
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
    truckNumber: 'TRK-002'
  },
  {
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
    truckNumber: null
  }
];

const styles = StyleSheet.create({
  deleteBox: {
    flex: 1,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  deleteAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shipmentCard: {
    marginBottom: 12,
  },
});

const renderRightAction = (shipmentId: string, dragX: Animated.Value) => {
  const trans = dragX.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [0, 50, 100],
    extrapolate: 'clamp',
  });
  
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.deleteBox}>
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX: trans }] }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={24} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const handleDeleteShipment = (
  shipmentId: string, 
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>, 
  setFilteredShipments: React.Dispatch<React.SetStateAction<Shipment[]>>, 
  searchQuery: string, 
  shipments: Shipment[]
) => {
  Alert.alert(
    'Delete Shipment',
    'Are you sure you want to delete this shipment? This action cannot be undone.',
    [
      { 
        text: 'Cancel', 
        style: 'cancel',
        onPress: () => {
          // Reset any open swipe gestures
          setShipments((prev: Shipment[]) => [...prev]);
        }
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedShipments = shipments.filter((s: Shipment) => s.id !== shipmentId);
          setShipments(updatedShipments);
          setFilteredShipments(updatedShipments.filter((shipment: Shipment) =>
            shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase())
          ));
        },
      },
    ]
  );
};

function ShipmentsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [shipments, setShipments] = useState(mockShipments);
  const [filteredShipments, setFilteredShipments] = useState(mockShipments);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

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

  const renderShipmentItem = ({ item }: { item: Shipment }) => (
    <Swipeable
      key={item.id}
      renderRightActions={(progressAnimatedValue, dragAnimatedValue) =>
        renderRightAction(item.id, dragAnimatedValue as Animated.Value)
      }
      onSwipeableRightOpen={() => handleDeleteShipment(item.id, setShipments, setFilteredShipments, searchQuery, shipments)}
      rightThreshold={80}
    >
      <Card 
        style={[styles.shipmentCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => router.push(`/shipments/${item.id}`)}
      >
        <Card.Content style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
                {item.customerName}
              </Text>
              <Text variant="bodyMedium" style={{ 
                color: theme.colors.onSurfaceVariant,
                marginBottom: 8 
              }}>
                {item.trackingNumber}
              </Text>
            </View>
            
            <Chip 
              mode="flat"
              style={{ 
                backgroundColor: getStatusColor(item.status) + '20'
              }}
              textStyle={{ 
                color: getStatusColor(item.status),
                fontSize: 12,
                fontWeight: '600'
              }}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ 
              marginLeft: 8, 
              flex: 1,
              color: theme.colors.onSurfaceVariant 
            }}>
              {item.pickupLocation} → {item.deliveryLocation}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Clock size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ 
              marginLeft: 8,
              color: theme.colors.onSurfaceVariant 
            }}>
              Pickup: {formatDateTime(item.estimatedPickup)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Clock size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ 
              marginLeft: 8,
              color: theme.colors.onSurfaceVariant 
            }}>
              Delivery: {formatDateTime(item.estimatedDelivery)}
            </Text>
          </View>

          <Divider style={{ marginBottom: 12 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Weight
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {item.weight}
                </Text>
              </View>
              <View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Value
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {item.value}
                </Text>
              </View>
            </View>

            {item.driverName && item.truckNumber && (
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <User size={14} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{ 
                    marginLeft: 4,
                    color: theme.colors.onSurfaceVariant 
                  }}>
                    {item.driverName}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Truck size={14} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{ 
                    marginLeft: 4,
                    color: theme.colors.onSurfaceVariant 
                  }}>
                    {item.truckNumber}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </Swipeable>
  );

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

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Shipments',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon={() => <Filter size={24} color={theme.colors.onSurface} />}
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item title="All Shipments" onPress={() => { setFilterStatus(null); setMenuVisible(false); }} />
                <Menu.Item title="Pending" onPress={() => { setFilterStatus('pending'); setMenuVisible(false); }} />
                <Menu.Item title="In Transit" onPress={() => { setFilterStatus('in_transit'); setMenuVisible(false); }} />
                <Menu.Item title="Delivered" onPress={() => { setFilterStatus('delivered'); setMenuVisible(false); }} />
                <Menu.Item title="Cancelled" onPress={() => { setFilterStatus('cancelled'); setMenuVisible(false); }} />
              </Menu>
            </View>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Search bar */}
        <View style={{ padding: 16, backgroundColor: theme.colors.surface }}>
          <Searchbar
            placeholder="Search shipments..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={{ backgroundColor: theme.colors.background }}
          />
        </View>

        {/* Status summary */}
        <Surface style={{ 
          padding: 16, 
          backgroundColor: theme.colors.surface,
          elevation: 0 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {['pending', 'in_transit', 'delivered'].map((status) => {
              const count = shipments.filter(s => s.status === status).length;
              return (
                <View key={status} style={{ alignItems: 'center' }}>
                  <Text variant="headlineSmall" style={{ 
                    fontWeight: '700',
                    color: getStatusColor(status)
                  }}>
                    {count}
                  </Text>
                  <Text variant="bodySmall" style={{ 
                    color: theme.colors.onSurfaceVariant,
                    textTransform: 'capitalize'
                  }}>
                    {status.replace('_', ' ')}
                  </Text>
                </View>
              );
            })}
          </View>
        </Surface>

        {/* Instructions */}
        <View style={{ 
          padding: 16, 
          backgroundColor: 'rgba(70, 130, 180, 0.12)',
          marginHorizontal: 16,
          marginTop: 8,
          borderRadius: 8
        }}>
          <Text variant="bodySmall" style={{ 
            color: theme.colors.primary,
            textAlign: 'center',
            fontWeight: '500'
          }}>
            Swipe left on any shipment to delete it
          </Text>
        </View>

        {/* Shipments list */}
        <FlatList
          data={filteredShipments}
          renderItem={renderShipmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card>
              <Card.Content style={{ padding: 32, alignItems: 'center' }}>
                <Package size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
                  No shipments found
                </Text>
                <Text variant="bodyMedium" style={{ 
                  color: theme.colors.onSurfaceVariant,
                  textAlign: 'center'
                }}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first shipment'}
                </Text>
              </Card.Content>
            </Card>
          }
        />
      </View>

      {/* Add Shipment FAB */}
      <FAB
        icon={() => <Plus size={24} color="#FFFFFF" />}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => router.push('/loads/create')}
      />
    </ScreenWrapper>
  );
}

export default ShipmentsScreen;
