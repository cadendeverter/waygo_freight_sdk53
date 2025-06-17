import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { useAuth } from '../../state/authContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={styles.title}>
        Profile
      </Text>
      {user && (
        <View style={styles.userInfo}>
          <Text variant="bodyLarge" style={styles.userText}>
            Email: {user.email}
          </Text>
          <Text variant="bodyLarge" style={styles.userText}>
            Role: {user.appRole || 'User'}
          </Text>
        </View>
      )}
      <Button
        mode="outlined"
        onPress={logout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  userText: {
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 20,
  },
});
