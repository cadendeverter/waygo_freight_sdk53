import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WarehouseLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'WAREHOUSE') {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="inventory" options={{ title: 'Inventory' }} />
      <Tabs.Screen name="shipping" options={{ title: 'Shipping' }} />
    </Tabs>
  );
}
