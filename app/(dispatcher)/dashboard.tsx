import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Card, Title, Button, FAB, Chip, Avatar, DataTable, Portal, Modal, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadStatus, DriverStatus, VehicleStatus } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface DispatchAlert {
  id: string;
  type: 'delay' | 'breakdown' | 'weather' | 'emergency';
  loadId: string;
  driverId: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface ETAUpdate {
  loadId: string;
  originalETA: Date;
  updatedETA: Date;
  delayReason: string;
  customerId: string;
}

const DispatcherDashboard: React.FC = () => {
  const router = useRouter();
  const { loads, updateLoadStatus, assignDriver, getActiveLoads } = useLoad();
  const { drivers, vehicles, getAvailableDrivers, getActiveVehicles } = useFleet();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'map' | 'board'>('board');
  const [dispatchAlerts, setDispatchAlerts] = useState<DispatchAlert[]>([]);
  const [etaUpdates, setETAUpdates] = useState<ETAUpdate[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const activeLoads = getActiveLoads();
  const availableDrivers = getAvailableDrivers();
  const activeVehicles = getActiveVehicles();

  // Mock dispatch alerts and ETA updates
  useEffect(() => {
    const mockAlerts: DispatchAlert[] = [
      {
        id: 'alert-001',
        type: 'delay',
        loadId: 'load-001',
        driverId: 'driver-001',
        message: 'Traffic delay on I-95, 45 minutes behind schedule',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: false
      },
      {
        id: 'alert-002',
        type: 'breakdown',
        loadId: 'load-002',
        driverId: 'driver-002',
        message: 'Vehicle breakdown - tire blowout, requesting roadside assistance',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        resolved: false
      }
    ];

    const mockETAs: ETAUpdate[] = [
      {
        loadId: 'load-001',
        originalETA: new Date('2024-01-16T10:00:00Z'),
        updatedETA: new Date('2024-01-16T10:45:00Z'),
        delayReason: 'Traffic congestion',
        customerId: 'customer-001'
      }
    ];

    setDispatchAlerts(mockAlerts);
    setETAUpdates(mockETAs);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleQuickDispatch = (loadId: string) => {
    setSelectedLoad(loadId);
    setShowAssignModal(true);
  };

  const handleEmergencyResponse = (alertId: string) => {
    // Handle emergency response
    console.log('Emergency response for alert:', alertId);
  };

  const getStatusColor = (status: LoadStatus | DriverStatus | VehicleStatus) => {
    switch (status) {
      case 'assigned':
      case 'available':
      case 'active':
        return '#4CAF50';
      case 'in_transit':
      case 'driving':
        return '#2196F3';
      case 'delivered':
        return '#8BC34A';
      case 'pending':
      case 'off_duty':
        return '#FF9800';
      case 'maintenance':
      case 'out_of_service':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderDispatchBoard = () => (
    <ScrollView style={styles.container}>
      {/* Critical Alerts */}
      <Card style={styles.alertCard}>
        <Card.Content>
          <Title>🚨 Critical Alerts</Title>
          {dispatchAlerts.filter(alert => !alert.resolved).map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alert.message}</Text>
              </View>
              <View style={styles.alertActions}>
                <Button mode="outlined" compact onPress={() => handleEmergencyResponse(alert.id)}>
                  Respond
                </Button>
                <Text style={styles.alertTime}>
                  {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* ETA Updates */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>⏰ ETA Updates</Title>
          {etaUpdates.map((eta, index) => (
            <View key={index} style={styles.etaItem}>
              <View style={styles.etaInfo}>
                <Text style={styles.etaLoad}>Load #{eta.loadId}</Text>
                <Text style={styles.etaDelay}>
                  Delayed {Math.floor((eta.updatedETA.getTime() - eta.originalETA.getTime()) / 60000)} minutes
                </Text>
                <Text style={styles.etaReason}>{eta.delayReason}</Text>
              </View>
              <Button mode="outlined" compact onPress={() => {}}>
                Notify Customer
              </Button>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Active Loads Dispatch Board */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📋 Active Loads</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Load #</DataTable.Title>
              <DataTable.Title>Driver</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>ETA</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>
            {activeLoads.slice(0, 10).map((load) => (
              <DataTable.Row key={load.id}>
                <DataTable.Cell>{load.loadNumber}</DataTable.Cell>
                <DataTable.Cell>
                  {load.driverId ? drivers.find(d => d.id === load.driverId)?.driverNumber || 'N/A' : 'Unassigned'}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Chip 
                    mode="outlined" 
                    style={[styles.statusChip, { borderColor: getStatusColor(load.status) }]}
                    textStyle={{ color: getStatusColor(load.status) }}
                  >
                    {load.status}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>
                  {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'TBD'}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Button 
                    mode="outlined" 
                    compact 
                    onPress={() => handleQuickDispatch(load.id)}
                  >
                    Manage
                  </Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      {/* Fleet Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🚛 Fleet Status</Title>
          <View style={styles.fleetStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{availableDrivers.length}</Text>
              <Text style={styles.statLabel}>Available Drivers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{activeVehicles.length}</Text>
              <Text style={styles.statLabel}>Active Vehicles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {drivers.filter(d => d.currentStatus === 'driving').length}
              </Text>
              <Text style={styles.statLabel}>On Route</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <View
        style={styles.map}
      >
        {/* Vehicle Markers */}
        {vehicles.filter(v => v.status === 'active').map((vehicle) => (
          <View
            key={vehicle.id}
            style={styles.vehicleMarker}
          >
            <Text>Vehicle</Text>
          </View>
        ))}

        {/* Load Markers */}
        {activeLoads.map((load) => (
          <View
            key={`load-${load.id}`}
            style={styles.loadMarker}
          >
            <Text>Load</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title>Dispatch Dashboard</Title>
        <View style={styles.headerActions}>
          <Button
            mode={selectedView === 'board' ? 'contained' : 'outlined'}
            onPress={() => setSelectedView('board')}
            compact
          >
            Board
          </Button>
          <Button
            mode={selectedView === 'map' ? 'contained' : 'outlined'}
            onPress={() => setSelectedView('map')}
            compact
            style={styles.viewButton}
          >
            Map
          </Button>
        </View>
      </View>

      {/* Content */}
      {selectedView === 'board' ? renderDispatchBoard() : renderMapView()}

      {/* Quick Actions FAB */}
      <FAB
        style={styles.fab}
        icon={() => <Text>Route</Text>}
        onPress={() => router.push('/(admin)/dispatch/optimization')}
        label="Optimize Routes"
      />

      {/* Assignment Modal */}
      <Portal>
        <Modal visible={showAssignModal} onDismiss={() => setShowAssignModal(false)}>
          <Card style={styles.modal}>
            <Card.Content>
              <Title>Assign Driver</Title>
              <Text>Select available driver for Load #{selectedLoad}</Text>
              {availableDrivers.slice(0, 5).map((driver) => (
                <Button
                  key={driver.id}
                  mode="outlined"
                  style={styles.driverOption}
                  onPress={() => {
                    if (selectedLoad) {
                      assignDriver(selectedLoad, driver.id);
                      setShowAssignModal(false);
                    }
                  }}
                >
                  {driver.driverNumber} - {driver.currentStatus}
                </Button>
              ))}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  viewButton: {
    marginLeft: 8,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  alertCard: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#FFF3E0',
  },
  alertItem: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    color: '#666',
    fontSize: 12,
  },
  etaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  etaInfo: {
    flex: 1,
  },
  etaLoad: {
    fontWeight: '600',
    color: '#333',
  },
  etaDelay: {
    color: '#FF5722',
    fontSize: 12,
    marginTop: 2,
  },
  etaReason: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  fleetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  vehicleMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  loadMarker: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 16,
    elevation: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modal: {
    margin: 20,
  },
  driverOption: {
    marginVertical: 4,
  },
});

export default DispatcherDashboard;
