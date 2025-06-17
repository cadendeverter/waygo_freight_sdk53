import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DispatcherLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'DISPATCHER') {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="loads" options={{ title: 'Loads' }} />
      <Tabs.Screen name="drivers" options={{ title: 'Drivers' }} />
    </Tabs>
  );
}
