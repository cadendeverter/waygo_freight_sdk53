// waygo-freight/app/(admin)/finance/fuel-cards.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, IconButton, Surface, 
  Dialog, Portal, TextInput, List, Badge, FAB, ProgressBar,
  Searchbar, Menu, ActivityIndicator, Divider, DataTable, Switch
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Fuel, DollarSign, Calendar, FileText, CheckCircle,
  AlertTriangle, Search, Filter, Plus, Download, 
  Eye, Settings, TrendingUp, TrendingDown, MapPin,
  Clock, User, Car, BarChart3
} from '../../../utils/icons';

import { useAuth } from '../../../state/authContext';

interface FuelCard {
  id: string;
  cardNumber: string;
  driverName: string;
  driverId: string;
  vehicleId: string;
  status: 'Active' | 'Suspended' | 'Lost' | 'Expired';
  balance: number;
  monthlyLimit: number;
  lastTransaction: {
    date: string;
    location: string;
    amount: number;
    gallons: number;
    pricePerGallon: number;
  };
  expirationDate: string;
  provider: 'WEX' | 'Comdata' | 'EFS' | 'RTS';
}

interface FuelTransaction {
  id: string;
  cardId: string;
  driverName: string;
  vehicleId: string;
  date: string;
  time: string;
  location: string;
  address: string;
  state: string;
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  odometer: number;
  merchantName: string;
  authCode: string;
  transactionType: 'Fuel' | 'DEF' | 'Oil' | 'Maintenance';
  status: 'Approved' | 'Declined' | 'Pending';
}

interface FuelAnalytics {
  totalSpent: number;
  totalGallons: number;
  averagePPG: number;
  monthlyTrend: number;
  topStates: Array<{state: string; amount: number; gallons: number}>;
  mileageEfficiency: number;
}

