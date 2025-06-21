import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, Chip, useTheme, ProgressBar } from 'react-native-paper';
import { useFleet } from '../../../state/fleetContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  Gauge, 
  Clock, 
  DollarSign,
  Award,
  AlertTriangle,
  Truck,
  Download,
  Calendar,
  BarChart
} from '../../../utils/icons';

interface FleetMetrics {
  utilization: {
    total: number;
    active: number;
    maintenance: number;
    percentage: number;
    trend: number;
  };
  fuelEfficiency: {
    averageMPG: number;
    totalGallons: number;
    costPerMile: number;
    trend: number;
  };
  safety: {
    safetyScore: number;
    accidents: number;
    violations: number;
    trend: number;
  };
  maintenance: {
    totalCost: number;
    avgCostPerVehicle: number;
    overdueItems: number;
    trend: number;
  };
  productivity: {
    avgMilesPerDay: number;
    revenuePerMile: number;
    deadheadPercentage: number;
    trend: number;
  };
}

interface PerformanceData {
  period: string;
  utilization: number;
  fuelEfficiency: number;
  safetyScore: number;
  revenue: number;
}

const mockMetrics: FleetMetrics = {
  utilization: {
    total: 45,
    active: 38,
    maintenance: 7,
    percentage: 84.4,
    trend: 5.2
  },
  fuelEfficiency: {
    averageMPG: 7.2,
    totalGallons: 15420,
    costPerMile: 0.52,
    trend: -2.1
  },
  safety: {
    safetyScore: 87,
    accidents: 2,
    violations: 8,
    trend: 3.5
  },
  maintenance: {
    totalCost: 125000,
    avgCostPerVehicle: 2778,
    overdueItems: 12,
    trend: -8.3
  },
  productivity: {
    avgMilesPerDay: 485,
    revenuePerMile: 2.15,
    deadheadPercentage: 12.5,
    trend: 7.8
  }
};

const mockPerformanceData: PerformanceData[] = [
  { period: 'Jan', utilization: 82, fuelEfficiency: 7.1, safetyScore: 85, revenue: 245000 },
  { period: 'Feb', utilization: 85, fuelEfficiency: 7.3, safetyScore: 86, revenue: 267000 },
  { period: 'Mar', utilization: 83, fuelEfficiency: 7.0, safetyScore: 84, revenue: 251000 },
  { period: 'Apr', utilization: 87, fuelEfficiency: 7.4, safetyScore: 88, revenue: 289000 },
  { period: 'May', utilization: 84, fuelEfficiency: 7.2, safetyScore: 87, revenue: 275000 },
  { period: 'Jun', utilization: 84, fuelEfficiency: 7.2, safetyScore: 87, revenue: 278000 }
];

