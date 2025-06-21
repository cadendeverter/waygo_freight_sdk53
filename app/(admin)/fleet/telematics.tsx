// waygo-freight/app/(admin)/fleet/telematics.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Alert, RefreshControl, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { 
  Text, 
  Card, 
  Button, 
  Switch,
  Chip, 
  Searchbar, 
  Avatar, 
  Badge,
  IconButton,
  ProgressBar,
  Surface,
  Divider,
  List
} from 'react-native-paper';
import { 
  Activity, 
  MapPin, 
  Fuel, 
  Truck, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Thermometer,
  Gauge,
  Navigation,
  Wifi,
  WifiOff,
  Battery,
  Eye,
  Settings,
  Download,
  Filter,
  User,
  Calendar,
  Target
} from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface TelematicsData {
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  status: 'driving' | 'idle' | 'parked' | 'maintenance' | 'offline';
  speed: number;
  fuelLevel: number;
  engineTemp: number;
  engineHours: number;
  odometer: number;
  connectivity: 'online' | 'offline' | 'weak';
  lastUpdate: string;
  alerts: TelematicsAlert[];
  dailyStats: {
    milesdriven: number;
    fuelConsumed: number;
    idleTime: number;
    drivingTime: number;
    hardBrakingEvents: number;
    rapidAccelEvents: number;
    speedingEvents: number;
  };
}

interface TelematicsAlert {
  id: string;
  type: 'speeding' | 'hard_braking' | 'rapid_accel' | 'idle_excessive' | 'engine_fault' | 'fuel_low' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  location?: string;
}

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  idleVehicles: number;
  offlineVehicles: number;
  averageFuelEfficiency: number;
  totalMilesDaily: number;
  alertsToday: number;
  complianceScore: number;
  fuelCostToday: number;
  maintenanceOverdue: number;
}

// Mock telematics data
const mockTelematicsData: TelematicsData[] = [
  {
    vehicleId: 'VEH001',
    vehicleName: 'Truck #247 (Freightliner)',
    driverId: 'DRV001',
    driverName: 'John Smith',
    location: {
      latitude: 32.7767,
      longitude: -96.7970,
      address: 'Dallas, TX - I-35E Mile 428',
      timestamp: '2025-06-16T14:30:00Z'
    },
    status: 'driving',
    speed: 67,
    fuelLevel: 78,
    engineTemp: 195,
    engineHours: 847.5,
    odometer: 124785,
    connectivity: 'online',
    lastUpdate: '2025-06-16T14:30:00Z',
    alerts: [
      {
        id: 'ALT001',
        type: 'speeding',
        severity: 'medium',
        message: 'Vehicle exceeding speed limit by 7 mph',
        timestamp: '2025-06-16T14:25:00Z',
        location: 'I-35E Mile 425'
      }
    ],
    dailyStats: {
      milesdriven: 287,
      fuelConsumed: 38.4,
      idleTime: 45,
      drivingTime: 342,
      hardBrakingEvents: 2,
      rapidAccelEvents: 1,
      speedingEvents: 3
    }
  },
  {
    vehicleId: 'VEH002',
    vehicleName: 'Truck #156 (Peterbilt)',
    driverId: 'DRV002',
    driverName: 'Sarah Johnson',
    location: {
      latitude: 29.7604,
      longitude: -95.3698,
      address: 'Houston, TX - Port Terminal 4',
      timestamp: '2025-06-16T14:28:00Z'
    },
    status: 'idle',
    speed: 0,
    fuelLevel: 45,
    engineTemp: 187,
    engineHours: 923.2,
    odometer: 187432,
    connectivity: 'online',
    lastUpdate: '2025-06-16T14:28:00Z',
    alerts: [
      {
        id: 'ALT002',
        type: 'fuel_low',
        severity: 'high',
        message: 'Fuel level below 50%',
        timestamp: '2025-06-16T13:45:00Z',
        location: 'Houston, TX'
      },
      {
        id: 'ALT003',
        type: 'idle_excessive',
        severity: 'low',
        message: 'Vehicle idling for 18 minutes',
        timestamp: '2025-06-16T14:10:00Z',
        location: 'Port Terminal 4'
      }
    ],
    dailyStats: {
      milesdriven: 142,
      fuelConsumed: 24.7,
      idleTime: 78,
      drivingTime: 198,
      hardBrakingEvents: 1,
      rapidAccelEvents: 0,
      speedingEvents: 0
    }
  },
  {
    vehicleId: 'VEH003',
    vehicleName: 'Truck #298 (Kenworth)',
    driverId: 'DRV003',
    driverName: 'Mike Wilson',
    location: {
      latitude: 33.4484,
      longitude: -112.0740,
      address: 'Phoenix, AZ - Truck Stop',
      timestamp: '2025-06-16T12:15:00Z'
    },
    status: 'parked',
    speed: 0,
    fuelLevel: 92,
    engineTemp: 0,
    engineHours: 654.8,
    odometer: 98765,
    connectivity: 'weak',
    lastUpdate: '2025-06-16T12:15:00Z',
    alerts: [],
    dailyStats: {
      milesdriven: 456,
      fuelConsumed: 52.3,
      idleTime: 23,
      drivingTime: 412,
      hardBrakingEvents: 0,
      rapidAccelEvents: 2,
      speedingEvents: 1
    }
  },
  {
    vehicleId: 'VEH004',
    vehicleName: 'Truck #134 (Volvo)',
    driverId: 'DRV004',
    driverName: 'David Brown',
    location: {
      latitude: 0,
      longitude: 0,
      address: 'Location unavailable',
      timestamp: '2025-06-16T08:30:00Z'
    },
    status: 'offline',
    speed: 0,
    fuelLevel: 0,
    engineTemp: 0,
    engineHours: 1234.7,
    odometer: 245678,
    connectivity: 'offline',
    lastUpdate: '2025-06-16T08:30:00Z',
    alerts: [
      {
        id: 'ALT004',
        type: 'maintenance_due',
        severity: 'high',
        message: 'Scheduled maintenance overdue by 3 days',
        timestamp: '2025-06-16T08:30:00Z'
      }
    ],
    dailyStats: {
      milesdriven: 0,
      fuelConsumed: 0,
      idleTime: 0,
      drivingTime: 0,
      hardBrakingEvents: 0,
      rapidAccelEvents: 0,
      speedingEvents: 0
    }
  }
];

