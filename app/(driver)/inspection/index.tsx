import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, List, TextInput, useTheme, FAB, Switch } from 'react-native-paper';
import { useAuth } from '../../../state/authContext';
import { useFleet } from '../../../state/fleetContext';
import { FileText, Check, X, Camera, AlertTriangle, Truck, Settings } from '../../../utils/icons';
import { InspectionRecord, InspectionItem, InspectionStatus, Vehicle } from '../../../types';

const INSPECTION_CATEGORIES = [
  {
    id: 'engine',
    title: 'Engine Compartment',
    items: [
      'Engine oil level',
      'Coolant level',
      'Power steering fluid',
      'Windshield washer fluid',
      'Battery condition',
      'Belts and hoses',
      'Air filter',
      'Leaks (oil, coolant, fuel)'
    ]
  },
  {
    id: 'exterior',
    title: 'Exterior',
    items: [
      'Headlights',
      'Tail lights',
      'Turn signals',
      'Hazard lights',
      'Reflectors',
      'Mirrors',
      'Windshield condition',
      'Wipers',
      'Horn',
      'Body damage'
    ]
  },
  {
    id: 'tires',
    title: 'Tires & Wheels',
    items: [
      'Tire condition (front)',
      'Tire condition (rear)',
      'Tire pressure',
      'Wheel condition',
      'Lug nuts',
      'Spare tire',
      'Tire tread depth'
    ]
  },
  {
    id: 'brakes',
    title: 'Brakes',
    items: [
      'Brake pedal',
      'Parking brake',
      'Air brake system',
      'Brake lines',
      'Brake fluid level',
      'ABS warning lights'
    ]
  },
  {
    id: 'interior',
    title: 'Interior',
    items: [
      'Steering wheel',
      'Seat belts',
      'Seat condition',
      'Dashboard instruments',
      'Warning lights',
      'HVAC system',
      'Emergency equipment',
      'Fire extinguisher'
    ]
  }
];

