import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  FAB,
  ProgressBar,
  IconButton,
  Menu,
  Divider
} from 'react-native-paper';
import { useCompliance } from '../../../state/complianceContext';
import { 
  AlertTriangle, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  MapPin,
  Truck,
  Clock,
  Camera,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  Shield
} from '../../../utils/icons';

interface SafetyIncident {
  id: string;
  type: 'ACCIDENT' | 'NEAR_MISS' | 'INJURY' | 'PROPERTY_DAMAGE' | 'CITATION' | 'COMPLAINT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CLOSED' | 'PENDING_REVIEW';
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: Date;
  driverId?: string;
  driverName?: string;
  vehicleNumber?: string;
  location: string;
  injuries: boolean;
  propertyDamage: boolean;
  estimatedCost?: number;
  citationNumber?: string;
  insuranceClaim?: boolean;
  photos: string[];
  witnesses: string[];
  investigator?: string;
  resolution?: string;
  closedAt?: Date;
  followUpRequired: boolean;
  regulatoryReporting: boolean;
}

const mockIncidents: SafetyIncident[] = [
  {
    id: 'inc1',
    type: 'ACCIDENT',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    title: 'Rear-end collision on I-80',
    description: 'Driver rear-ended passenger vehicle during heavy traffic. No injuries reported.',
    reportedBy: 'John Smith',
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    driverId: 'driver1',
    driverName: 'John Smith',
    vehicleNumber: 'T-101',
    location: 'I-80 Mile Marker 205, Nebraska',
    injuries: false,
    propertyDamage: true,
    estimatedCost: 8500,
    insuranceClaim: true,
    photos: ['photo1.jpg', 'photo2.jpg'],
    witnesses: ['witness1@example.com'],
    investigator: 'Safety Manager',
    followUpRequired: true,
    regulatoryReporting: true
  },
  {
    id: 'inc2',
    type: 'NEAR_MISS',
    severity: 'MEDIUM',
    status: 'CLOSED',
    title: 'Lane departure warning activation',
    description: 'Vehicle briefly crossed lane markings on rural highway. Driver corrected immediately.',
    reportedBy: 'Sarah Johnson',
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    driverId: 'driver2',
    driverName: 'Sarah Johnson',
    vehicleNumber: 'T-102',
    location: 'Highway 50, Colorado',
    injuries: false,
    propertyDamage: false,
    photos: [],
    witnesses: [],
    resolution: 'Driver attended refresher training on lane departure systems',
    closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    followUpRequired: false,
    regulatoryReporting: false
  },
  {
    id: 'inc3',
    type: 'CITATION',
    severity: 'MEDIUM',
    status: 'PENDING_REVIEW',
    title: 'Overweight violation',
    description: 'Vehicle cited for being 2,000 lbs over gross weight limit at weigh station.',
    reportedBy: 'Dispatch',
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    driverId: 'driver3',
    driverName: 'Mike Wilson',
    vehicleNumber: 'T-103',
    location: 'Arizona DOT Weigh Station',
    injuries: false,
    propertyDamage: false,
    citationNumber: 'AZ-2024-001234',
    estimatedCost: 500,
    photos: ['citation.jpg'],
    witnesses: [],
    followUpRequired: true,
    regulatoryReporting: true
  },
  {
    id: 'inc4',
    type: 'INJURY',
    severity: 'CRITICAL',
    status: 'OPEN',
    title: 'Slip and fall during delivery',
    description: 'Driver injured ankle while unloading freight in wet conditions.',
    reportedBy: 'Lisa Brown',
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    driverId: 'driver4',
    driverName: 'Lisa Brown',
    vehicleNumber: 'T-104',
    location: 'Customer Loading Dock, Atlanta, GA',
    injuries: true,
    propertyDamage: false,
    estimatedCost: 15000,
    insuranceClaim: true,
    photos: ['injury_scene.jpg'],
    witnesses: ['customer_supervisor@company.com'],
    investigator: 'Safety Director',
    followUpRequired: true,
    regulatoryReporting: true
  }
];

