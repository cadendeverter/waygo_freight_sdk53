import { Tabs } from 'expo-router';
import { useTheme, Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'index':
              return <MaterialCommunityIcons name="home" size={size} color={color} />;
            case 'shipments':
              return <MaterialCommunityIcons name="truck-delivery" size={size} color={color} />;
            case 'messages':
              return <MaterialIcons name="message" size={size} color={color} />;
            case 'profile':
              return <MaterialIcons name="person" size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    />
  );
}
