import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme,
  Searchbar,
  List,
  Chip,
  Badge,
  Surface,
  SegmentedButtons,
  Avatar,
  Menu,
  Divider
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Truck, 
  MapPin, 
  Phone,
  Mail,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from '../../../utils/icons';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'on_route' | 'off_duty' | 'maintenance';
  licenseNumber: string;
  licenseExpiry: string;
  currentLoad?: string;
  currentLocation?: string;
  vehicle?: string;
  stats: {
    totalMiles: number;
    onTimeDeliveries: number;
    safetyScore: number;
    totalLoads: number;
  };
  joinDate: string;
}

const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@waygofreight.com',
    phone: '+1 (555) 123-4567',
    status: 'on_route',
    licenseNumber: 'CDL-TX-123456',
    licenseExpiry: '2026-08-15',
    currentLoad: 'WG-2025-001',
    currentLocation: 'Oklahoma City, OK',
    vehicle: 'Truck #101',
    stats: {
      totalMiles: 125000,
      onTimeDeliveries: 94,
      safetyScore: 98,
      totalLoads: 156
    },
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@waygofreight.com',
    phone: '+1 (555) 234-5678',
    status: 'available',
    licenseNumber: 'CDL-TX-789012',
    licenseExpiry: '2025-12-20',
    currentLocation: 'Dallas, TX',
    vehicle: 'Truck #102',
    stats: {
      totalMiles: 89000,
      onTimeDeliveries: 96,
      safetyScore: 99,
      totalLoads: 134
    },
    joinDate: '2024-02-20'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@waygofreight.com',
    phone: '+1 (555) 345-6789',
    status: 'off_duty',
    licenseNumber: 'CDL-TX-345678',
    licenseExpiry: '2026-03-10',
    currentLocation: 'Houston, TX',
    vehicle: 'Truck #103',
    stats: {
      totalMiles: 156000,
      onTimeDeliveries: 92,
      safetyScore: 97,
      totalLoads: 203
    },
    joinDate: '2023-11-10'
  },
  {
    id: '4',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@waygofreight.com',
    phone: '+1 (555) 456-7890',
    status: 'maintenance',
    licenseNumber: 'CDL-TX-901234',
    licenseExpiry: '2025-09-05',
    currentLocation: 'Austin, TX',
    vehicle: 'Truck #104',
    stats: {
      totalMiles: 78000,
      onTimeDeliveries: 98,
      safetyScore: 100,
      totalLoads: 98
    },
    joinDate: '2024-03-15'
  }
];

export default function AdminDriversScreen() {
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    searchBar: {
      flex: 1,
    },
    filterButton: {
      minWidth: 48,
    },
    content: {
      flex: 1,
      padding: 16,
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
    driverCard: {
      marginBottom: 12,
      borderRadius: 12,
    },
    driverHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    driverInfo: {
      marginLeft: 12,
      flex: 1,
    },
    driverName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    driverDetails: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    statusChip: {
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    driverStats: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 8,
    },
    miniStatChip: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    addButton: {
      margin: 16,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'on_route': return '#3B82F6';
      case 'off_duty': return '#6B7280';
      case 'maintenance': return '#EF4444';
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} color="#FFFFFF" />;
      case 'on_route': return <Truck size={16} color="#FFFFFF" />;
      case 'off_duty': return <Clock size={16} color="#FFFFFF" />;
      case 'maintenance': return <XCircle size={16} color="#FFFFFF" />;
      default: return <User size={16} color="#FFFFFF" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredDrivers = mockDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'on_route', label: 'On Route' },
    { value: 'off_duty', label: 'Off Duty' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const totalDrivers = mockDrivers.length;
  const availableDrivers = mockDrivers.filter(d => d.status === 'available').length;
  const onRouteDrivers = mockDrivers.filter(d => d.status === 'on_route').length;
  const avgSafetyScore = Math.round(mockDrivers.reduce((acc, d) => acc + d.stats.safetyScore, 0) / totalDrivers);

  const renderDriverCard = ({ item: driver }: { item: Driver }) => (
    <Card style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <Avatar.Text 
          size={60} 
          label={driver.name.split(' ').map(n => n[0]).join('')}
          style={{ backgroundColor: getStatusColor(driver.status) }}
        />
        
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverDetails}>
            {driver.vehicle} • {driver.currentLocation || 'Unknown location'}
          </Text>
          {driver.currentLoad && (
            <Text style={styles.driverDetails}>
              Current Load: {driver.currentLoad}
            </Text>
          )}
          
          <Chip 
            mode="flat"
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(driver.status) }
            ]}
            textStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
            icon={() => getStatusIcon(driver.status)}
          >
            {formatStatus(driver.status)}
          </Chip>
        </View>
        
        <Menu
          visible={menuVisible === driver.id}
          onDismiss={() => setMenuVisible(null)}
          anchor={
            <Button 
              mode="text" 
              onPress={() => setMenuVisible(driver.id)}
              icon={() => <MoreVertical size={20} color={theme.colors.onSurface} />}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(null);
              router.push(`/(admin)/users/${driver.name.toLowerCase().replace(' ', '')}/details`);
            }} 
            title="View Details" 
            leadingIcon={() => <User size={20} color={theme.colors.onSurface} />}
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(null);
              router.push(`/(admin)/users/${driver.name.toLowerCase().replace(' ', '')}/edit`);
            }} 
            title="Edit Driver" 
            leadingIcon={() => <User size={20} color={theme.colors.onSurface} />}
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(null);
              // Call driver
            }} 
            title="Call Driver" 
            leadingIcon={() => <Phone size={20} color={theme.colors.onSurface} />}
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(null);
              // Email driver
            }} 
            title="Send Email" 
            leadingIcon={() => <Mail size={20} color={theme.colors.onSurface} />}
          />
        </Menu>
      </View>
      
      <View style={styles.driverStats}>
        <Chip mode="outlined" style={styles.miniStatChip}>
          {driver.stats.totalLoads} loads
        </Chip>
        <Chip mode="outlined" style={styles.miniStatChip}>
          {driver.stats.onTimeDeliveries}% on-time
        </Chip>
        <Chip mode="outlined" style={styles.miniStatChip}>
          {driver.stats.safetyScore}% safety
        </Chip>
        <Chip mode="outlined" style={styles.miniStatChip}>
          {(driver.stats.totalMiles / 1000).toFixed(0)}k miles
        </Chip>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Management</Text>
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search drivers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            icon={() => <Search size={20} color={theme.colors.onSurfaceVariant} />}
          />
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.filterButton}
            icon={() => <Filter size={20} color={theme.colors.primary} />}
          />
        </View>

        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={statusOptions}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <User size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {totalDrivers}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
              Total Drivers
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#10B981' + '20' }]}>
            <CheckCircle size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {availableDrivers}
            </Text>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>
              Available
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#3B82F6' + '20' }]}>
            <Truck size={24} color="#3B82F6" />
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {onRouteDrivers}
            </Text>
            <Text style={[styles.statLabel, { color: '#3B82F6' }]}>
              On Route
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <TrendingUp size={24} color={theme.colors.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
              {avgSafetyScore}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSecondaryContainer }]}>
              Avg Safety
            </Text>
          </Surface>
        </View>

        {/* Drivers List */}
        <FlatList
          data={filteredDrivers}
          renderItem={renderDriverCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>

      {/* Add Driver Button */}
      <Button 
        mode="contained" 
        onPress={() => router.push('/(admin)/users/create')}
        style={styles.addButton}
        icon={() => <Plus size={20} color="#FFFFFF" />}
      >
        Add New Driver
      </Button>
    </View>
  );
}