export default function SafetyIncidentsScreen() {
  const theme = useTheme();
  const { loading } = useCompliance();
  const [incidents, setIncidents] = useState<SafetyIncident[]>(mockIncidents);
  const [selectedFilter, setSelectedFilter] = useState<string>('open');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#F44336';
      case 'HIGH': return '#FF6B6B';
      case 'MEDIUM': return '#FF9800';
      case 'LOW': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#F44336';
      case 'INVESTIGATING': return '#FF9800';
      case 'PENDING_REVIEW': return '#2196F3';
      case 'CLOSED': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case 'ACCIDENT': return <AlertTriangle size={24} color="#F44336" />;
      case 'NEAR_MISS': return <Shield size={24} color="#FF9800" />;
      case 'INJURY': return <User size={24} color="#F44336" />;
      case 'PROPERTY_DAMAGE': return <Truck size={24} color="#FF6B6B" />;
      case 'CITATION': return <FileText size={24} color="#2196F3" />;
      case 'COMPLAINT': return <Phone size={24} color="#9C27B0" />;
      default: return <AlertTriangle size={24} color={theme.colors.outline} />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    switch (selectedFilter) {
      case 'open': return incident.status === 'OPEN' || incident.status === 'INVESTIGATING';
      case 'closed': return incident.status === 'CLOSED';
      case 'critical': return incident.severity === 'CRITICAL';
      case 'accidents': return incident.type === 'ACCIDENT';
      case 'injuries': return incident.injuries;
      case 'recent': return new Date(incident.reportedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      default: return true;
    }
  });

  // Calculate stats
  const openCount = incidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length;
  const injuryCount = incidents.filter(i => i.injuries && i.status !== 'CLOSED').length;
  const totalCost = incidents.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);

  const updateIncidentStatus = (incidentId: string, newStatus: string) => {
    setIncidents(prev => prev.map(incident =>
      incident.id === incidentId
        ? { 
            ...incident, 
            status: newStatus as any, 
            closedAt: newStatus === 'CLOSED' ? new Date() : undefined 
          }
        : incident
    ));
    Alert.alert('Success', `Incident status updated to ${newStatus}`);
  };

  const viewIncidentDetails = (incident: SafetyIncident) => {
    Alert.alert(
      `${incident.type} - ${incident.severity}`,
      `Title: ${incident.title}
Driver: ${incident.driverName || 'N/A'}
Vehicle: ${incident.vehicleNumber || 'N/A'}
Location: ${incident.location}
Date: ${incident.reportedAt.toLocaleString()}

Description: ${incident.description}

Status: ${incident.status}
${incident.injuries ? 'Injuries: Yes' : ''}
${incident.propertyDamage ? 'Property Damage: Yes' : ''}
${incident.estimatedCost ? `Estimated Cost: $${incident.estimatedCost.toLocaleString()}` : ''}
${incident.citationNumber ? `Citation: ${incident.citationNumber}` : ''}
${incident.resolution ? `Resolution: ${incident.resolution}` : ''}`,
      [
        { text: 'OK' },
        incident.status !== 'CLOSED' ? {
          text: 'Update Status',
          onPress: () => showStatusMenu(incident.id)
        } : undefined
      ].filter(Boolean) as any
    );
  };

  const showStatusMenu = (incidentId: string) => {
    Alert.alert(
      'Update Status',
      'Select new status for this incident:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => updateIncidentStatus(incidentId, 'OPEN') },
        { text: 'Investigating', onPress: () => updateIncidentStatus(incidentId, 'INVESTIGATING') },
        { text: 'Pending Review', onPress: () => updateIncidentStatus(incidentId, 'PENDING_REVIEW') },
        { text: 'Closed', onPress: () => updateIncidentStatus(incidentId, 'CLOSED') }
      ]
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportReport = () => {
    Alert.alert('Export Safety Report', 'Safety incidents report exported successfully!');
  };

  const createNewIncident = () => {
    Alert.alert('Create Incident', 'New incident reporting form will open in a future update.');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading safety incidents...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Safety & Incidents</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={refreshData}
              loading={refreshing}
              icon="refresh"
              compact
            >
              Refresh
            </Button>
            <Button 
              mode="outlined" 
              onPress={exportReport}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">{openCount}</Text>
                <Text variant="bodySmall">Open Cases</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <XCircle size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">{criticalCount}</Text>
                <Text variant="bodySmall">Critical</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <User size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">{injuryCount}</Text>
                <Text variant="bodySmall">Injuries</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FileText size={24} color="#9C27B0" />
              <View>
                <Text variant="headlineMedium">${(totalCost / 1000).toFixed(0)}K</Text>
                <Text variant="bodySmall">Total Costs</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All Incidents' },
              { key: 'open', label: 'Open' },
              { key: 'closed', label: 'Closed' },
              { key: 'critical', label: 'Critical' },
              { key: 'accidents', label: 'Accidents' },
              { key: 'injuries', label: 'Injuries' },
              { key: 'recent', label: 'Recent' }
            ].map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={{ marginRight: 8 }}
              >
                {filter.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Incidents List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredIncidents.map(incident => (
          <Card key={incident.id} style={{ marginBottom: 12 }}>
            <List.Item
              title={incident.title}
              description={`${incident.driverName || 'Unknown'} • ${incident.vehicleNumber || 'N/A'} • ${incident.location}`}
              left={(props) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar.Icon 
                    {...props} 
                    icon={incident.status === 'CLOSED' ? "check-circle" : "alert-circle"}
                    style={{ backgroundColor: getStatusColor(incident.status) }}
                  />
                  {getIncidentTypeIcon(incident.type)}
                </View>
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Badge style={{ backgroundColor: getSeverityColor(incident.severity) }}>
                    {incident.severity}
                  </Badge>
                  <Menu
                    visible={menuVisible === incident.id}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => setMenuVisible(incident.id)}
                      />
                    }
                  >
                    <Menu.Item 
                      onPress={() => {
                        setMenuVisible(null);
                        viewIncidentDetails(incident);
                      }} 
                      title="View Details" 
                      leadingIcon="eye"
                    />
                    {incident.status !== 'CLOSED' && (
                      <Menu.Item 
                        onPress={() => {
                          setMenuVisible(null);
                          showStatusMenu(incident.id);
                        }} 
                        title="Update Status" 
                        leadingIcon="edit"
                      />
                    )}
                    <Menu.Item 
                      onPress={() => {
                        setMenuVisible(null);
                        Alert.alert('Feature Coming Soon', 'Edit incident details will be available in a future update.');
                      }} 
                      title="Edit" 
                      leadingIcon="pencil"
                    />
                  </Menu>
                </View>
              )}
              onPress={() => viewIncidentDetails(incident)}
            />
            
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                {incident.description}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Reported: {incident.reportedAt.toLocaleDateString()}
                </Text>
                {incident.estimatedCost && (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Cost: ${incident.estimatedCost.toLocaleString()}
                  </Text>
                )}
              </View>

              {/* Status and indicators */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Chip 
                  mode="outlined" 
                  compact
                  textStyle={{ fontSize: 12 }}
                  style={{ backgroundColor: getStatusColor(incident.status) + '20' }}
                >
                  {incident.status}
                </Chip>
                
                {incident.injuries && (
                  <Chip mode="outlined" compact textStyle={{ fontSize: 12 }} style={{ backgroundColor: '#F44336' + '20' }}>
                    Injury
                  </Chip>
                )}
                
                {incident.propertyDamage && (
                  <Chip mode="outlined" compact textStyle={{ fontSize: 12 }} style={{ backgroundColor: '#FF9800' + '20' }}>
                    Property Damage
                  </Chip>
                )}
                
                {incident.regulatoryReporting && (
                  <Chip mode="outlined" compact textStyle={{ fontSize: 12 }} style={{ backgroundColor: '#2196F3' + '20' }}>
                    Regulatory
                  </Chip>
                )}
                
                {incident.followUpRequired && (
                  <Chip mode="outlined" compact textStyle={{ fontSize: 12 }} style={{ backgroundColor: '#9C27B0' + '20' }}>
                    Follow-up Required
                  </Chip>
                )}
              </View>
            </View>
          </Card>
        ))}
        
        {filteredIncidents.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <CheckCircle size={48} color="#4CAF50" />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              No Incidents Found
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              {selectedFilter === 'open' 
                ? 'No open safety incidents at this time.' 
                : 'No incidents match your current filter.'}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Report Incident"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={createNewIncident}
      />
    </View>
  );
}
