import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  List, 
  Avatar, 
  Button, 
  Switch, 
  Divider, 
  Surface,
  IconButton,
  Portal,
  Modal,
  TextInput,
  Chip,
  ProgressBar,
  Badge
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../state/authContext';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Camera, 
  Edit, 
  LogOut, 
  Key, 
  HelpCircle, 
  FileText, 
  Star,
  Clock,
  Truck,
  Package,
  TrendingUp,
  Award,
  Calendar
} from '../../utils/icons';

const { width } = Dimensions.get('window');

interface UserStats {
  totalDeliveries: number;
  onTimeDeliveries: number;
  totalMiles: number;
  hoursLogged: number;
  rating: number;
  joinDate: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loadUpdates: boolean;
  scheduleReminders: boolean;
  emergencyAlerts: boolean;
}

interface AppPreferences {
  darkMode: boolean;
  language: string;
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  offlineMode: boolean;
}

interface UserProfile {
  displayName?: string;
  email?: string;
  phone?: string;
  appRole?: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    loadUpdates: true,
    scheduleReminders: true,
    emergencyAlerts: true,
  });
  const [appPreferences, setAppPreferences] = useState<AppPreferences>({
    darkMode: false,
    language: 'English',
    units: 'imperial',
    autoRefresh: true,
    offlineMode: false,
  });

  // Mock user stats - in production, fetch from backend
  const userStats: UserStats = {
    totalDeliveries: 247,
    onTimeDeliveries: 241,
    totalMiles: 45678,
    hoursLogged: 1234,
    rating: 4.8,
    joinDate: '2024-01-15',
  };

  const [editedProfile, setEditedProfile] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    address: '',
    emergencyContact: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const onTimePercentage = (userStats.onTimeDeliveries / userStats.totalDeliveries) * 100;

  const handleProfileUpdate = () => {
    // In production, update user profile via API
    console.log('Updating profile:', editedProfile);
    setEditModalVisible(false);
    // Show success message
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    // In production, change password via API
    console.log('Changing password');
    setChangePasswordVisible(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    Alert.alert('Success', 'Password changed successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    // In production, save to backend
  };

  const updateAppPreference = (key: keyof AppPreferences, value: any) => {
    setAppPreferences(prev => ({ ...prev, [key]: value }));
    // In production, save to backend
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return theme.colors.error;
      case 'dispatcher': return theme.colors.primary;
      case 'driver': return theme.colors.tertiary;
      case 'customer': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  const getRoleBadgeText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'dispatcher': return 'Dispatcher';
      case 'driver': return 'Driver';
      case 'customer': return 'Customer';
      case 'manager': return 'Manager';
      case 'warehouse': return 'Warehouse';
      case 'finance': return 'Finance';
      case 'compliance': return 'Compliance';
      default: return 'User';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label={user?.displayName?.[0] || user?.email?.[0] || 'U'}
                style={[styles.avatar, { backgroundColor: getRoleColor(user?.appRole || '') + '20' }]}
              />
              <IconButton
                icon={() => <Camera size={20} color={theme.colors.onPrimary} />}
                mode="contained"
                size={32}
                style={styles.cameraButton}
                onPress={() => {/* Handle photo upload */}}
              />
            </View>
            
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Chip 
                mode="outlined" 
                style={[styles.roleChip, { borderColor: getRoleColor(user?.appRole || '') }]}
                textStyle={{ color: getRoleColor(user?.appRole || '') }}
              >
                {getRoleBadgeText(user?.appRole || 'user')}
              </Chip>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email}
              </Text>
              {user?.phone && (
                <Text variant="bodySmall" style={styles.userPhone}>
                  📞 {user.phone}
                </Text>
              )}
            </View>

            <IconButton
              icon={() => <Edit size={20} color={theme.colors.primary} />}
              mode="outlined"
              size={40}
              onPress={() => setEditModalVisible(true)}
            />
          </View>
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance Stats for Drivers */}
        {user?.appRole === 'driver' && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Performance Overview
              </Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Package size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={styles.statLabel}>Deliveries</Text>
                  <Text variant="titleLarge" style={styles.statValue}>{userStats.totalDeliveries}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <TrendingUp size={24} color={theme.colors.tertiary} />
                  <Text variant="bodySmall" style={styles.statLabel}>On-Time Rate</Text>
                  <Text variant="titleLarge" style={styles.statValue}>{onTimePercentage.toFixed(1)}%</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Truck size={24} color={theme.colors.secondary} />
                  <Text variant="bodySmall" style={styles.statLabel}>Miles Driven</Text>
                  <Text variant="titleLarge" style={styles.statValue}>{userStats.totalMiles.toLocaleString()}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Star size={24} color={theme.colors.error} />
                  <Text variant="bodySmall" style={styles.statLabel}>Rating</Text>
                  <Text variant="titleLarge" style={styles.statValue}>{userStats.rating}/5.0</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text variant="bodyMedium" style={styles.progressLabel}>
                  On-Time Delivery Rate
                </Text>
                <ProgressBar 
                  progress={onTimePercentage / 100} 
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.progressText}>
                  {userStats.onTimeDeliveries} of {userStats.totalDeliveries} deliveries on time
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              <Button 
                mode="outlined" 
                onPress={() => router.push('/(admin)/emergency')}
                style={styles.quickActionButton}
                icon={() => <Phone size={20} color={theme.colors.error} />}
                buttonColor={theme.colors.errorContainer}
              >
                Emergency
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => router.push('/(admin)/documents')}
                style={styles.quickActionButton}
                icon={() => <FileText size={20} color={theme.colors.primary} />}
              >
                Documents
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => router.push('/(admin)/system/settings')}
                style={styles.quickActionButton}
                icon={() => <Settings size={20} color={theme.colors.secondary} />}
              >
                Settings
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => router.push('/(admin)/billing/subscription')}
                style={styles.quickActionButton}
                icon={() => <Award size={20} color={theme.colors.tertiary} />}
              >
                Billing
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notification Settings
            </Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive notifications on this device"
              left={() => <Bell size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={notificationSettings.pushNotifications}
                  onValueChange={(value) => updateNotificationSetting('pushNotifications', value)}
                />
              )}
            />
            
            <List.Item
              title="Email Notifications"
              description="Receive updates via email"
              left={() => <Mail size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={notificationSettings.emailNotifications}
                  onValueChange={(value) => updateNotificationSetting('emailNotifications', value)}
                />
              )}
            />
            
            <List.Item
              title="SMS Notifications"
              description="Receive urgent updates via SMS"
              left={() => <Phone size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={notificationSettings.smsNotifications}
                  onValueChange={(value) => updateNotificationSetting('smsNotifications', value)}
                />
              )}
            />
            
            <List.Item
              title="Load Updates"
              description="Notifications for load status changes"
              left={() => <Package size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={notificationSettings.loadUpdates}
                  onValueChange={(value) => updateNotificationSetting('loadUpdates', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* App Preferences */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              App Preferences
            </Text>
            
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={() => <Settings size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={appPreferences.darkMode}
                  onValueChange={(value) => updateAppPreference('darkMode', value)}
                />
              )}
            />
            
            <List.Item
              title="Auto Refresh"
              description="Automatically refresh data"
              left={() => <Clock size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={appPreferences.autoRefresh}
                  onValueChange={(value) => updateAppPreference('autoRefresh', value)}
                />
              )}
            />
            
            <List.Item
              title="Offline Mode"
              description="Save data for offline access"
              left={() => <Globe size={24} color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={appPreferences.offlineMode}
                  onValueChange={(value) => updateAppPreference('offlineMode', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Account Management */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account & Security
            </Text>
            
            <List.Item
              title="Change Password"
              description="Update your account password"
              left={() => <Key size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setChangePasswordVisible(true)}
            />
            
            <List.Item
              title="Two-Factor Authentication"
              description="Add extra security to your account"
              left={() => <Shield size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => router.push('/(admin)/users/permissions')}
            />
            
            <List.Item
              title="Privacy Settings"
              description="Manage your data and privacy"
              left={() => <UserIcon size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => router.push('/(admin)/system/settings')}
            />
          </Card.Content>
        </Card>

        {/* Support & About */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Support & About
            </Text>
            
            <List.Item
              title="Help Center"
              description="Get help and support"
              left={() => <HelpCircle size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => router.push('/(admin)/help')}
            />
            
            <List.Item
              title="Contact Support"
              description="Get in touch with our team"
              left={() => <Mail size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => router.push('/(admin)/support')}
            />
            
            <List.Item
              title="Terms & Privacy"
              description="Read our terms and privacy policy"
              left={() => <FileText size={24} color={theme.colors.primary} />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => router.push('/(admin)/legal')}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Card style={[styles.settingsCard, styles.logoutCard]}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon={() => <LogOut size={20} color={theme.colors.error} />}
              textColor={theme.colors.error}
              style={styles.logoutButton}
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text variant="bodySmall" style={styles.accountInfoText}>
            Account created: {new Date(userStats.joinDate).toLocaleDateString()}
          </Text>
          <Text variant="bodySmall" style={styles.accountInfoText}>
            Version: 1.0.0 • Build: 1.0.0+53
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal 
          visible={editModalVisible} 
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Edit Profile
          </Text>
          
          <TextInput
            label="Display Name"
            value={editedProfile.displayName}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, displayName: text }))}
            style={styles.modalInput}
          />
          
          <TextInput
            label="Phone Number"
            value={editedProfile.phone}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, phone: text }))}
            style={styles.modalInput}
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Address"
            value={editedProfile.address}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, address: text }))}
            style={styles.modalInput}
            multiline
          />
          
          <TextInput
            label="Emergency Contact"
            value={editedProfile.emergencyContact}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, emergencyContact: text }))}
            style={styles.modalInput}
            keyboardType="phone-pad"
          />

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleProfileUpdate}
              style={styles.modalButton}
            >
              Save Changes
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Change Password Modal */}
      <Portal>
        <Modal 
          visible={changePasswordVisible} 
          onDismiss={() => setChangePasswordVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Change Password
          </Text>
          
          <TextInput
            label="Current Password"
            value={passwordForm.currentPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
            style={styles.modalInput}
            secureTextEntry
          />
          
          <TextInput
            label="New Password"
            value={passwordForm.newPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
            style={styles.modalInput}
            secureTextEntry
          />
          
          <TextInput
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
            style={styles.modalInput}
            secureTextEntry
          />

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setChangePasswordVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handlePasswordChange}
              style={styles.modalButton}
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              Change Password
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 2,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    elevation: 3,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.8,
    marginBottom: 2,
  },
  userPhone: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    marginBottom: 8,
  },
  statLabel: {
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    opacity: 0.7,
  },
  quickActionsCard: {
    marginVertical: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 8,
  },
  settingsCard: {
    marginVertical: 8,
  },
  logoutCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  logoutButton: {
    borderColor: 'rgba(255,0,0,0.3)',
  },
  accountInfo: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  accountInfoText: {
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 4,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
