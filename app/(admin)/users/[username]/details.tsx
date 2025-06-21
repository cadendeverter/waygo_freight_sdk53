import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme,
  List,
  Chip,
  Badge,
  Avatar,
  ActivityIndicator,
  Divider,
  Surface
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  ArrowLeft, 
  Edit, 
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle
} from '../../../../utils/icons';

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
  avatar?: string;
  stats?: {
    totalLoads: number;
    onTimeDeliveries: number;
    milesdriven: number;
    safetyScore: number;
  };
}

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
    lastLogin: '2025-06-19',
    stats: {
      totalLoads: 156,
      onTimeDeliveries: 94,
      milesdriven: 125000,
      safetyScore: 98
    }
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
    lastLogin: '2025-06-19',
    stats: {
      totalLoads: 450,
      onTimeDeliveries: 97,
      milesdriven: 0,
      safetyScore: 100
    }
  }
};

export default function UserDetailsScreen() {
  const theme = useTheme();
  const { username } = useLocalSearchParams<{ username: string }>();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
    profileCard: {
      marginBottom: 16,
      borderRadius: 16,
      elevation: 2,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    userName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    userRole: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    statusBadge: {
      marginTop: 8,
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    permissionChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      marginTop: 16,
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#7C3AED';
      case 'dispatcher': return '#10B981';
      case 'driver': return '#F59E0B';
      case 'customer': return '#3B82F6';
      case 'warehouse': return '#EF4444';
      default: return theme.colors.primary;
    }
  };

  const getStatColor = (value: number, type: string) => {
    if (type === 'safety' || type === 'onTime') {
      if (value >= 95) return '#10B981'; // Green
      if (value >= 85) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    }
    return theme.colors.primary;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading user details...</Text>
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
          User Details
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.push(`/(admin)/users/${username}/edit`)}
          icon={() => <Edit size={20} color="#FFFFFF" />}
          compact
        >
          Edit
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={`${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`}
              style={{ backgroundColor: getRoleColor(userData.role) }}
            />
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {userData.firstName} {userData.lastName}
              </Text>
              <Text style={styles.userRole}>
                {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} • {userData.companyName}
              </Text>
              
              <Chip 
                mode="outlined" 
                style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: userData.isActive ? '#10B981' + '20' : '#EF4444' + '20',
                    borderColor: userData.isActive ? '#10B981' : '#EF4444'
                  }
                ]}
                textStyle={{ 
                  color: userData.isActive ? '#10B981' : '#EF4444',
                  fontWeight: 'bold'
                }}
                icon={() => userData.isActive ? 
                  <CheckCircle size={16} color="#10B981" /> : 
                  <XCircle size={16} color="#EF4444" />
                }
              >
                {userData.isActive ? 'Active' : 'Inactive'}
              </Chip>
            </View>
          </View>
        </Card>

        {/* Performance Stats (for drivers/dispatchers) */}
        {userData.stats && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Performance Statistics</Text>
              
              <View style={styles.statsGrid}>
                <Surface style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
                  <TrendingUp size={24} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                    {userData.stats.totalLoads}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
                    Total Loads
                  </Text>
                </Surface>

                <Surface style={[styles.statCard, { backgroundColor: getStatColor(userData.stats.onTimeDeliveries, 'onTime') + '20' }]}>
                  <CheckCircle size={24} color={getStatColor(userData.stats.onTimeDeliveries, 'onTime')} />
                  <Text style={[styles.statValue, { color: getStatColor(userData.stats.onTimeDeliveries, 'onTime') }]}>
                    {userData.stats.onTimeDeliveries}%
                  </Text>
                  <Text style={[styles.statLabel, { color: getStatColor(userData.stats.onTimeDeliveries, 'onTime') }]}>
                    On-Time Delivery
                  </Text>
                </Surface>

                {userData.stats.milesdriven > 0 && (
                  <Surface style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <MapPin size={24} color={theme.colors.secondary} />
                    <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                      {userData.stats.milesdriven.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSecondaryContainer }]}>
                      Miles Driven
                    </Text>
                  </Surface>
                )}

                <Surface style={[styles.statCard, { backgroundColor: getStatColor(userData.stats.safetyScore, 'safety') + '20' }]}>
                  <Shield size={24} color={getStatColor(userData.stats.safetyScore, 'safety')} />
                  <Text style={[styles.statValue, { color: getStatColor(userData.stats.safetyScore, 'safety') }]}>
                    {userData.stats.safetyScore}%
                  </Text>
                  <Text style={[styles.statLabel, { color: getStatColor(userData.stats.safetyScore, 'safety') }]}>
                    Safety Score
                  </Text>
                </Surface>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <List.Item
              title="Email"
              description={userData.email}
              left={() => <Mail size={20} color={theme.colors.primary} />}
            />
            
            <List.Item
              title="Phone"
              description={userData.phone || 'Not provided'}
              left={() => <Phone size={20} color={theme.colors.primary} />}
            />
            
            <List.Item
              title="Company"
              description={userData.companyName}
              left={() => <Building2 size={20} color={theme.colors.primary} />}
            />
            
            <List.Item
              title="Employee ID"
              description={userData.employeeId}
              left={() => <User size={20} color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        {/* Permissions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Permissions</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {userData.permissions.map((permission, index) => (
                <Chip 
                  key={index}
                  mode="outlined" 
                  style={[
                    styles.permissionChip,
                    { backgroundColor: theme.colors.primaryContainer }
                  ]}
                  textStyle={{ color: theme.colors.primary }}
                  icon={() => <Shield size={16} color={theme.colors.primary} />}
                >
                  {permission === 'all' ? 'Full Access' : permission.charAt(0).toUpperCase() + permission.slice(1)}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <List.Item
              title="Created"
              description={new Date(userData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              left={() => <Calendar size={20} color={theme.colors.onSurfaceVariant} />}
            />
            
            <List.Item
              title="Last Login"
              description={new Date(userData.lastLogin).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              left={() => <Clock size={20} color={theme.colors.onSurfaceVariant} />}
            />
            
            <List.Item
              title="User ID"
              description={userData.id}
              left={() => <User size={20} color={theme.colors.onSurfaceVariant} />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
