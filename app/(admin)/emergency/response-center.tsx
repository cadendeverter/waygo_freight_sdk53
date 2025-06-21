// waygo-freight/app/(admin)/emergency/response-center.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert, Linking } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, IconButton, Surface, 
  Dialog, Portal, TextInput, List, Badge, FAB, ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  AlertTriangle, Phone, MapPin, Clock, CheckCircle, User,
  Truck, Shield, Heart, Flame, Car, Navigation, Radio, Bell
} from '../../../utils/icons';

import { useAuth } from '../../../state/authContext';

interface EmergencyIncident {
  id: string;
  type: 'ACCIDENT' | 'BREAKDOWN' | 'MEDICAL' | 'SECURITY' | 'WEATHER' | 'HAZMAT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'DISPATCHED' | 'RESPONDING' | 'RESOLVED';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  };
  reportedBy: {
    id: string;
    name: string;
    role: 'DRIVER' | 'DISPATCHER' | 'ADMIN' | 'CUSTOMER';
    phone?: string;
  };
  driverId?: string;
  vehicleId?: string;
  loadId?: string;
  reportedAt: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  responders: EmergencyResponder[];
  updates: IncidentUpdate[];
}

interface EmergencyResponder {
  id: string;
  name: string;
  role: 'POLICE' | 'FIRE' | 'MEDICAL' | 'TOW' | 'SUPERVISOR';
  phone: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'CLEARED';
  eta?: Date;
  arrivedAt?: Date;
}

interface IncidentUpdate {
  id: string;
  timestamp: Date;
  updateBy: string;
  message: string;
  status?: EmergencyIncident['status'];
}