const mockFleetMetrics: FleetMetrics = {
  totalVehicles: 4,
  activeVehicles: 2,
  idleVehicles: 1,
  offlineVehicles: 1,
  averageFuelEfficiency: 7.2,
  totalMilesDaily: 885,
  alertsToday: 4,
  complianceScore: 92.5,
  fuelCostToday: 847.50,
  maintenanceOverdue: 1
};

const TelematicsScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [telematicsData] = useState<TelematicsData[]>(mockTelematicsData);
  const [fleetMetrics] = useState<FleetMetrics>(mockFleetMetrics);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return '#4CAF50';
      case 'idle': return '#FF9800';
      case 'parked': return '#2196F3';
      case 'maintenance': return '#9C27B0';
      case 'offline': return '#9E9E9E';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'driving': return Navigation;
      case 'idle': return Clock;
      case 'parked': return MapPin;
      case 'maintenance': return Settings;
      case 'offline': return WifiOff;
      default: return Truck;
    }
  };

  const getConnectivityIcon = (connectivity: string) => {
    switch (connectivity) {
      case 'online': return Wifi;
      case 'weak': return Activity;
      case 'offline': return WifiOff;
      default: return WifiOff;
    }
  };

  const getConnectivityColor = (connectivity: string) => {
    switch (connectivity) {
      case 'online': return '#4CAF50';
      case 'weak': return '#FF9800';
      case 'offline': return '#F44336';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'speeding': return Gauge;
      case 'hard_braking': return AlertTriangle;
      case 'rapid_accel': return TrendingUp;
      case 'idle_excessive': return Clock;
      case 'engine_fault': return AlertTriangle;
      case 'fuel_low': return Fuel;
      case 'maintenance_due': return Settings;
      default: return AlertTriangle;
    }
  };

  const filteredVehicles = telematicsData.filter(vehicle => {
    const matchesSearch = 
      vehicle.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'all' || 
      vehicle.status === selectedFilter ||
      (selectedFilter === 'alerts' && vehicle.alerts.length > 0) ||
      (selectedFilter === 'online' && vehicle.connectivity === 'online');
    
    return matchesSearch && matchesFilter;
  });

  const renderFleetMetrics = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Truck size={24} color={theme.colors.primary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {fleetMetrics.activeVehicles}/{fleetMetrics.totalVehicles}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Active Vehicles
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <MapPin size={24} color='#4CAF50' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {fleetMetrics.totalMilesDaily.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Miles Today
            </Text>
          </View>
        </Card>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Fuel size={24} color='#2196F3' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {fleetMetrics.averageFuelEfficiency}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Avg MPG
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <AlertTriangle size={24} color='#FF9800' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {fleetMetrics.alertsToday}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Alerts Today
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 16, marginBottom: 16 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['all', 'driving', 'idle', 'parked', 'offline', 'alerts', 'online'].map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            showSelectedCheck={false}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  const renderVehicleCard = (vehicle: TelematicsData) => {
    const StatusIcon = getStatusIcon(vehicle.status);
    const ConnectivityIcon = getConnectivityIcon(vehicle.connectivity);
    
    return (
      <Card key={vehicle.vehicleId} style={{ marginBottom: 12, marginHorizontal: 16 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Avatar.Icon
              size={40}
              icon={() => <StatusIcon size={20} color="white" />}
              style={{ backgroundColor: getStatusColor(vehicle.status) }}
            />
            
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16 }}>
                    {vehicle.vehicleName}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                    {vehicle.driverName} • {vehicle.vehicleId}
                  </Text>
                  <Text style={{ fontSize: 14, marginTop: 4 }}>
                    {vehicle.location.address}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Chip 
                    mode="flat"
                    textStyle={{ fontSize: 10 }}
                    style={{ 
                      height: 20,
                      backgroundColor: getStatusColor(vehicle.status) + '20'
                    }}
                  >
                    {vehicle.status.toUpperCase()}
                  </Chip>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <ConnectivityIcon 
                      size={12} 
                      color={getConnectivityColor(vehicle.connectivity)} 
                    />
                    <Text style={{ 
                      fontSize: 10, 
                      marginLeft: 4,
                      color: getConnectivityColor(vehicle.connectivity)
                    }}>
                      {vehicle.connectivity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Vehicle Stats */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                marginTop: 12,
                padding: 8,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 4
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Gauge size={16} color={theme.colors.primary} />
                  <Text style={{ fontSize: 10, marginTop: 2 }}>
                    {vehicle.speed} mph
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Fuel size={16} color={theme.colors.primary} />
                  <Text style={{ fontSize: 10, marginTop: 2 }}>
                    {vehicle.fuelLevel}%
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Thermometer size={16} color={theme.colors.primary} />
                  <Text style={{ fontSize: 10, marginTop: 2 }}>
                    {vehicle.engineTemp}°F
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Clock size={16} color={theme.colors.primary} />
                  <Text style={{ fontSize: 10, marginTop: 2 }}>
                    {vehicle.engineHours}h
                  </Text>
                </View>
              </View>
              
              {/* Daily Performance */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                  Today's Performance
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>Miles</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600' }}>{vehicle.dailyStats.milesdriven}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>Fuel (gal)</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600' }}>{vehicle.dailyStats.fuelConsumed}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>Idle (min)</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600' }}>{vehicle.dailyStats.idleTime}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>Events</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600' }}>
                      {vehicle.dailyStats.hardBrakingEvents + vehicle.dailyStats.rapidAccelEvents + vehicle.dailyStats.speedingEvents}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Alerts */}
              {vehicle.alerts.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                    Active Alerts ({vehicle.alerts.length})
                  </Text>
                  {vehicle.alerts.slice(0, 2).map((alert) => {
                    const AlertIcon = getAlertIcon(alert.type);
                    return (
                      <View key={alert.id} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        padding: 6,
                        backgroundColor: getAlertSeverityColor(alert.severity) + '10',
                        borderRadius: 4,
                        marginBottom: 4
                      }}>
                        <AlertIcon size={12} color={getAlertSeverityColor(alert.severity)} />
                        <Text style={{ 
                          fontSize: 10, 
                          marginLeft: 6,
                          flex: 1,
                          color: theme.colors.onSurface
                        }}>
                          {alert.message}
                        </Text>
                        <Text style={{ 
                          fontSize: 8, 
                          color: theme.colors.onSurfaceVariant
                        }}>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                    );
                  })}
                  {vehicle.alerts.length > 2 && (
                    <Text style={{ 
                      fontSize: 10, 
                      color: theme.colors.primary,
                      textAlign: 'center'
                    }}>
                      +{vehicle.alerts.length - 2} more alerts
                    </Text>
                  )}
                </View>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    mode="outlined"
                    compact
                    icon={() => <MapPin size={16} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Track Vehicle', 'Open live GPS tracking')}
                  >
                    Track
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    icon={() => <Eye size={16} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Vehicle Details', 'View detailed telematics')}
                  >
                    Details
                  </Button>
                </View>
                
                {vehicle.alerts.length > 0 && (
                  <Button
                    mode="contained"
                    compact
                    onPress={() => Alert.alert('Manage Alerts', 'View and manage vehicle alerts')}
                  >
                    Alerts ({vehicle.alerts.length})
                  </Button>
                )}
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'Fleet Telematics',
          headerShown: true,
          headerTitleAlign: 'center',
          headerRight: () => (
            <IconButton
              icon={() => <Download size={24} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Export', 'Export telematics report')}
            />
          )
        }} 
      />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderFleetMetrics()}
        
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search vehicles..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

        {renderFilterChips()}

        <View style={{ flex: 1 }}>
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map(renderVehicleCard)
          ) : (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 32
            }}>
              <Truck size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                marginTop: 16,
                color: theme.colors.onSurfaceVariant
              }}>
                No vehicles found
              </Text>
              <Text style={{ 
                textAlign: 'center', 
                marginTop: 8,
                color: theme.colors.onSurfaceVariant
              }}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Fleet telematics data will appear here'
                }
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default TelematicsScreen;