export default function FuelCardsManagement() {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'CARDS' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS'>('CARDS');
  const [fuelCards, setFuelCards] = useState<FuelCard[]>([]);
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [analytics, setAnalytics] = useState<FuelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs
  const [addCardDialogVisible, setAddCardDialogVisible] = useState(false);
  const [transactionDetailVisible, setTransactionDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FuelTransaction | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('THIS_MONTH');

  useEffect(() => {
    loadFuelCardsData();
  }, []);

  const loadFuelCardsData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from your fuel card integration API
      // For now, using sample data
      const sampleCards: FuelCard[] = [
        {
          id: 'FC001',
          cardNumber: '****-****-****-1234',
          driverName: 'John Smith',
          driverId: 'DRV001',
          vehicleId: 'TRK001',
          status: 'Active',
          balance: 2500.00,
          monthlyLimit: 3000.00,
          lastTransaction: {
            date: '2024-01-15',
            location: 'Flying J - Phoenix, AZ',
            amount: 285.45,
            gallons: 125.5,
            pricePerGallon: 2.27
          },
          expirationDate: '2025-12-31',
          provider: 'WEX'
        },
        {
          id: 'FC002',
          cardNumber: '****-****-****-5678',
          driverName: 'Sarah Johnson',
          driverId: 'DRV002',
          vehicleId: 'TRK002',
          status: 'Active',
          balance: 1800.50,
          monthlyLimit: 2500.00,
          lastTransaction: {
            date: '2024-01-14',
            location: 'TA Travel Center - Denver, CO',
            amount: 210.30,
            gallons: 98.2,
            pricePerGallon: 2.14
          },
          expirationDate: '2025-08-15',
          provider: 'Comdata'
        }
      ];

      const sampleTransactions: FuelTransaction[] = [
        {
          id: 'TXN001',
          cardId: 'FC001',
          driverName: 'John Smith',
          vehicleId: 'TRK001',
          date: '2024-01-15',
          time: '14:23',
          location: 'Flying J',
          address: '1234 I-10 W, Phoenix, AZ 85009',
          state: 'AZ',
          gallons: 125.5,
          pricePerGallon: 2.27,
          totalAmount: 285.45,
          odometer: 458920,
          merchantName: 'Flying J Travel Center',
          authCode: 'AUTH123456',
          transactionType: 'Fuel',
          status: 'Approved'
        },
        {
          id: 'TXN002',
          cardId: 'FC002',
          driverName: 'Sarah Johnson',
          vehicleId: 'TRK002',
          date: '2024-01-14',
          time: '09:15',
          location: 'TA Travel Center',
          address: '5678 I-70 E, Denver, CO 80202',
          state: 'CO',
          gallons: 98.2,
          pricePerGallon: 2.14,
          totalAmount: 210.30,
          odometer: 234567,
          merchantName: 'TA Travel Center',
          authCode: 'AUTH789012',
          transactionType: 'Fuel',
          status: 'Approved'
        }
      ];

      const sampleAnalytics: FuelAnalytics = {
        totalSpent: 25480.75,
        totalGallons: 11256.8,
        averagePPG: 2.26,
        monthlyTrend: 5.2,
        topStates: [
          { state: 'TX', amount: 8945.30, gallons: 3985.2 },
          { state: 'CA', amount: 6732.15, gallons: 2856.9 },
          { state: 'AZ', amount: 4201.80, gallons: 1890.4 }
        ],
        mileageEfficiency: 6.8
      };

      setFuelCards(sampleCards);
      setTransactions(sampleTransactions);
      setAnalytics(sampleAnalytics);
    } catch (error) {
      Alert.alert('Error', 'Failed to load fuel card data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFuelCardsData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50';
      case 'Suspended': return '#FF9800';
      case 'Lost': return '#f44336';
      case 'Expired': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'WEX': return '#1976D2';
      case 'Comdata': return '#388E3C';
      case 'EFS': return '#7B1FA2';
      case 'RTS': return '#F57C00';
      default: return '#757575';
    }
  };

  const filteredCards = fuelCards.filter(card => {
    const matchesSearch = card.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.cardNumber.includes(searchQuery) ||
                         card.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || card.status === statusFilter;
    const matchesProvider = providerFilter === 'ALL' || card.provider === providerFilter;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const renderCardsTab = () => (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Summary Cards */}
      <View style={{ flexDirection: 'row', padding: 16 }}>
        <Card style={{ flex: 1, marginRight: 8 }}>
          <Card.Content style={{ alignItems: 'center', padding: 12 }}>
            <Fuel size={28} color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Active Cards</Text>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              {fuelCards.filter(c => c.status === 'Active').length}
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={{ flex: 1, marginLeft: 8 }}>
          <Card.Content style={{ alignItems: 'center', padding: 12 }}>
            <DollarSign size={28} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>Total Balance</Text>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
              ${fuelCards.reduce((sum, card) => sum + card.balance, 0).toLocaleString()}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Filters */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Chip 
          mode={statusFilter === 'ALL' ? 'flat' : 'outlined'} 
          onPress={() => setStatusFilter('ALL')}
          style={{ marginRight: 8 }}
        >
          All Status
        </Chip>
        <Chip 
          mode={statusFilter === 'Active' ? 'flat' : 'outlined'} 
          onPress={() => setStatusFilter('Active')}
          style={{ marginRight: 8 }}
        >
          Active
        </Chip>
        <Chip 
          mode={statusFilter === 'Suspended' ? 'flat' : 'outlined'} 
          onPress={() => setStatusFilter('Suspended')}
        >
          Issues
        </Chip>
      </View>

      {/* Cards List */}
      <View style={{ paddingHorizontal: 16 }}>
        {filteredCards.map(card => (
          <Card key={card.id} style={{ marginBottom: 12 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{card.driverName}</Text>
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8, 
                        backgroundColor: getStatusColor(card.status) + '20' 
                      }}
                      textStyle={{ color: getStatusColor(card.status), fontSize: 10 }}
                    >
                      {card.status}
                    </Chip>
                  </View>
                  
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {card.cardNumber} • {card.vehicleId}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Badge 
                      style={{ backgroundColor: getProviderColor(card.provider) }}
                      size={20}
                    >
                      {card.provider}
                    </Badge>
                    <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                      Balance: ${card.balance.toLocaleString()}
                    </Text>
                  </View>

                  <Divider style={{ marginVertical: 8 }} />
                  
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Last: {card.lastTransaction.location} • ${card.lastTransaction.amount}
                  </Text>
                </View>
                
                <IconButton 
                  icon="more-vertical" 
                  size={20}
                  onPress={() => Alert.alert('Card Actions', 'Suspend, Replace, or View Details')}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  const renderTransactionsTab = () => (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={{ padding: 16 }}>
        {filteredTransactions.map(txn => (
          <Card key={txn.id} style={{ marginBottom: 12 }} onPress={() => {
            setSelectedTransaction(txn);
            setTransactionDetailVisible(true);
          }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>${txn.totalAmount}</Text>
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8, 
                        backgroundColor: txn.status === 'Approved' ? '#4CAF50' + '20' : '#FF9800' + '20'
                      }}
                      textStyle={{ 
                        color: txn.status === 'Approved' ? '#4CAF50' : '#FF9800',
                        fontSize: 10 
                      }}
                    >
                      {txn.status}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium">{txn.driverName} • {txn.vehicleId}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {txn.location} • {txn.gallons} gal @ ${txn.pricePerGallon}/gal
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {txn.date} {txn.time} • {txn.state}
                  </Text>
                </View>
                
                <IconButton 
                  icon="eye" 
                  size={20}
                  onPress={() => {
                    setSelectedTransaction(txn);
                    setTransactionDetailVisible(true);
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => {
    if (!analytics) return <ActivityIndicator style={{ marginTop: 20 }} />;
    
    return (
      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{ padding: 16 }}>
          {/* Key Metrics */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Title title="Monthly Fuel Analytics" />
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    ${analytics.totalSpent.toLocaleString()}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Total Spent</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                    {analytics.totalGallons.toLocaleString()}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Gallons</Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    ${analytics.averagePPG.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Avg PPG</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    {analytics.mileageEfficiency} MPG
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Efficiency</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Top States */}
          <Card>
            <Card.Title title="Top Fuel Spending by State" />
            <Card.Content>
              {analytics.topStates.map((stateData, index) => (
                <View key={stateData.state} style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Badge style={{ marginRight: 8 }}>{index + 1}</Badge>
                    <Text variant="titleMedium">{stateData.state}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      ${stateData.amount.toLocaleString()}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {stateData.gallons.toLocaleString()} gal
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading fuel card data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ elevation: 1 }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Fuel Card Management</Text>
          <IconButton icon="refresh" onPress={onRefresh} />
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Searchbar
            placeholder="Search cards, drivers, or vehicles..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 0, backgroundColor: theme.colors.surfaceVariant }}
          />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'CARDS', label: 'Cards', icon: 'credit-card' },
              { key: 'TRANSACTIONS', label: 'Transactions', icon: 'receipt' },
              { key: 'ANALYTICS', label: 'Analytics', icon: 'chart-bar' },
              { key: 'SETTINGS', label: 'Settings', icon: 'settings' }
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
      {activeTab === 'CARDS' && renderCardsTab()}
      {activeTab === 'TRANSACTIONS' && renderTransactionsTab()}
      {activeTab === 'ANALYTICS' && renderAnalyticsTab()}
      {activeTab === 'SETTINGS' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Card>
            <Card.Title title="Integration Settings" />
            <Card.Content>
              <List.Item
                title="WEX Fleet API"
                description="Sync fuel transactions automatically"
                left={() => <List.Icon icon="link" />}
                right={() => <Switch value={true} />}
              />
              <List.Item
                title="Comdata API"
                description="Real-time card balance updates"
                left={() => <List.Icon icon="link" />}
                right={() => <Switch value={false} />}
              />
              <List.Item
                title="IFTA Integration"
                description="Auto-populate fuel tax reports"
                left={() => <List.Icon icon="file-document" />}
                right={() => <Switch value={true} />}
              />
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {/* Transaction Detail Dialog */}
      <Portal>
        <Dialog 
          visible={transactionDetailVisible} 
          onDismiss={() => setTransactionDetailVisible(false)}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Transaction Details</Dialog.Title>
          <Dialog.Content>
            {selectedTransaction && (
              <View>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  ${selectedTransaction.totalAmount}
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Driver & Vehicle</Text>
                  <Text variant="bodyLarge">{selectedTransaction.driverName} • {selectedTransaction.vehicleId}</Text>
                </View>
                
                <View style={{ marginBottom: 12 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Location</Text>
                  <Text variant="bodyLarge">{selectedTransaction.merchantName}</Text>
                  <Text variant="bodyMedium">{selectedTransaction.address}</Text>
                </View>
                
                <View style={{ marginBottom: 12 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Fuel Details</Text>
                  <Text variant="bodyLarge">{selectedTransaction.gallons} gallons @ ${selectedTransaction.pricePerGallon}/gal</Text>
                </View>
                
                <View style={{ marginBottom: 12 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Date & Time</Text>
                  <Text variant="bodyLarge">{selectedTransaction.date} at {selectedTransaction.time}</Text>
                </View>
                
                <View style={{ marginBottom: 12 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Authorization</Text>
                  <Text variant="bodyLarge">{selectedTransaction.authCode}</Text>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTransactionDetailVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => setAddCardDialogVisible(true)}
      />
    </SafeAreaView>
  );
}
