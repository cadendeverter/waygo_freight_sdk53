// waygo-freight/app/(admin)/integrations/load-boards.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, IconButton, Surface, 
  Dialog, Portal, TextInput, Switch, List, Badge, FAB,
  ProgressBar, Searchbar, Menu, ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Search, 
  Filter, 
  Bookmark, 
  Plus, 
  Download,
  Zap, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Settings, 
  RefreshCw, 
  Eye, 
  Phone,
  iconSource
} from '../../../utils/icons';

interface LoadBoardListing {
  id: string;
  boardSource: 'DAT' | 'TRUCKSTOP' | 'LOADLINK' | 'CH_ROBINSON' | 'CONVOY';
  loadNumber: string;
  commodity: string;
  equipment: string;
  weight: number;
  distance: number;
  origin: LoadLocation;
  destination: LoadLocation;
  pickupDate: Date;
  deliveryDate: Date;
  rate: number;
  rateType: 'FLAT' | 'PER_MILE';
  brokerInfo: BrokerInfo;
  requirements: string[];
  hazmat: boolean;
  team: boolean;
  postedAt: Date;
  expiresAt: Date;
  contacted: boolean;
  bookmarked: boolean;
  status: 'AVAILABLE' | 'PENDING' | 'BOOKED' | 'EXPIRED';
}

interface LoadLocation {
  city: string;
  state: string;
  zip: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface BrokerInfo {
  name: string;
  mcNumber: string;
  rating: number;
  phone: string;
  email: string;
  creditScore: 'A' | 'B' | 'C' | 'D' | 'F';
  paymentTerms: string;
}

const LoadBoardIntegration: React.FC = () => {
  const theme = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [maxRadius, setMaxRadius] = useState(250);
  const [minRate, setMinRate] = useState(1.50);
  
  const [loadListings, setLoadListings] = useState<LoadBoardListing[]>([
    {
      id: 'load_1',
      boardSource: 'DAT',
      loadNumber: 'DAT-789456',
      commodity: 'General Freight',
      equipment: 'Van - 53ft',
      weight: 42000,
      distance: 487,
      origin: {
        city: 'Atlanta',
        state: 'GA',
        zip: '30309',
        coordinates: { lat: 33.7490, lng: -84.3880 }
      },
      destination: {
        city: 'Nashville',
        state: 'TN', 
        zip: '37203',
        coordinates: { lat: 36.1627, lng: -86.7816 }
      },
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      rate: 1247.50,
      rateType: 'FLAT',
      brokerInfo: {
        name: 'Freight Solutions LLC',
        mcNumber: 'MC-123456',
        rating: 4.2,
        phone: '(555) 123-4567',
        email: 'dispatch@freightsolutions.com',
        creditScore: 'A',
        paymentTerms: 'Net 30'
      },
      requirements: ['TWIC Card', 'Clean MVR'],
      hazmat: false,
      team: false,
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
      contacted: false,
      bookmarked: false,
      status: 'AVAILABLE'
    },
    {
      id: 'load_2',
      boardSource: 'TRUCKSTOP',
      loadNumber: 'TS-654321',
      commodity: 'Steel Coils',
      equipment: 'Flatbed - 48ft',
      weight: 47500,
      distance: 892,
      origin: {
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        coordinates: { lat: 29.7604, lng: -95.3698 }
      },
      destination: {
        city: 'Detroit',
        state: 'MI',
        zip: '48201',
        coordinates: { lat: 42.3314, lng: -83.0458 }
      },
      pickupDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 96 * 60 * 60 * 1000),
      rate: 2.85,
      rateType: 'PER_MILE',
      brokerInfo: {
        name: 'Steel Transport Co',
        mcNumber: 'MC-789012',
        rating: 3.8,
        phone: '(555) 987-6543',
        email: 'loads@steeltransport.com',
        creditScore: 'B',
        paymentTerms: 'Net 15'
      },
      requirements: ['Flatbed Experience', 'Tarps/Chains'],
      hazmat: false,
      team: true,
      postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
      contacted: true,
      bookmarked: true,
      status: 'PENDING'
    }
  ]);

