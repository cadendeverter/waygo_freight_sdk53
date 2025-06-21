// waygo-freight/app/(admin)/operations/system-health.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  ProgressBar,
  Badge,
  IconButton,
  Surface,
  Divider,
  List,
  FAB,
  Dialog,
  Portal,
  Switch,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  HardDrive,
  Cpu,
  BarChart,
  TrendingUp,
  TrendingDown,
  Settings,
  RefreshCw,
  Download,
  Bell,
  Eye,
  Filter
} from '../../../utils/icons';

interface SystemMetrics {
  id: string;
  name: string;
  category: 'API' | 'DATABASE' | 'INTEGRATION' | 'HARDWARE' | 'NETWORK' | 'SECURITY';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  uptime: number; // percentage
  responseTime: number; // milliseconds
  lastCheck: Date;
  details: SystemDetails;
}

interface SystemDetails {
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  activeConnections?: number;
  errorRate?: number;
  throughput?: number;
  latency?: number;
  certificates?: CertificateInfo[];
  alerts?: SystemAlert[];
}

interface CertificateInfo {
  name: string;
  expiresAt: Date;
  daysUntilExpiry: number;
  status: 'VALID' | 'EXPIRING' | 'EXPIRED';
}

interface SystemAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

interface PerformanceMetric {
  timestamp: Date;
  value: number;
  metric: string;
}

