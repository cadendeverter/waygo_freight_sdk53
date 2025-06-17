// waygo-freight/app/(dispatcher)/loads/index.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Dimensions, RefreshControl, FlatList } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, Searchbar, FAB, SegmentedButtons } from 'react-native-paper';
import { MapPin, Package, Truck, Clock, DollarSign, Calendar, User, Phone, Navigation, Plus } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ConditionalMapView, ConditionalMarker, ConditionalPolyline } from '../../../components/MapView';

const { width } = Dimensions.get('window');

// Mock loads data
const mockLoads = [
  {
    id: 'LOAD001',
    loadNumber: 'WGF-2024-001',
    status: 'AVAILABLE',
    customer: 'Amazon Logistics',
    customerContact: '+1 (555) 123-4567',
    pickup: {
      location: 'Dallas Distribution Center',
      address: '1234 Commerce St, Dallas, TX 75201',
      coordinates: { latitude: 32.7767, longitude: -96.7970 },
      date: '2024-06-17T08:00:00Z',
      appointmentType: 'FCFS'
    },
    delivery: {
      location: 'Houston Warehouse',
      address: '5678 Industrial Blvd, Houston, TX 77002',
      coordinates: { latitude: 29.7604, longitude: -95.3698 },
      date: '2024-06-17T16:00:00Z',
      appointmentType: 'SCHEDULED'
    },
    cargo: {
      type: 'Electronics',
      weight: 12500,
      dimensions: '48x40x36',
      hazmat: false,
      temperature: 'DRY'
    },
    rate: 850,
    miles: 240,
    ratePerMile: 3.54,
    requirements: ['CDL-A', 'Clean MVR', '2+ Years Exp'],
    assignedDriver: null,
    createdAt: '2024-06-16T10:30:00Z',
    notes: 'Fragile items - handle with care'
  },
  {
    id: 'LOAD002',
    loadNumber: 'WGF-2024-002',
    status: 'ASSIGNED',
    customer: 'Home Depot',
    customerContact: '+1 (555) 987-6543',
    pickup: {
      location: 'Fort Worth Distribution',
      address: '9012 Warehouse Ave, Fort Worth, TX 76102',
      coordinates: { latitude: 32.7555, longitude: -97.3308 },
      date: '2024-06-17T10:00:00Z',
      appointmentType: 'SCHEDULED'
    },
    delivery: {
      location: 'Austin Store #1247',
      address: '3456 South Lamar, Austin, TX 78704',
      coordinates: { latitude: 30.2672, longitude: -97.7431 },
      date: '2024-06-17T18:00:00Z',
      appointmentType: 'SCHEDULED'
    },
    cargo: {
      type: 'Building Materials',
      weight: 18750,
      dimensions: '48x48x48',
      hazmat: false,
      temperature: 'DRY'
    },
    rate: 720,
    miles: 185,
    ratePerMile: 3.89,
    requirements: ['CDL-A', 'Flatbed Exp'],
    assignedDriver: {
      id: 'DRV001',
      name: 'John Smith',
      phone: '+1 (555) 555-0123',
      currentLocation: { latitude: 32.7555, longitude: -97.3308 }
    },
    createdAt: '2024-06-16T14:20:00Z',
    notes: 'Customer requires appointment confirmation'
  },
  {
    id: 'LOAD003',
    loadNumber: 'WGF-2024-003',
    status: 'IN_TRANSIT',
    customer: 'Walmart Distribution',
    customerContact: '+1 (555) 246-8135',
    pickup: {
      location: 'San Antonio DC',
      address: '7890 Distribution Dr, San Antonio, TX 78201',
      coordinates: { latitude: 29.4241, longitude: -98.4936 },
      date: '2024-06-16T06:00:00Z',
      appointmentType: 'SCHEDULED'
    },
    delivery: {
      location: 'El Paso Store #4821',
      address: '1357 Mesa Blvd, El Paso, TX 79902',
      coordinates: { latitude: 31.7619, longitude: -106.4850 },
      date: '2024-06-17T14:00:00Z',
      appointmentType: 'SCHEDULED'
    },
    cargo: {
      type: 'General Merchandise',
      weight: 15200,
      dimensions: '53x8.5x9',
      hazmat: false,
      temperature: 'DRY'
    },
    rate: 1250,
    miles: 550,
    ratePerMile: 2.27,
    requirements: ['CDL-A', 'Dry Van'],
    assignedDriver: {
      id: 'DRV003',
      name: 'Mike Chen',
      phone: '+1 (555) 555-0789',
      currentLocation: { latitude: 30.5, longitude: -101.0 }
    },
    createdAt: '2024-06-15T16:45:00Z',
    notes: 'High priority delivery'
  }
];

function DispatcherLoadsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loads, setLoads] = useState(mockLoads);
  const [filteredLoads, setFilteredLoads] = useState(mockLoads);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showMap, setShowMap] = useState(false);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoads(mockLoads);
    setFilteredLoads(mockLoads);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterLoads(query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterLoads(searchQuery, status);
  };

  const filterLoads = (query: string, status: string) => {
    let filtered = loads;
    
    if (status !== 'ALL') {
      filtered = filtered.filter(load => load.status === status);
    }
    
    if (query) {
      filtered = filtered.filter(load => 
        load.loadNumber.toLowerCase().includes(query.toLowerCase()) ||
        load.customer.toLowerCase().includes(query.toLowerCase()) ||
        load.pickup.location.toLowerCase().includes(query.toLowerCase()) ||
        load.delivery.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredLoads(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#34C759';
      case 'ASSIGNED':
        return '#FF9500';
      case 'IN_TRANSIT':
        return theme.colors.primary;
      case 'DELIVERED':
        return '#007AFF';
      case 'CANCELLED':
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

  const renderMapView = () => {
    if (!showMap) return null;
    
    return (
      <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ padding: 0 }}>
          <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
            <ConditionalMapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 31.0,
                longitude: -97.0,
                latitudeDelta: 8.0,
                longitudeDelta: 8.0,
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {filteredLoads.map((load) => (
                <React.Fragment key={load.id}>
                  {/* Pickup marker */}
                  <ConditionalMarker
                    coordinate={load.pickup.coordinates}
                    title={`Pickup: ${load.pickup.location}`}
                    description={load.customer}
                    pinColor="#34C759"
                  />
                  {/* Delivery marker */}
                  <ConditionalMarker
                    coordinate={load.delivery.coordinates}
                    title={`Delivery: ${load.delivery.location}`}
                    description={load.customer}
                    pinColor="#FF3B30"
                  />
                  {/* Route line */}
                  <ConditionalPolyline
                    coordinates={[
                      { latitude: load.pickup.coordinates.latitude, longitude: load.pickup.coordinates.longitude },
                      { latitude: load.delivery.coordinates.latitude, longitude: load.delivery.coordinates.longitude },
                    ]}
                    strokeColor={getStatusColor(load.status)}
                    strokeWidth={3}
                  />
                  {/* Driver location if assigned and in transit */}
                  {load.assignedDriver && load.status === 'IN_TRANSIT' && (
                    <ConditionalMarker
                      coordinate={load.assignedDriver.currentLocation}
                      title={`Driver: ${load.assignedDriver.name}`}
                      description={`Load: ${load.loadNumber}`}
                      pinColor={theme.colors.primary}
                    />
                  )}
                </React.Fragment>
              ))}
            </ConditionalMapView>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderLoad = ({ item }: { item: any }) => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
              {item.loadNumber}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.customer}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
              style={{ 
                borderColor: getStatusColor(item.status),
                marginBottom: 4
              }}
            >
              {item.status.replace('_', ' ')}
            </Chip>
            <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
              ${item.rate.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color="#34C759" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                Pickup: {item.pickup.location}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatDate(item.pickup.date)} • {item.pickup.appointmentType}
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={16} color="#FF3B30" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                Delivery: {item.delivery.location}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatDate(item.delivery.date)} • {item.delivery.appointmentType}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Package size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              {item.cargo.weight.toLocaleString()} lbs • {item.cargo.type}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Navigation size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              {item.miles} mi • ${item.ratePerMile}/mi
            </Text>
          </View>
        </View>

        {item.assignedDriver && (
          <View style={{ backgroundColor: theme.colors.surfaceVariant, padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <User size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ marginLeft: 8, fontWeight: '600' }}>
                  {item.assignedDriver.name}
                </Text>
              </View>
              <Button 
                mode="outlined" 
                compact
                onPress={() => {/* Call driver */}}
                icon={() => <Phone size={16} color={theme.colors.primary} />}
              >
                Call
              </Button>
            </View>
          </View>
        )}

        {item.notes && (
          <View style={{ backgroundColor: theme.colors.surfaceVariant, padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Notes: {item.notes}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {item.status === 'AVAILABLE' && (
            <Button 
              mode="contained" 
              compact
              onPress={() => router.push(`/dispatcher/loads/${item.id}/assign`)}
              style={{ flex: 1 }}
            >
              Assign Driver
            </Button>
          )}
          <Button 
            mode="outlined" 
            compact
            onPress={() => router.push(`/dispatcher/loads/${item.id}/details`)}
            style={{ flex: 1 }}
          >
            View Details
          </Button>
          <Button 
            mode="outlined" 
            compact
            onPress={() => router.push(`/dispatcher/loads/${item.id}/edit`)}
            style={{ flex: 1 }}
          >
            Edit
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
      <Stack.Screen options={{ title: 'Loads' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Heading variant="h1">Loads</Heading>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Manage and dispatch freight loads
            </Text>
          </View>
          <Button 
            mode="outlined" 
            onPress={() => setShowMap(!showMap)}
            icon={() => <MapPin size={16} color={theme.colors.primary} />}
            compact
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </View>
        
        <Searchbar
          placeholder="Search loads..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ backgroundColor: theme.colors.surfaceVariant, marginBottom: 12 }}
        />

        <SegmentedButtons
          value={statusFilter}
          onValueChange={handleStatusFilter}
          buttons={[
            { value: 'ALL', label: 'All' },
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'ASSIGNED', label: 'Assigned' },
            { value: 'IN_TRANSIT', label: 'In Transit' }
          ]}
        />
      </View>

      <FlatList
        data={filteredLoads}
        renderItem={({ item }: { item: any }) => (
          renderLoad({ item })
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={renderMapView()}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Package size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
              No loads found
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              {searchQuery ? 'Try adjusting your search' : 'No loads match the current filters'}
            </Text>
          </View>
        }
      />

      <FAB
        icon={() => <Plus size={24} color="white" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => router.push('/dispatcher/loads/create')}
      />
    </ScreenWrapper>
  );
}

export default DispatcherLoadsScreen;
