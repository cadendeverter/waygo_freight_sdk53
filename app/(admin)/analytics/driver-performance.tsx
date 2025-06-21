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
  DataTable
} from 'react-native-paper';
import { 
  User, 
  Star, 
  Clock, 
  MapPin, 
  Fuel, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Phone,
  Eye,
  Download,
  RefreshCw,
  Target,
  Calendar
} from '../../../utils/icons';

interface DriverPerformance {
  id: string;
  driver: {
    id: string;
    name: string;
    licenseNumber: string;
    hireDate: Date;
    phone: string;
    email: string;
    photoUrl?: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalMiles: number;
    totalHours: number;
    totalLoads: number;
    totalRevenue: number;
    onTimeDeliveries: number;
    fuelEfficiency: number; // MPG
    safetyScore: number; // 0-100
    customerRating: number; // 0-5
    violationsCount: number;
    accidentsCount: number;
    avgDeliveryTime: number; // minutes late/early
    utilization: number; // percentage
  };
  trends: {
    revenue: number; // percentage change
    efficiency: number; // percentage change
    safety: number; // percentage change
    onTime: number; // percentage change
  };
  rankings: {
    overall: number;
    safety: number;
    efficiency: number;
    revenue: number;
    onTime: number;
  };
  alerts: DriverAlert[];
  achievements: DriverAchievement[];
  recentLoads: RecentLoad[];
}

