// waygo-freight/app/(admin)/compliance/monitoring.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Alert, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { 
  Text, 
  Card, 
  Button, 
  Switch,
  Chip, 
  Searchbar, 
  Avatar, 
  Badge,
  IconButton,
  ProgressBar,
  Surface,
  Divider,
  List
} from 'react-native-paper';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  FileText, 
  CheckCircle,
  XCircle,
  Bell,
  Calendar,
  User,
  Truck,
  MapPin,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Download,
  Plus,
  Filter,
  AlertCircle,
  Activity,
  Target,
  Zap
} from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface ComplianceAlert {
  id: string;
  type: 'violation' | 'expiring' | 'overdue' | 'critical';
  category: 'eld' | 'dvir' | 'license' | 'medical' | 'insurance' | 'permit' | 'maintenance' | 'drug_test';
  title: string;
  description: string;
  entityType: 'driver' | 'vehicle' | 'company';
  entityId: string;
  entityName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  createdDate: string;
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  assignedTo?: string;
  estimatedResolution?: string;
  actionRequired: string;
  regulatoryReference?: string;
}

interface ComplianceMetrics {
  overallScore: number;
  totalAlerts: number;
  criticalAlerts: number;
  expiringSoon: number;
  overdueItems: number;
  averageResolutionTime: number;
  complianceRate: number;
  trendDirection: 'up' | 'down' | 'stable';
}

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'violation_detected' | 'document_updated' | 'inspection_completed' | 'training_completed';
  entityType: 'driver' | 'vehicle' | 'company';
  entityId: string;
  description: string;
  performedBy: string;
  impact: 'positive' | 'negative' | 'neutral';
  complianceScore: number;
}

// Mock compliance alerts data
const mockAlerts: ComplianceAlert[] = [
  {
    id: 'ALERT001',
    type: 'critical',
    category: 'eld',
    title: 'ELD Malfunction Detected',
    description: 'ELD device in vehicle V-247 has reported a critical malfunction',
    entityType: 'vehicle',
    entityId: 'V-247',
    entityName: 'Truck #247 (Freightliner)',
    severity: 'critical',
    createdDate: '2025-06-16T14:30:00Z',
    status: 'open',
    actionRequired: 'Replace ELD device immediately and submit malfunction report to FMCSA',
    regulatoryReference: '49 CFR 395.34'
  },
  {
    id: 'ALERT002',
    type: 'expiring',
    category: 'medical',
    title: 'DOT Medical Certificate Expiring',
    description: 'Driver medical certificate expires in 15 days',
    entityType: 'driver',
    entityId: 'DRV001',
    entityName: 'John Smith',
    severity: 'high',
    dueDate: '2025-07-01T00:00:00Z',
    createdDate: '2025-06-16T10:00:00Z',
    status: 'acknowledged',
    assignedTo: 'Sarah Johnson',
    estimatedResolution: '2025-06-25T00:00:00Z',
    actionRequired: 'Schedule DOT medical examination and update certificate',
    regulatoryReference: '49 CFR 391.43'
  },
  {
    id: 'ALERT003',
    type: 'overdue',
    category: 'dvir',
    title: 'Overdue DVIR Inspection',
    description: 'Daily Vehicle Inspection Report not submitted for 2 days',
    entityType: 'vehicle',
    entityId: 'V-156',
    entityName: 'Truck #156 (Peterbilt)',
    severity: 'medium',
    dueDate: '2025-06-14T23:59:59Z',
    createdDate: '2025-06-15T06:00:00Z',
    status: 'in_progress',
    assignedTo: 'Mike Wilson',
    actionRequired: 'Complete overdue DVIR inspections and submit reports',
    regulatoryReference: '49 CFR 396.11'
  },
  {
    id: 'ALERT004',
    type: 'violation',
    category: 'drug_test',
    title: 'Random Drug Test Due',
    description: 'Driver selected for random drug testing',
    entityType: 'driver',
    entityId: 'DRV003',
    entityName: 'David Brown',
    severity: 'high',
    dueDate: '2025-06-20T17:00:00Z',
    createdDate: '2025-06-16T08:00:00Z',
    status: 'open',
    actionRequired: 'Schedule drug test within 48 hours of notification',
    regulatoryReference: '49 CFR 382.305'
  },
  {
    id: 'ALERT005',
    type: 'expiring',
    category: 'license',
    title: 'CDL License Renewal Required',
    description: 'Commercial driver license expires in 30 days',
    entityType: 'driver',
    entityId: 'DRV002',
    entityName: 'Sarah Johnson',
    severity: 'medium',
    dueDate: '2025-07-16T00:00:00Z',
    createdDate: '2025-06-16T06:00:00Z',
    status: 'open',
    actionRequired: 'Begin CDL renewal process and update license information',
    regulatoryReference: '49 CFR 383.71'
  }
];