  const loadBoards = [
    { id: 'ALL', name: 'All Boards', active: true },
    { id: 'DAT', name: 'DAT Load Board', active: true },
    { id: 'TRUCKSTOP', name: 'Truckstop.com', active: true },
    { id: 'LOADLINK', name: 'LoadLink', active: false },
    { id: 'CH_ROBINSON', name: 'C.H. Robinson', active: true },
    { id: 'CONVOY', name: 'Convoy', active: false }
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const toggleBookmark = (loadId: string) => {
    setLoadListings(prev => prev.map(load => 
      load.id === loadId ? { ...load, bookmarked: !load.bookmarked } : load
    ));
  };

  const contactBroker = (load: LoadBoardListing) => {
    Alert.alert(
      'Contact Broker',
      `Contact ${load.brokerInfo.name} for load ${load.loadNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          setLoadListings(prev => prev.map(l => 
            l.id === load.id ? { ...l, contacted: true } : l
          ));
        }},
        { text: 'Email', onPress: () => {
          setLoadListings(prev => prev.map(l => 
            l.id === load.id ? { ...l, contacted: true } : l
          ));
        }}
      ]
    );
  };

  const bookLoad = (load: LoadBoardListing) => {
    Alert.alert(
      'Book Load',
      `Book load ${load.loadNumber} for $${load.rateType === 'FLAT' ? load.rate.toFixed(2) : (load.rate * load.distance).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Load', onPress: () => {
          setLoadListings(prev => prev.map(l => 
            l.id === load.id ? { ...l, status: 'BOOKED' } : l
          ));
          Alert.alert('Success', 'Load booked successfully!');
        }}
      ]
    );
  };

  const filteredLoads = loadListings.filter(load => {
    const matchesSearch = load.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         load.destination.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBoard = selectedBoard === 'ALL' || load.boardSource === selectedBoard;
    const matchesRate = load.rateType === 'FLAT' ? 
                       (load.rate / load.distance) >= minRate : 
                       load.rate >= minRate;
    
    return matchesSearch && matchesBoard && matchesRate;
  });

  const renderLoadCard = (load: LoadBoardListing) => (
    <Card key={load.id} style={{ margin: 16, marginTop: 0 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Chip 
              compact 
              style={{ 
                backgroundColor: load.boardSource === 'DAT' ? '#e3f2fd' : 
                               load.boardSource === 'TRUCKSTOP' ? '#fff3e0' : '#f3e5f5'
              }}
            >
              {load.boardSource}
            </Chip>
            <Text variant="bodySmall" style={{ marginLeft: 8, opacity: 0.7 }}>
              {load.loadNumber}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton 
              icon={load.bookmarked ? iconSource(Bookmark) : 'bookmark-outline'}
              size={20}
              iconColor={load.bookmarked ? theme.colors.primary : theme.colors.onSurface}
              onPress={() => toggleBookmark(load.id)}
            />
            <Chip 
              compact
              style={{ 
                backgroundColor: load.status === 'AVAILABLE' ? '#4caf50' : 
                               load.status === 'PENDING' ? '#ff9800' : '#757575'
              }}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {load.status}
            </Chip>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Truck size={16} color={theme.colors.primary} />
          <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: 'bold' }}>
            {load.commodity}
          </Text>
          <Text variant="bodySmall" style={{ marginLeft: 8, opacity: 0.7 }}>
            • {load.equipment}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MapPin size={14} color="#4caf50" />
              <Text variant="bodyMedium" style={{ marginLeft: 6, fontWeight: 'bold' }}>
                {load.origin.city}, {load.origin.state}
              </Text>
            </View>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Pickup: {load.pickupDate.toLocaleDateString()}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              {load.distance} mi
            </Text>
            <View style={{ width: 40, height: 2, backgroundColor: theme.colors.primary, marginVertical: 4 }} />
          </View>
          
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MapPin size={14} color="#f44336" />
              <Text variant="bodyMedium" style={{ marginLeft: 6, fontWeight: 'bold' }}>
                {load.destination.city}, {load.destination.state}
              </Text>
            </View>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Deliver: {load.deliveryDate.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DollarSign size={16} color={theme.colors.primary} />
              <Text variant="titleLarge" style={{ marginLeft: 4, fontWeight: 'bold', color: theme.colors.primary }}>
                ${load.rateType === 'FLAT' ? load.rate.toFixed(2) : (load.rate * load.distance).toFixed(2)}
              </Text>
            </View>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              ${load.rateType === 'PER_MILE' ? load.rate.toFixed(2) : (load.rate / load.distance).toFixed(2)}/mile
            </Text>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {load.brokerInfo.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ marginRight: 4 }}>
                Credit: {load.brokerInfo.creditScore}
              </Text>
              <Chip compact style={{ height: 20 }}>
                ★ {load.brokerInfo.rating}
              </Chip>
            </View>
          </View>
        </View>

        {load.requirements.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text variant="bodySmall" style={{ marginBottom: 4, opacity: 0.7 }}>
              Requirements:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {load.requirements.map((req, index) => (
                <Chip key={index} compact style={{ margin: 2 }}>
                  {req}
                </Chip>
              ))}
              {load.hazmat && <Chip compact style={{ margin: 2, backgroundColor: '#ff5722' }} textStyle={{ color: 'white' }}>HAZMAT</Chip>}
              {load.team && <Chip compact style={{ margin: 2, backgroundColor: '#2196f3' }} textStyle={{ color: 'white' }}>TEAM</Chip>}
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button 
            mode="outlined" 
            compact
            onPress={() => contactBroker(load)}
            disabled={load.contacted}
            icon={iconSource(load.contacted ? CheckCircle : Phone)}
          >
            {load.contacted ? 'Contacted' : 'Contact'}
          </Button>
          
          <Button 
            mode="contained" 
            compact
            onPress={() => bookLoad(load)}
            disabled={load.status !== 'AVAILABLE'}
          >
            Book Load
          </Button>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Posted: {load.postedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Expires: {load.expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
              Load Boards
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
              {filteredLoads.length} available loads
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon={iconSource(Search)} onPress={() => setFilterVisible(true)} />
            <IconButton icon={iconSource(Settings)} onPress={() => setSettingsVisible(true)} />
          </View>
        </View>
        
        <Searchbar
          placeholder="Search loads..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginTop: 12 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row' }}>
            {loadBoards.filter(board => board.active).map((board) => (
              <Chip
                key={board.id}
                selected={selectedBoard === board.id}
                onPress={() => setSelectedBoard(board.id)}
                style={{ marginRight: 8 }}
                mode={selectedBoard === board.id ? 'flat' : 'outlined'}
              >
                {board.name}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filteredLoads.map(renderLoadCard)}
      </ScrollView>

      <FAB
        icon={iconSource(RefreshCw)}
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={onRefresh}
        loading={refreshing}
      />

      <Portal>
        <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
          <Dialog.Title>Load Board Settings</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Auto Refresh"
              right={() => <Switch value={autoRefresh} onValueChange={setAutoRefresh} />}
            />
            <List.Item
              title="Search Radius"
              description={`${maxRadius} miles`}
            />
            <List.Item
              title="Minimum Rate"
              description={`$${minRate.toFixed(2)}/mile`}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default LoadBoardIntegration;
