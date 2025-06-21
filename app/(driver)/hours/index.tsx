import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, ProgressBar, List, useTheme, FAB } from 'react-native-paper';
import { useAuth } from '../../../state/authContext';
import { useFleet } from '../../../state/fleetContext';
import { hosService } from '../../../services/hosService';
import { Clock, AlertTriangle, CheckCircle, XCircle, Calendar, Truck } from '../../../utils/icons';
import { Driver, HOSRecord, HOSViolation, HOSEntry } from '../../../types';

export default function HoursScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [hosData, setHosData] = useState<HOSEntry | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('OFF_DUTY');
  const [violations, setViolations] = useState<HOSViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHOSData();
      loadViolations();
    }
  }, [user]);

  const loadHOSData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const currentEntry = await hosService.getCurrentDutyStatus(user.uid);
      setHosData(currentEntry);
      if (currentEntry) {
        setCurrentStatus(currentEntry.status);
      }
    } catch (error) {
      console.error('Error loading HOS data:', error);
      Alert.alert('Error', 'Failed to load HOS data');
    } finally {
      setLoading(false);
    }
  };

  const loadViolations = async () => {
    if (!user) return;
    
    try {
      // For now, set empty violations since we don't have a violations method
      // In a real implementation, this would fetch violations from the service
      setViolations([]);
    } catch (error) {
      console.error('Error loading violations:', error);
    }
  };

  const handleStatusChange = async (newStatus: string, location?: string) => {
    if (!user) return;
    
    try {
      await hosService.startDutyStatus(user.uid, newStatus as any, undefined, undefined, undefined, undefined, undefined, location);
      setCurrentStatus(newStatus);
      await loadHOSData(); // Reload data after status change
      Alert.alert('Status Updated', `Duty status changed to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating duty status:', error);
      Alert.alert('Error', 'Failed to update duty status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_DUTY': return '#2196F3';
      case 'DRIVING': return '#4CAF50';
      case 'SLEEPER_BERTH': return '#9C27B0';
      case 'OFF_DUTY': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_DUTY': return <Clock size={20} color="#2196F3" />;
      case 'DRIVING': return <Truck size={20} color="#4CAF50" />;
      case 'SLEEPER_BERTH': return <AlertTriangle size={20} color="#9C27B0" />;
      case 'OFF_DUTY': return <XCircle size={20} color="#757575" />;
      default: return <Clock size={20} color="#757575" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentStatusDuration = () => {
    if (!hosData || !hosData.startTime) return 0;
    const now = new Date();
    const startTime = new Date(hosData.startTime);
    return Math.floor((now.getTime() - startTime.getTime()) / 60000); // minutes
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading HOS data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Current Status Card */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              {getStatusIcon(currentStatus)}
              <Text variant="headlineSmall" style={{ marginLeft: 8, flex: 1 }}>
                Current Status
              </Text>
              <Chip 
                mode="flat" 
                style={{ backgroundColor: getStatusColor(currentStatus) }}
                textStyle={{ color: 'white' }}
              >
                {currentStatus.replace('_', ' ')}
              </Chip>
            </View>
            
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Duration: {formatTime(getCurrentStatusDuration())}
            </Text>
            
            {hosData?.startTime && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Started: {new Date(hosData.startTime).toLocaleTimeString()}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* HOS Limits Card */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>
              Hours of Service Limits
            </Text>
            
            {/* Drive Time */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium">Drive Time</Text>
                <Text variant="bodyMedium">
                  {formatTime(0)} / 11h 0m
                </Text>
              </View>
              <ProgressBar 
                progress={0 / 660} // 11 hours = 660 minutes
                color="#4CAF50"
                style={{ height: 8 }}
              />
            </View>

            {/* On Duty Time */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium">On Duty Time</Text>
                <Text variant="bodyMedium">
                  {formatTime(0)} / 14h 0m
                </Text>
              </View>
              <ProgressBar 
                progress={0 / 840} // 14 hours = 840 minutes
                color="#2196F3"
                style={{ height: 8 }}
              />
            </View>

            {/* Cycle Hours */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium">Cycle Hours (70-hour/8-day)</Text>
                <Text variant="bodyMedium">
                  {formatTime(0)} / 70h 0m
                </Text>
              </View>
              <ProgressBar 
                progress={0 / 4200} // 70 hours = 4200 minutes
                color="#FF9800"
                style={{ height: 8 }}
              />
            </View>

            {/* Off Duty Time */}
            <View style={{ marginBottom: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium">Required Off Duty</Text>
                <Text variant="bodyMedium">
                  {formatTime(0)} / 10h 0m
                </Text>
              </View>
              <ProgressBar 
                progress={0 / 600} // 10 hours = 600 minutes
                color="#9C27B0"
                style={{ height: 8 }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Violations Card */}
        {violations.length > 0 && (
          <Card style={{ marginBottom: 16, backgroundColor: '#FFEBEE' }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <AlertTriangle size={20} color="#F44336" />
                <Text variant="titleMedium" style={{ marginLeft: 8, color: '#F44336' }}>
                  HOS Violations
                </Text>
              </View>
              
              {violations.map((violation, index) => (
                <List.Item
                  key={index}
                  title={violation.description}
                  description={`${violation.type} • ${violation.severity}`}
                  left={() => <AlertTriangle size={20} color="#F44336" />}
                  right={() => (
                    <Chip 
                      mode="outlined" 
                      style={{ borderColor: '#F44336' }}
                      textStyle={{ color: '#F44336' }}
                    >
                      {violation.severity}
                    </Chip>
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Status Change Buttons */}
        <Card style={{ marginBottom: 80 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Change Duty Status
            </Text>
            
            <Button 
              mode={currentStatus === 'OFF_DUTY' ? 'contained' : 'outlined'}
              onPress={() => handleStatusChange('OFF_DUTY')}
              style={{ marginBottom: 8 }}
              icon={() => <XCircle size={16} color={currentStatus === 'OFF_DUTY' ? '#fff' : '#757575'} />}
            >
              Off Duty
            </Button>
            <Button 
              mode={currentStatus === 'SLEEPER_BERTH' ? 'contained' : 'outlined'}
              onPress={() => handleStatusChange('SLEEPER_BERTH')}
              style={{ marginBottom: 8 }}
              icon={() => <AlertTriangle size={16} color={currentStatus === 'SLEEPER_BERTH' ? '#fff' : '#9C27B0'} />}
            >
              Sleeper Berth
            </Button>
            <Button 
              mode={currentStatus === 'ON_DUTY' ? 'contained' : 'outlined'}
              onPress={() => handleStatusChange('ON_DUTY')}
              style={{ marginBottom: 8 }}
              icon={() => <Clock size={16} color={currentStatus === 'ON_DUTY' ? '#fff' : '#2196F3'} />}
            >
              On Duty
            </Button>
            <Button 
              mode={currentStatus === 'DRIVING' ? 'contained' : 'outlined'}
              onPress={() => handleStatusChange('DRIVING')}
              style={{ marginBottom: 8 }}
              icon={() => <Truck size={16} color={currentStatus === 'DRIVING' ? '#fff' : '#4CAF50'} />}
            >
              Driving
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={() => <Calendar size={24} color="#fff" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => {
          Alert.alert('HOS Log', 'View detailed HOS log and export options');
        }}
      />
    </View>
  );
}
