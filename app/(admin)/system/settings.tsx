import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Switch, List, Button, ActivityIndicator, Divider, Portal, Dialog, TextInput } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useAuth } from '../../../state/authContext';
import { Settings, Shield, Database, Bell, Clock, Users, HardDrive } from '../../../utils/icons';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface SystemConfig {
  id: string;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
  autoBackupEnabled: boolean;
  sessionTimeoutMinutes: number;
  maxUsers: number;
  dataRetentionDays: number;
  twoFactorRequired: boolean;
  passwordExpiryDays: number;
  allowGuestAccess: boolean;
  companyId: string;
  updatedAt: Date;
  updatedBy: string;
}

const defaultConfig: SystemConfig = {
  id: 'default',
  notificationsEnabled: true,
  maintenanceMode: false,
  autoBackupEnabled: true,
  sessionTimeoutMinutes: 60,
  maxUsers: 50,
  dataRetentionDays: 365,
  twoFactorRequired: false,
  passwordExpiryDays: 90,
  allowGuestAccess: false,
  companyId: 'dev-company',
  updatedAt: new Date(),
  updatedBy: 'system'
};

export default function SystemSettingsScreen() {
  const theme = useTheme();
  const { user, isDevMode } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'session' | 'retention' | 'maxUsers' | 'passwordExpiry'>('session');
  const [dialogValue, setDialogValue] = useState('');

  useEffect(() => {
    if (isDevMode || !user?.companyId) {
      setConfig(defaultConfig);
      setLoading(false);
      return;
    }

    const configDocRef = doc(db, 'system_configs', user.companyId);
    
    const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          id: docSnap.id,
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SystemConfig);
      } else {
        setConfig({ ...defaultConfig, companyId: user.companyId });
      }
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching system config:', error);
      setConfig(defaultConfig);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.companyId, isDevMode]);

  const updateConfig = async (updates: Partial<SystemConfig>) => {
    if (isDevMode || !user?.companyId) {
      setConfig(prev => ({ ...prev, ...updates }));
      return;
    }

    setSaving(true);
    try {
      const configDocRef = doc(db, 'system_configs', user.companyId);
      await updateDoc(configDocRef, {
        ...updates,
        updatedAt: new Date(),
        updatedBy: user.email || 'unknown'
      });
    } catch (error) {
      console.error('Error updating system config:', error);
      Alert.alert('Error', 'Failed to update system configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDialogConfirm = () => {
    const numValue = parseInt(dialogValue);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid positive number.');
      return;
    }

    const updates: Partial<SystemConfig> = {};
    switch (dialogType) {
      case 'session':
        updates.sessionTimeoutMinutes = numValue;
        break;
      case 'retention':
        updates.dataRetentionDays = numValue;
        break;
      case 'maxUsers':
        updates.maxUsers = numValue;
        break;
      case 'passwordExpiry':
        updates.passwordExpiryDays = numValue;
        break;
    }

    updateConfig(updates);
    setDialogVisible(false);
    setDialogValue('');
  };

  const openDialog = (type: typeof dialogType, currentValue: number) => {
    setDialogType(type);
    setDialogValue(currentValue.toString());
    setDialogVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'session': return 'Session Timeout (Minutes)';
      case 'retention': return 'Data Retention (Days)';
      case 'maxUsers': return 'Maximum Users';
      case 'passwordExpiry': return 'Password Expiry (Days)';
      default: return 'Setting';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Loading system settings...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Settings size={32} color={theme.colors.primary} style={{ marginRight: 12 }} />
            <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
              System Settings
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Configure system-wide settings and preferences
          </Text>
        </View>

        {/* General Settings */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Bell size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  General Configuration
                </Text>
              </View>
              
              <List.Item
                title="Push Notifications"
                description="Enable system-wide push notifications"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={config.notificationsEnabled}
                    onValueChange={(value) => updateConfig({ notificationsEnabled: value })}
                    disabled={saving}
                  />
                )}
              />
              
              <Divider style={{ marginVertical: 8 }} />
              
              <List.Item
                title="Maintenance Mode"
                description="Put system in maintenance mode (restricted access)"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={config.maintenanceMode}
                    onValueChange={(value) => updateConfig({ maintenanceMode: value })}
                    disabled={saving}
                  />
                )}
              />

              <Divider style={{ marginVertical: 8 }} />

              <List.Item
                title="Allow Guest Access"
                description="Allow users to access limited features without authentication"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={config.allowGuestAccess}
                    onValueChange={(value) => updateConfig({ allowGuestAccess: value })}
                    disabled={saving}
                  />
                )}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Security Settings */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Shield size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Security Settings
                </Text>
              </View>

              <List.Item
                title="Two-Factor Authentication"
                description="Require 2FA for all user accounts"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={config.twoFactorRequired}
                    onValueChange={(value) => updateConfig({ twoFactorRequired: value })}
                    disabled={saving}
                  />
                )}
              />

              <Divider style={{ marginVertical: 8 }} />

              <List.Item
                title="Session Timeout"
                description={`Auto-logout after ${config.sessionTimeoutMinutes} minutes of inactivity`}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                onPress={() => openDialog('session', config.sessionTimeoutMinutes)}
              />

              <Divider style={{ marginVertical: 8 }} />

              <List.Item
                title="Password Expiry"
                description={`Passwords expire after ${config.passwordExpiryDays} days`}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                onPress={() => openDialog('passwordExpiry', config.passwordExpiryDays)}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Data Management */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Database size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Data Management
                </Text>
              </View>

              <List.Item
                title="Auto Backup"
                description="Enable automatic daily backups"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={config.autoBackupEnabled}
                    onValueChange={(value) => updateConfig({ autoBackupEnabled: value })}
                    disabled={saving}
                  />
                )}
              />

              <Divider style={{ marginVertical: 8 }} />

              <List.Item
                title="Data Retention"
                description={`Keep data for ${config.dataRetentionDays} days before archival`}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                onPress={() => openDialog('retention', config.dataRetentionDays)}
              />
            </Card.Content>
          </Card>
        </View>

        {/* User Management */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Users size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  User Management
                </Text>
              </View>

              <List.Item
                title="Maximum Users"
                description={`System supports up to ${config.maxUsers} concurrent users`}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                onPress={() => openDialog('maxUsers', config.maxUsers)}
              />
            </Card.Content>
          </Card>
        </View>

        {/* System Information */}
        <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <HardDrive size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  System Information
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Company ID: {config.companyId}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Last Updated: {config.updatedAt.toLocaleDateString()} {config.updatedAt.toLocaleTimeString()}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Updated By: {config.updatedBy}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Mode: {isDevMode ? 'Development' : 'Production'}
                </Text>
              </View>

              {saving && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                  <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Saving changes...
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Dialog for numeric inputs */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{getDialogTitle()}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Value"
              value={dialogValue}
              onChangeText={setDialogValue}
              keyboardType="numeric"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDialogConfirm}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}
