// waygo-freight/app/(admin)/_layout.tsx
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'admin') return <Redirect href="/auth/login" />;

  return (
    <Stack>
      <Stack.Screen name="users/index" options={{ title: 'Users', headerShown: false }} />
      <Stack.Screen name="fleet/index" options={{ title: 'Fleet', headerShown: false }} />
      <Stack.Screen name="compliance/index" options={{ title: 'Compliance', headerShown: false }} />
      <Stack.Screen name="reports/index" options={{ title: 'Reports', headerShown: false }} />
      <Stack.Screen name="system-config/index" options={{ title: 'Settings', headerShown: false }} />
      
      {/* Screens not in tabs but part of this group */}
      <Stack.Screen name="users/[userId]" options={{ title: 'User Details', headerShown: false }} />
      <Stack.Screen name="fleet/[vehicleId]" options={{ title: 'Vehicle Details', headerShown: false }} />
      <Stack.Screen name="fleet/vehicles/create" options={{ title: 'Add Vehicle', headerShown: false }} />
      <Stack.Screen name="compliance/[driverId]" options={{ title: 'Driver Compliance', headerShown: false }} />
      <Stack.Screen name="analytics/fleet" options={{ title: 'Fleet Analytics', headerShown: false }} />
      <Stack.Screen name="expenses/index" options={{ title: 'Expenses', headerShown: false }} />
      <Stack.Screen name="expenses/[expenseId]" options={{ title: 'Expense Details', headerShown: false }} />
      <Stack.Screen name="billing/audit" options={{ title: 'Billing Audit', headerShown: false }} />
      <Stack.Screen name="settlements/index" options={{ title: 'Settlements', headerShown: false }} />
      <Stack.Screen name="settlements/[settlementId]" options={{ title: 'Settlement Details', headerShown: false }} />
      <Stack.Screen name="system-config/geofences" options={{ title: 'Geofences', headerShown: false }} />
      <Stack.Screen name="system-config/notifications" options={{ title: 'Notifications', headerShown: false }} />
    </Stack>
  );
}
