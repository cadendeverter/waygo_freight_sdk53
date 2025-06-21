// waygo-freight/app/(admin)/integrations/index.tsx
import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  Switch,
  Badge,
  IconButton,
  Menu,
  Divider,
  ProgressBar,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Settings,
  Plus,
  MoreVertical,
  Globe,
  Smartphone,
  CreditCard,
  MapPin,
  Truck,
  Package,
  FileText,
  Users,
  BarChart,
  Shield,
  Key,
  Wifi,
  WifiOff,
  DollarSign
} from '../../../utils/icons';

interface Integration {
  id: string;
  name: string;
  category: 'ELD' | 'TMS' | 'ERP' | 'Payment' | 'Fuel' | 'GPS' | 'Telematics' | 'Accounting' | 'CRM' | 'WMS';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending' | 'syncing';
  lastSync: Date;
  description: string;
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'complex';
  monthlyFee?: number;
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
  healthScore: number;
  errorCount: number;
  syncFrequency: string;
  apiVersion: string;
  isActive: boolean;
}

const IntegrationsManagement = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Mock integrations data
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Samsara ELD',
      category: 'ELD',
      provider: 'Samsara',
      status: 'connected',
      lastSync: new Date('2024-01-15T14:30:00'),
      description: 'Electronic Logging Device for HOS compliance and vehicle tracking',
      features: ['HOS Monitoring', 'Vehicle Tracking', 'DVIR', 'Fuel Monitoring'],
      setupComplexity: 'medium',
      monthlyFee: 45,
      dataFlow: 'bidirectional',
      healthScore: 98,
      errorCount: 2,
      syncFrequency: 'Real-time',
      apiVersion: 'v2.1',
      isActive: true
    },
    {
      id: '2',
      name: 'McLeod LoadMaster',
      category: 'TMS',
      provider: 'McLeod Software',
      status: 'connected',
      lastSync: new Date('2024-01-15T14:25:00'),
      description: 'Transportation Management System for load planning and dispatch',
      features: ['Load Management', 'Dispatch', 'Settlement', 'Reporting'],
      setupComplexity: 'complex',
      monthlyFee: 125,
      dataFlow: 'bidirectional',
      healthScore: 95,
      errorCount: 0,
      syncFrequency: '15 minutes',
      apiVersion: 'v3.0',
      isActive: true
    },
    {
      id: '3',
      name: 'Comdata Fuel Cards',
      category: 'Fuel',
      provider: 'Comdata',
      status: 'connected',
      lastSync: new Date('2024-01-15T14:20:00'),
      description: 'Fuel card management and transaction processing',
      features: ['Fuel Transactions', 'Purchase Controls', 'Reporting', 'Fraud Detection'],
      setupComplexity: 'easy',
      monthlyFee: 15,
      dataFlow: 'inbound',
      healthScore: 92,
      errorCount: 1,
      syncFrequency: 'Hourly',
      apiVersion: 'v1.8',
      isActive: true
    },
    {
      id: '4',
      name: 'QuickBooks Enterprise',
      category: 'Accounting',
      provider: 'Intuit',
      status: 'error',
      lastSync: new Date('2024-01-15T10:15:00'),
      description: 'Accounting software integration for financial management',
      features: ['Invoicing', 'Payments', 'Financial Reporting', 'Tax Management'],
      setupComplexity: 'medium',
      monthlyFee: 85,
      dataFlow: 'bidirectional',
      healthScore: 65,
      errorCount: 12,
      syncFrequency: 'Daily',
      apiVersion: 'v4.2',
      isActive: true
    },
    {
      id: '5',
      name: 'Trimble PeopleNet',
      category: 'Telematics',
      provider: 'Trimble',
      status: 'connected',
      lastSync: new Date('2024-01-15T14:28:00'),
      description: 'Advanced telematics and fleet management platform',
      features: ['Vehicle Diagnostics', 'Driver Behavior', 'Route Optimization', 'Maintenance'],
      setupComplexity: 'complex',
      monthlyFee: 65,
      dataFlow: 'bidirectional',
      healthScore: 97,
      errorCount: 0,
      syncFrequency: 'Real-time',
      apiVersion: 'v2.5',
      isActive: true
    },
    {
      id: '6',
      name: 'DAT Load Board',
      category: 'TMS',
      provider: 'DAT Solutions',
      status: 'disconnected',
      lastSync: new Date('2024-01-14T16:45:00'),
      description: 'Load board integration for freight matching and market rates',
      features: ['Load Matching', 'Rate Analytics', 'Credit Scores', 'Market Trends'],
      setupComplexity: 'easy',
      monthlyFee: 75,
      dataFlow: 'inbound',
      healthScore: 0,
      errorCount: 0,
      syncFrequency: 'On-demand',
      apiVersion: 'v3.1',
      isActive: false
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#9E9E9E';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      case 'syncing': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return XCircle;
      case 'error': return AlertTriangle;
      case 'pending': return Clock;
      case 'syncing': return ActivityIndicator;
      default: return XCircle;
    }
  };

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'ELD': return Truck;
      case 'TMS': return Package;
      case 'ERP': return Database;
      case 'Payment': return CreditCard;
      case 'Fuel': return Zap;
      case 'GPS': return MapPin;
      case 'Telematics': return BarChart;
      case 'Accounting': return FileText;
      case 'CRM': return Users;
      case 'WMS': return Database;
      default: return Globe;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const toggleIntegration = (integrationId: string) => {
    console.log(`Toggle integration: ${integrationId}`);
  };

  const configureIntegration = (integrationId: string) => {
    console.log(`Configure integration: ${integrationId}`);
  };

  const testConnection = (integrationId: string) => {
    console.log(`Test connection: ${integrationId}`);
  };

  const renderKPICard = (title: string, value: string, subtitle: string, icon: any, color: string) => (
    <Card mode="elevated" style={{ flex: 1, margin: 4 }}>
      <Card.Content style={{ alignItems: 'center', padding: 12 }}>
        <View style={{ 
          backgroundColor: color, 
          padding: 8, 
          borderRadius: 20, 
          marginBottom: 8 
        }}>
          {React.createElement(icon, { size: 24, color })}
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {subtitle}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderIntegrationCard = (integration: Integration) => {
    const StatusIcon = getStatusIcon(integration.status);
    const CategoryIcon = getCategoryIcon(integration.category);
    const statusColor = getStatusColor(integration.status);
    
    return (
      <Card key={integration.id} mode="elevated" style={{ marginBottom: 12 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ 
                backgroundColor: theme.colors.primaryContainer,
                padding: 8,
                borderRadius: 20,
                marginRight: 12
              }}>
                <CategoryIcon size={24} color={theme.colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {integration.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {integration.provider} • {integration.category}
                </Text>
              </View>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <Chip 
                mode="outlined" 
                textStyle={{ fontSize: 12 }}
                style={{ 
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: statusColor,
                  marginBottom: 4
                }}
                icon={() => {
                  if (integration.status === 'syncing') {
                    return <ActivityIndicator size={12} color={statusColor} />;
                  }
                  return <StatusIcon size={12} color={statusColor} />;
                }}
              >
                {integration.status.toUpperCase()}
              </Chip>
              
              <Menu
                visible={activeMenuId === integration.id}
                onDismiss={() => setActiveMenuId(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => setActiveMenuId(integration.id)}
                  />
                }
              >
                <Menu.Item 
                  onPress={() => {
                    configureIntegration(integration.id);
                    setActiveMenuId(null);
                  }} 
                  title="Configure" 
                  leadingIcon="cog"
                />
                <Menu.Item 
                  onPress={() => {
                    testConnection(integration.id);
                    setActiveMenuId(null);
                  }} 
                  title="Test Connection" 
                  leadingIcon="wifi"
                />
                <Divider />
                <Menu.Item 
                  onPress={() => {
                    console.log('View logs');
                    setActiveMenuId(null);
                  }} 
                  title="View Logs" 
                  leadingIcon="text-box"
                />
              </Menu>
            </View>
          </View>

          {/* Integration Description */}
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
            {integration.description}
          </Text>

          {/* Health Score and Metrics */}
          {integration.status !== 'disconnected' && (
            <View style={{ 
              backgroundColor: theme.colors.surfaceVariant,
              padding: 12,
              borderRadius: 8,
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                  Health Score
                </Text>
                <Text variant="bodySmall" style={{ 
                  fontWeight: 'bold',
                  color: getHealthScoreColor(integration.healthScore)
                }}>
                  {integration.healthScore}%
                </Text>
              </View>
              <ProgressBar 
                progress={integration.healthScore / 100} 
                color={getHealthScoreColor(integration.healthScore)}
                style={{ height: 4, borderRadius: 2, marginBottom: 8 }}
              />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Last Sync: {integration.lastSync.toLocaleTimeString()}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Frequency: {integration.syncFrequency}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    API: {integration.apiVersion}
                  </Text>
                  {integration.errorCount > 0 && (
                    <Text variant="bodySmall" style={{ color: '#F44336' }}>
                      {integration.errorCount} errors
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Features */}
          <View style={{ marginBottom: 12 }}>
            <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 6 }}>
              Features:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {integration.features.map((feature, index) => (
                <Chip 
                  key={index}
                  mode="outlined" 
                  compact
                  textStyle={{ fontSize: 11 }}
                  style={{ backgroundColor: theme.colors.surfaceVariant }}
                >
                  {feature}
                </Chip>
              ))}
            </View>
          </View>

          {/* Integration Details */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip 
                mode="outlined" 
                compact
                textStyle={{ fontSize: 11 }}
                style={{ 
                  backgroundColor: integration.setupComplexity === 'easy' ? '#C6F4D6' : 
                               integration.setupComplexity === 'medium' ? '#F7D2C4' : '#F2C4C4',
                  borderColor: integration.setupComplexity === 'easy' ? '#4CAF50' : 
                               integration.setupComplexity === 'medium' ? '#FF9800' : '#F44336'
                }}
              >
                {integration.setupComplexity} setup
              </Chip>
              
              <Chip 
                mode="outlined" 
                compact
                textStyle={{ fontSize: 11 }}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
              >
                {integration.dataFlow}
              </Chip>
            </View>
            
            {integration.monthlyFee && (
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                ${integration.monthlyFee}/mo
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button 
                mode="outlined" 
                compact
                onPress={() => configureIntegration(integration.id)}
              >
                Configure
              </Button>
              {integration.status === 'error' && (
                <Button 
                  mode="contained" 
                  compact
                  onPress={() => testConnection(integration.id)}
                >
                  Retry
                </Button>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ marginRight: 8 }}>
                {integration.isActive ? 'Active' : 'Inactive'}
              </Text>
              <Switch
                value={integration.isActive}
                onValueChange={() => toggleIntegration(integration.id)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Calculate summary metrics
  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const totalIntegrations = integrations.length;
  const averageHealthScore = Math.round(
    integrations.filter(i => i.status === 'connected').reduce((sum, i) => sum + i.healthScore, 0) / 
    integrations.filter(i => i.status === 'connected').length
  );
  const totalMonthlyFees = integrations.reduce((sum, i) => sum + (i.monthlyFee || 0), 0);
  const totalErrors = integrations.reduce((sum, i) => sum + i.errorCount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Integrations
          </Text>
          <Button 
            mode="contained"
            icon="plus"
            onPress={() => console.log('Add integration')}
          >
            Add Integration
          </Button>
        </View>

        {/* Summary KPIs - 2x2 Grid Layout */}
        <View style={{ marginBottom: 16 }}>
          {/* First Row */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {renderKPICard(
              'Connected',
              `${connectedIntegrations}/${totalIntegrations}`,
              'Active integrations',
              CheckCircle,
              '#4CAF50'
            )}
            {renderKPICard(
              'Health Score',
              `${averageHealthScore}%`,
              'Average performance',
              BarChart,
              '#2196F3'
            )}
          </View>
          
          {/* Second Row */}
          <View style={{ flexDirection: 'row' }}>
            {renderKPICard(
              'Monthly Cost',
              `$${totalMonthlyFees}`,
              'Total subscription fees',
              DollarSign,
              '#FF9800'
            )}
            {renderKPICard(
              'Active Errors',
              totalErrors.toString(),
              'Requires attention',
              AlertTriangle,
              totalErrors > 0 ? '#F44336' : '#4CAF50'
            )}
          </View>
        </View>

        {/* Integration Cards */}
        {integrations.map(renderIntegrationCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default IntegrationsManagement;
