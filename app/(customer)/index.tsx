import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  Searchbar,
  IconButton,
  Surface,
  Divider,
  ProgressBar
} from 'react-native-paper';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Bell,
  FileText,
  Download,
  MessageSquare,
  Calendar,
  Eye,
  Navigation,
  Phone,
  Star,
  TrendingUp,
  Plus
} from '../../utils/icons';
import { useLoad } from '../../state/loadContext';
import { useAuth } from '../../state/authContext';
import { router } from 'expo-router';

interface CustomerDashboardData {
  activeShipments: number;
  deliveredToday: number;
  pendingPickups: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  totalSpentThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: 'pickup' | 'delivery' | 'delay' | 'document';
  title: string;
  description: string;
  timestamp: Date;
  shipmentId?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export default function CustomerDashboard() {
  const theme = useTheme();
  const { loads, loading } = useLoad();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter loads for customer view (in real app, this would be filtered by customer ID)
  const customerLoads = loads.filter(load => 
    searchQuery === '' || 
    load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateDashboardData = (): CustomerDashboardData => {
    const activeShipments = customerLoads.filter(load => 
      ['assigned', 'picked_up', 'in_transit'].includes(load.status)
    ).length;
    
    const deliveredToday = customerLoads.filter(load => 
      load.status === 'delivered' && 
      load.deliveryDate && 
      new Date(load.deliveryDate).toDateString() === new Date().toDateString()
    ).length;
    
    const pendingPickups = customerLoads.filter(load => 
      load.status === 'pending'
    ).length;
    
    const totalSpent = customerLoads
      .filter(load => load.status === 'delivered')
      .reduce((sum, load) => sum + (load.rate || 0), 0);

    return {
      activeShipments,
      deliveredToday,
      pendingPickups,
      avgDeliveryTime: 2.8,
      onTimeRate: 94.5,
      totalSpentThisMonth: totalSpent
    };
  };

  const getRecentActivity = (): RecentActivity[] => {
    return [
      {
        id: '1',
        type: 'delivery',
        title: 'Shipment Delivered',
        description: 'Load #L-2024-045 delivered to Chicago facility',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        shipmentId: 'L-2024-045',
        status: 'success'
      },
      {
        id: '2',
        type: 'pickup',
        title: 'Pickup Scheduled',
        description: 'Load #L-2024-048 pickup confirmed for tomorrow 9:00 AM',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        shipmentId: 'L-2024-048',
        status: 'info'
      },
      {
        id: '3',
        type: 'delay',
        title: 'Delivery Delay',
        description: 'Load #L-2024-046 delayed by 2 hours due to traffic',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        shipmentId: 'L-2024-046',
        status: 'warning'
      },
      {
        id: '4',
        type: 'document',
        title: 'POD Available',
        description: 'Proof of delivery document ready for download',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        shipmentId: 'L-2024-044',
        status: 'info'
      }
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const dashboardData = calculateDashboardData();
  const recentActivity = getRecentActivity();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return theme.colors.primary;
      case 'in_transit': return theme.colors.tertiary;
      case 'picked_up': return theme.colors.secondary;
      case 'assigned': return theme.colors.outline;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'delivery': return CheckCircle;
      case 'pickup': return Package;
      case 'delay': return AlertCircle;
      case 'document': return FileText;
      default: return Bell;
    }
  };

  const getStatusIconColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return theme.colors.primary;
      case 'warning': return theme.colors.tertiary;
      case 'error': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
              Customer Portal
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Welcome back, {user?.firstName || 'Customer'}
            </Text>
          </View>
          <IconButton
            icon={() => <Bell size={24} color={theme.colors.primary} />}
            onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')}
          />
        </View>
      </View>

      {/* Key Metrics Cards */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {/* Active Shipments */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <Truck size={24} color={theme.colors.primary} />}
                style={{ backgroundColor: `${theme.colors.primary}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {dashboardData.activeShipments}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Active Shipments
              </Text>
            </Card.Content>
          </Card>

          {/* Delivered Today */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <CheckCircle size={24} color={theme.colors.secondary} />}
                style={{ backgroundColor: `${theme.colors.secondary}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {dashboardData.deliveredToday}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Delivered Today
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {/* On-Time Rate */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <Clock size={24} color={theme.colors.tertiary} />}
                style={{ backgroundColor: `${theme.colors.tertiary}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {dashboardData.onTimeRate}%
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                On-Time Rate
              </Text>
            </Card.Content>
          </Card>

          {/* Monthly Spend */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <TrendingUp size={24} color={theme.colors.outline} />}
                style={{ backgroundColor: `${theme.colors.outline}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {formatCurrency(dashboardData.totalSpentThisMonth)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                This Month
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Quick Actions */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Button
              mode="contained"
              icon={() => <Eye size={20} color={theme.colors.onPrimary} />}
              onPress={() => router.push('/(customer)/tracking')}
              style={{ flex: 1, minWidth: 140 }}
            >
              Track Shipment
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <Plus size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Coming Soon', 'Shipment booking will be available soon.')}
              style={{ flex: 1, minWidth: 140 }}
            >
              Book Shipment
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <FileText size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Documents', 'View and download shipping documents.')}
              style={{ flex: 1, minWidth: 140 }}
            >
              Documents
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <MessageSquare size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Support', 'Contact customer support for assistance.')}
              style={{ flex: 1, minWidth: 140 }}
            >
              Support
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Searchbar
          placeholder="Search shipments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </View>

      {/* Filter Chips */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 }}>
        {['All', 'Active', 'Delivered', 'Pending'].map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter.toLowerCase()}
            onPress={() => setSelectedFilter(filter.toLowerCase())}
            style={{ backgroundColor: selectedFilter === filter.toLowerCase() ? theme.colors.primary : 'transparent' }}
          >
            {filter}
          </Chip>
        ))}
      </View>

      {/* Recent Shipments */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Recent Shipments
          </Text>
          
          {customerLoads.slice(0, 5).map((load) => (
            <View key={load.id}>
              <List.Item
                title={`Load #${load.loadNumber}`}
                description={`${load.origin.facility.address.city} → ${load.destination.facility.address.city} • ${load.commodity}`}
                left={(props) => (
                  <Avatar.Icon 
                    {...props} 
                    icon={() => <Package size={24} color={getStatusColor(load.status)} />}
                    style={{ backgroundColor: `${getStatusColor(load.status)}20` }}
                  />
                )}
                right={(props) => (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Chip 
                      style={{ 
                        backgroundColor: `${getStatusColor(load.status)}20`,
                        marginBottom: 4
                      }}
                      textStyle={{ color: getStatusColor(load.status) }}
                    >
                      {load.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatCurrency(load.rate || 0)}
                    </Text>
                  </View>
                )}
                onPress={() => router.push(`/(customer)/tracking?id=${load.id}`)}
              />
              <Divider />
            </View>
          ))}
          
          <Button
            mode="text"
            onPress={() => router.push('/(customer)/tracking')}
            style={{ marginTop: 8 }}
          >
            View All Shipments
          </Button>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Recent Activity
          </Text>
          
          {recentActivity.map((activity) => {
            const IconComponent = getStatusIcon(activity.type);
            return (
              <View key={activity.id}>
                <List.Item
                  title={activity.title}
                  description={activity.description}
                  left={(props) => (
                    <Avatar.Icon 
                      {...props} 
                      icon={() => <IconComponent size={24} color={getStatusIconColor(activity.status)} />}
                      style={{ backgroundColor: `${getStatusIconColor(activity.status)}20` }}
                    />
                  )}
                  right={(props) => (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {new Date(activity.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  )}
                  onPress={() => {
                    if (activity.shipmentId) {
                      router.push(`/(customer)/tracking?id=${activity.shipmentId}`);
                    }
                  }}
                />
                <Divider />
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Service Performance */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Service Performance
          </Text>
          
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="bodyLarge">On-Time Delivery</Text>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                {dashboardData.onTimeRate}%
              </Text>
            </View>
            <ProgressBar 
              progress={dashboardData.onTimeRate / 100} 
              color={theme.colors.primary}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="bodyLarge">Average Transit Time</Text>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                {dashboardData.avgDeliveryTime} days
              </Text>
            </View>
            <ProgressBar 
              progress={0.7} 
              color={theme.colors.secondary}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                4.8
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Service Rating
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={16} 
                    color={star <= 4.8 ? theme.colors.primary : theme.colors.outline}
                  />
                ))}
              </View>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                98%
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Damage Free
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Contact Information */}
      <Card style={{ margin: 16, marginTop: 0, marginBottom: 24 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Need Help?
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              mode="outlined"
              icon={() => <Phone size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Call Support', 'Calling customer support...')}
              style={{ flex: 1 }}
            >
              Call Support
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <MessageSquare size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Live Chat', 'Starting live chat...')}
              style={{ flex: 1 }}
            >
              Live Chat
            </Button>
          </View>
          
          <Divider style={{ marginVertical: 16 }} />
          
          <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            Customer Service: 24/7 Support Available
          </Text>
          <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Phone: 1-800-WAYGO-FREIGHT • Email: support@waygofreight.com
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
