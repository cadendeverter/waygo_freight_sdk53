import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  FAB,
  ProgressBar,
  IconButton,
  Menu,
  Divider,
  Surface
} from 'react-native-paper';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Fuel,
  Route,
  RefreshCw,
  Play,
  Square,
  Eye,
  Edit,
  Download,
  Target,
  Zap,
  Award
} from '../../../utils/icons';
import { ConditionalMapView as MapView, ConditionalMarker as Marker } from '../../../components/MapView';

interface RouteOptimization {
  id: string;
  name: string;
  status: 'DRAFT' | 'OPTIMIZING' | 'OPTIMIZED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  loads: RouteLoad[];
  driver?: {
    id: string;
    name: string;
    licenseNumber: string;
  };
  vehicle?: {
    id: string;
    number: string;
    type: string;
  };
  optimization: {
    algorithm: 'DISTANCE' | 'TIME' | 'FUEL' | 'COST' | 'HYBRID';
    constraints: string[];
    originalDistance: number;
    optimizedDistance: number;
    originalDuration: number;
    optimizedDuration: number;
    fuelSavings: number;
    costSavings: number;
    efficiencyGain: number;
  };
  timeline: {
    created: Date;
    optimized?: Date;
    assigned?: Date;
    started?: Date;
    completed?: Date;
  };
  stops: RouteStop[];
  totalRevenue: number;
  estimatedProfit: number;
}

interface RouteLoad {
  id: string;
  loadNumber: string;
  customerId: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  weight: number;
  value: number;
  pickupWindow: { start: Date; end: Date; };
  deliveryWindow: { start: Date; end: Date; };
  specialRequirements: string[];
  revenue: number;
}

interface RouteStop {
  id: string;
  type: 'PICKUP' | 'DELIVERY';
  loadId: string;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number; };
  };
  timeWindow: { start: Date; end: Date; };
  estimatedArrival: Date;
  estimatedDuration: number;
  sequence: number;
  instructions?: string;
}

const mockRoutes: RouteOptimization[] = [
  {
    id: 'route1',
    name: 'Chicago-Midwest Route',
    status: 'OPTIMIZED',
    priority: 'HIGH',
    loads: [
      {
        id: 'load1',
        loadNumber: 'L-2024-001',
        customerId: 'cust1',
        customerName: 'ABC Manufacturing',
        pickupLocation: 'Chicago, IL',
        deliveryLocation: 'Milwaukee, WI',
        weight: 25000,
        value: 50000,
        pickupWindow: { 
          start: new Date(Date.now() + 2 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 4 * 60 * 60 * 1000) 
        },
        deliveryWindow: { 
          start: new Date(Date.now() + 6 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 8 * 60 * 60 * 1000) 
        },
        specialRequirements: ['Appointment Required'],
        revenue: 2500
      },
      {
        id: 'load2',
        loadNumber: 'L-2024-002',
        customerId: 'cust2',
        customerName: 'XYZ Logistics',
        pickupLocation: 'Milwaukee, WI',
        deliveryLocation: 'Madison, WI',
        weight: 15000,
        value: 30000,
        pickupWindow: { 
          start: new Date(Date.now() + 9 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 11 * 60 * 60 * 1000) 
        },
        deliveryWindow: { 
          start: new Date(Date.now() + 12 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 14 * 60 * 60 * 1000) 
        },
        specialRequirements: ['Liftgate Required'],
        revenue: 1800
      }
    ],
    driver: {
      id: 'driver1',
      name: 'John Smith',
      licenseNumber: 'CDL123456789'
    },
    vehicle: {
      id: 'vehicle1',
      number: 'T-101',
      type: 'Dry Van'
    },
    optimization: {
      algorithm: 'HYBRID',
      constraints: ['Time Windows', 'Vehicle Capacity', 'Driver Hours'],
      originalDistance: 485,
      optimizedDistance: 435,
      originalDuration: 540,
      optimizedDuration: 480,
      fuelSavings: 15.2,
      costSavings: 125.50,
      efficiencyGain: 10.3
    },
    timeline: {
      created: new Date(Date.now() - 2 * 60 * 60 * 1000),
      optimized: new Date(Date.now() - 1 * 60 * 60 * 1000),
      assigned: new Date(Date.now() - 30 * 60 * 1000)
    },
    stops: [
      {
        id: 'stop1',
        type: 'PICKUP',
        loadId: 'load1',
        location: {
          name: 'ABC Manufacturing',
          address: '123 Industrial Blvd',
          city: 'Chicago',
          state: 'IL',
          coordinates: { lat: 41.8781, lng: -87.6298 }
        },
        timeWindow: { 
          start: new Date(Date.now() + 2 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 4 * 60 * 60 * 1000) 
        },
        estimatedArrival: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
        estimatedDuration: 45,
        sequence: 1,
        instructions: 'Use dock door 5, appointment required'
      }
    ],
    totalRevenue: 4300,
    estimatedProfit: 1200
  },
  {
    id: 'route2',
    name: 'Texas Triangle Route',
    status: 'OPTIMIZING',
    priority: 'MEDIUM',
    loads: [
      {
        id: 'load3',
        loadNumber: 'L-2024-003',
        customerId: 'cust3',
        customerName: 'Tech Solutions',
        pickupLocation: 'Dallas, TX',
        deliveryLocation: 'Houston, TX',
        weight: 20000,
        value: 75000,
        pickupWindow: { 
          start: new Date(Date.now() + 4 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 6 * 60 * 60 * 1000) 
        },
        deliveryWindow: { 
          start: new Date(Date.now() + 10 * 60 * 60 * 1000), 
          end: new Date(Date.now() + 12 * 60 * 60 * 1000) 
        },
        specialRequirements: ['Temperature Controlled'],
        revenue: 3200
      }
    ],
    optimization: {
      algorithm: 'TIME',
      constraints: ['Time Windows', 'Temperature Control'],
      originalDistance: 245,
      optimizedDistance: 0, // Still optimizing
      originalDuration: 240,
      optimizedDuration: 0, // Still optimizing
      fuelSavings: 0,
      costSavings: 0,
      efficiencyGain: 0
    },
    timeline: {
      created: new Date(Date.now() - 30 * 60 * 1000)
    },
    stops: [],
    totalRevenue: 3200,
    estimatedProfit: 950
  }
];

