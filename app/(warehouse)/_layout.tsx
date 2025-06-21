import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WarehouseLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'warehouse') return <Redirect href="/auth/login" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dashboard', headerShown: false }} />
      <Stack.Screen name="inventory" options={{ title: 'Inventory', headerShown: false }} />
      <Stack.Screen name="shipping" options={{ title: 'Shipping', headerShown: false }} />
    </Stack>
  );
}