interface DriverAlert {
  id: string;
  type: 'VIOLATION' | 'SAFETY' | 'EFFICIENCY' | 'MAINTENANCE' | 'COMPLIANCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

interface DriverAchievement {
  id: string;
  type: 'SAFETY_MILESTONE' | 'EFFICIENCY_AWARD' | 'ON_TIME_CHAMPION' | 'REVENUE_LEADER';
  title: string;
  description: string;
  earnedDate: Date;
  icon: string;
}

interface RecentLoad {
  id: string;
  loadNumber: string;
  route: string;
  completedDate: Date;
  revenue: number;
  miles: number;
  onTimeStatus: 'EARLY' | 'ON_TIME' | 'LATE';
  rating: number;
}

const mockDriverPerformance: DriverPerformance[] = [
  {
    id: 'perf1',
    driver: {
      id: 'driver1',
      name: 'John Smith',
      licenseNumber: 'CDL123456789',
      hireDate: new Date('2022-03-15'),
      phone: '+1-555-0123',
      email: 'john.smith@waygo.com'
    },
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    metrics: {
      totalMiles: 12500,
      totalHours: 185,
      totalLoads: 28,
      totalRevenue: 18750,
      onTimeDeliveries: 26,
      fuelEfficiency: 7.2,
      safetyScore: 94,
      customerRating: 4.6,
      violationsCount: 1,
      accidentsCount: 0,
      avgDeliveryTime: -15, // 15 minutes early on average
      utilization: 87
    },
    trends: {
      revenue: 12.5,
      efficiency: 8.3,
      safety: -2.1,
      onTime: 5.7
    },
    rankings: {
      overall: 3,
      safety: 8,
      efficiency: 2,
      revenue: 4,
      onTime: 1
    },
    alerts: [
      {
        id: 'alert1',
        type: 'VIOLATION',
        severity: 'MEDIUM',
        title: 'HOS Violation',
        description: 'Minor driving time violation on 03/15',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolved: false
      }
    ],
    achievements: [
      {
        id: 'achieve1',
        type: 'ON_TIME_CHAMPION',
        title: 'On-Time Champion',
        description: '95%+ on-time delivery rate for 3 consecutive months',
        earnedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        icon: 'clock'
      },
      {
        id: 'achieve2',
        type: 'EFFICIENCY_AWARD',
        title: 'Fuel Efficiency Star',
        description: 'Top 10% fuel efficiency in fleet',
        earnedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        icon: 'fuel'
      }
    ],
    recentLoads: [
      {
        id: 'load1',
        loadNumber: 'L-2024-001',
        route: 'Chicago, IL → Milwaukee, WI',
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        revenue: 2500,
        miles: 485,
        onTimeStatus: 'ON_TIME',
        rating: 5
      },
      {
        id: 'load2',
        loadNumber: 'L-2024-002',
        route: 'Milwaukee, WI → Madison, WI',
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        revenue: 1800,
        miles: 235,
        onTimeStatus: 'EARLY',
        rating: 4
      }
    ]
  },
  {
    id: 'perf2',
    driver: {
      id: 'driver2',
      name: 'Sarah Johnson',
      licenseNumber: 'CDL987654321',
      hireDate: new Date('2021-08-20'),
      phone: '+1-555-0456',
      email: 'sarah.johnson@waygo.com'
    },
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    metrics: {
      totalMiles: 11800,
      totalHours: 178,
      totalLoads: 24,
      totalRevenue: 19200,
      onTimeDeliveries: 23,
      fuelEfficiency: 6.8,
      safetyScore: 98,
      customerRating: 4.8,
      violationsCount: 0,
      accidentsCount: 0,
      avgDeliveryTime: -8,
      utilization: 92
    },
    trends: {
      revenue: 18.2,
      efficiency: 5.1,
      safety: 1.2,
      onTime: 8.9
    },
    rankings: {
      overall: 1,
      safety: 1,
      efficiency: 5,
      revenue: 1,
      onTime: 3
    },
    alerts: [],
    achievements: [
      {
        id: 'achieve3',
        type: 'SAFETY_MILESTONE',
        title: 'Safety Champion',
        description: '2 years accident-free driving',
        earnedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        icon: 'shield'
      },
      {
        id: 'achieve4',
        type: 'REVENUE_LEADER',
        title: 'Revenue Leader',
        description: 'Highest revenue driver this month',
        earnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: 'dollar-sign'
      }
    ],
    recentLoads: [
      {
        id: 'load3',
        loadNumber: 'L-2024-003',
        route: 'Dallas, TX → Houston, TX',
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        revenue: 3200,
        miles: 245,
        onTimeStatus: 'ON_TIME',
        rating: 5
      }
    ]
  }
];

export default function DriverPerformanceScreen() {
  const theme = useTheme();
  const [performance, setPerformance] = useState<DriverPerformance[]>(mockDriverPerformance);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverPerformance | null>(null);

  const screenWidth = Dimensions.get('window').width;

  const getPerformanceColor = (value: number, type: 'score' | 'percentage' | 'trend') => {
    if (type === 'trend') {
      return value > 0 ? '#4CAF50' : value < 0 ? '#F44336' : theme.colors.outline;
    }
    if (type === 'score' && value >= 90) return '#4CAF50';
    if (type === 'score' && value >= 80) return '#FF9800';
    if (type === 'score' && value >= 70) return '#F44336';
    if (type === 'percentage' && value >= 90) return '#4CAF50';
    if (type === 'percentage' && value >= 80) return '#FF9800';
    return '#F44336';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'VIOLATION': return <AlertTriangle size={20} color="#F44336" />;
      case 'SAFETY': return <AlertTriangle size={20} color="#FF9800" />;
      case 'EFFICIENCY': return <Fuel size={20} color="#2196F3" />;
      case 'MAINTENANCE': return <AlertTriangle size={20} color="#FF9800" />;
      case 'COMPLIANCE': return <AlertTriangle size={20} color="#F44336" />;
      default: return <AlertTriangle size={20} color={theme.colors.outline} />;
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'SAFETY_MILESTONE': return <Award size={20} color="#4CAF50" />;
      case 'EFFICIENCY_AWARD': return <Fuel size={20} color="#2196F3" />;
      case 'ON_TIME_CHAMPION': return <Clock size={20} color="#FF9800" />;
      case 'REVENUE_LEADER': return <DollarSign size={20} color="#4CAF50" />;
      default: return <Award size={20} color={theme.colors.primary} />;
    }
  };

