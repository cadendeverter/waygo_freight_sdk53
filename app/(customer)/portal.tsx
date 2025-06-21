// waygo-freight/app/(customer)/portal.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, IconButton, Surface, 
  Dialog, Portal, TextInput, List, Badge, FAB, ProgressBar,
  Searchbar, Menu, ActivityIndicator, Divider, DataTable
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Package, MapPin, Calendar, FileText, CheckCircle,
  AlertTriangle, Search, Filter, Plus, Download, 
  Eye, Settings, TrendingUp, TrendingDown, Bell,
  Clock, User, Car, BarChart3, MessageSquare
} from '../../utils/icons';

import { useAuth } from '../../state/authContext';

interface CustomerShipment {
  id: string;
  trackingNumber: string;
  status: 'Booked' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception';
  origin: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  destination: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  pickupDate: string;
  deliveryDate: string;
  estimatedDelivery: string;
  commodity: string;
  weight: number;
  pieces: number;
  value: number;
  serviceType: 'Standard' | 'Expedited' | 'White Glove' | 'LTL' | 'FTL';
  carrier: string;
  driverName?: string;
  driverPhone?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    lastUpdate: string;
  };
  milestones: Array<{
    date: string;
    time: string;
    status: string;
    location: string;
    description: string;
  }>;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: 'Draft' | 'Submitted' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  requestDate: string;
  requestedPickup: string;
  requestedDelivery: string;
  serviceType: string;
  totalRate: number;
  shipments: string[];
  specialInstructions?: string;
}

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Disputed';
  issueDate: string;
  dueDate: string;
  amount: number;
  shipmentIds: string[];
  paymentMethod?: string;
  paidDate?: string;
}

interface CustomerMetrics {
  totalShipments: number;
  onTimePercentage: number;
  averageTransitTime: number;
  totalSpend: number;
  monthlyGrowth: number;
  satisfactionScore: number;
}

