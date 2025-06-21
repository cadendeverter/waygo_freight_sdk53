import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useLoad } from '../../../state/loadContext';
import { useFleet } from '../../../state/fleetContext';
import { useAuth } from '../../../state/authContext';
import { MapPin, Truck, Clock, DollarSign, User } from '../../../utils/icons';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface DispatchAssignment {
  id: string;
  loadId: string;
  driverId?: string;
  vehicleId?: string;
  status: 'unassigned' | 'assigned' | 'in_transit' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  pickupDate: Date;
  deliveryDate: Date;
  distance: number;
  estimatedRevenue: number;
}

export default function DispatchScreen() {
  const theme = useTheme();
  const { loads, refreshLoads } = useLoad();
  const { vehicles, drivers } = useFleet();
  const { user, isDevMode } = useAuth();
  
  const [assignments, setAssignments] = useState<DispatchAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for dev mode
  const mockAssignments: DispatchAssignment[] = [
    {
      id: '1',
      loadId: 'LD-2024-001',
      driverId: 'DRV-001',
      vehicleId: 'VEH-001',
      status: 'assigned',
      priority: 'high',
      pickupDate: new Date('2024-01-15T08:00:00'),
      deliveryDate: new Date('2024-01-16T17:00:00'),
      distance: 485,
      estimatedRevenue: 2850
    },
    {
      id: '2',
      loadId: 'LD-2024-002',
      status: 'unassigned',
      priority: 'urgent',
      pickupDate: new Date('2024-01-15T14:00:00'),
      deliveryDate: new Date('2024-01-17T12:00:00'),
      distance: 720,
      estimatedRevenue: 4200
    },
    {
      id: '3',
      loadId: 'LD-2024-003',
      driverId: 'DRV-003',
      vehicleId: 'VEH-003',
      status: 'in_transit',
      priority: 'medium',
      pickupDate: new Date('2024-01-14T09:00:00'),
      deliveryDate: new Date('2024-01-15T18:00:00'),
      distance: 320,
      estimatedRevenue: 1950
    }
  ];

  useEffect(() => {
    if (isDevMode) {
      // Use mock data for dev mode
      setAssignments(mockAssignments);
      setLoading(false);
      return;
    }

    // Production mode - real Firebase data
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'dispatch_assignments'),
        where('companyId', '==', user?.companyId),
        orderBy('pickupDate', 'asc')
      ),
      (snapshot) => {
        const assignmentData: DispatchAssignment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          assignmentData.push({
            id: doc.id,
            loadId: data.loadId,
            driverId: data.driverId,
            vehicleId: data.vehicleId,
            status: data.status,
            priority: data.priority,
            pickupDate: data.pickupDate?.toDate() || new Date(),
            deliveryDate: data.deliveryDate?.toDate() || new Date(),
            distance: data.distance || 0,
            estimatedRevenue: data.estimatedRevenue || 0
          });
        });
        setAssignments(assignmentData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching dispatch assignments:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.companyId, isDevMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isDevMode) {
      // Simulate refresh delay for dev mode
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } else {
      await refreshLoads();
      setRefreshing(false);
    }
  };

  const assignDriver = async (assignmentId: string, driverId: string, vehicleId: string) => {
    if (isDevMode) {
      // Update local state for dev mode
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, driverId, vehicleId, status: 'assigned' as const }
          : assignment
      ));
      return;
    }

    // Production mode - update Firebase
    try {
      await updateDoc(doc(db, 'dispatch_assignments', assignmentId), {
        driverId,
        vehicleId,
        status: 'assigned',
        assignedAt: new Date(),
        assignedBy: user?.id
      });
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return '#F44336';
      case 'assigned': return '#FF9800';
      case 'in_transit': return '#2196F3';
      case 'completed': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const filteredAssignments = assignments.filter(assignment => 
    assignment.loadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.driverId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading dispatch assignments...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <MapPin size={32} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
                Dispatch Board
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Manage load assignments and routing
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder="Search by load ID or driver..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          {/* Stats Summary */}
          <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#F44336' }}>
                  {filteredAssignments.filter(a => a.status === 'unassigned').length}
                </Text>
                <Text variant="bodySmall">Unassigned</Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {filteredAssignments.filter(a => a.status === 'assigned').length}
                </Text>
                <Text variant="bodySmall">Assigned</Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#2196F3' }}>
                  {filteredAssignments.filter(a => a.status === 'in_transit').length}
                </Text>
                <Text variant="bodySmall">In Transit</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Assignment Cards */}
          {filteredAssignments.map((assignment) => {
            const assignedDriver = drivers.find(d => d.id === assignment.driverId);
            const assignedVehicle = vehicles.find(v => v.id === assignment.vehicleId);
            
            return (
              <Card key={assignment.id} style={{ marginBottom: 16 }} mode="elevated">
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {assignment.loadId}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <Chip 
                          mode="outlined"
                          textStyle={{ fontSize: 11 }}
                          style={{ 
                            backgroundColor: getPriorityColor(assignment.priority) + '20',
                            borderColor: getPriorityColor(assignment.priority)
                          }}
                        >
                          {assignment.priority.toUpperCase()}
                        </Chip>
                        <Chip 
                          mode="outlined"
                          textStyle={{ fontSize: 11 }}
                          style={{ 
                            backgroundColor: getStatusColor(assignment.status) + '20',
                            borderColor: getStatusColor(assignment.status)
                          }}
                        >
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        ${assignment.estimatedRevenue.toLocaleString()}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {assignment.distance} miles
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Clock size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                      Pickup: {assignment.pickupDate.toLocaleDateString()} {assignment.pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Clock size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                      Delivery: {assignment.deliveryDate.toLocaleDateString()} {assignment.deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  {assignment.status !== 'unassigned' && (
                    <View style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <User size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ marginLeft: 8 }}>
                          Driver: {assignedDriver?.name || 'Unknown'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Truck size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ marginLeft: 8 }}>
                          Vehicle: {assignedVehicle?.number || 'Unknown'}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                    {assignment.status === 'unassigned' && (
                      <Button 
                        mode="contained"
                        onPress={() => router.push(`/(admin)/operations/assign/${assignment.id}`)}
                      >
                        Assign Driver
                      </Button>
                    )}
                    <Button 
                      mode="outlined"
                      onPress={() => router.push(`/(admin)/loads/${assignment.loadId}`)}
                    >
                      View Details
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            );
          })}

          {filteredAssignments.length === 0 && (
            <Card mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
                <MapPin size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center' }}>
                  No assignments found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {searchQuery ? 'Try adjusting your search' : 'All loads are currently assigned'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => router.push('/(admin)/loads/create')}
      />
    </ScreenWrapper>
  );
}
