import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  IconButton,
  Divider,
  Surface,
  FAB,
  List,
  Checkbox,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoad } from '../../../state/loadContext';
import { useAuth } from '../../../state/authContext';
import { 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Phone,
  Camera,
  Navigation,
  MessageSquare,
  FileText,
  Package,
  Thermometer,
  Scale,
  Route
} from '../../../utils/icons';

interface LoadStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
  location?: 'origin' | 'destination' | 'en_route';
  documents?: string[];
  photos?: string[];
  notes?: string;
  timestamp?: Date;
}

interface LoadDocument {
  id: string;
  type: string;
  name: string;
  required: boolean;
  captured: boolean;
  uri?: string;
  timestamp?: Date;
}

export default function DriverLoadWorkflow() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { loads, updateLoadStatus } = useLoad();
  const { user } = useAuth();
  
  const [load, setLoad] = useState(loads.find(l => l.id === id));
  const [currentLocation, setCurrentLocation] = useState<'origin' | 'en_route' | 'destination'>('origin');
  const [statusUpdateDialogVisible, setStatusUpdateDialogVisible] = useState(false);
  const [documentDialogVisible, setDocumentDialogVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LoadDocument | null>(null);
  const [notes, setNotes] = useState('');
  
  // Load workflow steps
  const [workflowSteps, setWorkflowSteps] = useState<LoadStep[]>([
    {
      id: 'pre_trip_inspection',
      title: 'Pre-Trip Inspection',
      description: 'Complete DVIR before starting trip',
      status: 'pending',
      required: true,
      location: 'origin'
    },
    {
      id: 'arrival_at_shipper',
      title: 'Arrive at Shipper',
      description: 'Check in at pickup location',
      status: 'pending',
      required: true,
      location: 'origin'
    },
    {
      id: 'load_verification',
      title: 'Load Verification',
      description: 'Verify load details and documentation',
      status: 'pending',
      required: true,
      location: 'origin',
      documents: ['Bill of Lading', 'Load Manifest']
    },
    {
      id: 'cargo_securement',
      title: 'Cargo Securement',
      description: 'Secure cargo and take photos',
      status: 'pending',
      required: true,
      location: 'origin',
      photos: ['cargo_secured']
    },
    {
      id: 'departure_shipper',
      title: 'Depart Shipper',
      description: 'Confirm departure with all documentation',
      status: 'pending',
      required: true,
      location: 'origin'
    },
    {
      id: 'en_route_updates',
      title: 'En Route Updates',
      description: 'Provide regular status updates during transit',
      status: 'pending',
      required: false,
      location: 'en_route'
    },
    {
      id: 'arrival_at_consignee',
      title: 'Arrive at Consignee',
      description: 'Check in at delivery location',
      status: 'pending',
      required: true,
      location: 'destination'
    },
    {
      id: 'cargo_inspection',
      title: 'Cargo Inspection',
      description: 'Inspect cargo condition before unloading',
      status: 'pending',
      required: true,
      location: 'destination',
      photos: ['cargo_condition']
    },
    {
      id: 'delivery_completion',
      title: 'Complete Delivery',
      description: 'Obtain proof of delivery and signatures',
      status: 'pending',
      required: true,
      location: 'destination',
      documents: ['Proof of Delivery', 'Delivery Receipt']
    },
    {
      id: 'post_trip_inspection',
      title: 'Post-Trip Inspection',
      description: 'Complete final DVIR after delivery',
      status: 'pending',
      required: true,
      location: 'destination'
    }
  ]);

  // Load documents
  const [documents, setDocuments] = useState<LoadDocument[]>([
    {
      id: 'bol',
      type: 'Bill of Lading',
      name: 'BOL-' + load?.loadNumber,
      required: true,
      captured: false
    },
    {
      id: 'manifest',
      type: 'Load Manifest',
      name: 'Manifest-' + load?.loadNumber,
      required: true,
      captured: false
    },
    {
      id: 'pod',
      type: 'Proof of Delivery',
      name: 'POD-' + load?.loadNumber,
      required: true,
      captured: false
    },
    {
      id: 'delivery_receipt',
      type: 'Delivery Receipt',
      name: 'Receipt-' + load?.loadNumber,
      required: true,
      captured: false
    }
  ]);

  const updateStepStatus = (stepId: string, status: LoadStep['status'], notes?: string) => {
    setWorkflowSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              status, 
              notes: notes || step.notes,
              timestamp: status === 'completed' ? new Date() : step.timestamp
            }
          : step
      )
    );

    // Update load status based on step completion
    if (stepId === 'departure_shipper' && status === 'completed') {
      updateLoadStatus(load?.id || '', 'in_transit');
      setCurrentLocation('en_route');
    } else if (stepId === 'delivery_completion' && status === 'completed') {
      updateLoadStatus(load?.id || '', 'delivered');
      setCurrentLocation('destination');
    }
  };

  const completeStep = (stepId: string) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return;

    // Check if step has required documents/photos
    if (step.documents?.length) {
      const missingDocs = step.documents.filter(docType => 
        !documents.find(doc => doc.type === docType && doc.captured)
      );
      if (missingDocs.length > 0) {
        Alert.alert(
          'Missing Documents',
          `Please capture the following documents first: ${missingDocs.join(', ')}`
        );
        return;
      }
    }

    updateStepStatus(stepId, 'completed');
    Alert.alert('Step Completed', `${step.title} has been marked as completed.`);
  };

  const openNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}`;
    Linking.openURL(url);
  };

  const captureDocument = (document: LoadDocument) => {
    setSelectedDocument(document);
    setDocumentDialogVisible(true);
  };

  const confirmDocumentCapture = () => {
    if (!selectedDocument) return;
    
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, captured: true, timestamp: new Date() }
          : doc
      )
    );
    
    setDocumentDialogVisible(false);
    setSelectedDocument(null);
    Alert.alert('Document Captured', `${selectedDocument.type} has been captured successfully.`);
  };

  const getStepStatusColor = (status: LoadStep['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#FF9800';
      case 'pending':
        return '#757575';
      case 'skipped':
        return '#9E9E9E';
      default:
        return theme.colors.primary;
    }
  };

  const getStepStatusIcon = (status: LoadStep['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'pending':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getCurrentSteps = () => {
    return workflowSteps.filter(step => {
      if (currentLocation === 'origin') {
        return step.location === 'origin';
      } else if (currentLocation === 'en_route') {
        return step.location === 'en_route' || 
               (step.location === 'origin' && step.status !== 'completed') ||
               (step.location === 'destination' && step.status === 'in_progress');
      } else {
        return step.location === 'destination';
      }
    });
  };

  const completedStepsCount = workflowSteps.filter(step => step.status === 'completed').length;
  const totalStepsCount = workflowSteps.length;
  const progressPercentage = (completedStepsCount / totalStepsCount) * 100;

  if (!load) {
    return (
      <View style={styles.container}>
        <Text>Load not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Load Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.loadHeader}>
              <View style={styles.loadInfo}>
                <Text variant="titleLarge" style={styles.loadNumber}>
                  Load #{load.loadNumber}
                </Text>
                <Chip 
                  icon={() => <Truck size={16} color="#fff" />}
                  style={[styles.statusChip, { backgroundColor: theme.colors.primary }]}
                  textStyle={{ color: '#fff' }}
                >
                  {load.status.replace('_', ' ').toUpperCase()}
                </Chip>
              </View>
              <Text variant="bodyMedium" style={styles.commodity}>
                {load.commodity} • {load.weight?.toLocaleString()} lbs
              </Text>
            </View>

            {/* Progress Bar */}
            <Surface style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text variant="bodyMedium" style={styles.progressText}>
                  Progress: {completedStepsCount}/{totalStepsCount} steps completed
                </Text>
                <Text variant="bodySmall">{Math.round(progressPercentage)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progressPercentage}%`, backgroundColor: theme.colors.primary }
                  ]} 
                />
              </View>
            </Surface>
          </Card.Content>
        </Card>

        {/* Route Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Route Information</Text>
            
            <View style={styles.routeContainer}>
              <View style={styles.locationRow}>
                <MapPin size={20} color="#4CAF50" />
                <View style={styles.locationInfo}>
                  <Text variant="bodyMedium" style={styles.locationLabel}>Pickup</Text>
                  <Text variant="bodySmall">{load.origin.company}</Text>
                  <Text variant="bodySmall">{load.origin.address}</Text>
                  <Text variant="bodySmall">Appt: {load.pickupDate?.toLocaleString()}</Text>
                </View>
                <IconButton
                  icon={() => <Navigation size={20} color={theme.colors.primary} />}
                  onPress={() => openNavigation(load.origin.address)}
                />
              </View>

              <Divider style={styles.routeDivider} />

              <View style={styles.locationRow}>
                <MapPin size={20} color="#F44336" />
                <View style={styles.locationInfo}>
                  <Text variant="bodyMedium" style={styles.locationLabel}>Delivery</Text>
                  <Text variant="bodySmall">{load.destination.company}</Text>
                  <Text variant="bodySmall">{load.destination.address}</Text>
                  <Text variant="bodySmall">Appt: {load.deliveryDate?.toLocaleString()}</Text>
                </View>
                <IconButton
                  icon={() => <Navigation size={20} color={theme.colors.primary} />}
                  onPress={() => openNavigation(load.destination.address)}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Current Workflow Steps */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Current Steps ({currentLocation.replace('_', ' ').toUpperCase()})
            </Text>
            
            {getCurrentSteps().map(step => (
              <View key={step.id} style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepInfo}>
                    <View style={styles.stepIcon}>
                      {React.createElement(getStepStatusIcon(step.status), {
                        size: 20,
                        color: getStepStatusColor(step.status)
                      })}
                    </View>
                    <View style={styles.stepDetails}>
                      <Text variant="bodyMedium" style={styles.stepTitle}>
                        {step.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.stepDescription}>
                        {step.description}
                      </Text>
                      {step.timestamp && (
                        <Text variant="bodySmall" style={styles.stepTimestamp}>
                          Completed: {step.timestamp.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {step.status === 'pending' && (
                    <Button
                      mode="contained"
                      onPress={() => completeStep(step.id)}
                      style={styles.completeButton}
                    >
                      Complete
                    </Button>
                  )}
                </View>

                {/* Step Actions */}
                {step.status !== 'completed' && (
                  <View style={styles.stepActions}>
                    {step.documents?.map(docType => {
                      const doc = documents.find(d => d.type === docType);
                      return (
                        <Button
                          key={docType}
                          mode={doc?.captured ? "contained" : "outlined"}
                          onPress={() => doc && captureDocument(doc)}
                          style={styles.actionButton}
                          icon={() => <Camera size={16} color={doc?.captured ? "#fff" : theme.colors.primary} />}
                        >
                          {docType}
                        </Button>
                      );
                    })}
                    
                    {step.photos?.map(photoType => (
                      <Button
                        key={photoType}
                        mode="outlined"
                        onPress={() => Alert.alert('Camera', 'Open camera to capture photo')}
                        style={styles.actionButton}
                        icon={() => <Camera size={16} color={theme.colors.primary} />}
                      >
                        Take Photo
                      </Button>
                    ))}
                  </View>
                )}

                {step.notes && (
                  <Surface style={styles.stepNotes}>
                    <Text variant="bodySmall">{step.notes}</Text>
                  </Surface>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Documents Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Documents Status</Text>
            
            {documents.map(doc => (
              <List.Item
                key={doc.id}
                title={doc.type}
                description={doc.name}
                left={() => (
                  <FileText 
                    size={24} 
                    color={doc.captured ? '#4CAF50' : '#757575'} 
                  />
                )}
                right={() => doc.captured ? (
                  <CheckCircle size={20} color="#4CAF50" />
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => captureDocument(doc)}
                  >
                    Capture
                  </Button>
                )}
                style={styles.documentItem}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Load Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Load Details</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Package size={16} color={theme.colors.primary} />
                <Text variant="bodySmall">Commodity</Text>
                <Text variant="bodyMedium">{load.commodity}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Scale size={16} color={theme.colors.primary} />
                <Text variant="bodySmall">Weight</Text>
                <Text variant="bodyMedium">{load.weight?.toLocaleString()} lbs</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Route size={16} color={theme.colors.primary} />
                <Text variant="bodySmall">Distance</Text>
                <Text variant="bodyMedium">{load.distance || 'N/A'} mi</Text>
              </View>
              
              {load.temperature && (
                <View style={styles.detailItem}>
                  <Thermometer size={16} color={theme.colors.primary} />
                  <Text variant="bodySmall">Temperature</Text>
                  <Text variant="bodyMedium">{load.temperature}°F</Text>
                </View>
              )}
            </View>

            {load.specialInstructions && (
              <Surface style={styles.instructionsBox}>
                <Text variant="bodySmall" style={styles.instructionsLabel}>Special Instructions:</Text>
                <Text variant="bodyMedium">{load.specialInstructions}</Text>
              </Surface>
            )}
          </Card.Content>
        </Card>

        {/* Emergency Contacts */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Emergency Contacts</Text>
            
            <List.Item
              title="Dispatch"
              description="24/7 Emergency Support"
              left={() => <Phone size={24} color={theme.colors.primary} />}
              right={() => (
                <IconButton
                  icon={() => <Phone size={20} color={theme.colors.primary} />}
                  onPress={() => Linking.openURL('tel:+1-800-DISPATCH')}
                />
              )}
            />
            
            <List.Item
              title="Customer Service"
              description="Load Support"
              left={() => <MessageSquare size={24} color={theme.colors.primary} />}
              right={() => (
                <IconButton
                  icon={() => <MessageSquare size={20} color={theme.colors.primary} />}
                  onPress={() => router.push('/(driver)/messages')}
                />
              )}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Document Capture Dialog */}
      <Portal>
        <Dialog visible={documentDialogVisible} onDismiss={() => setDocumentDialogVisible(false)}>
          <Dialog.Title>Capture Document</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Ready to capture {selectedDocument?.type}?
            </Text>
            <TextInput
              mode="outlined"
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ marginTop: 16 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDocumentDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDocumentCapture}>Capture</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Quick Actions FAB */}
      <FAB
        icon={() => <MessageSquare size={24} color="#fff" />}
        style={styles.fab}
        onPress={() => router.push('/(driver)/messages')}
        label="Messages"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  loadHeader: {
    marginBottom: 16,
  },
  loadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadNumber: {
    fontWeight: 'bold',
  },
  statusChip: {
    borderRadius: 16,
  },
  commodity: {
    opacity: 0.7,
  },
  progressContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  routeContainer: {
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routeDivider: {
    marginVertical: 12,
  },
  stepContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  stepIcon: {
    marginTop: 2,
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    opacity: 0.7,
  },
  stepTimestamp: {
    marginTop: 4,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  completeButton: {
    alignSelf: 'flex-start',
  },
  stepActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
  },
  stepNotes: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  documentItem: {
    paddingVertical: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 80,
    gap: 4,
  },
  instructionsBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  instructionsLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});
