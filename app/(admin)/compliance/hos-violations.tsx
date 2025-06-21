import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, useTheme, List, Avatar, Badge, FAB } from 'react-native-paper';
import { useCompliance } from '../../../state/complianceContext';
import { 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from '../../../utils/icons';
import { HOSViolation, Driver } from '../../../types';

interface HOSViolationRecord extends HOSViolation {
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  location?: string;
  resolvedAt?: Date;
  notes?: string;
}

const mockViolations: HOSViolationRecord[] = [
  {
    id: 'v1',
    type: 'DAILY_DRIVING_LIMIT',
    driverId: 'driver1',
    driverName: 'John Smith',
    vehicleNumber: 'T-101',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    severity: 'critical',
    description: 'Exceeded 11-hour daily driving limit by 45 minutes',
    resolved: false,
    location: 'Interstate 80, Nevada'
  },
  {
    id: 'v2',
    type: 'REST_BREAK_REQUIRED',
    driverId: 'driver1',
    driverName: 'John Smith',
    vehicleNumber: 'T-101',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    severity: 'warning',
    description: 'Required 30-minute break not taken after 8 hours of driving',
    resolved: true,
    resolvedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    location: 'Rest Area Mile 45, I-70'
  },
  {
    id: 'v3',
    type: 'ON_DUTY_LIMIT',
    driverId: 'driver3',
    driverName: 'Mike Wilson',
    vehicleNumber: 'T-103',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    severity: 'critical',
    description: 'Exceeded 14-hour on-duty limit',
    resolved: false,
    location: 'Phoenix, AZ'
  },
  {
    id: 'v4',
    type: 'WEEKLY_DRIVING_LIMIT',
    driverId: 'driver4',
    driverName: 'Lisa Brown',
    vehicleNumber: 'T-104',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    severity: 'critical',
    description: 'Exceeded 60-hour weekly driving limit',
    resolved: true,
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    location: 'Atlanta, GA',
    notes: 'Driver took required 34-hour restart'
  }
];

export default function HOSViolationsScreen() {
  const theme = useTheme();
  const { loading } = useCompliance();
  const [violations, setViolations] = useState<HOSViolationRecord[]>(mockViolations);
  const [selectedFilter, setSelectedFilter] = useState<string>('unresolved');
  const [refreshing, setRefreshing] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'warning': return '#FF9800';
      case 'info': return '#74B9FF';
      default: return theme.colors.outline;
    }
  };

  const getViolationTypeLabel = (type: string) => {
    const labels = {
      'DAILY_DRIVING_LIMIT': 'Daily Drive Limit',
      'WEEKLY_DRIVING_LIMIT': 'Weekly Drive Limit',
      'REST_BREAK_REQUIRED': 'Rest Break Required',
      'ON_DUTY_LIMIT': 'On-Duty Limit'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'DAILY_DRIVING_LIMIT':
      case 'WEEKLY_DRIVING_LIMIT':
        return <Clock size={24} color={theme.colors.error} />;
      case 'REST_BREAK_REQUIRED':
        return <AlertTriangle size={24} color="#FF9800" />;
      case 'ON_DUTY_LIMIT':
        return <User size={24} color={theme.colors.error} />;
      default:
        return <FileText size={24} color={theme.colors.outline} />;
    }
  };

  const filteredViolations = violations.filter(violation => {
    switch (selectedFilter) {
      case 'unresolved': return !violation.resolved;
      case 'resolved': return violation.resolved;
      case 'critical': return violation.severity === 'critical';
      case 'recent': return new Date(violation.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      default: return true;
    }
  });

  const unresolvedCount = violations.filter(v => !v.resolved).length;
  const criticalCount = violations.filter(v => v.severity === 'critical' && !v.resolved).length;
  const recentCount = violations.filter(v => {
    const violationDate = new Date(v.timestamp);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return violationDate > weekAgo;
  }).length;

  const resolveViolation = (violationId: string) => {
    Alert.alert(
      'Resolve Violation',
      'Are you sure you want to mark this violation as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            setViolations(prev => prev.map(v =>
              v.id === violationId
                ? { ...v, resolved: true, resolvedAt: new Date() }
                : v
            ));
            Alert.alert('Success', 'Violation marked as resolved');
          }
        }
      ]
    );
  };

  const viewViolationDetails = (violation: HOSViolationRecord) => {
    Alert.alert(
      `${getViolationTypeLabel(violation.type)} - ${violation.severity}`,
      `Driver: ${violation.driverName}
Vehicle: ${violation.vehicleNumber}
Time: ${violation.timestamp.toLocaleString()}
Location: ${violation.location}

Description: ${violation.description}

${violation.resolved ? `Resolved: ${violation.resolvedAt?.toLocaleString()}` : 'Status: Unresolved'}
${violation.notes ? `\nNotes: ${violation.notes}` : ''}`,
      [
        { text: 'OK' },
        !violation.resolved ? {
          text: 'Resolve',
          onPress: () => resolveViolation(violation.id)
        } : undefined
      ].filter(Boolean) as any
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportReport = () => {
    Alert.alert('Export HOS Violations', 'HOS violations report exported successfully!');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading HOS violations...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">HOS Violations</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={refreshData}
              loading={refreshing}
              icon="refresh"
              compact
            >
              Refresh
            </Button>
            <Button 
              mode="outlined" 
              onPress={exportReport}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={24} color={theme.colors.error} />
              <View>
                <Text variant="headlineMedium">{unresolvedCount}</Text>
                <Text variant="bodySmall">Unresolved</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <XCircle size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">{criticalCount}</Text>
                <Text variant="bodySmall">Critical</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Calendar size={24} color="#FF9800" />
              <View>
                <Text variant="headlineMedium">{recentCount}</Text>
                <Text variant="bodySmall">This Week</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All Violations' },
              { key: 'unresolved', label: 'Unresolved' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'critical', label: 'Critical' },
              { key: 'recent', label: 'Recent' }
            ].map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={{ marginRight: 8 }}
              >
                {filter.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Violations List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredViolations.map(violation => (
          <Card key={violation.id} style={{ marginBottom: 12 }}>
            <List.Item
              title={`${getViolationTypeLabel(violation.type)} - ${violation.driverName}`}
              description={`${violation.vehicleNumber} • ${violation.timestamp.toLocaleString()} • ${violation.location}`}
              left={(props) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar.Icon 
                    {...props} 
                    icon={violation.resolved ? "check-circle" : "alert-circle"}
                    style={{ backgroundColor: violation.resolved ? '#4CAF50' : getSeverityColor(violation.severity) }}
                  />
                  {getViolationIcon(violation.type)}
                </View>
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Badge style={{ backgroundColor: getSeverityColor(violation.severity) }}>
                    {violation.severity}
                  </Badge>
                  {violation.resolved ? (
                    <CheckCircle size={20} color="#4CAF50" />
                  ) : (
                    <XCircle size={20} color={theme.colors.error} />
                  )}
                </View>
              )}
              onPress={() => viewViolationDetails(violation)}
            />
            
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                {violation.description}
              </Text>
              
              {violation.resolved && violation.resolvedAt && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text variant="bodySmall" style={{ color: '#4CAF50' }}>
                    Resolved {violation.resolvedAt.toLocaleString()}
                  </Text>
                </View>
              )}
              
              {!violation.resolved && (
                <Button
                  mode="outlined"
                  onPress={() => resolveViolation(violation.id)}
                  style={{ marginTop: 8, alignSelf: 'flex-start' }}
                  compact
                >
                  Mark Resolved
                </Button>
              )}
            </View>
          </Card>
        ))}
        
        {filteredViolations.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <CheckCircle size={48} color="#4CAF50" />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              No Violations Found
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              {selectedFilter === 'unresolved' 
                ? 'All HOS violations have been resolved!' 
                : 'No violations match your current filter.'}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Add Manual Violation"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Manual violation entry will be available in a future update.');
        }}
      />
    </View>
  );
}