export default function InspectionScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { vehicles } = useFleet();
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [inspectionData, setInspectionData] = useState<{[key: string]: InspectionItem}>({});
  const [notes, setNotes] = useState('');
  const [defectsFound, setDefectsFound] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize inspection data
    const initialData: {[key: string]: InspectionItem} = {};
    INSPECTION_CATEGORIES.forEach(category => {
      category.items.forEach(item => {
        const key = `${category.id}_${item.replace(/\s+/g, '_').toLowerCase()}`;
        initialData[key] = {
          id: key,
          name: item,
          category: category.id,
          status: 'satisfactory',
          notes: ''
        };
      });
    });
    setInspectionData(initialData);
  }, []);

  const updateInspectionItem = (key: string, status: InspectionStatus, itemNotes?: string) => {
    setInspectionData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status,
        notes: itemNotes || ''
      }
    }));

    // Check if any defects are found
    const hasDefects = Object.values({
      ...inspectionData,
      [key]: { ...inspectionData[key], status }
    }).some(item => item.status === 'unsatisfactory');
    setDefectsFound(hasDefects);
  };

  const submitInspection = async () => {
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const inspection: InspectionRecord = {
        id: Date.now().toString(),
        vehicleId: selectedVehicle,
        driverId: user.uid,
        date: new Date().toISOString(),
        type: 'pre_trip',
        status: defectsFound ? 'failed' : 'passed',
        items: Object.values(inspectionData),
        defectsFound,
        notes,
        signatureUrl: '' // Would be captured in a real implementation
      };

      // In a real implementation, this would save to Firebase
      console.log('Inspection submitted:', inspection);
      
      Alert.alert(
        'Inspection Submitted',
        defectsFound 
          ? 'Defects found. Vehicle should not be operated until repairs are completed.'
          : 'Pre-trip inspection completed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedVehicle('');
              setNotes('');
              setDefectsFound(false);
              // Reset inspection data
              const resetData: {[key: string]: InspectionItem} = {};
              INSPECTION_CATEGORIES.forEach(category => {
                category.items.forEach(item => {
                  const key = `${category.id}_${item.replace(/\s+/g, '_').toLowerCase()}`;
                  resetData[key] = {
                    id: key,
                    name: item,
                    category: category.id,
                    status: 'satisfactory',
                    notes: ''
                  };
                });
              });
              setInspectionData(resetData);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting inspection:', error);
      Alert.alert('Error', 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case 'satisfactory': return '#4CAF50';
      case 'unsatisfactory': return '#F44336';
      case 'not_applicable': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: InspectionStatus) => {
    switch (status) {
      case 'satisfactory': return <Check size={20} color="#4CAF50" />;
      case 'unsatisfactory': return <X size={20} color="#F44336" />;
      case 'not_applicable': return <Settings size={20} color="#757575" />;
      default: return <Settings size={20} color="#757575" />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header Card */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Truck size={24} color="#2196F3" />
              <Text variant="headlineSmall" style={{ marginLeft: 8 }}>
                Pre-Trip Inspection
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              Complete your daily vehicle inspection before starting your trip. Check all items carefully and report any defects.
            </Text>

            {/* Vehicle Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                Select Vehicle:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {vehicles.map(vehicle => (
                  <Chip
                    key={vehicle.id}
                    selected={selectedVehicle === vehicle.id}
                    onPress={() => setSelectedVehicle(vehicle.id)}
                    mode={selectedVehicle === vehicle.id ? 'flat' : 'outlined'}
                  >
                    {vehicle.vehicleNumber}
                  </Chip>
                ))}
              </View>
            </View>

            {defectsFound && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#FFF3E0',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#FF9800'
              }}>
                <AlertTriangle size={20} color="#FF9800" />
                <Text style={{ marginLeft: 8, color: '#E65100', flex: 1 }}>
                  Defects found. Vehicle should not be operated until repairs are completed.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Inspection Categories */}
        {INSPECTION_CATEGORIES.map(category => (
          <Card key={category.id} style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                {category.title}
              </Text>
              
              {category.items.map(item => {
                const key = `${category.id}_${item.replace(/\s+/g, '_').toLowerCase()}`;
                const inspectionItem = inspectionData[key];
                
                return (
                  <View key={key} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text variant="bodyMedium" style={{ flex: 1 }}>
                        {item}
                      </Text>
                      {getStatusIcon(inspectionItem?.status || 'satisfactory')}
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                      <Button
                        mode={inspectionItem?.status === 'satisfactory' ? 'contained' : 'outlined'}
                        onPress={() => updateInspectionItem(key, 'satisfactory')}
                        style={{ flex: 1 }}
                        buttonColor={inspectionItem?.status === 'satisfactory' ? '#4CAF50' : undefined}
                      >
                        Good
                      </Button>
                      
                      <Button
                        mode={inspectionItem?.status === 'unsatisfactory' ? 'contained' : 'outlined'}
                        onPress={() => updateInspectionItem(key, 'unsatisfactory')}
                        style={{ flex: 1 }}
                        buttonColor={inspectionItem?.status === 'unsatisfactory' ? '#F44336' : undefined}
                      >
                        Defect
                      </Button>
                      
                      <Button
                        mode={inspectionItem?.status === 'not_applicable' ? 'contained' : 'outlined'}
                        onPress={() => updateInspectionItem(key, 'not_applicable')}
                        style={{ flex: 1 }}
                        buttonColor={inspectionItem?.status === 'not_applicable' ? '#757575' : undefined}
                      >
                        N/A
                      </Button>
                    </View>
                    
                    {inspectionItem?.status === 'unsatisfactory' && (
                      <TextInput
                        label="Describe the defect"
                        value={inspectionItem.notes}
                        onChangeText={(text) => updateInspectionItem(key, 'unsatisfactory', text)}
                        mode="outlined"
                        multiline
                        numberOfLines={2}
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        ))}

        {/* Additional Notes */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Additional Notes
            </Text>
            
            <TextInput
              label="Additional comments or observations"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Any additional notes about the vehicle condition..."
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={submitInspection}
          loading={loading}
          disabled={!selectedVehicle || loading}
          style={{ marginBottom: 32 }}
          buttonColor={defectsFound ? '#FF9800' : '#4CAF50'}
        >
          {defectsFound ? 'Submit Inspection - Defects Found' : 'Submit Inspection - No Defects'}
        </Button>
      </ScrollView>

      {/* Photo FAB */}
      <FAB
        icon={() => <Camera size={24} color="#fff" />}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#2196F3'
        }}
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Photo capture for defect documentation will be available soon.');
        }}
      />
    </View>
  );
}
