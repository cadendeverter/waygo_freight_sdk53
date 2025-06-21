// waygo-freight/app/(admin)/users/permissions.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Switch, Chip, List, Divider, Searchbar, Avatar, Badge } from 'react-native-paper';
import { Shield, Users, Lock, Eye, Edit, Settings, CheckCircle, XCircle, AlertTriangle } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isDefault: boolean;
  canEdit: boolean;
}

interface UserRole {
  userId: string;
  userName: string;
  email: string;
  currentRole: string;
  lastLogin: string;
  isActive: boolean;
}

// Mock permissions data
const mockPermissions: Permission[] = [
  // Fleet Management
  { id: 'fleet_view', name: 'View Fleet', description: 'View fleet vehicles and drivers', category: 'Fleet', riskLevel: 'low' },
  { id: 'fleet_edit', name: 'Edit Fleet', description: 'Add, edit, and remove vehicles', category: 'Fleet', riskLevel: 'medium' },
  { id: 'fleet_maintenance', name: 'Fleet Maintenance', description: 'Schedule and manage maintenance', category: 'Fleet', riskLevel: 'medium' },
  { id: 'driver_assign', name: 'Driver Assignment', description: 'Assign drivers to vehicles and loads', category: 'Fleet', riskLevel: 'medium' },
  
  // Load Management
  { id: 'load_view', name: 'View Loads', description: 'View load information and status', category: 'Loads', riskLevel: 'low' },
  { id: 'load_create', name: 'Create Loads', description: 'Create new load assignments', category: 'Loads', riskLevel: 'medium' },
  { id: 'load_edit', name: 'Edit Loads', description: 'Modify existing loads', category: 'Loads', riskLevel: 'medium' },
  { id: 'load_delete', name: 'Delete Loads', description: 'Remove loads from system', category: 'Loads', riskLevel: 'high' },
  { id: 'load_pricing', name: 'Load Pricing', description: 'Set and modify load rates', category: 'Loads', riskLevel: 'high' },
  
  // Financial
  { id: 'finance_view', name: 'View Financials', description: 'View financial reports and data', category: 'Finance', riskLevel: 'medium' },
  { id: 'finance_edit', name: 'Edit Financials', description: 'Modify financial records', category: 'Finance', riskLevel: 'high' },
  { id: 'invoice_create', name: 'Create Invoices', description: 'Generate customer invoices', category: 'Finance', riskLevel: 'medium' },
  { id: 'payment_process', name: 'Process Payments', description: 'Handle payment processing', category: 'Finance', riskLevel: 'high' },
  { id: 'expense_approve', name: 'Approve Expenses', description: 'Approve driver and operational expenses', category: 'Finance', riskLevel: 'high' },
  
  // Compliance
  { id: 'compliance_view', name: 'View Compliance', description: 'View compliance records and reports', category: 'Compliance', riskLevel: 'low' },
  { id: 'compliance_manage', name: 'Manage Compliance', description: 'Update compliance records', category: 'Compliance', riskLevel: 'medium' },
  { id: 'incident_report', name: 'Incident Reporting', description: 'Create and manage incident reports', category: 'Compliance', riskLevel: 'medium' },
  { id: 'audit_access', name: 'Audit Access', description: 'Access audit trails and logs', category: 'Compliance', riskLevel: 'high' },
  
  // Administration
  { id: 'user_view', name: 'View Users', description: 'View user accounts and profiles', category: 'Admin', riskLevel: 'medium' },
  { id: 'user_manage', name: 'Manage Users', description: 'Create, edit, and deactivate users', category: 'Admin', riskLevel: 'high' },
  { id: 'role_manage', name: 'Manage Roles', description: 'Create and modify user roles', category: 'Admin', riskLevel: 'high' },
  { id: 'system_config', name: 'System Configuration', description: 'Configure system settings', category: 'Admin', riskLevel: 'high' },
  { id: 'integration_manage', name: 'Manage Integrations', description: 'Configure external integrations', category: 'Admin', riskLevel: 'high' },
  
  // Analytics
  { id: 'analytics_view', name: 'View Analytics', description: 'Access reports and analytics', category: 'Analytics', riskLevel: 'low' },
  { id: 'analytics_export', name: 'Export Data', description: 'Export reports and data', category: 'Analytics', riskLevel: 'medium' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Access advanced reporting features', category: 'Analytics', riskLevel: 'medium' }
];

// Mock roles data
const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    userCount: 2,
    permissions: mockPermissions.map(p => p.id),
    isDefault: false,
    canEdit: true
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    description: 'Load management and driver coordination',
    userCount: 5,
    permissions: ['fleet_view', 'driver_assign', 'load_view', 'load_create', 'load_edit', 'compliance_view', 'analytics_view'],
    isDefault: false,
    canEdit: true
  },
  {
    id: 'driver',
    name: 'Driver',
    description: 'Basic driver access for mobile app',
    userCount: 25,
    permissions: ['load_view', 'compliance_view'],
    isDefault: true,
    canEdit: false
  },
  {
    id: 'warehouse',
    name: 'Warehouse Staff',
    description: 'Warehouse and inventory management',
    userCount: 8,
    permissions: ['load_view', 'compliance_view', 'analytics_view'],
    isDefault: false,
    canEdit: true
  },
  {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Financial operations and reporting',
    userCount: 3,
    permissions: ['finance_view', 'finance_edit', 'invoice_create', 'expense_approve', 'analytics_view', 'analytics_export'],
    isDefault: false,
    canEdit: true
  },
  {
    id: 'compliance',
    name: 'Compliance Officer',
    description: 'Safety and compliance oversight',
    userCount: 2,
    permissions: ['compliance_view', 'compliance_manage', 'incident_report', 'audit_access', 'analytics_view'],
    isDefault: false,
    canEdit: true
  }
];

