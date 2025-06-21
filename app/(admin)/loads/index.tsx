import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import { useLoad } from '../../../state/loadContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, FAB, Searchbar, Menu, Divider } from 'react-native-paper';
import { Truck, MapPin, DollarSign, Plus, Filter, MoreVertical, Calendar, Package, User } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Load } from '../../../types';

const getStatusColor = (status: string, theme: any) => {
  const colors = {
    pending: theme.colors.warning,
    assigned: theme.colors.info,
    en_route_pickup: theme.colors.primary,
    at_pickup: theme.colors.secondary,
    loaded: theme.colors.success,
    en_route_delivery: theme.colors.primary,
    at_delivery: theme.colors.secondary,
    delivered: theme.colors.success,
    completed: theme.colors.outline,
    cancelled: theme.colors.error,
  };
  return colors[status as keyof typeof colors] || theme.colors.outline;
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface LoadCardProps {
  load: Load;
  onPress: () => void;
  onMenuPress: () => void;
}

const LoadCard: React.FC<LoadCardProps> = ({ load, onPress, onMenuPress }) => {
  const { theme } = useTheme();
  
  return (
    <Card style={{ marginBottom: 16 }} onPress={onPress}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
              Load #{load.loadNumber}
            </Text>
            <Chip 
              mode="outlined" 
              compact
              textStyle={{ color: getStatusColor(load.status, theme) }}
              style={{ 
                borderColor: getStatusColor(load.status, theme),
                alignSelf: 'flex-start'
              }}
            >
              {load.status.replace(/_/g, ' ').toUpperCase()}
            </Chip>
          </View>
          <TouchableOpacity onPress={onMenuPress}>
            <MoreVertical size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
              {load.origin.facility.address.city}, {load.origin.facility.address.state}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color={theme.colors.error} />
            <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
              {load.destination.facility.address.city}, {load.destination.facility.address.state}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Package size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              {load.commodity}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <DollarSign size={16} color={theme.colors.success} />
            <Text variant="bodyMedium" style={{ marginLeft: 4, fontWeight: '600', color: theme.colors.success }}>
              {formatCurrency(load.totalCharges)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              Pickup: {formatDate(load.pickupDate)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
              Delivery: {formatDate(load.deliveryDate)}
            </Text>
          </View>
        </View>

        {load.driverId && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <User size={14} color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.primary }}>
              Assigned Driver
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default function AdminLoadsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    loads, loading, error,
    createLoad,
    updateLoadStatus,
    assignDriver,
    deleteLoad
  } = useLoad();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const filteredLoads = loads.filter((load: Load) => {
    const matchesSearch = load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.origin.facility.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.destination.facility.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || load.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openMenu = (loadId: string) => {
    setMenuVisible(prev => ({ ...prev, [loadId]: true }));
  };

  const closeMenu = (loadId: string) => {
    setMenuVisible(prev => ({ ...prev, [loadId]: false }));
  };

  const handleLoadPress = (load: Load) => {
    router.push(`/(admin)/loads/${load.id}`);
  };

  const handleCreateLoad = () => {
    router.push('/(admin)/loads/create');
  };

  const handleStatusUpdate = async (load: Load, newStatus: string) => {
    try {
      await updateLoadStatus(load.id, newStatus as any);
      closeMenu(load.id);
    } catch (error) {
      console.error('Failed to update load status:', error);
    }
  };

  const handleDeleteLoad = async (load: Load) => {
    try {
      await deleteLoad(load.id);
      closeMenu(load.id);
    } catch (error) {
      console.error('Failed to delete load:', error);
    }
  };

  const renderLoadCard = ({ item }: { item: Load }) => (
    <View>
      <LoadCard
        load={item}
        onPress={() => handleLoadPress(item)}
        onMenuPress={() => openMenu(item.id)}
      />
      <Menu
        visible={menuVisible[item.id] || false}
        onDismiss={() => closeMenu(item.id)}
        anchor={<View />}
        contentStyle={{ marginTop: 50 }}
      >
        <Menu.Item
          onPress={() => handleStatusUpdate(item, 'assigned')}
          title="Mark as Assigned"
          leadingIcon="truck"
        />
        <Menu.Item
          onPress={() => handleStatusUpdate(item, 'in_transit')}
          title="Mark In Transit"
          leadingIcon="map-marker"
        />
        <Menu.Item
          onPress={() => handleStatusUpdate(item, 'delivered')}
          title="Mark Delivered"
          leadingIcon="check-circle"
        />
        <Divider />
        <Menu.Item
          onPress={() => router.push(`/(admin)/loads/${item.id}/edit`)}
          title="Edit Load"
          leadingIcon="pencil"
        />
        <Menu.Item
          onPress={() => handleDeleteLoad(item)}
          title="Delete Load"
          leadingIcon="delete"
        />
      </Menu>
    </View>
  );

  if (loading && loads.length === 0) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Load Management' }} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Heading variant="h1" style={{ marginBottom: 16 }}>
            Load Management
          </Heading>

          {error && (
            <Card style={{ marginBottom: 16, backgroundColor: theme.colors.errorContainer }}>
              <Card.Content>
                <Text style={{ color: theme.colors.onErrorContainer }}>
                  {error}
                </Text>
              </Card.Content>
            </Card>
          )}

          <Searchbar
            placeholder="Search loads..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['all', 'pending', 'assigned', 'en_route_pickup', 'loaded', 'delivered', 'completed'].map((status) => (
                <Chip
                  key={status}
                  selected={statusFilter === status}
                  onPress={() => setStatusFilter(status)}
                  mode={statusFilter === status ? 'flat' : 'outlined'}
                  style={{ marginRight: 8 }}
                >
                  {status === 'all' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="titleMedium">
              {filteredLoads.length} Load{filteredLoads.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredLoads}
            renderItem={renderLoadCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <Card style={{ padding: 32, alignItems: 'center' }}>
                <Truck size={48} color={theme.colors.outline} />
                <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                  No loads found
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first load to get started'
                  }
                </Text>
                {!searchQuery && statusFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleCreateLoad}
                    style={{ marginTop: 16 }}
                    icon="plus"
                  >
                    Create Load
                  </Button>
                )}
              </Card>
            )}
          />
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={handleCreateLoad}
      />
    </ScreenWrapper>
  );
}
