// waygo-freight/app/(admin)/compliance/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, Searchbar, ProgressBar, Badge } from 'react-native-paper';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Truck, User, Calendar } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

// Mock compliance data
const mockComplianceData = [
  {
    id: 'COMP001',
    driverName: 'John Smith',
    driverId: 'DRV001',
    vehicleNumber: 'TRK-001',
    violationType: 'HOS_VIOLATION',
    severity: 'HIGH',
    description: 'Driver exceeded 11-hour driving limit by 45 minutes',
    location: { latitude: 32.7767, longitude: -96.7970, address: 'Dallas, TX' },
    timestamp: '2025-06-16T14:30:00Z',
    status: 'PENDING',
    resolvedAt: null,
    fine: 500,
    notes: 'Driver was unaware of overtime due to traffic delays'
  },
  {
    id: 'COMP002',
    driverName: 'Sarah Johnson',
    driverId: 'DRV002',
    vehicleNumber: 'TRK-003',
    violationType: 'SPEED_VIOLATION',
    severity: 'MEDIUM',
    description: 'Speed exceeded limit by 8 mph in commercial zone',
    location: { latitude: 29.7604, longitude: -95.3698, address: 'Houston, TX' },
    timestamp: '2025-06-15T11:15:00Z',
    status: 'RESOLVED',
    resolvedAt: '2025-06-16T09:00:00Z',
    fine: 250,
    notes: 'Driver completed safety training'
  },
  {
    id: 'COMP003',
    driverName: 'Mike Chen',
    driverId: 'DRV003',
    vehicleNumber: 'TRK-005',
    violationType: 'INSPECTION_OVERDUE',
    severity: 'LOW',
    description: 'Vehicle inspection overdue by 3 days',
    location: { latitude: 30.2672, longitude: -97.7431, address: 'Austin, TX' },
    timestamp: '2025-06-14T08:00:00Z',
    status: 'IN_PROGRESS',
    resolvedAt: null,
    fine: 100,
    notes: 'Inspection scheduled for tomorrow'
  }
];

const complianceStats = {
  totalViolations: 15,
  pendingViolations: 6,
  resolvedViolations: 9,
  totalFines: 2750,
  complianceScore: 87.5
};

export default function AdminComplianceScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [violations, setViolations] = useState(mockComplianceData);
  const [filteredViolations, setFilteredViolations] = useState(mockComplianceData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setViolations(mockComplianceData);
    setFilteredViolations(mockComplianceData);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchViolations();
    }, [fetchViolations])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchViolations();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterViolations(query, statusFilter);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    filterViolations(searchQuery, status);
  };

  const filterViolations = (query: string, status: string | null) => {
    let filtered = violations;
    
    if (query) {
      filtered = filtered.filter(violation => 
        violation.driverName.toLowerCase().includes(query.toLowerCase()) ||
        violation.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
        violation.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status) {
      filtered = filtered.filter(violation => violation.status === status);
    }
    
    setFilteredViolations(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return theme.colors.error;
      case 'MEDIUM':
        return '#FF9500';
      case 'LOW':
        return '#34C759';
      default:
        return theme.colors.outline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF9500';
      case 'IN_PROGRESS':
        return theme.colors.primary;
      case 'RESOLVED':
        return '#34C759';
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStatsCard = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <Heading variant="h3" style={{ marginBottom: 16 }}>Compliance Overview</Heading>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
              {complianceStats.totalViolations}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Violations
            </Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text variant="headlineSmall" style={{ color: '#FF9500', fontWeight: '600' }}>
              {complianceStats.pendingViolations}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Pending
            </Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text variant="headlineSmall" style={{ color: '#34C759', fontWeight: '600' }}>
              {complianceStats.resolvedViolations}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Resolved
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">Compliance Score</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {complianceStats.complianceScore}%
            </Text>
          </View>
          <ProgressBar 
            progress={complianceStats.complianceScore / 100} 
            color={complianceStats.complianceScore > 80 ? '#34C759' : complianceStats.complianceScore > 60 ? '#FF9500' : theme.colors.error}
            style={{ height: 8, borderRadius: 4 }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodyMedium">Total Fines: <Text style={{ fontWeight: '600', color: theme.colors.error }}>${complianceStats.totalFines.toLocaleString()}</Text></Text>
          <Button 
            mode="outlined" 
            compact
            onPress={() => setShowMap(!showMap)}
            icon={() => <MapPin size={16} color={theme.colors.primary} />}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMapView = () => {
    if (!showMap) return null;
    
    return (
      <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ padding: 0 }}>
          <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 31.0,
                longitude: -97.0,
                latitudeDelta: 4.0,
                longitudeDelta: 4.0,
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {filteredViolations.map((violation) => (
                <Marker
                  key={violation.id}
                  coordinate={violation.location}
                  title={violation.violationType.replace('_', ' ')}
                  description={violation.description}
                  pinColor={getSeverityColor(violation.severity)}
                />
              ))}
            </MapView>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderViolation = ({ item }: { item: any }) => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
              {item.violationType.replace('_', ' ')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.description}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getSeverityColor(item.severity), fontSize: 12 }}
              style={{ 
                borderColor: getSeverityColor(item.severity),
                marginBottom: 4
              }}
            >
              {item.severity}
            </Chip>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
              style={{ 
                borderColor: getStatusColor(item.status)
              }}
            >
              {item.status.replace('_', ' ')}
            </Chip>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <User size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
              {item.driverName} • {item.vehicleNumber}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MapPin size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
              {item.location.address}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.error }}>
            Fine: ${item.fine}
          </Text>
          {item.resolvedAt && (
            <Text variant="bodySmall" style={{ color: '#34C759' }}>
              Resolved: {formatDate(item.resolvedAt)}
            </Text>
          )}
        </View>

        {item.notes && (
          <View style={{ backgroundColor: theme.colors.surfaceVariant, padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Notes: {item.notes}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            mode="outlined" 
            compact
            onPress={() => router.push(`/admin/compliance/${item.id}/edit`)}
            style={{ flex: 1 }}
          >
            Edit
          </Button>
          <Button 
            mode="contained" 
            compact
            onPress={() => router.push(`/admin/compliance/${item.id}/details`)}
            style={{ flex: 1 }}
          >
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Compliance' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <Heading variant="h1">Compliance</Heading>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, marginBottom: 16 }}>
          Monitor violations and compliance metrics
        </Text>
        
        <Searchbar
          placeholder="Search violations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ backgroundColor: theme.colors.surfaceVariant, marginBottom: 12 }}
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            mode={statusFilter === null ? "contained" : "outlined"}
            compact
            onPress={() => handleStatusFilter(null)}
            style={{ flex: 1 }}
          >
            All
          </Button>
          <Button 
            mode={statusFilter === 'PENDING' ? "contained" : "outlined"}
            compact
            onPress={() => handleStatusFilter('PENDING')}
            style={{ flex: 1 }}
          >
            Pending
          </Button>
          <Button 
            mode={statusFilter === 'RESOLVED' ? "contained" : "outlined"}
            compact
            onPress={() => handleStatusFilter('RESOLVED')}
            style={{ flex: 1 }}
          >
            Resolved
          </Button>
        </View>
      </View>

      <FlatList
        data={filteredViolations}
        keyExtractor={(item) => item.id}
        renderItem={renderViolation}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            {renderStatsCard()}
            {renderMapView()}
          </>
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <FileText size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
              No violations found
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              {searchQuery ? 'Try adjusting your search' : 'Great compliance record!'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
