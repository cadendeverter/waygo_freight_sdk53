import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DriverLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'driver') return <Redirect href="/auth/login" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dashboard', headerShown: false }} />
      <Stack.Screen name="hos" options={{ title: 'HOS', headerShown: false }} />
      <Stack.Screen name="dvir" options={{ title: 'DVIR', headerShown: false }} />
      <Stack.Screen name="fuel-log" options={{ title: 'Fuel Log', headerShown: false }} />
      <Stack.Screen name="compliance" options={{ title: 'Compliance', headerShown: false }} />
      <Stack.Screen name="vehicle" options={{ title: 'Vehicle', headerShown: false }} />
    </Stack>
  );
}
