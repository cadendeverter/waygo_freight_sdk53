import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Card } from 'react-native-paper';
import { useAuth } from '../../state/authContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setEmail('cadendeverter@waygo.com');
    setPassword('Longdongsilver00');
    try {
      setLoading(true);
      await login('cadendeverter@waygo.com', 'Longdongsilver00');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Dev login failed:', error);
      Alert.alert('Dev Login Failed', error.message || 'Dev credentials not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            WayGo Freight
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            All-in-One Trucking Platform
          </Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            mode="outlined"
          />
          
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
            disabled={!email || !password}
          >
            Login
          </Button>

          <Button
            mode="outlined"
            onPress={handleDevLogin}
            loading={loading}
            style={styles.devButton}
          >
            Dev Login (Test Account)
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  devButton: {
    marginTop: 12,
    paddingVertical: 4,
  },
});
