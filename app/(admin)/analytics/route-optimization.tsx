// waygo-freight/app/(admin)/analytics/route-optimization.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Dimensions, 
  RefreshControl,
  ActivityIndicator,
  Animated 
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  ProgressBar,
  Badge,
  Menu,
  Divider,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLoad } from '../../../state/loadContext';
import { useFleet } from '../../../state/fleetContext';
import { useAuth } from '../../../state/authContext';
import GeminiService from '../../../services/geminiService';

import { 
  Route as RouteIcon,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  DollarSign,
  Fuel,
  Navigation,
  BarChart,
  Activity,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download
} from '../../../utils/icons';

interface RouteMetrics {
  id: string;
  routeName: string;
  totalMiles: number;
  actualMiles: number;
  plannedMiles: number;
  fuelEfficiency: number;
  deliveryTime: number;
  plannedTime: number;
  costPerMile: number;
  revenue: number;
  profit: number;
  optimizationScore: number;
  emptyMiles: number;
  onTimePercentage: number;
  loadCount: number;
  driverRating: number;
}

interface OptimizationInsight {
  id: string;
  type: 'fuel_savings' | 'time_reduction' | 'cost_optimization' | 'efficiency_improvement';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: number;
  implementationEffort: 'easy' | 'medium' | 'complex';
  status: 'new' | 'in_progress' | 'implemented' | 'dismissed';
}

// Mock optimization insights data
const optimizationInsights: OptimizationInsight[] = [
  {
    id: '1',
    type: 'fuel_savings',
    severity: 'high',
    title: 'Route Consolidation Opportunity',
    description: 'Combine Chicago-Milwaukee routes to reduce empty miles by 15%',
    potentialSavings: 2500,
    implementationEffort: 'medium',
    status: 'new'
  },
  {
    id: '2',
    type: 'time_reduction',
    severity: 'medium',
    title: 'Off-Peak Scheduling',
    description: 'Schedule LA deliveries during off-peak hours to avoid traffic',
    potentialSavings: 1800,
    implementationEffort: 'easy',
    status: 'new'
  }
];