export default function RouteOptimizationScreen() {
  const theme = useTheme();
  const [routes, setRoutes] = useState<RouteOptimization[]>(mockRoutes);
  const [selectedFilter, setSelectedFilter] = useState<string>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return theme.colors.outline;
      case 'OPTIMIZING': return '#FF9800';
      case 'OPTIMIZED': return '#4CAF50';
      case 'ASSIGNED': return '#2196F3';
      case 'IN_PROGRESS': return '#9C27B0';
      case 'COMPLETED': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit size={20} color={theme.colors.outline} />;
      case 'OPTIMIZING': return <RefreshCw size={20} color="#FF9800" />;
      case 'OPTIMIZED': return <Target size={20} color="#4CAF50" />;
      case 'ASSIGNED': return <Truck size={20} color="#2196F3" />;
      case 'IN_PROGRESS': return <Play size={20} color="#9C27B0" />;
      case 'COMPLETED': return <Award size={20} color="#4CAF50" />;
      default: return <Route size={20} color={theme.colors.outline} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#F44336';
      case 'HIGH': return '#FF9800';
      case 'MEDIUM': return '#2196F3';
      case 'LOW': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  const filteredRoutes = routes.filter(route => {
    switch (selectedFilter) {
      case 'active': return ['DRAFT', 'OPTIMIZING', 'OPTIMIZED', 'ASSIGNED', 'IN_PROGRESS'].includes(route.status);
      case 'optimizing': return route.status === 'OPTIMIZING';
      case 'optimized': return route.status === 'OPTIMIZED';
      case 'assigned': return ['ASSIGNED', 'IN_PROGRESS'].includes(route.status);
      case 'completed': return route.status === 'COMPLETED';
      default: return true;
    }
  });

  const optimizeRoute = (routeId: string) => {
    Alert.alert(
      'Optimize Route',
      'Select optimization algorithm:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Distance', onPress: () => runOptimization(routeId, 'DISTANCE') },
        { text: 'Time', onPress: () => runOptimization(routeId, 'TIME') },
        { text: 'Fuel', onPress: () => runOptimization(routeId, 'FUEL') },
        { text: 'Hybrid', onPress: () => runOptimization(routeId, 'HYBRID') }
      ]
    );
  };

  const runOptimization = (routeId: string, algorithm: string) => {
    setRoutes(prev => prev.map(route =>
      route.id === routeId
        ? { 
            ...route, 
            status: 'OPTIMIZING' as any,
            optimization: { ...route.optimization, algorithm: algorithm as any }
          }
        : route
    ));

    // Simulate optimization process
    setTimeout(() => {
      setRoutes(prev => prev.map(route =>
        route.id === routeId
          ? { 
              ...route, 
              status: 'OPTIMIZED' as any,
              optimization: {
                ...route.optimization,
                optimizedDistance: Math.floor(route.optimization.originalDistance * 0.85),
                optimizedDuration: Math.floor(route.optimization.originalDuration * 0.88),
                fuelSavings: 12.5,
                costSavings: 85.75,
                efficiencyGain: 15.2
              },
              timeline: { ...route.timeline, optimized: new Date() }
            }
          : route
      ));
      Alert.alert('Success', `Route optimized using ${algorithm} algorithm!`);
    }, 3000);
  };

  const assignRoute = (routeId: string) => {
    Alert.alert(
      'Assign Route',
      'Assign this route to a driver and vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            setRoutes(prev => prev.map(route =>
              route.id === routeId
                ? { 
                    ...route, 
                    status: 'ASSIGNED' as any,
                    timeline: { ...route.timeline, assigned: new Date() }
                  }
                : route
            ));
            Alert.alert('Success', 'Route assigned successfully!');
          }
        }
      ]
    );
  };

  const viewRouteDetails = (route: RouteOptimization) => {
    const loadsText = route.loads.map(load => 
      `${load.loadNumber}: ${load.pickupLocation} → ${load.deliveryLocation} ($${load.revenue})`
    ).join('\n');

    Alert.alert(
      `Route: ${route.name}`,
      `Status: ${route.status}
Priority: ${route.priority}
Total Revenue: $${route.totalRevenue.toLocaleString()}
Estimated Profit: $${route.estimatedProfit.toLocaleString()}

${route.driver ? `Driver: ${route.driver.name}` : 'No driver assigned'}
${route.vehicle ? `Vehicle: ${route.vehicle.number} (${route.vehicle.type})` : 'No vehicle assigned'}

Loads:
${loadsText}

Optimization:
Algorithm: ${route.optimization.algorithm}
Distance: ${route.optimization.originalDistance} → ${route.optimization.optimizedDistance || 'TBD'} miles
Duration: ${Math.floor(route.optimization.originalDuration / 60)}h ${route.optimization.originalDuration % 60}m → ${route.optimization.optimizedDuration ? Math.floor(route.optimization.optimizedDuration / 60) + 'h ' + (route.optimization.optimizedDuration % 60) + 'm' : 'TBD'}
Fuel Savings: ${route.optimization.fuelSavings}%
Cost Savings: $${route.optimization.costSavings}
Efficiency Gain: ${route.optimization.efficiencyGain}%`,
      [
        { text: 'OK' },
        route.status === 'DRAFT' ? {
          text: 'Optimize',
          onPress: () => optimizeRoute(route.id)
        } : undefined,
        route.status === 'OPTIMIZED' ? {
          text: 'Assign',
          onPress: () => assignRoute(route.id)
        } : undefined
      ].filter(Boolean) as any
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const createNewRoute = () => {
    Alert.alert('Create Route', 'New route planning form will open in a future update.');
  };

  const exportRoutes = () => {
    Alert.alert('Export Routes', 'Route optimization report exported successfully!');
  };

  // Calculate stats
  const activeRoutes = routes.filter(r => ['DRAFT', 'OPTIMIZING', 'OPTIMIZED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length;
  const optimizingRoutes = routes.filter(r => r.status === 'OPTIMIZING').length;
  const totalSavings = routes.reduce((sum, r) => sum + r.optimization.costSavings, 0);
  const avgEfficiencyGain = routes.filter(r => r.optimization.efficiencyGain > 0).reduce((sum, r) => sum + r.optimization.efficiencyGain, 0) / routes.filter(r => r.optimization.efficiencyGain > 0).length || 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Route Optimization</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={refreshData}
              loading={refreshing}
              icon="refresh"
              compact
            >
              Refresh
            </Button>
            <Button 
              mode="outlined" 
              onPress={exportRoutes}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Route size={24} color="#2196F3" />
              <View>
                <Text variant="headlineMedium">{activeRoutes}</Text>
                <Text variant="bodySmall">Active Routes</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Zap size={24} color="#FF9800" />
              <View>
                <Text variant="headlineMedium">{optimizingRoutes}</Text>
                <Text variant="bodySmall">Optimizing</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <DollarSign size={24} color="#4CAF50" />
              <View>
                <Text variant="headlineMedium">${totalSavings.toFixed(0)}</Text>
                <Text variant="bodySmall">Total Savings</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={24} color="#4CAF50" />
              <View>
                <Text variant="headlineMedium">{avgEfficiencyGain.toFixed(1)}%</Text>
                <Text variant="bodySmall">Avg Efficiency</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All Routes' },
              { key: 'active', label: 'Active' },
              { key: 'optimizing', label: 'Optimizing' },
              { key: 'optimized', label: 'Optimized' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'completed', label: 'Completed' }
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

      {/* Routes List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredRoutes.map(route => (
          <Card key={route.id} style={{ marginBottom: 12 }}>
            <List.Item
              title={route.name}
              description={`${route.loads.length} loads • Revenue: $${route.totalRevenue.toLocaleString()} • Profit: $${route.estimatedProfit.toLocaleString()}`}
              left={(props) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar.Icon 
                    {...props} 
                    icon="routes"
                    style={{ backgroundColor: getStatusColor(route.status) }}
                  />
                  {getStatusIcon(route.status)}
                </View>
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Badge style={{ backgroundColor: getPriorityColor(route.priority) }}>
                    {route.priority}
                  </Badge>
                  <Badge style={{ backgroundColor: getStatusColor(route.status) }}>
                    {route.status}
                  </Badge>
                </View>
              )}
              onPress={() => viewRouteDetails(route)}
            />
            
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              {/* Driver and Vehicle */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Driver: {route.driver?.name || 'Unassigned'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Vehicle: {route.vehicle?.number || 'Unassigned'}
                </Text>
              </View>

              {/* Optimization Results */}
              {route.optimization.optimizedDistance > 0 && (
                <Surface style={{ padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 8 }}>Optimization Results</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Distance Reduction:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text variant="bodySmall">
                        {route.optimization.originalDistance} → {route.optimization.optimizedDistance} mi
                      </Text>
                      <TrendingDown size={16} color="#4CAF50" />
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Fuel Savings:</Text>
                    <Text variant="bodySmall" style={{ color: '#4CAF50' }}>
                      {route.optimization.fuelSavings}%
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Cost Savings:</Text>
                    <Text variant="bodySmall" style={{ color: '#4CAF50' }}>
                      ${route.optimization.costSavings}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="bodySmall">Efficiency Gain:</Text>
                    <Text variant="bodySmall" style={{ color: '#4CAF50' }}>
                      +{route.optimization.efficiencyGain}%
                    </Text>
                  </View>
                </Surface>
              )}

              {/* Progress for optimizing routes */}
              {route.status === 'OPTIMIZING' && (
                <View style={{ marginBottom: 8 }}>
                  <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                    Optimizing route using {route.optimization.algorithm} algorithm...
                  </Text>
                  <ProgressBar indeterminate color="#FF9800" />
                </View>
              )}

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {route.status === 'DRAFT' && (
                  <Button
                    mode="outlined"
                    onPress={() => optimizeRoute(route.id)}
                    style={{ flex: 1 }}
                    icon="target"
                    compact
                  >
                    Optimize
                  </Button>
                )}
                
                {route.status === 'OPTIMIZED' && (
                  <Button
                    mode="outlined"
                    onPress={() => assignRoute(route.id)}
                    style={{ flex: 1 }}
                    icon="truck"
                    compact
                  >
                    Assign
                  </Button>
                )}
                
                <Button
                  mode="text"
                  onPress={() => viewRouteDetails(route)}
                  icon="eye"
                  compact
                >
                  Details
                </Button>
                
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Feature Coming Soon', 'Route map view will be available in a future update.')}
                  icon="map"
                  compact
                >
                  Map
                </Button>
              </View>
            </View>
          </Card>
        ))}
        
        {filteredRoutes.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <Route size={48} color={theme.colors.outline} />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              No Routes Found
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              Create your first optimized route to get started.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="New Route"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={createNewRoute}
      />
    </View>
  );
}
