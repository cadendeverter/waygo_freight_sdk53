import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text, Card, Button, useTheme, Searchbar, Chip, FAB, Menu, Divider, Badge } from 'react-native-paper';
import { Package, BarChart, AlertCircle, Plus, MoreVertical, Edit, Trash, Archive, TrendingUp, TrendingDown } from '../../../utils/icons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Heading from '../../../components/typography/Heading';
import { useWarehouse } from '../../../state/warehouseContext';
import { useAuth } from '../../../state/authContext';
import { InventoryItem } from '../../../types';
import LoadingSpinner from '../../../components/LoadingSpinner';

const getStockStatus = (item: InventoryItem) => {
  if (item.quantityOnHand === 0) return 'Out of Stock';
  if (item.quantityOnHand < 10) return 'Low Stock'; // Placeholder threshold
  return 'In Stock';
};

const getStockStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'Out of Stock':
      return theme.colors.error;
    case 'Low Stock':
      return '#FF9500'; // Orange color
    case 'In Stock':
      return '#34C759'; // Green color
    default:
      return theme.colors.outline;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

interface InventoryCardProps {
  item: InventoryItem;
  onPress: () => void;
  onMenuPress: () => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ item, onPress, onMenuPress }) => {
  const theme = useTheme();
  const stockStatus = getStockStatus(item);
  const totalValue = item.quantityOnHand * item.unitValue;
  
  return (
    <Card style={{ marginBottom: 16 }} onPress={onPress}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
              {item.description}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              SKU: {item.sku} {item.barcode && `• ${item.barcode}`}
            </Text>
            <Badge 
              size={24}
              style={{ 
                backgroundColor: getStockStatusColor(stockStatus, theme),
                alignSelf: 'flex-start'
              }}
            >
              {stockStatus}
            </Badge>
          </View>
          <TouchableOpacity onPress={onMenuPress}>
            <MoreVertical size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Location
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
              {item.location.zone}-{item.location.aisle}-{item.location.bay}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Quantity
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
              {item.quantityOnHand}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Value
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '500', color: '#34C759' }}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Category: {item.category}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {formatDate(item.updatedAt)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function InventoryScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { 
    inventory, warehouses, loading, error,
    addInventoryItem,
    updateInventoryItem,
    adjustInventory,
    scanBarcode
  } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const filteredInventory = inventory.filter((item: InventoryItem) => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const stockStatus = getStockStatus(item);
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in_stock' && stockStatus === 'In Stock') ||
                        (stockFilter === 'low_stock' && stockStatus === 'Low Stock') ||
                        (stockFilter === 'out_of_stock' && stockStatus === 'Out of Stock');
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const openMenu = (itemId: string) => {
    setMenuVisible(prev => ({ ...prev, [itemId]: true }));
  };

  const closeMenu = (itemId: string) => {
    setMenuVisible(prev => ({ ...prev, [itemId]: false }));
  };

  const handleItemPress = (item: InventoryItem) => {
    router.push(`/(warehouse)/inventory/${item.id}`);
  };

  const handleCreateItem = () => {
    router.push('/(warehouse)/inventory/create');
  };

  const handleAdjustQuantity = async (item: InventoryItem, adjustment: number, reason: string) => {
    try {
      await adjustInventory(item.id, adjustment, reason);
      closeMenu(item.id);
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    console.log('Delete not implemented yet');
  };

  const renderInventoryCard = ({ item }: { item: InventoryItem }) => (
    <View>
      <InventoryCard
        item={item}
        onPress={() => handleItemPress(item)}
        onMenuPress={() => openMenu(item.id)}
      />
      <Menu
        visible={menuVisible[item.id] || false}
        onDismiss={() => closeMenu(item.id)}
        anchor={<View />}
        contentStyle={{ marginTop: 50 }}
      >
        <Menu.Item
          onPress={() => handleAdjustQuantity(item, 1, 'Manual adjustment')}
          title="Add Stock"
          leadingIcon={() => <TrendingUp size={20} color={theme.colors.onSurface} />}
        />
        <Menu.Item
          onPress={() => handleAdjustQuantity(item, -1, 'Manual adjustment')}
          title="Remove Stock"
          leadingIcon={() => <TrendingDown size={20} color={theme.colors.onSurface} />}
        />
        <Divider />
        <Menu.Item
          onPress={() => router.push(`/(warehouse)/inventory/${item.id}/edit`)}
          title="Edit Item"
          leadingIcon={() => <Edit size={20} color={theme.colors.onSurface} />}
        />
        <Menu.Item
          onPress={() => handleDeleteItem(item)}
          title="Delete Item"
          leadingIcon={() => <Trash size={20} color={theme.colors.error} />}
        />
      </Menu>
    </View>
  );

  // Calculate summary stats
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantityOnHand * item.unitValue), 0);
  const lowStockItems = inventory.filter(item => getStockStatus(item) === 'Low Stock').length;
  const outOfStockItems = inventory.filter(item => getStockStatus(item) === 'Out of Stock').length;

  if (loading && inventory.length === 0) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Inventory Management' }} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Heading variant="h1" style={{ marginBottom: 16 }}>
            Inventory Management
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

          {/* Summary Cards */}
          <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
            <Card style={{ flex: 1 }}>
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Package size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  Total Items
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  {totalItems}
                </Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }}>
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <BarChart size={24} color="#34C759" />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  Total Value
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: '600', color: '#34C759' }}>
                  {formatCurrency(totalValue)}
                </Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }}>
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <AlertCircle size={24} color="#FF9500" />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  Alerts
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: '600', color: '#FF9500' }}>
                  {lowStockItems + outOfStockItems}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Searchbar
            placeholder="Search inventory..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={categoryFilter === category}
                  onPress={() => setCategoryFilter(category)}
                  mode={categoryFilter === category ? 'flat' : 'outlined'}
                  style={{ marginRight: 8 }}
                >
                  {category === 'all' ? 'All Categories' : category}
                </Chip>
              ))}
            </View>
          </ScrollView>

          {/* Stock Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { key: 'all', label: 'All Stock' },
                { key: 'in_stock', label: 'In Stock' },
                { key: 'low_stock', label: 'Low Stock' },
                { key: 'out_of_stock', label: 'Out of Stock' }
              ].map((filter) => (
                <Chip
                  key={filter.key}
                  selected={stockFilter === filter.key}
                  onPress={() => setStockFilter(filter.key)}
                  mode={stockFilter === filter.key ? 'flat' : 'outlined'}
                  style={{ marginRight: 8 }}
                >
                  {filter.label}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="titleMedium">
              {filteredInventory.length} Item{filteredInventory.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredInventory}
            renderItem={renderInventoryCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <Card style={{ padding: 32, alignItems: 'center' }}>
                <Package size={48} color={theme.colors.outline} />
                <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                  No inventory found
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first inventory item to get started'
                  }
                </Text>
                {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleCreateItem}
                    style={{ marginTop: 16 }}
                    icon="plus"
                  >
                    Add Item
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
        onPress={handleCreateItem}
      />
    </ScreenWrapper>
  );
}
