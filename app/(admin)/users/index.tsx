// waygo-freight/app/(admin)/users/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, Searchbar, Avatar, Badge } from 'react-native-paper';
import { User, Search, UserPlus, Mail, Phone, MapPin, Shield, CheckCircle, XCircle } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

// Mock user data
const mockUsers = [
  {
    id: 'USR001',
    email: 'john.driver@waygo.com',
    firstName: 'John',
    lastName: 'Smith',
    appRole: 'DRIVER',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Main St, Dallas, TX 75201',
    isActive: true,
    lastLogin: '2025-06-16T10:30:00Z',
    createdAt: '2025-01-15T08:00:00Z',
    avatar: null
  },
  {
    id: 'USR002',
    email: 'sarah.dispatch@waygo.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    appRole: 'DISPATCHER',
    phoneNumber: '+1 (555) 234-5678',
    address: '456 Oak Ave, Houston, TX 77001',
    isActive: true,
    lastLogin: '2025-06-16T14:15:00Z',
    createdAt: '2025-01-20T09:30:00Z',
    avatar: null
  },
  {
    id: 'USR003',
    email: 'mike.warehouse@waygo.com',
    firstName: 'Mike',
    lastName: 'Chen',
    appRole: 'WAREHOUSE',
    phoneNumber: '+1 (555) 345-6789',
    address: '789 Industrial Blvd, Austin, TX 78701',
    isActive: false,
    lastLogin: '2025-06-10T16:45:00Z',
    createdAt: '2025-02-01T11:00:00Z',
    avatar: null
  }
];

function AdminUsersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterUsers(query, roleFilter);
  };

  const handleRoleFilter = (role: string | null) => {
    setRoleFilter(role);
    filterUsers(searchQuery, role);
  };

  const filterUsers = (query: string, role: string | null) => {
    let filtered = users;
    
    if (query) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.phoneNumber.includes(query)
      );
    }
    
    if (role) {
      filtered = filtered.filter(user => user.appRole === role);
    }
    
    setFilteredUsers(filtered);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN_FREIGHT':
        return theme.colors.error;
      case 'DISPATCHER':
        return theme.colors.primary;
      case 'DRIVER':
        return '#FF9500';
      case 'WAREHOUSE':
        return '#34C759';
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderUser = ({ item }: { item: any }) => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Avatar.Text 
            size={48} 
            label={`${item.firstName[0]}${item.lastName[0]}`}
            style={{ backgroundColor: getRoleColor(item.appRole) }}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                {item.firstName} {item.lastName}
              </Text>
              {item.isActive ? (
                <CheckCircle size={20} color="#34C759" />
              ) : (
                <XCircle size={20} color={theme.colors.error} />
              )}
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {item.email}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Chip 
            mode="outlined" 
            textStyle={{ color: getRoleColor(item.appRole), fontSize: 12 }}
            style={{ 
              borderColor: getRoleColor(item.appRole),
              alignSelf: 'flex-start'
            }}
          >
            {item.appRole.replace('_', ' ')}
          </Chip>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Phone size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
              {item.phoneNumber}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MapPin size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8, flex: 1 }}>
              {item.address}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Last login: {formatDate(item.lastLogin)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Created: {formatDate(item.createdAt)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            mode="outlined" 
            compact
            onPress={() => router.push(`/admin/users/${item.id}/edit`)}
            style={{ flex: 1 }}
          >
            Edit
          </Button>
          <Button 
            mode="contained" 
            compact
            onPress={() => router.push(`/admin/users/${item.id}/details`)}
            style={{ flex: 1 }}
          >
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Users' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Heading variant="h1">Users</Heading>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Manage user accounts and permissions
            </Text>
          </View>
          <Button 
            mode="contained" 
            onPress={() => router.push('/admin/users/create')}
            icon={() => <UserPlus size={20} color="white" />}
            compact
          >
            Add User
          </Button>
        </View>
        
        <Searchbar
          placeholder="Search users..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ backgroundColor: theme.colors.surfaceVariant, marginBottom: 12 }}
          icon={() => <Search size={20} color={theme.colors.onSurfaceVariant} />}
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            mode={roleFilter === null ? "contained" : "outlined"}
            compact
            onPress={() => handleRoleFilter(null)}
            style={{ flex: 1 }}
          >
            All
          </Button>
          <Button 
            mode={roleFilter === 'DRIVER' ? "contained" : "outlined"}
            compact
            onPress={() => handleRoleFilter('DRIVER')}
            style={{ flex: 1 }}
          >
            Drivers
          </Button>
          <Button 
            mode={roleFilter === 'DISPATCHER' ? "contained" : "outlined"}
            compact
            onPress={() => handleRoleFilter('DISPATCHER')}
            style={{ flex: 1 }}
          >
            Dispatchers
          </Button>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <User size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
              No users found
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first user to get started'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

export default AdminUsersScreen;