  const getOnTimeStatusColor = (status: string) => {
    switch (status) {
      case 'EARLY': return '#4CAF50';
      case 'ON_TIME': return '#4CAF50';
      case 'LATE': return '#F44336';
      default: return theme.colors.outline;
    }
  };

  const filteredPerformance = performance.filter(perf => {
    switch (selectedFilter) {
      case 'top': return perf.rankings.overall <= 5;
      case 'alerts': return perf.alerts.filter(a => !a.resolved).length > 0;
      case 'achievers': return perf.achievements.length > 0;
      default: return true;
    }
  });

  const sortedPerformance = [...filteredPerformance].sort((a, b) => {
    switch (selectedMetric) {
      case 'revenue': return b.metrics.totalRevenue - a.metrics.totalRevenue;
      case 'safety': return b.metrics.safetyScore - a.metrics.safetyScore;
      case 'efficiency': return b.metrics.fuelEfficiency - a.metrics.fuelEfficiency;
      case 'ontime': return (b.metrics.onTimeDeliveries / b.metrics.totalLoads) - (a.metrics.onTimeDeliveries / a.metrics.totalLoads);
      default: return a.rankings.overall - b.rankings.overall;
    }
  });

  const viewDriverDetails = (driver: DriverPerformance) => {
    const onTimeRate = ((driver.metrics.onTimeDeliveries / driver.metrics.totalLoads) * 100).toFixed(1);
    const avgMPG = driver.metrics.fuelEfficiency.toFixed(1);
    
    Alert.alert(
      `${driver.driver.name} Performance`,
      `Overall Ranking: #${driver.rankings.overall}
      
Revenue: $${driver.metrics.totalRevenue.toLocaleString()}
Loads Completed: ${driver.metrics.totalLoads}
Total Miles: ${driver.metrics.totalMiles.toLocaleString()}
Total Hours: ${driver.metrics.totalHours}

Performance Metrics:
• On-Time Rate: ${onTimeRate}% (${driver.metrics.onTimeDeliveries}/${driver.metrics.totalLoads})
• Safety Score: ${driver.metrics.safetyScore}/100
• Fuel Efficiency: ${avgMPG} MPG
• Customer Rating: ${driver.metrics.customerRating}/5.0
• Utilization: ${driver.metrics.utilization}%

Safety Record:
• Violations: ${driver.metrics.violationsCount}
• Accidents: ${driver.metrics.accidentsCount}

Trends (vs. previous period):
• Revenue: ${driver.trends.revenue > 0 ? '+' : ''}${driver.trends.revenue}%
• Efficiency: ${driver.trends.efficiency > 0 ? '+' : ''}${driver.trends.efficiency}%
• Safety: ${driver.trends.safety > 0 ? '+' : ''}${driver.trends.safety}%
• On-Time: ${driver.trends.onTime > 0 ? '+' : ''}${driver.trends.onTime}%

Contact: ${driver.driver.phone}
License: ${driver.driver.licenseNumber}
Hire Date: ${driver.driver.hireDate.toLocaleDateString()}`,
      [
        { text: 'OK' },
        { text: 'Call Driver', onPress: () => Alert.alert('Calling', `Calling ${driver.driver.phone}...`) }
      ]
    );
  };

  const resolveAlert = (driverId: string, alertId: string) => {
    setPerformance(prev => prev.map(perf => 
      perf.id === driverId 
        ? {
            ...perf,
            alerts: perf.alerts.map(alert => 
              alert.id === alertId ? { ...alert, resolved: true } : alert
            )
          }
        : perf
    ));
    Alert.alert('Success', 'Alert marked as resolved.');
  };

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportReport = () => {
    Alert.alert('Export Report', 'Driver performance report exported successfully!');
  };

