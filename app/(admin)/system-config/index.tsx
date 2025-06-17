// waygo-freight/app/(admin)/system-config/index.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, TextInput, Switch, Chip, List, Divider } from 'react-native-paper';
import { Settings, Shield, Bell, Globe, Database, Key, Mail, Phone, MapPin, Save, RefreshCw } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

// Mock system configuration
const mockSystemConfig = {
  company: {
    name: 'WayGo Freight Solutions',
    address: '123 Business Park Dr, Dallas, TX 75201',
    phone: '+1 (555) 123-WAYGO',
    email: 'support@waygofreight.com',
    website: 'https://waygofreight.com',
    taxId: '12-3456789'
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    slackWebhook: 'https://hooks.slack.com/services/...',
    alertThresholds: {
      lateDelivery: 30, // minutes
      fuelPrice: 4.50, // per gallon
      maintenanceDue: 7 // days
    }
  },
  integrations: {
    googleMapsApiKey: 'AIzaSy...',
    twilioAccountSid: 'AC...',
    stripePublishableKey: 'pk_...',
    quickbooksEnabled: false,
    macromessageEnabled: true
  },
  security: {
    passwordMinLength: 8,
    requireMfa: false,
    sessionTimeout: 480, // minutes
    loginAttempts: 5,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
  },
  operations: {
    defaultFuelRate: 4.25,
    mileageRate: 0.65,
    overtimeThreshold: 8, // hours
    hosRuleSet: 'US_70_HOUR',
    autoDispatch: false,
    requireSignature: true
  }
};

function SystemConfigScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [config, setConfig] = useState(mockSystemConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setConfig(mockSystemConfig);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConfig();
    }, [fetchConfig])
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasChanges(false);
      Alert.alert('Success', 'Configuration saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedConfig = (section: string, subsection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const renderCompanySettings = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Globe size={24} color={theme.colors.primary} />
          <Heading variant="h3" style={{ marginLeft: 12 }}>Company Information</Heading>
        </View>

        <TextInput
          label="Company Name"
          value={config.company.name}
          onChangeText={(value) => updateConfig('company', 'name', value)}
          mode="outlined"
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Address"
          value={config.company.address}
          onChangeText={(value) => updateConfig('company', 'address', value)}
          mode="outlined"
          multiline
          style={{ marginBottom: 12 }}
        />

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            label="Phone"
            value={config.company.phone}
            onChangeText={(value) => updateConfig('company', 'phone', value)}
            mode="outlined"
            style={{ flex: 1 }}
          />
          <TextInput
            label="Email"
            value={config.company.email}
            onChangeText={(value) => updateConfig('company', 'email', value)}
            mode="outlined"
            style={{ flex: 1 }}
          />
        </View>

        <TextInput
          label="Website"
          value={config.company.website}
          onChangeText={(value) => updateConfig('company', 'website', value)}
          mode="outlined"
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Tax ID"
          value={config.company.taxId}
          onChangeText={(value) => updateConfig('company', 'taxId', value)}
          mode="outlined"
        />
      </Card.Content>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Bell size={24} color={theme.colors.primary} />
          <Heading variant="h3" style={{ marginLeft: 12 }}>Notifications</Heading>
        </View>

        <List.Item
          title="Email Notifications"
          description="Send notifications via email"
          right={() => (
            <Switch
              value={config.notifications.emailEnabled}
              onValueChange={(value) => updateConfig('notifications', 'emailEnabled', value)}
            />
          )}
        />

        <List.Item
          title="SMS Notifications"
          description="Send notifications via SMS"
          right={() => (
            <Switch
              value={config.notifications.smsEnabled}
              onValueChange={(value) => updateConfig('notifications', 'smsEnabled', value)}
            />
          )}
        />

        <List.Item
          title="Push Notifications"
          description="Send push notifications to mobile devices"
          right={() => (
            <Switch
              value={config.notifications.pushEnabled}
              onValueChange={(value) => updateConfig('notifications', 'pushEnabled', value)}
            />
          )}
        />

        <Divider style={{ marginVertical: 8 }} />

        <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: '600' }}>
          Alert Thresholds
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            label="Late Delivery (min)"
            value={config.notifications.alertThresholds.lateDelivery.toString()}
            onChangeText={(value) => updateNestedConfig('notifications', 'alertThresholds', 'lateDelivery', parseInt(value) || 0)}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <TextInput
            label="Fuel Price ($)"
            value={config.notifications.alertThresholds.fuelPrice.toString()}
            onChangeText={(value) => updateNestedConfig('notifications', 'alertThresholds', 'fuelPrice', parseFloat(value) || 0)}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
        </View>

        <TextInput
          label="Maintenance Due (days)"
          value={config.notifications.alertThresholds.maintenanceDue.toString()}
          onChangeText={(value) => updateNestedConfig('notifications', 'alertThresholds', 'maintenanceDue', parseInt(value) || 0)}
          mode="outlined"
          keyboardType="numeric"
        />
      </Card.Content>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Shield size={24} color={theme.colors.primary} />
          <Heading variant="h3" style={{ marginLeft: 12 }}>Security</Heading>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            label="Min Password Length"
            value={config.security.passwordMinLength.toString()}
            onChangeText={(value) => updateConfig('security', 'passwordMinLength', parseInt(value) || 8)}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <TextInput
            label="Session Timeout (min)"
            value={config.security.sessionTimeout.toString()}
            onChangeText={(value) => updateConfig('security', 'sessionTimeout', parseInt(value) || 480)}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
        </View>

        <List.Item
          title="Require Multi-Factor Authentication"
          description="Force MFA for all users"
          right={() => (
            <Switch
              value={config.security.requireMfa}
              onValueChange={(value) => updateConfig('security', 'requireMfa', value)}
            />
          )}
        />

        <TextInput
          label="Max Login Attempts"
          value={config.security.loginAttempts.toString()}
          onChangeText={(value) => updateConfig('security', 'loginAttempts', parseInt(value) || 5)}
          mode="outlined"
          keyboardType="numeric"
          style={{ marginBottom: 12 }}
        />

        <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '600' }}>
          IP Whitelist
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {config.security.ipWhitelist.map((ip, index) => (
            <Chip key={index} mode="outlined" onClose={() => {
              const newList = config.security.ipWhitelist.filter((_, i) => i !== index);
              updateConfig('security', 'ipWhitelist', newList);
            }}>
              {ip}
            </Chip>
          ))}
        </View>
        <Button mode="outlined" compact onPress={() => {/* Add IP dialog */}}>
          Add IP Range
        </Button>
      </Card.Content>
    </Card>
  );

  const renderOperationsSettings = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Settings size={24} color={theme.colors.primary} />
          <Heading variant="h3" style={{ marginLeft: 12 }}>Operations</Heading>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            label="Default Fuel Rate ($)"
            value={config.operations.defaultFuelRate.toString()}
            onChangeText={(value) => updateConfig('operations', 'defaultFuelRate', parseFloat(value) || 0)}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <TextInput
            label="Mileage Rate ($/mi)"
            value={config.operations.mileageRate.toString()}
            onChangeText={(value) => updateConfig('operations', 'mileageRate', parseFloat(value) || 0)}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
        </View>

        <TextInput
          label="Overtime Threshold (hours)"
          value={config.operations.overtimeThreshold.toString()}
          onChangeText={(value) => updateConfig('operations', 'overtimeThreshold', parseInt(value) || 8)}
          mode="outlined"
          keyboardType="numeric"
          style={{ marginBottom: 12 }}
        />

        <List.Item
          title="Auto Dispatch"
          description="Automatically assign loads to available drivers"
          right={() => (
            <Switch
              value={config.operations.autoDispatch}
              onValueChange={(value) => updateConfig('operations', 'autoDispatch', value)}
            />
          )}
        />

        <List.Item
          title="Require Signature"
          description="Require digital signature for deliveries"
          right={() => (
            <Switch
              value={config.operations.requireSignature}
              onValueChange={(value) => updateConfig('operations', 'requireSignature', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'System Configuration' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Heading variant="h1">System Config</Heading>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Configure system settings and preferences
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={fetchConfig}
              icon={() => <RefreshCw size={16} color={theme.colors.primary} />}
              compact
            >
              Reset
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSave}
              loading={saving}
              disabled={!hasChanges}
              icon={() => <Save size={16} color="white" />}
              compact
            >
              Save
            </Button>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCompanySettings()}
        {renderNotificationSettings()}
        {renderSecuritySettings()}
        {renderOperationsSettings()}
        
        <View style={{ padding: 16 }}>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/admin/system-config/backup')}
            style={{ marginBottom: 8 }}
          >
            Backup & Restore
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/admin/system-config/logs')}
          >
            View System Logs
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default SystemConfigScreen;
