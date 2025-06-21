import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  useTheme,
  SegmentedButtons,
  Checkbox,
  Divider,
  Surface,
  List,
  Switch
} from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Phone, Building2, Shield, ArrowLeft, Save } from '../../../utils/icons';

const { width } = Dimensions.get('window');

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'dispatcher' | 'driver' | 'customer' | 'warehouse';
  companyName: string;
  employeeId: string;
  isActive: boolean;
  permissions: string[];
}

const rolePermissions = {
  admin: ['all'],
  dispatcher: ['loads', 'drivers', 'routing', 'reports'],
  driver: ['loads', 'eld', 'navigation', 'expenses'],
  customer: ['tracking', 'orders', 'invoices'],
  warehouse: ['inventory', 'receiving', 'shipping']
};

export default function CreateUserScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'driver',
    companyName: '',
    employeeId: '',
    isActive: true,
    permissions: rolePermissions.driver
  });

  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
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
    roleButton: {
      marginBottom: 8,
    },
    permissionItem: {
      paddingVertical: 8,
    },
    footer: {
      padding: 16,
      paddingBottom: Math.max(16, insets.bottom), // Account for home indicator on newer iPhones
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      maxWidth: (width - 44) / 2, // Ensure buttons fit on screen with padding
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
  });

  const handleRoleChange = (newRole: string) => {
    const role = newRole as keyof typeof rolePermissions;
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role] || []
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'User created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'driver', label: 'Driver' },
    { value: 'customer', label: 'Customer' },
    { value: 'warehouse', label: 'Warehouse' },
  ];

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
          Create New User
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="First Name *"
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Email Address *"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
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
              value={formData.companyName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon={() => <Building2 size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Employee ID"
              value={formData.employeeId}
              onChangeText={(text) => setFormData(prev => ({ ...prev, employeeId: text }))}
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
              value={formData.role}
              onValueChange={handleRoleChange}
              buttons={roleOptions}
              style={{ marginBottom: 16 }}
            />

            <Divider style={{ marginVertical: 16 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              Default Permissions for {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            </Text>
            
            {formData.permissions.map((permission, index) => (
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
                value={formData.isActive}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
              />
            </View>
            
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Active users can log in and access the system
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.button}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSave}
          style={styles.button}
          loading={loading}
          disabled={loading}
          icon={() => <Save size={20} color="#FFFFFF" />}
        >
          Create User
        </Button>
      </View>
    </View>
  );
}
