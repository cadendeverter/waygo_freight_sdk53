import React, { useState, useMemo } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Card, Text, Chip, SegmentedButtons } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useLoad } from '../../../state/loadContext';
import { DollarSign, TrendingUp, TrendingDown, BarChart } from '../../../utils/icons';

const { width } = Dimensions.get('window');

export default function FinancialAnalyticsScreen() {
  const theme = useTheme();
  const { loads } = useLoad();
  const [timeRange, setTimeRange] = useState('month');

  // Safe number calculation functions
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isFinite(num) ? num : 0;
  };

  const safePercentage = (value: number, total: number): number => {
    if (!isFinite(value) || !isFinite(total) || total === 0) return 0;
    const percentage = (value / total) * 100;
    return isFinite(percentage) ? Math.round(percentage) : 0;
  };

  // Calculate financial metrics safely
  const metrics = useMemo(() => {
    const totalRevenue = loads.reduce((sum, load) => {
      return sum + safeNumber(load.rate);
    }, 0);

    const deliveredLoads = loads.filter(load => load.status === 'delivered');
    const deliveredRevenue = deliveredLoads.reduce((sum, load) => {
      return sum + safeNumber(load.rate);
    }, 0);

    const pendingRevenue = loads
      .filter(load => load.status === 'pending')
      .reduce((sum, load) => sum + safeNumber(load.rate), 0);

    const averageLoadValue = loads.length > 0 
      ? Math.round(totalRevenue / loads.length) 
      : 0;

    // Mock previous period data for growth calculation
    const previousRevenue = totalRevenue * 0.85; // 15% growth simulation
    const revenueGrowth = safePercentage(totalRevenue - previousRevenue, previousRevenue);

    return {
      totalRevenue: Math.round(totalRevenue),
      deliveredRevenue: Math.round(deliveredRevenue),
      pendingRevenue: Math.round(pendingRevenue),
      averageLoadValue,
      revenueGrowth,
      profitMargin: 25, // Mock data
      costPerMile: 1.85, // Mock data
    };
  }, [loads]);

  return (
    <ScreenWrapper>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <DollarSign size={32} color={theme.colors.primary} style={{ marginRight: 12 }} />
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
              Financial Analytics
            </Text>
          </View>

          {/* Time Range Selector */}
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'quarter', label: 'Quarter' },
              { value: 'year', label: 'Year' },
            ]}
            style={{ marginBottom: 24 }}
          />

          {/* Revenue Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Card style={{ flex: 1 }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <DollarSign size={24} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                  ${metrics.totalRevenue.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={{ textAlign: 'center' }}>
                  Total Revenue
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <TrendingUp size={16} color="green" />
                  <Text style={{ color: 'green', marginLeft: 4 }}>
                    +{metrics.revenueGrowth}%
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={{ flex: 1 }}>
              <Card.Content style={{ alignItems: 'center', padding: 16 }}>
                <BarChart size={24} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                  ${metrics.averageLoadValue.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={{ textAlign: 'center' }}>
                  Avg Load Value
                </Text>
                <Chip size="small" style={{ marginTop: 4 }}>
                  {loads.length} loads
                </Chip>
              </Card.Content>
            </Card>
          </View>

          {/* Delivered vs Pending Revenue */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                Revenue Breakdown
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Delivered Revenue:</Text>
                <Text style={{ fontWeight: 'bold', color: 'green' }}>
                  ${metrics.deliveredRevenue.toLocaleString()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>Pending Revenue:</Text>
                <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                  ${metrics.pendingRevenue.toLocaleString()}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Key Metrics */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                Key Performance Indicators
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Profit Margin:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold' }}>{metrics.profitMargin}%</Text>
                  <TrendingUp size={16} color="green" style={{ marginLeft: 4 }} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>Cost per Mile:</Text>
                <Text style={{ fontWeight: 'bold' }}>
                  ${metrics.costPerMile.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                Revenue Trend Analysis
              </Text>
              <Text variant="bodyMedium">
                Financial performance shows {metrics.revenueGrowth > 0 ? 'positive' : 'negative'} growth 
                compared to the previous period. Revenue tracking and cost management remain key 
                areas for continued financial optimization.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
