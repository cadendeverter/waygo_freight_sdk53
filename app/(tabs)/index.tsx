import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Welcome to WayGo Freight
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Your shipments at a glance
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <Card style={styles.card} onPress={() => router.push('/shipments')}>
          <Card.Content>
            <Text variant="titleLarge">Active Shipments</Text>
            <Text variant="headlineLarge" style={styles.cardNumber}>3</Text>
            <Text variant="bodyMedium">View all shipments</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => router.push('/shipments?status=pending')}>
          <Card.Content>
            <Text variant="titleLarge">Pending</Text>
            <Text variant="headlineLarge" style={styles.cardNumber}>2</Text>
            <Text variant="bodyMedium">Awaiting pickup</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actions}>
        <Button 
          mode="contained" 
          onPress={() => router.push('/shipments/new')}
          style={styles.actionButton}
          icon="plus"
        >
          New Shipment
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => router.push('/scan')}
          style={styles.actionButton}
          icon="barcode-scan"
        >
          Scan Barcode
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    marginBottom: 16,
    elevation: 2,
  },
  cardNumber: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  actions: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
});
