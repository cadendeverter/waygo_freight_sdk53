import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  ProgressBar,
  IconButton,
  Surface,
  DataTable,
  Searchbar
} from 'react-native-paper';
import { 
  Fuel, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Truck,
  BarChart3,
  Target,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Filter
} from '../../../utils/icons';

interface FuelTransaction {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  timestamp: Date;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number; };
  };
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  odometer: number;
  fuelType: 'DIESEL' | 'GASOLINE' | 'DEF';
  cardNumber: string;
  receipt?: string;
  mpg?: number;
  vendor: string;
  discountApplied?: number;
  taxAmount?: number;
}

interface VehicleFuelMetrics {
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  currentMPG: number;
  avgMPG: number;
  targetMPG: number;
  totalGallons: number;
  totalCost: number;
  milesPerMonth: number;
  costPerMile: number;
  fuelEfficiencyRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  lastFuelUp: Date;
  trends: {
    mpg: number; // percentage change
    cost: number; // percentage change
    efficiency: number; // percentage change
  };
}

interface FuelAlert {
  id: string;
  type: 'EFFICIENCY_DROP' | 'UNUSUAL_COST' | 'FUEL_THEFT' | 'CARD_MISUSE' | 'MAINTENANCE_NEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vehicleId?: string;
  driverId?: string;
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  recommendations?: string[];
}

const mockTransactions: FuelTransaction[] = [
  {
    id: 'txn1',
    vehicleId: 'v1',
    vehicleNumber: 'T-101',
    driverId: 'd1',
    driverName: 'John Smith',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    location: {
      name: 'Flying J Travel Center',
      address: '1234 Highway 80',
      city: 'Des Moines',
      state: 'IA',
      coordinates: { lat: 41.5868, lng: -93.6250 }
    },
    gallons: 125.5,
    pricePerGallon: 3.89,
    totalCost: 488.20,
    odometer: 145672,
    fuelType: 'DIESEL',
    cardNumber: '****1234',
    mpg: 7.2,
    vendor: 'Flying J',
    discountApplied: 12.45,
    taxAmount: 45.20
  },
  {
    id: 'txn2',
    vehicleId: 'v2',
    vehicleNumber: 'T-102',
    driverId: 'd2',
    driverName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    location: {
      name: 'Pilot Travel Center',
      address: '5678 Interstate Dr',
      city: 'Kansas City',
      state: 'MO',
      coordinates: { lat: 39.0997, lng: -94.5786 }
    },
    gallons: 98.3,
    pricePerGallon: 3.92,
    totalCost: 385.34,
    odometer: 89234,
    fuelType: 'DIESEL',
    cardNumber: '****5678',
    mpg: 6.8,
    vendor: 'Pilot',
    discountApplied: 8.20,
    taxAmount: 35.65
  }
];

const mockVehicleMetrics: VehicleFuelMetrics[] = [
  {
    vehicleId: 'v1',
    vehicleNumber: 'T-101',
    vehicleType: 'Freightliner Cascadia',
    currentMPG: 7.2,
    avgMPG: 6.9,
    targetMPG: 7.5,
    totalGallons: 1850,
    totalCost: 7245.50,
    milesPerMonth: 12500,
    costPerMile: 0.58,
    fuelEfficiencyRating: 'GOOD',
    lastFuelUp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    trends: {
      mpg: 4.3,
      cost: -2.1,
      efficiency: 6.8
    }
  },
  {
    vehicleId: 'v2',
    vehicleNumber: 'T-102',
    vehicleType: 'Kenworth T680',
    currentMPG: 6.8,
    avgMPG: 7.1,
    targetMPG: 7.5,
    totalGallons: 1654,
    totalCost: 6487.80,
    milesPerMonth: 11200,
    costPerMile: 0.58,
    fuelEfficiencyRating: 'AVERAGE',
    lastFuelUp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    trends: {
      mpg: -4.2,
      cost: 3.5,
      efficiency: -2.8
    }
  }
];

