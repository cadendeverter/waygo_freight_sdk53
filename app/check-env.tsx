import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// Environment Variables Debug Screen
export default function CheckEnvScreen() {
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID', 
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];

  const optionalVars = [
    'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'EXPO_PUBLIC_API_URL'
  ];

  const checkVar = (varName: string) => {
    const value = process.env[varName];
    return {
      name: varName,
      isSet: !!value,
      preview: value ? `${value.substring(0, 20)}...` : 'NOT SET'
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Environment Variables Check</Text>
      
      <Text style={styles.sectionTitle}>🔥 Required Firebase Variables</Text>
      {requiredVars.map(varName => {
        const check = checkVar(varName);
        return (
          <View key={varName} style={styles.varRow}>
            <Text style={check.isSet ? styles.varNameGood : styles.varNameBad}>
              {check.name}
            </Text>
            <Text style={check.isSet ? styles.statusGood : styles.statusBad}>
              {check.isSet ? '✅' : '❌'} {check.preview}
            </Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>🔧 Optional Variables</Text>
      {optionalVars.map(varName => {
        const check = checkVar(varName);
        return (
          <View key={varName} style={styles.varRow}>
            <Text style={styles.varNameOptional}>
              {check.name}
            </Text>
            <Text style={check.isSet ? styles.statusGood : styles.statusOptional}>
              {check.isSet ? '✅' : '⚠️'} {check.preview}
            </Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>📋 Summary</Text>
      <Text style={styles.summary}>
        {requiredVars.every(v => !!process.env[v]) 
          ? '✅ All required variables are set!'
          : '❌ Some required variables are missing!'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  varRow: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  varNameGood: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 4,
  },
  varNameBad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 4,
  },
  varNameOptional: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f57c00',
    marginBottom: 4,
  },
  statusGood: {
    fontSize: 12,
    color: '#2e7d32',
    fontFamily: 'monospace',
  },
  statusBad: {
    fontSize: 12,
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  statusOptional: {
    fontSize: 12,
    color: '#f57c00',
    fontFamily: 'monospace',
  },
  summary: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 10,
  },
});
