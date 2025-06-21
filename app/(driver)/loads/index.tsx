import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  List,
  Surface,
  Searchbar,
  FAB,
  IconButton,
  Badge,
  Divider
} from 'react-native-paper';
import {
  Truck,
  MapPin,
  Clock,
  Package,
  DollarSign,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Route,
  Thermometer,
  Scale,
  Plus
} from '../../../utils/icons';
import { useRouter } from 'expo-router';
import { useLoad } from '../../../state/loadContext';
import { useAuth } from '../../../state/authContext';

interface LoadAssignment {
  id: string;
  loadNumber: string;
  status: 'assigned' | 'en_route' | 'at_pickup' | 'picked_up' | 'at_delivery' | 'delivered';
  priority: 'normal' | 'urgent' | 'critical';
  commodity: string;
  weight: number;
  distance: number;
  origin: {
    company: string;
    address: string;
    contact: string;
    phone: string;
    appointmentTime: Date;
  };
  destination: {
    company: string;
    address: string;
    contact: string;
    phone: string;
    appointmentTime: Date;
  };
  specialInstructions?: string;
  temperature?: number;
  hazmat: boolean;
  rate: number;
  estimatedDuration: number;
  driverNotes?: string;
  dispatchContact: {
    name: string;
    phone: string;
  };
}

