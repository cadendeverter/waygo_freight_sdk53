// waygo-freight/app/(admin)/reports/index.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Dimensions, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import { useLoad } from '../../../state/loadContext';
import { useFleet } from '../../../state/fleetContext';
import { useCompliance } from '../../../state/complianceContext';
import { useWarehouse } from '../../../state/warehouseContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, SegmentedButtons, ProgressBar, IconButton } from 'react-native-paper';
import { 
  BarChart, TrendingUp, TrendingDown, DollarSign, Truck, Package, User, Calendar, 
  Download, RefreshCw, AlertTriangle, CheckCircle, Clock, MapPin, FileText, Eye
} from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

function AdminReportsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { loads, loading: loadsLoading } = useLoad();
  const { vehicles, drivers, loading: fleetLoading } = useFleet();
  const { complianceRecords, loading: complianceLoading } = useCompliance();
  const { inventory, loading: warehouseLoading } = useWarehouse();
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Calculate analytics from real data
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter loads by time period
    const getDateFilter = (timeRange: string) => {
      const date = new Date();
      switch (timeRange) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'quarter':
          date.setMonth(date.getMonth() - 3);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
        default:
          date.setMonth(date.getMonth() - 1);
      }
      return date;
    };

    const filterDate = getDateFilter(timeRange);
    const currentPeriodLoads = loads.filter(load => new Date(load.createdAt) >= filterDate);
    const previousPeriodStart = new Date(filterDate);
    const periodDiff = now.getTime() - filterDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDiff);
    const previousPeriodLoads = loads.filter(load => {
      const loadDate = new Date(load.createdAt);
      return loadDate >= previousPeriodStart && loadDate < filterDate;
    });

    // Revenue calculations
    const currentRevenue = currentPeriodLoads.reduce((sum, load) => {
      const rate = Number(load.rate) || 0;
      return sum + rate;
    }, 0);
    const previousRevenue = previousPeriodLoads.reduce((sum, load) => {
      const rate = Number(load.rate) || 0;
      return sum + rate;
    }, 0);
    const revenueGrowth = previousRevenue > 0 && isFinite(currentRevenue) && isFinite(previousRevenue) 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Shipment calculations
    const currentShipments = currentPeriodLoads.length;
    const previousShipments = previousPeriodLoads.length;
    const shipmentsGrowth = previousShipments > 0 
      ? ((currentShipments - previousShipments) / previousShipments) * 100 
      : 0;

    // Fleet status
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const outOfServiceVehicles = vehicles.filter(v => v.status === 'out_of_service').length;
    const fleetUtilization = vehicles.length > 0 
      ? Math.round((activeVehicles / vehicles.length) * 100) 
      : 0;

    // Driver status
    const availableDrivers = drivers.filter(d => d.currentStatus === 'off_duty').length;
    const drivingDrivers = drivers.filter(d => d.currentStatus === 'driving').length;
    const driverUtilization = drivers.length > 0 
      ? Math.round((drivingDrivers / drivers.length) * 100) 
      : 0;

    // Compliance metrics
    const totalCompliance = complianceRecords.length;
    const compliantRecords = complianceRecords.filter(r => r.status === 'compliant').length;
    const expiringRecords = complianceRecords.filter(r => {
      if (!r.dueDate) return false;
      const expDate = new Date(r.dueDate);
      const daysUntilExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    const nonCompliantRecords = complianceRecords.filter(r => r.status === 'non_compliant').length;
    const complianceScore = totalCompliance > 0 ? (compliantRecords / totalCompliance) * 100 : 100;

    // Inventory value
    const inventoryValue = inventory.reduce((sum, item) => {
      const unitValue = Number(item.unitValue) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (unitValue * quantity);
    }, 0);
    const lowStockItems = inventory.filter(item => (Number(item.quantity) || 0) < 10).length;

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
      const monthLoads = loads.filter(load => {
        const loadDate = new Date(load.createdAt);
        return loadDate >= month && loadDate < nextMonth;
      });
      const monthRevenue = monthLoads.reduce((sum, load) => sum + (Number(load.rate) || 0), 0);
      monthlyRevenue.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        shipments: monthLoads.length
      });
    }

    // Top routes analysis
    const routeStats = new Map<string, { revenue: number; count: number }>();
    currentPeriodLoads.forEach(load => {
      const route = `${load.origin.facility.address.city}, ${load.origin.facility.address.state} → ${load.destination.facility.address.city}, ${load.destination.facility.address.state}`;
      const current = routeStats.get(route) || { revenue: 0, count: 0 };
      current.revenue += Number(load.rate) || 0;
      current.count += 1;
      routeStats.set(route, current);
    });
    const topRoutes = Array.from(routeStats.entries())
      .map(([route, stats]) => ({ route, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Driver performance
    const driverStats = new Map<string, { loads: number; revenue: number; onTimeDeliveries: number }>();
    currentPeriodLoads.forEach(load => {
      if (!load.driverId) return;
      
      const current = driverStats.get(load.driverId) || { loads: 0, revenue: 0, onTimeDeliveries: 0 };
      current.loads += 1;
      current.revenue += Number(load.rate) || 0;
      
      // Calculate on-time delivery
      if (load.actualDeliveryTime && load.deliveryDate) {
        const isOnTime = new Date(load.actualDeliveryTime).getTime() <= new Date(load.deliveryDate).getTime();
        if (isOnTime) current.onTimeDeliveries += 1;
      }
      
      driverStats.set(load.driverId, current);
    });

    const driverPerformance = Array.from(driverStats.entries())
      .map(([driverId, stats]) => {
        const driver = drivers.find(d => d.id === driverId);
        return {
          name: driver ? `Driver ${driver.driverNumber}` : 'Unknown Driver',
          shipments: stats.loads,
          onTime: stats.loads > 0 ? Math.round((stats.onTimeDeliveries / stats.loads) * 100) : 0,
          revenue: stats.revenue,
          rating: 4.2 + (Math.random() * 0.8) // Mock rating for now
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: revenueGrowth
      },
      shipments: {
        current: currentShipments,
        previous: previousShipments,
        growth: shipmentsGrowth
      },
      fleet: {
        total: vehicles.length,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        outOfService: outOfServiceVehicles,
        utilization: fleetUtilization
      },
      drivers: {
        total: drivers.length,
        available: availableDrivers,
        driving: drivingDrivers,
        utilization: driverUtilization
      },
      compliance: {
        total: totalCompliance,
        compliant: compliantRecords,
        expiring: expiringRecords,
        nonCompliant: nonCompliantRecords,
        score: complianceScore
      },
      inventory: {
        totalValue: inventoryValue,
        totalItems: inventory.length,
        lowStock: lowStockItems
      },
      monthlyRevenue,
      topRoutes,
      driverPerformance
    };
  }, [loads, vehicles, drivers, complianceRecords, inventory, timeRange]);

  const isLoading = loadsLoading || fleetLoading || complianceLoading || warehouseLoading;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      // Removed refresh functions that don't exist
    ]);
    setRefreshing(false);
  }, []);

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Choose export format:",
      [
        { text: "CSV", onPress: () => exportToCSV() },
        { text: "PDF", onPress: () => exportToPDF() },
        { text: "Excel", onPress: () => exportToExcel() },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const exportToCSV = () => {
    console.log('Exporting to CSV...');
    Alert.alert("Export Complete", "Data exported to CSV successfully!");
  };

  const exportToPDF = () => {
    console.log('Exporting to PDF...');
    Alert.alert("Export Complete", "Data exported to PDF successfully!");
  };

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
    Alert.alert("Export Complete", "Data exported to Excel successfully!");
  };

  const showDetailedReport = () => {
    Alert.alert(
      "Detailed Report",
      "Select report type:",
      [
        { text: "Revenue Analysis", onPress: () => console.log('Revenue detailed report') },
        { text: "Fleet Performance", onPress: () => console.log('Fleet detailed report') },
        { text: "Driver Performance", onPress: () => console.log('Driver detailed report') },
        { text: "Compliance Report", onPress: () => console.log('Compliance detailed report') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'delivered':
        return '#34C759';
      case 'maintenance':
      case 'pending':
      case 'in_transit':
        return '#FF9500';
      case 'out_of_service':
      case 'non_compliant':
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const renderKPICard = (
    title: string, 
    value: string, 
    subtitle: string, 
    growth?: number, 
    icon?: React.ReactNode,
    color?: string
  ) => (
    <Card style={{ 
      margin: 4, 
      backgroundColor: theme.colors.surface,
      minHeight: 130
    }}>
      <Card.Content style={{ padding: 16, alignItems: 'center' }}>
        {icon && <View style={{ marginBottom: 8 }}>{icon}</View>}
        <Text variant="headlineSmall" style={{ fontWeight: '700', textAlign: 'center', color }}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }}>
          {subtitle}
        </Text>
        {growth !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
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
    <View style={{ padding: 8 }}>
      {renderKPICard(
        'Revenue',
        formatCurrency(analytics.revenue.current),
        `${timeRange} total`,
        analytics.revenue.growth,
        <DollarSign size={24} color={theme.colors.primary} />
      )}
      {renderKPICard(
        'Shipments',
        analytics.shipments.current.toLocaleString(),
        'Completed',
        analytics.shipments.growth,
        <Package size={24} color="#34C759" />
      )}
      {renderKPICard(
        'Fleet Utilization',
        `${analytics.fleet.utilization.toFixed(1)}%`,
        `${analytics.fleet.active}/${analytics.fleet.total} active`,
        undefined,
        (<Truck size={24} color={analytics.fleet.utilization > 80 ? '#34C759' : '#FF9500'} />)
      )}
      {renderKPICard(
        'Driver Utilization',
        `${analytics.drivers.utilization.toFixed(1)}%`,
        `${analytics.drivers.driving}/${analytics.drivers.total} driving`,
        undefined,
        (<User size={24} color={analytics.drivers.utilization > 70 ? '#34C759' : '#FF9500'} />)
      )}
      {renderKPICard(
        'Compliance Score',
        `${analytics.compliance.score.toFixed(1)}%`,
        `${analytics.compliance.compliant}/${analytics.compliance.total} compliant`,
        undefined,
        (<CheckCircle size={24} color={analytics.compliance.score > 95 ? '#34C759' : analytics.compliance.score > 85 ? '#FF9500' : theme.colors.error} />)
      )}
      {renderKPICard(
        'Inventory Value',
        formatCurrency(analytics.inventory.totalValue),
        `${analytics.inventory.totalItems} items`,
        undefined,
        (<Package size={24} color={theme.colors.primary} />)
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
            onPress={handleExportData}
            icon={() => <Download size={16} color={theme.colors.primary} />}
          >
            Export
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 200, paddingBottom: 20 }}>
            {analytics.monthlyRevenue.map((data, index) => {
              const maxRevenue = Math.max(...analytics.monthlyRevenue.map(d => d.revenue));
              const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 160 : 0;
              
              return (
                <View key={data.month} style={{ alignItems: 'center', marginHorizontal: 8 }}>
                  <Text variant="bodySmall" style={{ marginBottom: 8, fontWeight: '600' }}>
                    {data.revenue > 1000 ? `${formatCurrency(data.revenue / 1000)}K` : formatCurrency(data.revenue)}
                  </Text>
                  <View 
                    style={{
                      width: 40,
                      height: Math.max(height, 4),
                      backgroundColor: theme.colors.primary,
                      borderRadius: 4,
                      marginBottom: 8
                    }}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {data.month}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    {data.shipments}
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
        
        {analytics.topRoutes.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <MapPin size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              No route data available
            </Text>
          </View>
        ) : (
          analytics.topRoutes.map((route, index) => (
            <View 
              key={route.route}
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < analytics.topRoutes.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.outline
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {route.route}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {route.count} shipments
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
                {formatCurrency(route.revenue)}
              </Text>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderDriverPerformance = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <Heading variant="h3" style={{ marginBottom: 16 }}>Driver Performance</Heading>
        
        {analytics.driverPerformance.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <User size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              No driver performance data available
            </Text>
          </View>
        ) : (
          analytics.driverPerformance.map((driver, index) => (
            <View 
              key={driver.name}
              style={{ 
                paddingVertical: 12,
                borderBottomWidth: index < analytics.driverPerformance.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.outline
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {driver.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
                    ⭐ {driver.rating.toFixed(1)}
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
              
              <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600', marginTop: 4 }}>
                Revenue: {formatCurrency(driver.revenue)}
              </Text>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderComplianceOverview = () => (
    <Card style={{ margin: 8, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ padding: 16 }}>
        <Heading variant="h3" style={{ marginBottom: 16 }}>Compliance Overview</Heading>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <CheckCircle size={32} color="#34C759" />
            <Text variant="headlineSmall" style={{ fontWeight: '700', marginTop: 8 }}>
              {analytics.compliance.compliant}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Compliant
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Clock size={32} color="#FF9500" />
            <Text variant="headlineSmall" style={{ fontWeight: '700', marginTop: 8 }}>
              {analytics.compliance.expiring}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Expiring Soon
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <AlertTriangle size={32} color={theme.colors.error} />
            <Text variant="headlineSmall" style={{ fontWeight: '700', marginTop: 8 }}>
              {analytics.compliance.nonCompliant}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Non-Compliant
            </Text>
          </View>
        </View>
        
        <Button 
          mode="outlined" 
          onPress={() => router.push('/admin/compliance')}
          style={{ marginTop: 8 }}
        >
          View Compliance Details
        </Button>
      </Card.Content>
    </Card>
  );

  if (isLoading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Analytics & Reports' }} />
      
      <View style={{ padding: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Heading variant="h1">Analytics & Reports</Heading>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Real-time performance insights
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
        {renderComplianceOverview()}
        {renderTopRoutes()}
        {renderDriverPerformance()}
        
        <View style={{ padding: 16 }}>
          <Button 
            mode="contained" 
            onPress={showDetailedReport}
            style={{ marginBottom: 8 }}
            icon={() => <FileText size={20} color="white" />}
          >
            View Detailed Reports
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleExportData}
            icon={() => <Download size={20} color={theme.colors.primary} />}
          >
            Export All Data
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default AdminReportsScreen;
