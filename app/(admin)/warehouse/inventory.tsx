import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB, ActivityIndicator, Searchbar, ProgressBar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useAuth } from '../../../state/authContext';
import { Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Scan } from '../../../utils/icons';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  location: string;
  warehouseId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: Date;
  lastMovement: Date;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  supplier?: string;
  barcode?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  recentMovements: number;
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    sku: 'ELEC-001',
    name: 'Samsung Galaxy S24',
    description: 'Flagship smartphone with 256GB storage',
    category: 'Electronics',
    location: 'A-01-02',
    warehouseId: 'WH-001',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unitCost: 899.99,
    totalValue: 40499.55,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastMovement: new Date(Date.now() - 4 * 60 * 60 * 1000),
    movementType: 'in',
    supplier: 'Samsung Electronics',
    barcode: '123456789012',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    sku: 'ELEC-002',
    name: 'Apple iPad Pro',
    description: '12.9-inch tablet with M2 chip',
    category: 'Electronics',
    location: 'A-02-01',
    warehouseId: 'WH-001',
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    unitCost: 1099.00,
    totalValue: 8792.00,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lastMovement: new Date(Date.now() - 6 * 60 * 60 * 1000),
    movementType: 'out',
    supplier: 'Apple Inc',
    barcode: '123456789013',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '3',
    sku: 'FURN-001',
    name: 'Office Desk Chair',
    description: 'Ergonomic office chair with lumbar support',
    category: 'Furniture',
    location: 'B-01-03',
    warehouseId: 'WH-002',
    currentStock: 0,
    minStock: 5,
    maxStock: 25,
    unitCost: 249.99,
    totalValue: 0,
    lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lastMovement: new Date(Date.now() - 18 * 60 * 60 * 1000),
    movementType: 'out',
    supplier: 'Herman Miller',
    barcode: '123456789014',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '4',
    sku: 'CLTH-001',
    name: 'Nike Air Max Sneakers',
    description: 'Athletic sneakers - Size 10',
    category: 'Clothing',
    location: 'C-03-01',
    warehouseId: 'WH-001',
    currentStock: 85,
    minStock: 30,
    maxStock: 60,
    unitCost: 129.99,
    totalValue: 11049.15,
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000),
    lastMovement: new Date(Date.now() - 10 * 60 * 60 * 1000),
    movementType: 'in',
    supplier: 'Nike Inc',
    barcode: '123456789015',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  }
];

export default function InventoryTrackingScreen() {
  const theme = useTheme();
  const { user, isDevMode } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isDevMode || !user?.companyId) {
      setInventoryItems(mockInventoryItems);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'inventory_items'),
      where('companyId', '==', user.companyId),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          lastMovement: data.lastMovement?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as InventoryItem;
      });
      setInventoryItems(items);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching inventory items:', error);
      setInventoryItems(mockInventoryItems);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.companyId, isDevMode]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'low_stock') {
        matchesStatus = item.currentStock <= item.minStock && item.currentStock > 0;
      } else if (statusFilter === 'out_of_stock') {
        matchesStatus = item.currentStock === 0;
      } else if (statusFilter === 'overstock') {
        matchesStatus = item.currentStock > item.maxStock;
      } else if (statusFilter === 'normal') {
        matchesStatus = item.currentStock > item.minStock && item.currentStock <= item.maxStock;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, searchQuery, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStock = inventoryItems.filter(item => item.currentStock <= item.minStock && item.currentStock > 0).length;
    const outOfStock = inventoryItems.filter(item => item.currentStock === 0).length;
    const overstock = inventoryItems.filter(item => item.currentStock > item.maxStock).length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentMovements = inventoryItems.filter(item => item.lastMovement >= today).length;

    return {
      totalItems: total,
      totalValue,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      overstockItems: overstock,
      recentMovements
    };
  }, [inventoryItems]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(inventoryItems.map(item => item.category)));
    return cats.sort();
  }, [inventoryItems]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'out_of_stock';
    if (item.currentStock <= item.minStock) return 'low_stock';
    if (item.currentStock > item.maxStock) return 'overstock';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock': return theme.colors.error;
      case 'low_stock': return '#FF9800';
      case 'overstock': return '#2196F3';
      case 'normal': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'out_of_stock': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      case 'overstock': return 'Overstock';
      case 'normal': return 'Normal';
      default: return 'Unknown';
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min((item.currentStock / item.maxStock) * 100, 100);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Loading inventory...
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
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Inventory Tracking
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Monitor stock levels and inventory movements
          </Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search items, SKU, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ backgroundColor: theme.colors.surface }}
          />
        </View>

        {/* Filters */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Filter by Status
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {['all', 'normal', 'low_stock', 'out_of_stock', 'overstock'].map((status) => (
              <Chip
                key={status}
                selected={statusFilter === status}
                onPress={() => setStatusFilter(status)}
                style={{ marginRight: 8 }}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
              </Chip>
            ))}
          </ScrollView>

          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Filter by Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              selected={categoryFilter === 'all'}
              onPress={() => setCategoryFilter('all')}
              style={{ marginRight: 8 }}
            >
              All
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={categoryFilter === category}
                onPress={() => setCategoryFilter(category)}
                style={{ marginRight: 8 }}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Stats Cards - 2x2 Grid Layout */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {/* First Row */}
          <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <Package size={24} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.totalItems}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Items
                </Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <BarChart3 size={24} color="#4CAF50" />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  ${stats.totalValue.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Value
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Second Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <AlertTriangle size={24} color="#FF9800" />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.lowStockItems}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Low Stock
                </Text>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <TrendingDown size={24} color={theme.colors.error} />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
                  {stats.outOfStockItems}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Out of Stock
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Inventory Items List */}
        <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
            Items ({filteredItems.length})
          </Text>

          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            const stockPercentage = getStockPercentage(item);
            
            return (
              <Card key={item.id} style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}>
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Package size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                          {item.name}
                        </Text>
                        <Chip
                          textStyle={{ fontSize: 10 }}
                          style={{ 
                            backgroundColor: getStockStatusColor(stockStatus) + '20',
                            height: 24
                          }}
                        >
                          {getStockStatusText(stockStatus)}
                        </Chip>
                      </View>
                      
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                        SKU: {item.sku} • {item.category}
                      </Text>

                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                        {item.description}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                            Stock Level: {item.currentStock} / {item.maxStock}
                          </Text>
                          <ProgressBar 
                            progress={stockPercentage / 100}
                            color={getStockStatusColor(stockStatus)}
                            style={{ height: 6 }}
                          />
                        </View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {stockPercentage.toFixed(0)}%
                        </Text>
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Location: {item.warehouseId} - {item.location}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Unit Cost: ${item.unitCost.toFixed(2)} • Total Value: ${item.totalValue.toLocaleString()}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Last Updated: {item.lastUpdated.toLocaleDateString()} {item.lastUpdated.toLocaleTimeString()}
                        </Text>
                        {item.supplier && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Supplier: {item.supplier}
                          </Text>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button
                          mode="outlined"
                          onPress={() => router.push(`/(admin)/warehouse/inventory/${item.id}`)}
                          style={{ flex: 1 }}
                        >
                          View Details
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => router.push(`/(admin)/warehouse/inventory/${item.id}/adjust`)}
                          style={{ flex: 1 }}
                        >
                          Adjust Stock
                        </Button>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}

          {filteredItems.length === 0 && (
            <Card style={{ backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Package size={48} color={theme.colors.outline} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                  No items found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  Try adjusting your search or filter criteria
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB for new item */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => router.push('/(admin)/warehouse/inventory/create')}
      />
    </ScreenWrapper>
  );
}