export default function FleetAnalyticsScreen() {
  const theme = useTheme();
  const { vehicles, loading } = useFleet();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [metrics, setMetrics] = useState<FleetMetrics>(mockMetrics);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>(mockPerformanceData);

  const screenWidth = Dimensions.get('window').width;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp size={16} color="#4CAF50" />;
    if (trend < 0) return <TrendingDown size={16} color="#F44336" />;
    return <BarChart size={16} color={theme.colors.outline} />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "#4CAF50";
    if (trend < 0) return "#F44336";
    return theme.colors.outline;
  };

  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  const exportReport = () => {
    // In real app, this would generate and download a PDF report
    alert('Fleet analytics report exported successfully!');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fleet analytics...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Fleet Analytics</Text>
          <Button 
            mode="outlined" 
            onPress={exportReport}
            icon="download"
            compact
          >
            Export
          </Button>
        </View>

        {/* Period Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'quarter', label: 'This Quarter' },
              { key: 'year', label: 'This Year' }
            ].map(period => (
              <Chip
                key={period.key}
                selected={selectedPeriod === period.key}
                onPress={() => setSelectedPeriod(period.key)}
                style={{ marginRight: 8 }}
              >
                {period.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Key Metrics Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {/* Fleet Utilization */}
          <Card style={{ width: (screenWidth - 44) / 2, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Truck size={24} color={theme.colors.primary} />
              <Text variant="titleMedium">Utilization</Text>
            </View>
            <Text variant="headlineLarge" style={{ marginBottom: 4 }}>
              {metrics.utilization.percentage.toFixed(1)}%
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {getTrendIcon(metrics.utilization.trend)}
              <Text variant="bodySmall" style={{ color: getTrendColor(metrics.utilization.trend) }}>
                {formatTrend(metrics.utilization.trend)} vs last period
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              {metrics.utilization.active} of {metrics.utilization.total} active
            </Text>
          </Card>

          {/* Fuel Efficiency */}
          <Card style={{ width: (screenWidth - 44) / 2, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Fuel size={24} color="#FF9800" />
              <Text variant="titleMedium">Fuel MPG</Text>
            </View>
            <Text variant="headlineLarge" style={{ marginBottom: 4 }}>
              {metrics.fuelEfficiency.averageMPG}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {getTrendIcon(metrics.fuelEfficiency.trend)}
              <Text variant="bodySmall" style={{ color: getTrendColor(metrics.fuelEfficiency.trend) }}>
                {formatTrend(metrics.fuelEfficiency.trend)} vs last period
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              ${metrics.fuelEfficiency.costPerMile}/mile
            </Text>
          </Card>

          {/* Safety Score */}
          <Card style={{ width: (screenWidth - 44) / 2, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Award size={24} color="#4CAF50" />
              <Text variant="titleMedium">Safety</Text>
            </View>
            <Text variant="headlineLarge" style={{ marginBottom: 4 }}>
              {metrics.safety.safetyScore}/100
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {getTrendIcon(metrics.safety.trend)}
              <Text variant="bodySmall" style={{ color: getTrendColor(metrics.safety.trend) }}>
                {formatTrend(metrics.safety.trend)} vs last period
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              {metrics.safety.accidents} accidents, {metrics.safety.violations} violations
            </Text>
          </Card>

          {/* Maintenance Cost */}
          <Card style={{ width: (screenWidth - 44) / 2, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <DollarSign size={24} color="#9C27B0" />
              <Text variant="titleMedium">Maintenance</Text>
            </View>
            <Text variant="headlineLarge" style={{ marginBottom: 4 }}>
              ${(metrics.maintenance.totalCost / 1000).toFixed(0)}K
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {getTrendIcon(metrics.maintenance.trend)}
              <Text variant="bodySmall" style={{ color: getTrendColor(metrics.maintenance.trend) }}>
                {formatTrend(metrics.maintenance.trend)} vs last period
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              ${metrics.maintenance.avgCostPerVehicle}/vehicle avg
            </Text>
          </Card>
        </View>

        {/* Performance Trends */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ padding: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>Performance Trends</Text>
            
            {/* Utilization Trend */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="titleMedium">Fleet Utilization</Text>
                <Text variant="bodyLarge">{metrics.utilization.percentage.toFixed(1)}%</Text>
              </View>
              <ProgressBar 
                progress={metrics.utilization.percentage / 100} 
                color={theme.colors.primary}
                style={{ height: 8 }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                {performanceData.slice(-6).map((data, index) => (
                  <Text key={index} variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {data.period}
                  </Text>
                ))}
              </View>
            </View>

            {/* Fuel Efficiency Trend */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="titleMedium">Fuel Efficiency</Text>
                <Text variant="bodyLarge">{metrics.fuelEfficiency.averageMPG} MPG</Text>
              </View>
              <ProgressBar 
                progress={metrics.fuelEfficiency.averageMPG / 10} 
                color="#FF9800"
                style={{ height: 8 }}
              />
            </View>

            {/* Safety Score Trend */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="titleMedium">Safety Score</Text>
                <Text variant="bodyLarge">{metrics.safety.safetyScore}/100</Text>
              </View>
              <ProgressBar 
                progress={metrics.safety.safetyScore / 100} 
                color="#4CAF50"
                style={{ height: 8 }}
              />
            </View>
          </View>
        </Card>

        {/* Top Performers */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ padding: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>Top Performing Vehicles</Text>
            
            {[
              { unit: 'T-101', driver: 'John Smith', mpg: 8.2, safety: 95, utilization: 92 },
              { unit: 'T-105', driver: 'Sarah Johnson', mpg: 7.8, safety: 93, utilization: 89 },
              { unit: 'T-112', driver: 'Mike Wilson', mpg: 7.6, safety: 91, utilization: 87 }
            ].map((vehicle, index) => (
              <View key={vehicle.unit} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: index < 2 ? 1 : 0,
                borderBottomColor: theme.colors.outline + '20'
              }}>
                <View>
                  <Text variant="titleMedium">{vehicle.unit}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {vehicle.driver}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodyLarge">{vehicle.mpg}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>MPG</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodyLarge">{vehicle.safety}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Safety</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodyLarge">{vehicle.utilization}%</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Usage</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Areas for Improvement */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ padding: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>Areas for Improvement</Text>
            
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} color="#FF9800" />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">Idle Time Reduction</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Average idle time is 15% higher than industry standard
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} color="#FF5722" />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">Maintenance Scheduling</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {metrics.maintenance.overdueItems} vehicles have overdue maintenance
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} color="#9C27B0" />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">Route Optimization</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Deadhead percentage of {metrics.productivity.deadheadPercentage}% above target
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
