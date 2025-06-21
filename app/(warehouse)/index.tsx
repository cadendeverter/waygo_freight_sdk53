import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, IconButton, Surface, 
  Dialog, Portal, TextInput, List, Badge, FAB, ProgressBar,
  Searchbar, Menu, ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Package, MapPin, Clock, Truck, CheckCircle,
  AlertTriangle, Search, Filter, Plus, Download, 
  ArrowRight, ArrowLeft, BarChart3, Settings,
  Users, Warehouse, ShoppingCart, FileText
} from '../../utils/icons';

import { useAuth } from '../../state/authContext';

interface InventoryItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  location: string;
  status: 'AVAILABLE' | 'RESERVED' | 'DAMAGED' | 'QUARANTINE';
  lastUpdated: Date;
  weight: number;
  dimensions: string;
  batchNumber?: string;
  expirationDate?: Date;
}

interface WarehouseOrder {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'CROSS_DOCK';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  carrier: string;
  dockDoor?: string;
  items: OrderItem[];
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  assignedTo?: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  sku: string;
  description: string;
  expectedQuantity: number;
  actualQuantity?: number;
  status: 'PENDING' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'RECEIVED';
  location?: string;
}

interface DockDoor {
  id: string;
  number: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'BLOCKED';
  currentOrder?: string;
  type: 'INBOUND' | 'OUTBOUND' | 'FLEXIBLE';
  equipment: string[];
}

const WarehouseDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVENTORY' | 'ORDERS' | 'YARD'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Mock data - in production this would come from backend
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'INV001',
      sku: 'SKU-12345',
      description: 'Premium Widget Set',
      quantity: 150,
      location: 'A-01-05',
      status: 'AVAILABLE',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      weight: 25.5,
      dimensions: '24x18x12',
      batchNumber: 'BTH-2024-001'
    },
    {
      id: 'INV002',
      sku: 'SKU-67890',
      description: 'Industrial Components',
      quantity: 75,
      location: 'B-03-12',
      status: 'RESERVED',
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      weight: 45.2,
      dimensions: '36x24x18'
    }
  ]);

  const [orders, setOrders] = useState<WarehouseOrder[]>([
    {
      id: 'ORD001',
      type: 'INBOUND',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      carrier: 'ABC Trucking',
      dockDoor: 'DOCK-01',
      scheduledTime: new Date(Date.now() + 30 * 60 * 1000),
      assignedTo: 'John Smith',
      items: [
        {
          id: 'ITM001',
          sku: 'SKU-12345',
          description: 'Premium Widget Set',
          expectedQuantity: 100,
          actualQuantity: 95,
          status: 'RECEIVED',
          location: 'A-01-05'
        }
      ]
    },
    {
      id: 'ORD002',
      type: 'OUTBOUND',
      status: 'PENDING',
      priority: 'NORMAL',
      carrier: 'XYZ Logistics',
      scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      items: [
        {
          id: 'ITM002',
          sku: 'SKU-67890',
          description: 'Industrial Components',
          expectedQuantity: 25,
          status: 'PENDING'
        }
      ]
    }
  ]);

  const [dockDoors, setDockDoors] = useState<DockDoor[]>([
    {
      id: 'DOCK001',
      number: 'DOCK-01',
      status: 'OCCUPIED',
      currentOrder: 'ORD001',
      type: 'INBOUND',
      equipment: ['Forklift', 'Pallet Jack']
    },
    {
      id: 'DOCK002',
      number: 'DOCK-02',
      status: 'AVAILABLE',
      type: 'OUTBOUND',
      equipment: ['Dock Leveler', 'Conveyor']
    },
    {
      id: 'DOCK003',
      number: 'DOCK-03',
      status: 'MAINTENANCE',
      type: 'FLEXIBLE',
      equipment: ['Under Repair']
    }
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleBarcodeScan = (data: string) => {
    Alert.alert('Barcode Scanned', `SKU: ${data}`, [
      { text: 'OK', onPress: () => setScannerVisible(false) }
    ]);
  };

  const updateOrderStatus = (orderId: string, newStatus: WarehouseOrder['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const assignDockDoor = (orderId: string, dockId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, dockDoor: dockId } : order
    ));
    setDockDoors(prev => prev.map(dock => 
      dock.id === dockId ? { ...dock, status: 'OCCUPIED', currentOrder: orderId } : dock
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': case 'COMPLETED': return '#4caf50';
      case 'PENDING': case 'OCCUPIED': return '#ff9800';
      case 'IN_PROGRESS': return '#2196f3';
      case 'CANCELLED': case 'MAINTENANCE': return '#f44336';
      case 'RESERVED': return '#9c27b0';
      default: return theme.colors.onSurface;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#f44336';
      case 'HIGH': return '#ff9800';
      case 'NORMAL': return '#2196f3';
      case 'LOW': return '#4caf50';
      default: return theme.colors.onSurface;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.carrier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeOrders = orders.filter(o => ['PENDING', 'IN_PROGRESS'].includes(o.status));
  const availableDocks = dockDoors.filter(d => d.status === 'AVAILABLE');
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const renderOverviewTab = () => (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Quick Stats */}
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Warehouse Overview
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {activeOrders.length}
              </Text>
              <Text variant="bodySmall">Active Orders</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineMedium" style={{ color: '#4caf50', fontWeight: 'bold' }}>
                {availableDocks.length}
              </Text>
              <Text variant="bodySmall">Available Docks</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineMedium" style={{ color: '#ff9800', fontWeight: 'bold' }}>
                {totalInventoryValue}
              </Text>
              <Text variant="bodySmall">Total Items</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Active Orders */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Active Orders
          </Text>
          
          {activeOrders.slice(0, 3).map(order => (
            <View key={order.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                  {order.id} - {order.carrier}
                </Text>
                <Chip 
                  compact
                  style={{ backgroundColor: getStatusColor(order.status) + '20' }}
                  textStyle={{ color: getStatusColor(order.status) }}
                >
                  {order.status}
                </Chip>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {order.type} • {order.dockDoor || 'No dock assigned'}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {order.scheduledTime.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Dock Status */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Dock Door Status
          </Text>
          
          {dockDoors.map(dock => (
            <List.Item
              key={dock.id}
              title={dock.number}
              description={`${dock.type} • ${dock.status}${dock.currentOrder ? ` • ${dock.currentOrder}` : ''}`}
              left={(props) => <Warehouse {...props} size={24} color={getStatusColor(dock.status)} />}
              right={() => (
                <Chip 
                  compact
                  style={{ backgroundColor: getStatusColor(dock.status) + '20' }}
                  textStyle={{ color: getStatusColor(dock.status) }}
                >
                  {dock.status}
                </Chip>
              )}
            />
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderInventoryTab = () => (
    <View style={{ flex: 1 }}>
      <Surface style={{ padding: 16, elevation: 1 }}>
        <Searchbar
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: 12 }}
        />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button 
            mode="outlined" 
            compact
            icon="qrcode-scan"
            onPress={() => setScannerVisible(true)}
          >
            Scan Item
          </Button>
          <Button 
            mode="outlined" 
            compact
            icon="plus"
            onPress={() => Alert.alert('Feature', 'Add new inventory item')}
          >
            Add Item
          </Button>
        </View>
      </Surface>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {inventory.filter(item => 
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(item => (
          <Card key={item.id} style={{ margin: 16, marginBottom: 8 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.sku}
                  </Text>
                  <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                    {item.description}
                  </Text>
                </View>
                <Chip 
                  compact
                  style={{ backgroundColor: getStatusColor(item.status) + '20' }}
                  textStyle={{ color: getStatusColor(item.status) }}
                >
                  {item.status}
                </Chip>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text variant="bodySmall" style={{ opacity: 0.7 }}>Quantity</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.quantity}
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ opacity: 0.7 }}>Location</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.location}
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ opacity: 0.7 }}>Weight</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.weight} lbs
                  </Text>
                </View>
              </View>

              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Updated: {item.lastUpdated.toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderOrdersTab = () => (
    <View style={{ flex: 1 }}>
      <Surface style={{ padding: 16, elevation: 1 }}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Searchbar
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1 }}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row' }}>
            {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
              <Chip
                key={status}
                selected={filterStatus === status}
                onPress={() => setFilterStatus(status)}
                style={{ marginRight: 8 }}
                mode={filterStatus === status ? 'flat' : 'outlined'}
              >
                {status}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredOrders.map(order => (
          <Card 
            key={order.id} 
            style={{ margin: 16, marginBottom: 8 }}
            onPress={() => setSelectedOrder(order.id)}
          >
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {order.id}
                  </Text>
                  <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                    {order.carrier} • {order.type}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Chip 
                    compact
                    style={{ backgroundColor: getPriorityColor(order.priority) + '20', marginBottom: 4 }}
                    textStyle={{ color: getPriorityColor(order.priority) }}
                  >
                    {order.priority}
                  </Chip>
                  <Chip 
                    compact
                    style={{ backgroundColor: getStatusColor(order.status) + '20' }}
                    textStyle={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </Chip>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  Dock: {order.dockDoor || 'Not assigned'}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {order.items.length} items
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  Scheduled: {order.scheduledTime.toLocaleString()}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  {order.status === 'PENDING' && (
                    <Button 
                      mode="outlined" 
                      compact
                      onPress={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                    >
                      Start
                    </Button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => updateOrderStatus(order.id, 'COMPLETED')}
                    >
                      Complete
                    </Button>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Surface style={{ padding: 16, elevation: 2 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
          Warehouse Management
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
          Inventory tracking and warehouse operations
        </Text>
      </Surface>

      {/* Tab Navigation */}
      <Surface style={{ elevation: 1 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'OVERVIEW', label: 'Overview', icon: 'chart-bar' },
              { key: 'INVENTORY', label: 'Inventory', icon: 'package-variant' },
              { key: 'ORDERS', label: 'Orders', icon: 'cart' },
              { key: 'YARD', label: 'Yard', icon: 'truck' }
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

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && renderOverviewTab()}
      {activeTab === 'INVENTORY' && renderInventoryTab()}
      {activeTab === 'ORDERS' && renderOrdersTab()}
      {activeTab === 'YARD' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="titleMedium">Yard Management</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7 }}>Coming soon...</Text>
        </View>
      )}

      {/* Floating Action Button */}
      <FAB
        icon="qrcode-scan"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => setScannerVisible(true)}
      />

      {/* Barcode Scanner Dialog */}
      <Portal>
        <Dialog visible={scannerVisible} onDismiss={() => setScannerVisible(false)}>
          <Dialog.Title>Scan Barcode</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ textAlign: 'center', padding: 20 }}>
              Camera scanner would open here
            </Text>
            <Button onPress={() => handleBarcodeScan('SKU-TEST-123')}>
              Simulate Scan
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setScannerVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default WarehouseDashboard;
