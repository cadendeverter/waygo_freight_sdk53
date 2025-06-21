import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  Searchbar,
  ProgressBar,
  IconButton,
  Surface,
  Divider,
  FAB
} from 'react-native-paper';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  Clock, 
  Package, 
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  MessageSquare,
  Download,
  RefreshCw,
  Eye,
  Bell,
  FileText,
  Star,
  Route,
  Thermometer,
  Shield
} from '../../../utils/icons';
import { ConditionalMapView as MapView, ConditionalMarker as Marker } from '../../../components/MapView';
import { useLoad } from '../../../state/loadContext';
import { useAuth } from '../../../state/authContext';
import { router, useLocalSearchParams } from 'expo-router';

interface TrackingEvent {
  id: string;
  timestamp: Date;
  type: 'pickup_scheduled' | 'picked_up' | 'checkpoint' | 'delivered' | 'delay' | 'exception';
  location: string;
  description: string;
  coordinates?: { lat: number; lng: number };
  estimatedTime?: Date;
  actualTime?: Date;
}

interface ShipmentDocument {
  id: string;
  type: 'BOL' | 'POD' | 'INVOICE' | 'RECEIPT' | 'PHOTO' | 'MANIFEST';
  name: string;
  uploadedAt: Date;
  size: string;
  status: 'available' | 'pending' | 'expired';
}