  // Calculate fleet stats
  const fleetStats = {
    totalDrivers: performance.length,
    avgSafetyScore: performance.reduce((sum, p) => sum + p.metrics.safetyScore, 0) / performance.length,
    avgOnTimeRate: performance.reduce((sum, p) => sum + (p.metrics.onTimeDeliveries / p.metrics.totalLoads), 0) / performance.length * 100,
    totalRevenue: performance.reduce((sum, p) => sum + p.metrics.totalRevenue, 0),
    activeAlerts: performance.reduce((sum, p) => sum + p.alerts.filter(a => !a.resolved).length, 0)
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Driver Performance</Text>
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

        {/* Fleet Stats */}
        <Card style={{ marginBottom: 16, padding: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Fleet Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall">{fleetStats.totalDrivers}</Text>
              <Text variant="bodySmall">Total Drivers</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: getPerformanceColor(fleetStats.avgSafetyScore, 'score') }}>
                {fleetStats.avgSafetyScore.toFixed(0)}
              </Text>
              <Text variant="bodySmall">Avg Safety</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: getPerformanceColor(fleetStats.avgOnTimeRate, 'percentage') }}>
                {fleetStats.avgOnTimeRate.toFixed(0)}%
              </Text>
              <Text variant="bodySmall">On-Time Rate</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall">${Math.round(fleetStats.totalRevenue / 1000)}K</Text>
              <Text variant="bodySmall">Total Revenue</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: fleetStats.activeAlerts > 0 ? '#F44336' : '#4CAF50' }}>
                {fleetStats.activeAlerts}
              </Text>
              <Text variant="bodySmall">Active Alerts</Text>
            </View>
          </View>
        </Card>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All Drivers' },
              { key: 'top', label: 'Top Performers' },
              { key: 'alerts', label: 'Need Attention' },
              { key: 'achievers', label: 'Recent Achievers' }
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

        {/* Sort Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'overall', label: 'Overall Rank' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'safety', label: 'Safety' },
              { key: 'efficiency', label: 'Efficiency' },
              { key: 'ontime', label: 'On-Time' }
            ].map(metric => (
              <Chip
                key={metric.key}
                selected={selectedMetric === metric.key}
                onPress={() => setSelectedMetric(metric.key)}
                mode="outlined"
                style={{ marginRight: 8 }}
              >
                {metric.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Driver List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {sortedPerformance.map((driver, index) => {
          const onTimeRate = (driver.metrics.onTimeDeliveries / driver.metrics.totalLoads) * 100;
          const unresolvedAlerts = driver.alerts.filter(a => !a.resolved);
          
          return (
            <Card key={driver.id} style={{ marginBottom: 12 }}>
              <List.Item
                title={driver.driver.name}
                description={`#${driver.rankings.overall} Overall • ${driver.metrics.totalLoads} loads • $${driver.metrics.totalRevenue.toLocaleString()}`}
                left={(props) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Avatar.Text 
                      {...props} 
                      label={driver.driver.name.split(' ').map(n => n[0]).join('')}
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <Text variant="headlineSmall" style={{ 
                      color: index < 3 ? '#4CAF50' : theme.colors.outline,
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </Text>
                  </View>
                )}
                right={(props) => (
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                    {unresolvedAlerts.length > 0 && (
                      <Badge style={{ backgroundColor: '#F44336' }}>
                        {`${unresolvedAlerts.length} alert${unresolvedAlerts.length !== 1 ? 's' : ''}`}
                      </Badge>
                    )}
                    {driver.achievements.length > 0 && (
                      <Badge style={{ backgroundColor: '#4CAF50' }}>
                        {`${driver.achievements.length} award${driver.achievements.length !== 1 ? 's' : ''}`}
                      </Badge>
                    )}
                  </View>
                )}
                onPress={() => viewDriverDetails(driver)}
              />

              {/* Performance Metrics */}
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Safety Score</Text>
                    <Text variant="titleMedium" style={{ color: getPerformanceColor(driver.metrics.safetyScore, 'score') }}>
                      {driver.metrics.safetyScore}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>On-Time</Text>
                    <Text variant="titleMedium" style={{ color: getPerformanceColor(onTimeRate, 'percentage') }}>
                      {onTimeRate.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Fuel MPG</Text>
                    <Text variant="titleMedium">{driver.metrics.fuelEfficiency.toFixed(1)}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Rating</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Star size={16} color="#FFD700" />
                      <Text variant="titleMedium">{driver.metrics.customerRating.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>

                {/* Trend Indicators */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text variant="bodySmall">Revenue:</Text>
                    {driver.trends.revenue > 0 ? 
                      <TrendingUp size={16} color="#4CAF50" /> : 
                      <TrendingDown size={16} color="#F44336" />
                    }
                    <Text variant="bodySmall" style={{ color: getPerformanceColor(driver.trends.revenue, 'trend') }}>
                      {driver.trends.revenue > 0 ? '+' : ''}{driver.trends.revenue}%
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text variant="bodySmall">Safety:</Text>
                    {driver.trends.safety > 0 ? 
                      <TrendingUp size={16} color="#4CAF50" /> : 
                      <TrendingDown size={16} color="#F44336" />
                    }
                    <Text variant="bodySmall" style={{ color: getPerformanceColor(driver.trends.safety, 'trend') }}>
                      {driver.trends.safety > 0 ? '+' : ''}{driver.trends.safety}%
                    </Text>
                  </View>
                </View>

                {/* Active Alerts */}
                {unresolvedAlerts.length > 0 && (
                  <Surface style={{ padding: 8, borderRadius: 8, marginBottom: 8, backgroundColor: '#FFF3E0' }}>
                    <Text variant="titleSmall" style={{ color: '#F57C00', marginBottom: 4 }}>
                      Active Alerts ({unresolvedAlerts.length})
                    </Text>
                    {unresolvedAlerts.slice(0, 2).map(alert => (
                      <View key={alert.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {getAlertIcon(alert.type)}
                        <Text variant="bodySmall" style={{ flex: 1 }}>{alert.title}</Text>
                        <Button 
                          mode="text" 
                          compact 
                          onPress={() => resolveAlert(driver.id, alert.id)}
                        >
                          Resolve
                        </Button>
                      </View>
                    ))}
                  </Surface>
                )}

                {/* Recent Achievements */}
                {driver.achievements.length > 0 && (
                  <Surface style={{ padding: 8, borderRadius: 8, marginBottom: 8, backgroundColor: '#E8F5E8' }}>
                    <Text variant="titleSmall" style={{ color: '#4CAF50', marginBottom: 4 }}>
                      Recent Achievements
                    </Text>
                    {driver.achievements.slice(0, 2).map(achievement => (
                      <View key={achievement.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {getAchievementIcon(achievement.type)}
                        <View style={{ flex: 1 }}>
                          <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>{achievement.title}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{achievement.description}</Text>
                        </View>
                      </View>
                    ))}
                  </Surface>
                )}

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Button
                    mode="outlined"
                    onPress={() => viewDriverDetails(driver)}
                    style={{ flex: 1 }}
                    icon="eye"
                    compact
                  >
                    View Details
                  </Button>
                  
                  <Button
                    mode="text"
                    onPress={() => Alert.alert('Contact', `Calling ${driver.driver.phone}...`)}
                    icon="phone"
                    compact
                  >
                    Contact
                  </Button>
                  
                  <Button
                    mode="text"
                    onPress={() => Alert.alert('Feature Coming Soon', 'Driver coaching tools will be available in a future update.')}
                    icon="target"
                    compact
                  >
                    Coach
                  </Button>
                </View>
              </View>
            </Card>
          );
        })}
        
        {sortedPerformance.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <User size={48} color={theme.colors.outline} />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              No Drivers Found
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              No drivers match the selected filter criteria.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
