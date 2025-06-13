import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, useTheme, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

type Shipment = {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate?: string;
};

export default function ShipmentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch shipments from Firestore
  const fetchShipments = async () => {
    try {
      const shipmentsRef = collection(db, 'shipments');
      const q = query(shipmentsRef); // Add filters as needed
      const querySnapshot = await getDocs(q);
      
      const shipmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Shipment[];
      
      setShipments(shipmentsData);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchShipments();
  };

  const filteredShipments = shipments.filter(shipment => 
    shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return theme.colors.primary;
      case 'in_transit':
        return theme.colors.secondary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search shipments..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No shipments found</Text>
            <Button 
              mode="contained" 
              onPress={() => router.push('/shipments/new')}
              style={styles.emptyButton}
            >
              Create New Shipment
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <Card 
            style={styles.card}
            onPress={() => router.push(`/shipments/${item.id}`)}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">#{item.trackingNumber}</Text>
                <Text 
                  style={[
                    styles.statusBadge, 
                    { color: getStatusColor(item.status) }
                  ]}
                >
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
              
              <View style={styles.routeContainer}>
                <View style={styles.routeDot}>
                  <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                  <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />>
                </View>
                <View style={styles.routeText}>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {item.origin}
                  </Text>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {item.destination}
                  </Text>
                </View>
              </View>
              
              <View style={styles.datesContainer}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Pickup: {new Date(item.pickupDate).toLocaleDateString()}
                </Text>
                {item.deliveryDate && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      />
      
      <Button 
        mode="contained" 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/shipments/new')}
      >
        New Shipment
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyButton: {
    marginTop: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeDot: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 1,
    height: 32,
    marginVertical: 4,
  },
  routeText: {
    flex: 1,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
});
