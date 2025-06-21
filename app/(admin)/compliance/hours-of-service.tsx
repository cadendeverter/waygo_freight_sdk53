import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, ProgressBar, Searchbar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useFleet } from '../../../state/fleetContext';
import { useAuth } from '../../../state/authContext';
import { Clock, User, AlertTriangle, CheckCircle, Pause } from '../../../utils/icons';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface DriverHOS {
  id: string;
  driverId: string;
  driverName: string;
  currentStatus: 'driving' | 'on_duty' | 'sleeper' | 'off_duty';
  hoursRemaining: {
    drive: number;
    shift: number;
    cycle: number;
  };
  hoursUsed: {
    drive: number;
    shift: number;
    cycle: number;
  };
  violations: HOSViolation[];
  lastActivity: Date;
  resetAvailable: Date;
  location?: string;
}

interface HOSViolation {
  id: string;
  type: 'drive_time' | 'shift_time' | 'cycle_time' | 'rest_break';
  severity: 'warning' | 'violation';
  description: string;
  timestamp: Date;
  resolved: boolean;
}

export default function HoursOfServiceScreen() {
  const theme = useTheme();
  const { drivers } = useFleet();
  const { user, isDevMode } = useAuth();
  
  const [driverHOS, setDriverHOS] = useState<DriverHOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for dev mode
  const mockDriverHOS: DriverHOS[] = [
    {
      id: '1',
      driverId: 'DRV-001',
      driverName: 'John Smith',
      currentStatus: 'driving',
      hoursRemaining: {
        drive: 8.5,
        shift: 12.0,
        cycle: 65.5
      },
      hoursUsed: {
        drive: 2.5,
        shift: 2.5,
        cycle: 4.5
      },
      violations: [],
      lastActivity: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      resetAvailable: new Date(Date.now() + 34 * 3600000), // 34 hours from now
      location: 'I-75, Atlanta, GA'
    },
    {
      id: '2',
      driverId: 'DRV-002',
      driverName: 'Sarah Johnson',
      currentStatus: 'sleeper',
      hoursRemaining: {
        drive: 11.0,
        shift: 14.0,
        cycle: 68.0
      },
      hoursUsed: {
        drive: 0.0,
        shift: 0.0,
        cycle: 2.0
      },
      violations: [
        {
          id: 'v1',
          type: 'rest_break',
          severity: 'warning',
          description: 'Required 30-minute break approaching',
          timestamp: new Date(Date.now() - 15 * 60000),
          resolved: false
        }
      ],
      lastActivity: new Date(Date.now() - 8 * 3600000), // 8 hours ago
      resetAvailable: new Date(Date.now() + 26 * 3600000),
      location: 'Rest Area, Macon, GA'
    },
    {
      id: '3',
      driverId: 'DRV-003',
      driverName: 'Mike Wilson',
      currentStatus: 'on_duty',
      hoursRemaining: {
        drive: 9.5,
        shift: 10.5,
        cycle: 58.0
      },
      hoursUsed: {
        drive: 1.5,
        shift: 3.5,
        cycle: 12.0
      },
      violations: [
        {
          id: 'v2',
          type: 'drive_time',
          severity: 'violation',
          description: 'Daily drive time limit exceeded',
          timestamp: new Date(Date.now() - 2 * 3600000),
          resolved: false
        }
      ],
      lastActivity: new Date(Date.now() - 5 * 60000),
      resetAvailable: new Date(Date.now() + 30 * 3600000),
      location: 'Warehouse, Nashville, TN'
    }
  ];

  useEffect(() => {
    if (isDevMode) {
      // Use mock data for dev mode
      setDriverHOS(mockDriverHOS);
      setLoading(false);
      return;
    }

    // Production mode - real Firebase data
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'driver_hos'),
        where('companyId', '==', user?.companyId),
        orderBy('lastActivity', 'desc')
      ),
      (snapshot) => {
        const hosData: DriverHOS[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          hosData.push({
            id: doc.id,
            driverId: data.driverId,
            driverName: data.driverName,
            currentStatus: data.currentStatus,
            hoursRemaining: data.hoursRemaining || { drive: 0, shift: 0, cycle: 0 },
            hoursUsed: data.hoursUsed || { drive: 0, shift: 0, cycle: 0 },
            violations: (data.violations || []).map((v: any) => ({
              ...v,
              timestamp: v.timestamp?.toDate() || new Date()
            })),
            lastActivity: data.lastActivity?.toDate() || new Date(),
            resetAvailable: data.resetAvailable?.toDate() || new Date(),
            location: data.location
          });
        });
        setDriverHOS(hosData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching HOS data:', error);
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
      // In production, the real-time listener will handle updates
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return '#2196F3';
      case 'on_duty': return '#FF9800';
      case 'sleeper': return '#9C27B0';
      case 'off_duty': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'driving': return Clock;
      case 'on_duty': return User;
      case 'sleeper': return Pause;
      case 'off_duty': return CheckCircle;
      default: return Clock;
    }
  };

  const getViolationColor = (severity: string) => {
    return severity === 'violation' ? '#F44336' : '#FF9800';
  };

  const getTimeColor = (remaining: number, type: 'drive' | 'shift' | 'cycle') => {
    const thresholds = { drive: 2, shift: 2, cycle: 10 };
    return remaining <= thresholds[type] ? '#F44336' : '#4CAF50';
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const filteredDrivers = driverHOS.filter(driver => {
    const matchesSearch = driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.driverId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || driver.currentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading Hours of Service data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const totalViolations = driverHOS.reduce((acc, driver) => acc + driver.violations.filter(v => !v.resolved).length, 0);
  const criticalViolations = driverHOS.reduce((acc, driver) => acc + driver.violations.filter(v => v.severity === 'violation' && !v.resolved).length, 0);

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
            <Clock size={32} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
                Hours of Service
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Monitor driver compliance and working hours
              </Text>
            </View>
          </View>

          {/* Search and Filter */}
          <Searchbar
            placeholder="Search drivers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['all', 'driving', 'on_duty', 'sleeper', 'off_duty'].map((status) => (
                <Chip
                  key={status}
                  selected={filterStatus === status}
                  onPress={() => setFilterStatus(status)}
                  style={{ backgroundColor: filterStatus === status ? theme.colors.primary : undefined }}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </Chip>
              ))}
            </View>
          </ScrollView>

          {/* Summary Stats */}
          <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                  {filteredDrivers.length}
                </Text>
                <Text variant="bodySmall">Active Drivers</Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {totalViolations}
                </Text>
                <Text variant="bodySmall">Total Violations</Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#F44336' }}>
                  {criticalViolations}
                </Text>
                <Text variant="bodySmall">Critical</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Driver HOS Cards */}
          {filteredDrivers.map((driver) => {
            const StatusIcon = getStatusIcon(driver.currentStatus);
            const unresolvedViolations = driver.violations.filter(v => !v.resolved);
            
            return (
              <Card key={driver.id} style={{ marginBottom: 16 }} mode="elevated">
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {driver.driverName}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {driver.driverId}
                      </Text>
                      {driver.location && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                          📍 {driver.location}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <StatusIcon size={16} color={getStatusColor(driver.currentStatus)} />
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            marginLeft: 4, 
                            color: getStatusColor(driver.currentStatus),
                            fontWeight: 'bold'
                          }}
                        >
                          {driver.currentStatus.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Last: {driver.lastActivity.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  {/* Hours Remaining */}
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      Time Remaining
                    </Text>
                    
                    <View style={{ marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Text variant="bodySmall">Drive Time</Text>
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            color: getTimeColor(driver.hoursRemaining.drive, 'drive'),
                            fontWeight: 'bold'
                          }}
                        >
                          {formatTime(driver.hoursRemaining.drive)}
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={driver.hoursUsed.drive / 11} 
                        color={getTimeColor(driver.hoursRemaining.drive, 'drive')}
                        style={{ height: 4 }}
                      />
                    </View>

                    <View style={{ marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Text variant="bodySmall">Shift Time</Text>
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            color: getTimeColor(driver.hoursRemaining.shift, 'shift'),
                            fontWeight: 'bold'
                          }}
                        >
                          {formatTime(driver.hoursRemaining.shift)}
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={driver.hoursUsed.shift / 14} 
                        color={getTimeColor(driver.hoursRemaining.shift, 'shift')}
                        style={{ height: 4 }}
                      />
                    </View>

                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Text variant="bodySmall">Cycle Time</Text>
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            color: getTimeColor(driver.hoursRemaining.cycle, 'cycle'),
                            fontWeight: 'bold'
                          }}
                        >
                          {formatTime(driver.hoursRemaining.cycle)}
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={driver.hoursUsed.cycle / 70} 
                        color={getTimeColor(driver.hoursRemaining.cycle, 'cycle')}
                        style={{ height: 4 }}
                      />
                    </View>
                  </View>

                  {/* Violations */}
                  {unresolvedViolations.length > 0 && (
                    <View style={{ marginBottom: 12 }}>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        Violations ({unresolvedViolations.length})
                      </Text>
                      {unresolvedViolations.slice(0, 2).map((violation) => (
                        <View 
                          key={violation.id}
                          style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginBottom: 4,
                            padding: 8,
                            backgroundColor: getViolationColor(violation.severity) + '20',
                            borderRadius: 8
                          }}
                        >
                          <AlertTriangle size={16} color={getViolationColor(violation.severity)} />
                          <Text 
                            variant="bodySmall" 
                            style={{ 
                              marginLeft: 8, 
                              flex: 1,
                              color: getViolationColor(violation.severity)
                            }}
                          >
                            {violation.description}
                          </Text>
                        </View>
                      ))}
                      {unresolvedViolations.length > 2 && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          +{unresolvedViolations.length - 2} more violations
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Reset Available */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text variant="bodySmall">Reset Available:</Text>
                    <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                      {driver.resetAvailable.toLocaleDateString()} {driver.resetAvailable.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                    <Button 
                      mode="outlined"
                      onPress={() => router.push(`/(admin)/compliance/hos/${driver.driverId}`)}
                    >
                      View Details
                    </Button>
                    {unresolvedViolations.length > 0 && (
                      <Button 
                        mode="contained"
                        buttonColor="#F44336"
                        onPress={() => router.push(`/(admin)/compliance/violations/${driver.driverId}`)}
                      >
                        Resolve Violations
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })}

          {filteredDrivers.length === 0 && (
            <Card mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Clock size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center' }}>
                  No drivers found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {searchQuery ? 'Try adjusting your search' : 'No active drivers available'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
