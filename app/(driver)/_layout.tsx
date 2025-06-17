import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DriverLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'DRIVER') {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="hos" options={{ title: 'HOS' }} />
      <Tabs.Screen name="dvir" options={{ title: 'DVIR' }} />
      <Tabs.Screen name="fuel-log" options={{ title: 'Fuel Log' }} />
      <Tabs.Screen name="compliance" options={{ title: 'Compliance' }} />
      <Tabs.Screen name="vehicle" options={{ title: 'Vehicle' }} />
    </Tabs>
  );
}
