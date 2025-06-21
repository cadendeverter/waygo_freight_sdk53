import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useAuth } from '../../../state/authContext';
import { Package, Truck, Clock, CheckCircle, AlertTriangle, Users, BarChart3 } from '../../../utils/icons';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface WarehouseActivity {
  id: string;
  type: 'receiving' | 'shipping' | 'inventory_count' | 'cross_dock' | 'maintenance';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  loadId?: string;
  warehouseId: string;
  assignedStaff?: string[];
  startTime: Date;
  estimatedCompletion: Date;
  actualCompletion?: Date;
  itemCount: number;
  description: string;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WarehouseStats {
  totalActivities: number;
  pendingActivities: number;
  inProgressActivities: number;
  completedToday: number;
  delayedActivities: number;
  avgCompletionTime: number;
  utilizationRate: number;
}

const mockWarehouseActivities: WarehouseActivity[] = [
  {
    id: '1',
    type: 'receiving',
    status: 'in_progress',
    priority: 'high',
    loadId: 'LOAD-001',
    warehouseId: 'WH-001',
    assignedStaff: ['John Smith', 'Sarah Jones'],
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() + 1 * 60 * 60 * 1000),
    itemCount: 250,
    description: 'Receiving electronics shipment from Samsung',
    notes: 'Handle with care - fragile items',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '2',
    type: 'shipping',
    status: 'pending',
    priority: 'medium',
    loadId: 'LOAD-002',
    warehouseId: 'WH-001',
    assignedStaff: ['Mike Wilson'],
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() + 5 * 60 * 60 * 1000),
    itemCount: 180,
    description: 'Outbound shipment to Best Buy distribution center',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'cross_dock',
    status: 'completed',
    priority: 'urgent',
    loadId: 'LOAD-003',
    warehouseId: 'WH-002',
    assignedStaff: ['Lisa Brown', 'Tom Davis', 'Alex Chen'],
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() - 6 * 60 * 60 * 1000),
    actualCompletion: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
    itemCount: 320,
    description: 'Cross-dock transfer for Amazon Prime delivery',
    notes: 'Completed ahead of schedule',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'inventory_count',
    status: 'delayed',
    priority: 'low',
    warehouseId: 'WH-001',
    assignedStaff: ['Emily Rodriguez'],
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() - 1 * 60 * 60 * 1000),
    itemCount: 150,
    description: 'Monthly inventory count - Section A',
    notes: 'Delayed due to system issues',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  }
];

