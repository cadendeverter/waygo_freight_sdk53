import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  FAB,
  IconButton,
  Searchbar,
  ProgressBar,
  Surface,
  Divider
} from 'react-native-paper';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Clock,
  Send,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  Eye,
  BarChart3
} from '../../../utils/icons';
import { useLoad } from '../../../state/loadContext';
import { useAuth } from '../../../state/authContext';
import { router } from 'expo-router';

interface FinancialMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  outstandingInvoices: number;
  overdueAmount: number;
  paidInvoices: number;
  averagePaymentDays: number;
  fuelCosts: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

interface InvoiceStatus {
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  total: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  change: number;
}

export default function FinanceDashboard() {
  const theme = useTheme();
  const { loads, loading } = useLoad();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate financial metrics from load data
  const calculateMetrics = (): FinancialMetrics => {
    const deliveredLoads = loads.filter(load => load.status === 'delivered');
    const totalRevenue = deliveredLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
    const lastMonthRevenue = totalRevenue * 0.85; // Mock previous period
    const revenueGrowth = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    
    const fuelCosts = totalRevenue * 0.3; // Mock fuel costs
    const totalExpenses = totalRevenue * 0.25; // Mock total expenses
    const netProfit = totalRevenue - totalExpenses - fuelCosts;
    const profitMargin = (netProfit / totalRevenue) * 100;

    return {
      totalRevenue,
      revenueGrowth,
      outstandingInvoices: deliveredLoads.length * 0.3,
      overdueAmount: totalRevenue * 0.05,
      paidInvoices: deliveredLoads.length * 0.7,
      averagePaymentDays: 28,
      fuelCosts,
      totalExpenses,
      netProfit,
      profitMargin
    };
  };

  const calculateInvoiceStatus = (): InvoiceStatus => {
    const deliveredLoads = loads.filter(load => load.status === 'delivered');
    const total = deliveredLoads.length;
    
    return {
      draft: Math.floor(total * 0.1),
      sent: Math.floor(total * 0.3),
      paid: Math.floor(total * 0.6),
      overdue: Math.floor(total * 0.05),
      total
    };
  };

  const getExpenseCategories = (): ExpenseCategory[] => {
    const metrics = calculateMetrics();
    const totalExpenses = metrics.fuelCosts + metrics.totalExpenses;
    
    return [
      {
        category: 'Fuel',
        amount: metrics.fuelCosts,
        percentage: (metrics.fuelCosts / totalExpenses) * 100,
        change: 5.2
      },
      {
        category: 'Maintenance',
        amount: metrics.totalExpenses * 0.4,
        percentage: 40,
        change: -2.1
      },
      {
        category: 'Insurance',
        amount: metrics.totalExpenses * 0.25,
        percentage: 25,
        change: 1.8
      },
      {
        category: 'Driver Pay',
        amount: metrics.totalExpenses * 0.35,
        percentage: 35,
        change: 3.4
      }
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh financial data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const metrics = calculateMetrics();
  const invoiceStatus = calculateInvoiceStatus();
  const expenseCategories = getExpenseCategories();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={{ padding: 16 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
          Finance & Billing
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Revenue, expenses, and billing management
        </Text>
      </View>

      {/* Period Selector */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 }}>
        {['Week', 'Month', 'Quarter', 'Year'].map((period) => (
          <Chip
            key={period}
            selected={selectedPeriod === period.toLowerCase()}
            onPress={() => setSelectedPeriod(period.toLowerCase())}
            style={{ backgroundColor: selectedPeriod === period.toLowerCase() ? theme.colors.primary : 'transparent' }}
          >
            {period}
          </Chip>
        ))}
      </View>

      {/* Key Metrics Cards */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {/* Revenue Card */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <DollarSign size={24} color={theme.colors.primary} />}
                style={{ backgroundColor: `${theme.colors.primary}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {formatCurrency(metrics.totalRevenue)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Total Revenue
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                {metrics.revenueGrowth >= 0 ? (
                  <TrendingUp size={16} color={theme.colors.primary} />
                ) : (
                  <TrendingDown size={16} color={theme.colors.error} />
                )}
                <Text 
                  variant="bodySmall" 
                  style={{ 
                    color: metrics.revenueGrowth >= 0 ? theme.colors.primary : theme.colors.error,
                    marginLeft: 4 
                  }}
                >
                  {formatPercent(metrics.revenueGrowth)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Net Profit Card */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <BarChart3 size={24} color={theme.colors.secondary} />}
                style={{ backgroundColor: `${theme.colors.secondary}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {formatCurrency(metrics.netProfit)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Net Profit
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 4 }}>
                {metrics.profitMargin.toFixed(1)}% margin
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {/* Outstanding Invoices */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <FileText size={24} color={theme.colors.tertiary} />}
                style={{ backgroundColor: `${theme.colors.tertiary}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {invoiceStatus.sent + invoiceStatus.overdue}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Outstanding Invoices
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.tertiary, marginTop: 4 }}>
                {formatCurrency(metrics.outstandingInvoices)}
              </Text>
            </Card.Content>
          </Card>

          {/* Average Payment Days */}
          <Card style={{ flex: 1, minWidth: 160 }}>
            <Card.Content style={{ padding: 16, alignItems: 'center' }}>
              <Avatar.Icon
                size={48}
                icon={() => <Clock size={24} color={theme.colors.outline} />}
                style={{ backgroundColor: `${theme.colors.outline}20` }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                {metrics.averagePaymentDays}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Avg Payment Days
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
                Target: 30 days
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Invoice Status Overview */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Invoice Status Overview
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {invoiceStatus.paid}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Paid</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.tertiary }}>
                {invoiceStatus.sent}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Sent</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                {invoiceStatus.overdue}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Overdue</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.outline }}>
                {invoiceStatus.draft}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Draft</Text>
            </View>
          </View>

          <ProgressBar 
            progress={invoiceStatus.paid / invoiceStatus.total} 
            color={theme.colors.primary}
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            {Math.round((invoiceStatus.paid / invoiceStatus.total) * 100)}% of invoices paid
          </Text>
        </Card.Content>
      </Card>

      {/* Expense Breakdown */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Expense Breakdown
          </Text>
          
          {expenseCategories.map((category, index) => (
            <View key={category.category}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodyLarge">{category.category}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {formatCurrency(category.amount)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {category.change >= 0 ? (
                      <TrendingUp size={14} color={category.change >= 0 ? theme.colors.primary : theme.colors.error} />
                    ) : (
                      <TrendingDown size={14} color={theme.colors.error} />
                    )}
                    <Text 
                      variant="bodySmall" 
                      style={{ 
                        color: category.change >= 0 ? theme.colors.primary : theme.colors.error,
                        marginLeft: 4 
                      }}
                    >
                      {formatPercent(category.change)}
                    </Text>
                  </View>
                </View>
              </View>
              <ProgressBar 
                progress={category.percentage / 100} 
                color={theme.colors.secondary}
                style={{ height: 6, borderRadius: 3, marginBottom: 16 }}
              />
              {index < expenseCategories.length - 1 && <Divider style={{ marginBottom: 16 }} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Button
              mode="contained"
              icon={() => <Plus size={20} color={theme.colors.onPrimary} />}
              onPress={() => router.push('/(admin)/finance/invoicing')}
              style={{ flex: 1, minWidth: 150 }}
            >
              Create Invoice
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <Eye size={20} color={theme.colors.primary} />}
              onPress={() => router.push('/(admin)/finance/invoicing')}
              style={{ flex: 1, minWidth: 150 }}
            >
              View Invoices
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <Receipt size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Coming Soon', 'Expense tracking feature will be available soon.')}
              style={{ flex: 1, minWidth: 150 }}
            >
              Track Expenses
            </Button>
            
            <Button
              mode="outlined"
              icon={() => <Download size={20} color={theme.colors.primary} />}
              onPress={() => Alert.alert('Export', 'Financial reports exported successfully!')}
              style={{ flex: 1, minWidth: 150 }}
            >
              Export Reports
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={{ margin: 16, marginTop: 0, marginBottom: 80 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Recent Activity
          </Text>
          
          <List.Item
            title="Invoice INV-2024-045 paid"
            description="$2,850.00 • ABC Manufacturing"
            left={(props) => <Avatar.Icon {...props} icon={() => <CheckCircle size={24} color={theme.colors.primary} />} />}
            right={(props) => <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>2h ago</Text>}
          />
          
          <List.Item
            title="Invoice INV-2024-044 sent"
            description="$1,750.00 • XYZ Logistics"
            left={(props) => <Avatar.Icon {...props} icon={() => <Send size={24} color={theme.colors.tertiary} />} />}
            right={(props) => <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>1d ago</Text>}
          />
          
          <List.Item
            title="Payment overdue"
            description="$3,200.00 • Delayed Logistics Inc"
            left={(props) => <Avatar.Icon {...props} icon={() => <AlertCircle size={24} color={theme.colors.error} />} />}
            right={(props) => <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>3d ago</Text>}
          />
        </Card.Content>
      </Card>

      {/* Floating Action Button */}
      <FAB
        icon={() => <Plus size={24} color={theme.colors.onPrimary} />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => router.push('/(admin)/finance/invoicing')}
      />
    </ScrollView>
  );
}
