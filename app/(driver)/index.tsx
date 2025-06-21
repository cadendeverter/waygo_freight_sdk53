import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  Avatar,
  IconButton,
  Divider,
  Surface,
  ProgressBar
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../state/authContext';
import { useLoad } from '../../state/loadContext';
import { useFleet } from '../../state/fleetContext';
import { Load, Driver } from '../../types';
import { 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  Camera,
  Navigation,
  FileText,
  User
} from '../../utils/icons';

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

export default function DriverDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { loads } = useLoad();
  const { drivers } = useFleet();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [assignedLoads, setAssignedLoads] = useState<Load[]>([]);
  const [currentLoad, setCurrentLoad] = useState<Load | null>(null);
  const [hosData, setHosData] = useState<HOSData>({
    currentStatus: 'off_duty',
    driveTime: 2.5,
    onDutyTime: 8.2,
    shiftTime: 10.5,
    cycleTime: 35.5,
    statusStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    remainingDriveTime: 8.5,
    remainingOnDutyTime: 5.8,
    nextBreakDue: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours from now
  });
  const [dvirCompleted, setDvir] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3);

  useEffect(() => {
    if (user) {
      // Find current driver
      const driver = drivers.find(d => d.userId === user.uid);
      setCurrentDriver(driver || null);
      
      // Get assigned loads
      const driverLoads = loads.filter(load => 
        load.driverId === driver?.id && 
        ['assigned', 'en_route_pickup', 'at_pickup', 'loaded', 'en_route_delivery', 'at_delivery'].includes(load.status)
      );
      setAssignedLoads(driverLoads);
      
      // Set current active load
      const activeLoad = driverLoads.find(load => 
        ['en_route_pickup', 'at_pickup', 'loaded', 'en_route_delivery', 'at_delivery'].includes(load.status)
      );
      setCurrentLoad(activeLoad || driverLoads[0] || null);
    }
  }, [user, drivers, loads]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const changeHOSStatus = (newStatus: HOSStatus) => {
    // Validate status change
    if (newStatus === 'driving' && !dvirCompleted) {
      Alert.alert(
        'DVIR Required',
        'You must complete your Driver Vehicle Inspection Report before beginning to drive.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (newStatus === 'driving' && hosData.remainingDriveTime <= 0) {
      Alert.alert(
        'HOS Violation',
        'You have exceeded your maximum drive time. You must take a break before driving.',
        [{ text: 'OK' }]
      );
      return;
    }

    setHosData(prev => ({
      ...prev,
      currentStatus: newStatus,
      statusStartTime: new Date()
    }));
  };

  const getStatusColor = (status: HOSStatus) => {
    switch (status) {
      case 'driving': return '#34C759';
      case 'on_duty': return '#FF9500';
      case 'sleeper_berth': return '#007AFF';
      case 'off_duty': return '#8E8E93';
      default: return theme.colors.primary;
    }
  };

  const getLoadStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return theme.colors.primary;
      case 'en_route_pickup': return '#FF9500';
      case 'at_pickup': return '#FF9500';
      case 'loaded': return '#34C759';
      case 'en_route_delivery': return '#007AFF';
      case 'at_delivery': return '#007AFF';
      default: return theme.colors.outline;
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Driver Header */}
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.driverHeader}>
          <Avatar.Icon size={60} icon="account" style={{ backgroundColor: theme.colors.primary }} />
          <View style={styles.driverInfo}>
            <Text variant="headlineSmall">
              {currentDriver ? `Driver ${currentDriver.driverNumber}` : 'Driver'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              CDL Class {currentDriver?.cdlClass || 'A'} • {currentDriver?.currentVehicleId ? `Vehicle ${currentDriver.currentVehicleId}` : 'No Vehicle Assigned'}
            </Text>
          </View>
          <IconButton 
            icon="message-outline" 
            size={24}
            onPress={() => router.push('/(driver)/messages')}
          />
          {unreadMessages > 0 && (
            <View style={styles.messageBadge}>
              <Text style={styles.messageBadgeText}>{unreadMessages}</Text>
            </View>
          )}
        </View>
      </Surface>

      {/* HOS Status Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Clock size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>Hours of Service</Text>
            </View>
            <Chip 
              mode="flat" 
              style={{ backgroundColor: getStatusColor(hosData.currentStatus) + '20' }}
              textStyle={{ color: getStatusColor(hosData.currentStatus) }}
            >
              {formatStatus(hosData.currentStatus)}
            </Chip>
          </View>
          
          <View style={styles.hosGrid}>
            <View style={styles.hosItem}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Drive Time</Text>
              <Text variant="titleLarge">{formatHours(hosData.driveTime)}</Text>
              <ProgressBar 
                progress={hosData.driveTime / 11} 
                color={hosData.driveTime > 10 ? theme.colors.error : theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodySmall">{formatHours(hosData.remainingDriveTime)} remaining</Text>
            </View>
            
            <View style={styles.hosItem}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>On Duty</Text>
              <Text variant="titleLarge">{formatHours(hosData.onDutyTime)}</Text>
              <ProgressBar 
                progress={hosData.onDutyTime / 14} 
                color={hosData.onDutyTime > 13 ? theme.colors.error : theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodySmall">{formatHours(hosData.remainingOnDutyTime)} remaining</Text>
            </View>
          </View>

          <View style={styles.hosButtons}>
            <Button 
              mode={hosData.currentStatus === 'off_duty' ? 'contained' : 'outlined'}
              onPress={() => changeHOSStatus('off_duty')}
              style={styles.hosButton}
              compact
            >
              Off Duty
            </Button>
            <Button 
              mode={hosData.currentStatus === 'sleeper_berth' ? 'contained' : 'outlined'}
              onPress={() => changeHOSStatus('sleeper_berth')}
              style={styles.hosButton}
              compact
            >
              Sleeper
            </Button>
            <Button 
              mode={hosData.currentStatus === 'on_duty' ? 'contained' : 'outlined'}
              onPress={() => changeHOSStatus('on_duty')}
              style={styles.hosButton}
              compact
            >
              On Duty
            </Button>
            <Button 
              mode={hosData.currentStatus === 'driving' ? 'contained' : 'outlined'}
              onPress={() => changeHOSStatus('driving')}
              style={styles.hosButton}
              compact
              disabled={!dvirCompleted}
            >
              Driving
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Current Load Card */}
      {currentLoad && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Truck size={20} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>Current Load</Text>
              </View>
              <Chip 
                mode="flat" 
                style={{ backgroundColor: getLoadStatusColor(currentLoad.status) + '20' }}
                textStyle={{ color: getLoadStatusColor(currentLoad.status) }}
              >
                {formatStatus(currentLoad.status)}
              </Chip>
            </View>

            <Text variant="titleSmall" style={{ marginBottom: 8 }}>
              Load #{currentLoad.loadNumber}
            </Text>

            <View style={styles.locationRow}>
              <View style={styles.location}>
                <MapPin size={16} color={theme.colors.primary} />
                <View style={styles.locationText}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {currentLoad.origin.facility.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {currentLoad.origin.facility.address.city}, {currentLoad.origin.facility.address.state}
                  </Text>
                </View>
              </View>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>→</Text>
              <View style={styles.location}>
                <MapPin size={16} color={theme.colors.secondary} />
                <View style={styles.locationText}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {currentLoad.destination.facility.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {currentLoad.destination.facility.address.city}, {currentLoad.destination.facility.address.state}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.loadDetails}>
              <Text variant="bodyMedium">
                <Text style={{ fontWeight: '600' }}>Commodity:</Text> {currentLoad.commodity}
              </Text>
              <Text variant="bodyMedium">
                <Text style={{ fontWeight: '600' }}>Weight:</Text> {currentLoad.weight.toLocaleString()} lbs
              </Text>
              <Text variant="bodyMedium">
                <Text style={{ fontWeight: '600' }}>Equipment:</Text> {formatStatus(currentLoad.equipment)}
              </Text>
            </View>

            <View style={styles.loadActions}>
              <Button 
                mode="contained-tonal" 
                icon="navigation"
                onPress={() => router.push(`/(driver)/navigation?loadId=${currentLoad.id}`)}
                style={{ flex: 1 }}
              >
                Navigate
              </Button>
              <Button 
                mode="contained-tonal" 
                icon="file-document"
                onPress={() => router.push(`/(driver)/load-details?loadId=${currentLoad.id}`)}
                style={{ flex: 1, marginLeft: 8 }}
              >
                Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <Surface style={[styles.actionItem, { backgroundColor: dvirCompleted ? theme.colors.primaryContainer : theme.colors.errorContainer }]} elevation={1}>
              <IconButton 
                icon={dvirCompleted ? "check-circle" : "alert-circle"}
                size={24}
                iconColor={dvirCompleted ? theme.colors.primary : theme.colors.error}
                onPress={() => router.push('/(driver)/dvir')}
              />
              <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 4 }}>
                DVIR {dvirCompleted ? 'Complete' : 'Required'}
              </Text>
            </Surface>

            <Surface style={styles.actionItem} elevation={1}>
              <IconButton 
                icon="camera"
                size={24}
                iconColor={theme.colors.primary}
                onPress={() => router.push('/(driver)/documents')}
              />
              <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 4 }}>
                Scan Docs
              </Text>
            </Surface>

            <Surface style={styles.actionItem} elevation={1}>
              <IconButton 
                icon="message"
                size={24}
                iconColor={theme.colors.primary}
                onPress={() => router.push('/(driver)/messages')}
              />
              <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 4 }}>
                Messages
              </Text>
              {unreadMessages > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{unreadMessages}</Text>
                </View>
              )}
            </Surface>

            <Surface style={styles.actionItem} elevation={1}>
              <IconButton 
                icon="account"
                size={24}
                iconColor={theme.colors.primary}
                onPress={() => router.push('/(driver)/profile')}
              />
              <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 4 }}>
                Profile
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* All Assigned Loads */}
      {assignedLoads.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Assigned Loads ({assignedLoads.length})</Text>
            
            {assignedLoads.map((load, index) => (
              <View key={load.id}>
                <View style={styles.loadItem}>
                  <View style={styles.loadItemHeader}>
                    <Text variant="titleSmall">Load #{load.loadNumber}</Text>
                    <Chip 
                      mode="flat" 
                      style={{ backgroundColor: getLoadStatusColor(load.status) + '20' }}
                      textStyle={{ color: getLoadStatusColor(load.status) }}
                      compact
                    >
                      {formatStatus(load.status)}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium" style={{ marginVertical: 4 }}>
                    {load.origin.facility.address.city}, {load.origin.facility.address.state} → {load.destination.facility.address.city}, {load.destination.facility.address.state}
                  </Text>
                  
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {load.commodity} • {load.weight.toLocaleString()} lbs
                  </Text>
                </View>
                {index < assignedLoads.length - 1 && <Divider style={{ marginVertical: 12 }} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  messageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    marginLeft: 8,
  },
  hosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hosItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginVertical: 4,
  },
  hosButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  hosButton: {
    flex: 1,
    minWidth: 80,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  loadDetails: {
    marginBottom: 16,
    gap: 4,
  },
  loadActions: {
    flexDirection: 'row',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  loadItem: {
    
  },
  loadItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
