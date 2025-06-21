import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, Chip, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { BarChart, PieChart, TrendingUp, DollarSign, Clock, Users, Truck, AlertCircle } from '../../../utils/icons';

interface AnalyticsModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  category: 'performance' | 'financial' | 'operational' | 'safety';
  priority: 'high' | 'medium' | 'low';
}

const analyticsModules: AnalyticsModule[] = [
  {
    id: 'driver-performance',
    title: 'Driver Performance',
    description: 'Monitor driver metrics, safety scores, and HOS compliance',
    icon: Users,
    route: '/(admin)/analytics/driver-performance',
    category: 'performance',
    priority: 'high'
  },
  {
    id: 'route-optimization',
    title: 'Route Optimization',
    description: 'Analyze route efficiency and cost optimization opportunities',
    icon: TrendingUp,
    route: '/(admin)/analytics/route-optimization',
    category: 'operational',
    priority: 'high'
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports',
    description: 'Revenue, expenses, profit margins, and billing analytics',
    icon: DollarSign,
    route: '/(admin)/reports/index',
    category: 'financial',
    priority: 'high'
  },
  {
    id: 'fleet-analytics',
    title: 'Fleet Analytics',
    description: 'Vehicle utilization, maintenance costs, and fuel efficiency',
    icon: Truck,
    route: '/(admin)/fleet/analytics',
    category: 'operational',
    priority: 'medium'
  },
  {
    id: 'operational-dashboard',
    title: 'Real-time Operations',
    description: 'Live operational metrics and KPI monitoring',
    icon: BarChart,
    route: '/(admin)/operations/real-time-dashboard',
    category: 'operational',
    priority: 'high'
  },
  {
    id: 'safety-analytics',
    title: 'Safety & Compliance',
    description: 'Safety events, violations, and compliance tracking',
    icon: AlertCircle,
    route: '/(admin)/compliance/index',
    category: 'safety',
    priority: 'high'
  }
];

export default function AnalyticsIndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'performance', 'financial', 'operational', 'safety'];

  const filteredModules = analyticsModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return '#4CAF50';
      case 'financial': return '#2196F3';
      case 'operational': return '#FF9800';
      case 'safety': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const renderAnalyticsCard = (module: AnalyticsModule) => {
    const IconComponent = module.icon;
    
    return (
      <Card key={module.id} style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(module.category) + '15' }]}>
              <IconComponent size={24} color={getCategoryColor(module.category)} />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium" style={styles.cardTitle}>{module.title}</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>{module.description}</Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.categoryChip, { borderColor: getCategoryColor(module.category) }]}
              textStyle={{ color: getCategoryColor(module.category) }}
            >
              {module.category}
            </Chip>
            <Button
              mode="contained"
              onPress={() => router.push(module.route)}
              style={styles.openButton}
              compact
            >
              Open Analytics
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Analytics & Reports</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Comprehensive business intelligence and data analytics
          </Text>
        </View>

        <Searchbar
          placeholder="Search analytics modules..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <Chip
              key={category}
              mode={selectedCategory === category ? 'flat' : 'outlined'}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryFilter,
                selectedCategory === category && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={selectedCategory === category ? { color: '#FFFFFF' } : {}}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredModules.map(renderAnalyticsCard)}
          
          {filteredModules.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <BarChart size={48} color={theme.colors.outline} />
                <Text variant="titleMedium" style={styles.emptyTitle}>No analytics modules found</Text>
                <Text variant="bodyMedium" style={styles.emptyDescription}>
                  Try adjusting your search or category filter
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  searchbar: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryFilter: {
    marginRight: 8,
    height: 28,
    minHeight: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    opacity: 0.7,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    height: 32,
    paddingVertical: 4,
  },
  openButton: {
    borderRadius: 20,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
