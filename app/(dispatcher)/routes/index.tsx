import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text, Card, Button, useTheme, Searchbar, FAB } from 'react-native-paper';
import { Navigation, MapPin, Truck, Clock } from '../../../utils/icons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Heading from '../../../components/typography/Heading';

const mockRoutes = [
  {
    id: 'RT001',
    name: 'West Coast Express',
    driver: 'John Smith',
    truck: 'T-4521',
    status: 'Active',
    startLocation: 'Los Angeles, CA',
    endLocation: 'Seattle, WA',
    stops: 3,
    totalMiles: 1138,
    estimatedTime: '18h 30m',
    currentLocation: 'Sacramento, CA',
    completedStops: 1,
    loads: ['LD001', 'LD002'],
    startDate: '2024-01-15 06:00',
    estimatedArrival: '2024-01-16 00:30'
  },
  {
    id: 'RT002',
    name: 'Texas Triangle',
    driver: 'Maria Garcia',
    truck: 'T-3387',
    status: 'Planned',
    startLocation: 'Houston, TX',
    endLocation: 'Dallas, TX',
    stops: 2,
    totalMiles: 362,
    estimatedTime: '5h 45m',
    currentLocation: 'Houston, TX',
    completedStops: 0,
    loads: ['LD003'],
    startDate: '2024-01-16 08:00',
    estimatedArrival: '2024-01-16 13:45'
  },
  {
    id: 'RT003',
    name: 'Midwest Run',
    driver: 'David Johnson',
    truck: 'T-2156',
    status: 'Completed',
    startLocation: 'Chicago, IL',
    endLocation: 'Detroit, MI',
    stops: 1,
    totalMiles: 283,
    estimatedTime: '4h 30m',
    currentLocation: 'Detroit, MI',
    completedStops: 1,
    loads: ['LD004', 'LD005'],
    startDate: '2024-01-14 10:00',
    estimatedArrival: '2024-01-14 14:30'
  },
  {
    id: 'RT004',
    name: 'East Coast Corridor',
    driver: 'Sarah Wilson',
    truck: 'T-1893',
    status: 'Delayed',
    startLocation: 'New York, NY',
    endLocation: 'Miami, FL',
    stops: 4,
    totalMiles: 1286,
    estimatedTime: '20h 15m',
    currentLocation: 'Jacksonville, FL',
    completedStops: 3,
    loads: ['LD006'],
    startDate: '2024-01-14 14:00',
    estimatedArrival: '2024-01-15 12:15'
  }
];

export default function RoutesScreen() {
  const theme = useTheme();
  const [routes, setRoutes] = useState(mockRoutes);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.endLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#34C759';
      case 'Planned': return '#007AFF';
      case 'Completed': return theme.colors.outline;
      case 'Delayed': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const getProgressPercentage = (completedStops: number, totalStops: number) => {
    return totalStops > 0 ? (completedStops / totalStops) * 100 : 0;
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Route Management' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <Heading variant="h1">Routes</Heading>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Plan and track delivery routes
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Search */}
        <Searchbar
          placeholder="Search routes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {/* Route Summary */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
              Route Summary
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#34C759' }}>
                  {routes.filter(r => r.status === 'Active').length}
                </Text>
                <Text variant="bodySmall">Active</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#007AFF' }}>
                  {routes.filter(r => r.status === 'Planned').length}
                </Text>
                <Text variant="bodySmall">Planned</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                  {routes.filter(r => r.status === 'Delayed').length}
                </Text>
                <Text variant="bodySmall">Delayed</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.outline }}>
                  {routes.filter(r => r.status === 'Completed').length}
                </Text>
                <Text variant="bodySmall">Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Routes List */}
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredRoutes.map((route) => (
          <Card key={route.id} style={{ marginBottom: 12 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {route.name}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {route.driver} • {route.truck}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: getStatusColor(route.status),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignItems: 'center'
                }}>
                  <Text variant="labelSmall" style={{ color: 'white', fontWeight: 'bold' }}>
                    {route.status}
                  </Text>
                </View>
              </View>

              {/* Route Details */}
              <View style={{ marginVertical: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MapPin size={16} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                    {route.startLocation} → {route.endLocation}
                  </Text>
                </View>
                
                {route.status === 'Active' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Navigation size={16} color={theme.colors.secondary} />
                    <Text variant="bodyMedium" style={{ marginLeft: 8, color: theme.colors.secondary }}>
                      Currently at: {route.currentLocation}
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Bar for Active Routes */}
              {route.status === 'Active' && (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Progress</Text>
                    <Text variant="bodySmall">
                      {route.completedStops}/{route.stops} stops
                    </Text>
                  </View>
                  <View style={{ 
                    height: 6, 
                    backgroundColor: theme.colors.outline, 
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${getProgressPercentage(route.completedStops, route.stops)}%`,
                      backgroundColor: getStatusColor(route.status)
                    }} />
                  </View>
                </View>
              )}

              {/* Route Stats */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Distance
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {route.totalMiles} mi
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Est. Time
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {route.estimatedTime}
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Loads
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {route.loads.length}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  ETA: {new Date(route.estimatedArrival).toLocaleDateString()} {new Date(route.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button mode="outlined" compact onPress={() => {}}>
                    Track
                  </Button>
                  <Button mode="contained" compact onPress={() => {}}>
                    Details
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => {}}
      />
    </ScreenWrapper>
  );
}
