import React, { useState, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import { Text, Card, Button, Chip, FAB, List, useTheme } from 'react-native-paper';
import MapView, { Marker, Polyline } from '../../../utils/maps';
import * as Location from '../../../utils/location';
import { useAuth } from '../../../state/authContext';
import { useLoad } from '../../../state/loadContext';
import { gpsTrackingService } from '../../../services/gpsTrackingService';
import { Navigation, MapPin, Clock, Truck, AlertTriangle, Phone, RefreshCw } from '../../../utils/icons';
import { Load, Location as GPSLocation } from '../../../types';

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  coordinates: GPSLocation;
}

interface TrafficAlert {
  id: string;
  type: 'accident' | 'construction' | 'congestion' | 'weather';
  description: string;
  location: GPSLocation;
  severity: 'low' | 'medium' | 'high';
}

export default function NavigationScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { loads } = useLoad();
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [activeLoad, setActiveLoad] = useState<Load | null>(null);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [eta, setEta] = useState<Date | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    loadActiveLoad();
    if (user) {
      startLocationTracking();
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const loadActiveLoad = () => {
    // Find the currently assigned load for this driver
    const assignedLoad = loads.find(load => 
      load.driverId === user?.uid && 
      (load.status === 'assigned' || load.status === 'en_route_pickup' || load.status === 'loaded' || load.status === 'en_route_delivery')
    );
    setActiveLoad(assignedLoad || null);
    
    if (assignedLoad) {
      generateMockRoute(assignedLoad);
      generateMockTrafficAlerts();
    }
  };

  const startLocationTracking = async () => {
    if (!locationPermission || !user) return;
    
    try {
      // Start GPS tracking service
      await gpsTrackingService.startTracking(user.uid, 'driver');
      
      // Update location every 30 seconds
      const locationInterval = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({});
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date()
          };
          setCurrentLocation(newLocation);
          
          if (activeLoad && isNavigating) {
            updateNavigationProgress(newLocation);
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }, 30000);

      return () => clearInterval(locationInterval);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const generateMockRoute = (load: Load) => {
    // Generate mock route steps
    const steps: RouteStep[] = [
      {
        instruction: `Head ${Math.random() > 0.5 ? 'north' : 'south'} on Main St`,
        distance: 0.5,
        duration: 3,
        coordinates: { latitude: 40.7128, longitude: -74.0060, timestamp: new Date() }
      },
      {
        instruction: 'Turn right onto Highway 95',
        distance: 25.3,
        duration: 28,
        coordinates: { latitude: 40.7589, longitude: -73.9851, timestamp: new Date() }
      },
      {
        instruction: 'Take exit 42B toward destination',
        distance: 2.1,
        duration: 4,
        coordinates: { latitude: 40.7831, longitude: -73.9712, timestamp: new Date() }
      },
      {
        instruction: `Arrive at ${load.destination.facility.address.street}`,
        distance: 0.8,
        duration: 2,
        coordinates: { 
          latitude: load.destination.facility.address.latitude || 40.7831, 
          longitude: load.destination.facility.address.longitude || -73.9712,
          timestamp: new Date()
        }
      }
    ];
    
    setRouteSteps(steps);
    
    // Calculate ETA
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const etaTime = new Date(Date.now() + totalDuration * 60000);
    setEta(etaTime);
    
    // Calculate total distance
    const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0);
    setDistanceRemaining(totalDistance);
  };

  const generateMockTrafficAlerts = () => {
    const alerts: TrafficAlert[] = [
      {
        id: '1',
        type: 'construction',
        description: 'Road work ahead - expect delays',
        location: { latitude: 40.7489, longitude: -73.9851, timestamp: new Date() },
        severity: 'medium'
      },
      {
        id: '2',
        type: 'congestion',
        description: 'Heavy traffic in downtown area',
        location: { latitude: 40.7831, longitude: -73.9712, timestamp: new Date() },
        severity: 'high'
      }
    ];
    setTrafficAlerts(alerts);
  };

  const updateNavigationProgress = (location: GPSLocation) => {
    // In a real implementation, this would calculate remaining distance and ETA
    // based on current location and route
    console.log('Updating navigation progress:', location);
  };

  const startNavigation = () => {
    if (!activeLoad) {
      Alert.alert('No Active Load', 'No active load found for navigation');
      return;
    }

    if (!locationPermission) {
      Alert.alert('Location Permission Required', 'Please enable location services to start navigation');
      return;
    }

    setIsNavigating(true);
    Alert.alert('Navigation Started', 'GPS navigation has been activated');
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    Alert.alert('Navigation Stopped', 'GPS navigation has been deactivated');
  };

  const getAlertColor = (severity: TrafficAlert['severity']) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getAlertIcon = (type: TrafficAlert['type']) => {
    switch (type) {
      case 'accident': return <AlertTriangle size={20} color="#F44336" />;
      case 'construction': return <Truck size={20} color="#FF9800" />;
      case 'congestion': return <Clock size={20} color="#FF9800" />;
      case 'weather': return <AlertTriangle size={20} color="#2196F3" />;
      default: return <AlertTriangle size={20} color="#757575" />;
    }
  };

  if (!locationPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <MapPin size={48} color="#2196F3" />
        <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
          Location Permission Required
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
          Enable location services to access GPS navigation features
        </Text>
        <Button mode="contained" onPress={requestLocationPermission}>
          Enable Location Services
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Map View */}
      {Platform.OS !== 'web' && currentLocation ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
          showsMyLocationButton
          followsUserLocation={isNavigating}
        >
          {/* Current Location Marker */}
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="Current position"
          />
          
          {/* Destination Marker */}
          {activeLoad && (
            <Marker
              coordinate={{
                latitude: activeLoad.destination.facility.address.latitude || 40.7831,
                longitude: activeLoad.destination.facility.address.longitude || -73.9712
              }}
              title="Destination"
              description={activeLoad.destination.facility.address.street}
              pinColor="red"
            />
          )}
          
          {/* Route Polyline */}
          {routeSteps.length > 0 && (
            <Polyline
              coordinates={[
                currentLocation,
                ...routeSteps.map(step => step.coordinates)
              ]}
              strokeColor="#2196F3"
              strokeWidth={3}
            />
          )}
          
          {/* Traffic Alert Markers */}
          {trafficAlerts.map(alert => (
            <Marker
              key={alert.id}
              coordinate={alert.location}
              title={alert.type.toUpperCase()}
              description={alert.description}
              pinColor={alert.severity === 'high' ? 'red' : 'orange'}
            />
          ))}
        </MapView>
      ) : (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceVariant 
        }}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Map view not available on web platform
          </Text>
        </View>
      )}

      {/* Navigation Info Overlay */}
      <View style={{ 
        position: 'absolute', 
        top: 50, 
        left: 16, 
        right: 16,
        zIndex: 1000
      }}>
        {activeLoad && (
          <Card style={{ marginBottom: 8 }}>
            <Card.Content style={{ paddingVertical: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Navigation size={20} color="#2196F3" />
                <Text variant="titleMedium" style={{ marginLeft: 8, flex: 1 }}>
                  {activeLoad.loadNumber}
                </Text>
                <Chip mode="outlined" style={{ backgroundColor: isNavigating ? '#4CAF50' : undefined }}>
                  {isNavigating ? 'Navigating' : 'Ready'}
                </Chip>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Distance
                  </Text>
                  <Text variant="bodyMedium">
                    {distanceRemaining.toFixed(1)} miles
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    ETA
                  </Text>
                  <Text variant="bodyMedium">
                    {eta ? eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Destination
                  </Text>
                  <Text variant="bodyMedium">
                    {activeLoad.destination.facility.address.city}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Current Route Step */}
        {isNavigating && routeSteps.length > 0 && (
          <Card style={{ backgroundColor: '#2196F3' }}>
            <Card.Content style={{ paddingVertical: 12 }}>
              <Text variant="bodyMedium" style={{ color: 'white', fontWeight: 'bold' }}>
                {routeSteps[0].instruction}
              </Text>
              <Text variant="bodySmall" style={{ color: 'white', marginTop: 4 }}>
                In {routeSteps[0].distance} miles
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Traffic Alerts */}
      {trafficAlerts.length > 0 && (
        <View style={{ 
          position: 'absolute', 
          bottom: 100, 
          left: 16, 
          right: 16,
          zIndex: 1000
        }}>
          <Card>
            <Card.Content>
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>
                Traffic Alerts
              </Text>
              {trafficAlerts.slice(0, 2).map(alert => (
                <List.Item
                  key={alert.id}
                  title={alert.description}
                  description={alert.type.replace('_', ' ')}
                  left={() => getAlertIcon(alert.type)}
                  right={() => (
                    <Chip 
                      mode="outlined" 
                      style={{ backgroundColor: getAlertColor(alert.severity) }}
                      textStyle={{ color: 'white' }}
                    >
                      {alert.severity}
                    </Chip>
                  )}
                  style={{ paddingHorizontal: 0 }}
                />
              ))}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Navigation Controls */}
      <View style={{ 
        position: 'absolute', 
        bottom: 16, 
        right: 16,
        zIndex: 1000,
        flexDirection: 'row',
        gap: 8
      }}>
        {activeLoad && (
          <FAB
            icon={() => isNavigating ? 
              <RefreshCw size={24} color="#fff" /> : 
              <Navigation size={24} color="#fff" />
            }
            style={{
              backgroundColor: isNavigating ? '#FF9800' : '#4CAF50'
            }}
            onPress={isNavigating ? stopNavigation : startNavigation}
          />
        )}
        
        <FAB
          icon={() => <Phone size={24} color="#fff" />}
          style={{
            backgroundColor: '#2196F3'
          }}
          onPress={() => {
            Alert.alert('Emergency Contact', 'Call dispatch or emergency services?', [
              { text: 'Dispatch', onPress: () => console.log('Call dispatch') },
              { text: 'Emergency', onPress: () => console.log('Call 911') },
              { text: 'Cancel', style: 'cancel' }
            ]);
          }}
        />
      </View>
    </View>
  );
}