export default function CustomerPortal() {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SHIPMENTS' | 'ORDERS' | 'INVOICES' | 'REPORTS' | 'SUPPORT'>('DASHBOARD');
  const [shipments, setShipments] = useState<CustomerShipment[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs
  const [newOrderDialogVisible, setNewOrderDialogVisible] = useState(false);
  const [shipmentDetailVisible, setShipmentDetailVisible] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<CustomerShipment | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('THIS_MONTH');

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from your customer API
      const sampleShipments: CustomerShipment[] = [
        {
          id: 'SHP001',
          trackingNumber: 'WGF240115001',
          status: 'In Transit',
          origin: {
            name: 'ABC Manufacturing',
            address: '123 Industrial Blvd',
            city: 'Phoenix',
            state: 'AZ',
            zip: '85001'
          },
          destination: {
            name: 'XYZ Distribution',
            address: '456 Commerce St',
            city: 'Denver',
            state: 'CO',
            zip: '80202'
          },
          pickupDate: '2024-01-15',
          deliveryDate: '2024-01-17',
          estimatedDelivery: '2024-01-17T14:00:00Z',
          commodity: 'Electronics',
          weight: 15500,
          pieces: 24,
          value: 125000,
          serviceType: 'FTL',
          carrier: 'WayGo Freight',
          driverName: 'John Smith',
          driverPhone: '+1-555-0123',
          currentLocation: {
            lat: 39.7392,
            lng: -104.9903,
            city: 'Denver',
            state: 'CO',
            lastUpdate: '2024-01-16T10:30:00Z'
          },
          milestones: [
            {
              date: '2024-01-15',
              time: '08:00',
              status: 'Picked Up',
              location: 'Phoenix, AZ',
              description: 'Shipment picked up from origin'
            },
            {
              date: '2024-01-15',
              time: '09:15',
              status: 'In Transit',
              location: 'Phoenix, AZ',
              description: 'Departed origin facility'
            },
            {
              date: '2024-01-16',
              time: '10:30',
              status: 'In Transit',
              location: 'Denver, CO',
              description: 'Arrived at destination city'
            }
          ]
        },
        {
          id: 'SHP002',
          trackingNumber: 'WGF240114002',
          status: 'Delivered',
          origin: {
            name: 'Tech Solutions Inc',
            address: '789 Tech Park Dr',
            city: 'Austin',
            state: 'TX',
            zip: '78701'
          },
          destination: {
            name: 'Retail Store #145',
            address: '321 Main St',
            city: 'Dallas',
            state: 'TX',
            zip: '75201'
          },
          pickupDate: '2024-01-14',
          deliveryDate: '2024-01-14',
          estimatedDelivery: '2024-01-14T16:00:00Z',
          commodity: 'Computer Equipment',
          weight: 850,
          pieces: 5,
          value: 15000,
          serviceType: 'Standard',
          carrier: 'WayGo Freight',
          driverName: 'Sarah Johnson',
          driverPhone: '+1-555-0456',
          milestones: [
            {
              date: '2024-01-14',
              time: '09:00',
              status: 'Picked Up',
              location: 'Austin, TX',
              description: 'Shipment picked up from origin'
            },
            {
              date: '2024-01-14',
              time: '15:45',
              status: 'Delivered',
              location: 'Dallas, TX',
              description: 'Delivered to consignee - Signed by: M. Rodriguez'
            }
          ]
        }
      ];

      const sampleOrders: CustomerOrder[] = [
        {
          id: 'ORD001',
          orderNumber: 'PO-2024-001',
          status: 'In Progress',
          requestDate: '2024-01-10',
          requestedPickup: '2024-01-15',
          requestedDelivery: '2024-01-17',
          serviceType: 'FTL',
          totalRate: 2850.00,
          shipments: ['SHP001'],
          specialInstructions: 'Temperature controlled, handle with care'
        },
        {
          id: 'ORD002',
          orderNumber: 'PO-2024-002',
          status: 'Completed',
          requestDate: '2024-01-12',
          requestedPickup: '2024-01-14',
          requestedDelivery: '2024-01-14',
          serviceType: 'Standard',
          totalRate: 485.00,
          shipments: ['SHP002']
        }
      ];

      const sampleInvoices: CustomerInvoice[] = [
        {
          id: 'INV001',
          invoiceNumber: 'WGF-INV-2024-001',
          status: 'Sent',
          issueDate: '2024-01-15',
          dueDate: '2024-02-14',
          amount: 2850.00,
          shipmentIds: ['SHP001']
        },
        {
          id: 'INV002',
          invoiceNumber: 'WGF-INV-2024-002',
          status: 'Paid',
          issueDate: '2024-01-14',
          dueDate: '2024-02-13',
          amount: 485.00,
          shipmentIds: ['SHP002'],
          paymentMethod: 'ACH',
          paidDate: '2024-01-16'
        }
      ];

      const sampleMetrics: CustomerMetrics = {
        totalShipments: 247,
        onTimePercentage: 94.5,
        averageTransitTime: 2.3,
        totalSpend: 125800,
        monthlyGrowth: 12.5,
        satisfactionScore: 4.8
      };

      setShipments(sampleShipments);
      setOrders(sampleOrders);
      setInvoices(sampleInvoices);
      setMetrics(sampleMetrics);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomerData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': case 'Paid': case 'Completed': return '#4CAF50';
      case 'In Transit': case 'In Progress': case 'Sent': return '#2196F3';
      case 'Picked Up': case 'Confirmed': return '#FF9800';
      case 'Exception': case 'Overdue': case 'Disputed': return '#f44336';
      case 'Booked': case 'Draft': case 'Submitted': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.destination.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const renderDashboard = () => (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Welcome Section */}
      <View style={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
          Welcome back, {user?.firstName} {user?.lastName}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Here's your shipping overview for this month
        </Text>
      </View>

      {/* Key Metrics */}
      {metrics && (
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Card style={{ flex: 1, marginRight: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <Package size={28} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Total Shipments</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                  {metrics.totalShipments}
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={{ flex: 1, marginLeft: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <CheckCircle size={28} color="#4CAF50" />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>On-Time %</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {metrics.onTimePercentage}%
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Card style={{ flex: 1, marginRight: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <Clock size={28} color={theme.colors.secondary} />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Avg Transit</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                  {metrics.averageTransitTime} days
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={{ flex: 1, marginLeft: 8 }}>
              <Card.Content style={{ alignItems: 'center', padding: 12 }}>
                <TrendingUp size={28} color="#4CAF50" />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Growth</Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  +{metrics.monthlyGrowth}%
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      )}

      {/* Recent Shipments */}
      <View style={{ paddingHorizontal: 16 }}>
        <Card>
          <Card.Title title="Recent Shipments" />
          <Card.Content>
            {shipments.slice(0, 3).map(shipment => (
              <View key={shipment.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      {shipment.trackingNumber}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {shipment.origin.city}, {shipment.origin.state} → {shipment.destination.city}, {shipment.destination.state}
                    </Text>
                  </View>
                  <Chip 
                    compact 
                    style={{ backgroundColor: getStatusColor(shipment.status) + '20' }}
                    textStyle={{ color: getStatusColor(shipment.status), fontSize: 10 }}
                  >
                    {shipment.status}
                  </Chip>
                </View>
                {shipment.id !== shipments[2]?.id && <Divider style={{ marginTop: 12 }} />}
              </View>
            ))}
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined" onPress={() => setActiveTab('SHIPMENTS')}>View All</Button>
          </Card.Actions>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={{ padding: 16 }}>
        <Card>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button 
                mode="contained" 
                icon="plus"
                onPress={() => setNewOrderDialogVisible(true)}
                style={{ flex: 1, marginRight: 8 }}
              >
                New Order
              </Button>
              <Button 
                mode="outlined" 
                icon="file-document"
                onPress={() => setActiveTab('REPORTS')}
                style={{ flex: 1, marginLeft: 8 }}
              >
                Reports
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );

  const renderShipments = () => (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Filters */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Chip 
          mode={statusFilter === 'ALL' ? 'flat' : 'outlined'} 
          onPress={() => setStatusFilter('ALL')}
          style={{ marginRight: 8 }}
        >
          All
        </Chip>
        <Chip 
          mode={statusFilter === 'In Transit' ? 'flat' : 'outlined'} 
          onPress={() => setStatusFilter('In Transit')}
          style={{ marginRight: 8 }}
        >
          In Transit
        </Chip>
        <Chip 
          mode={statusFilter === 'Delivered' ? 'flat' : 'outlined'} 
          onPress={() => setStatusFilter('Delivered')}
        >
          Delivered
        </Chip>
      </View>

      {/* Shipments List */}
      <View style={{ paddingHorizontal: 16 }}>
        {filteredShipments.map(shipment => (
          <Card key={shipment.id} style={{ marginBottom: 12 }} onPress={() => {
            setSelectedShipment(shipment);
            setShipmentDetailVisible(true);
          }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{shipment.trackingNumber}</Text>
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8, 
                        backgroundColor: getStatusColor(shipment.status) + '20' 
                      }}
                      textStyle={{ color: getStatusColor(shipment.status), fontSize: 10 }}
                    >
                      {shipment.status}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium">{shipment.commodity}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {shipment.origin.city}, {shipment.origin.state} → {shipment.destination.city}, {shipment.destination.state}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Calendar size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                      {shipment.serviceType} • Est: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <IconButton 
                  icon="eye" 
                  size={20}
                  onPress={() => {
                    setSelectedShipment(shipment);
                    setShipmentDetailVisible(true);
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading your account...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ elevation: 1 }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Customer Portal</Text>
          <IconButton icon="bell" onPress={() => Alert.alert('Notifications', 'No new notifications')} />
        </View>

        {/* Search */}
        {activeTab === 'SHIPMENTS' && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Searchbar
              placeholder="Search shipments..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ elevation: 0, backgroundColor: theme.colors.surfaceVariant }}
            />
          </View>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'DASHBOARD', label: 'Dashboard', icon: 'view-dashboard' },
              { key: 'SHIPMENTS', label: 'Shipments', icon: 'package' },
              { key: 'ORDERS', label: 'Orders', icon: 'clipboard-list' },
              { key: 'INVOICES', label: 'Invoices', icon: 'receipt' },
              { key: 'REPORTS', label: 'Reports', icon: 'chart-bar' },
              { key: 'SUPPORT', label: 'Support', icon: 'message-circle' }
            ].map(tab => (
              <Chip
                key={tab.key}
                selected={activeTab === tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{ marginRight: 8 }}
                mode={activeTab === tab.key ? 'flat' : 'outlined'}
                icon={tab.icon}
              >
                {tab.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      {/* Content */}
      {activeTab === 'DASHBOARD' && renderDashboard()}
      {activeTab === 'SHIPMENTS' && renderShipments()}
      {activeTab === 'ORDERS' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Order Management</Text>
          <Text style={{ marginTop: 8 }}>View and manage your shipping orders here.</Text>
        </ScrollView>
      )}
      {activeTab === 'INVOICES' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Invoice Center</Text>
          <Text style={{ marginTop: 8 }}>View and pay your invoices here.</Text>
        </ScrollView>
      )}
      {activeTab === 'REPORTS' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Analytics & Reports</Text>
          <Text style={{ marginTop: 8 }}>Access detailed shipping analytics and reports.</Text>
        </ScrollView>
      )}
      {activeTab === 'SUPPORT' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Customer Support</Text>
          <Text style={{ marginTop: 8 }}>Get help and support for your shipments.</Text>
        </ScrollView>
      )}

      {/* Shipment Detail Dialog */}
      <Portal>
        <Dialog 
          visible={shipmentDetailVisible} 
          onDismiss={() => setShipmentDetailVisible(false)}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Shipment Details</Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              {selectedShipment && (
                <View>
                  <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    {selectedShipment.trackingNumber}
                  </Text>
                  
                  <Chip 
                    style={{ 
                      alignSelf: 'flex-start',
                      marginBottom: 16,
                      backgroundColor: getStatusColor(selectedShipment.status) + '20' 
                    }}
                    textStyle={{ color: getStatusColor(selectedShipment.status) }}
                  >
                    {selectedShipment.status}
                  </Chip>
                  
                  <View style={{ marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Route</Text>
                    <Text variant="bodyLarge">{selectedShipment.origin.name}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {selectedShipment.origin.address}, {selectedShipment.origin.city}, {selectedShipment.origin.state} {selectedShipment.origin.zip}
                    </Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center', marginVertical: 8 }}>↓</Text>
                    <Text variant="bodyLarge">{selectedShipment.destination.name}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {selectedShipment.destination.address}, {selectedShipment.destination.city}, {selectedShipment.destination.state} {selectedShipment.destination.zip}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Shipment Info</Text>
                    <Text variant="bodyMedium">Commodity: {selectedShipment.commodity}</Text>
                    <Text variant="bodyMedium">Weight: {selectedShipment.weight.toLocaleString()} lbs</Text>
                    <Text variant="bodyMedium">Pieces: {selectedShipment.pieces}</Text>
                    <Text variant="bodyMedium">Service: {selectedShipment.serviceType}</Text>
                  </View>

                  {selectedShipment.driverName && (
                    <View style={{ marginBottom: 16 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Driver Info</Text>
                      <Text variant="bodyMedium">Name: {selectedShipment.driverName}</Text>
                      <Text variant="bodyMedium">Phone: {selectedShipment.driverPhone}</Text>
                    </View>
                  )}

                  <View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Timeline</Text>
                    {selectedShipment.milestones.map((milestone, index) => (
                      <View key={index} style={{ marginBottom: 8, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: theme.colors.primary }}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{milestone.status}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {milestone.date} at {milestone.time} - {milestone.location}
                        </Text>
                        <Text variant="bodySmall">{milestone.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShipmentDetailVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => setNewOrderDialogVisible(true)}
      />
    </SafeAreaView>
  );
}
