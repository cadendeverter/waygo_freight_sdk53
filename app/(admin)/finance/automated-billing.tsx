// waygo-freight/app/(admin)/finance/automated-billing.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Alert, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { 
  Text, 
  Card, 
  Button, 
  Switch,
  Chip, 
  Searchbar, 
  Avatar, 
  Badge,
  IconButton,
  ProgressBar,
  Surface,
  Divider,
  List
} from 'react-native-paper';
import { 
  Zap, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Mail,
  Bell,
  Settings,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash,
  Play,
  Pause,
  Users,
  Target,
  Repeat,
  ArrowRight
} from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface BillingRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: 'delivery_confirmed' | 'time_based' | 'milestone' | 'manual';
  customerType: 'all' | 'specific' | 'category';
  customerFilter?: string[];
  billingCycle: 'immediate' | 'daily' | 'weekly' | 'monthly';
  template: string;
  autoSend: boolean;
  reminderDays: number[];
  lateFeePercent: number;
  discountPercent: number;
  paymentTerms: string;
  createdDate: string;
  lastRun?: string;
  totalInvoices: number;
  totalAmount: number;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  invoicesGenerated: number;
  automationSavings: number;
  errorRate: number;
  averageProcessingTime: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice_generated' | 'payment_received' | 'reminder_sent' | 'rule_triggered';
  description: string;
  amount?: number;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

// Mock billing rules data
const mockBillingRules: BillingRule[] = [
  {
    id: 'BR001',
    name: 'Standard Delivery Invoicing',
    description: 'Auto-generate invoices 24 hours after delivery confirmation',
    isActive: true,
    triggerType: 'delivery_confirmed',
    customerType: 'all',
    billingCycle: 'daily',
    template: 'standard_invoice',
    autoSend: true,
    reminderDays: [7, 14, 30],
    lateFeePercent: 1.5,
    discountPercent: 2.0,
    paymentTerms: 'Net 30',
    createdDate: '2025-01-15T00:00:00Z',
    lastRun: '2025-06-16T08:00:00Z',
    totalInvoices: 1247,
    totalAmount: 2847592.50
  },
  {
    id: 'BR002',
    name: 'Premium Customer Weekly',
    description: 'Weekly consolidated invoicing for premium customers',
    isActive: true,
    triggerType: 'time_based',
    customerType: 'category',
    customerFilter: ['premium', 'enterprise'],
    billingCycle: 'weekly',
    template: 'premium_invoice',
    autoSend: true,
    reminderDays: [3, 7, 14],
    lateFeePercent: 0.5,
    discountPercent: 5.0,
    paymentTerms: 'Net 15',
    createdDate: '2025-02-01T00:00:00Z',
    lastRun: '2025-06-15T00:00:00Z',
    totalInvoices: 156,
    totalAmount: 847392.75
  },
  {
    id: 'BR003',
    name: 'LTL Milestone Billing',
    description: 'Invoice when load reaches 50% and 100% delivery milestones',
    isActive: false,
    triggerType: 'milestone',
    customerType: 'specific',
    customerFilter: ['ACME Corp', 'Global Logistics'],
    billingCycle: 'immediate',
    template: 'milestone_invoice',
    autoSend: false,
    reminderDays: [5, 10, 20],
    lateFeePercent: 2.0,
    discountPercent: 0.0,
    paymentTerms: 'Net 45',
    createdDate: '2025-03-10T00:00:00Z',
    lastRun: '2025-06-10T00:00:00Z',
    totalInvoices: 89,
    totalAmount: 392847.25
  },
  {
    id: 'BR004',
    name: 'Fuel Surcharge Adjustment',
    description: 'Monthly fuel surcharge calculations and billing',
    isActive: true,
    triggerType: 'time_based',
    customerType: 'all',
    billingCycle: 'monthly',
    template: 'fuel_surcharge',
    autoSend: true,
    reminderDays: [15, 30],
    lateFeePercent: 1.0,
    discountPercent: 0.0,
    paymentTerms: 'Net 30',
    createdDate: '2025-04-01T00:00:00Z',
    lastRun: '2025-06-01T00:00:00Z',
    totalInvoices: 45,
    totalAmount: 184592.80
  }
];