const mockAlerts: FuelAlert[] = [
  {
    id: 'alert1',
    type: 'EFFICIENCY_DROP',
    severity: 'MEDIUM',
    vehicleId: 'v2',
    title: 'Fuel Efficiency Drop - T-102',
    description: 'Vehicle T-102 showing 4.2% decrease in fuel efficiency over last 7 days',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    resolved: false,
    recommendations: [
      'Schedule engine diagnostic check',
      'Review driver behavior patterns',
      'Check tire pressure and alignment'
    ]
  },
  {
    id: 'alert2',
    type: 'UNUSUAL_COST',
    severity: 'HIGH',
    driverId: 'd3',
    title: 'Unusual Fuel Cost Pattern',
    description: 'Driver Mike Wilson has 25% higher fuel costs than fleet average',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    resolved: false,
    recommendations: [
      'Review fuel purchase locations',
      'Analyze driving behavior',
      'Provide fuel-efficient driving training'
    ]
  }
];

export default function FuelManagementScreen() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<FuelTransaction[]>(mockTransactions);
  const [vehicleMetrics, setVehicleMetrics] = useState<VehicleFuelMetrics[]>(mockVehicleMetrics);
  const [alerts, setAlerts] = useState<FuelAlert[]>(mockAlerts);
  const [selectedFilter, setSelectedFilter] = useState<string>('recent');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const getEfficiencyColor = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT': return '#4CAF50';
      case 'GOOD': return '#8BC34A';
      case 'AVERAGE': return '#FF9800';
      case 'POOR': return '#F44336';
      default: return theme.colors.outline;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#F44336';
      case 'HIGH': return '#FF5722';
      case 'MEDIUM': return '#FF9800';
      case 'LOW': return '#2196F3';
      default: return theme.colors.outline;
    }
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? 
      <TrendingUp size={16} color="#4CAF50" /> : 
      <TrendingDown size={16} color="#F44336" />;
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? '#4CAF50' : '#F44336';
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = !searchQuery || 
      txn.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.location.name.toLowerCase().includes(searchQuery.toLowerCase());

    const now = new Date();
    const txnDate = txn.timestamp;
    const daysDiff = (now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'recent' && daysDiff <= 7) ||
      (selectedFilter === 'today' && daysDiff <= 1) ||
      (selectedFilter === 'diesel' && txn.fuelType === 'DIESEL') ||
      (selectedFilter === 'high-cost' && txn.totalCost > 400);

    return matchesSearch && matchesFilter;
  });

  const viewTransactionDetails = (transaction: FuelTransaction) => {
    Alert.alert(
      `Fuel Transaction - ${transaction.vehicleNumber}`,
      `Driver: ${transaction.driverName}
Location: ${transaction.location.name}
${transaction.location.city}, ${transaction.location.state}

Fuel Details:
• Type: ${transaction.fuelType}
• Gallons: ${transaction.gallons.toFixed(1)}
• Price/Gallon: $${transaction.pricePerGallon.toFixed(2)}
• Total Cost: $${transaction.totalCost.toFixed(2)}
• Discount: $${transaction.discountApplied?.toFixed(2) || '0.00'}
• Tax: $${transaction.taxAmount?.toFixed(2) || '0.00'}

Vehicle Data:
• Odometer: ${transaction.odometer.toLocaleString()} miles
• Fuel Efficiency: ${transaction.mpg?.toFixed(1) || 'N/A'} MPG

Payment:
• Card: ${transaction.cardNumber}
• Vendor: ${transaction.vendor}
• Time: ${transaction.timestamp.toLocaleString()}`,
      [
        { text: 'OK' },
        { text: 'View Receipt', onPress: () => Alert.alert('Receipt', 'Receipt viewer will open in a future update.') },
        { text: 'Flag Issue', onPress: () => Alert.alert('Issue Flagged', 'Transaction flagged for review.') }
      ]
    );
  };

  const viewVehicleDetails = (vehicle: VehicleFuelMetrics) => {
    Alert.alert(
      `Fuel Analytics - ${vehicle.vehicleNumber}`,
      `Vehicle: ${vehicle.vehicleType}
Efficiency Rating: ${vehicle.fuelEfficiencyRating}

Current Performance:
• Current MPG: ${vehicle.currentMPG.toFixed(1)}
• Average MPG: ${vehicle.avgMPG.toFixed(1)}
• Target MPG: ${vehicle.targetMPG.toFixed(1)}
• Performance vs Target: ${((vehicle.currentMPG / vehicle.targetMPG - 1) * 100).toFixed(1)}%

Monthly Metrics:
• Miles Driven: ${vehicle.milesPerMonth.toLocaleString()}
• Total Gallons: ${vehicle.totalGallons.toFixed(0)}
• Total Cost: $${vehicle.totalCost.toFixed(2)}
• Cost per Mile: $${vehicle.costPerMile.toFixed(2)}

Trends (vs. previous period):
• MPG Change: ${vehicle.trends.mpg > 0 ? '+' : ''}${vehicle.trends.mpg.toFixed(1)}%
• Cost Change: ${vehicle.trends.cost > 0 ? '+' : ''}${vehicle.trends.cost.toFixed(1)}%
• Efficiency Change: ${vehicle.trends.efficiency > 0 ? '+' : ''}${vehicle.trends.efficiency.toFixed(1)}%

Last Fuel-up: ${vehicle.lastFuelUp.toLocaleString()}`,
      [
        { text: 'OK' },
        { text: 'View History', onPress: () => Alert.alert('History', 'Detailed fuel history will open in a future update.') },
        { text: 'Set Alert', onPress: () => Alert.alert('Alert Set', 'Fuel efficiency alert configured.') }
      ]
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    Alert.alert('Alert Resolved', 'Alert marked as resolved.');
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate real-time data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportReport = () => {
    Alert.alert('Export Report', 'Fuel management report exported successfully!');
  };

  const addFuelTransaction = () => {
    Alert.alert('Add Transaction', 'Manual fuel transaction entry will be available in a future update.');
  };

  // Calculate fleet fuel statistics
  const fleetStats = {
    totalVehicles: vehicleMetrics.length,
    avgMPG: vehicleMetrics.reduce((sum, v) => sum + v.currentMPG, 0) / vehicleMetrics.length,
    totalCost: vehicleMetrics.reduce((sum, v) => sum + v.totalCost, 0),
    totalGallons: vehicleMetrics.reduce((sum, v) => sum + v.totalGallons, 0),
    avgCostPerMile: vehicleMetrics.reduce((sum, v) => sum + v.costPerMile, 0) / vehicleMetrics.length,
    unresolvedAlerts: alerts.filter(a => !a.resolved).length
  };

  const recentTransactionsCost = transactions
    .filter(t => (new Date().getTime() - t.timestamp.getTime()) / (1000 * 60 * 60 * 24) <= 7)
    .reduce((sum, t) => sum + t.totalCost, 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Fuel Management</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={refreshData}
              loading={refreshing}
              icon="refresh"
              compact
            >
              Refresh
            </Button>
            <Button 
              mode="outlined" 
              onPress={exportReport}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Fleet Fuel Statistics */}
        <Card style={{ marginBottom: 16, padding: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Fleet Fuel Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <View style={{ alignItems: 'center', width: (screenWidth - 64) / 3 }}>
              <Text variant="headlineSmall">{fleetStats.avgMPG.toFixed(1)}</Text>
              <Text variant="bodySmall">Avg MPG</Text>
            </View>
            <View style={{ alignItems: 'center', width: (screenWidth - 64) / 3 }}>
              <Text variant="headlineSmall">${Math.round(fleetStats.totalCost / 1000)}K</Text>
              <Text variant="bodySmall">Total Cost</Text>
            </View>
            <View style={{ alignItems: 'center', width: (screenWidth - 64) / 3 }}>
              <Text variant="headlineSmall">{Math.round(fleetStats.totalGallons / 1000)}K</Text>
              <Text variant="bodySmall">Total Gallons</Text>
            </View>
            <View style={{ alignItems: 'center', width: (screenWidth - 64) / 3, marginTop: 12 }}>
              <Text variant="headlineSmall">${fleetStats.avgCostPerMile.toFixed(2)}</Text>
              <Text variant="bodySmall">Avg $/Mile</Text>
            </View>
            <View style={{ alignItems: 'center', width: (screenWidth - 64) / 3, marginTop: 12 }}>
              <Text variant="headlineSmall">${Math.round(recentTransactionsCost)}</Text>
              <Text variant="bodySmall">Week Cost</Text>
            </View>
            <View style={{ alignItems: 'center', width: (screenWidth - 64) / 3, marginTop: 12 }}>
              <Text variant="headlineSmall" style={{ color: fleetStats.unresolvedAlerts > 0 ? '#F44336' : '#4CAF50' }}>
                {fleetStats.unresolvedAlerts}
              </Text>
              <Text variant="bodySmall">Active Alerts</Text>
            </View>
          </View>
        </Card>

        {/* Search */}
        <Searchbar
          placeholder="Search vehicles, drivers, or locations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'recent', label: 'Recent (7 days)' },
              { key: 'today', label: 'Today' },
              { key: 'diesel', label: 'Diesel Only' },
              { key: 'high-cost', label: 'High Cost' },
              { key: 'all', label: 'All Transactions' }
            ].map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={{ marginRight: 8 }}
              >
                {filter.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Active Fuel Alerts */}
        {alerts.filter(a => !a.resolved).length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ padding: 16 }}>
              <Text variant="titleMedium" style={{ marginBottom: 12, color: '#F44336' }}>
                Active Fuel Alerts ({alerts.filter(a => !a.resolved).length})
              </Text>
              {alerts.filter(a => !a.resolved).map(alert => (
                <Surface key={alert.id} style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 8,
                  backgroundColor: alert.severity === 'CRITICAL' ? '#FFEBEE' : alert.severity === 'HIGH' ? '#FFF3E0' : '#E3F2FD'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <AlertTriangle size={16} color={getAlertColor(alert.severity)} />
                        <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{alert.title}</Text>
                        <Badge style={{ backgroundColor: getAlertColor(alert.severity) }}>
                          {alert.severity}
                        </Badge>
                      </View>
                      <Text variant="bodyMedium" style={{ marginBottom: 8 }}>{alert.description}</Text>
                      {alert.recommendations && (
                        <View>
                          <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>Recommendations:</Text>
                          {alert.recommendations.map((rec, index) => (
                            <Text key={index} variant="bodySmall" style={{ marginLeft: 8, marginBottom: 2 }}>
                              • {rec}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                    <Button 
                      mode="text" 
                      onPress={() => resolveAlert(alert.id)}
                      compact
                    >
                      Resolve
                    </Button>
                  </View>
                </Surface>
              ))}
            </View>
          </Card>
        )}

        {/* Vehicle Fuel Efficiency */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>Vehicle Fuel Efficiency</Text>
            {vehicleMetrics.map(vehicle => (
              <List.Item
                key={vehicle.vehicleId}
                title={vehicle.vehicleNumber}
                description={`${vehicle.vehicleType} • ${vehicle.currentMPG.toFixed(1)} MPG • $${vehicle.costPerMile.toFixed(2)}/mile`}
                left={(props) => (
                  <Avatar.Icon 
                    {...props} 
                    icon="truck"
                    style={{ backgroundColor: getEfficiencyColor(vehicle.fuelEfficiencyRating) }}
                  />
                )}
                right={(props) => (
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                    <Badge style={{ backgroundColor: getEfficiencyColor(vehicle.fuelEfficiencyRating) }}>
                      {vehicle.fuelEfficiencyRating}
                    </Badge>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {getTrendIcon(vehicle.trends.mpg)}
                      <Text variant="bodySmall" style={{ color: getTrendColor(vehicle.trends.mpg) }}>
                        {vehicle.trends.mpg > 0 ? '+' : ''}{vehicle.trends.mpg.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                )}
                onPress={() => viewVehicleDetails(vehicle)}
              />
            ))}
          </View>
        </Card>

        {/* Recent Fuel Transactions */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Recent Fuel Transactions ({filteredTransactions.length})
            </Text>
            {filteredTransactions.map(transaction => (
              <List.Item
                key={transaction.id}
                title={`${transaction.vehicleNumber} - ${transaction.driverName}`}
                description={`${transaction.location.name} • ${transaction.gallons.toFixed(1)} gal • $${transaction.totalCost.toFixed(2)}`}
                left={(props) => (
                  <Avatar.Icon 
                    {...props} 
                    icon="fuel"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
                right={(props) => (
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {transaction.timestamp.toLocaleTimeString()}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Fuel size={16} color={theme.colors.outline} />
                      <Text variant="bodySmall">{transaction.mpg?.toFixed(1) || 'N/A'} MPG</Text>
                    </View>
                  </View>
                )}
                onPress={() => viewTransactionDetails(transaction)}
              />
            ))}
            
            {filteredTransactions.length === 0 && (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Fuel size={48} color={theme.colors.outline} />
                <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                  No Transactions Found
                </Text>
                <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
                  No fuel transactions match your search criteria.
                </Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <IconButton
          icon="plus"
          mode="contained"
          size={24}
          onPress={addFuelTransaction}
          style={{ backgroundColor: theme.colors.primary }}
        />
      </View>
    </View>
  );
}