// Mock user roles data
const mockUserRoles: UserRole[] = [
  { userId: 'USR001', userName: 'John Smith', email: 'john.driver@waygo.com', currentRole: 'driver', lastLogin: '2025-06-16T10:30:00Z', isActive: true },
  { userId: 'USR002', userName: 'Sarah Johnson', email: 'sarah.dispatch@waygo.com', currentRole: 'dispatcher', lastLogin: '2025-06-16T14:15:00Z', isActive: true },
  { userId: 'USR003', userName: 'Mike Chen', email: 'mike.warehouse@waygo.com', currentRole: 'warehouse', lastLogin: '2025-06-10T16:45:00Z', isActive: false },
  { userId: 'USR004', userName: 'Lisa Rodriguez', email: 'lisa.finance@waygo.com', currentRole: 'finance', lastLogin: '2025-06-16T09:20:00Z', isActive: true },
  { userId: 'USR005', userName: 'David Wilson', email: 'david.compliance@waygo.com', currentRole: 'compliance', lastLogin: '2025-06-15T13:45:00Z', isActive: true }
];

const PermissionsScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPermissions = mockPermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = mockUserRoles.filter(userRole =>
    userRole.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userRole.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return theme.colors.primary;
      case 'medium': return '#FF9800';
      case 'high': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return XCircle;
      default: return Shield;
    }
  };

  const groupedPermissions = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setTempPermissions([...role.permissions]);
    setEditingPermissions(true);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setTempPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    
    Alert.alert(
      'Save Changes',
      `Update permissions for ${selectedRole.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => {
            // Here you would save to backend
            setEditingPermissions(false);
            setSelectedRole(null);
            Alert.alert('Success', 'Role permissions updated successfully');
          }
        }
      ]
    );
  };

  const renderTabChips = () => (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 }}>
      {(['roles', 'permissions', 'users'] as const).map((tab) => (
        <Chip
          key={tab}
          selected={selectedTab === tab}
          onPress={() => setSelectedTab(tab)}
          style={{ marginRight: 8 }}
          showSelectedCheck={false}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Chip>
      ))}
    </View>
  );

  const renderRolesTab = () => (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      {filteredRoles.map((role) => (
        <Card key={role.id} style={{ marginBottom: 12 }}>
          <List.Item
            title={role.name}
            description={`${role.description} • ${role.userCount} users • ${role.permissions.length} permissions`}
            left={(props) => (
              <Avatar.Icon 
                {...props} 
                icon={() => <Shield size={24} color={theme.colors.onSecondaryContainer} />}
                style={{ backgroundColor: theme.colors.secondaryContainer }}
              />
            )}
            right={(props) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Badge visible={role.isDefault} style={{ marginRight: 8 }}>Default</Badge>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleEditRole(role)}
                  disabled={!role.canEdit}
                >
                  Edit
                </Button>
              </View>
            )}
          />
        </Card>
      ))}
    </View>
  );

  const renderPermissionsTab = () => (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      {Object.entries(groupedPermissions).map(([category, permissions]) => (
        <View key={category} style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            marginBottom: 8,
            color: theme.colors.primary 
          }}>
            {category}
          </Text>
          {permissions.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((permission) => {
            const RiskIcon = getRiskLevelIcon(permission.riskLevel);
            return (
              <Card key={permission.id} style={{ marginBottom: 8 }}>
                <List.Item
                  title={permission.name}
                  description={permission.description}
                  left={(props) => (
                    <RiskIcon 
                      size={20} 
                      color={getRiskLevelColor(permission.riskLevel)}
                      style={{ marginTop: 12 }}
                    />
                  )}
                  right={(props) => (
                    <Chip 
                      mode="outlined"
                      textStyle={{ fontSize: 10 }}
                      style={{ height: 24 }}
                    >
                      {permission.riskLevel.toUpperCase()}
                    </Chip>
                  )}
                />
              </Card>
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderUsersTab = () => (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      {filteredUsers.map((userRole) => {
        const role = mockRoles.find(r => r.id === userRole.currentRole);
        return (
          <Card key={userRole.userId} style={{ marginBottom: 12 }}>
            <List.Item
              title={userRole.userName}
              description={`${userRole.email} • Last login: ${new Date(userRole.lastLogin).toLocaleDateString()}`}
              left={(props) => (
                <Avatar.Text 
                  {...props} 
                  label={userRole.userName.split(' ').map(n => n[0]).join('')}
                  size={40}
                />
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end' }}>
                  <Chip 
                    mode={userRole.isActive ? 'flat' : 'outlined'}
                    textStyle={{ fontSize: 10 }}
                    style={{ 
                      height: 24, 
                      backgroundColor: userRole.isActive ? theme.colors.primaryContainer : 'transparent'
                    }}
                  >
                    {role?.name || 'Unknown'}
                  </Chip>
                  <Badge 
                    visible={!userRole.isActive}
                    style={{ 
                      backgroundColor: theme.colors.error, 
                      marginTop: 4,
                      fontSize: 8
                    }}
                  >
                    Inactive
                  </Badge>
                </View>
              )}
            />
          </Card>
        );
      })}
    </View>
  );

  if (editingPermissions && selectedRole) {
    return (
      <ScreenWrapper>
        <Stack.Screen 
          options={{ 
            title: `Edit ${selectedRole.name}`,
            headerShown: true,
            headerTitleAlign: 'center'
          }} 
        />
        
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Role Information
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {selectedRole.description}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
                Currently assigned to {selectedRole.userCount} users
              </Text>
            </Card>

            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <Card key={category} style={{ marginBottom: 16 }}>
                <View style={{ padding: 16 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    marginBottom: 12,
                    color: theme.colors.primary 
                  }}>
                    {category}
                  </Text>
                  
                  {permissions.map((permission) => {
                    const isSelected = tempPermissions.includes(permission.id);
                    const RiskIcon = getRiskLevelIcon(permission.riskLevel);
                    
                    return (
                      <View key={permission.id} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.outline + '20'
                      }}>
                        <RiskIcon 
                          size={16} 
                          color={getRiskLevelColor(permission.riskLevel)}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ fontWeight: '500' }}>
                            {permission.name}
                          </Text>
                          <Text style={{ 
                            fontSize: 12, 
                            color: theme.colors.onSurfaceVariant 
                          }}>
                            {permission.description}
                          </Text>
                        </View>
                        <Chip 
                          mode="outlined"
                          textStyle={{ fontSize: 8 }}
                          style={{ height: 20, marginRight: 8 }}
                        >
                          {permission.riskLevel.toUpperCase()}
                        </Chip>
                        <Switch
                          value={isSelected}
                          onValueChange={() => handlePermissionToggle(permission.id)}
                        />
                      </View>
                    );
                  })}
                </View>
              </Card>
            ))}
          </ScrollView>
          
          <View style={{ 
            flexDirection: 'row', 
            padding: 16, 
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline + '20'
          }}>
            <Button
              mode="outlined"
              onPress={() => {
                setEditingPermissions(false);
                setSelectedRole(null);
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSavePermissions}
              style={{ flex: 1 }}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'Permissions & Roles',
          headerShown: true,
          headerTitleAlign: 'center'
        }} 
      />
      
      <View style={{ flex: 1 }}>
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Searchbar
            placeholder={`Search ${selectedTab}...`}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />
        </View>

        {renderTabChips()}

        <ScrollView style={{ flex: 1 }}>
          {selectedTab === 'roles' && renderRolesTab()}
          {selectedTab === 'permissions' && renderPermissionsTab()}
          {selectedTab === 'users' && renderUsersTab()}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default PermissionsScreen;
