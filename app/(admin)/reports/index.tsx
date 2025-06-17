// waygo-freight/app/(admin)/reports/index.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Dimensions, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, SegmentedButtons, ProgressBar } from 'react-native-paper';
import { BarChart, TrendingUp, TrendingDown, DollarSign, Truck, Package, User, Calendar, Download, RefreshCw } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

const { width } = Dimensions.get('window');

// Mock analytics data
const mockAnalytics = {
  revenue: {
    current: 245750,
    previous: 198320,
    growth: 23.9
  },
  shipments: {
    current: 1247,
    previous: 1103,
    growth: 13.1
  },
  drivers: {
    active: 68,
    total: 75,
    utilization: 90.7
  },
  fleet: {
    active: 45,
    maintenance: 3,
    available: 42,
    utilization: 93.3
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 198320, shipments: 1103 },
    { month: 'Feb', revenue: 215480, shipments: 1156 },
    { month: 'Mar', revenue: 232150, shipments: 1201 },
    { month: 'Apr', revenue: 228900, shipments: 1189 },
    { month: 'May', revenue: 241670, shipments: 1224 },
    { month: 'Jun', revenue: 245750, shipments: 1247 }
  ],
  topRoutes: [
    { route: 'Dallas → Houston', shipments: 156, revenue: 34200 },
    { route: 'Houston → Austin', shipments: 134, revenue: 28750 },
    { route: 'Austin → San Antonio', shipments: 128, revenue: 26100 },
    { route: 'Dallas → Austin', shipments: 112, revenue: 24800 },
    { route: 'Houston → Dallas', shipments: 98, revenue: 21500 }
  ],
  driverPerformance: [
    { name: 'John Smith', shipments: 45, onTime: 97.8, rating: 4.9 },
    { name: 'Sarah Johnson', shipments: 42, onTime: 95.2, rating: 4.8 },
    { name: 'Mike Chen', shipments: 38, onTime: 91.3, rating: 4.7 },
    { name: 'Lisa Brown', shipments: 35, onTime: 94.3, rating: 4.6 },
    { name: 'David Wilson', shipments: 33, onTime: 89.7, rating: 4.5 }
  ]
};

function AdminReportsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [fetchAnalytics])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const renderKPICard = (title: string, value: string, subtitle: string, growth?: number, icon?: React.ReactNode) => (
    <Card style={{ 
      flex: 1, 
      margin: 4, 
      backgroundColor: theme.colors.surface,
      minHeight: 120
    }}>
      <Card.Content style={{ padding: 16, alignItems: 'center' }}>
        {icon && <View style={{ marginBottom: 8 }}>{icon}</View>}
        <Text variant="headlineSmall" style={{ fontWeight: '600', textAlign: 'center' }}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }}>
          {subtitle}
        </Text>
        {growth !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            {growth >= 0 ? (
              <TrendingUp size={14} color="#34C759" />
            ) : (
              <TrendingDown size={14} color={theme.colors.error} />
            )}
            <Text 
              variant="bodySmall" 
              style={{ 
                color: growth >= 0 ? '#34C759' : theme.colors.error,
                marginLeft: 4,
                fontWeight: '600'
              }}
            >
              {formatPercentage(growth)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderOverviewCards = () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
      {renderKPICard(
        'Revenue',
        formatCurrency(mockAnalytics.revenue.current),
        'This month',
        mockAnalytics.revenue.growth,
        <DollarSign size={24} color={theme.colors.primary} />
      )}
      {renderKPICard(
        'Shipments',
        mockAnalytics.shipments.current.toLocaleString(),
        'Completed',
        mockAnalytics.shipments.growth,
        <Package size={24} color="#34C759" />
      )}
      {renderKPICard(
        'Active Drivers',
        `${mockAnalytics.drivers.active}/${mockAnalytics.drivers.total}`,
        `${mockAnalytics.drivers.utilization}% utilization`,
        undefined,
        <User size={24} color="#FF9500" />
      )}
      {renderKPICard(
        'Fleet Status',
        `${mockAnalytics.fleet.active + mockAnalytics.fleet.maintenance + mockAnalytics.fleet.available}`,
        `${mockAnalytics.fleet.utilization}% active`,
        undefined,
        <Truck size={24} color={theme.colors.primary} />
      )}
    </View>
  );

  const renderRevenueChart = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Heading variant="h3">Revenue Trend</Heading>
          <Button 
            mode="outlined" 
            compact
            onPress={() => {/* Export chart */}}
            icon={() => <Download size={16} color={theme.colors.primary} />}
          >
            Export
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 200, paddingBottom: 20 }}>
            {mockAnalytics.monthlyRevenue.map((data, index) => {
              const maxRevenue = Math.max(...mockAnalytics.monthlyRevenue.map(d => d.revenue));
              const height = (data.revenue / maxRevenue) * 160;
              
              return (
                <View key={data.month} style={{ alignItems: 'center', marginHorizontal: 8 }}>
                  <Text variant="bodySmall" style={{ marginBottom: 8, fontWeight: '600' }}>
                    {formatCurrency(data.revenue / 1000)}K
                  </Text>
                  <View 
                    style={{
                      width: 40,
                      height: height,
                      backgroundColor: theme.colors.primary,
                      borderRadius: 4,
                      marginBottom: 8
                    }}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {data.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderTopRoutes = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <Heading variant="h3" style={{ marginBottom: 16 }}>Top Routes</Heading>
        
        {mockAnalytics.topRoutes.map((route, index) => (
          <View 
            key={route.route}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: index < mockAnalytics.topRoutes.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.outline
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                {route.route}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                {route.shipments} shipments
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
              {formatCurrency(route.revenue)}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderDriverPerformance = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <Heading variant="h3" style={{ marginBottom: 16 }}>Driver Performance</Heading>
        
        {mockAnalytics.driverPerformance.map((driver, index) => (
          <View 
            key={driver.name}
            style={{ 
              paddingVertical: 12,
              borderBottomWidth: index < mockAnalytics.driverPerformance.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.outline
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                {driver.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
                  ⭐ {driver.rating}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {driver.shipments} trips
                </Text>
              </View>
            </View>
            
            <View style={{ marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  On-time delivery
                </Text>
                <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                  {driver.onTime}%
                </Text>
              </View>
              <ProgressBar 
                progress={driver.onTime / 100} 
                color={driver.onTime > 95 ? '#34C759' : driver.onTime > 90 ? '#FF9500' : theme.colors.error}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Reports' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Heading variant="h1">Reports</Heading>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Analytics and performance insights
            </Text>
          </View>
          <Button 
            mode="outlined" 
            onPress={handleRefresh}
            loading={refreshing}
            icon={() => <RefreshCw size={20} color={theme.colors.primary} />}
            compact
          >
            Refresh
          </Button>
        </View>

        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'quarter', label: 'Quarter' },
            { value: 'year', label: 'Year' }
          ]}
          style={{ marginBottom: 12 }}
        />

        <SegmentedButtons
          value={reportType}
          onValueChange={setReportType}
          buttons={[
            { value: 'overview', label: 'Overview' },
            { value: 'financial', label: 'Financial' },
            { value: 'operations', label: 'Operations' }
          ]}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderOverviewCards()}
        {renderRevenueChart()}
        {renderTopRoutes()}
        {renderDriverPerformance()}
        
        <View style={{ padding: 16 }}>
          <Button 
            mode="contained" 
            onPress={() => router.push('/admin/reports/detailed')}
            style={{ marginBottom: 8 }}
          >
            View Detailed Reports
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/admin/reports/export')}
          >
            Export All Data
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default AdminReportsScreen;
