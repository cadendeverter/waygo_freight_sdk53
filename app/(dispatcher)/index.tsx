import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Searchbar, 
  Menu, 
  IconButton,
  Avatar,
  Divider,
  Portal,
  Dialog,
  Snackbar,
  ProgressBar,
  Badge,
  Surface,
  ActivityIndicator,
  FAB
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Fuel,
  Activity,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Phone,
  MessageSquare,
  Filter,
  RefreshCw,
  Plus,
  MoreVertical,
  Map,
  Calendar,
  Settings
} from '../../utils/icons';

import { useFleetTracking } from '../../state/fleetTrackingContext';
import { useLoad } from '../../state/loadContext';
import { useAuth } from '../../state/authContext';

const { width: screenWidth } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: any;
  color: string;
  action: () => void;
  urgent?: boolean;
}

interface DispatchMetrics {
  activeLoads: number;
  availableDrivers: number;
  unassignedLoads: number;
  criticalAlerts: number;
  onTimeDeliveries: number;
  avgUtilization: number;
}

export default function DispatchDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const {
    vehicles,
    drivers,
    alerts,
    summary,
    loading: trackingLoading,
    acknowledgeAlert,
    updateVehicleStatus,
    refreshData: refreshTracking
  } = useFleetTracking();
  
  const {
    loads,
    loading: loadsLoading,
    assignDriver,
    updateLoadStatus,
    refreshLoads
  } = useLoad();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgent' | 'delayed' | 'available'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DispatchMetrics>({
    activeLoads: 0,
    availableDrivers: 0,
    unassignedLoads: 0,
    criticalAlerts: 0,
    onTimeDeliveries: 0,
    avgUtilization: 0
  });

  // Calculate real-time metrics
  useEffect(() => {
    const activeLoads = loads.filter(l => l.status === 'assigned' || l.status === 'en_route_pickup' || l.status === 'loaded' || l.status === 'en_route_delivery').length;
    const availableDrivers = drivers.filter(d => d.status === 'off_duty').length;
    const unassignedLoads = loads.filter(l => l.status === 'pending').length;
    const criticalAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;
    const completedLoads = loads.filter(l => l.status === 'delivered');
    const onTimeDeliveries = completedLoads.filter(l => {
      // Calculate on-time delivery percentage
      return true; // Simplified for now
    }).length;
    const avgUtilization = summary.totalVehicles > 0 
      ? (summary.activeVehicles / summary.totalVehicles) * 100 
      : 0;

    setMetrics({
      activeLoads,
      availableDrivers,
      unassignedLoads,
      criticalAlerts,
      onTimeDeliveries: completedLoads.length > 0 
        ? Math.round((onTimeDeliveries / completedLoads.length) * 100)
        : 0,
      avgUtilization: Math.round(avgUtilization)
    });
  }, [loads, drivers, alerts, summary]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshTracking(),
        refreshLoads()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'assign_load':
        // Navigate to load assignment
        break;
      case 'emergency_dispatch':
        Alert.alert('Emergency Dispatch', 'Emergency dispatch protocol initiated');
        break;
      case 'route_optimization':
        // Navigate to route optimization
        break;
      case 'driver_communication':
        // Navigate to messaging
        break;
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'assign_load',
      title: 'Assign Load',
      icon: Package,
      color: theme.colors.primary,
      action: () => handleQuickAction('assign_load')
    },
    {
      id: 'emergency_dispatch',
      title: 'Emergency',
      icon: AlertTriangle,
      color: theme.colors.error,
      action: () => handleQuickAction('emergency_dispatch'),
      urgent: true
    },
    {
      id: 'route_optimization',
      title: 'Optimize Routes',
      icon: Navigation,
      color: theme.colors.tertiary,
      action: () => handleQuickAction('route_optimization')
    },
    {
      id: 'driver_communication',
      title: 'Message Drivers',
      icon: MessageSquare,
      color: theme.colors.secondary,
      action: () => handleQuickAction('driver_communication')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return theme.colors.primary;
      case 'idle': return theme.colors.tertiary;
      case 'maintenance': return theme.colors.error;
      case 'offline': return '#666';
      default: return theme.colors.outline;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'high': return '#ff9800';
      case 'medium': return theme.colors.tertiary;
      default: return theme.colors.outline;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.driverName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'urgent':
        return matchesSearch && vehicle.alerts.some(a => !a.acknowledged && a.severity === 'critical');
      case 'delayed':
        return matchesSearch && vehicle.eta && new Date(vehicle.eta.estimatedArrival) < new Date();
      case 'available':
        return matchesSearch && vehicle.status === 'idle';
      default:
        return matchesSearch;
    }
  });

  const renderMetricCard = (title: string, value: number | string, icon: any, trend?: 'up' | 'down', color?: string, onPress?: () => void) => (
    <Card 
      style={{ 
        flex: 1, 
        margin: 4,
        backgroundColor: theme.colors.surface,
        elevation: 2
      }}
      onPress={onPress}
    >
      <Card.Content style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {title}
            </Text>
            <Text variant="headlineSmall" style={{ 
              color: color || theme.colors.onSurface,
              fontWeight: 'bold'
            }}>
              {value}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            {React.createElement(icon, { 
              size: 24, 
              color: color || theme.colors.primary 
            })}
            {trend && React.createElement(
              trend === 'up' ? TrendingUp : TrendingDown,
              { size: 16, color: trend === 'up' ? '#4caf50' : '#f44336' }
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderVehicleCard = (vehicle: any) => (
    <Card key={vehicle.vehicleId} style={{ 
      marginHorizontal: 16, 
      marginVertical: 8,
      backgroundColor: theme.colors.surface,
      elevation: 2
    }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Truck size={20} color={getStatusColor(vehicle.status)} />
              <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: 'bold' }}>
                {vehicle.unitNumber}
              </Text>
              <Chip 
                mode="outlined"
                compact
                style={{ 
                  marginLeft: 8,
                  backgroundColor: getStatusColor(vehicle.status) + '20',
                  borderColor: getStatusColor(vehicle.status)
                }}
              >
                {vehicle.status.toUpperCase()}
              </Chip>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Users size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                {vehicle.driverName || 'No Driver Assigned'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MapPin size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ marginLeft: 8, flex: 1 }}>
                {vehicle.location.address}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Activity size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ marginLeft: 8 }}>
                {vehicle.speed} mph | {vehicle.fuelLevel}% fuel
              </Text>
            </View>

            {vehicle.eta && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                backgroundColor: theme.colors.primaryContainer,
                padding: 8,
                borderRadius: 8,
                marginTop: 8
              }}>
                <Clock size={16} color={theme.colors.onPrimaryContainer} />
                <Text variant="bodySmall" style={{ 
                  marginLeft: 8,
                  color: theme.colors.onPrimaryContainer
                }}>
                  ETA: {new Date(vehicle.eta.estimatedArrival).toLocaleTimeString()} 
                  ({vehicle.eta.remainingMiles} mi)
                </Text>
              </View>
            )}

            {vehicle.alerts.filter(a => !a.acknowledged).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {vehicle.alerts.filter(a => !a.acknowledged).slice(0, 2).map((alert, index) => (
                  <Chip
                    key={index}
                    compact
                    icon={() => <AlertTriangle size={14} color={getAlertColor(alert.severity)} />}
                    style={{
                      marginRight: 4,
                      marginBottom: 4,
                      backgroundColor: getAlertColor(alert.severity) + '20'
                    }}
                    onPress={() => acknowledgeAlert(alert.id)}
                  >
                    {alert.title}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          <Menu
            visible={menuVisible && selectedVehicle === vehicle.vehicleId}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon={MoreVertical}
                onPress={() => {
                  setSelectedVehicle(vehicle.vehicleId);
                  setMenuVisible(true);
                }}
              />
            }
          >
            <Menu.Item
              leadingIcon={Phone}
              title="Call Driver"
              onPress={() => {
                setMenuVisible(false);
                // Implement call functionality
              }}
            />
            <Menu.Item
              leadingIcon={MessageSquare}
              title="Send Message"
              onPress={() => {
                setMenuVisible(false);
                // Implement messaging
              }}
            />
            <Menu.Item
              leadingIcon={Map}
              title="View on Map"
              onPress={() => {
                setMenuVisible(false);
                // Navigate to map view
              }}
            />
            <Divider />
            <Menu.Item
              leadingIcon={Settings}
              title="Update Status"
              onPress={() => {
                setMenuVisible(false);
                // Show status update dialog
              }}
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.colors.primary,
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="headlineSmall" style={{ 
              color: theme.colors.onPrimary,
              fontWeight: 'bold'
            }}>
              Dispatch Center
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>
              Welcome back, {user?.displayName || 'Dispatcher'}
            </Text>
          </View>
          <IconButton
            icon={RefreshCw}
            iconColor={theme.colors.onPrimary}
            onPress={onRefresh}
            disabled={refreshing}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Metrics Cards */}
        <View style={{ padding: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
            Live Operations
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderMetricCard('Active Loads', metrics.activeLoads, Package, undefined, theme.colors.primary)}
            {renderMetricCard('Available Drivers', metrics.availableDrivers, Users, undefined, '#4caf50', () => router.push('/(admin)/map?filter=drivers'))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderMetricCard('Unassigned', metrics.unassignedLoads, AlertTriangle, undefined, '#ff9800')}
            {renderMetricCard('Critical Alerts', metrics.criticalAlerts, XCircle, undefined, theme.colors.error)}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderMetricCard('On-Time %', `${metrics.onTimeDeliveries}%`, CheckCircle, 'up', '#4caf50')}
            {renderMetricCard('Fleet Util.', `${metrics.avgUtilization}%`, Activity, undefined, theme.colors.tertiary)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                mode={action.urgent ? 'contained' : 'outlined'}
                icon={action.icon}
                onPress={action.action}
                style={{
                  margin: 4,
                  backgroundColor: action.urgent ? action.color : 'transparent',
                  borderColor: action.color,
                  minWidth: (screenWidth - 48) / 2 - 8
                }}
                contentStyle={{ paddingVertical: 8 }}
              >
                {action.title}
              </Button>
            ))}
          </View>
        </View>

        {/* Search and Filters */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search vehicles or drivers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 12 }}
          />
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'urgent', label: 'Urgent' },
              { key: 'delayed', label: 'Delayed' },
              { key: 'available', label: 'Available' }
            ].map((filter) => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key as any)}
                style={{ marginRight: 8 }}
              >
                {filter.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Vehicle List */}
        <View style={{ paddingBottom: 100 }}>
          <Text variant="titleMedium" style={{ 
            marginHorizontal: 16, 
            marginBottom: 12, 
            fontWeight: 'bold' 
          }}>
            Fleet Status ({filteredVehicles.length})
          </Text>
          {filteredVehicles.length === 0 ? (
            <Card style={{ margin: 16 }}>
              <Card.Content style={{ alignItems: 'center', padding: 24 }}>
                <Truck size={48} color={theme.colors.outline} />
                <Text variant="titleMedium" style={{ 
                  marginTop: 16, 
                  color: theme.colors.onSurfaceVariant 
                }}>
                  No vehicles found
                </Text>
                <Text variant="bodyMedium" style={{ 
                  marginTop: 8, 
                  color: theme.colors.onSurfaceVariant,
                  textAlign: 'center'
                }}>
                  Check your filters or refresh to see vehicle data
                </Text>
              </Card.Content>
            </Card>
          ) : (
            filteredVehicles.map(renderVehicleCard)
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={Plus}
        label="New Load"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => {
          // Navigate to create load screen
        }}
      />
    </View>
  );
}
