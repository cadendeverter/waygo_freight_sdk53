// waygo-freight/app/(admin)/operations/real-time-dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Dimensions, FlatList } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  Badge,
  IconButton,
  Surface,
  Divider,
  ProgressBar,
  ActivityIndicator,
  List,
  Avatar,
  Menu,
  Dialog,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Activity,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Fuel,
  Navigation,
  Phone,
  MessageSquare,
  RefreshCw,
  Eye,
  Settings,
  Filter,
  Globe,
  Zap,
  Target,
  Award,
  Shield,
  Calendar,
  BarChart3,
  iconSource
} from '../../../utils/icons';

import { useLoad } from '../../../state/loadContext';
import { useFleet } from '../../../state/fleetContext';
import { useAuth } from '../../../state/authContext';
import { ConditionalMapView as MapView, ConditionalMarker as Marker } from '../../../components/MapView';

// Real-time metrics interface
interface RealTimeMetrics {
  activeLoads: number;
  inTransitLoads: number;
  availableDrivers: number;
  activeDrivers: number;
  idleVehicles: number;
  maintenanceVehicles: number;
  avgDeliveryTime: number;
  onTimePerformance: number;
  fuelEfficiency: number;
  revenueToday: number;
  milesDriverToday: number;
  alertsCount: number;
}

interface LiveAlert {
  id: string;
  type: 'BREAKDOWN' | 'DELAY' | 'WEATHER' | 'FUEL' | 'HOS' | 'SAFETY' | 'CUSTOMER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  location?: string;
  driverId?: string;
  driverName?: string;
  loadId?: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

interface VehicleLocation {
  id: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'DRIVING' | 'STOPPED' | 'IDLE' | 'LOADING' | 'UNLOADING' | 'BREAK' | 'OFF_DUTY';
  speed: number;
  heading: number;
  lastUpdate: Date;
  currentLoad?: {
    id: string;
    loadNumber: string;
    destination: string;
    eta: Date;
  };
}

const RealTimeOperationsDashboard: React.FC = () => {
  const theme = useTheme();
  const { loads } = useLoad();
  const { vehicles, drivers } = useFleet();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid');
  const [alertDialogVisible, setAlertDialogVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<LiveAlert | null>(null);

  // Mock real-time data
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeLoads: 47,
    inTransitLoads: 32,
    availableDrivers: 12,
    activeDrivers: 35,
    idleVehicles: 8,
    maintenanceVehicles: 3,
    avgDeliveryTime: 2.4,
    onTimePerformance: 94.5,
    fuelEfficiency: 6.8,
    revenueToday: 125000,
    milesDriverToday: 8420,
    alertsCount: 6
  });

  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([
    {
      id: 'ALT001',
      type: 'BREAKDOWN',
      severity: 'CRITICAL',
      title: 'Vehicle Breakdown',
      description: 'Truck #247 experiencing engine issues on I-35',
      location: 'I-35 Exit 124, Dallas, TX',
      driverId: 'DRV015',
      driverName: 'Mike Rodriguez',
      loadId: 'LD4578',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false,
      resolved: false
    },
    {
      id: 'ALT002',
      type: 'DELAY',
      severity: 'HIGH',
      title: 'Traffic Delay',
      description: 'Major accident causing 2+ hour delays',
      location: 'I-10 Houston, TX',
      driverId: 'DRV023',
      driverName: 'Sarah Chen',
      loadId: 'LD4592',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      acknowledged: true,
      resolved: false
    },
    {
      id: 'ALT003',
      type: 'HOS',
      severity: 'MEDIUM',
      title: 'HOS Violation Risk',
      description: 'Driver approaching maximum hours limit',
      driverId: 'DRV031',
      driverName: 'Tom Wilson',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false,
      resolved: false
    }
  ]);

