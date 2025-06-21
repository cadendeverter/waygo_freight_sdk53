// waygo-freight/app/(admin)/system/multi-tenant.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, Surface, 
  Dialog, Portal, TextInput, List, DataTable,
  FAB, ProgressBar, Menu, IconButton, ActivityIndicator,
  Searchbar, Switch
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Building, Users, Database, Shield, Settings, 
  CheckCircle, AlertTriangle, TrendingUp, Globe,
  Key, Lock, Eye, MoreVertical, Plus
} from '../../../utils/icons';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Trial';
  plan: 'Starter' | 'Professional' | 'Enterprise' | 'Custom';
  userCount: number;
  maxUsers: number;
  storageUsed: number;
  storageLimit: number;
  createdDate: string;
  lastActivity: string;
  features: string[];
  billing: {
    amount: number;
    cycle: 'Monthly' | 'Annual';
    nextBilling: string;
    status: 'Current' | 'Overdue' | 'Cancelled';
  };
}

interface SystemMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  storageUsed: number;
  totalRevenue: number;
  averageUsersPerTenant: number;
}

export default function MultiTenantAdmin() {
  const theme = useTheme();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TENANTS' | 'BILLING' | 'SECURITY'>('OVERVIEW');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantDetailVisible, setTenantDetailVisible] = useState(false);
  const [newTenantVisible, setNewTenantVisible] = useState(false);

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      const sampleTenants: Tenant[] = [
        {
          id: 'TENANT001',
          name: 'ABC Logistics Inc',
          domain: 'abc-logistics',
          status: 'Active',
          plan: 'Enterprise',
          userCount: 45,
          maxUsers: 100,
          storageUsed: 2.3,
          storageLimit: 10,
          createdDate: '2023-06-15',
          lastActivity: '2024-01-16T10:30:00Z',
          features: ['Advanced Analytics', 'Custom Integrations', 'Priority Support', 'Multi-location'],
          billing: {
            amount: 2499,
            cycle: 'Monthly',
            nextBilling: '2024-02-01',
            status: 'Current'
          }
        },
        {
          id: 'TENANT002',
          name: 'XYZ Transport Co',
          domain: 'xyz-transport',
          status: 'Active',
          plan: 'Professional',
          userCount: 12,
          maxUsers: 25,
          storageUsed: 0.8,
          storageLimit: 5,
          createdDate: '2023-09-22',
          lastActivity: '2024-01-16T09:45:00Z',
          features: ['Basic Analytics', 'Standard Integrations', 'Email Support'],
          billing: {
            amount: 499,
            cycle: 'Monthly',
            nextBilling: '2024-02-01',
            status: 'Current'
          }
        },
        {
          id: 'TENANT003',
          name: 'Freight Solutions LLC',
          domain: 'freight-solutions',
          status: 'Trial',
          plan: 'Starter',
          userCount: 3,
          maxUsers: 5,
          storageUsed: 0.1,
          storageLimit: 1,
          createdDate: '2024-01-10',
          lastActivity: '2024-01-16T08:20:00Z',
          features: ['Basic Features', 'Community Support'],
          billing: {
            amount: 0,
            cycle: 'Monthly',
            nextBilling: '2024-02-10',
            status: 'Current'
          }
        }
      ];

      const sampleMetrics: SystemMetrics = {
        totalTenants: 47,
        activeTenants: 42,
        totalUsers: 1247,
        storageUsed: 89.3,
        totalRevenue: 45750,
        averageUsersPerTenant: 26.5
      };

      setTenants(sampleTenants);
      setMetrics(sampleMetrics);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': case 'Current': return '#4CAF50';
      case 'Trial': case 'Inactive': return '#FF9800';
      case 'Suspended': case 'Overdue': case 'Cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': case 'Custom': return '#9C27B0';
      case 'Professional': return '#2196F3';
      case 'Starter': return '#4CAF50';
      default: return '#757575';
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOverview = () => (
    <ScrollView>
      {/* System Metrics */}
      {metrics && (
        <View style={{ padding: 16 }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>System Overview</Text>
          
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Card style={{ flex: 1, marginRight: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <Building size={28} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Total Tenants</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                  {metrics.totalTenants}
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={{ flex: 1, marginLeft: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <CheckCircle size={28} color="#4CAF50" />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Active</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {metrics.activeTenants}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Card style={{ flex: 1, marginRight: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <Users size={28} color={theme.colors.secondary} />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Total Users</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                  {metrics.totalUsers.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={{ flex: 1, marginLeft: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <TrendingUp size={28} color="#4CAF50" />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Revenue</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  ${metrics.totalRevenue.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      )}

      {/* Recent Activity */}
      <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Recent Activity</Text>
        
        {tenants.slice(0, 5).map(tenant => (
          <View key={tenant.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{tenant.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Last active: {new Date(tenant.lastActivity).toLocaleString()}
                </Text>
              </View>
              <Chip 
                compact 
                style={{ backgroundColor: getStatusColor(tenant.status) + '20' }}
                textStyle={{ color: getStatusColor(tenant.status), fontSize: 10 }}
              >
                {tenant.status}
              </Chip>
            </View>
          </View>
        ))}
      </Surface>
    </ScrollView>
  );

  const renderTenants = () => (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <Searchbar
          placeholder="Search tenants..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {filteredTenants.map(tenant => (
          <Card key={tenant.id} style={{ marginBottom: 12 }} onPress={() => {
            setSelectedTenant(tenant);
            setTenantDetailVisible(true);
          }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{tenant.name}</Text>
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8,
                        backgroundColor: getStatusColor(tenant.status) + '20' 
                      }}
                      textStyle={{ color: getStatusColor(tenant.status), fontSize: 10 }}
                    >
                      {tenant.status}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium">Domain: {tenant.domain}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {tenant.plan} Plan • {tenant.userCount}/{tenant.maxUsers} users
                  </Text>
                  
                  <View style={{ marginTop: 8 }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Storage: {tenant.storageUsed}GB / {tenant.storageLimit}GB
                    </Text>
                    <ProgressBar 
                      progress={tenant.storageUsed / tenant.storageLimit} 
                      style={{ marginTop: 4 }}
                      color={tenant.storageUsed / tenant.storageLimit > 0.8 ? '#f44336' : theme.colors.primary}
                    />
                  </View>

                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Revenue: ${tenant.billing.amount}/month
                  </Text>
                </View>
                
                <IconButton 
                  icon="more-vertical" 
                  size={20}
                  onPress={() => {
                    setSelectedTenant(tenant);
                    setTenantDetailVisible(true);
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading tenant data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ elevation: 1 }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Multi-Tenant Admin</Text>
          <IconButton icon="settings" onPress={() => Alert.alert('Settings', 'System configuration settings')} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'OVERVIEW', label: 'Overview', icon: 'view-dashboard' },
              { key: 'TENANTS', label: 'Tenants', icon: 'domain' },
              { key: 'BILLING', label: 'Billing', icon: 'credit-card' },
              { key: 'SECURITY', label: 'Security', icon: 'shield' }
            ].map(tab => (
              <Chip
                key={tab.key}
                selected={activeTab === tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{ marginRight: 8 }}
                mode={activeTab === tab.key ? 'flat' : 'outlined'}
                icon={tab.icon}
              >
                {tab.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      {/* Content */}
      {activeTab === 'OVERVIEW' && renderOverview()}
      {activeTab === 'TENANTS' && renderTenants()}
      {activeTab === 'BILLING' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Billing Management</Text>
          <Text style={{ marginTop: 8 }}>Manage tenant billing, subscriptions, and payments.</Text>
        </ScrollView>
      )}
      {activeTab === 'SECURITY' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Security Center</Text>
          <Text style={{ marginTop: 8 }}>Monitor security across all tenants and configure policies.</Text>
        </ScrollView>
      )}

      {/* Tenant Detail Dialog */}
      <Portal>
        <Dialog visible={tenantDetailVisible} onDismiss={() => setTenantDetailVisible(false)}>
          <Dialog.Title>Tenant Details</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 400 }}>
              {selectedTenant && (
                <View>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    {selectedTenant.name}
                  </Text>
                  
                  <View style={{ marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Basic Info</Text>
                    <Text variant="bodyMedium">Domain: {selectedTenant.domain}</Text>
                    <Text variant="bodyMedium">Status: {selectedTenant.status}</Text>
                    <Text variant="bodyMedium">Plan: {selectedTenant.plan}</Text>
                    <Text variant="bodyMedium">Created: {new Date(selectedTenant.createdDate).toLocaleDateString()}</Text>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Usage</Text>
                    <Text variant="bodyMedium">Users: {selectedTenant.userCount}/{selectedTenant.maxUsers}</Text>
                    <Text variant="bodyMedium">Storage: {selectedTenant.storageUsed}GB/{selectedTenant.storageLimit}GB</Text>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Billing</Text>
                    <Text variant="bodyMedium">Amount: ${selectedTenant.billing.amount}/{selectedTenant.billing.cycle.toLowerCase()}</Text>
                    <Text variant="bodyMedium">Next Billing: {new Date(selectedTenant.billing.nextBilling).toLocaleDateString()}</Text>
                    <Text variant="bodyMedium">Status: {selectedTenant.billing.status}</Text>
                  </View>

                  <View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Features</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {selectedTenant.features.map((feature, index) => (
                        <Chip key={index} compact style={{ margin: 2 }}>{feature}</Chip>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTenantDetailVisible(false)}>Close</Button>
            <Button mode="contained" onPress={() => Alert.alert('Edit', 'Edit tenant configuration')}>Edit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        label="New Tenant"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => setNewTenantVisible(true)}
      />
    </SafeAreaView>
  );
}
