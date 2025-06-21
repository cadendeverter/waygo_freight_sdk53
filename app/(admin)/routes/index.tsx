import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Platform, Linking } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  List, 
  FAB, 
  IconButton, 
  Chip, 
  Searchbar,
  Menu,
  Surface,
  Divider,
  Portal,
  Dialog,
  TextInput
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MapPin, Route, Navigation, Clock, Star, Plus, MoreVertical, Trash2, Edit, ExternalLink } from '../../../utils/icons';

interface CommonRoute {
  id: string;
  name: string;
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  distance: number;
  estimatedTime: number;
  frequency: number;
  lastUsed: Date;
  isFavorite: boolean;
  optimizationData: {
    fuelEfficient: boolean;
    avoidTolls: boolean;
    avoidHighways: boolean;
    preferredStops: string[];
  };
}

interface RouteOptimizationStats {
  totalRoutes: number;
  avgTimeSaved: number;
  fuelSaved: number;
  optimizationsThisMonth: number;
}

export default function RouteOptimizationScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  // State management
  const [commonRoutes, setCommonRoutes] = useState<CommonRoute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<CommonRoute | null>(null);
  const [newRouteName, setNewRouteName] = useState('');
  const [stats, setStats] = useState<RouteOptimizationStats>({
    totalRoutes: 0,
    avgTimeSaved: 0,
    fuelSaved: 0,
    optimizationsThisMonth: 0
  });

  // Mock data for common routes
  useEffect(() => {
    const mockRoutes: CommonRoute[] = [
      {
        id: '1',
        name: 'Dallas to Houston Express',
        origin: {
          address: 'Dallas Distribution Center, Dallas, TX',
          latitude: 32.7767,
          longitude: -96.7970
        },
        destination: {
          address: 'Houston Port Authority, Houston, TX',
          latitude: 29.7604,
          longitude: -95.3698
        },
        distance: 245,
        estimatedTime: 210,
        frequency: 15,
        lastUsed: new Date('2024-06-18'),
        isFavorite: true,
        optimizationData: {
          fuelEfficient: true,
          avoidTolls: false,
          avoidHighways: false,
          preferredStops: ['Huntsville Rest Area', 'Madisonville Fuel Stop']
        }
      },
      {
        id: '2',
        name: 'Austin to San Antonio Circuit',
        origin: {
          address: 'Austin Warehouse, Austin, TX',
          latitude: 30.2672,
          longitude: -97.7431
        },
        destination: {
          address: 'San Antonio Depot, San Antonio, TX',
          latitude: 29.4241,
          longitude: -98.4936
        },
        distance: 80,
        estimatedTime: 90,
        frequency: 8,
        lastUsed: new Date('2024-06-19'),
        isFavorite: false,
        optimizationData: {
          fuelEfficient: true,
          avoidTolls: true,
          avoidHighways: false,
          preferredStops: ['Kyle Truck Stop']
        }
      },
      {
        id: '3',
        name: 'DFW Airport to Fort Worth',
        origin: {
          address: 'DFW Airport Cargo, Irving, TX',
          latitude: 32.8968,
          longitude: -97.0380
        },
        destination: {
          address: 'Fort Worth Industrial District, Fort Worth, TX',
          latitude: 32.7555,
          longitude: -97.3308
        },
        distance: 25,
        estimatedTime: 35,
        frequency: 12,
        lastUsed: new Date('2024-06-20'),
        isFavorite: true,
        optimizationData: {
          fuelEfficient: false,
          avoidTolls: false,
          avoidHighways: false,
          preferredStops: []
        }
      }
    ];

    setCommonRoutes(mockRoutes);
    setStats({
      totalRoutes: mockRoutes.length,
      avgTimeSaved: 18,
      fuelSaved: 1250,
      optimizationsThisMonth: 47
    });
  }, []);

  const filteredRoutes = commonRoutes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.origin.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.destination.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openInMaps = (route: CommonRoute, provider: 'google' | 'apple' = 'google') => {
    const { origin, destination } = route;
    
    let url = '';
    if (provider === 'google' || Platform.OS === 'android') {
      url = `https://www.google.com/maps/dir/${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}`;
    } else if (provider === 'apple' && Platform.OS === 'ios') {
      url = `http://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&dirflg=d`;
    }

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open maps application');
        }
      });
    }
  };

  const optimizeRoute = (route: CommonRoute) => {
    Alert.alert(
      'Route Optimization',
      `Optimizing route: ${route.name}\n\nThis will find the most efficient path considering current traffic, fuel costs, and your preferences.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Optimize', 
          onPress: () => {
            // In production, this would call route optimization API
            Alert.alert('Success', `Route optimized! Estimated savings: 12 minutes and $8 in fuel costs.`);
          }
        }
      ]
    );
  };

  const toggleFavorite = (routeId: string) => {
    setCommonRoutes(routes => 
      routes.map(route => 
        route.id === routeId 
          ? { ...route, isFavorite: !route.isFavorite }
          : route
      )
    );
  };

  const deleteRoute = (routeId: string) => {
    Alert.alert(
      'Delete Route',
      'Are you sure you want to delete this common route?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setCommonRoutes(routes => routes.filter(route => route.id !== routeId));
          }
        }
      ]
    );
  };

  const saveAsCommonRoute = () => {
    if (!newRouteName.trim()) {
      Alert.alert('Error', 'Please enter a route name');
      return;
    }

    // In production, this would save to backend
    Alert.alert('Success', `"${newRouteName}" saved as a common route!`);
    setDialogVisible(false);
    setNewRouteName('');
  };

  const renderStatsCard = (title: string, value: string | number, subtitle: string, icon: any, color: string) => (
    <Card style={{ flex: 1, margin: 4 }}>
      <Card.Content style={{ alignItems: 'center', padding: 12 }}>
        <View style={{ 
          backgroundColor: color + '20', 
          padding: 8, 
          borderRadius: 20, 
          marginBottom: 8 
        }}>
          {React.createElement(icon, { size: 24, color })}
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color }}>
          {value}
        </Text>
        <Text variant="labelMedium" style={{ textAlign: 'center' }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          {subtitle}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderRouteCard = (route: CommonRoute) => (
    <Card key={route.id} style={{ margin: 16, elevation: 2 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>
                {route.name}
              </Text>
              <IconButton
                icon={() => <Star size={20} color={route.isFavorite ? '#FFD700' : theme.colors.outline} />}
                onPress={() => toggleFavorite(route.id)}
                size={20}
              />
              <Menu
                visible={menuVisible[route.id] || false}
                onDismiss={() => setMenuVisible(prev => ({ ...prev, [route.id]: false }))}
                anchor={
                  <IconButton
                    icon={() => <MoreVertical size={20} color={theme.colors.onSurface} />}
                    onPress={() => setMenuVisible(prev => ({ ...prev, [route.id]: true }))}
                    size={20}
                  />
                }
              >
                <Menu.Item
                  leadingIcon={() => <Edit size={16} color={theme.colors.onSurface} />}
                  onPress={() => {
                    setMenuVisible(prev => ({ ...prev, [route.id]: false }));
                    // Edit route functionality
                  }}
                  title="Edit Route"
                />
                <Menu.Item
                  leadingIcon={() => <Trash2 size={16} color={theme.colors.error} />}
                  onPress={() => {
                    setMenuVisible(prev => ({ ...prev, [route.id]: false }));
                    deleteRoute(route.id);
                  }}
                  title="Delete Route"
                />
              </Menu>
            </View>

            {/* Route Details */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <MapPin size={16} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                  From: {route.origin.address}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MapPin size={16} color={theme.colors.error} />
                <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                  To: {route.destination.address}
                </Text>
              </View>
            </View>

            {/* Route Stats */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Chip icon={() => <Route size={16} color={theme.colors.primary} />} compact>
                {route.distance} mi
              </Chip>
              <Chip icon={() => <Clock size={16} color={theme.colors.tertiary} />} compact>
                {Math.floor(route.estimatedTime / 60)}h {route.estimatedTime % 60}m
              </Chip>
              <Chip compact>
                Used {route.frequency}x
              </Chip>
            </View>

            {/* Optimization Tags */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
              {route.optimizationData.fuelEfficient && (
                <Chip mode="outlined" compact style={{ backgroundColor: '#4CAF50' + '20' }}>
                  Fuel Efficient
                </Chip>
              )}
              {route.optimizationData.avoidTolls && (
                <Chip mode="outlined" compact style={{ backgroundColor: '#FF9800' + '20' }}>
                  No Tolls
                </Chip>
              )}
              {route.optimizationData.preferredStops.length > 0 && (
                <Chip mode="outlined" compact style={{ backgroundColor: '#2196F3' + '20' }}>
                  {route.optimizationData.preferredStops.length} Stops
                </Chip>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                mode="contained"
                icon={() => <Navigation size={16} color="#FFFFFF" />}
                onPress={() => openInMaps(route, 'google')}
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 4 }}
              >
                Navigate
              </Button>
              <Button
                mode="outlined"
                icon={() => <Route size={16} color={theme.colors.primary} />}
                onPress={() => optimizeRoute(route)}
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 4 }}
              >
                Optimize
              </Button>
            </View>

            {Platform.OS === 'ios' && (
              <Button
                mode="text"
                icon={() => <ExternalLink size={14} color={theme.colors.primary} />}
                onPress={() => openInMaps(route, 'apple')}
                style={{ marginTop: 8 }}
                contentStyle={{ paddingVertical: 2 }}
              >
                Open in Apple Maps
              </Button>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ 
        backgroundColor: theme.colors.primary,
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
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
              Manage common routes and optimize deliveries
            </Text>
          </View>
          <IconButton
            icon={() => <Plus size={24} color={theme.colors.onPrimary} />}
            onPress={() => setDialogVisible(true)}
          />
        </View>
      </Surface>

      <ScrollView style={{ flex: 1 }}>
        {/* Stats Cards */}
        <View style={{ padding: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
            Optimization Stats
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderStatsCard('Total Routes', stats.totalRoutes, 'Saved routes', Route, theme.colors.primary)}
            {renderStatsCard('Avg Time Saved', `${stats.avgTimeSaved}min`, 'Per route', Clock, '#4CAF50')}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderStatsCard('Fuel Saved', `$${stats.fuelSaved}`, 'This year', Star, '#FF9800')}
            {renderStatsCard('Optimizations', stats.optimizationsThisMonth, 'This month', Navigation, '#2196F3')}
          </View>
        </View>

        <Divider style={{ marginHorizontal: 16 }} />

        {/* Search */}
        <View style={{ padding: 16 }}>
          <Searchbar
            placeholder="Search routes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
            Common Routes ({filteredRoutes.length})
          </Text>
        </View>

        {/* Routes List */}
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(renderRouteCard)
        ) : (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Route size={48} color={theme.colors.outline} />
            <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              No routes found
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first common route'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Route Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Save as Common Route</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Create a new common route from current navigation or enter route details manually.
            </Text>
            <TextInput
              label="Route Name"
              value={newRouteName}
              onChangeText={setNewRouteName}
              mode="outlined"
              placeholder="e.g., Dallas to Houston Express"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={saveAsCommonRoute}>Save Route</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Map View FAB */}
      <FAB
        icon={() => <MapPin size={24} color="#FFFFFF" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => router.push('/(admin)/map')}
      />
    </View>
  );
}