  const [vehicleLocations, setVehicleLocations] = useState<VehicleLocation[]>([
    {
      id: 'VL001',
      vehicleId: 'VH001',
      driverId: 'DRV015',
      driverName: 'Mike Rodriguez',
      vehicleNumber: 'TRK-247',
      location: { latitude: 32.7767, longitude: -96.7970 },
      status: 'STOPPED',
      speed: 0,
      heading: 180,
      lastUpdate: new Date(),
      currentLoad: {
        id: 'LD4578',
        loadNumber: 'WG24-4578',
        destination: 'Austin, TX',
        eta: new Date(Date.now() + 4 * 60 * 60 * 1000)
      }
    },
    {
      id: 'VL002',
      vehicleId: 'VH008',
      driverId: 'DRV023',
      driverName: 'Sarah Chen',
      vehicleNumber: 'TRK-305',
      location: { latitude: 29.7604, longitude: -95.3698 },
      status: 'DRIVING',
      speed: 65,
      heading: 90,
      lastUpdate: new Date(),
      currentLoad: {
        id: 'LD4592',
        loadNumber: 'WG24-4592',
        destination: 'New Orleans, LA',
        eta: new Date(Date.now() + 6 * 60 * 60 * 1000)
      }
    }
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update metrics with slight variations
    setMetrics(prev => ({
      ...prev,
      activeLoads: prev.activeLoads + Math.floor(Math.random() * 3) - 1,
      revenueToday: prev.revenueToday + Math.floor(Math.random() * 5000) - 2500,
      onTimePerformance: Math.max(90, Math.min(100, prev.onTimePerformance + (Math.random() - 0.5) * 2))
    }));

    setRefreshing(false);
  }, []);

  const getAlertIcon = (type: LiveAlert['type']) => {
    switch (type) {
      case 'BREAKDOWN': return iconSource(Truck);
      case 'DELAY': return iconSource(Clock);
      case 'WEATHER': return iconSource(AlertTriangle);
      case 'FUEL': return iconSource(Fuel);
      case 'HOS': return iconSource(Shield);
      case 'SAFETY': return iconSource(AlertTriangle);
      case 'CUSTOMER': return iconSource(Users);
      default: return iconSource(AlertTriangle);
    }
  };

  const getAlertColor = (severity: LiveAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL': return theme.colors.error;
      case 'HIGH': return theme.colors.primary;
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setLiveAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    console.log('Alert acknowledged:', alertId);
    
    // Send push notification for acknowledgment
    PushNotificationService.sendAlertNotification(
      'Alert Acknowledged',
      `Alert ${alertId} has been acknowledged by dispatcher.`,
      { alertId, action: 'acknowledge' }
    );
  };