export default function CustomerTrackingScreen() {
  const theme = useTheme();
  const { loads, loading } = useLoad();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'map' | 'timeline' | 'documents'>('map');
  const [selectedShipment, setSelectedShipment] = useState<string | null>(id as string || null);

  // Filter loads for customer view
  const customerLoads = loads.filter(load => 
    searchQuery === '' || 
    load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLoad = selectedShipment ? loads.find(load => load.id === selectedShipment) : null;

  const getTrackingEvents = (load: any): TrackingEvent[] => {
    const events: TrackingEvent[] = [];
    
    // Pickup scheduled
    events.push({
      id: '1',
      timestamp: new Date(load.pickupDate || Date.now() - 24 * 60 * 60 * 1000),
      type: 'pickup_scheduled',
      location: `${load.origin.facility.address.city}, ${load.origin.facility.address.state}`,
      description: 'Pickup scheduled and driver assigned',
      coordinates: { lat: load.origin.facility.address.latitude || 0, lng: load.origin.facility.address.longitude || 0 },
      estimatedTime: new Date(load.pickupDate || Date.now() - 24 * 60 * 60 * 1000)
    });

    // Picked up (if applicable)
    if (load.status !== 'pending') {
      events.push({
        id: '2',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
        type: 'picked_up',
        location: `${load.origin.facility.address.city}, ${load.origin.facility.address.state}`,
        description: 'Freight picked up and secured',
        coordinates: { lat: load.origin.facility.address.latitude || 0, lng: load.origin.facility.address.longitude || 0 },
        actualTime: new Date(Date.now() - 18 * 60 * 60 * 1000)
      });
    }

    // In transit checkpoints
    if (['in_transit', 'delivered'].includes(load.status)) {
      events.push({
        id: '3',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        type: 'checkpoint',
        location: 'Indianapolis, IN',
        description: 'Passed checkpoint - on schedule',
        coordinates: { lat: 39.7684, lng: -86.1581 },
        actualTime: new Date(Date.now() - 12 * 60 * 60 * 1000)
      });

      events.push({
        id: '4',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        type: 'checkpoint',
        location: 'Louisville, KY',
        description: 'Rest break completed - continuing route',
        coordinates: { lat: 38.2527, lng: -85.7585 },
        actualTime: new Date(Date.now() - 6 * 60 * 60 * 1000)
      });
    }

    // Delivered (if applicable)
    if (load.status === 'delivered') {
      events.push({
        id: '5',
        timestamp: new Date(load.deliveryDate || Date.now()),
        type: 'delivered',
        location: `${load.destination.facility.address.city}, ${load.destination.facility.address.state}`,
        description: 'Delivered successfully - POD signed',
        coordinates: { lat: load.destination.facility.address.latitude || 0, lng: load.destination.facility.address.longitude || 0 },
        actualTime: new Date(load.deliveryDate || Date.now())
      });
    }

    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getShipmentDocuments = (load: any): ShipmentDocument[] => {
    const docs: ShipmentDocument[] = [
      {
        id: '1',
        type: 'BOL',
        name: `BOL-${load.loadNumber}.pdf`,
        uploadedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        size: '245 KB',
        status: 'available'
      },
      {
        id: '2',
        type: 'MANIFEST',
        name: `Manifest-${load.loadNumber}.pdf`,
        uploadedAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
        size: '189 KB',
        status: 'available'
      }
    ];

    // Add POD if delivered
    if (load.status === 'delivered') {
      docs.push({
        id: '3',
        type: 'POD',
        name: `POD-${load.loadNumber}.pdf`,
        uploadedAt: new Date(load.deliveryDate || Date.now()),
        size: '321 KB',
        status: 'available'
      });
    }

    // Add invoice if delivered
    if (load.status === 'delivered') {
      docs.push({
        id: '4',
        type: 'INVOICE',
        name: `Invoice-${load.loadNumber}.pdf`,
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: '156 KB',
        status: 'available'
      });
    }

    return docs;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return theme.colors.primary;
      case 'in_transit': return theme.colors.tertiary;
      case 'picked_up': return theme.colors.secondary;
      case 'assigned': return theme.colors.outline;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getEventIcon = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'pickup_scheduled': return Calendar;
      case 'picked_up': return Package;
      case 'checkpoint': return MapPin;
      case 'delivered': return CheckCircle;
      case 'delay': return Clock;
      case 'exception': return AlertTriangle;
      default: return MapPin;
    }
  };

  const getEventColor = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'delivered': return theme.colors.primary;
      case 'picked_up': return theme.colors.secondary;
      case 'checkpoint': return theme.colors.tertiary;
      case 'delay': return theme.colors.tertiary;
      case 'exception': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  const getDocumentIcon = (type: ShipmentDocument['type']) => {
    switch (type) {
      case 'BOL': return FileText;
      case 'POD': return CheckCircle;
      case 'INVOICE': return FileText;
      case 'RECEIPT': return FileText;
      case 'PHOTO': return Eye;
      case 'MANIFEST': return FileText;
      default: return FileText;
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const currentEvents = selectedLoad ? getTrackingEvents(selectedLoad) : [];
  const currentDocuments = selectedLoad ? getShipmentDocuments(selectedLoad) : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
          Shipment Tracking
        </Text>
        
        {/* Search Bar */}
        <Searchbar
          placeholder="Search by load number or commodity..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
        />

        {/* View Toggle */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['map', 'timeline', 'documents'].map((view) => (
            <Chip
              key={view}
              selected={selectedView === view}
              onPress={() => setSelectedView(view as any)}
              style={{ backgroundColor: selectedView === view ? theme.colors.primary : 'transparent' }}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Chip>
          ))}
        </View>
      </Surface>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Shipment Selection */}
        {!selectedShipment && (
          <View style={{ padding: 16 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              Select a Shipment
            </Text>
            
            {customerLoads.map((load) => (
              <Card key={load.id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <List.Item
                    title={`Load #${load.loadNumber}`}
                    description={`${load.origin.facility.address.city}, ${load.origin.facility.address.state} → ${load.destination.facility.address.city}, ${load.destination.facility.address.state} • ${load.commodity}`}
                    left={(props) => (
                      <Avatar.Icon 
                        {...props} 
                        icon={() => <Package size={24} color={getStatusColor(load.status)} />}
                        style={{ backgroundColor: `${getStatusColor(load.status)}20` }}
                      />
                    )}
                    right={(props) => (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Chip 
                          style={{ 
                            backgroundColor: `${getStatusColor(load.status)}20`,
                            marginBottom: 4
                          }}
                          textStyle={{ color: getStatusColor(load.status) }}
                        >
                          {load.status.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </View>
                    )}
                    onPress={() => setSelectedShipment(load.id)}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Selected Shipment Details */}
        {selectedLoad && (
          <>
            {/* Shipment Header */}
            <Card style={{ margin: 16, marginBottom: 12 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    Load #{selectedLoad.loadNumber}
                  </Text>
                  <IconButton
                    icon={() => <RefreshCw size={24} color={theme.colors.primary} />}
                    onPress={onRefresh}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Chip 
                    style={{ 
                      backgroundColor: `${getStatusColor(selectedLoad.status)}20`,
                      marginRight: 8
                    }}
                    textStyle={{ color: getStatusColor(selectedLoad.status) }}
                  >
                    {selectedLoad.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {selectedLoad.commodity} • {formatCurrency(selectedLoad.rate || 0)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>FROM</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                      {selectedLoad.origin.facility.address.city}, {selectedLoad.origin.facility.address.state}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                    <Route size={24} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>TO</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                      {selectedLoad.destination.facility.address.city}, {selectedLoad.destination.facility.address.state}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Map View */}
            {selectedView === 'map' && (
              <Card style={{ margin: 16, marginTop: 0 }}>
                <Card.Content style={{ padding: 0 }}>
                  <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
                    <MapView
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: 39.8283,
                        longitude: -98.5795,
                        latitudeDelta: 10,
                        longitudeDelta: 10,
                      }}
                    >
                      {currentEvents.map((event) => 
                        event.coordinates && (
                          <Marker
                            key={event.id}
                            coordinate={{
                              latitude: event.coordinates.lat,
                              longitude: event.coordinates.lng,
                            }}
                            title={event.location}
                            description={event.description}
                          />
                        )
                      )}
                    </MapView>
                  </View>
                  
                  <View style={{ padding: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      Live Tracking
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Truck size={20} color={theme.colors.primary} />
                      <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                        Last updated: {new Date().toLocaleTimeString()}
                      </Text>
                      <Badge style={{ backgroundColor: theme.colors.primary }}>Live</Badge>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Timeline View */}
            {selectedView === 'timeline' && (
              <Card style={{ margin: 16, marginTop: 0 }}>
                <Card.Content>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    Shipment Timeline
                  </Text>
                  
                  {currentEvents.map((event, index) => {
                    const IconComponent = getEventIcon(event.type);
                    const isCompleted = event.actualTime || event.type === 'pickup_scheduled';
                    
                    return (
                      <View key={event.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ alignItems: 'center', marginRight: 16 }}>
                          <Avatar.Icon
                            size={40}
                            icon={() => <IconComponent size={20} color={isCompleted ? 'white' : getEventColor(event.type)} />}
                            style={{ 
                              backgroundColor: isCompleted ? getEventColor(event.type) : `${getEventColor(event.type)}20`
                            }}
                          />
                          {index < currentEvents.length - 1 && (
                            <View style={{ 
                              width: 2, 
                              height: 40, 
                              backgroundColor: isCompleted ? getEventColor(event.type) : theme.colors.outline,
                              marginTop: 8 
                            }} />
                          )}
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                            {event.description}
                          </Text>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {event.location}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                            {event.actualTime ? 
                              `Completed: ${event.actualTime.toLocaleString()}` :
                              event.estimatedTime ? 
                                `Estimated: ${event.estimatedTime.toLocaleString()}` :
                                'Pending'
                            }
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </Card.Content>
              </Card>
            )}

            {/* Documents View */}
            {selectedView === 'documents' && (
              <Card style={{ margin: 16, marginTop: 0 }}>
                <Card.Content>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    Shipment Documents
                  </Text>
                  
                  {currentDocuments.map((document) => {
                    const IconComponent = getDocumentIcon(document.type);
                    
                    return (
                      <View key={document.id}>
                        <List.Item
                          title={document.name}
                          description={`${document.type} • ${document.size} • ${document.uploadedAt.toLocaleDateString()}`}
                          left={(props) => (
                            <Avatar.Icon 
                              {...props} 
                              icon={() => <IconComponent size={24} color={theme.colors.primary} />}
                              style={{ backgroundColor: `${theme.colors.primary}20` }}
                            />
                          )}
                          right={(props) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <IconButton
                                icon={() => <Eye size={20} color={theme.colors.primary} />}
                                onPress={() => Alert.alert('View Document', `Opening ${document.name}...`)}
                              />
                              <IconButton
                                icon={() => <Download size={20} color={theme.colors.primary} />}
                                onPress={() => Alert.alert('Download', `Downloading ${document.name}...`)}
                              />
                            </View>
                          )}
                        />
                        <Divider />
                      </View>
                    );
                  })}
                </Card.Content>
              </Card>
            )}

            {/* Additional Details */}
            <Card style={{ margin: 16, marginTop: 0 }}>
              <Card.Content>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                  Shipment Details
                </Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <Surface style={{ padding: 12, borderRadius: 8, flex: 1, minWidth: 140 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Package size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                        Weight
                      </Text>
                    </View>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                      {selectedLoad.weight || 'N/A'} lbs
                    </Text>
                  </Surface>
                  
                  <Surface style={{ padding: 12, borderRadius: 8, flex: 1, minWidth: 140 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Thermometer size={16} color={theme.colors.secondary} />
                      <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                        Temperature
                      </Text>
                    </View>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                      Ambient
                    </Text>
                  </Surface>
                </View>

                <Divider style={{ marginVertical: 16 }} />

                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                  Contact Information
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button
                    mode="outlined"
                    icon={() => <Phone size={20} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Call Driver', 'Calling assigned driver...')}
                    style={{ flex: 1 }}
                  >
                    Call Driver
                  </Button>
                  
                  <Button
                    mode="outlined"
                    icon={() => <MessageSquare size={20} color={theme.colors.primary} />}
                    onPress={() => Alert.alert('Message', 'Send message to driver or dispatch')}
                    style={{ flex: 1 }}
                  >
                    Message
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* Service Rating */}
            <Card style={{ margin: 16, marginTop: 0, marginBottom: 80 }}>
              <Card.Content>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                  Rate This Service
                </Text>
                
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        icon={() => <Star size={32} color={theme.colors.primary} />}
                        onPress={() => Alert.alert('Rating', `You rated this service ${star} stars`)}
                      />
                    ))}
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => Alert.alert('Feedback', 'Thank you for your feedback!')}
                  >
                    Submit Rating
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Back FAB */}
      {selectedShipment && (
        <FAB
          icon="arrow-left"
          style={{
            position: 'absolute',
            margin: 16,
            left: 0,
            bottom: 0,
            backgroundColor: theme.colors.surface,
          }}
          onPress={() => setSelectedShipment(null)}
        />
      )}
    </View>
  );
}
