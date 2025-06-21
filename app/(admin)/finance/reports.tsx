import React, { useState, useCallback } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, Searchbar, ProgressBar, FAB, Menu, IconButton } from 'react-native-paper';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical
} from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

const { width } = Dimensions.get('window');

interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  period: string;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'neutral';
  target?: number;
}

interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'paid';
  driverId?: string;
  loadId?: string;
}

// Mock financial data
const mockMetrics: FinancialMetric[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 2450000,
    previousValue: 2180000,
    period: 'This Month',
    format: 'currency',
    trend: 'up',
    target: 2500000
  },
  {
    id: 'gross_profit',
    label: 'Gross Profit',
    value: 735000,
    previousValue: 654000,
    period: 'This Month',
    format: 'currency',
    trend: 'up',
    target: 750000
  },
  {
    id: 'profit_margin',
    label: 'Profit Margin',
    value: 30.0,
    previousValue: 30.0,
    period: 'This Month',
    format: 'percentage',
    trend: 'neutral',
    target: 32.0
  },
  {
    id: 'operating_expenses',
    label: 'Operating Expenses',
    value: 1715000,
    previousValue: 1526000,
    period: 'This Month',
    format: 'currency',
    trend: 'down',
    target: 1650000
  },
  {
    id: 'fuel_costs',
    label: 'Fuel Costs',
    value: 380000,
    previousValue: 420000,
    period: 'This Month',
    format: 'currency',
    trend: 'up',
    target: 350000
  },
  {
    id: 'avg_revenue_per_load',
    label: 'Avg Revenue/Load',
    value: 3250,
    previousValue: 3100,
    period: 'This Month',
    format: 'currency',
    trend: 'up',
    target: 3500
  }
];

const mockRevenueBreakdown: RevenueBreakdown[] = [
  { category: 'Dry Van', amount: 1225000, percentage: 50.0, color: '#007AFF' },
  { category: 'Reefer', amount: 735000, percentage: 30.0, color: '#34C759' },
  { category: 'Flatbed', amount: 367500, percentage: 15.0, color: '#FF9500' },
  { category: 'LTL', amount: 122500, percentage: 5.0, color: '#8E8E93' }
];

const mockExpenses: ExpenseItem[] = [
  {
    id: 'exp-1',
    category: 'Fuel',
    description: 'Fuel Card - T-001',
    amount: 1250.00,
    date: '2025-06-19T10:30:00Z',
    status: 'approved',
    driverId: 'D-001',
    loadId: 'L-2025-001'
  },
  {
    id: 'exp-2',
    category: 'Maintenance',
    description: 'Oil Change - T-003',
    amount: 350.00,
    date: '2025-06-19T08:15:00Z',
    status: 'paid'
  },
  {
    id: 'exp-3',
    category: 'Tolls',
    description: 'Highway Tolls - Route I-95',
    amount: 75.00,
    date: '2025-06-18T16:45:00Z',
    status: 'pending',
    driverId: 'D-002',
    loadId: 'L-2025-002'
  },
  {
    id: 'exp-4',
    category: 'Permits',
    description: 'Oversize Load Permit',
    amount: 125.00,
    date: '2025-06-18T14:20:00Z',
    status: 'approved',
    loadId: 'L-2025-003'
  }
];

