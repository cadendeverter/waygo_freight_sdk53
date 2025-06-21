import React from 'react';
import { ScrollView, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../state/authContext';
import { useQuickAccess } from '../../state/quickAccessContext';
import { useTheme } from '../../theme/ThemeContext';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  DollarSign, 
  User, 
  Settings, 
  FileText,
  BarChart,
  Shield,
  Archive,
  Users,
  Building2,
  Calculator,
  Globe,
  Database,
  Key,
  Bell
} from '../../utils/icons';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  roles: string[];
  category: string;
  status?: 'active' | 'beta' | 'coming-soon';
}

const FEATURE_CATEGORIES = [
  {
    id: 'fleet',
    title: 'Fleet Management',
    description: 'Complete vehicle and driver management',
    features: [
      {
        id: 'fleet-overview',
        title: 'Fleet Overview',
        description: 'Real-time fleet status and vehicle tracking',
        icon: Truck,
        route: '/(admin)/fleet',
        roles: ['admin', 'dispatcher'],
        category: 'fleet',
        status: 'active' as const
      },
      {
        id: 'vehicle-maintenance',
        title: 'Vehicle Maintenance',
        description: 'Maintenance schedules and inspection records',
        icon: Settings,
        route: '/(admin)/fleet/maintenance',
        roles: ['admin', 'dispatcher', 'driver'],
        category: 'fleet',
        status: 'active' as const
      },
      {
        id: 'driver-management',
        title: 'Driver Management',
        description: 'Driver profiles, licenses, and performance',
        icon: User,
        route: '/(admin)/drivers',
        roles: ['admin'],
        category: 'fleet',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations & Dispatch',
    description: 'Load planning and route optimization',
    features: [
      {
        id: 'dispatch-board',
        title: 'Dispatch Board',
        description: 'Load assignment and route planning',
        icon: MapPin,
        route: '/(admin)/operations/dispatch',
        roles: ['admin', 'dispatcher'],
        category: 'operations',
        status: 'active' as const
      },
      {
        id: 'load-management',
        title: 'Load Management',
        description: 'Create and manage freight loads',
        icon: Package,
        route: '/(admin)/loads',
        roles: ['admin', 'dispatcher'],
        category: 'operations',
        status: 'active' as const
      },
      {
        id: 'route-optimization',
        title: 'Route Optimization',
        description: 'AI-powered route planning and optimization',
        icon: Globe,
        route: '/(admin)/analytics/route-optimization',
        roles: ['admin', 'dispatcher'],
        category: 'operations',
        status: 'beta' as const
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Safety',
    description: 'Regulatory compliance and safety management',
    features: [
      {
        id: 'hos-tracking',
        title: 'Hours of Service',
        description: 'Driver HOS tracking and ELD compliance',
        icon: Clock,
        route: '/(admin)/compliance/hours-of-service',
        roles: ['admin', 'driver'],
        category: 'compliance',
        status: 'active' as const
      },
      {
        id: 'dvir',
        title: 'DVIR & Inspections',
        description: 'Daily vehicle inspection reports',
        icon: Shield,
        route: '/(admin)/fleet/inspections',
        roles: ['admin', 'driver'],
        category: 'compliance',
        status: 'active' as const
      },
      {
        id: 'compliance-docs',
        title: 'Compliance Documents',
        description: 'Manage safety documentation and certifications',
        icon: FileText,
        route: '/(admin)/compliance',
        roles: ['admin'],
        category: 'compliance',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'warehouse',
    title: 'Warehouse & Inventory',
    description: 'Inventory management and warehouse operations',
    features: [
      {
        id: 'warehouse-management',
        title: 'Warehouse Operations',
        description: 'Manage warehouse activities and staff',
        icon: Building2,
        route: '/(admin)/warehouse',
        roles: ['admin', 'warehouse'],
        category: 'warehouse',
        status: 'active' as const
      },
      {
        id: 'inventory-tracking',
        title: 'Inventory Tracking',
        description: 'Real-time inventory tracking and management',
        icon: Archive,
        route: '/(admin)/warehouse/inventory',
        roles: ['admin', 'warehouse'],
        category: 'warehouse',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finance & Billing',
    description: 'Financial management and billing operations',
    features: [
      {
        id: 'billing-invoices',
        title: 'Billing & Invoices',
        description: 'Generate and manage customer invoices',
        icon: DollarSign,
        route: '/(admin)/billing',
        roles: ['admin'],
        category: 'finance',
        status: 'active' as const
      },
      {
        id: 'expense-tracking',
        title: 'Expense Tracking',
        description: 'Track and categorize business expenses',
        icon: Calculator,
        route: '/(admin)/billing/expenses',
        roles: ['admin'],
        category: 'finance',
        status: 'active' as const
      },
      {
        id: 'financial-reports',
        title: 'Financial Reports',
        description: 'P&L, cash flow, and financial analytics',
        icon: BarChart,
        route: '/(admin)/reports',
        roles: ['admin'],
        category: 'finance',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'customer',
    title: 'Customer Portal',
    description: 'Customer-facing features and self-service',
    features: [
      {
        id: 'customer-portal',
        title: 'Customer Portal',
        description: 'Customer dashboard and self-service features',
        icon: Users,
        route: '/(customer)/portal',
        roles: ['customer'],
        category: 'customer',
        status: 'active' as const
      },
      {
        id: 'shipment-tracking',
        title: 'Shipment Tracking',
        description: 'Real-time shipment tracking for customers',
        icon: MapPin,
        route: '/(customer)/tracking',
        roles: ['customer'],
        category: 'customer',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    description: 'Business intelligence and performance analytics',
    features: [
      {
        id: 'analytics-dashboard',
        title: 'Analytics Dashboard',
        description: 'KPI tracking and business intelligence',
        icon: BarChart,
        route: '/(admin)/analytics',
        roles: ['admin'],
        category: 'analytics',
        status: 'active' as const
      },
      {
        id: 'financial-analytics',
        title: 'Financial Analytics',
        description: 'Revenue analysis and financial insights',
        icon: DollarSign,
        route: '/(admin)/analytics/financial',
        roles: ['admin'],
        category: 'analytics',
        status: 'active' as const
      },
      {
        id: 'custom-reports',
        title: 'Custom Reports',
        description: 'Generate custom business reports',
        icon: FileText,
        route: '/(admin)/reports',
        roles: ['admin'],
        category: 'analytics',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'admin',
    title: 'Admin & Settings',
    description: 'System administration and configuration',
    features: [
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Manage users, roles, and permissions',
        icon: Users,
        route: '/(admin)/users',
        roles: ['admin'],
        category: 'admin',
        status: 'active' as const
      },
      {
        id: 'system-settings',
        title: 'System Settings',
        description: 'Configure system preferences and settings',
        icon: Settings,
        route: '/(admin)/system/settings',
        roles: ['admin'],
        category: 'admin',
        status: 'active' as const
      },
      {
        id: 'integrations',
        title: 'Integrations',
        description: 'Third-party integrations and API management',
        icon: Globe,
        route: '/(admin)/integrations',
        roles: ['admin'],
        category: 'admin',
        status: 'active' as const
      }
    ]
  }
];

export default function FeaturesScreen() {
  const { user } = useAuth();
  const { addTileToQuickAccess, quickTiles } = useQuickAccess();
  const theme = useTheme();
  const router = useRouter();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'beta':
        return theme.colors.secondary;
      case 'coming-soon':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.primary;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'beta':
        return 'BETA';
      case 'coming-soon':
        return 'SOON';
      default:
        return '';
    }
  };

  const hasAccess = (feature: FeatureCard) => {
    if (!user?.appRole) return false;
    
    // Dev admins have access to ALL features for testing
    if (user.isDevAdmin && user.appRole === 'admin') {
      return true;
    }
    
    // Regular admin access
    if (user.appRole === 'admin') {
      return true;
    }
    
    // Role-based access for other users
    return feature.roles.includes(user.appRole);
  };

  const isFeatureInDashboard = (featureId: string) => {
    return quickTiles.some(tile => tile.id === featureId);
  };

  const handleAddToDashboard = (feature: FeatureCard) => {
    if (isFeatureInDashboard(feature.id)) {
      console.log('Feature already in dashboard:', feature.title);
      return;
    }
    
    try {
      addTileToQuickAccess(feature.id);
      console.log('Added to dashboard:', feature.title);
      // You could add a toast notification here if desired
    } catch (error) {
      console.error('Error adding to dashboard:', error);
    }
  };

  const handleFeaturePress = (feature: FeatureCard) => {
    try {
      console.log('Navigating to feature:', feature.title, 'Route:', feature.route);
      router.push(feature.route);
    } catch (error) {
      console.error('Navigation error for feature:', feature.title, error);
      // Fallback routing for problematic routes
      if (feature.id === 'dispatch-board') {
        router.push('/(admin)/operations/dispatch');
      } else if (feature.id === 'route-optimization') {
        router.push('/(admin)/analytics/route-optimization');
      } else {
        console.log('Failed to navigate to:', feature.route);
      }
    }
  };

  const renderFeatureCard = (feature: FeatureCard) => {
    const IconComponent = feature.icon;
    const accessible = hasAccess(feature);
    const alreadyInDashboard = isFeatureInDashboard(feature.id);

    return (
      <Card 
        key={feature.id} 
        style={[
          { marginBottom: 12 },
          !accessible && { opacity: 0.5 }
        ]}
      >
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ 
              backgroundColor: theme.colors.primaryContainer, 
              padding: 8, 
              borderRadius: 8,
              marginRight: 12
            }}>
              <IconComponent size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>
                  {feature.title}
                </Text>
                {feature.status && feature.status !== 'active' && (
                  <Chip 
                    mode="outlined" 
                    textStyle={{ 
                      color: getStatusColor(feature.status), 
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}
                    style={{ height: 24 }}
                  >
                    {getStatusText(feature.status)}
                  </Chip>
                )}
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                {feature.description}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.secondary, fontSize: 10 }}>
                Access: {feature.roles.join(', ')}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <Button 
              mode="contained" 
              onPress={() => handleFeaturePress(feature)}
              disabled={!accessible || feature.status === 'coming-soon'}
              style={{ flex: 1 }}
            >
              Open Feature
            </Button>
            {accessible && feature.status !== 'coming-soon' && (
              <Button 
                mode={alreadyInDashboard ? "outlined" : "outlined"} 
                onPress={() => handleAddToDashboard(feature)}
                disabled={alreadyInDashboard}
                style={{ flex: 1 }}
                compact
              >
                {alreadyInDashboard ? 'In Dashboard' : 'Add to Dashboard'}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderCategory = (category: any) => (
    <View key={category.id} style={{ marginBottom: 24 }}>
      <View style={{ marginBottom: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
          {category.title}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {category.description}
        </Text>
      </View>
      {category.features.map(renderFeatureCard)}
    </View>
  );

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'All Features' }} />
      
      <View style={{ padding: 16 }}>
        <Text variant="headlineLarge" style={{ marginBottom: 8, fontWeight: 'bold' }}>
          WayGo Freight Features
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
          Comprehensive logistics and fleet management platform
        </Text>

        {user?.appRole && (
          <Card style={{ marginBottom: 24, backgroundColor: theme.colors.primaryContainer }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={20} color={theme.colors.primary} />
                <Text variant="titleSmall" style={{ marginLeft: 8, color: theme.colors.primary, fontWeight: 'bold' }}>
                  Logged in as: {user.appRole.toUpperCase()}
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Features are filtered based on your role and permissions
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {FEATURE_CATEGORIES.map(renderCategory)}
        
        <View style={{ paddingBottom: 32 }}>
          <Card style={{ backgroundColor: theme.colors.surfaceVariant }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Bell size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleSmall" style={{ marginLeft: 8, fontWeight: 'bold' }}>
                  Feature Updates
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                New features and improvements are regularly added. Check back often for updates!
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
