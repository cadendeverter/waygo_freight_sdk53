import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text, Card, Button, useTheme, Searchbar, Chip } from 'react-native-paper';
import { Package, BarChart, AlertCircle } from '../../../utils/icons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Heading from '../../../components/typography/Heading';

const mockInventoryData = [
  {
    id: 'INV001',
    name: 'Electronics - Consumer',
    sku: 'ELEC-001',
    quantity: 150,
    location: 'A-1-01',
    value: '$45,000',
    status: 'In Stock',
    lastUpdated: '2024-01-15',
    category: 'Electronics'
  },
  {
    id: 'INV002',
    name: 'Automotive Parts',
    sku: 'AUTO-002',
    quantity: 5,
    location: 'B-2-03',
    value: '$12,500',
    status: 'Low Stock',
    lastUpdated: '2024-01-14',
    category: 'Automotive'
  },
  {
    id: 'INV003',
    name: 'Medical Supplies',
    sku: 'MED-003',
    quantity: 0,
    location: 'C-1-05',
    value: '$0',
    status: 'Out of Stock',
    lastUpdated: '2024-01-13',
    category: 'Medical'
  },
  {
    id: 'INV004',
    name: 'Food & Beverage',
    sku: 'FOOD-004',
    quantity: 300,
    location: 'D-3-02',
    value: '$8,200',
    status: 'In Stock',
    lastUpdated: '2024-01-15',
    category: 'Food'
  }
];

export default function InventoryScreen() {
  const theme = useTheme();
  const [inventory, setInventory] = useState(mockInventoryData);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Automotive', 'Medical', 'Food'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return '#34C759';
      case 'Low Stock': return '#FF9500';
      case 'Out of Stock': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock': return 'check-circle';
      case 'Low Stock': return 'alert-circle';
      case 'Out of Stock': return 'alert-circle';
      default: return 'package';
    }
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Inventory Management' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <Heading variant="h1">Inventory</Heading>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Warehouse inventory tracking
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Search */}
        <Searchbar
          placeholder="Search inventory..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                showSelectedOverlay
              >
                {category}
              </Chip>
            ))}
          </View>
        </ScrollView>

        {/* Inventory Summary */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
              Inventory Summary
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#34C759' }}>
                  {inventory.filter(i => i.status === 'In Stock').length}
                </Text>
                <Text variant="bodySmall">In Stock</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#FF9500' }}>
                  {inventory.filter(i => i.status === 'Low Stock').length}
                </Text>
                <Text variant="bodySmall">Low Stock</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                  {inventory.filter(i => i.status === 'Out of Stock').length}
                </Text>
                <Text variant="bodySmall">Out of Stock</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Inventory List */}
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredInventory.map((item) => (
          <Card key={item.id} style={{ marginBottom: 12 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {item.name}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    SKU: {item.sku}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: getStatusColor(item.status),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignItems: 'center'
                }}>
                  <Text variant="labelSmall" style={{ color: 'white', fontWeight: 'bold' }}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Quantity
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {item.quantity} units
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Location
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {item.location}
                  </Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Value
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {item.value}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Updated: {item.lastUpdated}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button mode="outlined" compact onPress={() => {}}>
                    Edit
                  </Button>
                  <Button mode="contained" compact onPress={() => {}}>
                    Move
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {}}
          style={{ borderRadius: 28 }}
        >
          Add Item
        </Button>
      </View>
    </ScreenWrapper>
  );
}
