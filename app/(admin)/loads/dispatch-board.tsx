import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  DollarSign, 
  User, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  Route,
  Navigation
} from '../../../utils/icons';
import { Stack, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAuth } from '../../../state/authContext';
import { useLoad } from '../../../state/loadContext';
import { useFleet } from '../../../state/fleetContext';

const DispatchBoard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { loads, loading, createLoad, updateLoad, assignDriver, updateLoadStatus } = useLoad();
  const { vehicles } = useFleet();

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<string | null>(null);

  // Sample drivers data
  const drivers = [
    {
      id: '1',
      name: 'John Smith',
      phone: '(555) 123-4567',
      availability: 'available',
      currentLocation: 'Dallas, TX',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Mike Johnson',
      phone: '(555) 234-5678',
      availability: 'on_duty',
      currentLocation: 'Houston, TX',
      rating: 4.6
    }
  ];

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalLoads = loads.length;
    const activeLoads = loads.filter(load => 
      ['assigned', 'en_route_pickup', 'at_pickup', 'loaded', 'en_route_delivery', 'at_delivery'].includes(load.status)
    ).length;
    const availableDrivers = drivers.filter(d => d.availability === 'available').length;
    const utilization = vehicles.length > 0 ? (activeLoads / vehicles.length) * 100 : 0;

    return {
      totalLoads,
      activeLoads,
      availableDrivers,
      utilization
    };
  }, [loads, vehicles, drivers]);

  // Filter loads
  const filteredLoads = useMemo(() => {
    return loads.filter(load => {
      const matchesSearch = !searchQuery || 
        load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.origin.facility.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.destination.facility.address.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = selectedFilter === 'all' || load.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [loads, searchQuery, selectedFilter]);

  // Event Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAssignLoad = async (loadId: string) => {
    Alert.alert('Assign Load', 'Assignment functionality would open here');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'assigned': return '#007AFF';
      case 'en_route_pickup': return '#17A2B8';
      case 'at_pickup': return '#28A745';
      case 'loaded': return '#6F42C1';
      case 'en_route_delivery': return '#FD7E14';
      case 'at_delivery': return '#20C997';
      case 'delivered': return '#28A745';
      case 'completed': return '#6C757D';
      case 'cancelled': return '#DC3545';
      default: return '#6C757D';
    }
  };

  // Render Components
  const renderMetricCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.metricCard, { borderTopColor: color }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        {icon}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderLoadCard = ({ item: load }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.loadCard, selectedLoad === load.id && styles.selectedLoad]}
      onPress={() => setSelectedLoad(selectedLoad === load.id ? null : load.id)}
    >
      <View style={styles.loadHeader}>
        <View style={styles.loadInfo}>
          <Text style={styles.loadNumber}>#{load.loadNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(load.status) }]}>
            <Text style={styles.statusText}>{load.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleAssignLoad(load.id)}>
          <MoreVertical size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.routePoint}>
          <MapPin size={16} color="#28A745" />
          <Text style={styles.routeText}>
            {load.origin.facility.address.city}, {load.origin.facility.address.state}
          </Text>
        </View>
        <View style={styles.routeArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        <View style={styles.routePoint}>
          <MapPin size={16} color="#DC3545" />
          <Text style={styles.routeText}>
            {load.destination.facility.address.city}, {load.destination.facility.address.state}
          </Text>
        </View>
      </View>

      <View style={styles.loadDetails}>
        <View style={styles.detailItem}>
          <Package size={16} color="#666" />
          <Text style={styles.detailText}>{load.commodity}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(load.pickupDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <DollarSign size={16} color="#666" />
          <Text style={styles.detailText}>${load.totalCharges?.toLocaleString()}</Text>
        </View>
      </View>

      {selectedLoad === load.id && (
        <View style={styles.expandedContent}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.assignButton]}
              onPress={() => handleAssignLoad(load.id)}
            >
              <User size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Assign</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.routeButton]}
              onPress={() => router.push(`/loads/${load.id}/route`)}
            >
              <Route size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Route</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => router.push(`/loads/${load.id}/track`)}
            >
              <Navigation size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ScreenWrapper>
        <Stack.Screen 
          options={{
            title: 'Dispatch Board',
            headerShown: true,
          }} 
        />

        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Metrics Dashboard */}
          <View style={styles.metricsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderMetricCard({
                title: 'Total Loads',
                value: metrics.totalLoads,
                icon: <Package size={24} color="#007AFF" />,
                color: '#007AFF'
              })}
              {renderMetricCard({
                title: 'Active Loads',
                value: metrics.activeLoads,
                icon: <Truck size={24} color="#28A745" />,
                color: '#28A745'
              })}
              {renderMetricCard({
                title: 'Available Drivers',
                value: metrics.availableDrivers,
                icon: <User size={24} color="#FFA500" />,
                color: '#FFA500'
              })}
              {renderMetricCard({
                title: 'Fleet Utilization',
                value: `${metrics.utilization.toFixed(1)}%`,
                icon: <Truck size={24} color="#17A2B8" />,
                color: '#17A2B8'
              })}
            </ScrollView>
          </View>

          {/* Search and Filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search loads, commodities, cities..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'pending', 'assigned', 'en_route_pickup', 'delivered'].map((filter) => (
                <TouchableOpacity 
                  key={filter}
                  style={[styles.quickFilter, selectedFilter === filter && styles.activeFilter]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
                    {filter.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Loads List */}
          <View style={styles.loadsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Loads ({filteredLoads.length})
              </Text>
              <TouchableOpacity onPress={() => router.push('/loads/create')}>
                <Plus size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredLoads}
              renderItem={renderLoadCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  metricsContainer: {
    paddingVertical: 20,
  },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minWidth: 160,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickFilter: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
  },
  loadsContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  loadCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLoad: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  routeArrow: {
    marginHorizontal: 16,
  },
  arrowText: {
    fontSize: 18,
    color: '#666',
  },
  loadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignButton: {
    backgroundColor: '#007AFF',
  },
  routeButton: {
    backgroundColor: '#28A745',
  },
  trackButton: {
    backgroundColor: '#FFA500',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default DispatchBoard;
