import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { Text, Card, Button, Chip, useTheme, List, Avatar, Badge } from 'react-native-paper';
import { useFleet } from '../../../state/fleetContext';
import { 
  MapPin, 
  Navigation, 
  Zap, 
  AlertTriangle, 
  Truck, 
  Gauge,
  Fuel,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield
} from '../../../utils/icons';
import { Vehicle, Driver } from '../../../types';

interface VehicleTracking {
  vehicleId: string;
  unitNumber: string;
  driverId?: string;
  driverName?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: Date;
  };
  status: 'driving' | 'idle' | 'parked' | 'maintenance' | 'offline';
  speed: number;
  heading: number;
  odometer: number;
  fuelLevel: number;
  engineHours: number;
  diagnostics: {
    engineTemp: number;
    oilPressure: number;
    batteryVoltage: number;
    alerts: string[];
  };
  geofenceEvents: {
    type: 'entry' | 'exit';
    zoneName: string;
    timestamp: Date;
  }[];
  driverBehavior: {
    harshBraking: number;
    rapidAcceleration: number;
    speeding: number;
    idleTime: number; // minutes
    score: number; // 0-100
  };
}

const mockTrackingData: VehicleTracking[] = [
  {
    vehicleId: '1',
    unitNumber: 'T-101',
    driverId: 'driver1',
    driverName: 'John Smith',
    location: {
      latitude: 41.8781,
      longitude: -87.6298,
      address: 'Chicago, IL',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    status: 'driving',
    speed: 65,
    heading: 180,
    odometer: 245678,
    fuelLevel: 75,
    engineHours: 12450,
    diagnostics: {
      engineTemp: 195,
      oilPressure: 45,
      batteryVoltage: 12.8,
      alerts: []
    },
    geofenceEvents: [
      { type: 'exit', zoneName: 'Chicago Terminal', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    ],
    driverBehavior: {
      harshBraking: 2,
      rapidAcceleration: 1,
      speeding: 0,
      idleTime: 15,
      score: 92
    }
  },
  {
    vehicleId: '2',
    unitNumber: 'T-102',
    driverId: 'driver2',
    driverName: 'Sarah Johnson',
    location: {
      latitude: 39.7392,
      longitude: -104.9903,
      address: 'Denver, CO',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    status: 'idle',
    speed: 0,
    heading: 0,
    odometer: 198543,
    fuelLevel: 45,
    engineHours: 9876,
    diagnostics: {
      engineTemp: 180,
      oilPressure: 40,
      batteryVoltage: 12.6,
      alerts: ['Low Fuel Warning']
    },
    geofenceEvents: [
      { type: 'entry', zoneName: 'Denver Distribution Center', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
    ],
    driverBehavior: {
      harshBraking: 0,
      rapidAcceleration: 0,
      speeding: 1,
      idleTime: 45,
      score: 88
    }
  },
  {
    vehicleId: '3',
    unitNumber: 'T-103',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      address: 'Los Angeles, CA',
      timestamp: new Date(Date.now() - 1 * 60 * 1000)
    },
    status: 'parked',
    speed: 0,
    heading: 90,
    odometer: 312567,
    fuelLevel: 25,
    engineHours: 15432,
    diagnostics: {
      engineTemp: 160,
      oilPressure: 0,
      batteryVoltage: 12.2,
      alerts: ['Engine Off', 'Low Fuel Alert']
    },
    geofenceEvents: [],
    driverBehavior: {
      harshBraking: 4,
      rapidAcceleration: 3,
      speeding: 2,
      idleTime: 120,
      score: 75
    }
  }
];

export default function TrackingScreen() {
  const theme = useTheme();
  const { vehicles, loading } = useFleet();
  const [trackingData, setTrackingData] = useState<VehicleTracking[]>(mockTrackingData);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTrackingData(prev => prev.map(vehicle => ({
        ...vehicle,
        location: {
          ...vehicle.location,
          timestamp: new Date()
        },
        // Simulate small changes in data
        speed: vehicle.status === 'driving' ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10) : 0,
        fuelLevel: Math.max(0, vehicle.fuelLevel - Math.random() * 0.1),
        driverBehavior: {
          ...vehicle.driverBehavior,
          idleTime: vehicle.status === 'idle' ? vehicle.driverBehavior.idleTime + 1 : vehicle.driverBehavior.idleTime
        }
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return '#4CAF50';
      case 'idle': return '#FF9800';
      case 'parked': return theme.colors.primary;
      case 'maintenance': return '#F44336';
      case 'offline': return '#9E9E9E';
      default: return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'driving': return <Navigation size={20} color="#4CAF50" />;
      case 'idle': return <Clock size={20} color="#FF9800" />;
      case 'parked': return <MapPin size={20} color={theme.colors.primary} />;
      case 'maintenance': return <AlertTriangle size={20} color="#F44336" />;
      case 'offline': return <Zap size={20} color="#9E9E9E" />;
      default: return <Truck size={20} color={theme.colors.primary} />;
    }
  };

  const getBehaviorScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FF9800';
    if (score >= 60) return '#FF5722';
    return '#F44336';
  };

  const filteredData = trackingData.filter(vehicle => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'alerts') return vehicle.diagnostics.alerts.length > 0;
    if (selectedFilter === 'low_fuel') return vehicle.fuelLevel < 30;
    return vehicle.status === selectedFilter;
  });

  const activeCOunt = trackingData.filter(v => v.status === 'driving').length;
  const idleCount = trackingData.filter(v => v.status === 'idle').length;
  const alertCount = trackingData.reduce((sum, v) => sum + v.diagnostics.alerts.length, 0);
  const avgFuelLevel = trackingData.reduce((sum, v) => sum + v.fuelLevel, 0) / trackingData.length;

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const viewVehicleDetails = (vehicle: VehicleTracking) => {
    Alert.alert(
      `Vehicle ${vehicle.unitNumber} Details`,
      `Driver: ${vehicle.driverName || 'Unassigned'}
Location: ${vehicle.location.address}
Speed: ${vehicle.speed} mph
Fuel: ${vehicle.fuelLevel}%
Engine Hours: ${vehicle.engineHours.toLocaleString()}
Safety Score: ${vehicle.driverBehavior.score}/100

Recent Events:
${vehicle.geofenceEvents.map(e => `• ${e.type === 'entry' ? 'Entered' : 'Exited'} ${e.zoneName}`).join('\n') || 'No recent events'}

${vehicle.diagnostics.alerts.length > 0 ? '\nAlerts:\n' + vehicle.diagnostics.alerts.map(a => `• ${a}`).join('\n') : ''}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fleet tracking data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header Stats */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Fleet Tracking</Text>
          <Button 
            mode="outlined" 
            onPress={refreshData}
            loading={refreshing}
            icon="refresh"
            compact
          >
            Refresh
          </Button>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Navigation size={24} color="#4CAF50" />
              <View>
                <Text variant="headlineMedium">{activeCOunt}</Text>
                <Text variant="bodySmall">Active</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Clock size={24} color="#FF9800" />
              <View>
                <Text variant="headlineMedium">{idleCount}</Text>
                <Text variant="bodySmall">Idle</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">{alertCount}</Text>
                <Text variant="bodySmall">Alerts</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Fuel size={24} color={avgFuelLevel > 50 ? "#4CAF50" : "#FF9800"} />
              <View>
                <Text variant="headlineMedium">{avgFuelLevel.toFixed(0)}%</Text>
                <Text variant="bodySmall">Avg Fuel</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All Vehicles' },
              { key: 'driving', label: 'Active' },
              { key: 'idle', label: 'Idle' },
              { key: 'parked', label: 'Parked' },
              { key: 'alerts', label: 'Alerts' },
              { key: 'low_fuel', label: 'Low Fuel' }
            ].map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={{ marginRight: 8 }}
              >
                {filter.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Vehicle List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredData.map(vehicle => (
          <Card key={vehicle.vehicleId} style={{ marginBottom: 12 }}>
            <List.Item
              title={`${vehicle.unitNumber} ${vehicle.driverName ? `- ${vehicle.driverName}` : ''}`}
              description={`${vehicle.location.address} • ${vehicle.speed} mph • ${vehicle.location.timestamp.toLocaleTimeString()}`}
              left={(props) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar.Icon 
                    {...props} 
                    icon="truck" 
                    style={{ backgroundColor: getStatusColor(vehicle.status) }}
                  />
                  {getStatusIcon(vehicle.status)}
                </View>
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Badge 
                    style={{ backgroundColor: getBehaviorScoreColor(vehicle.driverBehavior.score) }}
                  >
                    {vehicle.driverBehavior.score}
                  </Badge>
                  <Text variant="bodySmall">{vehicle.fuelLevel}% fuel</Text>
                  {vehicle.diagnostics.alerts.length > 0 && (
                    <Badge style={{ backgroundColor: theme.colors.error }}>
                      {vehicle.diagnostics.alerts.length}
                    </Badge>
                  )}
                </View>
              )}
              onPress={() => viewVehicleDetails(vehicle)}
            />
            
            {/* Quick Stats Row */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Gauge size={16} color={theme.colors.outline} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {vehicle.odometer.toLocaleString()} mi
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Activity size={16} color={theme.colors.outline} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {vehicle.engineHours.toLocaleString()} hrs
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Shield size={16} color={getBehaviorScoreColor(vehicle.driverBehavior.score)} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Safety: {vehicle.driverBehavior.score}/100
                </Text>
              </View>
              
              {vehicle.diagnostics.alerts.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={16} color={theme.colors.error} />
                  <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                    {vehicle.diagnostics.alerts.length} alert{vehicle.diagnostics.alerts.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))}
        
        {filteredData.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <Truck size={48} color={theme.colors.outline} />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              No Vehicles Found
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              No vehicles match your current filter.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
