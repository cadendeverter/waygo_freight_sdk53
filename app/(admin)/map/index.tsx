import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, Platform, Linking, Dimensions } from 'react-native';
import { 
  Text, 
  Chip, 
  Card, 
  Button, 
  IconButton,
  Menu,
  Portal,
  Dialog,
  TextInput,
  Divider,
  List,
  Surface
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLoad } from '../../../state/loadContext';
import { useFleetTracking } from '../../../state/fleetTrackingContext';
import { 
  MapPin, 
  Truck, 
  Package, 
  Navigation, 
  Phone, 
  Route,
  Star,
  Plus,
  Target,
  Clock,
  Fuel,
  MoreVertical
} from '../../../utils/icons';

interface MarkerData {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: 'pickup' | 'delivery' | 'driver';
  status?: string;
  phone?: string;
}

interface RouteData {
  id: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  distance: number;
  duration: number;
  isOptimized: boolean;
  fuelCost: number;
  tollCost: number;
}

interface CommonRoute {
  id: string;
  name: string;
  coordinates: Array<{ latitude: number; longitude: number }>;
  isActive: boolean;
  frequency: number;
}

const { width, height } = Dimensions.get('window');

export default function MapViewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  
  const { loads } = useLoad();
  const { vehicles } = useFleetTracking();
  
  // State management
  const [filter, setFilter] = useState<'all' | 'orders' | 'drivers' | 'routes'>(
    (params.filter as 'all' | 'orders' | 'drivers' | 'routes') || 'all'
  );
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [routeOptimization, setRouteOptimization] = useState(false);
  const [showRouteMenu, setShowRouteMenu] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [saveRouteDialog, setSaveRouteDialog] = useState(false);
  
  // Map data
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [commonRoutes, setCommonRoutes] = useState<CommonRoute[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteData | null>(null);

  // Generate markers based on loads and vehicles
  useEffect(() => {
    const newMarkers: MarkerData[] = [];
    
    // Add load markers (pickups and deliveries)
    if (filter === 'all' || filter === 'orders') {
      loads
        .filter(load => load.status === 'assigned' || load.status === 'en_route_pickup' || load.status === 'loaded' || load.status === 'en_route_delivery')
        .forEach(load => {
          // Pickup marker
          if (load.origin) {
            newMarkers.push({
              id: `pickup-${load.id}`,
              coordinate: {
                latitude: load.origin.facility?.address?.latitude || 32.7767,
                longitude: load.origin.facility?.address?.longitude || -96.7970
              },
              title: `Pickup: ${load.loadNumber}`,
              description: `${load.origin.facility?.name || 'Pickup Location'}\n${load.origin.facility?.address?.street || 'Address not available'}`,
              type: 'pickup',
              status: load.status
            });
          }
          
          // Delivery marker
          if (load.destination) {
            newMarkers.push({
              id: `delivery-${load.id}`,
              coordinate: {
                latitude: load.destination.facility?.address?.latitude || 29.7604,
                longitude: load.destination.facility?.address?.longitude || -95.3698
              },
              title: `Delivery: ${load.loadNumber}`,
              description: `${load.destination.facility?.name || 'Delivery Location'}\n${load.destination.facility?.address?.street || 'Address not available'}`,
              type: 'delivery',
              status: load.status
            });
          }
        });
    }
    
    // Add driver/vehicle markers
    if (filter === 'all' || filter === 'drivers') {
      vehicles
        .filter(vehicle => vehicle.status === 'driving' && vehicle.driverName)
        .forEach(vehicle => {
          // Mock GPS coordinates for Texas cities
          const coordinates = [
            { lat: 32.7767, lng: -96.7970, city: 'Dallas' },
            { lat: 29.7604, lng: -95.3698, city: 'Houston' },
            { lat: 30.2672, lng: -97.7431, city: 'Austin' },
            { lat: 29.4241, lng: -98.4936, city: 'San Antonio' },
            { lat: 32.2540, lng: -101.8313, city: 'Lubbock' }
          ];
          
          const randomCoord = coordinates[Math.floor(Math.random() * coordinates.length)];
          
          newMarkers.push({
            id: `driver-${vehicle.vehicleId}`,
            coordinate: {
              latitude: randomCoord.lat + (Math.random() - 0.5) * 0.1,
              longitude: randomCoord.lng + (Math.random() - 0.5) * 0.1
            },
            title: `Driver: ${vehicle.driverName}`,
            description: `Unit: ${vehicle.unitNumber}\nStatus: ${vehicle.status}\nLocation: ${randomCoord.city}`,
            type: 'driver',
            status: vehicle.status,
            phone: '(555) 123-4567'
          });
        });
    }
    
    setMarkers(newMarkers);
  }, [loads, vehicles, filter]);

  // Mock common routes data
  useEffect(() => {
    const mockCommonRoutes: CommonRoute[] = [
      {
        id: '1',
        name: 'Dallas-Houston Express',
        coordinates: [
          { latitude: 32.7767, longitude: -96.7970 }, // Dallas
          { latitude: 31.3069, longitude: -96.4247 }, // Corsicana
          { latitude: 30.6280, longitude: -96.3344 }, // Bryan
          { latitude: 29.7604, longitude: -95.3698 }  // Houston
        ],
        isActive: true,
        frequency: 15
      },
      {
        id: '2',
        name: 'Austin-San Antonio Circuit',
        coordinates: [
          { latitude: 30.2672, longitude: -97.7431 }, // Austin
          { latitude: 29.8833, longitude: -97.9414 }, // Kyle
          { latitude: 29.7030, longitude: -98.1245 }, // San Marcos
          { latitude: 29.4241, longitude: -98.4936 }  // San Antonio
        ],
        isActive: false,
        frequency: 8
      }
    ];
    setCommonRoutes(mockCommonRoutes);
  }, []);

  // Auto-fit markers on map
  useEffect(() => {
    if (markers.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          markers.map(marker => marker.coordinate),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          }
        );
      }, 1000);
    }
  }, [markers]);

  const openNavigation = (coordinate: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = coordinate;
    
    const alertButtons = [
      {
        text: 'Google Maps',
        onPress: () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          Linking.openURL(url);
        }
      },
      { text: 'Cancel', style: 'cancel' as const }
    ];

    if (Platform.OS === 'ios') {
      alertButtons.splice(1, 0, {
        text: 'Apple Maps',
        onPress: () => {
          const url = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
          Linking.openURL(url);
        }
      });
    }
    
    Alert.alert(
      'Navigation Options',
      'Choose your preferred navigation app:',
      alertButtons
    );
  };

  const contactDriver = (phone?: string) => {
    if (phone) {
      Alert.alert(
        'Contact Driver',
        'Choose contact method:',
        [
          {
            text: 'Call',
            onPress: () => Linking.openURL(`tel:${phone}`)
          },
          {
            text: 'Message',
            onPress: () => Alert.alert('Message', 'Messaging feature coming soon!')
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const optimizeRoutes = async () => {
    setRouteOptimization(true);
    
    // Mock route optimization
    setTimeout(() => {
      const mockOptimizedRoute: RouteData = {
        id: 'optimized-1',
        coordinates: markers
          .filter(m => m.type !== 'driver')
          .slice(0, 4)
          .map(m => m.coordinate),
        distance: 145,
        duration: 135,
        isOptimized: true,
        fuelCost: 89.50,
        tollCost: 12.75
      };
      
      setOptimizedRoute(mockOptimizedRoute);
      setRouteOptimization(false);
      
      Alert.alert(
        'Route Optimized!',
        `New route saves:\n• 25 minutes travel time\n• $15.25 in fuel costs\n• Avoids 2 traffic delays`,
        [
          { text: 'View Details', onPress: () => setShowDialog(true) },
          { text: 'Start Navigation', onPress: () => startOptimizedNavigation() }
        ]
      );
    }, 2000);
  };

  const startOptimizedNavigation = () => {
    if (optimizedRoute && optimizedRoute.coordinates.length > 0) {
      const firstCoord = optimizedRoute.coordinates[0];
      openNavigation(firstCoord);
    }
  };

  const saveAsCommonRoute = () => {
    if (!newRouteName.trim()) {
      Alert.alert('Error', 'Please enter a route name');
      return;
    }
    
    if (optimizedRoute) {
      const newRoute: CommonRoute = {
        id: `route-${Date.now()}`,
        name: newRouteName,
        coordinates: optimizedRoute.coordinates,
        isActive: true,
        frequency: 1
      };
      
      setCommonRoutes(prev => [...prev, newRoute]);
      setSaveRouteDialog(false);
      setNewRouteName('');
      
      Alert.alert('Success', `"${newRouteName}" saved as a common route!`);
    }
  };

  const toggleCommonRoute = (routeId: string) => {
    setCommonRoutes(prev =>
      prev.map(route =>
        route.id === routeId
          ? { ...route, isActive: !route.isActive }
          : route
      )
    );
  };

  const getMarkerColor = (type: string, status?: string) => {
    switch (type) {
      case 'pickup':
        return '#4CAF50'; // Green
      case 'delivery':
        return '#F44336'; // Red
      case 'driver':
        return status === 'active' ? '#2196F3' : '#FF9800'; // Blue or Orange
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const renderMarkerIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <Package size={20} color="#FFFFFF" />;
      case 'delivery':
        return <MapPin size={20} color="#FFFFFF" />;
      case 'driver':
        return <Truck size={20} color="#FFFFFF" />;
      default:
        return <MapPin size={20} color="#FFFFFF" />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{
        backgroundColor: theme.colors.primary,
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 12,
        elevation: 4
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="headlineSmall" style={{ 
              color: theme.colors.onPrimary,
              fontWeight: 'bold'
            }}>
              Route Optimization
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>
              Live tracking and route optimization
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={() => <Target size={24} color={theme.colors.onPrimary} />}
              onPress={optimizeRoutes}
              disabled={routeOptimization}
            />
            <Menu
              visible={showRouteMenu}
              onDismiss={() => setShowRouteMenu(false)}
              anchor={
                <IconButton
                  icon={() => <MoreVertical size={24} color={theme.colors.onPrimary} />}
                  onPress={() => setShowRouteMenu(true)}
                />
              }
            >
              <Menu.Item
                leadingIcon={() => <Route size={16} color={theme.colors.onSurface} />}
                onPress={() => {
                  setShowRouteMenu(false);
                  router.push('/(admin)/routes');
                }}
                title="Manage Routes"
              />
              <Menu.Item
                leadingIcon={() => <Plus size={16} color={theme.colors.onSurface} />}
                onPress={() => {
                  setShowRouteMenu(false);
                  setSaveRouteDialog(true);
                }}
                title="Save Current Route"
              />
            </Menu>
          </View>
        </View>
        
        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {[
            { key: 'all', label: 'All', icon: MapPin },
            { key: 'orders', label: 'Orders', icon: Package },
            { key: 'drivers', label: 'Drivers', icon: Truck },
            { key: 'routes', label: 'Routes', icon: Route }
          ].map(({ key, label, icon }) => (
            <Chip
              key={key}
              mode={filter === key ? 'flat' : 'outlined'}
              selected={filter === key}
              onPress={() => setFilter(key as any)}
              icon={() => React.createElement(icon, { 
                size: 16, 
                color: filter === key ? theme.colors.onPrimary : theme.colors.primary 
              })}
              selectedColor={theme.colors.onPrimary}
              style={{
                backgroundColor: filter === key ? theme.colors.onPrimary + '20' : 'transparent'
              }}
            >
              {label}
            </Chip>
          ))}
        </View>
      </Surface>

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 31.0000,
            longitude: -97.0000,
            latitudeDelta: 5.0,
            longitudeDelta: 5.0,
          }}
          showsUserLocation
          showsMyLocationButton
          showsTraffic
        >
          {/* Markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => setSelectedMarker(marker)}
            >
              <View style={{
                backgroundColor: getMarkerColor(marker.type, marker.status),
                padding: 8,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}>
                {renderMarkerIcon(marker.type)}
              </View>
            </Marker>
          ))}

          {/* Common Routes */}
          {filter === 'all' || filter === 'routes' ? 
            commonRoutes
              .filter(route => route.isActive)
              .map((route) => (
                <Polyline
                  key={route.id}
                  coordinates={route.coordinates}
                  strokeColor={theme.colors.primary}
                  strokeWidth={3}
                  lineDashPattern={[5, 5]}
                />
              )) : null
          }

          {/* Optimized Route */}
          {optimizedRoute && (
            <Polyline
              coordinates={optimizedRoute.coordinates}
              strokeColor="#4CAF50"
              strokeWidth={4}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>

        {/* Route Optimization Overlay */}
        {routeOptimization && (
          <View style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: 12,
            elevation: 8,
            alignItems: 'center'
          }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Optimizing Route...
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Analyzing traffic, fuel costs, and delivery windows
            </Text>
          </View>
        )}
      </View>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <Card style={{ 
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 8
        }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {selectedMarker.title}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {selectedMarker.description}
                </Text>
              </View>
              <IconButton
                icon={() => <MapPin size={20} color={theme.colors.outline} />}
                onPress={() => setSelectedMarker(null)}
                size={20}
              />
            </View>
            
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                mode="contained"
                icon={() => <Navigation size={16} color="#FFFFFF" />}
                onPress={() => openNavigation(selectedMarker.coordinate)}
                style={{ flex: 1 }}
              >
                Navigate
              </Button>
              
              {selectedMarker.type === 'driver' && selectedMarker.phone && (
                <Button
                  mode="outlined"
                  icon={() => <Phone size={16} color={theme.colors.primary} />}
                  onPress={() => contactDriver(selectedMarker.phone)}
                  style={{ flex: 1 }}
                >
                  Contact
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Route Details Dialog */}
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Optimized Route Details</Dialog.Title>
          <Dialog.Content>
            {optimizedRoute && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text variant="bodyMedium">Distance:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {optimizedRoute.distance} miles
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text variant="bodyMedium">Duration:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {Math.floor(optimizedRoute.duration / 60)}h {optimizedRoute.duration % 60}m
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text variant="bodyMedium">Fuel Cost:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    ${optimizedRoute.fuelCost.toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text variant="bodyMedium">Toll Cost:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    ${optimizedRoute.tollCost.toFixed(2)}
                  </Text>
                </View>
                <Divider style={{ marginBottom: 16 }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  ✓ Route optimized for fuel efficiency
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  ✓ Traffic delays minimized
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  ✓ Delivery windows optimized
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Close</Button>
            <Button mode="contained" onPress={startOptimizedNavigation}>
              Start Navigation
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Save Route Dialog */}
        <Dialog visible={saveRouteDialog} onDismiss={() => setSaveRouteDialog(false)}>
          <Dialog.Title>Save as Common Route</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Save the current route configuration for future use.
            </Text>
            <TextInput
              label="Route Name"
              value={newRouteName}
              onChangeText={setNewRouteName}
              mode="outlined"
              placeholder="e.g., Morning Delivery Circuit"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSaveRouteDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={saveAsCommonRoute}>
              Save Route
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
