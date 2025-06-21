// waygo-freight/app/(admin)/dispatch/index.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Chip, 
  Button, 
  FAB,
  Menu, 
  Divider, 
  ProgressBar,
  Badge,
  IconButton,
  SegmentedButtons,
  ActivityIndicator,
  useTheme,
  Dialog,
  Portal,
  RadioButton,
  Searchbar,
  Appbar,
  Avatar,
  List
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';

import { useLoad } from '../../../state/loadContext';
import { useFleet } from '../../../state/fleetContext';
import { useAuth } from '../../../state/authContext';
import { Load, Driver, Vehicle } from '../../../types';

import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Activity,
  Settings,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Plus as PlusIcon,
  Filter,
  MoreVertical as MoreVerticalIcon,
  Route as RouteIcon,
  Users,
  Calendar,
  Zap,
  MessageCircle,
  AlertTriangle,
  Navigation,
  Phone,
  TrendingUp
} from '../../../utils/icons';

export default function DispatchDashboard() {
  const theme = useTheme();
  const { loads, loading, error, refreshLoads } = useLoad();
  const { drivers, vehicles } = useFleet();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'distance' | 'revenue'>('deadline');
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [driverAssignmentVisible, setDriverAssignmentVisible] = useState(false);

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const activeLoads = loads?.filter(load => load.status === 'in_transit' || load.status === 'assigned').length;
    const availableDrivers = drivers?.filter(driver => driver.availability === 'available').length;
    const enRouteDrivers = drivers?.filter(driver => driver.availability === 'driving').length;
    const delayedLoads = loads?.filter(load => {
      if (load.status === 'delivered') return false;
      const scheduledTime = new Date(load.origin?.scheduledDate).getTime();
      return Date.now() > scheduledTime;
    }).length;

    return {
      activeLoads,
      availableDrivers,
      enRouteDrivers,
      delayedLoads
    };
  }, [loads, drivers]);

  // Get critical alerts
  const alerts = React.useMemo(() => {
    const delayedLoads = loads?.filter(load => {
      if (load.status === 'delivered') return false;
      const scheduledTime = new Date(load.origin?.scheduledDate).getTime();
      return Date.now() > scheduledTime;
    });

    const unassignedUrgent = loads?.filter(load => 
      load.priority === 'urgent' && !load.assignedDriverId
    );

    return [...delayedLoads, ...unassignedUrgent];
  }, [loads]);

  // Filter and sort loads
  const filteredLoads = React.useMemo(() => {
    let filtered = loads;

    // Search filter
    if (searchQuery) {
      filtered = filtered?.filter(load => 
        load.loadNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.commodity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.origin?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.destination?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered?.filter(load => load.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered?.filter(load => load.priority === priorityFilter);
    }

    // Sort
    const priorityWeights = { urgent: 4, high: 3, normal: 2, low: 1 };
    
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        case 'deadline':
          return new Date(a.origin?.scheduledDate).getTime() - new Date(b.origin?.scheduledDate).getTime();
        case 'distance':
          // Mock distance calculation
          return 0;
        case 'revenue':
          return b.rate - a.rate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [loads, searchQuery, statusFilter, priorityFilter, sortBy]);

  React.useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshLoads, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshLoads]);

  const handleAssignDriver = (driverId: string) => {
    if (selectedLoad) {
      console.log(`Assigning driver ${driverId} to load ${selectedLoad.id}`);
      setDriverAssignmentVisible(false);
      setSelectedLoad(null);
    }
  };

  if (loading) {
    return (
      <View>
        <SafeArea style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 16, textAlign: 'center' }}>Loading dispatch data...</Text>
          </View>
        </SafeArea>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <SafeArea style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ textAlign: 'center', color: theme.colors.error }}>
              Error loading dispatch data: {error}
            </Text>
          </View>
        </SafeArea>
      </View>
    );
  }

  return (
    <View>
      <SafeArea style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Appbar.Header>
          <Appbar.Content title="Dispatch Dashboard" />
          <Appbar.Action
            icon={() => <Zap size={20} color={theme.colors.onSurface} />}
            onPress={() => setAutoRefresh(!autoRefresh)}
          />
        </Appbar.Header>

        <ScrollView style={{ flex: 1, padding: 16 }} refreshControl={
          <RefreshControl refreshing={false} onRefresh={refreshLoads} />
        }>
          {/* Metrics Cards */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Card style={{ flex: 1, minHeight: 80 }}>
              <Card.Content style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 24, color: theme.colors.primary }}>
                  {metrics.activeLoads}
                </Text>
                <Text style={{ opacity: 0.7, textAlign: 'center' }}>Active Loads</Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, minHeight: 80 }}>
              <Card.Content style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#4CAF50' }}>
                  {metrics.availableDrivers}
                </Text>
                <Text style={{ opacity: 0.7, textAlign: 'center' }}>Available</Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, minHeight: 80 }}>
              <Card.Content style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#FF9800' }}>
                  {metrics.enRouteDrivers}
                </Text>
                <Text style={{ opacity: 0.7, textAlign: 'center' }}>En Route</Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, minHeight: 80 }}>
              <Card.Content style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#f44336' }}>
                  {metrics.delayedLoads}
                </Text>
                <Text style={{ opacity: 0.7, textAlign: 'center' }}>Delayed</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Critical Alerts */}
          {alerts.length > 0 && (
            <Card style={{ marginBottom: 16, backgroundColor: '#ffebee' }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <AlertTriangle size={20} color="#f44336" />
                  <Text style={{ fontWeight: 'bold', marginLeft: 8, color: '#f44336' }}>
                    Critical Alerts ({alerts.length})
                  </Text>
                </View>
                {alerts.slice(0, 3).map((load) => (
                  <View key={load.id} style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: '500' }}>
                      {load.loadNumber} - {load.commodity}
                    </Text>
                    <Text style={{ fontSize: 12, opacity: 0.8 }}>
                      {load.origin.address} → {load.destination.address}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Search and Filters */}
          <View style={{ marginBottom: 16 }}>
            <Searchbar
              placeholder="Search loads..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginBottom: 12 }}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip
                  selected={statusFilter === 'all'}
                  onPress={() => setStatusFilter('all')}
                >
                  All Status
                </Chip>
                <Chip
                  selected={statusFilter === 'pending'}
                  onPress={() => setStatusFilter('pending')}
                >
                  Pending
                </Chip>
                <Chip
                  selected={statusFilter === 'assigned'}
                  onPress={() => setStatusFilter('assigned')}
                >
                  Assigned
                </Chip>
                <Chip
                  selected={statusFilter === 'in_transit'}
                  onPress={() => setStatusFilter('in_transit')}
                >
                  In Transit
                </Chip>
                <Chip
                  selected={priorityFilter === 'urgent'}
                  onPress={() => setPriorityFilter('urgent')}
                >
                  Urgent
                </Chip>
              </View>
            </ScrollView>
          </View>

          {/* Load Cards */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 18 }}>
              Loads ({filteredLoads?.length})
            </Text>
            
            {filteredLoads?.map((load) => (
              <Card key={load.id} style={{ marginBottom: 12, elevation: 2 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {load.loadNumber}
                      </Text>
                      <Chip
                        mode="outlined"
                        compact
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: 4,
                          backgroundColor: load.priority === 'urgent' ? '#ffebee' : load.priority === 'high' ? '#fff3e0' : '#f3e5f5'
                        }}
                      >
                        {load.priority.toUpperCase()}
                      </Chip>
                    </View>
                    
                    <Menu
                      visible={false}
                      onDismiss={() => {}}
                      anchor={
                        <IconButton
                          icon={() => <MoreVertical size={20} />}
                          onPress={() => {}}
                        />
                      }
                    >
                      <Menu.Item onPress={() => {}} title="Edit Load" />
                      <Menu.Item 
                        onPress={() => {
                          setSelectedLoad(load);
                          setDriverAssignmentVisible(true);
                        }} 
                        title="Assign Driver" 
                      />
                      <Menu.Item onPress={() => {}} title="View Details" />
                    </Menu>
                  </View>

                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: '500', marginBottom: 4 }}>Route</Text>
                    <Text style={{ fontSize: 12, opacity: 0.8 }}>
                      {load.origin.address}
                    </Text>
                    <Text style={{ fontSize: 12, opacity: 0.8 }}>
                      {load.destination.address}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 12, opacity: 0.7 }}>Commodity</Text>
                      <Text style={{ fontWeight: '500' }}>{load.commodity}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, opacity: 0.7 }}>Rate</Text>
                      <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        ${load.rate.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      mode="outlined"
                      compact
                      style={{
                        backgroundColor: load.status === 'delivered' ? '#e8f5e8' : 
                                       load.status === 'in_transit' ? '#e3f2fd' : '#fff3e0'
                      }}
                    >
                      {load.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                    
                    {load.assignedDriverId && (
                      <Button
                        mode="text"
                        compact
                        onPress={() => router.push(`/(driver)/messages?loadId=${load.id}`)}
                        icon={() => <MessageCircle size={16} />}
                      >
                        Message Driver
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* Driver Assignment Dialog */}
        <Portal>
          <Dialog visible={driverAssignmentVisible} onDismiss={() => setDriverAssignmentVisible(false)}>
            <Dialog.Title>Assign Driver</Dialog.Title>
            <Dialog.Content>
              <Text style={{ marginBottom: 16 }}>
                Select a driver for load {selectedLoad?.loadNumber}
              </Text>
              
              {drivers.filter(driver => driver.availability === 'available').map((driver) => (
                <List.Item
                  key={driver.id}
                  title={driver.name}
                  description={`${driver.phone} • Available`}
                  left={() => <Avatar.Text size={40} label={driver.name.charAt(0)} />}
                  onPress={() => handleAssignDriver(driver.id)}
                />
              ))}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDriverAssignmentVisible(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Quick Actions FAB */}
        <FAB
          icon={() => <PlusIcon size={20} />}
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.primary,
          }}
          onPress={() => router.push('/(admin)/loads/create')}
        />
      </SafeArea>
    </View>
  );
}
