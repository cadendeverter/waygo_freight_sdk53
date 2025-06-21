import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Card, 
  Text, 
  Chip, 
  FAB, 
  Portal, 
  Modal, 
  List, 
  Switch,
  useTheme,
  Button,
  Divider,
  Searchbar
} from 'react-native-paper';
import MapView, { 
  Marker, 
  PROVIDER_GOOGLE, 
  PROVIDER_DEFAULT,
  Callout,
  Region,
  Polyline
} from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../state/authContext';
import { useLoad } from '../../state/loadContext';
import { useFleet } from '../../state/fleetContext';
import { Truck, MapPin, User, Package, Navigation, Settings } from '../../utils/icons';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface DriverLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'driving' | 'available' | 'break' | 'offline';
  lastUpdate: Date;
  currentLoadId?: string;
  vehicleNumber?: string;
}

interface FreightLocation {
  id: string;
  loadNumber: string;
  status: 'pending' | 'in-transit' | 'delivered';
  origin: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  driverId?: string;
  estimatedDelivery?: Date;
}

export default function MapScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { loads } = useLoad();
  const { vehicles, drivers } = useFleet();
  
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 31.7619, // Texas center
    longitude: -106.4850,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showDrivers, setShowDrivers] = useState(true);
  const [showFreight, setShowFreight] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [mapProvider, setMapProvider] = useState<typeof PROVIDER_GOOGLE | typeof PROVIDER_DEFAULT>(
    Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE
  );
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showProviderSelection, setShowProviderSelection] = useState(false);

  // Mock driver locations - in production, these would come from real-time Firebase
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([
    {
      id: 'driver1',
      name: 'John Smith',
      latitude: 32.7767,
      longitude: -96.7970, // Dallas
      status: 'driving',
      lastUpdate: new Date(),
      currentLoadId: 'load1',
      vehicleNumber: 'ABC123'
    },
    {
      id: 'driver2', 
      name: 'Maria Garcia',
      latitude: 29.7604,
      longitude: -95.3698, // Houston  
      status: 'available',
      lastUpdate: new Date(),
      vehicleNumber: 'DEF456'
    },
    {
      id: 'driver3',
      name: 'Robert Johnson', 
      latitude: 30.2672,
      longitude: -97.7431, // Austin
      status: 'break',
      lastUpdate: new Date(),
      currentLoadId: 'load2',
      vehicleNumber: 'GHI789'
    }
  ]);

  // Convert loads to freight locations
  const freightLocations: FreightLocation[] = loads.map(load => ({
    id: load.id,
    loadNumber: load.loadNumber,
    status: load.status as 'pending' | 'in-transit' | 'delivered',
    origin: {
      latitude: load.origin?.facility?.address?.latitude || 32.7767,
      longitude: load.origin?.facility?.address?.longitude || -96.7970,
      address: `${load.origin?.facility?.address?.city}, ${load.origin?.facility?.address?.state}` || 'Dallas, TX'
    },
    destination: {
      latitude: load.destination?.facility?.address?.latitude || 29.7604,
      longitude: load.destination?.facility?.address?.longitude || -95.3698,
      address: `${load.destination?.facility?.address?.city}, ${load.destination?.facility?.address?.state}` || 'Houston, TX'
    },
    driverId: load.driverId,
    estimatedDelivery: load.deliveryDate
  }));

  useEffect(() => {
    getCurrentLocation();
    // Set up real-time location updates
    const locationInterval = setInterval(() => {
      updateDriverLocations();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenMapProvider = await AsyncStorage.getItem('hasSeenMapProvider')
        if (!hasSeenMapProvider) {
          setShowProviderSelection(true)
          setIsFirstTime(true)
        }
      } catch (error) {
        console.error('Error checking first time status:', error)
      }
    }
    
    checkFirstTime()
  }, [])

  const handleProviderSelection = async (provider: typeof PROVIDER_GOOGLE | typeof PROVIDER_DEFAULT) => {
    try {
      setMapProvider(provider)
      await AsyncStorage.setItem('hasSeenMapProvider', 'true')
      await AsyncStorage.setItem('mapProvider', String(provider))
      setShowProviderSelection(false)
    } catch (error) {
      console.error('Error saving provider selection:', error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0922 * ASPECT_RATIO,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const updateDriverLocations = async () => {
    // In production, this would call your Firebase function to get real-time driver locations
    // For now, we'll simulate some movement
    setDriverLocations(prev => prev.map(driver => ({
      ...driver,
      latitude: driver.latitude + (Math.random() - 0.5) * 0.001,
      longitude: driver.longitude + (Math.random() - 0.5) * 0.001,
      lastUpdate: new Date()
    })));
  };

  const centerOnLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const centerOnUser = () => {
    if (userLocation) {
      centerOnLocation(userLocation.coords.latitude, userLocation.coords.longitude);
    }
  };

  const getDriverMarkerColor = (status: string) => {
    switch (status) {
      case 'driving': return '#4CAF50'; // Green
      case 'available': return '#2196F3'; // Blue  
      case 'break': return '#FF9800'; // Orange
      case 'offline': return '#9E9E9E'; // Gray
      default: return '#2196F3';
    }
  };

  const getFreightMarkerColor = (status: string) => {
    switch (status) {
      case 'pending': return '#007AFF'
      case 'in-transit': return '#FF9500'
      case 'delivered': return '#34C759'
      default: return '#8E8E93'
    }
  }

  // Generate consistent colors for up to 1000 carriers/drivers
  const generateDriverColor = (driverId: string): string => {
    let hash = 0
    for (let i = 0; i < driverId.length; i++) {
      hash = driverId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Generate HSL color with good saturation and lightness for visibility
    const hue = Math.abs(hash % 360)
    const saturation = 65 + (Math.abs(hash) % 25) // 65-90%
    const lightness = 45 + (Math.abs(hash) % 20)  // 45-65%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Get assigned load for a driver and create route
  const getDriverRoute = (driverId: string) => {
    const assignedLoad = loads.find(load => load.driverId === driverId)
    const driver = driverLocations.find(d => d.id === driverId)
    
    if (!assignedLoad || !driver) return null
    
    const origin = {
      latitude: driver.latitude,
      longitude: driver.longitude
    }
    
    // Route to pickup if not yet picked up, otherwise to destination
    const isPickedUp = ['loaded', 'en_route_delivery', 'at_delivery'].includes(assignedLoad.status)
    const destination = isPickedUp 
      ? {
          latitude: assignedLoad.destination.facility.address.latitude || 29.7604,
          longitude: assignedLoad.destination.facility.address.longitude || -95.3698
        }
      : {
          latitude: assignedLoad.origin.facility.address.latitude || 32.7767,
          longitude: assignedLoad.origin.facility.address.longitude || -96.7970
        }
    
    return {
      load: assignedLoad,
      coordinates: [origin, destination],
      isPickedUp
    }
  }

  const handleDriverMarkerPress = (driverId: string) => {
    setSelectedDriver(selectedDriver === driverId ? null : driverId)
  }

  const filteredFreight = freightLocations.filter(freight => {
    if (selectedFilter === 'active') return freight.status === 'in-transit';
    if (selectedFilter === 'delivered') return freight.status === 'delivered';
    return true;
  }).filter(freight => 
    searchQuery === '' || 
    freight.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    freight.origin.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    freight.destination.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrivers = driverLocations.filter(driver =>
    searchQuery === '' ||
    driver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Live Tracking Map" />
        <Appbar.Action 
          icon="cog" 
          onPress={() => setSettingsVisible(true)}
        />
      </Appbar.Header>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search loads, drivers, or locations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filter Chips */}
      <View style={styles.chipContainer}>
        <Chip 
          icon="account"
          mode="outlined"
          selected={showDrivers}
          onPress={() => setShowDrivers(!showDrivers)}
        >
          Drivers
        </Chip>
        
        <Chip 
          icon="package"
          mode="outlined"
          selected={showFreight}
          onPress={() => setShowFreight(!showFreight)}
        >
          Freight
        </Chip>
        
        <Chip 
          icon="map-marker-path"
          mode="outlined"
          selected={showRoutes}
          onPress={() => setShowRoutes(!showRoutes)}
        >
          Routes
        </Chip>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={mapProvider}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        {/* Driver Markers */}
        {showDrivers && filteredDrivers.map((driver) => (
          <Marker
            key={`driver-${driver.id}`}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => handleDriverMarkerPress(driver.id)}
          >
            <View style={[
              styles.driverMarker,
              { backgroundColor: getDriverMarkerColor(driver.status) }
            ]}>
              <Truck size={16} color="white" />
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text variant="titleSmall">{driver.name}</Text>
                <Text variant="bodySmall">Status: {driver.status}</Text>
                <Text variant="bodySmall">Vehicle: {driver.vehicleNumber}</Text>
                {(() => {
                  const route = getDriverRoute(driver.id)
                  if (route) {
                    return (
                      <>
                        <Text variant="bodySmall">Load: {route.load.loadNumber}</Text>
                        <Text variant="bodySmall">
                          {route.isPickedUp ? 'To Delivery' : 'To Pickup'}
                        </Text>
                        <Text variant="bodySmall" style={{ fontStyle: 'italic', color: '#007AFF' }}>
                          Tap truck to {selectedDriver === driver.id ? 'hide' : 'show'} route
                        </Text>
                      </>
                    )
                  }
                  return <Text variant="bodySmall" style={{ fontStyle: 'italic' }}>No active load</Text>
                })()}
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Freight markers */}
        {filteredFreight.map((load) => (
          <React.Fragment key={load.id}>
            {/* Origin marker */}
            {load.origin.latitude && load.origin.longitude && (
              <Marker
                coordinate={{
                  latitude: load.origin.latitude,
                  longitude: load.origin.longitude,
                }}
                title={`Pickup: ${load.loadNumber}`}
                description={`${load.origin.address}`}
                pinColor={getFreightMarkerColor(load.status)}
                onCalloutPress={() => {
                  // Navigate to load details
                  const assignedDriver = load.driverId ? drivers.find(d => d.id === load.driverId) : null;
                }}
              >
                <View style={[
                  styles.freightMarker,
                  { backgroundColor: getFreightMarkerColor(load.status) }
                ]}>
                  <Package size={14} color="white" />
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text variant="titleSmall">Load {load.loadNumber}</Text>
                    <Text variant="bodySmall">Origin: {load.origin.address}</Text>
                    <Text variant="bodySmall">Status: {load.status}</Text>
                    {load.estimatedDelivery && (
                      <Text variant="bodySmall">
                        ETA: {load.estimatedDelivery.toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            )}

            {/* Destination Marker */}
            {load.destination.latitude && load.destination.longitude && (
              <Marker
                coordinate={{
                  latitude: load.destination.latitude,
                  longitude: load.destination.longitude,
                }}
                title={`Destination: ${load.loadNumber}`}
                description={`${load.destination.address}`}
                pinColor={getFreightMarkerColor(load.status)}
                onCalloutPress={() => {
                  // Navigate to load details
                  const assignedDriver = load.driverId ? drivers.find(d => d.id === load.driverId) : null;
                }}
              >
                <View style={[
                  styles.destinationMarker,
                  { backgroundColor: getFreightMarkerColor(load.status) }
                ]}>
                  <MapPin size={14} color="white" />
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text variant="titleSmall">Destination</Text>
                    <Text variant="bodySmall">{load.destination.address}</Text>
                    <Text variant="bodySmall">Load: {load.loadNumber}</Text>
                  </View>
                </Callout>
              </Marker>
            )}

            {/* Route Line */}
            {showRoutes && (
              <Polyline
                coordinates={[
                  {
                    latitude: load.origin.latitude,
                    longitude: load.origin.longitude,
                  },
                  {
                    latitude: load.destination.latitude,
                    longitude: load.destination.longitude,
                  }
                ]}
                strokeColor={getFreightMarkerColor(load.status)}
                strokeWidth={2}
              />
            )}
          </React.Fragment>
        ))}
        
        {/* Driver Route */}
        {selectedDriver && (() => {
          const route = getDriverRoute(selectedDriver)
          const driver = driverLocations.find(d => d.id === selectedDriver)
          return route && driver && (
            <Polyline
              coordinates={route.coordinates}
              strokeColor={getDriverMarkerColor(driver.status)}
              strokeWidth={3}
            />
          )
        })()}
      </MapView>

      {/* Center on User Location FAB */}
      <FAB
        icon="crosshairs-gps"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={centerOnUser}
        size="small"
      />

      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={settingsVisible}
          onDismiss={() => setSettingsVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Map Settings
          </Text>
          
          <Divider style={styles.divider} />
          
          <List.Section>
            <List.Subheader>Map Provider</List.Subheader>
            <List.Item
              title="Google Maps"
              description="Use Google Maps"
              left={(props) => <List.Icon {...props} icon="google" />}
              right={() => (
                <Switch
                  value={mapProvider === PROVIDER_GOOGLE}
                  onValueChange={() => 
                    setMapProvider(mapProvider === PROVIDER_GOOGLE ? PROVIDER_DEFAULT : PROVIDER_GOOGLE)
                  }
                />
              )}
            />
            <List.Item
              title={Platform.OS === 'ios' ? 'Apple Maps' : 'Default Maps'}
              description={`Use ${Platform.OS === 'ios' ? 'Apple' : 'system default'} maps`}
              left={(props) => <List.Icon {...props} icon="map" />}
              right={() => (
                <Switch
                  value={mapProvider === PROVIDER_DEFAULT}
                  onValueChange={() => 
                    setMapProvider(mapProvider === PROVIDER_DEFAULT ? PROVIDER_GOOGLE : PROVIDER_DEFAULT)
                  }
                />
              )}
            />
            
            <Divider style={styles.divider} />
            
            <List.Subheader>Display Options</List.Subheader>
            <List.Item
              title="Show Drivers"
              description="Display driver locations on map"
              left={(props) => <List.Icon {...props} icon="account" />}
              right={() => (
                <Switch
                  value={showDrivers}
                  onValueChange={setShowDrivers}
                />
              )}
            />
            <List.Item
              title="Show Freight"
              description="Display freight locations on map"
              left={(props) => <List.Icon {...props} icon="package" />}
              right={() => (
                <Switch
                  value={showFreight}
                  onValueChange={setShowFreight}
                />
              )}
            />
            <List.Item
              title="Show Routes"
              description="Display route lines"
              left={(props) => <List.Icon {...props} icon="route" />}
              right={() => (
                <Switch
                  value={showRoutes}
                  onValueChange={setShowRoutes}
                />
              )}
            />
          </List.Section>
          
          <Button
            mode="contained"
            onPress={() => setSettingsVisible(false)}
            style={styles.modalButton}
          >
            Done
          </Button>
        </Modal>
      </Portal>

      {/* Map Provider Selection Modal */}
      <Portal>
        <Modal
          visible={showProviderSelection}
          onDismiss={() => setShowProviderSelection(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Choose Map Provider
          </Text>
          
          <Divider style={styles.divider} />
          
          <List.Section>
            <List.Item
              title="Google Maps"
              description="Use Google Maps as the map provider"
              left={(props) => <List.Icon {...props} icon="google" />}
              right={() => (
                <Button
                  mode="contained"
                  onPress={() => handleProviderSelection(PROVIDER_GOOGLE)}
                >
                  Select
                </Button>
              )}
            />
            <List.Item
              title={Platform.OS === 'ios' ? 'Apple Maps' : 'Default Maps'}
              description={`Use ${Platform.OS === 'ios' ? 'Apple' : 'system default'} maps`}
              left={(props) => <List.Icon {...props} icon="map" />}
              right={() => (
                <Button
                  mode="contained"
                  onPress={() => handleProviderSelection(PROVIDER_DEFAULT)}
                >
                  Select
                </Button>
              )}
            />
          </List.Section>
        </Modal>
      </Portal>

      {/* Legend Card */}
      <Card style={styles.legendCard}>
        <Card.Content>
          <Text variant="titleSmall">Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text variant="bodySmall">Driving / Delivered</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text variant="bodySmall">Break / In Transit</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text variant="bodySmall">Available</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
            <Text variant="bodySmall">Pending / Pickup</Text>
          </View>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  settingsFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 140,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 8,
  },
  driverMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  freightMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  destinationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#FF5722',
  },
  callout: {
    width: 200,
    padding: 8,
  },
  legendCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 200,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
});