const mockStats: AutomationStats = {
  totalRules: 4,
  activeRules: 3,
  invoicesGenerated: 1537,
  automationSavings: 47250.00,
  errorRate: 2.1,
  averageProcessingTime: 1.8
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: 'ACT001',
    type: 'invoice_generated',
    description: 'Invoice #INV-2025-001847 generated for ACME Corp',
    amount: 2847.50,
    timestamp: '2025-06-16T10:30:00Z',
    status: 'success'
  },
  {
    id: 'ACT002',
    type: 'payment_received',
    description: 'Payment received for Invoice #INV-2025-001823',
    amount: 1847.25,
    timestamp: '2025-06-16T09:15:00Z',
    status: 'success'
  },
  {
    id: 'ACT003',
    type: 'reminder_sent',
    description: 'First reminder sent for overdue Invoice #INV-2025-001756',
    timestamp: '2025-06-16T08:45:00Z',
    status: 'warning'
  },
  {
    id: 'ACT004',
    type: 'rule_triggered',
    description: 'Premium Customer Weekly rule processed 12 invoices',
    amount: 24847.75,
    timestamp: '2025-06-16T08:00:00Z',
    status: 'success'
  }
];

const AutomatedBillingScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [billingRules] = useState<BillingRule[]>(mockBillingRules);
  const [stats] = useState<AutomationStats>(mockStats);
  const [recentActivity] = useState<RecentActivity[]>(mockRecentActivity);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery_confirmed': return CheckCircle;
      case 'time_based': return Clock;
      case 'milestone': return Target;
      case 'manual': return Settings;
      default: return Zap;
    }
  };

  const getTriggerTypeColor = (type: string) => {
    switch (type) {
      case 'delivery_confirmed': return '#4CAF50';
      case 'time_based': return '#2196F3';
      case 'milestone': return '#FF9800';
      case 'manual': return '#9C27B0';
      default: return theme.colors.primary;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_generated': return FileText;
      case 'payment_received': return DollarSign;
      case 'reminder_sent': return Bell;
      case 'rule_triggered': return Zap;
      default: return Bell;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const filteredRules = billingRules.filter(rule => {
    const matchesSearch = 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'all' || 
      (selectedFilter === 'active' && rule.isActive) ||
      (selectedFilter === 'inactive' && !rule.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleToggleRule = (ruleId: string) => {
    Alert.alert(
      'Toggle Rule',
      'Are you sure you want to change the status of this billing rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Here you would update the rule status
            Alert.alert('Success', 'Billing rule status updated');
          }
        }
      ]
    );
  };

  const handleRunRule = (ruleId: string) => {
    Alert.alert(
      'Run Rule Now',
      'This will process all eligible invoices for this rule. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Run Now', 
          onPress: () => {
            // Here you would trigger the rule
            Alert.alert('Success', 'Billing rule is now processing...');
          }
        }
      ]
    );
  };

  const renderStatsCards = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Zap size={24} color={theme.colors.primary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {stats.activeRules}/{stats.totalRules}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Active Rules
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <FileText size={24} color='#4CAF50' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {stats.invoicesGenerated.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Invoices Generated
            </Text>
          </View>
        </Card>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <DollarSign size={24} color='#2196F3' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              ${stats.automationSavings.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Time Savings
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <TrendingUp size={24} color='#FF9800' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {stats.averageProcessingTime}s
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Avg Processing
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 16, marginBottom: 16 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['all', 'active', 'inactive'].map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            showSelectedCheck={false}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  const renderBillingRuleCard = (rule: BillingRule) => {
    const TriggerIcon = getTriggerTypeIcon(rule.triggerType);
    
    return (
      <Card key={rule.id} style={{ marginBottom: 12, marginHorizontal: 16 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Avatar.Icon
              size={40}
              icon={() => <TriggerIcon size={20} color="white" />}
              style={{ backgroundColor: getTriggerTypeColor(rule.triggerType) }}
            />
            
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16 }}>
                    {rule.name}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                    {rule.description}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Chip 
                      mode="outlined"
                      textStyle={{ fontSize: 10 }}
                      style={{ height: 20, marginRight: 8 }}
                    >
                      {rule.triggerType.replace('_', ' ').toUpperCase()}
                    </Chip>
                    <Chip 
                      mode="outlined"
                      textStyle={{ fontSize: 10 }}
                      style={{ height: 20 }}
                    >
                      {rule.billingCycle.toUpperCase()}
                    </Chip>
                  </View>
                </View>
                
                <Switch
                  value={rule.isActive}
                  onValueChange={() => handleToggleRule(rule.id)}
                />
              </View>
              
              <Divider style={{ marginVertical: 12 }} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    Total Invoices
                  </Text>
                  <Text style={{ fontWeight: '600' }}>
                    {rule.totalInvoices.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    Total Amount
                  </Text>
                  <Text style={{ fontWeight: '600' }}>
                    ${rule.totalAmount.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    Last Run
                  </Text>
                  <Text style={{ fontWeight: '600' }}>
                    {rule.lastRun ? new Date(rule.lastRun).toLocaleDateString() : 'Never'}
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    mode="outlined"
                    compact
                    icon={() => <Edit size={16} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Edit Rule', 'Edit billing rule functionality')}
                  >
                    Edit
                  </Button>
                  {rule.isActive && (
                    <Button
                      mode="outlined"
                      compact
                      icon={() => <Play size={16} color={theme.colors.primary} />}
                      onPress={() => handleRunRule(rule.id)}
                    >
                      Run Now
                    </Button>
                  )}
                </View>
                
                <IconButton
                  icon={() => <Trash size={16} color={theme.colors.error} />}
                  onPress={() => Alert.alert('Delete Rule', 'Delete billing rule functionality')}
                />
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderRecentActivity = () => (
    <Card style={{ margin: 16 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Recent Activity
        </Text>
        
        {recentActivity.map((activity, index) => {
          const ActivityIcon = getActivityIcon(activity.type);
          return (
            <View key={activity.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIcon 
                  size={16} 
                  color={getActivityColor(activity.status)}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14 }}>
                    {activity.description}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                </View>
                {activity.amount && (
                  <Text style={{ 
                    fontWeight: '600',
                    color: theme.colors.primary
                  }}>
                    ${activity.amount.toFixed(2)}
                  </Text>
                )}
              </View>
              {index < recentActivity.length - 1 && (
                <Divider style={{ marginVertical: 8 }} />
              )}
            </View>
          );
        })}
        
        <Button
          mode="text"
          onPress={() => Alert.alert('View All', 'View all activity functionality')}
          style={{ marginTop: 8 }}
        >
          View All Activity
        </Button>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'Automated Billing',
          headerShown: true,
          headerTitleAlign: 'center',
          headerRight: () => (
            <IconButton
              icon={() => <Plus size={24} color={theme.colors.primary} />}
              onPress={() => Alert.alert('New Rule', 'Create new billing rule functionality')}
            />
          )
        }} 
      />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCards()}
        
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search billing rules..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

        {renderFilterChips()}

        <View style={{ flex: 1 }}>
          {filteredRules.length > 0 ? (
            filteredRules.map(renderBillingRuleCard)
          ) : (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 32
            }}>
              <Zap size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                marginTop: 16,
                color: theme.colors.onSurfaceVariant
              }}>
                No billing rules found
              </Text>
              <Text style={{ 
                textAlign: 'center', 
                marginTop: 8,
                color: theme.colors.onSurfaceVariant
              }}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Create your first automated billing rule'
                }
              </Text>
            </View>
          )}
        </View>

        {renderRecentActivity()}

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AutomatedBillingScreen;
