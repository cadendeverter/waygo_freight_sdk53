// waygo-freight/app/(driver)/hos/index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, ProgressBar, List, Divider, FAB, SegmentedButtons } from 'react-native-paper';
import { Clock, AlertTriangle, CheckCircle, XCircle, Play, Pause, Square, Truck, MapPin, Calendar, RefreshCw } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

const { width } = Dimensions.get('window');

// Mock HOS data
const mockHOSData = {
  currentStatus: 'ON_DUTY',
  currentStatusStart: '2024-06-17T06:00:00Z',
  drivingTime: {
    current: 375, // minutes (6h 15m)
    limit: 660, // 11 hours
    remaining: 285
  },
  onDutyTime: {
    current: 570, // minutes (9h 30m)
    limit: 840, // 14 hours
    remaining: 270
  },
  cycle: {
    hours: 42,
    limit: 70,
    remaining: 28
  },
  violations: [],
  lastBreak: '2024-06-17T02:00:00Z',
  nextBreakRequired: '2024-06-17T14:00:00Z',
  location: {
    city: 'Dallas',
    state: 'TX',
    coordinates: { latitude: 32.7767, longitude: -96.7970 }
  },
  dailyLog: [
    { status: 'OFF_DUTY', start: '2024-06-16T22:00:00Z', end: '2024-06-17T06:00:00Z', duration: 480, location: 'Dallas, TX' },
    { status: 'ON_DUTY', start: '2024-06-17T06:00:00Z', end: '2024-06-17T06:30:00Z', duration: 30, location: 'Dallas, TX' },
    { status: 'DRIVING', start: '2024-06-17T06:30:00Z', end: '2024-06-17T10:15:00Z', duration: 225, location: 'Dallas, TX → Austin, TX' },
    { status: 'ON_DUTY', start: '2024-06-17T10:15:00Z', end: '2024-06-17T12:15:00Z', duration: 120, location: 'Austin, TX' },
    { status: 'DRIVING', start: '2024-06-17T12:15:00Z', end: '2024-06-17T15:45:00Z', duration: 210, location: 'Austin, TX → Houston, TX' },
    { status: 'ON_DUTY', start: '2024-06-17T15:45:00Z', end: null, duration: null, location: 'Houston, TX' }
  ]
};

const statusLabels = {
  OFF_DUTY: 'Off Duty',
  ON_DUTY: 'On Duty (Not Driving)',
  DRIVING: 'Driving',
  SLEEPER_BERTH: 'Sleeper Berth'
};

const statusColors = {
  OFF_DUTY: '#8E8E93',
  ON_DUTY: '#FF9500',
  DRIVING: '#34C759',
  SLEEPER_BERTH: '#007AFF'
};

function DriverHOSScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [hosData, setHosData] = useState(mockHOSData);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('current');

  const fetchHOSData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHosData(mockHOSData);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHOSData();
    }, [fetchHOSData])
  );

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentStatusDuration = () => {
    const start = new Date(hosData.currentStatusStart);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return formatTime(diffMinutes);
  };

  const getProgressBarColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 75) return '#FF9500';
    return '#34C759';
  };

  const handleStatusChange = (newStatus: string) => {
    Alert.alert(
      'Change Status',
      `Change status to ${statusLabels[newStatus as keyof typeof statusLabels]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // TODO: Implement status change
            console.log('Status changed to:', newStatus);
          }
        }
      ]
    );
  };

  const renderCurrentStatus = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Heading variant="h3">Current Status</Heading>
          <Chip 
            mode="outlined" 
            textStyle={{ color: statusColors[hosData.currentStatus as keyof typeof statusColors], fontWeight: '600' }}
            style={{ 
              borderColor: statusColors[hosData.currentStatus as keyof typeof statusColors]
            }}
          >
            {statusLabels[hosData.currentStatus as keyof typeof statusLabels]}
          </Chip>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Clock size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyLarge" style={{ marginLeft: 8, fontWeight: '600' }}>
            Duration: {getCurrentStatusDuration()}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <MapPin size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
            {hosData.location.city}, {hosData.location.state}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            mode={hosData.currentStatus === 'OFF_DUTY' ? "contained" : "outlined"}
            onPress={() => handleStatusChange('OFF_DUTY')}
            style={{ flex: 1 }}
            compact
          >
            Off Duty
          </Button>
          <Button 
            mode={hosData.currentStatus === 'ON_DUTY' ? "contained" : "outlined"}
            onPress={() => handleStatusChange('ON_DUTY')}
            style={{ flex: 1 }}
            compact
          >
            On Duty
          </Button>
          <Button 
            mode={hosData.currentStatus === 'DRIVING' ? "contained" : "outlined"}
            onPress={() => handleStatusChange('DRIVING')}
            style={{ flex: 1 }}
            compact
          >
            Driving
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHoursTracking = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <Heading variant="h3" style={{ marginBottom: 16 }}>Hours Tracking</Heading>

        {/* Driving Time */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">Driving Time</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {formatTime(hosData.drivingTime.current)} / {formatTime(hosData.drivingTime.limit)}
            </Text>
          </View>
          <ProgressBar 
            progress={hosData.drivingTime.current / hosData.drivingTime.limit} 
            color={getProgressBarColor(hosData.drivingTime.current, hosData.drivingTime.limit)}
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {formatTime(hosData.drivingTime.remaining)} remaining
          </Text>
        </View>

        {/* On Duty Time */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">On Duty Time</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {formatTime(hosData.onDutyTime.current)} / {formatTime(hosData.onDutyTime.limit)}
            </Text>
          </View>
          <ProgressBar 
            progress={hosData.onDutyTime.current / hosData.onDutyTime.limit} 
            color={getProgressBarColor(hosData.onDutyTime.current, hosData.onDutyTime.limit)}
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {formatTime(hosData.onDutyTime.remaining)} remaining
          </Text>
        </View>

        {/* 70-Hour Cycle */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">70-Hour Cycle</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {hosData.cycle.hours}h / {hosData.cycle.limit}h
            </Text>
          </View>
          <ProgressBar 
            progress={hosData.cycle.hours / hosData.cycle.limit} 
            color={getProgressBarColor(hosData.cycle.hours * 60, hosData.cycle.limit * 60)}
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {hosData.cycle.remaining}h remaining
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderDailyLog = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Heading variant="h3">Daily Log</Heading>
          <Button 
            mode="outlined" 
            compact
            onPress={() => router.push('/driver/hos/edit')}
          >
            Edit Log
          </Button>
        </View>

        {/* Visual Timeline */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', height: 40, borderRadius: 8, overflow: 'hidden' }}>
            {hosData.dailyLog.map((entry, index) => {
              const duration = entry.duration || 60; // Default for current ongoing status
              const totalMinutes = 24 * 60; // 24 hours
              const widthPercentage = (duration / totalMinutes) * 100;
              
              return (
                <View
                  key={index}
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: statusColors[entry.status as keyof typeof statusColors],
                    borderRightWidth: index < hosData.dailyLog.length - 1 ? 1 : 0,
                    borderRightColor: 'white'
                  }}
                />
              );
            })}
          </View>
          
          {/* Time markers */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>12 AM</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>6 AM</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>12 PM</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>6 PM</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>12 AM</Text>
          </View>
        </View>

        {/* Log Entries */}
        {hosData.dailyLog.map((entry, index) => (
          <View key={index}>
            <List.Item
              title={statusLabels[entry.status as keyof typeof statusLabels]}
              description={`${formatDateTime(entry.start)} ${entry.end ? `- ${formatDateTime(entry.end)}` : '(ongoing)'}`}
              left={() => (
                <View style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: 6, 
                  backgroundColor: statusColors[entry.status as keyof typeof statusColors],
                  marginTop: 8,
                  marginRight: 8
                }} />
              )}
              right={() => (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {entry.duration ? formatTime(entry.duration) : 'Ongoing'}
                </Text>
              )}
              style={{ paddingHorizontal: 0 }}
            />
            {index < hosData.dailyLog.length - 1 && <Divider />}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderComplianceAlerts = () => {
    if (hosData.violations.length === 0) {
      return (
        <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
          <Card.Content style={{ padding: 16, alignItems: 'center' }}>
            <CheckCircle size={48} color="#34C759" />
            <Text variant="titleMedium" style={{ marginTop: 12, fontWeight: '600' }}>
              Compliant
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 4, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              No HOS violations detected
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <AlertTriangle size={24} color={theme.colors.error} />
            <Heading variant="h3" style={{ marginLeft: 12, color: theme.colors.error }}>
              Compliance Alerts
            </Heading>
          </View>
          
          {hosData.violations.map((violation, index) => (
            <View key={index} style={{ 
              backgroundColor: theme.colors.errorContainer, 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: index < hosData.violations.length - 1 ? 8 : 0 
            }}>
              <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.onErrorContainer }}>
                {violation}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Hours of Service' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Heading variant="h1">Hours of Service</Heading>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              DOT compliance tracking
            </Text>
          </View>
          <Button 
            mode="outlined" 
            onPress={fetchHOSData}
            icon={() => <RefreshCw size={16} color={theme.colors.primary} />}
            compact
          >
            Refresh
          </Button>
        </View>

        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'current', label: 'Current' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'cycle', label: 'Cycle' }
          ]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCurrentStatus()}
        {renderHoursTracking()}
        {renderDailyLog()}
        {renderComplianceAlerts()}
        
        <View style={{ padding: 16 }}>
          <Button 
            mode="contained" 
            onPress={() => router.push('/driver/hos/detailed')}
            style={{ marginBottom: 8 }}
          >
            View Detailed Logs
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/driver/hos/export')}
          >
            Export HOS Data
          </Button>
        </View>
      </ScrollView>

      <FAB
        icon={() => <Calendar size={24} color="white" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => router.push('/driver/hos/log-entry')}
      />
    </ScreenWrapper>
  );
}

export default DriverHOSScreen;
