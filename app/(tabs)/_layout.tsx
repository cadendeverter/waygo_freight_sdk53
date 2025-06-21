import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../state/authContext';
import { Platform } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();
  const { user } = useAuth();

  // Check if user has access to feature based on role
  const hasAccess = (feature: string) => {
    if (!user) return false;
    
    // Developer credentials have access to everything
    if (user.isDevAdmin) return true;
    
    // Role-based access control
    switch (user.appRole) {
      case 'admin':
        return true; // Admins have access to all features
      case 'driver':
        return ['home', 'shipments', 'features', 'map', 'profile'].includes(feature);
      case 'customer':
        return ['home', 'shipments', 'features', 'map', 'profile'].includes(feature);
      default:
        return ['home', 'shipments', 'features', 'map', 'profile'].includes(feature);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
          href: hasAccess('home') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="shipments"
        options={{
          title: 'Shipments',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="truck-delivery" size={size} color={color} />
          ),
          href: hasAccess('shipments') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: 'All Features',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="apps" size={size} color={color} />
          ),
          href: hasAccess('features') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
          href: hasAccess('map') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
          href: hasAccess('profile') ? undefined : null,
        }}
      />
    </Tabs>
  );
}