export default function DriverLoads() {
  const theme = useTheme();
  const router = useRouter();
  const { loads } = useLoad();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Mock driver-specific loads
  const [driverLoads, setDriverLoads] = useState<LoadAssignment[]>([
    {
      id: '1',
      loadNumber: 'WG-2024-001',
      status: 'assigned',
      priority: 'urgent',
      commodity: 'Electronics',
      weight: 24500,
      distance: 842,
      origin: {
        company: 'TechCorp Manufacturing',
        address: '1234 Industrial Blvd, Los Angeles, CA 90015',
        contact: 'Mike Johnson',
        phone: '(555) 123-4567',
        appointmentTime: new Date('2024-01-20T08:00:00')
      },
      destination: {
        company: 'Best Buy Distribution',
        address: '5678 Commerce Dr, Phoenix, AZ 85001',
        contact: 'Sarah Wilson',
        phone: '(555) 987-6543',
        appointmentTime: new Date('2024-01-21T14:00:00')
      },
      specialInstructions: 'Handle with care - fragile electronics. Use lift gate.',
      hazmat: false,
      rate: 2845.50,
      estimatedDuration: 16,
      dispatchContact: {
        name: 'Alex Rodriguez',
        phone: '(555) 456-7890'
      }
    },
    {
      id: '2',
      loadNumber: 'WG-2024-002',
      status: 'en_route',
      priority: 'normal',
      commodity: 'Food Products',
      weight: 42000,
      distance: 1250,
      origin: {
        company: 'Farm Fresh Foods',
        address: '9876 Agriculture Way, Fresno, CA 93650',
        contact: 'Bob Martinez',
        phone: '(555) 234-5678',
        appointmentTime: new Date('2024-01-18T06:00:00')
      },
      destination: {
        company: 'Grocery Hub',
        address: '2468 Market St, Denver, CO 80202',
        contact: 'Lisa Chen',
        phone: '(555) 345-6789',
        appointmentTime: new Date('2024-01-19T12:00:00')
      },
      temperature: 38,
      hazmat: false,
      rate: 3125.00,
      estimatedDuration: 20,
      driverNotes: 'Picked up on time. Temperature holding steady.',
      dispatchContact: {
        name: 'Maria Garcia',
        phone: '(555) 567-8901'
      }
    },
    {
      id: '3',
      loadNumber: 'WG-2024-003',
      status: 'delivered',
      priority: 'normal',
      commodity: 'Building Materials',
      weight: 38750,
      distance: 650,
      origin: {
        company: 'Construction Supply Co',
        address: '1357 Builder Ave, Sacramento, CA 95814',
        contact: 'Tom Brown',
        phone: '(555) 456-7890',
        appointmentTime: new Date('2024-01-15T07:30:00')
      },
      destination: {
        company: 'Home Depot',
        address: '8642 Retail Blvd, Las Vegas, NV 89102',
        contact: 'Jennifer Davis',
        phone: '(555) 678-9012',
        appointmentTime: new Date('2024-01-16T10:00:00')
      },
      hazmat: false,
      rate: 1950.00,
      estimatedDuration: 12,
      driverNotes: 'Delivered early. No issues.',
      dispatchContact: {
        name: 'Chris Taylor',
        phone: '(555) 789-0123'
      }
    }
  ]);

  const filteredLoads = driverLoads.filter(load => {
    const matchesSearch = load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.origin.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.destination.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || load.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return '#2196F3';
      case 'en_route':
        return '#FF9800';
      case 'at_pickup':
        return '#9C27B0';
      case 'picked_up':
        return '#4CAF50';
      case 'at_delivery':
        return '#FF5722';
      case 'delivered':
        return '#4CAF50';
      default:
        return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#F44336';
      case 'urgent':
        return '#FF9800';
      case 'normal':
        return '#4CAF50';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return Clock;
      case 'en_route':
        return Truck;
      case 'at_pickup':
      case 'picked_up':
        return Package;
      case 'at_delivery':
        return MapPin;
      case 'delivered':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Load assignments updated');
    }, 1500);
  };

  const updateLoadStatus = (loadId: string, newStatus: LoadAssignment['status']) => {
    setDriverLoads(prev =>
      prev.map(load =>
        load.id === loadId
          ? { ...load, status: newStatus }
          : load
      )
    );
    Alert.alert('Status Updated', `Load status changed to ${newStatus.replace('_', ' ')}`);
  };

  const contactDispatch = (contact: { name: string; phone: string }) => {
    Alert.alert(
      'Contact Dispatch',
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling', `Dialing ${contact.phone}...`) }
      ]
    );
  };

  const activeLoadsCount = driverLoads.filter(load => 
    ['assigned', 'en_route', 'at_pickup', 'picked_up', 'at_delivery'].includes(load.status)
  ).length;

  const totalEarnings = driverLoads
    .filter(load => load.status === 'delivered')
    .reduce((sum, load) => sum + load.rate, 0);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Driver Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Load Summary</Text>
            
            <View style={styles.statsGrid}>
              <Surface style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Truck size={24} color="#2196F3" />
                </View>
                <Text variant="bodySmall" style={styles.statLabel}>Active Loads</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {activeLoadsCount}
                </Text>
              </Surface>

              <Surface style={styles.statCard}>
                <View style={styles.statIcon}>
                  <CheckCircle size={24} color="#4CAF50" />
                </View>
                <Text variant="bodySmall" style={styles.statLabel}>Completed</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {driverLoads.filter(l => l.status === 'delivered').length}
                </Text>
              </Surface>

              <Surface style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color="#4CAF50" />
                </View>
                <Text variant="bodySmall" style={styles.statLabel}>Earnings</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  ${totalEarnings.toLocaleString()}
                </Text>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* Search and Filters */}
        <Card style={styles.card}>
          <Card.Content>
            <Searchbar
              placeholder="Search loads..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              <Chip
                selected={selectedStatus === null}
                onPress={() => setSelectedStatus(null)}
                style={styles.filterChip}
              >
                All
              </Chip>
              <Chip
                selected={selectedStatus === 'assigned'}
                onPress={() => setSelectedStatus('assigned')}
                style={styles.filterChip}
              >
                Assigned
              </Chip>
              <Chip
                selected={selectedStatus === 'en_route'}
                onPress={() => setSelectedStatus('en_route')}
                style={styles.filterChip}
              >
                En Route
              </Chip>
              <Chip
                selected={selectedStatus === 'delivered'}
                onPress={() => setSelectedStatus('delivered')}
                style={styles.filterChip}
              >
                Delivered
              </Chip>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Load List */}
        {filteredLoads.map(load => (
          <Card key={load.id} style={styles.loadCard}>
            <Card.Content>
              {/* Load Header */}
              <View style={styles.loadHeader}>
                <View style={styles.loadInfo}>
                  <View style={styles.loadTitleRow}>
                    <Text variant="titleMedium" style={styles.loadNumber}>
                      {load.loadNumber}
                    </Text>
                    {load.priority !== 'normal' && (
                      <Badge
                        style={[styles.priorityBadge, { backgroundColor: getPriorityColor(load.priority) }]}
                      >
                        {load.priority.toUpperCase()}
                      </Badge>
                    )}
                  </View>
                  <Text variant="bodyMedium" style={styles.commodity}>
                    {load.commodity} • {load.weight.toLocaleString()} lbs
                  </Text>
                </View>
                
                <Chip
                  icon={() => React.createElement(getStatusIcon(load.status), {
                    size: 16,
                    color: '#fff'
                  })}
                  style={[styles.statusChip, { backgroundColor: getStatusColor(load.status) }]}
                  textStyle={{ color: '#fff' }}
                >
                  {load.status.replace('_', ' ').toUpperCase()}
                </Chip>
              </View>

              {/* Route Information */}
              <View style={styles.routeContainer}>
                <View style={styles.routeStop}>
                  <MapPin size={16} color="#4CAF50" />
                  <View style={styles.stopInfo}>
                    <Text variant="bodyMedium" style={styles.stopLabel}>PICKUP</Text>
                    <Text variant="bodySmall">{load.origin.company}</Text>
                    <Text variant="bodySmall" style={styles.stopAddress}>
                      {load.origin.address}
                    </Text>
                    <Text variant="bodySmall" style={styles.appointmentTime}>
                      Appt: {load.origin.appointmentTime.toLocaleString()}
                    </Text>
                  </View>
                  <IconButton
                    icon={() => <Phone size={16} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Call', `Calling ${load.origin.contact}...`)}
                  />
                </View>

                <View style={styles.routeArrow}>
                  <Route size={16} color="#757575" />
                  <Text variant="bodySmall" style={styles.routeDistance}>
                    {load.distance} mi
                  </Text>
                </View>

                <View style={styles.routeStop}>
                  <MapPin size={16} color="#F44336" />
                  <View style={styles.stopInfo}>
                    <Text variant="bodyMedium" style={styles.stopLabel}>DELIVERY</Text>
                    <Text variant="bodySmall">{load.destination.company}</Text>
                    <Text variant="bodySmall" style={styles.stopAddress}>
                      {load.destination.address}
                    </Text>
                    <Text variant="bodySmall" style={styles.appointmentTime}>
                      Appt: {load.destination.appointmentTime.toLocaleString()}
                    </Text>
                  </View>
                  <IconButton
                    icon={() => <Phone size={16} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Call', `Calling ${load.destination.contact}...`)}
                  />
                </View>
              </View>

              {/* Load Details */}
              <View style={styles.loadDetails}>
                <View style={styles.detailItem}>
                  <DollarSign size={16} color="#4CAF50" />
                  <Text variant="bodySmall">Rate: ${load.rate.toLocaleString()}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={16} color="#FF9800" />
                  <Text variant="bodySmall">Est: {load.estimatedDuration}h</Text>
                </View>
                {load.temperature && (
                  <View style={styles.detailItem}>
                    <Thermometer size={16} color="#2196F3" />
                    <Text variant="bodySmall">Temp: {load.temperature}°F</Text>
                  </View>
                )}
                {load.hazmat && (
                  <View style={styles.detailItem}>
                    <AlertTriangle size={16} color="#F44336" />
                    <Text variant="bodySmall">HAZMAT</Text>
                  </View>
                )}
              </View>

              {/* Special Instructions */}
              {load.specialInstructions && (
                <Surface style={styles.instructionsBox}>
                  <Text variant="bodySmall" style={styles.instructionsLabel}>
                    Special Instructions:
                  </Text>
                  <Text variant="bodySmall">{load.specialInstructions}</Text>
                </Surface>
              )}

              {/* Driver Notes */}
              {load.driverNotes && (
                <Surface style={styles.notesBox}>
                  <Text variant="bodySmall" style={styles.notesLabel}>Notes:</Text>
                  <Text variant="bodySmall">{load.driverNotes}</Text>
                </Surface>
              )}

              <Divider style={styles.divider} />

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={() => router.push(`/(driver)/loads/${load.id}`)}
                  style={styles.primaryButton}
                >
                  View Details
                </Button>
                
                <View style={styles.secondaryButtons}>
                  <IconButton
                    icon={() => <Navigation size={20} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Navigation', 'Opening GPS navigation...')}
                  />
                  <IconButton
                    icon={() => <MessageSquare size={20} color={theme.colors.primary} />}
                    onPress={() => router.push('/(driver)/messages')}
                  />
                  <IconButton
                    icon={() => <Phone size={20} color={theme.colors.primary} />}
                    onPress={() => contactDispatch(load.dispatchContact)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredLoads.length === 0 && (
          <Card style={styles.card}>
            <Card.Content style={styles.emptyState}>
              <Truck size={48} color="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No loads found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                {searchQuery || selectedStatus 
                  ? 'Try adjusting your search or filters' 
                  : 'No load assignments available at this time'
                }
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Contact Dispatch FAB */}
      <FAB
        icon={() => <Phone size={24} color="#fff" />}
        style={styles.fab}
        onPress={() => Alert.alert('Emergency Dispatch', 'Calling emergency dispatch...')}
        label="Emergency"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  loadCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadInfo: {
    flex: 1,
  },
  loadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  loadNumber: {
    fontWeight: 'bold',
  },
  priorityBadge: {
    fontSize: 10,
  },
  commodity: {
    opacity: 0.7,
  },
  statusChip: {
    borderRadius: 12,
  },
  routeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stopAddress: {
    opacity: 0.7,
  },
  appointmentTime: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 4,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  routeDistance: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  loadDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructionsBox: {
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginBottom: 12,
  },
  instructionsLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesBox: {
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    marginRight: 12,
  },
  secondaryButtons: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#F44336',
  },
});
