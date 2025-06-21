import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Checkbox, 
  TextInput,
  useTheme, 
  RadioButton,
  Divider,
  Chip,
  IconButton,
  Surface
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Camera,
  Truck,
  Calendar,
  MapPin,
  User
} from '../../../utils/icons';

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'satisfactory' | 'defective' | 'not_applicable';
  remarks?: string;
  requiresPhoto?: boolean;
  photoUri?: string;
}

interface DVIRData {
  id: string;
  driverId: string;
  vehicleId: string;
  inspectionType: 'pre_trip' | 'post_trip';
  inspectionDate: Date;
  odometer: number;
  location: string;
  overallCondition: 'satisfactory' | 'defective';
  items: InspectionItem[];
  defectsFound: boolean;
  defectDetails: string;
  driverSignature: boolean;
  mechanicSignature?: boolean;
  repairRequired: boolean;
  vehicleCondition: string;
  submitted: boolean;
}

const INSPECTION_CATEGORIES = [
  {
    category: 'Engine Compartment',
    items: [
      'Engine Oil Level',
      'Coolant Level',
      'Battery/Connections',
      'Belts/Hoses',
      'Air Filter',
      'Exhaust System'
    ]
  },
  {
    category: 'Cab/Interior',
    items: [
      'Gauges/Warning Lights',
      'Steering Wheel',
      'Horn',
      'Mirrors',
      'Windshield/Wipers',
      'Seat Belts',
      'Fire Extinguisher',
      'Emergency Equipment'
    ]
  },
  {
    category: 'Lights & Electrical',
    items: [
      'Headlights',
      'Tail Lights',
      'Brake Lights',
      'Turn Signals',
      'Hazard Lights',
      'Marker Lights',
      'Reflectors'
    ]
  },
  {
    category: 'Brakes & Suspension',
    items: [
      'Brake Pedal',
      'Parking Brake',
      'Brake Lines/Hoses',
      'Brake Drums/Rotors',
      'Suspension Components',
      'Shock Absorbers'
    ]
  },
  {
    category: 'Tires & Wheels',
    items: [
      'Tire Condition',
      'Tire Pressure',
      'Wheel Condition',
      'Lug Nuts',
      'Spare Tire',
      'Tire Chains (if applicable)'
    ]
  },
  {
    category: 'Trailer (if applicable)',
    items: [
      'Coupling/Hitch',
      'Safety Chains',
      'Electrical Connection',
      'Trailer Brakes',
      'Trailer Lights',
      'Cargo Securement'
    ]
  }
];