const RouteOptimizationAnalytics = () => {
  const theme = useTheme();
  const { loads } = useLoad();
  const { vehicles } = useFleet();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'efficiency' | 'cost' | 'time' | 'fuel'>('efficiency');
  const [insights, setInsights] = useState<OptimizationInsight[]>(optimizationInsights);
  const [aiInsights, setAiInsights] = useState<OptimizationInsight[]>([]);
  const [loadingAiInsights, setLoadingAiInsights] = useState(false);

  // Mock route metrics data
  const routeMetrics: RouteMetrics[] = [
    {
      id: '1',
      routeName: 'Chicago - Atlanta Corridor',
      totalMiles: 12500,
      actualMiles: 12500,
      plannedMiles: 12800,
      fuelEfficiency: 6.8,
      deliveryTime: 18.5,
      plannedTime: 20.0,
      costPerMile: 1.85,
      revenue: 45000,
      profit: 12500,
      optimizationScore: 87,
      emptyMiles: 1200,
      onTimePercentage: 94,
      loadCount: 25,
      driverRating: 4.6
    },
    {
      id: '2',
      routeName: 'LA - Phoenix Express',
      totalMiles: 8200,
      actualMiles: 8200,
      plannedMiles: 8000,
      fuelEfficiency: 7.2,
      deliveryTime: 12.2,
      plannedTime: 12.0,
      costPerMile: 1.75,
      revenue: 28000,
      profit: 8500,
      optimizationScore: 72,
      emptyMiles: 800,
      onTimePercentage: 88,
      loadCount: 18,
      driverRating: 4.2
    },
    {
      id: '3',
      routeName: 'Dallas - Houston Local',
      totalMiles: 6800,
      actualMiles: 6800,
      plannedMiles: 7200,
      fuelEfficiency: 6.5,
      deliveryTime: 15.8,
      plannedTime: 18.0,
      costPerMile: 1.90,
      revenue: 22000,
      profit: 6200,
      optimizationScore: 91,
      emptyMiles: 650,
      onTimePercentage: 96,
      loadCount: 22,
      driverRating: 4.8
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getOptimizationScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getInsightIcon = (type: OptimizationInsight['type']) => {
    switch (type) {
      case 'fuel_savings': return Fuel;
      case 'time_reduction': return Clock;
      case 'cost_optimization': return DollarSign;
      case 'efficiency_improvement': return TrendingUp;
      default: return Activity;
    }
  };

  const getSeverityColor = (severity: OptimizationInsight['severity']) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderKPICard = (title: string, value: string, subtitle: string, icon: any, color: string, trend?: number) => (
    <Card mode="elevated" style={{ flex: 1, margin: 4 }}>
      <Card.Content style={{ alignItems: 'center', padding: 12 }}>
        <View style={{ 
          backgroundColor: color + '20', 
          padding: 8, 
          borderRadius: 20, 
          marginBottom: 8 
        }}>
          {React.createElement(icon, { size: 24, color })}
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {subtitle}
        </Text>
        {trend !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            {trend >= 0 ? 
              <TrendingUp size={12} color="#4CAF50" /> : 
              <TrendingDown size={12} color="#F44336" />
            }
            <Text variant="bodySmall" style={{ 
              color: trend >= 0 ? '#4CAF50' : '#F44336',
              marginLeft: 2
            }}>
              {trend >= 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderRouteMetricsCard = (route: RouteMetrics) => {
    const efficiencyImprovement = ((route.plannedMiles - route.actualMiles) / route.plannedMiles) * 100;
    const timeImprovement = ((route.plannedTime - route.deliveryTime) / route.plannedTime) * 100;
    
    return (
      <Card key={route.id} mode="elevated" style={{ marginBottom: 12 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {route.routeName}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {route.loadCount} loads • {route.totalMiles.toLocaleString()} miles
              </Text>
            </View>
            <Chip 
              mode="outlined" 
              textStyle={{ fontSize: 12, fontWeight: 'bold' }}
              style={{ 
                backgroundColor: getOptimizationScoreColor(route.optimizationScore) + '20',
                borderColor: getOptimizationScoreColor(route.optimizationScore)
              }}
            >
              {route.optimizationScore}% Optimized
            </Chip>
          </View>

          {/* Optimization Score Progress */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Optimization Score
              </Text>
              <Text variant="bodySmall" style={{ color: getOptimizationScoreColor(route.optimizationScore) }}>
                {route.optimizationScore}%
              </Text>
            </View>
            <ProgressBar 
              progress={route.optimizationScore / 100} 
              color={getOptimizationScoreColor(route.optimizationScore)}
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>

          {/* Key Metrics Grid */}
          <View style={{ 
            backgroundColor: theme.colors.surfaceVariant,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <View style={{ flex: 1, minWidth: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Fuel size={16} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ marginLeft: 4, fontWeight: 'bold' }}>
                    {route.fuelEfficiency} MPG
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Fuel Efficiency
                </Text>
              </View>
              
              <View style={{ flex: 1, minWidth: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Clock size={16} color={theme.colors.secondary} />
                  <Text variant="bodySmall" style={{ marginLeft: 4, fontWeight: 'bold' }}>
                    {route.onTimePercentage}%
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  On-Time Delivery
                </Text>
              </View>
              
              <View style={{ flex: 1, minWidth: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <DollarSign size={16} color="#4CAF50" />
                  <Text variant="bodySmall" style={{ marginLeft: 4, fontWeight: 'bold', color: '#4CAF50' }}>
                    ${route.costPerMile.toFixed(2)}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Cost per Mile
                </Text>
              </View>
              
              <View style={{ flex: 1, minWidth: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Navigation size={16} color="#9C27B0" />
                  <Text variant="bodySmall" style={{ marginLeft: 4, fontWeight: 'bold' }}>
                    {route.emptyMiles.toLocaleString()}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Empty Miles
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Improvements */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {efficiencyImprovement > 0 && (
              <Chip 
                mode="outlined" 
                textStyle={{ fontSize: 11 }}
                style={{ backgroundColor: '#4CAF5020', borderColor: '#4CAF50' }}
                icon={() => <TrendingUp size={12} color="#4CAF50" />}
              >
                {efficiencyImprovement.toFixed(1)}% Miles Saved
              </Chip>
            )}
            {timeImprovement > 0 && (
              <Chip 
                mode="outlined" 
                textStyle={{ fontSize: 11 }}
                style={{ backgroundColor: '#2196F320', borderColor: '#2196F3' }}
                icon={() => <Clock size={12} color="#2196F3" />}
              >
                {timeImprovement.toFixed(1)}% Time Saved
              </Chip>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Button 
              mode="text" 
              compact
              onPress={() => console.log('View route details')}
            >
              View Details
            </Button>
            <View style={{ flexDirection: 'row' }}>
              <IconButton 
                icon="chart-line" 
                size={20} 
                onPress={() => console.log('View analytics')}
              />
              <IconButton 
                icon="cog" 
                size={20} 
                onPress={() => console.log('Optimize route')}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderInsightCard = (insight: OptimizationInsight) => {
    const InsightIcon = getInsightIcon(insight.type);
    
    return (
      <Swipeable renderRightActions={() => (
        <View style={{ 
          backgroundColor: '#F44336', 
          padding: 16, 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <IconButton 
            icon="delete" 
            size={24} 
            onPress={() => setInsights(insights.filter(i => i.id !== insight.id))}
          />
        </View>
      )}>
        <Card key={insight.id} mode="elevated" style={{ marginBottom: 12 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ 
                backgroundColor: getSeverityColor(insight.severity) + '20',
                padding: 8,
                borderRadius: 20,
                marginRight: 12
              }}>
                <InsightIcon size={20} color={getSeverityColor(insight.severity)} />
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold', flex: 1 }}>
                    {insight.title}
                  </Text>
                  <Badge 
                    style={{ 
                      backgroundColor: getSeverityColor(insight.severity),
                      color: '#FFFFFF'
                    }}
                  >
                    {insight.severity.toUpperCase()}
                  </Badge>
                </View>
                
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                  {insight.description}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <DollarSign size={16} color="#4CAF50" />
                  <Text variant="bodyMedium" style={{ marginLeft: 4, fontWeight: 'bold', color: '#4CAF50' }}>
                    ${insight.potentialSavings.toLocaleString()} potential savings
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Chip 
                    mode="outlined" 
                    textStyle={{ fontSize: 11 }}
                    style={{ 
                      backgroundColor: insight.implementationEffort === 'easy' ? '#4CAF5020' : 
                                       insight.implementationEffort === 'medium' ? '#FF980020' : '#F4433620',
                      borderColor: insight.implementationEffort === 'easy' ? '#4CAF50' : 
                                   insight.implementationEffort === 'medium' ? '#FF9800' : '#F44336'
                    }}
                  >
                    {insight.implementationEffort} to implement
                  </Chip>
                  
                  <Chip 
                    mode="outlined" 
                    textStyle={{ fontSize: 11 }}
                    style={{ 
                      backgroundColor: insight.status === 'new' ? '#2196F320' : 
                                       insight.status === 'in_progress' ? '#FF980020' : '#4CAF5020',
                      borderColor: insight.status === 'new' ? '#2196F3' : 
                                   insight.status === 'in_progress' ? '#FF9800' : '#4CAF50'
                    }}
                  >
                    {insight.status.replace('_', ' ')}
                  </Chip>
                </View>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
              <Button 
                mode="outlined" 
                compact
                onPress={() => console.log('Dismiss insight')}
              >
                Dismiss
              </Button>
              <Button 
                mode="contained" 
                compact
                onPress={() => console.log('Implement insight')}
              >
                Implement
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Swipeable>
    );
  };

  // Load AI insights for enterprise users
  useEffect(() => {
    const loadAiInsights = async () => {
      const isEnterprisePlan = user?.appRole === 'admin' || user?.isDevAdmin;
      if (!isEnterprisePlan || !GeminiService.isConfigured()) return;
      
      setLoadingAiInsights(true);
      try {
        const routeData = routeMetrics.map(route => ({
          totalMiles: route.totalMiles,
          fuelEfficiency: route.fuelEfficiency,
          emptyMiles: route.emptyMiles,
          onTimePercentage: route.onTimePercentage,
          costPerMile: route.costPerMile,
          loadCount: route.loadCount
        }));

        const geminiInsights = await GeminiService.generateRouteOptimizationInsights(routeData);
        
        // Convert Gemini insights to OptimizationInsight format
        const formattedInsights: OptimizationInsight[] = geminiInsights.map((insight, index) => ({
          id: `ai_${index}`,
          type: insight.type,
          severity: insight.severity,
          title: insight.title,
          description: insight.description,
          potentialSavings: insight.potentialSavings,
          implementationEffort: insight.implementationEffort,
          status: 'new' as const
        }));

        setAiInsights(formattedInsights);
      } catch (error) {
        console.error('Error loading AI insights:', error);
      } finally {
        setLoadingAiInsights(false);
      }
    };

    loadAiInsights();
  }, [user?.appRole, user?.isDevAdmin]);

  // Calculate summary metrics
  const totalOptimizationScore = Math.round(
    routeMetrics.reduce((sum, route) => sum + route.optimizationScore, 0) / routeMetrics.length
  );
  
  const totalPotentialSavings = (insights || []).reduce((sum, insight) => 
    sum + (insight.status === 'new' ? insight.potentialSavings : 0), 0
  );
  
  const avgFuelEfficiency = (
    routeMetrics.reduce((sum, route) => sum + route.fuelEfficiency, 0) / routeMetrics.length
  ).toFixed(1);
  
  const avgOnTimePercentage = Math.round(
    routeMetrics.reduce((sum, route) => sum + route.onTimePercentage, 0) / routeMetrics.length
  );

  const isEnterprisePlan = user?.appRole === 'admin' || user?.isDevAdmin;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Route Optimization Analytics
          </Text>
          <IconButton 
            icon="download" 
            size={24} 
            onPress={() => console.log('Export analytics')}
          />
        </View>

        {/* Period Selection */}
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as any)}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'quarter', label: 'Quarter' },
            { value: 'year', label: 'Year' }
          ]}
          style={{ marginBottom: 16 }}
        />

        {/* Summary KPIs - 2x2 Grid Layout */}
        <View style={{ marginBottom: 16 }}>
          {/* First Row */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {renderKPICard(
              'Overall Optimization',
              `${totalOptimizationScore}%`,
              'Average score',
              Target,
              '#2196F3',
              5
            )}
            {renderKPICard(
              'Potential Savings',
              `$${(totalPotentialSavings / 1000).toFixed(0)}K`,
              'Available improvements',
              DollarSign,
              '#4CAF50'
            )}
          </View>
          
          {/* Second Row */}
          <View style={{ flexDirection: 'row' }}>
            {renderKPICard(
              'Fleet Fuel Efficiency',
              `${avgFuelEfficiency} MPG`,
              'Average across routes',
              Fuel,
              '#FF9800',
              3
            )}
            {renderKPICard(
              'On-Time Performance',
              `${avgOnTimePercentage}%`,
              'Average delivery rate',
              CheckCircle,
              '#9C27B0',
              -1
            )}
          </View>
        </View>

        {/* Optimization Insights Section */}
        {isEnterprisePlan ? (
          <View>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
              Optimization Insights ({insights.filter(i => i.status === 'new').length})
            </Text>
            
            {insights.filter(i => i.status === 'new').map(renderInsightCard)}
            
            {loadingAiInsights ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                AI Insights ({aiInsights.length})
              </Text>
            )}
            
            {aiInsights.map(renderInsightCard)}
          </View>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
              Unlock AI Insights with Enterprise Plan
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Upgrade to our Enterprise plan to access AI-powered insights and optimize your routes like never before.
            </Text>
            <Button 
              mode="contained" 
              compact
              onPress={() => console.log('Upgrade to Enterprise plan')}
            >
              Upgrade Now
            </Button>
          </View>
        )}

        {/* Route Performance Section */}
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, marginTop: 8 }}>
          Route Performance Analysis
        </Text>
        
        {routeMetrics.map(renderRouteMetricsCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RouteOptimizationAnalytics;