  const resolveAlert = (alertId: string) => {
    setLiveAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true, acknowledged: true } : alert
      )
    );
    console.log('Alert resolved:', alertId);
    
    // Send push notification for resolution
    PushNotificationService.sendAlertNotification(
      'Alert Resolved',
      `Alert ${alertId} has been resolved.`,
      { alertId, action: 'resolve' }
    );
  };

  const handleVehicleBreakdown = (vehicleId: string, description: string) => {
    console.log('Vehicle breakdown detected:', vehicleId);
    
    // Send push notification to admin dispatcher
    PushNotificationService.sendAlertNotification(
      'Vehicle Breakdown Alert',
      `Vehicle ${vehicleId} has broken down: ${description}. Immediate attention required.`,
      { 
        vehicleId, 
        type: 'breakdown',
        priority: 'high',
        timestamp: new Date().toISOString()
      }
    );

    // Create new alert for the breakdown
    const newAlert = {
      id: `breakdown_${vehicleId}_${Date.now()}`,
      type: 'vehicle_breakdown' as const,
      severity: 'high' as const,
      title: 'Vehicle Breakdown',
      description: `Vehicle ${vehicleId}: ${description}`,
      vehicleNumber: vehicleId,
      driverName: 'Unknown Driver',
      location: 'Location Unknown',
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    setLiveAlerts(prev => [newAlert, ...prev]);
  };

  const handleActiveLoadsPress = () => {
    router.push('/(admin)/loads?view=active&display=both'); // Both list and map
  };

  const handleAvailableDriversPress = () => {
    router.push('/(admin)/drivers?status=available&view=list');
  };

  const filteredAlerts = liveAlerts.filter(alert => {
    if (selectedFilter === 'critical') return alert.severity === 'CRITICAL';
    if (selectedFilter === 'pending') return !alert.acknowledged;
    return true;
  });

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, trend?: 'up' | 'down', color?: string, onPress?: () => void) => (
    <Card style={{ margin: 8, minWidth: 160 }} onPress={onPress}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
              {title}
            </Text>
            <Text variant="headlineSmall" style={{ color: color || theme.colors.primary, fontWeight: 'bold' }}>
              {value}
            </Text>
            {subtitle && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                {trend && (trend === 'up' ? <TrendingUp size={16} color={theme.colors.primary} /> : <TrendingDown size={16} color={theme.colors.error} />)}
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.6, marginLeft: trend ? 4 : 0 }}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAlert = ({ item }: { item: LiveAlert }) => {
    const IconComponent = getAlertIcon(item.type);
    const alertColor = getAlertColor(item.severity);
    
    return (
      <Card style={{ margin: 8, borderLeftWidth: 4, borderLeftColor: alertColor }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Avatar.Icon 
              size={40} 
              icon={IconComponent} 
              style={{ backgroundColor: alertColor + '20' }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {item.title}
                </Text>
                <Chip 
                  mode="outlined" 
                  compact
                  textStyle={{ fontSize: 10 }}
                  style={{ borderColor: alertColor }}
                >
                  {item.severity}
                </Chip>
              </View>
              
              <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurface, opacity: 0.8 }}>
                {item.description}
              </Text>
              
              {item.location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <MapPin size={16} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.primary }}>
                    {item.location}
                  </Text>
                </View>
              )}
              
              {item.driverName && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Users size={16} color={theme.colors.onSurface} />
                  <Text variant="bodySmall" style={{ marginLeft: 4 }}>
                    {item.driverName}
                  </Text>
                </View>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.6 }}>
                  {item.timestamp.toLocaleTimeString()}
                </Text>
                
                <View style={{ flexDirection: 'row' }}>
                  {!item.acknowledged && (
                    <Button 
                      mode="outlined" 
                      compact
                      onPress={() => {
                        acknowledgeAlert(item.id);
                        // Send push notification acknowledgment
                        console.log('Alert acknowledged, sending notification update');
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {item.acknowledged && !item.resolved && (
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => {
                        resolveAlert(item.id);
                        // Send push notification resolution
                        console.log('Alert resolved, sending notification update');
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                  {item.resolved && (
                    <Chip mode="outlined" compact>
                      Resolved
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Push notification handling
  useEffect(() => {
    // Request notification permissions
    const requestNotificationPermissions = async () => {
      try {
        console.log('Requesting notification permissions for real-time alerts...');
        // In a real app, you would use expo-notifications here
        // const { status } = await Notifications.requestPermissionsAsync();
        // if (status !== 'granted') {
        //   console.log('Notification permissions denied');
        // }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestNotificationPermissions();

    // Listen for new alerts and send push notifications
    const unsubscribe = () => {
      console.log('Setting up real-time alert notifications...');
      // In a real app, you would set up Firebase listeners here
    };

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={{ padding: 16, elevation: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
                Real-Time Operations
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                Live dashboard • Updated {new Date().toLocaleTimeString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <IconButton 
                icon={viewMode === 'grid' ? 'view-grid' : viewMode === 'map' ? 'map' : 'view-list'} 
                onPress={() => {
                  const modes: ('grid' | 'map' | 'list')[] = ['grid', 'map', 'list'];
                  const currentIndex = modes.indexOf(viewMode);
                  const nextIndex = (currentIndex + 1) % modes.length;
                  setViewMode(modes[nextIndex]);
                }}
              />
              <IconButton icon="refresh" onPress={onRefresh} />
            </View>
          </View>
        </Surface>

        {/* Key Metrics */}
        <View style={{ padding: 16 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
            Key Metrics
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            style={{ marginRight: -16 }}
          >
            {renderMetricCard('Active Loads', metrics.activeLoads, 'In progress', 'up', undefined, handleActiveLoadsPress)}
            {renderMetricCard('Available Drivers', metrics.availableDrivers, 'Ready to dispatch', undefined, undefined, handleAvailableDriversPress)}
            {renderMetricCard('On-Time Performance', `${metrics.onTimePerformance.toFixed(1)}%`, 'Last 30 days', 'up', theme.colors.primary)}
            {renderMetricCard('Revenue Today', `$${(metrics.revenueToday / 1000).toFixed(0)}K`, 'vs yesterday', 'up', '#4caf50')}
            {renderMetricCard('Fuel Efficiency', `${metrics.fuelEfficiency} MPG`, 'Fleet average', metrics.fuelEfficiency > 6.5 ? 'up' : 'down')}
            {renderMetricCard('Active Alerts', metrics.alertsCount, 'Requiring attention', undefined, theme.colors.error)}
          </ScrollView>
        </View>

        {/* Live Alerts */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              Live Alerts
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Chip 
                selected={selectedFilter === 'all'}
                onPress={() => setSelectedFilter('all')}
                style={{ marginRight: 8 }}
              >
                All
              </Chip>
              <Chip 
                selected={selectedFilter === 'critical'}
                onPress={() => setSelectedFilter('critical')}
                style={{ marginRight: 8 }}
              >
                Critical
              </Chip>
              <Chip 
                selected={selectedFilter === 'pending'}
                onPress={() => setSelectedFilter('pending')}
              >
                Pending
              </Chip>
            </View>
          </View>

          {filteredAlerts.length === 0 ? (
            <Card style={{ padding: 24, alignItems: 'center' }}>
              <CheckCircle size={48} color={theme.colors.primary} />
              <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center' }}>
                No Active Alerts
              </Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
                Everything is running smoothly
              </Text>
            </Card>
          ) : (
            <FlatList
              data={filteredAlerts}
              renderItem={renderAlert}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Vehicle Locations Map */}
        {viewMode === 'map' && (
          <View style={{ padding: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
              Live Vehicle Tracking
            </Text>
            <Card style={{ height: 400, overflow: 'hidden' }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: 32.7767,
                  longitude: -96.7970,
                  latitudeDelta: 8,
                  longitudeDelta: 8,
                }}
              >
                {vehicleLocations.map((vehicle) => (
                  <Marker
                    key={vehicle.id}
                    coordinate={vehicle.location}
                    title={`${vehicle.vehicleNumber} - ${vehicle.driverName}`}
                    description={`Status: ${vehicle.status} | Speed: ${vehicle.speed} mph`}
                  />
                ))}
              </MapView>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ padding: 16, paddingBottom: 100 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Button 
              mode="contained" 
              icon={iconSource(Truck)}
              style={{ flex: 1, minWidth: 150 }}
              onPress={() => router.push('/(admin)/loads/create')}
            >
              Dispatch Load
            </Button>
            <Button 
              mode="outlined" 
              icon={iconSource(MessageSquare)}
              style={{ flex: 1, minWidth: 150 }}
              onPress={() => console.log('Broadcast alert')}
            >
              Broadcast Alert
            </Button>
            <Button 
              mode="outlined" 
              icon={iconSource(Navigation)}
              style={{ flex: 1, minWidth: 150 }}
              onPress={() => router.push('/(admin)/analytics/route-optimization')}
            >
              Route Optimizer
            </Button>
            <Button 
              mode="outlined" 
              icon={iconSource(BarChart3)}
              style={{ flex: 1, minWidth: 150 }}
              onPress={() => router.push('/(admin)/analytics')}
            >
              Analytics
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RealTimeOperationsDashboard;