export default function DVIRInspection() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [inspectionType, setInspectionType] = useState<'pre_trip' | 'post_trip'>('pre_trip');
  const [vehicleId, setVehicleId] = useState('TRK-001');
  const [odometer, setOdometer] = useState('');
  const [location, setLocation] = useState('');
  const [overallCondition, setOverallCondition] = useState<'satisfactory' | 'defective'>('satisfactory');
  const [defectDetails, setDefectDetails] = useState('');
  const [vehicleCondition, setVehicleCondition] = useState('');
  
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(() => {
    const items: InspectionItem[] = [];
    INSPECTION_CATEGORIES.forEach(category => {
      category.items.forEach(item => {
        items.push({
          id: `${category.category}-${item}`.replace(/\s+/g, '_').toLowerCase(),
          category: category.category,
          item,
          status: 'satisfactory',
          remarks: ''
        });
      });
    });
    return items;
  });

  const updateInspectionItem = (id: string, status: 'satisfactory' | 'defective' | 'not_applicable', remarks?: string) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status, remarks: remarks || item.remarks }
          : item
      )
    );
  };

  const hasDefects = inspectionItems.some(item => item.status === 'defective');

  const handleSubmit = () => {
    if (!odometer || !location) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (hasDefects && !defectDetails.trim()) {
      Alert.alert('Defect Details Required', 'Please provide details about the defects found.');
      return;
    }

    const dvirData: DVIRData = {
      id: Date.now().toString(),
      driverId: user?.id || 'driver1',
      vehicleId,
      inspectionType,
      inspectionDate: new Date(),
      odometer: parseInt(odometer),
      location,
      overallCondition: hasDefects ? 'defective' : 'satisfactory',
      items: inspectionItems,
      defectsFound: hasDefects,
      defectDetails,
      driverSignature: true,
      repairRequired: hasDefects,
      vehicleCondition,
      submitted: true
    };

    // In production, this would be saved to the backend
    console.log('DVIR Submitted:', dvirData);
    
    Alert.alert(
      'DVIR Submitted', 
      hasDefects 
        ? 'Vehicle inspection completed with defects. Vehicle is out of service until repairs are completed.'
        : 'Vehicle inspection completed successfully. Vehicle is safe for operation.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'satisfactory':
        return '#4CAF50';
      case 'defective':
        return '#F44336';
      case 'not_applicable':
        return '#757575';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'satisfactory':
        return CheckCircle;
      case 'defective':
        return XCircle;
      case 'not_applicable':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Driver Vehicle Inspection Report
            </Text>
            
            <View style={styles.headerRow}>
              <View style={styles.headerItem}>
                <Text variant="bodySmall" style={styles.label}>Inspection Type</Text>
                <RadioButton.Group
                  onValueChange={(value) => setInspectionType(value as 'pre_trip' | 'post_trip')}
                  value={inspectionType}
                >
                  <View style={styles.radioRow}>
                    <RadioButton value="pre_trip" />
                    <Text>Pre-Trip</Text>
                  </View>
                  <View style={styles.radioRow}>
                    <RadioButton value="post_trip" />
                    <Text>Post-Trip</Text>
                  </View>
                </RadioButton.Group>
              </View>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                mode="outlined"
                label="Vehicle ID"
                value={vehicleId}
                onChangeText={setVehicleId}
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="Odometer Reading"
                value={odometer}
                onChangeText={setOdometer}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <TextInput
              mode="outlined"
              label="Current Location"
              value={location}
              onChangeText={setLocation}
              style={styles.fullInput}
            />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={16} color={theme.colors.primary} />
                <Text variant="bodySmall">Driver: {(user?.firstName + ' ' + user?.lastName) || 'John Doe'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={16} color={theme.colors.primary} />
                <Text variant="bodySmall">Date: {new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Inspection Items by Category */}
        {INSPECTION_CATEGORIES.map(category => (
          <Card key={category.category} style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                {category.category}
              </Text>
              
              {category.items.map(item => {
                const inspectionItem = inspectionItems.find(
                  i => i.category === category.category && i.item === item
                );
                
                return (
                  <View key={item} style={styles.inspectionItem}>
                    <View style={styles.itemHeader}>
                      <Text variant="bodyMedium" style={styles.itemName}>
                        {item}
                      </Text>
                      <View style={styles.statusButtons}>
                        <IconButton
                          icon={() => <CheckCircle size={20} color={inspectionItem?.status === 'satisfactory' ? '#4CAF50' : '#ccc'} />}
                          onPress={() => updateInspectionItem(inspectionItem!.id, 'satisfactory')}
                          style={[styles.statusButton, inspectionItem?.status === 'satisfactory' && styles.activeButton]}
                        />
                        <IconButton
                          icon={() => <XCircle size={20} color={inspectionItem?.status === 'defective' ? '#F44336' : '#ccc'} />}
                          onPress={() => updateInspectionItem(inspectionItem!.id, 'defective')}
                          style={[styles.statusButton, inspectionItem?.status === 'defective' && styles.activeButton]}
                        />
                        <IconButton
                          icon={() => <AlertTriangle size={20} color={inspectionItem?.status === 'not_applicable' ? '#757575' : '#ccc'} />}
                          onPress={() => updateInspectionItem(inspectionItem!.id, 'not_applicable')}
                          style={[styles.statusButton, inspectionItem?.status === 'not_applicable' && styles.activeButton]}
                        />
                      </View>
                    </View>
                    
                    {inspectionItem?.status === 'defective' && (
                      <TextInput
                        mode="outlined"
                        label="Defect Details"
                        value={inspectionItem.remarks}
                        onChangeText={(text) => updateInspectionItem(inspectionItem.id, 'defective', text)}
                        multiline
                        numberOfLines={2}
                        style={styles.remarksInput}
                      />
                    )}
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        ))}

        {/* Overall Condition & Defects */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Overall Vehicle Condition
            </Text>
            
            <Surface style={[styles.statusSummary, { backgroundColor: hasDefects ? '#FFEBEE' : '#E8F5E8' }]}>
              <View style={styles.statusInfo}>
                {hasDefects ? (
                  <XCircle size={24} color="#F44336" />
                ) : (
                  <CheckCircle size={24} color="#4CAF50" />
                )}
                <Text variant="titleMedium" style={[styles.statusText, { color: hasDefects ? '#F44336' : '#4CAF50' }]}>
                  {hasDefects ? 'DEFECTS FOUND' : 'SATISFACTORY'}
                </Text>
              </View>
              <Text variant="bodySmall">
                {inspectionItems.filter(item => item.status === 'defective').length} defects found
              </Text>
            </Surface>

            {hasDefects && (
              <TextInput
                mode="outlined"
                label="Defect Summary & Details"
                value={defectDetails}
                onChangeText={setDefectDetails}
                multiline
                numberOfLines={4}
                style={styles.fullInput}
                placeholder="Describe all defects found and their severity..."
              />
            )}

            <TextInput
              mode="outlined"
              label="Additional Vehicle Condition Notes"
              value={vehicleCondition}
              onChangeText={setVehicleCondition}
              multiline
              numberOfLines={3}
              style={styles.fullInput}
              placeholder="Any additional observations about vehicle condition..."
            />
          </Card.Content>
        </Card>

        {/* Defects Summary */}
        {hasDefects && (
          <Card style={[styles.card, { backgroundColor: '#FFEBEE' }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#F44336' }]}>
                Defects Requiring Attention
              </Text>
              
              {inspectionItems
                .filter(item => item.status === 'defective')
                .map(item => (
                  <View key={item.id} style={styles.defectItem}>
                    <View style={styles.defectHeader}>
                      <XCircle size={16} color="#F44336" />
                      <Text variant="bodyMedium" style={styles.defectText}>
                        {item.category}: {item.item}
                      </Text>
                    </View>
                    {item.remarks && (
                      <Text variant="bodySmall" style={styles.defectRemarks}>
                        {item.remarks}
                      </Text>
                    )}
                  </View>
                ))}
              
              <Surface style={styles.warningBox}>
                <AlertTriangle size={20} color="#FF9800" />
                <Text variant="bodySmall" style={styles.warningText}>
                  Vehicle must be repaired before returning to service. Contact maintenance immediately.
                </Text>
              </Surface>
            </Card.Content>
          </Card>
        )}

        {/* Signature & Submit */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Driver Certification
            </Text>
            
            <Text variant="bodyMedium" style={styles.certificationText}>
              I certify that the above inspection was performed by me and that the defects, if any, were noted and brought to the attention of the carrier.
            </Text>
            
            <View style={styles.signatureRow}>
              <Text variant="bodyMedium">Driver Signature: </Text>
              <Chip icon={() => <CheckCircle size={16} color="#4CAF50" />} style={styles.signatureChip}>
                {(user?.firstName + ' ' + user?.lastName) || 'John Doe'}
              </Chip>
            </View>
            
            <Text variant="bodySmall" style={styles.timestamp}>
              {new Date().toLocaleString()}
            </Text>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: hasDefects ? '#F44336' : '#4CAF50' }]}
            contentStyle={styles.submitButtonContent}
          >
            {hasDefects ? 'Submit DVIR - Vehicle Out of Service' : 'Submit DVIR - Vehicle Safe for Operation'}
          </Button>
        </View>
      </ScrollView>
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
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  headerItem: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
  },
  fullInput: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976D2',
  },
  inspectionItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    margin: 0,
    padding: 4,
  },
  activeButton: {
    backgroundColor: '#e3f2fd',
  },
  remarksInput: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusSummary: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
  defectItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  defectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  defectText: {
    fontWeight: 'bold',
  },
  defectRemarks: {
    marginLeft: 24,
    fontStyle: 'italic',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontWeight: 'bold',
  },
  certificationText: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureChip: {
    backgroundColor: '#E8F5E8',
  },
  timestamp: {
    opacity: 0.7,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
