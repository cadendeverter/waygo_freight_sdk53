import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Card, Chip } from 'react-native-paper';
import { useAuth } from '../../state/authContext';
import { useRouter } from 'expo-router';
import { DEV_CREDENTIALS } from '../../config/environment';
import { Truck } from '../../utils/icons';

export default function LoginScreen() {
  const theme = useTheme();
  const { login, loginDev, isDevMode } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if this is a dev login attempt
  const isDevLogin = email === 'cadendeverter' || email === 'cadendeverter@waygofreight.dev';
  const devRole = email === 'cadendeverter' ? 'cadendeverter' : null;

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Handle dev login
      if (isDevLogin && devRole && password === DEV_CREDENTIALS[devRole]?.password) {
        console.log('🚀 Dev admin login detected - full permissions enabled');
        await loginDev(devRole as keyof typeof DEV_CREDENTIALS);
        router.replace('/(tabs)');
        return;
      }
      
      // Handle regular login
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Truck size={32} color="#FFFFFF" />
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            WayGo Freight
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Logistics Management Platform
          </Text>
        </View>

        {/* Login Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={5}>
          <Card.Content style={styles.cardContent}>
            {isDevMode && (
              <Chip 
                style={[styles.devChip, { backgroundColor: `${theme.colors.primary}20` }]}
                textStyle={{ color: theme.colors.primary }}
                icon={() => <Text style={{ color: theme.colors.primary }}>🚀</Text>}
              >
                Development Mode
              </Chip>
            )}

            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              left={<TextInput.Icon icon="email" />}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              left={<TextInput.Icon icon="lock" />}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !email || !password}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Forgot Password Link */}
            <Button
              mode="text"
              onPress={() => Alert.alert('Password Reset', 'Contact your administrator for password reset assistance.')}
              style={styles.forgotButton}
              labelStyle={{ color: theme.colors.primary }}
            >
              Forgot Password?
            </Button>
            
            {isDevMode && !isDevLogin && (
              <Text variant="bodySmall" style={[styles.devHint, { color: theme.colors.onSurfaceVariant }]}>
                💡 Dev Mode Active - Use "cadendeverter" for admin testing
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            &copy; {new Date().getFullYear()} WayGo Freight. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  card: {
    padding: 20,
  },
  cardContent: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginTop: 8,
  },
  devChip: {
    marginBottom: 16,
  },
  devHint: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  footerText: {
    textAlign: 'center',
  },
});