export default function FinancialReportsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [metrics, setMetrics] = useState<FinancialMetric[]>(mockMetrics);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>(mockRevenueBreakdown);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchFinancialData();
    }, [selectedPeriod])
  );

  const fetchFinancialData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(mockMetrics);
    setRevenueBreakdown(mockRevenueBreakdown);
    setExpenses(mockExpenses);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatValue = (value: number, format: 'currency' | 'percentage' | 'number') => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color="#34C759" />;
      case 'down':
        return <TrendingDown size={16} color="#FF3B30" />;
      case 'neutral':
      default:
        return <Activity size={16} color={theme.colors.onSurfaceVariant} />;
    }
  };

  const getExpenseStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'approved':
        return '#007AFF';
      case 'paid':
        return '#34C759';
      default:
        return theme.colors.outline;
    }
  };

  const getExpenseStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#FF9500" />;
      case 'approved':
        return <CheckCircle size={16} color="#007AFF" />;
      case 'paid':
        return <CheckCircle size={16} color="#34C759" />;
      default:
        return <AlertCircle size={16} color={theme.colors.outline} />;
    }
  };

  const renderMetricCard = (metric: FinancialMetric) => {
    const changePercent = calculateChange(metric.value, metric.previousValue);
    const progressPercentage = metric.target ? (metric.value / metric.target) * 100 : 0;

    return (
      <Card key={metric.id} style={{ flex: 1, margin: 4 }}>
        <Card.Content style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
              {metric.label}
            </Text>
            {getTrendIcon(metric.trend)}
          </View>
          
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {formatValue(metric.value, metric.format)}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text 
              variant="bodySmall" 
              style={{ 
                color: changePercent >= 0 ? '#34C759' : '#FF3B30',
                fontWeight: '500'
              }}
            >
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              vs previous
            </Text>
          </View>

          {metric.target && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Target: {formatValue(metric.target, metric.format)}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {progressPercentage.toFixed(0)}%
                </Text>
              </View>
              <ProgressBar 
                progress={Math.min(progressPercentage / 100, 1)} 
                color={progressPercentage >= 100 ? '#34C759' : theme.colors.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Financial Reports',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon={() => <MoreVertical size={24} color={theme.colors.onSurface} />}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => setMenuVisible(false)} title="Export to Excel" leadingIcon={() => <Download size={20} color={theme.colors.onSurface} />} />
              <Menu.Item onPress={() => setMenuVisible(false)} title="Generate PDF Report" leadingIcon={() => <FileText size={20} color={theme.colors.onSurface} />} />
              <Menu.Item onPress={() => setMenuVisible(false)} title="Schedule Report" leadingIcon={() => <Calendar size={20} color={theme.colors.onSurface} />} />
            </Menu>
          ),
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{ padding: 16, backgroundColor: theme.colors.surface }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <DollarSign size={24} color={theme.colors.primary} />
            <Heading level={2} style={{ marginLeft: 8, flex: 1 }}>
              Financial Reports
            </Heading>
          </View>
          
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Comprehensive financial analytics and reporting dashboard
          </Text>
        </View>

        {/* Period Selection */}
        <View style={{ padding: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: '600' }}>
            Report Period
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <Chip
                key={period}
                mode={selectedPeriod === period ? 'flat' : 'outlined'}
                onPress={() => setSelectedPeriod(period as any)}
                style={selectedPeriod === period ? { backgroundColor: theme.colors.primary } : {}}
                textStyle={selectedPeriod === period ? { color: '#FFFFFF' } : {}}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Chip>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <BarChart3 size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: '600' }}>
              Key Performance Metrics
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
            {metrics.slice(0, 4).map(metric => (
              <View key={metric.id} style={{ width: '50%' }}>
                {renderMetricCard(metric)}
              </View>
            ))}
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
            {metrics.slice(4).map(metric => (
              <View key={metric.id} style={{ width: '50%' }}>
                {renderMetricCard(metric)}
              </View>
            ))}
          </View>
        </View>

        {/* Revenue Breakdown */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <PieChart size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: '600' }}>
              Revenue by Equipment Type
            </Text>
          </View>
          
          <Card>
            <Card.Content>
              {revenueBreakdown.map((item, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index === revenueBreakdown.length - 1 ? 0 : 12 }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: item.color,
                    marginRight: 12
                  }} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                        {item.category}
                      </Text>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ProgressBar 
                        progress={item.percentage / 100}
                        color={item.color}
                        style={{ flex: 1, height: 6, marginRight: 8, borderRadius: 3 }}
                      />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.percentage}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>

        {/* Recent Expenses */}
        <View style={{ padding: 16, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: '600' }}>
                Recent Expenses
              </Text>
            </View>
            <Button mode="outlined" onPress={() => router.push('/(admin)/finance/expenses')}>
              View All
            </Button>
          </View>

          {expenses.map((expense) => (
            <Card key={expense.id} style={{ marginBottom: 8 }}>
              <Card.Content style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      {getExpenseStatusIcon(expense.status)}
                      <Text variant="titleSmall" style={{ marginLeft: 8, fontWeight: '500' }}>
                        {expense.description}
                      </Text>
                    </View>
                    
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </Text>
                    
                    {(expense.loadId || expense.driverId) && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {expense.loadId && (
                          <Chip mode="outlined" textStyle={{ fontSize: 10 }} style={{ height: 24 }}>
                            {expense.loadId}
                          </Chip>
                        )}
                        {expense.driverId && (
                          <Chip mode="outlined" textStyle={{ fontSize: 10 }} style={{ height: 24 }}>
                            {expense.driverId}
                          </Chip>
                        )}
                      </View>
                    )}
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {formatCurrency(expense.amount)}
                    </Text>
                    <Chip 
                      mode="outlined"
                      textStyle={{ 
                        color: getExpenseStatusColor(expense.status),
                        fontSize: 10
                      }}
                      style={{ height: 24 }}
                    >
                      {expense.status.toUpperCase()}
                    </Chip>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Export FAB */}
      <FAB
        icon={() => <Download size={24} color="#FFFFFF" />}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => {
          // Handle export functionality
          alert('Financial report export functionality would be implemented here');
        }}
      />
    </ScreenWrapper>
  );
}