const EmergencyResponseCenter: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [newIncidentVisible, setNewIncidentVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [updateMessage, setUpdateMessage] = useState('');

  // Mock data - in production this would come from backend
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([
    {
      id: 'INC001',
      type: 'ACCIDENT',
      severity: 'HIGH',
      status: 'RESPONDING',
      title: 'Vehicle Collision - I-75 Mile 234',
      description: 'Multi-vehicle accident involving company truck. Driver reports minor injuries.',
      location: {
        latitude: 41.2524,
        longitude: -81.8549,
        address: 'I-75 Northbound Mile 234',
        city: 'Toledo',
        state: 'OH'
      },
      reportedBy: {
        id: 'DRV001',
        name: 'John Smith',
        role: 'DRIVER',
        phone: '+1-555-0123'
      },
      driverId: 'DRV001',
      vehicleId: 'VH001',
      loadId: 'LD4578',
      reportedAt: new Date(Date.now() - 45 * 60 * 1000),
      respondedAt: new Date(Date.now() - 35 * 60 * 1000),
      responders: [
        {
          id: 'RESP001',
          name: 'Ohio State Police',
          role: 'POLICE',
          phone: '911',
          status: 'ON_SCENE',
          arrivedAt: new Date(Date.now() - 20 * 60 * 1000)
        }
      ],
      updates: [
        {
          id: 'UPD001',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          updateBy: 'Dispatcher Sarah',
          message: 'Emergency services dispatched. Driver conscious and responsive.'
        }
      ]
    }
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const makeEmergencyCall = (phone: string) => {
    Alert.alert(
      'Emergency Call',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) }
      ]
    );
  };

  const updateIncident = (incidentId: string, message: string) => {
    if (!message.trim()) return;

    const newUpdate: IncidentUpdate = {
      id: `UPD_${Date.now()}`,
      timestamp: new Date(),
      updateBy: user?.firstName + ' ' + user?.lastName || 'System',
      message: message.trim()
    };

    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, updates: [...incident.updates, newUpdate] }
        : incident
    ));

    setUpdateMessage('');
    Alert.alert('Success', 'Incident updated successfully');
  };

  const getIncidentIcon = (type: EmergencyIncident['type']) => {
    switch (type) {
      case 'ACCIDENT': return Car;
      case 'BREAKDOWN': return Truck;
      case 'MEDICAL': return Heart;
      case 'SECURITY': return Shield;
      case 'WEATHER': return AlertTriangle;
      case 'HAZMAT': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: EmergencyIncident['severity']) => {
    switch (severity) {
      case 'CRITICAL': return '#f44336';
      case 'HIGH': return '#ff9800';
      case 'MEDIUM': return '#2196f3';
      case 'LOW': return '#4caf50';
      default: return theme.colors.onSurface;
    }
  };

  const getStatusColor = (status: EmergencyIncident['status']) => {
    switch (status) {
      case 'REPORTED': return '#ff9800';
      case 'DISPATCHED': return '#2196f3';
      case 'RESPONDING': return '#ff5722';
      case 'RESOLVED': return '#4caf50';
      default: return theme.colors.onSurface;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filterStatus === 'ACTIVE') {
      return !['RESOLVED'].includes(incident.status);
    }
    return incident.status === filterStatus;
  });

  const selectedIncidentData = incidents.find(i => i.id === selectedIncident);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!selectedIncident ? (
        <View style={{ flex: 1 }}>
          <Surface style={{ padding: 16, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                  Emergency Response Center
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                  Active incidents and emergency management
                </Text>
              </View>
              <IconButton 
                icon="phone" 
                style={{ backgroundColor: '#f44336' }}
                iconColor="white"
                onPress={() => makeEmergencyCall('911')}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#f44336', fontWeight: 'bold' }}>
                  {incidents.filter(i => !['RESOLVED'].includes(i.status)).length}
                </Text>
                <Text variant="bodySmall">Active</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#ff9800', fontWeight: 'bold' }}>
                  {incidents.filter(i => i.severity === 'CRITICAL').length}
                </Text>
                <Text variant="bodySmall">Critical</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {incidents.filter(i => i.status === 'RESOLVED').length}
                </Text>
                <Text variant="bodySmall">Resolved</Text>
              </View>
            </View>
          </Surface>

          <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {['ACTIVE', 'REPORTED', 'DISPATCHED', 'RESPONDING', 'RESOLVED'].map((status) => (
                  <Chip
                    key={status}
                    selected={filterStatus === status}
                    onPress={() => setFilterStatus(status)}
                    style={{ marginRight: 8 }}
                    mode={filterStatus === status ? 'flat' : 'outlined'}
                  >
                    {status}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>

          <ScrollView 
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {filteredIncidents.map((incident) => {
              const IncidentIcon = getIncidentIcon(incident.type);

              return (
                <Card 
                  key={incident.id} 
                  style={{ margin: 16, marginBottom: 8 }}
                  onPress={() => setSelectedIncident(incident.id)}
                >
                  <Card.Content>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <IncidentIcon size={24} color={getSeverityColor(incident.severity)} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                          {incident.title}
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                          {incident.location.address}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Chip 
                          compact
                          style={{ backgroundColor: getSeverityColor(incident.severity) + '20', marginBottom: 4 }}
                          textStyle={{ color: getSeverityColor(incident.severity) }}
                        >
                          {incident.severity}
                        </Chip>
                        <Chip 
                          compact
                          style={{ backgroundColor: getStatusColor(incident.status) + '20' }}
                          textStyle={{ color: getStatusColor(incident.status) }}
                        >
                          {incident.status}
                        </Chip>
                      </View>
                    </View>

                    <Text variant="bodyMedium" numberOfLines={2} style={{ marginBottom: 12 }}>
                      {incident.description}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={16} color={theme.colors.onSurface} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, opacity: 0.7 }}>
                          {incident.reportedAt.toLocaleTimeString()}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <IconButton 
                          icon="phone" 
                          size={20}
                          onPress={() => makeEmergencyCall(incident.reportedBy.phone || '911')}
                        />
                        <IconButton 
                          icon="map-marker" 
                          size={20}
                          onPress={() => {/* Open map */}}
                        />
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </ScrollView>

          <FAB
            icon="phone"
            style={{ position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#f44336' }}
            onPress={() => makeEmergencyCall('911')}
          />
        </View>
      ) : (
        // Incident Detail View
        selectedIncidentData && (
          <View style={{ flex: 1 }}>
            <Surface style={{ padding: 16, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon="arrow-left" onPress={() => setSelectedIncident(null)} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    {selectedIncidentData.title}
                  </Text>
                  <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                    Incident #{selectedIncidentData.id}
                  </Text>
                </View>
              </View>
            </Surface>

            <ScrollView style={{ flex: 1 }}>
              <Card style={{ margin: 16 }}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    Updates Timeline
                  </Text>
                  
                  {selectedIncidentData.updates.map((update) => (
                    <View key={update.id} style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                          {update.updateBy}
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                          {update.timestamp.toLocaleTimeString()}
                        </Text>
                      </View>
                      <Text variant="bodyMedium">{update.message}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>

              <Card style={{ margin: 16, marginTop: 0 }}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    Add Update
                  </Text>
                  
                  <TextInput
                    mode="outlined"
                    label="Update Message"
                    value={updateMessage}
                    onChangeText={setUpdateMessage}
                    multiline
                    numberOfLines={3}
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Button
                    mode="contained"
                    onPress={() => updateIncident(selectedIncidentData.id, updateMessage)}
                    disabled={!updateMessage.trim()}
                  >
                    Add Update
                  </Button>
                </Card.Content>
              </Card>
            </ScrollView>
          </View>
        )
      )}
    </SafeAreaView>
  );
};

export default EmergencyResponseCenter;
