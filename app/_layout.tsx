import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../state/authContext';
import { AppThemeProvider } from '../theme/ThemeContext';
// import { FleetProvider } from '../state/fleetContext';
// import { FleetTrackingProvider } from '../state/fleetTrackingContext';
import { LoadProvider } from '../state/loadContext';
import { ComplianceProvider } from '../state/complianceContext';
import { WarehouseProvider } from '../state/warehouseContext';
import { QuickAccessProvider } from '../state/quickAccessContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppThemeProvider>
            {/* <FleetProvider>
              <FleetTrackingProvider> */}
                <LoadProvider>
                  <ComplianceProvider>
                    <WarehouseProvider>
                      <QuickAccessProvider>
                        <Stack>
                          <Stack.Screen name="debug" options={{ headerShown: false }} />
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                          <Stack.Screen name="(driver)" options={{ headerShown: false }} />
                          <Stack.Screen name="(dispatcher)" options={{ headerShown: false }} />
                          <Stack.Screen name="(warehouse)" options={{ headerShown: false }} />
                          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
                        </Stack>
                      </QuickAccessProvider>
                    </WarehouseProvider>
                  </ComplianceProvider>
                </LoadProvider>
              {/* </FleetTrackingProvider>
            </FleetProvider> */}
          </AppThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