const mockMetrics: ComplianceMetrics = {
  overallScore: 87.5,
  totalAlerts: 23,
  criticalAlerts: 1,
  expiringSoon: 8,
  overdueItems: 3,
  averageResolutionTime: 2.4,
  complianceRate: 94.2,
  trendDirection: 'up'
};

const mockAuditEvents: AuditEvent[] = [
  {
    id: 'AUDIT001',
    timestamp: '2025-06-16T14:30:00Z',
    eventType: 'violation_detected',
    entityType: 'vehicle',
    entityId: 'V-247',
    description: 'ELD malfunction detected during routine monitoring',
    performedBy: 'System Auto-Detection',
    impact: 'negative',
    complianceScore: -5.2
  },
  {
    id: 'AUDIT002',
    timestamp: '2025-06-16T10:15:00Z',
    eventType: 'training_completed',
    entityType: 'driver',
    entityId: 'DRV005',
    description: 'Defensive driving training completed',
    performedBy: 'Training Department',
    impact: 'positive',
    complianceScore: 2.1
  },
  {
    id: 'AUDIT003',
    timestamp: '2025-06-15T16:45:00Z',
    eventType: 'inspection_completed',
    entityType: 'vehicle',
    entityId: 'V-198',
    description: 'Level 1 DOT inspection passed with no violations',
    performedBy: 'DOT Inspector',
    impact: 'positive',
    complianceScore: 3.8
  },
  {
    id: 'AUDIT004',
    timestamp: '2025-06-15T11:30:00Z',
    eventType: 'document_updated',
    entityType: 'driver',
    entityId: 'DRV007',
    description: 'Drug test results updated - negative',
    performedBy: 'HR Department',
    impact: 'positive',
    complianceScore: 1.5
  }
];

const ComplianceMonitoringScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'audit' | 'metrics'>('alerts');
  const [alerts] = useState<ComplianceAlert[]>(mockAlerts);
  const [metrics] = useState<ComplianceMetrics>(mockMetrics);
  const [auditEvents] = useState<AuditEvent[]>(mockAuditEvents);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'critical': return '#B71C1C';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return AlertCircle;
      case 'critical': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'eld': return Activity;
      case 'dvir': return FileText;
      case 'license': return User;
      case 'medical': return Shield;
      case 'insurance': return Shield;
      case 'permit': return FileText;
      case 'maintenance': return Truck;
      case 'drug_test': return Shield;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#F44336';
      case 'acknowledged': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.entityName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'all' || 
      alert.severity === selectedFilter ||
      alert.status === selectedFilter ||
      alert.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleAcknowledgeAlert = (alertId: string) => {
    Alert.alert(
      'Acknowledge Alert',
      'Mark this alert as acknowledged?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Acknowledge', 
          onPress: () => {
            // Here you would update the alert status
            Alert.alert('Success', 'Alert acknowledged');
          }
        }
      ]
    );
  };

  const handleResolveAlert = (alertId: string) => {
    Alert.alert(
      'Resolve Alert',
      'Mark this alert as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Resolve', 
          onPress: () => {
            // Here you would update the alert status
            Alert.alert('Success', 'Alert marked as resolved');
          }
        }
      ]
    );
  };

  const renderMetricsCards = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Shield size={24} color={theme.colors.primary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {metrics.overallScore}%
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Compliance Score
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <AlertTriangle size={24} color='#F44336' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {metrics.criticalAlerts}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Critical Alerts
            </Text>
          </View>
        </Card>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Clock size={24} color='#FF9800' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {metrics.expiringSoon}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Expiring Soon
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <TrendingUp size={24} color='#4CAF50' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {metrics.averageResolutionTime}d
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Avg Resolution
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );

  const renderTabChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 16, marginBottom: 16 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['alerts', 'audit', 'metrics'] as const).map((tab) => (
          <Chip
            key={tab}
            selected={selectedTab === tab}
            onPress={() => setSelectedTab(tab)}
            showSelectedCheck={false}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 16, marginBottom: 16 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['all', 'critical', 'high', 'open', 'overdue'].map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            showSelectedCheck={false}
            mode="outlined"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  const renderAlertCard = (alert: ComplianceAlert) => {
    const SeverityIcon = getSeverityIcon(alert.severity);
    const CategoryIcon = getCategoryIcon(alert.category);
    
    return (
      <Card key={alert.id} style={{ marginBottom: 12, marginHorizontal: 16 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Avatar.Icon
              size={40}
              icon={() => <CategoryIcon size={20} color="white" />}
              style={{ backgroundColor: getSeverityColor(alert.severity) }}
            />
            
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16 }}>
                    {alert.title}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                    {alert.entityName} • {alert.category.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 14, marginTop: 4 }}>
                    {alert.description}
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Chip 
                    mode="flat"
                    textStyle={{ fontSize: 10 }}
                    style={{ 
                      height: 20,
                      backgroundColor: getSeverityColor(alert.severity) + '20'
                    }}
                  >
                    {alert.severity.toUpperCase()}
                  </Chip>
                  <Badge 
                    style={{ 
                      backgroundColor: getStatusColor(alert.status),
                      marginTop: 4
                    }}
                  >
                    {alert.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </View>
              </View>
              
              {alert.dueDate && (
                <View style={{ 
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: theme.colors.errorContainer,
                  borderRadius: 4
                }}>
                  <Text style={{ 
                    fontSize: 12, 
                    color: theme.colors.onErrorContainer,
                    fontWeight: '500'
                  }}>
                    Due: {new Date(alert.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              <Text style={{ 
                fontSize: 12, 
                marginTop: 8,
                fontStyle: 'italic',
                color: theme.colors.onSurfaceVariant
              }}>
                Action Required: {alert.actionRequired}
              </Text>
              
              {alert.regulatoryReference && (
                <Text style={{ 
                  fontSize: 10, 
                  marginTop: 4,
                  color: theme.colors.primary,
                  fontWeight: '500'
                }}>
                  Regulatory Reference: {alert.regulatoryReference}
                </Text>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    mode="outlined"
                    compact
                    icon={() => <Eye size={16} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('View Details', 'View full alert details')}
                  >
                    Details
                  </Button>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {alert.status === 'open' && (
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== 'resolved' && (
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderAuditTab = () => (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      {auditEvents.map((event) => (
        <Card key={event.id} style={{ marginBottom: 12 }}>
          <List.Item
            title={event.description}
            description={`${event.entityType}: ${event.entityId} • ${new Date(event.timestamp).toLocaleString()}`}
            left={(props) => (
              <Avatar.Icon 
                {...props} 
                icon={() => <Activity size={20} color={theme.colors.onSecondaryContainer} />}
                style={{ 
                  backgroundColor: event.impact === 'positive' ? '#4CAF50' : 
                                  event.impact === 'negative' ? '#F44336' : 
                                  theme.colors.secondaryContainer
                }}
              />
            )}
            right={(props) => (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ 
                  fontWeight: '600',
                  color: event.complianceScore > 0 ? '#4CAF50' : '#F44336'
                }}>
                  {event.complianceScore > 0 ? '+' : ''}{event.complianceScore}
                </Text>
                <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>
                  Score Impact
                </Text>
              </View>
            )}
          />
        </Card>
      ))}
    </View>
  );

  const renderMetricsTab = () => (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Compliance Overview
        </Text>
        
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text>Overall Compliance Score</Text>
            <Text style={{ fontWeight: '600' }}>{metrics.overallScore}%</Text>
          </View>
          <ProgressBar progress={metrics.overallScore / 100} color={theme.colors.primary} />
        </View>
        
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text>Compliance Rate</Text>
            <Text style={{ fontWeight: '600' }}>{metrics.complianceRate}%</Text>
          </View>
          <ProgressBar progress={metrics.complianceRate / 100} color='#4CAF50' />
        </View>

        <Divider style={{ marginVertical: 12 }} />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Total Alerts
            </Text>
            <Text style={{ fontWeight: '600', fontSize: 18 }}>
              {metrics.totalAlerts}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Overdue Items
            </Text>
            <Text style={{ fontWeight: '600', fontSize: 18 }}>
              {metrics.overdueItems}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Trend
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {metrics.trendDirection === 'up' ? 
                <TrendingUp size={16} color='#4CAF50' /> :
                metrics.trendDirection === 'down' ?
                <TrendingDown size={16} color='#F44336' /> :
                <Activity size={16} color={theme.colors.onSurfaceVariant} />
              }
              <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                {metrics.trendDirection.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'Compliance Monitoring',
          headerShown: true,
          headerTitleAlign: 'center',
          headerRight: () => (
            <IconButton
              icon={() => <Download size={24} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Export', 'Export compliance report')}
            />
          )
        }} 
      />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderMetricsCards()}
        
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search compliance items..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

        {renderTabChips()}

        {selectedTab === 'alerts' && (
          <>
            {renderFilterChips()}
            
            <View style={{ flex: 1 }}>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map(renderAlertCard)
              ) : (
                <View style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: 32
                }}>
                  <Shield size={48} color={theme.colors.onSurfaceVariant} />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    marginTop: 16,
                    color: theme.colors.onSurfaceVariant
                  }}>
                    No compliance alerts found
                  </Text>
                  <Text style={{ 
                    textAlign: 'center', 
                    marginTop: 8,
                    color: theme.colors.onSurfaceVariant
                  }}>
                    {searchQuery || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filter'
                      : 'All compliance items are up to date'
                    }
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {selectedTab === 'audit' && renderAuditTab()}
        {selectedTab === 'metrics' && renderMetricsTab()}

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ComplianceMonitoringScreen;
