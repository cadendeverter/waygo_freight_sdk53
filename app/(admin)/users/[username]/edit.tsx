import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  useTheme,
  SegmentedButtons,
  Divider,
  List,
  Switch,
  ActivityIndicator
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { User, Mail, Phone, Building2, Shield, ArrowLeft, Save, Edit } from '../../../../utils/icons';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'dispatcher' | 'driver' | 'customer' | 'warehouse';
  companyName: string;
  employeeId: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  lastLogin: string;
}

const rolePermissions = {
  admin: ['all'],
  dispatcher: ['loads', 'drivers', 'routing', 'reports'],
  driver: ['loads', 'eld', 'navigation', 'expenses'],
  customer: ['tracking', 'orders', 'invoices'],
  warehouse: ['inventory', 'receiving', 'shipping']
};

// Mock user data
const mockUserData: { [key: string]: UserData } = {
  'johnsmith': {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@waygofreight.com',
    phone: '+1 (555) 123-4567',
    role: 'driver',
    companyName: 'WayGo Freight',
    employeeId: 'EMP001',
    isActive: true,
    permissions: ['loads', 'eld', 'navigation', 'expenses'],
    createdAt: '2024-01-15',
    lastLogin: '2025-06-19'
  },
  'sarahjohnson': {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@waygofreight.com',
    phone: '+1 (555) 234-5678',
    role: 'dispatcher',
    companyName: 'WayGo Freight',
    employeeId: 'EMP002',
    isActive: true,
    permissions: ['loads', 'drivers', 'routing', 'reports'],
    createdAt: '2024-02-20',
    lastLogin: '2025-06-19'
  }
};

export default function EditUserScreen() {
  const theme = useTheme();
  const { username } = useLocalSearchParams<{ username: string }>();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    input: {
      marginBottom: 16,
    },
    permissionItem: {
      paddingVertical: 8,
    },
    footer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUserData[username || ''];
      if (user) {
        setUserData(user);
      } else {
        Alert.alert('Error', 'User not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    if (!userData) return;
    
    const role = newRole as keyof typeof rolePermissions;
    setUserData(prev => prev ? ({
      ...prev,
      role,
      permissions: rolePermissions[role] || []
    }) : null);
  };

  const handleSave = async () => {
    if (!userData) return;

    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'User updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'driver', label: 'Driver' },
    { value: 'customer', label: 'Customer' },
    { value: 'warehouse', label: 'Warehouse' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading user data...</Text>
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button 
          mode="text" 
          onPress={() => router.back()}
          icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
          style={{ marginRight: 8 }}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={{ flex: 1, color: theme.colors.onSurface }}>
          Edit User: {userData.firstName} {userData.lastName}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="First Name *"
              value={userData.firstName}
              onChangeText={(text) => updateUserData('firstName', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Last Name *"
              value={userData.lastName}
              onChangeText={(text) => updateUserData('lastName', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Email Address *"
              value={userData.email}
              onChangeText={(text) => updateUserData('email', text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Phone Number"
              value={userData.phone}
              onChangeText={(text) => updateUserData('phone', text)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon={() => <Phone size={20} color={theme.colors.onSurfaceVariant} />} />}
            />
          </Card.Content>
        </Card>

        {/* Company Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Company Information</Text>
            
            <TextInput
              label="Company Name"
              value={userData.companyName}
              onChangeText={(text) => updateUserData('companyName', text)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon={() => <Building2 size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Employee ID"
              value={userData.employeeId}
              onChangeText={(text) => updateUserData('employeeId', text)}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Role Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Role & Permissions</Text>
            
            <SegmentedButtons
              value={userData.role}
              onValueChange={handleRoleChange}
              buttons={roleOptions}
              style={{ marginBottom: 16 }}
            />

            <Divider style={{ marginVertical: 16 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              Current Permissions
            </Text>
            
            {userData.permissions.map((permission, index) => (
              <List.Item
                key={index}
                title={permission === 'all' ? 'Full Administrative Access' : permission.charAt(0).toUpperCase() + permission.slice(1)}
                left={() => <Shield size={20} color={theme.colors.primary} />}
                style={styles.permissionItem}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Active User</Text>
              <Switch
                value={userData.isActive}
                onValueChange={(value) => updateUserData('isActive', value)}
              />
            </View>
            
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Active users can log in and access the system
            </Text>

            <Divider style={{ marginVertical: 16 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              Account Information
            </Text>
            
            <List.Item
              title="Created"
              description={new Date(userData.createdAt).toLocaleDateString()}
              left={() => <User size={20} color={theme.colors.onSurfaceVariant} />}
            />
            
            <List.Item
              title="Last Login"
              description={new Date(userData.lastLogin).toLocaleDateString()}
              left={() => <User size={20} color={theme.colors.onSurfaceVariant} />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.button}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSave}
          style={styles.button}
          loading={saving}
          disabled={saving}
          icon={() => <Save size={20} color="#FFFFFF" />}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
}
