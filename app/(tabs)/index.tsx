import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { Text, Card, Button, useTheme, IconButton, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useAuth } from '../../state/authContext';
import { useLoad } from '../../state/loadContext';
import { useQuickAccess } from '../../state/quickAccessContext';
import { Truck, BarChart, Clock, FileText, Package, Plus, X, Settings } from '../../utils/icons';

interface QuickTile {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
}

const DEFAULT_TILES: QuickTile[] = [
  {
    id: 'shipments',
    title: 'Active Shipments',
    subtitle: 'View all shipments',
    icon: Package,
    route: '/shipments',
    color: '#7C3AED'
  },
  {
    id: 'fleet',
    title: 'Fleet Status',
    subtitle: 'Monitor vehicles',
    icon: Truck,
    route: '/(admin)/fleet',
    color: '#059669'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Performance metrics',
    icon: BarChart,
    route: '/(admin)/analytics',
    color: '#DC2626'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Today\'s deliveries',
    icon: Clock,
    route: '/schedule',
    color: '#EA580C'
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'View reports',
    icon: FileText,
    route: '/(admin)/reports',
    color: '#6B7280'
  }
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loads } = useLoad();
  const { quickTiles, addTileToQuickAccess, removeTileFromQuickAccess } = useQuickAccess();
  const [showAddTiles, setShowAddTiles] = useState(false);

  // Load saved tiles from storage (would be AsyncStorage in real app)
  useEffect(() => {
    // In real app, load from AsyncStorage or user preferences
  }, []);

  const handleActiveLoadsPress = () => {
    // Navigate to map view to show active loads/orders in progress
    router.push('/(admin)/map?filter=orders');
  };

  const handleOnTimePress = () => {
    // Navigate to shipments with delivered filter (on time deliveries)
    router.push('/shipments?filter=delivered');
  };

  const handlePendingPress = () => {
    // Navigate to shipments with pending filter
    router.push('/shipments?filter=pending');
  };

  const updateStats = () => {
    if (loads) {
      const activeLoads = loads.filter(load => 
        load.status === 'assigned' || load.status === 'en_route_pickup' || 
        load.status === 'loaded' || load.status === 'en_route_delivery'
      ).length;
      
      const onTimeDeliveries = Math.round(loads.filter(load => 
        load.status === 'delivered' && load.deliveryDate && new Date(load.deliveryDate) <= new Date()
      ).length / Math.max(loads.length, 1) * 100);
    }
  };

  const activeLoads = useMemo(() => {
    if (loads) {
      return loads.filter(load => 
        load.status === 'assigned' || load.status === 'en_route_pickup' || 
        load.status === 'loaded' || load.status === 'en_route_delivery'
      ).length;
    }
    return 0;
  }, [loads]);
  
  const onTimeDeliveries = useMemo(() => {
    if (loads) {
      return Math.round(loads.filter(load => 
        load.status === 'delivered' && load.deliveryDate && new Date(load.deliveryDate) <= new Date()
      ).length / Math.max(loads.length, 1) * 100);
    }
    return 0;
  }, [loads]);
  
  const pendingLoads = useMemo(() => {
    return loads?.filter(load => load.status === 'pending')?.length || 0;
  }, [loads]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingTop: Math.max(insets.top, 16), // Safe area for notch
          paddingBottom: 100,
          paddingHorizontal: 16 
        }}
      >
        <View style={[styles.header, { marginTop: insets.top > 20 ? 0 : 16 }]}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Welcome to WayGo Freight
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {user?.firstName ? `Good morning, ${user.firstName}` : 'Your logistics dashboard'}
          </Text>
        </View>

        {/* Quick Stats - Now Clickable with Real Data */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard} onPress={handleActiveLoadsPress}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>{activeLoads}</Text>
              <Text variant="bodyMedium">Active Loads</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard} onPress={handleOnTimePress}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#059669' }}>{onTimeDeliveries}%</Text>
              <Text variant="bodyMedium">On Time</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard} onPress={handlePendingPress}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#D97706' }}>{pendingLoads}</Text>
              <Text variant="bodyMedium">Pending</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Access Tiles */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Quick Access</Text>
          <IconButton 
            icon={() => <Plus size={20} color={theme.colors.primary} />}
            onPress={() => router.push('/features')}
            style={{ margin: 0 }}
          />
        </View>

        <View style={styles.tilesContainer}>
          {quickTiles.map((tile) => {
            const IconComponent = tile.icon;
            const translateX = new Animated.Value(0);
            const panGestureEvent = Animated.event(
              [{ nativeEvent: { translationX: translateX } }],
              { useNativeDriver: true }
            );
            const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
              if (event.nativeEvent.oldState === State.ACTIVE) {
                const { translationX } = event.nativeEvent;
                if (translationX < -100) {
                  removeTileFromQuickAccess(tile.id);
                } else {
                  Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                  }).start();
                }
              }
            };
            return (
              <PanGestureHandler
                key={tile.id}
                onGestureEvent={panGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
              >
                <Pressable
                  onPress={() => router.push(tile.route)}
                >
                  <Animated.View
                    style={[
                      styles.quickTile,
                      { borderLeftColor: tile.color, borderLeftWidth: 4 },
                      { transform: [{ translateX }] },
                    ]}
                  >
                    <Card.Content style={styles.tileContent}>
                      <View style={[styles.tileIcon, { backgroundColor: `${tile.color}20` }]}>
                        <IconComponent size={24} color={tile.color} />
                      </View>
                      <View style={styles.tileInfo}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                          {tile.title}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {tile.subtitle}
                        </Text>
                      </View>
                    </Card.Content>
                  </Animated.View>
                </Pressable>
              </PanGestureHandler>
            );
          })}
        </View>

        {/* Recent Activity */}
        <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16, marginTop: 24 }}>
          Recent Activity
        </Text>
        
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text variant="titleMedium">Load #WG-2024-001</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 4 }}>
              Picked up from Chicago, IL
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              2 hours ago
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.activityCard}>
          <Card.Content>
            <Text variant="titleMedium">Driver Check-in</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 4 }}>
              John Smith - Load #WG-2024-003
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              4 hours ago
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={() => router.push('/(admin)/loads/create')}
            style={styles.actionButton}
            icon={() => <Plus size={20} color="#FFFFFF" />}
          >
            New Shipment
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/(admin)/analytics')}
            style={styles.actionButton}
            icon={() => <BarChart size={20} color={theme.colors.primary} />}
          >
            View Analytics
          </Button>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={() => <Plus size={24} color="#FFFFFF" />}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/features')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tilesContainer: {
    marginBottom: 24,
  },
  quickTile: {
    marginBottom: 12,
  },
  tileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tileInfo: {
    flex: 1,
  },
  activityCard: {
    marginBottom: 12,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Above tab bar
  },
});