const SystemHealthMonitoring: React.FC = () => {
  const theme = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [alertsVisible, setAlertsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([
    {
      id: 'api_gateway',
      name: 'API Gateway',
      category: 'API',
      status: 'HEALTHY',
      uptime: 99.9,
      responseTime: 45,
      lastCheck: new Date(),
      details: {
        activeConnections: 1247,
        throughput: 850,
        errorRate: 0.1,
        latency: 45
      }
    },
    {
      id: 'firebase_auth',
      name: 'Firebase Authentication',
      category: 'API',
      status: 'HEALTHY',
      uptime: 100.0,
      responseTime: 78,
      lastCheck: new Date(),
      details: {
        activeConnections: 234,
        throughput: 125,
        errorRate: 0.0,
        latency: 78
      }
    },
    {
      id: 'firestore_db',
      name: 'Firestore Database',
      category: 'DATABASE',
      status: 'HEALTHY',
      uptime: 99.8,
      responseTime: 23,
      lastCheck: new Date(),
      details: {
        activeConnections: 67,
        throughput: 456,
        errorRate: 0.2,
        latency: 23
      }
    },
    {
      id: 'tms_integration',
      name: 'TMS Integration',
      category: 'INTEGRATION',
      status: 'WARNING',
      uptime: 97.5,
      responseTime: 156,
      lastCheck: new Date(),
      details: {
        activeConnections: 12,
        throughput: 34,
        errorRate: 2.3,
        latency: 156,
        alerts: [
          {
            id: 'tms_alert_1',
            severity: 'MEDIUM',
            message: 'High response time detected',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            acknowledged: false
          }
        ]
      }
    },
    {
      id: 'eld_hardware',
      name: 'ELD Hardware Connection',
      category: 'HARDWARE',
      status: 'HEALTHY',
      uptime: 98.9,
      responseTime: 89,
      lastCheck: new Date(),
      details: {
        activeConnections: 45,
        throughput: 120,
        errorRate: 1.1,
        latency: 89
      }
    },
    {
      id: 'ssl_certificates',
      name: 'SSL Certificates',
      category: 'SECURITY',
      status: 'WARNING',
      uptime: 100.0,
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        certificates: [
          {
            name: 'waygo.com',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            daysUntilExpiry: 30,
            status: 'EXPIRING'
          },
          {
            name: 'api.waygo.com',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            daysUntilExpiry: 90,
            status: 'VALID'
          }
        ]
      }
    },
    {
      id: 'fuel_card_api',
      name: 'Fuel Card API',
      category: 'INTEGRATION',
      status: 'CRITICAL',
      uptime: 85.2,
      responseTime: 2340,
      lastCheck: new Date(),
      details: {
        activeConnections: 3,
        throughput: 5,
        errorRate: 14.8,
        latency: 2340,
        alerts: [
          {
            id: 'fuel_alert_1',
            severity: 'CRITICAL',
            message: 'Service experiencing frequent timeouts',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            acknowledged: false
          }
        ]
      }
    }
  ]);

  const categories = ['ALL', 'API', 'DATABASE', 'INTEGRATION', 'HARDWARE', 'NETWORK', 'SECURITY'];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Simulate system health check
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      lastCheck: new Date(),
      responseTime: metric.responseTime + (Math.random() - 0.5) * 20,
      uptime: Math.min(100, metric.uptime + (Math.random() - 0.5) * 0.1),
      details: {
        ...metric.details,
        latency: metric.details.latency ? metric.details.latency + (Math.random() - 0.5) * 10 : undefined
      }
    })));
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(onRefresh, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, onRefresh]);

  const getStatusColor = (status: SystemMetrics['status']) => {
    switch (status) {
      case 'HEALTHY': return '#4caf50';
      case 'WARNING': return '#ff9800';
      case 'CRITICAL': return '#f44336';
      case 'OFFLINE': return '#757575';
      default: return theme.colors.onSurface;
    }
  };

  const getStatusIcon = (status: SystemMetrics['status']) => {
    switch (status) {
      case 'HEALTHY': return CheckCircle;
      case 'WARNING': return AlertTriangle;
      case 'CRITICAL': return XCircle;
      case 'OFFLINE': return WifiOff;
      default: return Activity;
    }
  };

  const getCategoryIcon = (category: SystemMetrics['category']) => {
    switch (category) {
      case 'API': return Globe;
      case 'DATABASE': return Database;
      case 'INTEGRATION': return Zap;
      case 'HARDWARE': return HardDrive;
      case 'NETWORK': return Wifi;
      case 'SECURITY': return Shield;
      default: return Server;
    }
  };

  const acknowledgeAlert = (metricId: string, alertId: string) => {
    setSystemMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? {
            ...metric,
            details: {
              ...metric.details,
              alerts: metric.details.alerts?.map(alert =>
                alert.id === alertId ? { ...alert, acknowledged: true } : alert
              )
            }
          }
        : metric
    ));
  };

  const filteredMetrics = selectedCategory === 'ALL' 
    ? systemMetrics 
    : systemMetrics.filter(metric => metric.category === selectedCategory);

  const overallHealth = {
    healthy: systemMetrics.filter(m => m.status === 'HEALTHY').length,
    warning: systemMetrics.filter(m => m.status === 'WARNING').length,
    critical: systemMetrics.filter(m => m.status === 'CRITICAL').length,
    offline: systemMetrics.filter(m => m.status === 'OFFLINE').length,
    avgUptime: systemMetrics.reduce((acc, m) => acc + m.uptime, 0) / systemMetrics.length,
    avgResponseTime: systemMetrics.reduce((acc, m) => acc + m.responseTime, 0) / systemMetrics.length
  };

  const unacknowledgedAlerts = systemMetrics.flatMap(m => 
    m.details.alerts?.filter(a => !a.acknowledged) || []
  ).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
              System Health
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
              Real-time system monitoring & alerts
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton 
              icon={Bell} 
              onPress={() => setAlertsVisible(true)}
            />
            {unacknowledgedAlerts > 0 && (
              <Badge 
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 40,
                  backgroundColor: theme.colors.error 
                }}
              >
                {unacknowledgedAlerts}
              </Badge>
            )}
            <IconButton 
              icon={Settings} 
              onPress={() => setSettingsVisible(true)}
            />
          </View>
        </View>
      </Surface>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Health Summary */}
        <Card style={{ margin: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              System Overview
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {overallHealth.healthy}
                </Text>
                <Text variant="bodySmall">Healthy</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#ff9800', fontWeight: 'bold' }}>
                  {overallHealth.warning}
                </Text>
                <Text variant="bodySmall">Warning</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#f44336', fontWeight: 'bold' }}>
                  {overallHealth.critical}
                </Text>
                <Text variant="bodySmall">Critical</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#757575', fontWeight: 'bold' }}>
                  {overallHealth.offline}
                </Text>
                <Text variant="bodySmall">Offline</Text>
              </View>
            </View>

            <Divider style={{ marginVertical: 16 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  Average Uptime
                </Text>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  {overallHealth.avgUptime.toFixed(1)}%
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  Average Response Time
                </Text>
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  {Math.round(overallHealth.avgResponseTime)}ms
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Category Filter */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row' }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={{ marginRight: 8 }}
                  mode={selectedCategory === category ? 'flat' : 'outlined'}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* System Metrics */}
        {filteredMetrics.map((metric) => {
          const StatusIcon = getStatusIcon(metric.status);
          const CategoryIcon = getCategoryIcon(metric.category);
          
          return (
            <Card key={metric.id} style={{ margin: 16, marginTop: 0 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <CategoryIcon size={24} color={theme.colors.primary} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {metric.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                        {metric.category} • Last check: {metric.lastCheck.toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <StatusIcon size={20} color={getStatusColor(metric.status)} />
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8,
                        backgroundColor: getStatusColor(metric.status) + '20'
                      }}
                      textStyle={{ color: getStatusColor(metric.status) }}
                    >
                      {metric.status}
                    </Chip>
                  </View>
                </View>

                {/* Uptime Progress */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Uptime</Text>
                    <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                      {metric.uptime.toFixed(1)}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={metric.uptime / 100} 
                    color={getStatusColor(metric.status)}
                  />
                </View>

                {/* Metrics Grid */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                      Response Time
                    </Text>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                      {Math.round(metric.responseTime)}ms
                    </Text>
                  </View>
                  
                  {metric.details.activeConnections && (
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                        Connections
                      </Text>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                        {metric.details.activeConnections}
                      </Text>
                    </View>
                  )}
                  
                  {metric.details.errorRate !== undefined && (
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                        Error Rate
                      </Text>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold', color: metric.details.errorRate > 5 ? '#f44336' : theme.colors.onSurface }}>
                        {metric.details.errorRate.toFixed(1)}%
                      </Text>
                    </View>
                  )}

                  {metric.details.throughput && (
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                        Throughput
                      </Text>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                        {metric.details.throughput}/min
                      </Text>
                    </View>
                  )}
                </View>

                {/* Alerts */}
                {metric.details.alerts && metric.details.alerts.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Divider style={{ marginBottom: 12 }} />
                    <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      Active Alerts
                    </Text>
                    {metric.details.alerts.map((alert) => (
                      <Card key={alert.id} style={{ 
                        marginBottom: 8,
                        backgroundColor: alert.acknowledged ? theme.colors.surfaceVariant : '#fff3e0'
                      }}>
                        <Card.Content style={{ padding: 12 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Chip 
                                  compact 
                                  style={{ 
                                    backgroundColor: alert.severity === 'CRITICAL' ? '#f44336' : '#ff9800',
                                    marginRight: 8
                                  }}
                                  textStyle={{ color: 'white', fontSize: 10 }}
                                >
                                  {alert.severity}
                                </Chip>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                                  {alert.timestamp.toLocaleTimeString()}
                                </Text>
                              </View>
                              <Text variant="bodyMedium">
                                {alert.message}
                              </Text>
                            </View>
                            {!alert.acknowledged && (
                              <Button 
                                mode="text" 
                                compact
                                onPress={() => acknowledgeAlert(metric.id, alert.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </View>
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                )}

                {/* SSL Certificates */}
                {metric.details.certificates && (
                  <View style={{ marginTop: 16 }}>
                    <Divider style={{ marginBottom: 12 }} />
                    <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      SSL Certificates
                    </Text>
                    {metric.details.certificates.map((cert, index) => (
                      <View key={index} style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth: index < metric.details.certificates!.length - 1 ? 1 : 0,
                        borderBottomColor: theme.colors.outline
                      }}>
                        <View>
                          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                            {cert.name}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                            Expires: {cert.expiresAt.toLocaleDateString()}
                          </Text>
                        </View>
                        <Chip 
                          compact
                          style={{ 
                            backgroundColor: cert.status === 'VALID' ? '#4caf50' : 
                                           cert.status === 'EXPIRING' ? '#ff9800' : '#f44336'
                          }}
                          textStyle={{ color: 'white' }}
                        >
                          {cert.daysUntilExpiry} days
                        </Chip>
                      </View>
                    ))}
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      {/* Settings Dialog */}
      <Portal>
        <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
          <Dialog.Title>Monitoring Settings</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Auto Refresh"
              description="Automatically refresh system status"
              right={() => (
                <Switch
                  value={autoRefresh}
                  onValueChange={setAutoRefresh}
                />
              )}
            />
            {autoRefresh && (
              <List.Item
                title="Refresh Interval"
                description={`${refreshInterval} seconds`}
                right={() => (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Button onPress={() => setRefreshInterval(Math.max(10, refreshInterval - 10))}>
                      -
                    </Button>
                    <Text style={{ marginHorizontal: 16 }}>{refreshInterval}s</Text>
                    <Button onPress={() => setRefreshInterval(refreshInterval + 10)}>
                      +
                    </Button>
                  </View>
                )}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB for manual refresh */}
      <FAB
        icon={RefreshCw}
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={onRefresh}
        loading={refreshing}
      />
    </SafeAreaView>
  );
};

export default SystemHealthMonitoring;
