// waygo-freight/app/(admin)/_layout.tsx
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuth } from '../../state/authContext';
import { Users, Truck, FileBadge, BarChart3, Settings } from '../../utils/icons';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'ADMIN_FREIGHT') return <Redirect href="/auth/login" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#1F2937', 
        tabBarInactiveTintColor: '#6B7280', 
        tabBarStyle: { 
          backgroundColor: '#FFFFFF', 
          borderTopColor: '#E5E7EB', 
          height: Platform.OS === 'android' ? 70 : 90, 
          paddingBottom: Platform.OS === 'android' ? 5 : 25, 
          paddingTop: Platform.OS === 'android' ? 0 : 5 
        },
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: '500', 
          marginTop: -2, 
          marginBottom: 5 
        },
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size * 0.95 : size * 0.85; 
          if (route.name === 'users/index') return <Users size={iconSize} color={color} />;
          if (route.name === 'fleet/index') return <Truck size={iconSize} color={color} />;
          if (route.name === 'compliance/index') return <FileBadge size={iconSize} color={color} />;
          if (route.name === 'reports/index') return <BarChart3 size={iconSize} color={color} />;
          if (route.name === 'system-config/index') return <Settings size={iconSize} color={color} />;
          return null;
        },
      })}
    >
      <Tabs.Screen name="users/index" options={{ title: 'Users' }} />
      <Tabs.Screen name="fleet/index" options={{ title: 'Fleet' }} />
      <Tabs.Screen name="compliance/index" options={{ title: 'Compliance' }} />
      <Tabs.Screen name="reports/index" options={{ title: 'Reports' }} />
      <Tabs.Screen name="system-config/index" options={{ title: 'Settings' }} />
      
      {/* Screens not in tabs but part of this group */}
      <Tabs.Screen name="users/[userId]" options={{ href: null }} />
      <Tabs.Screen name="fleet/[vehicleId]" options={{ href: null }} />
      <Tabs.Screen name="fleet/new" options={{ href: null }} />
      <Tabs.Screen name="compliance/[driverId]" options={{ href: null }} />
      <Tabs.Screen name="analytics/fleet" options={{ href: null }} />
      <Tabs.Screen name="expenses/index" options={{ href: null }} />
      <Tabs.Screen name="expenses/[expenseId]" options={{ href: null }} />
      <Tabs.Screen name="billing/audit" options={{ href: null }} />
      <Tabs.Screen name="settlements/index" options={{ href: null }} />
      <Tabs.Screen name="settlements/[settlementId]" options={{ href: null }} />
      <Tabs.Screen name="system-config/geofences" options={{ href: null }} />
      <Tabs.Screen name="system-config/notifications" options={{ href: null }} />
    </Tabs>
  );
}
