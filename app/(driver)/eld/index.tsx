import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  FAB,
  IconButton,
  Divider,
  Surface,
  ProgressBar,
  Dialog,
  Portal,
  List,
  TextInput,
  RadioButton
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import { 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  StopCircle,
  Play,
  Pause,
  Calendar,
  FileText,
  Settings,
  Wifi,
  WifiOff
} from '../../../utils/icons';

type HOSStatus = 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty';

interface HOSData {
  currentStatus: HOSStatus;
  driveTime: number; // hours
  onDutyTime: number; // hours
  shiftTime: number; // hours
  cycleTime: number; // hours
  statusStartTime: Date;
  remainingDriveTime: number;
  remainingOnDutyTime: number;
  nextBreakDue: Date | null;
}

interface ELDEvent {
  id: string;
  timestamp: Date;
  eventType: 'duty_status_change' | 'driver_login' | 'engine_on' | 'engine_off' | 'location_update' | 'diagnostic' | 'malfunction';
  dutyStatus?: HOSStatus;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  odometer?: number;
  engineHours?: number;
  remarks?: string;
  editRequest?: boolean;
  coDriverApproval?: boolean;
}

interface ELDMalfunction {
  id: string;
  code: string;
  description: string;
  severity: 'warning' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

interface ELDDiagnostic {
  id: string;
  event: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
}

export default function ELDInterface() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [editRequestDialogVisible, setEditRequestDialogVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<HOSStatus>('off_duty');
  const [editReason, setEditReason] = useState('');
  const [deviceConnected, setDeviceConnected] = useState(true);
  
  // Mock HOS data - in production this would come from the ELD device
  const [hosData, setHosData] = useState<HOSData>({
    currentStatus: 'off_duty',
    driveTime: 7.5,
    onDutyTime: 9.2,
    shiftTime: 12.8,
    cycleTime: 45.3,
    statusStartTime: new Date(),
    remainingDriveTime: 3.5,
    remainingOnDutyTime: 4.8,
    nextBreakDue: new Date(Date.now() + 2 * 60 * 60 * 1000)
  });

  // Mock recent events
  const [recentEvents, setRecentEvents] = useState<ELDEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      eventType: 'duty_status_change',
      dutyStatus: 'off_duty',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY'
      },
      odometer: 125890,
      engineHours: 3245.5
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      eventType: 'engine_off',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY'
      },
      odometer: 125890,
      engineHours: 3245.5
    }
  ]);

  // Mock malfunctions and diagnostics
  const [malfunctions, setMalfunctions] = useState<ELDMalfunction[]>([
    {
      id: '1',
      code: 'M001',
      description: 'ELD Synchronization Issue',
      severity: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: false
    }
  ]);

  const [diagnostics, setDiagnostics] = useState<ELDDiagnostic[]>([
    {
      id: '1',
      event: 'Data Recording',
      description: 'Unable to record required data elements',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      acknowledged: false
    }
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: HOSStatus) => {
    switch (status) {
      case 'off_duty':
        return '#4CAF50';
      case 'sleeper_berth':
        return '#2196F3';
      case 'driving':
        return '#FF9800';
      case 'on_duty':
        return '#F44336';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: HOSStatus) => {
    switch (status) {
      case 'off_duty':
        return StopCircle;
      case 'sleeper_berth':
        return Pause;
      case 'driving':
        return Truck;
      case 'on_duty':
        return Play;
      default:
        return Clock;
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (newStatus: HOSStatus) => {
    setSelectedStatus(newStatus);
    setStatusDialogVisible(true);
  };

  const confirmStatusChange = () => {
    setHosData(prev => ({
      ...prev,
      currentStatus: selectedStatus,
      statusStartTime: new Date()
    }));
    
    // Add event to recent events
    const newEvent: ELDEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'duty_status_change',
      dutyStatus: selectedStatus,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Current Location'
      },
      odometer: 125890,
      engineHours: 3245.5
    };
    
    setRecentEvents(prev => [newEvent, ...prev]);
    setStatusDialogVisible(false);
    
    Alert.alert('Status Updated', `Duty status changed to ${selectedStatus.replace('_', ' ')}`);
  };

  const requestEdit = () => {
    if (!editReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the edit request');
      return;
    }

    Alert.alert('Edit Request Submitted', 'Your edit request has been submitted for approval');
    setEditRequestDialogVisible(false);
    setEditReason('');
  };

  const acknowledgeEvent = (eventId: string) => {
    setDiagnostics(prev => 
      prev.map(d => d.id === eventId ? { ...d, acknowledged: true } : d)
    );
  };

  const resolveEvent = (eventId: string) => {
    setMalfunctions(prev => 
      prev.map(m => m.id === eventId ? { ...m, resolved: true } : m)
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ELD Connection Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.connectionHeader}>
              <View style={styles.connectionInfo}>
                {deviceConnected ? <Wifi size={24} color="#4CAF50" /> : <WifiOff size={24} color="#F44336" />}
                <Text variant="titleMedium" style={[styles.connectionText, { color: deviceConnected ? '#4CAF50' : '#F44336' }]}>
                  ELD {deviceConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              <IconButton
                icon={() => <Settings size={20} color={theme.colors.onSurface} />}
                onPress={() => router.push('/(driver)/eld/settings')}
              />
            </View>
            {deviceConnected && (
              <Text variant="bodySmall" style={styles.deviceInfo}>
                Device: WayGo ELD Pro • Serial: WG-2024-001 • Firmware: v2.4.1
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Current HOS Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="titleLarge">Hours of Service Status</Text>
              <Chip 
                icon={() => React.createElement(getStatusIcon(hosData.currentStatus), { size: 16, color: '#fff' })}
                style={[styles.statusChip, { backgroundColor: getStatusColor(hosData.currentStatus) }]}
                textStyle={{ color: '#fff' }}
              >
                {hosData.currentStatus.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.statusDuration}>
              Current status for: {Math.floor((Date.now() - hosData.statusStartTime.getTime()) / (1000 * 60))} minutes
            </Text>

            <Divider style={styles.divider} />

            {/* HOS Times */}
            <View style={styles.hosTimesGrid}>
              <View style={styles.hosTimeItem}>
                <Text variant="bodySmall" style={styles.hosTimeLabel}>Drive Time</Text>
                <Text variant="titleMedium">{formatTime(hosData.driveTime)}</Text>
                <ProgressBar progress={hosData.driveTime / 11} style={styles.progressBar} />
                <Text variant="bodySmall">Remaining: {formatTime(hosData.remainingDriveTime)}</Text>
              </View>

              <View style={styles.hosTimeItem}>
                <Text variant="bodySmall" style={styles.hosTimeLabel}>On Duty Time</Text>
                <Text variant="titleMedium">{formatTime(hosData.onDutyTime)}</Text>
                <ProgressBar progress={hosData.onDutyTime / 14} style={styles.progressBar} />
                <Text variant="bodySmall">Remaining: {formatTime(hosData.remainingOnDutyTime)}</Text>
              </View>

              <View style={styles.hosTimeItem}>
                <Text variant="bodySmall" style={styles.hosTimeLabel}>Shift Time</Text>
                <Text variant="titleMedium">{formatTime(hosData.shiftTime)}</Text>
                <ProgressBar progress={hosData.shiftTime / 14} style={styles.progressBar} />
              </View>

              <View style={styles.hosTimeItem}>
                <Text variant="bodySmall" style={styles.hosTimeLabel}>Cycle Time</Text>
                <Text variant="titleMedium">{formatTime(hosData.cycleTime)}</Text>
                <ProgressBar progress={hosData.cycleTime / 70} style={styles.progressBar} />
              </View>
            </View>

            {hosData.nextBreakDue && (
              <Surface style={styles.breakAlert}>
                <AlertTriangle size={20} color="#FF9800" />
                <Text variant="bodyMedium" style={styles.breakText}>
                  Next break due: {hosData.nextBreakDue.toLocaleTimeString()}
                </Text>
              </Surface>
            )}
          </Card.Content>
        </Card>

        {/* Quick Status Change */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Change Duty Status</Text>
            <View style={styles.statusButtons}>
              <Button
                mode={hosData.currentStatus === 'off_duty' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('off_duty')}
                style={styles.statusButton}
                buttonColor={hosData.currentStatus === 'off_duty' ? getStatusColor('off_duty') : undefined}
              >
                Off Duty
              </Button>
              <Button
                mode={hosData.currentStatus === 'sleeper_berth' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('sleeper_berth')}
                style={styles.statusButton}
                buttonColor={hosData.currentStatus === 'sleeper_berth' ? getStatusColor('sleeper_berth') : undefined}
              >
                Sleeper
              </Button>
              <Button
                mode={hosData.currentStatus === 'driving' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('driving')}
                style={styles.statusButton}
                buttonColor={hosData.currentStatus === 'driving' ? getStatusColor('driving') : undefined}
              >
                Driving
              </Button>
              <Button
                mode={hosData.currentStatus === 'on_duty' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('on_duty')}
                style={styles.statusButton}
                buttonColor={hosData.currentStatus === 'on_duty' ? getStatusColor('on_duty') : undefined}
              >
                On Duty
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Malfunctions & Diagnostics */}
        {(malfunctions.filter(m => !m.resolved).length > 0 || diagnostics.filter(d => !d.acknowledged).length > 0) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                ELD Alerts ({malfunctions.filter(m => !m.resolved).length + diagnostics.filter(d => !d.acknowledged).length})
              </Text>
              
              {malfunctions.filter(m => !m.resolved).map(malfunction => (
                <Surface key={malfunction.id} style={[styles.alertItem, { backgroundColor: malfunction.severity === 'critical' ? '#FFEBEE' : '#FFF3E0' }]}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertInfo}>
                      <AlertTriangle size={20} color={malfunction.severity === 'critical' ? '#F44336' : '#FF9800'} />
                      <View>
                        <Text variant="bodyMedium" style={styles.alertTitle}>Malfunction: {malfunction.code}</Text>
                        <Text variant="bodySmall">{malfunction.description}</Text>
                        <Text variant="bodySmall" style={styles.alertTime}>
                          {malfunction.timestamp.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => resolveEvent(malfunction.id)}
                      style={styles.alertButton}
                    >
                      Resolve
                    </Button>
                  </View>
                </Surface>
              ))}

              {diagnostics.filter(d => !d.acknowledged).map(diagnostic => (
                <Surface key={diagnostic.id} style={[styles.alertItem, { backgroundColor: '#E3F2FD' }]}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertInfo}>
                      <CheckCircle size={20} color="#2196F3" />
                      <View>
                        <Text variant="bodyMedium" style={styles.alertTitle}>Diagnostic: {diagnostic.event}</Text>
                        <Text variant="bodySmall">{diagnostic.description}</Text>
                        <Text variant="bodySmall" style={styles.alertTime}>
                          {diagnostic.timestamp.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => acknowledgeEvent(diagnostic.id)}
                      style={styles.alertButton}
                    >
                      Acknowledge
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Recent ELD Events */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.eventsHeader}>
              <Text variant="titleMedium">Recent ELD Events</Text>
              <Button
                mode="text"
                onPress={() => setEditRequestDialogVisible(true)}
              >
                Request Edit
              </Button>
            </View>
            
            {recentEvents.slice(0, 5).map(event => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventInfo}>
                  <Text variant="bodyMedium">{event.eventType.replace('_', ' ')}</Text>
                  {event.dutyStatus && (
                    <Chip 
                      icon={() => React.createElement(getStatusIcon(event.dutyStatus!), { size: 12, color: '#fff' })}
                      style={[styles.eventChip, { backgroundColor: getStatusColor(event.dutyStatus) }]}
                      textStyle={{ color: '#fff', fontSize: 10 }}
                    >
                      {event.dutyStatus.replace('_', ' ')}
                    </Chip>
                  )}
                </View>
                <Text variant="bodySmall" style={styles.eventDetails}>
                  {event.timestamp.toLocaleString()}
                  {event.location && ` • ${event.location.address}`}
                  {event.odometer && ` • ${event.odometer.toLocaleString()} mi`}
                </Text>
                {event.editRequest && (
                  <Chip style={styles.editChip} textStyle={{ fontSize: 10 }}>Edit Requested</Chip>
                )}
              </View>
            ))}
            
            <Button
              mode="outlined"
              onPress={() => router.push('/(driver)/eld/logs')}
              style={styles.viewAllButton}
            >
              View All Logs
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Status Change Dialog */}
      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Change Duty Status</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to change your duty status to {selectedStatus.replace('_', ' ')}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmStatusChange}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={editRequestDialogVisible} onDismiss={() => setEditRequestDialogVisible(false)}>
          <Dialog.Title>Request Log Edit</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Provide a reason for requesting an edit to your ELD logs:
            </Text>
            <TextInput
              mode="outlined"
              label="Reason for edit"
              value={editReason}
              onChangeText={setEditReason}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditRequestDialogVisible(false)}>Cancel</Button>
            <Button onPress={requestEdit}>Submit Request</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Quick Actions FAB */}
      <FAB
        icon={() => <FileText size={24} color="#fff" />}
        style={styles.fab}
        onPress={() => router.push('/(driver)/eld/logs')}
        label="View Logs"
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
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionText: {
    fontWeight: 'bold',
  },
  deviceInfo: {
    marginTop: 8,
    opacity: 0.7,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusDuration: {
    opacity: 0.7,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  hosTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  hosTimeItem: {
    flex: 1,
    minWidth: 150,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  hosTimeLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressBar: {
    marginVertical: 8,
    height: 4,
    borderRadius: 2,
  },
  breakAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginTop: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  breakText: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: 120,
  },
  alertItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
  },
  alertTime: {
    opacity: 0.7,
    marginTop: 4,
  },
  alertButton: {
    marginLeft: 8,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventChip: {
    height: 24,
    borderRadius: 12,
  },
  eventDetails: {
    opacity: 0.7,
  },
  editChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#FFE0B2',
  },
  viewAllButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});