export default function WarehouseScreen() {
  const theme = useTheme();
  const { user, isDevMode } = useAuth();
  const [warehouseActivities, setWarehouseActivities] = useState<WarehouseActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (isDevMode || !user?.companyId) {
      setWarehouseActivities(mockWarehouseActivities);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'warehouse_activities'),
      where('companyId', '==', user.companyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          estimatedCompletion: data.estimatedCompletion?.toDate() || new Date(),
          actualCompletion: data.actualCompletion?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as WarehouseActivity;
      });
      setWarehouseActivities(activities);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching warehouse activities:', error);
      setWarehouseActivities(mockWarehouseActivities);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.companyId, isDevMode]);

  const filteredActivities = useMemo(() => {
    return warehouseActivities.filter(activity => {
      const matchesSearch = searchQuery === '' || 
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.loadId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.warehouseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.assignedStaff?.some(staff => staff.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [warehouseActivities, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = warehouseActivities.length;
    const pending = warehouseActivities.filter(a => a.status === 'pending').length;
    const inProgress = warehouseActivities.filter(a => a.status === 'in_progress').length;
    const delayed = warehouseActivities.filter(a => a.status === 'delayed').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = warehouseActivities.filter(a => 
      a.status === 'completed' && 
      a.actualCompletion && 
      a.actualCompletion >= today
    ).length;

    const completedActivities = warehouseActivities.filter(a => a.status === 'completed' && a.actualCompletion);
    const avgCompletionTime = completedActivities.length > 0 
      ? completedActivities.reduce((sum, a) => {
          const duration = (a.actualCompletion!.getTime() - a.startTime.getTime()) / (1000 * 60 * 60); // hours
          return sum + duration;
        }, 0) / completedActivities.length
      : 0;

    const utilizationRate = total > 0 ? ((inProgress + pending) / total) * 100 : 0;

    return {
      totalActivities: total,
      pendingActivities: pending,
      inProgressActivities: inProgress,
      completedToday,
      delayedActivities: delayed,
      avgCompletionTime,
      utilizationRate
    };
  }, [warehouseActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'receiving': return Package;
      case 'shipping': return Truck;
      case 'cross_dock': return Package;
      case 'inventory_count': return BarChart3;
      case 'maintenance': return AlertTriangle;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.primary;
      case 'in_progress': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'delayed': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Loading warehouse operations...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ padding: 16 }}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Warehouse Operations
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Monitor and manage warehouse activities
          </Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search activities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ backgroundColor: theme.colors.surface }}
          />
        </View>

        {/* Stats Cards - 2x2 Grid Layout */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {/* First Row */}
          <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <Package size={24} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.totalActivities}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Activities
                </Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <Clock size={24} color="#FF9800" />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.pendingActivities}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Pending
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Second Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <CheckCircle size={24} color="#4CAF50" />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.completedToday}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Completed Today
                </Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <AlertTriangle size={24} color={theme.colors.error} />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.delayedActivities}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Delayed
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Activities List */}
        <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
            Activities ({filteredActivities.length})
          </Text>

          {filteredActivities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <Card key={activity.id} style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}>
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                    <IconComponent size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                          {activity.description}
                        </Text>
                        <Chip
                          textStyle={{ fontSize: 10 }}
                          style={{ 
                            backgroundColor: getPriorityColor(activity.priority) + '20',
                            height: 24
                          }}
                        >
                          {activity.priority.toUpperCase()}
                        </Chip>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Chip
                          textStyle={{ fontSize: 12 }}
                          style={{ 
                            backgroundColor: getStatusColor(activity.status) + '20',
                            marginRight: 8,
                            height: 28
                          }}
                        >
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </Chip>
                        <Chip
                          textStyle={{ fontSize: 12 }}
                          style={{ 
                            backgroundColor: theme.colors.primaryContainer,
                            height: 28
                          }}
                        >
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </View>

                      <View style={{ marginBottom: 8 }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Warehouse: {activity.warehouseId}
                        </Text>
                        {activity.loadId && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Load: {activity.loadId}
                          </Text>
                        )}
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Items: {activity.itemCount}
                        </Text>
                        {activity.assignedStaff && activity.assignedStaff.length > 0 && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Staff: {activity.assignedStaff.join(', ')}
                          </Text>
                        )}
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Started: {activity.startTime.toLocaleString()}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Expected: {activity.estimatedCompletion.toLocaleString()}
                        </Text>
                        {activity.actualCompletion && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Completed: {activity.actualCompletion.toLocaleString()}
                          </Text>
                        )}
                      </View>

                      {activity.notes && (
                        <Text variant="bodySmall" style={{ 
                          color: theme.colors.onSurfaceVariant,
                          fontStyle: 'italic',
                          marginBottom: 12
                        }}>
                          Notes: {activity.notes}
                        </Text>
                      )}

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button
                          mode="outlined"
                          onPress={() => router.push(`/(admin)/warehouse/activity/${activity.id}`)}
                          style={{ flex: 1 }}
                        >
                          View Details
                        </Button>
                        {activity.status !== 'completed' && (
                          <Button
                            mode="contained"
                            onPress={() => router.push(`/(admin)/warehouse/activity/${activity.id}/edit`)}
                            style={{ flex: 1 }}
                          >
                            Update Status
                          </Button>
                        )}
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}

          {filteredActivities.length === 0 && (
            <Card style={{ backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Package size={48} color={theme.colors.outline} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                  No activities found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  Try adjusting your search or filter criteria
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB for new activity */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => router.push('/(admin)/warehouse/activity/create')}
      />
    </ScreenWrapper>
  );
}
