import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme,
  List,
  Chip,
  Surface,
  ProgressBar,
  Switch,
  Divider,
  SegmentedButtons
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  Truck, 
  Clock, 
  TrendingUp,
  Zap,
  Route,
  DollarSign,
  Fuel,
  Play,
  Settings
} from '../../../utils/icons';

const { width } = Dimensions.get('window');

interface RouteData {
  id: string;
  name: string;
  driver: string;
  vehicle: string;
  stops: number;
  distance: string;
  estimatedTime: string;
  fuelCost: string;
  status: 'optimized' | 'in_progress' | 'completed';
  efficiency: number;
  waypoints: Array<{
    address: string;
    type: 'pickup' | 'delivery';
    timeWindow: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const mockRoutes: RouteData[] = [
  {
    id: '1',
    name: 'Dallas Metro Route',
    driver: 'John Smith',
    vehicle: 'Truck #101',
    stops: 8,
    distance: '156 miles',
    estimatedTime: '6h 45m',
    fuelCost: '$145.50',
    status: 'optimized',
    efficiency: 94,
    waypoints: [
      { address: '123 Main St, Dallas, TX', type: 'pickup', timeWindow: '8:00-9:00 AM', priority: 'high' },
      { address: '456 Oak Ave, Plano, TX', type: 'delivery', timeWindow: '9:30-10:30 AM', priority: 'high' },
      { address: '789 Elm St, Richardson, TX', type: 'delivery', timeWindow: '11:00-12:00 PM', priority: 'medium' },
      { address: '321 Pine St, Garland, TX', type: 'pickup', timeWindow: '1:00-2:00 PM', priority: 'medium' },
    ]
  },
  {
    id: '2',
    name: 'Houston Delivery Run',
    driver: 'Sarah Johnson',
    vehicle: 'Truck #102',
    stops: 12,
    distance: '203 miles',
    estimatedTime: '8h 15m',
    fuelCost: '$189.75',
    status: 'in_progress',
    efficiency: 87,
    waypoints: [
      { address: '555 Commerce St, Houston, TX', type: 'pickup', timeWindow: '7:00-8:00 AM', priority: 'high' },
      { address: '777 Industrial Blvd, Pasadena, TX', type: 'delivery', timeWindow: '8:30-9:30 AM', priority: 'high' },
      { address: '999 Business Park Dr, Sugar Land, TX', type: 'delivery', timeWindow: '10:00-11:00 AM', priority: 'medium' },
    ]
  }
];

export default function RouteOptimizationScreen() {
  const theme = useTheme();
  
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [optimizationMode, setOptimizationMode] = useState('time');
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [trafficEnabled, setTrafficEnabled] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    routeCard: {
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    routeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    routeInfo: {
      flex: 1,
    },
    routeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    routeDetails: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    routeStats: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 8,
    },
    efficiencyBar: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    waypointItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    waypointInfo: {
      marginLeft: 12,
      flex: 1,
    },
    waypointAddress: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    waypointTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    priorityChip: {
      marginLeft: 8,
    },
    settingsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    optimizeButton: {
      marginTop: 16,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#059669';
      default: return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return theme.colors.outline;
    }
  };

  const getWaypointIcon = (type: string) => {
    return type === 'pickup' ? 
      <MapPin size={20} color={theme.colors.primary} /> : 
      <Navigation size={20} color={theme.colors.secondary} />;
  };

  const optimizationOptions = [
    { value: 'time', label: 'Time' },
    { value: 'distance', label: 'Distance' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'cost', label: 'Cost' }
  ];

  const totalRoutes = mockRoutes.length;
  const optimizedRoutes = mockRoutes.filter(r => r.status === 'optimized').length;
  const avgEfficiency = Math.round(mockRoutes.reduce((acc, r) => acc + r.efficiency, 0) / totalRoutes);
  const totalSavings = '$2,450';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button 
          mode="text" 
          onPress={() => router.back()}
          icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
          style={{ marginRight: 8 }}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={{ flex: 1, color: theme.colors.onSurface }}>
          Route Optimization
        </Text>
        <Button 
          mode="outlined" 
          onPress={() => {}}
          icon={() => <Settings size={20} color={theme.colors.primary} />}
          compact
        >
          Settings
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {/* Overview Stats */}
        <View style={styles.statsRow}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Route size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {totalRoutes}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
              Active Routes
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#10B981' + '20' }]}>
            <Zap size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {optimizedRoutes}
            </Text>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>
              Optimized
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <TrendingUp size={24} color={theme.colors.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
              {avgEfficiency}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSecondaryContainer }]}>
              Avg Efficiency
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#F59E0B' + '20' }]}>
            <DollarSign size={24} color="#F59E0B" />
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {totalSavings}
            </Text>
            <Text style={[styles.statLabel, { color: '#F59E0B' }]}>
              Monthly Savings
            </Text>
          </Surface>
        </View>

        {/* Optimization Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Optimization Settings</Text>
            
            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              Optimize For
            </Text>
            <SegmentedButtons
              value={optimizationMode}
              onValueChange={setOptimizationMode}
              buttons={optimizationOptions}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.settingsRow}>
              <Text variant="bodyLarge">Auto-optimize new routes</Text>
              <Switch
                value={autoOptimize}
                onValueChange={setAutoOptimize}
              />
            </View>

            <View style={styles.settingsRow}>
              <Text variant="bodyLarge">Real-time traffic data</Text>
              <Switch
                value={trafficEnabled}
                onValueChange={setTrafficEnabled}
              />
            </View>

            <Button 
              mode="contained" 
              onPress={() => {}}
              style={styles.optimizeButton}
              icon={() => <Zap size={20} color="#FFFFFF" />}
            >
              Optimize All Routes
            </Button>
          </Card.Content>
        </Card>

        {/* Routes List */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Current Routes</Text>
            
            {mockRoutes.map((route) => (
              <Card 
                key={route.id}
                style={[
                  styles.routeCard,
                  selectedRoute?.id === route.id && {
                    borderColor: theme.colors.primary
                  }
                ]}
                onPress={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <Text style={styles.routeDetails}>
                      {route.driver} • {route.vehicle}
                    </Text>
                  </View>
                  
                  <Chip 
                    mode="flat"
                    style={{ backgroundColor: getStatusColor(route.status) }}
                    textStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                  >
                    {route.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>

                <View style={styles.efficiencyBar}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Efficiency</Text>
                    <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                      {route.efficiency}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={route.efficiency / 100} 
                    color={route.efficiency >= 90 ? '#10B981' : route.efficiency >= 75 ? '#F59E0B' : '#EF4444'}
                  />
                </View>

                <View style={styles.routeStats}>
                  <Chip mode="outlined" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                    {route.stops} stops
                  </Chip>
                  <Chip mode="outlined" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                    {route.distance}
                  </Chip>
                  <Chip mode="outlined" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                    {route.estimatedTime}
                  </Chip>
                  <Chip mode="outlined" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                    {route.fuelCost}
                  </Chip>
                </View>

                {selectedRoute?.id === route.id && (
                  <>
                    <Divider style={{ marginHorizontal: 16, marginVertical: 8 }} />
                    <Text variant="titleMedium" style={{ marginHorizontal: 16, marginBottom: 8, color: theme.colors.onSurface }}>
                      Waypoints
                    </Text>
                    {route.waypoints.map((waypoint, index) => (
                      <View key={index} style={styles.waypointItem}>
                        {getWaypointIcon(waypoint.type)}
                        <View style={styles.waypointInfo}>
                          <Text style={styles.waypointAddress}>{waypoint.address}</Text>
                          <Text style={styles.waypointTime}>
                            {waypoint.timeWindow} • {waypoint.type}
                          </Text>
                        </View>
                        <Chip 
                          mode="outlined" 
                          style={[
                            styles.priorityChip,
                            { backgroundColor: getPriorityColor(waypoint.priority) + '20' }
                          ]}
                          textStyle={{ color: getPriorityColor(waypoint.priority) }}
                        >
                          {waypoint.priority}
                        </Chip>
                      </View>
                    ))}
                    
                    <View style={{ flexDirection: 'row', gap: 12, margin: 16 }}>
                      <Button 
                        mode="outlined" 
                        style={{ flex: 1 }}
                        icon={() => <Navigation size={16} color={theme.colors.primary} />}
                      >
                        View Map
                      </Button>
                      <Button 
                        mode="contained" 
                        style={{ flex: 1 }}
                        icon={() => <Play size={16} color="#FFFFFF" />}
                      >
                        Start Route
                      </Button>
                    </View>
                  </>
                )}
              </Card>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
