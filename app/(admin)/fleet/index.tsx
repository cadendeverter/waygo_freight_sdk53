// waygo-freight/app/(admin)/fleet/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Dimensions, Platform } from 'react-native';
import { 
  Text, 
  Card, 
  Chip, 
  Button, 
  Menu, 
  Divider, 
  ProgressBar,
  Badge,
  IconButton,
  SegmentedButtons,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from '../../../utils/maps';

import { useFleet } from '../../../state/fleetContext';
import { gpsTrackingService } from '../../../services/gpsTrackingService';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Fuel, 
  Clock, 
  Settings, 
  MoreVertical,
  Navigation,
  Thermometer,
  Gauge,
  Wrench
} from '../../../utils/icons';
import type { Vehicle, Driver, VehicleTelematics } from '../../../types';

// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#4CAF50';
    case 'maintenance': return '#FF9800';
    case 'out_of_service': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getFuelLevelColor = (level: number) => {
  if (level > 50) return '#4CAF50';
  if (level > 25) return '#FF9800';
  return '#F44336';
};

interface FleetMapProps {
  vehicles: Vehicle[];
  onVehiclePress: (vehicle: Vehicle) => void;
}

const FleetMap: React.FC<FleetMapProps> = ({ vehicles, onVehiclePress }) => {
  const theme = useTheme();
  const { width, height } = Dimensions.get('window');

  if (Platform.OS === 'web') {
    return (
      <Card style={{ height: 300, margin: 16 }}>
        <Card.Content style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MapPin size={48} color={theme.dark ? '#666' : '#666'} />
          <Text variant="titleMedium" style={{ marginTop: 8, textAlign: 'center' }}>
            Live Fleet Map
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 4, textAlign: 'center', color: theme.dark ? '#666' : '#666' }}>
            Real-time vehicle tracking available on mobile app
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={{ height: 300, margin: 16 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 32.7767,
          longitude: -96.7970,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        mapType={theme.dark ? 'mutedStandard' : 'standard'}
      >
        {vehicles.map(vehicle => (
          vehicle.currentLocation && (
            <Marker
              key={vehicle.id}
              coordinate={{
                latitude: vehicle.currentLocation.latitude,
                longitude: vehicle.currentLocation.longitude,
              }}
              pinColor={
                vehicle.status === 'active' ? '#4CAF50' :
                vehicle.status === 'maintenance' ? '#FF9800' : '#F44336'
              }
            >
              <Callout onPress={() => onVehiclePress(vehicle)}>
                <View style={{ padding: 8, minWidth: 200 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                  </Text>
                  <Text style={{ color: theme.dark ? '#666' : '#666', marginTop: 4 }}>
                    Status: {vehicle.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  {vehicle.assignedDriver && (
                    <Text style={{ color: theme.dark ? '#666' : '#666' }}>
                      Driver: {vehicle.assignedDriver}
                    </Text>
                  )}
                  {vehicle.telematics && (
                    <Text style={{ color: theme.dark ? '#666' : '#666' }}>
                      Speed: {Math.round(vehicle.telematics.speed || 0)} mph
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          )
        ))}
      </MapView>
    </Card>
  );
};

interface VehicleCardProps {
  vehicle: Vehicle;
  onMenuPress: (vehicle: Vehicle) => void;
  onTrackPress: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onMenuPress, onTrackPress }) => {
  const theme = useTheme();
  const telematics = vehicle.telematics;
  const lastUpdate = vehicle.currentLocation?.timestamp || new Date();
  const isStale = (new Date().getTime() - lastUpdate.getTime()) > 10 * 60 * 1000; // 10 minutes

  return (
    <Card style={{ margin: 8 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Truck size={20} color={getStatusColor(vehicle.status)} />
              <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: 'bold' }}>
                {vehicle.vehicleNumber}
              </Text>
              <Chip 
                mode="outlined" 
                style={{ 
                  marginLeft: 8,
                  backgroundColor: getStatusColor(vehicle.status) + '20',
                  borderColor: getStatusColor(vehicle.status),
                }}
                textStyle={{ color: getStatusColor(vehicle.status) }}
              >
                {vehicle.status.replace('_', ' ').toUpperCase()}
              </Chip>
              {isStale && (
                <Badge style={{ marginLeft: 8, backgroundColor: '#FF9800' }}>
                  STALE
                </Badge>
              )}
            </View>

            <Text variant="bodyMedium" style={{ color: theme.dark ? '#666' : '#666', marginBottom: 4 }}>
              {vehicle.make} {vehicle.model} {vehicle.year}
            </Text>

            {vehicle.assignedDriver && (
              <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666', marginBottom: 8 }}>
                Driver: {vehicle.assignedDriver}
              </Text>
            )}

            {/* Real-time Telematics Data */}
            {telematics && (
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Gauge size={16} color={theme.dark ? '#666' : '#666'} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                      {Math.round(telematics.speed || 0)} mph
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Fuel size={16} color={getFuelLevelColor(telematics.fuelLevel || 0)} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                      {Math.round(telematics.fuelLevel || 0)}%
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Activity size={16} color={theme.dark ? '#666' : '#666'} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                      {Math.round(telematics.engineRpm || 0)} RPM
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Thermometer size={16} color={theme.dark ? '#666' : '#666'} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                      {Math.round(telematics.engineCoolantTemp || 0)}°F
                    </Text>
                  </View>
                </View>

                {/* Fuel Level Progress Bar */}
                <View style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666' }}>Fuel Level</Text>
                    <Text variant="bodySmall" style={{ color: getFuelLevelColor(telematics.fuelLevel || 0) }}>
                      {Math.round(telematics.fuelLevel || 0)}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={(telematics.fuelLevel || 0) / 100} 
                    color={getFuelLevelColor(telematics.fuelLevel || 0)}
                    style={{ height: 6 }}
                  />
                </View>

                {/* Diagnostic Codes Alert */}
                {telematics.diagnosticCodes && telematics.diagnosticCodes.length > 0 && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: theme.dark ? '#333' : '#FFF3E0',
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 4
                  }}>
                    <AlertTriangle size={16} color={theme.dark ? '#FF9800' : '#FF9800'} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#E65100' : '#E65100' }}>
                      {telematics.diagnosticCodes.length} diagnostic code(s): {telematics.diagnosticCodes.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Location and Last Update */}
            {vehicle.currentLocation && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 8,
                padding: 8,
                backgroundColor: theme.dark ? '#2A2A2A' : '#F5F5F5',
                borderRadius: 4
              }}>
                <MapPin size={14} color={theme.dark ? '#666' : '#666'} />
                <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666', flex: 1 }}>
                  {vehicle.currentLocation?.latitude.toFixed(4)}, {vehicle.currentLocation?.longitude.toFixed(4)}
                </Text>
                <Clock size={14} color={theme.dark ? '#666' : '#666'} />
                <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                  {new Date(lastUpdate).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon={({ size, color }) => <Navigation size={size} color={color} />}
              size={20}
              onPress={() => onTrackPress(vehicle)}
              mode="outlined"
            />
            <IconButton
              icon={({ size, color }) => <MoreVertical size={size} color={color} />}
              size={20}
              onPress={() => onMenuPress(vehicle)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function FleetScreen() {
  const theme = useTheme();
  const { vehicles, drivers, loading } = useFleet();
  const [selectedView, setSelectedView] = useState<'all' | 'active' | 'maintenance' | 'out_of_service'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState('');

  const fallbackMapView = () => {
    return (
      <Card style={{ height: 300, margin: 16 }}>
        <Card.Content style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MapPin size={48} color={theme.dark ? '#666' : '#666'} />
          <Text variant="titleMedium" style={{ marginTop: 8, textAlign: 'center' }}>
            Live Fleet Map
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 4, textAlign: 'center', color: theme.dark ? '#666' : '#666' }}>
            Real-time vehicle tracking available on mobile app
          </Text>
        </Card.Content>
      </Card>
    );
  };

  // Mock data - replace with actual fleet data
  const mockVehicles: Vehicle[] = [
    {
      id: 'VEH-001',
      companyId: 'COMP-001',
      vehicleNumber: 'T-001',
      vin: '1XKWDB0X57J211825',
      make: 'Peterbilt',
      model: '579',
      year: 2022,
      plateNumber: 'TX-123ABC',
      type: 'tractor',
      status: 'active',
      currentDriverId: 'DRV-001',
      currentLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        timestamp: new Date()
      },
      telematics: {
        speed: 65,
        fuelLevel: 75,
        engineRpm: 1800,
        engineCoolantTemp: 195,
        diagnosticCodes: [],
        odometer: 125000,
        engineHours: 8500,
        batteryVoltage: 12.6,
        oilPressure: 35,
        lastUpdate: new Date()
      },
      maintenance: [],
      inspections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockDrivers = [
    {
      id: 'DRV-001',
      firstName: 'John',
      lastName: 'Smith',
      currentStatus: 'driving' as const
    }
  ];

  const getAssignedDriver = (vehicle: Vehicle) => {
    if (!vehicle.currentDriverId) return null;
    return drivers.find(d => d.id === vehicle.currentDriverId) || 
           mockDrivers.find(d => d.id === vehicle.currentDriverId);
  };

  const renderVehicleList = (vehiclesToRender: Vehicle[] = sortedVehicles) => {
    return (
      <View style={{ marginTop: 16 }}>
        {vehiclesToRender.map(vehicle => {
          const assignedDriver = getAssignedDriver(vehicle);
          const telematics = vehicle.telematics;
          const lastUpdate = telematics?.lastUpdate || new Date();

          return (
            <Card key={vehicle.id} style={{ marginBottom: 12 }} mode={theme.dark ? 'contained' : 'elevated'}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Truck size={20} color="#2196F3" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                      {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={{ color: theme.dark ? '#666' : '#666', marginTop: 4 }}>
                      Status: {vehicle.status.replace('_', ' ').toUpperCase()}
                    </Text>
                    {assignedDriver && (
                      <Text style={{ color: theme.dark ? '#666' : '#666' }}>
                        Driver: {(assignedDriver as any).firstName} {(assignedDriver as any).lastName}
                      </Text>
                    )}
                    {telematics && (
                      <Text style={{ color: theme.dark ? '#666' : '#666' }}>
                        Speed: {Math.round(telematics.speed || 0)} mph
                      </Text>
                    )}
                  </View>
                  <Chip 
                    mode="outlined" 
                    style={{ 
                      backgroundColor: getStatusColor(vehicle.status),
                      borderColor: getStatusColor(vehicle.status) 
                    }}
                  >
                    {vehicle.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>

                {vehicle.currentLocation && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: theme.dark ? '#2A2A2A' : '#F5F5F5',
                    padding: 8,
                    borderRadius: 4,
                    marginBottom: 8
                  }}>
                    <MapPin size={14} color={theme.dark ? '#666' : '#666'} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666', flex: 1 }}>
                      {vehicle.currentLocation?.latitude.toFixed(4)}, {vehicle.currentLocation?.longitude.toFixed(4)}
                    </Text>
                  </View>
                )}

                <Text variant="bodyMedium" style={{ color: theme.dark ? '#666' : '#666', marginBottom: 4 }}>
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </Text>

                {assignedDriver && (
                  <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666', marginBottom: 8 }}>
                    Driver: {(assignedDriver as any).firstName} {(assignedDriver as any).lastName}
                  </Text>
                )}

                {/* Telematics Data */}
                {telematics && (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Gauge size={16} color={theme.dark ? '#666' : '#666'} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                          {Math.round(telematics.speed || 0)} mph
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Fuel size={16} color={getFuelLevelColor(telematics.fuelLevel || 0)} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                          {Math.round(telematics.fuelLevel || 0)}%
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Activity size={16} color={theme.dark ? '#666' : '#666'} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                          {Math.round(telematics.engineRpm || 0)} RPM
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Thermometer size={16} color={theme.dark ? '#666' : '#666'} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                          {Math.round(telematics.engineCoolantTemp || 0)}°F
                        </Text>
                      </View>
                    </View>

                    {/* Fuel Level Progress Bar */}
                    <View style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666' }}>Fuel Level</Text>
                        <Text variant="bodySmall" style={{ color: getFuelLevelColor(telematics.fuelLevel || 0) }}>
                          {Math.round(telematics.fuelLevel || 0)}%
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={(telematics.fuelLevel || 0) / 100} 
                        color={getFuelLevelColor(telematics.fuelLevel || 0)}
                        style={{ height: 4 }}
                      />
                    </View>

                    {/* Diagnostic Codes */}
                    {telematics.diagnosticCodes && telematics.diagnosticCodes.length > 0 && (
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: theme.dark ? '#333' : '#FFF3E0',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 4
                      }}>
                        <AlertTriangle size={16} color={theme.dark ? '#FF9800' : '#FF9800'} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#E65100' : '#E65100' }}>
                          {telematics.diagnosticCodes.length} diagnostic code(s): {telematics.diagnosticCodes.join(', ')}
                        </Text>
                      </View>
                    )}

                    {/* Last Update */}
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      marginTop: 8, 
                      padding: 8,
                      backgroundColor: theme.dark ? '#2A2A2A' : '#F5F5F5',
                      borderRadius: 4
                    }}>
                      <MapPin size={14} color={theme.dark ? '#666' : '#666'} />
                      <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666', flex: 1 }}>
                        {vehicle.currentLocation?.latitude.toFixed(4)}, {vehicle.currentLocation?.longitude.toFixed(4)}
                      </Text>
                      <Clock size={14} color={theme.dark ? '#666' : '#666'} />
                      <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.dark ? '#666' : '#666' }}>
                        {new Date(lastUpdate).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </View>
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refresh - remove refreshFleet call since it doesn't exist
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleVehicleAction = (vehicle: Vehicle, action: string) => {
    switch (action) {
      case 'start_tracking':
        gpsTrackingService.startTracking(vehicle.id);
        console.log(`Started tracking for ${vehicle.vehicleNumber}`);
        break;
      case 'stop_tracking':
        gpsTrackingService.stopTracking();
        console.log(`Stopped tracking for ${vehicle.vehicleNumber}`);
        break;
      case 'schedule_maintenance':
        router.push(`/(admin)/fleet/maintenance?vehicleId=${vehicle.id}`);
        break;
      case 'view_details':
        router.push(`/(admin)/fleet/details?vehicleId=${vehicle.id}`);
        break;
    }
  };

  // Use actual data or fallback to mock data for development
  const displayVehicles = vehicles.length > 0 ? vehicles : mockVehicles;
  const displayDrivers = drivers.length > 0 ? drivers : mockDrivers;

  // Filter vehicles based on selected view
  const filteredVehicles = displayVehicles.filter(vehicle => {
    if (selectedView === 'all') return true;
    return vehicle.status === selectedView;
  });

  // Sort vehicles by status priority (Active, Maintenance, Out of Service)
  const getSortedVehicles = (vehicles: Vehicle[]) => {
    const statusPriority = { 'active': 1, 'maintenance': 2, 'out_of_service': 3 };
    return [...vehicles].sort((a, b) => {
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999;
      return aPriority - bPriority;
    });
  };

  // Get sorted vehicles
  const sortedVehicles = getSortedVehicles(filteredVehicles);

  // Fleet statistics
  const activeVehicles = displayVehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = displayVehicles.filter(v => v.status === 'maintenance').length;
  const outOfServiceVehicles = displayVehicles.filter(v => v.status === 'out_of_service').length;

  // Driver utilization calculation
  const driverUtilization = displayDrivers.length > 0 
    ? Math.round((displayDrivers.filter(d => d.currentStatus === 'driving').length / displayDrivers.length) * 100)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading fleet data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.dark ? '#121212' : '#FAFAFA' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Fleet Statistics */}
        <View style={{ padding: 16 }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Fleet Overview
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Card 
              style={{ flex: 1 }} 
              onPress={() => setSelectedView('active')}
            >
              <Card.Content style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {activeVehicles}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666' }}>Active</Text>
              </Card.Content>
            </Card>
            
            <Card 
              style={{ flex: 1 }} 
              onPress={() => setSelectedView('maintenance')}
            >
              <Card.Content style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {maintenanceVehicles}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666' }}>Maintenance</Text>
              </Card.Content>
            </Card>
            
            <Card 
              style={{ flex: 1 }} 
              onPress={() => setSelectedView('out_of_service')}
            >
              <Card.Content style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#F44336' }}>
                  {outOfServiceVehicles}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.dark ? '#666' : '#666' }}>Out of Service</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Utilization Metrics */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                Fleet Utilization
              </Text>
              
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text variant="bodyMedium">Vehicle Utilization</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {(activeVehicles / displayVehicles.length * 100).toFixed(1)}%
                  </Text>
                </View>
                <ProgressBar progress={(activeVehicles / displayVehicles.length)} color="#4CAF50" style={{ height: 8 }} />
              </View>

              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text variant="bodyMedium">Driver Utilization</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {driverUtilization}%
                  </Text>
                </View>
                <ProgressBar progress={driverUtilization / 100} color="#2196F3" style={{ height: 8 }} />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Live Fleet Map */}
        <FleetMap 
          vehicles={sortedVehicles}
          onVehiclePress={(vehicle) => router.push(`/(admin)/fleet/details/${vehicle.id}`)}
        />

        {/* Filter Buttons */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <SegmentedButtons
            value={selectedView}
            onValueChange={setSelectedView}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'out_of_service', label: 'Out of Service' },
            ]}
          />
        </View>

        {/* Vehicle List */}
        <View style={{ paddingHorizontal: 8 }}>
          {sortedVehicles.length > 0 ? renderVehicleList() : (
            <Card style={{ margin: 16 }}>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Truck size={48} color={theme.dark ? '#666' : '#666'} />
                <Text variant="titleMedium" style={{ marginTop: 16, color: theme.dark ? '#666' : '#666' }}>
                  No vehicles found
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.dark ? '#666' : '#666', textAlign: 'center' }}>
                  {selectedView === 'all' 
                    ? 'Add vehicles to start managing your fleet'
                    : `No vehicles with status: ${selectedView.replace('_', ' ')}`
                  }
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Menu for vehicle actions */}
        {menuVisible && (
          <Menu
            visible={true}
            onDismiss={() => setMenuVisible('')}
            anchor={{ x: 0, y: 0 }}
          >
            <Menu.Item
              onPress={() => handleVehicleAction(
                vehicles.find(v => v.id === menuVisible)!,
                'start_tracking'
              )}
              title="Start Tracking"
              leadingIcon={({ size, color }) => <Navigation size={size} color={color} />}
            />
            <Menu.Item
              onPress={() => handleVehicleAction(
                vehicles.find(v => v.id === menuVisible)!,
                'stop_tracking'
              )}
              title="Stop Tracking"
              leadingIcon={({ size, color }) => <Navigation size={size} color={color} />}
            />
            <Menu.Item
              onPress={() => handleVehicleAction(
                vehicles.find(v => v.id === menuVisible)!,
                'schedule_maintenance'
              )}
              title="Schedule Maintenance"
              leadingIcon={({ size, color }) => <Wrench size={size} color={color} />}
            />
            <Menu.Item
              onPress={() => handleVehicleAction(
                vehicles.find(v => v.id === menuVisible)!,
                'view_details'
              )}
              title="View Details"
              leadingIcon={({ size, color }) => <MoreVertical size={size} color={color} />}
            />
          </Menu>
        )}
      </ScrollView>

      {/* Floating Action Button to Add Vehicle */}
      <View style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        zIndex: 1000 
      }}>
        <Button
          mode="contained"
          onPress={() => router.push('/(admin)/fleet/vehicles/create')}
          icon={() => <Truck size={20} color="#FFFFFF" />}
          style={{ 
            backgroundColor: theme.colors.primary,
            borderRadius: 28,
            elevation: 8,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          contentStyle={{ 
            flexDirection: 'row-reverse',
            paddingVertical: 8,
            paddingHorizontal: 16
          }}
        >
          Add Vehicle
        </Button>
      </View>
    </SafeAreaView>
  );
}
