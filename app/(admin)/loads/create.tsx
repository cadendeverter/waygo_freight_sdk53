import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Switch, 
  Chip,
  useTheme,
  Appbar,
  ActivityIndicator
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, Thermometer, AlertTriangle, Truck } from '../../../utils/icons';
import { useLoad } from '../../../state/loadContext';
import AddressAutocomplete from '../../../components/AddressAutocomplete';
import DatePickerInput from '../../../components/DatePickerInput';

interface LoadFormData {
  loadNumber: string;
  customerId: string;
  commodity: string;
  weight: string;
  pieces: string;
  equipment: 'dry_van' | 'reefer' | 'flatbed' | 'tanker' | 'container';
  rate: string;
  fuelSurcharge: string;
  // Origin
  originName: string;
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  // Destination
  destinationName: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  // Dates
  pickupDate: Date | undefined;
  deliveryDate: Date | undefined;
  // Special requirements
  hazmat: boolean;
  hazmatClass: string;
  temperatureMin: string;
  temperatureMax: string;
  instructions: string;
}

const equipmentTypes = [
  { value: 'dry_van', label: 'Dry Van' },
  { value: 'reefer', label: 'Reefer' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'container', label: 'Container' },
];

export default function CreateLoadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createLoad } = useLoad();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<LoadFormData>({
    loadNumber: `LD${Date.now().toString().slice(-6)}`,
    customerId: '',
    commodity: '',
    weight: '',
    pieces: '',
    equipment: 'dry_van',
    rate: '',
    fuelSurcharge: '',
    originName: '',
    originAddress: '',
    originCity: '',
    originState: '',
    originZip: '',
    destinationName: '',
    destinationAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    pickupDate: undefined,
    deliveryDate: undefined,
    hazmat: false,
    hazmatClass: '',
    temperatureMin: '',
    temperatureMax: '',
    instructions: '',
  });

  const updateFormData = (key: keyof LoadFormData, value: string | boolean | Date | undefined) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const required = [
      'commodity', 'weight', 'pieces', 'rate',
      'originName', 'originAddress', 'originCity', 'originState',
      'destinationName', 'destinationAddress', 'destinationCity', 'destinationState'
    ];

    for (const field of required) {
      if (!formData[field as keyof LoadFormData]) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    }

    // Validate dates separately
    if (!formData.pickupDate) {
      errors.pickupDate = 'Pickup date is required';
    }

    if (!formData.deliveryDate) {
      errors.deliveryDate = 'Delivery date is required';
    }

    if (formData.deliveryDate && formData.pickupDate && formData.deliveryDate <= formData.pickupDate) {
      errors.deliveryDate = 'Delivery date must be after pickup date';
    }

    // Validate temperature fields
    if (formData.equipment === 'reefer' && (formData.temperatureMin || formData.temperatureMax)) {
      if (!formData.temperatureMin || !formData.temperatureMax) {
        errors.temperatureMin = 'Both minimum and maximum temperature are required for reefer equipment';
      }

      if (isNaN(parseFloat(formData.temperatureMin)) || isNaN(parseFloat(formData.temperatureMax))) {
        errors.temperatureMin = 'Temperature values must be numbers';
      }

      if (parseFloat(formData.temperatureMin) > parseFloat(formData.temperatureMax)) {
        errors.temperatureMin = 'Minimum temperature cannot be greater than maximum temperature';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields before submitting.');
      return;
    }

    try {
      setLoading(true);

      const loadData = {
        loadNumber: `WF-${Date.now()}`,
        companyId: 'dev-company',
        customerId: formData.customerId,
        status: 'pending' as const,
        priority: 'normal' as const,
        origin: {
          sequence: 1,
          type: 'pickup' as const,
          facility: {
            name: formData.originName,
            address: {
              street: formData.originAddress,
              city: formData.originCity,
              state: formData.originState,
              zipCode: formData.originZip,
              country: 'US',
            },
            hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM',
          },
          status: 'pending' as const,
          contacts: [],
        },
        destination: {
          sequence: 2,
          type: 'delivery' as const,
          facility: {
            name: formData.destinationName,
            address: {
              street: formData.destinationAddress,
              city: formData.destinationCity,
              state: formData.destinationState,
              zipCode: formData.destinationZip,
              country: 'US',
            },
            hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM',
          },
          status: 'pending' as const,
          contacts: [],
        },
        stops: [],
        commodity: formData.commodity,
        weight: parseFloat(formData.weight) || 0,
        pieces: parseInt(formData.pieces) || 0,
        equipment: formData.equipment,
        // Only include temperature if it's a reefer and has valid temperature data
        ...(formData.equipment === 'reefer' && formData.temperatureMin && !isNaN(parseFloat(formData.temperatureMin)) && {
          temperature: {
            min: parseFloat(formData.temperatureMin),
            max: parseFloat(formData.temperatureMax) || parseFloat(formData.temperatureMin),
            unit: 'F' as const,
          }
        }),
        hazmat: formData.hazmat,
        // Only include hazmatClass if hazmat is true and class is provided
        ...(formData.hazmat && formData.hazmatClass && { hazmatClass: formData.hazmatClass }),
        rate: parseFloat(formData.rate) || 0,
        fuelSurcharge: parseFloat(formData.fuelSurcharge) || 0,
        accessorials: [],
        totalCharges: (parseFloat(formData.rate) || 0) + (parseFloat(formData.fuelSurcharge) || 0),
        pickupDate: formData.pickupDate!,
        deliveryDate: formData.deliveryDate!,
        estimatedTransitTime: 0,
        documents: [],
        tracking: [],
        referenceNumbers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createLoad(loadData);
      Alert.alert('Success', 'Load created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating load:', error);
      Alert.alert('Error', 'Failed to create load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Create New Load</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter load details and shipment information
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Load Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Package size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>Load Information</Text>
            </View>

            <TextInput
              label="Load Number"
              value={formData.loadNumber}
              onChangeText={(value) => updateFormData('loadNumber', value)}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Commodity"
              value={formData.commodity}
              onChangeText={(value) => updateFormData('commodity', value)}
              style={[styles.input, validationErrors.commodity ? styles.errorInput : {}]}
              mode="outlined"
              placeholder="e.g., Electronics, Food Products, Machinery"
            />

            <View style={styles.row}>
              <TextInput
                label="Weight (lbs)"
                value={formData.weight}
                onChangeText={(value) => updateFormData('weight', value)}
                style={[styles.input, styles.halfWidth, validationErrors.weight ? styles.errorInput : {}]}
                mode="outlined"
                keyboardType="numeric"
              />
              <TextInput
                label="Pieces"
                value={formData.pieces}
                onChangeText={(value) => updateFormData('pieces', value)}
                style={[styles.input, styles.halfWidth, validationErrors.pieces ? styles.errorInput : {}]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>

            <Text variant="bodyMedium" style={styles.label}>Equipment Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {equipmentTypes.map((type) => (
                <Chip
                  key={type.value}
                  mode={formData.equipment === type.value ? 'flat' : 'outlined'}
                  onPress={() => updateFormData('equipment', type.value)}
                  style={[
                    styles.equipmentChip,
                    formData.equipment === type.value && { backgroundColor: theme.colors.primary }
                  ]}
                  textStyle={formData.equipment === type.value ? { color: '#FFFFFF' } : {}}
                >
                  {type.label}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Origin Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#4CAF50" />
              <Text variant="titleMedium" style={styles.sectionTitle}>Pickup Location</Text>
            </View>

            <TextInput
              label="Facility Name"
              value={formData.originName}
              onChangeText={(value) => updateFormData('originName', value)}
              style={[styles.input, validationErrors.originName ? styles.errorInput : {}]}
              mode="outlined"
            />

            <AddressAutocomplete
              label="Address"
              value={formData.originAddress}
              onChangeText={(value) => updateFormData('originAddress', value)}
              onAddressSelected={(addressComponents) => {
                updateFormData('originAddress', addressComponents.street);
                updateFormData('originCity', addressComponents.city);
                updateFormData('originState', addressComponents.state);
                updateFormData('originZip', addressComponents.zipCode);
              }}
              style={[styles.input, validationErrors.originAddress ? styles.errorInput : {}]}
              mode="outlined"
              placeholder="Enter pickup address..."
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={formData.originCity}
                onChangeText={(value) => updateFormData('originCity', value)}
                style={[styles.input, styles.halfWidth, validationErrors.originCity ? styles.errorInput : {}]}
                mode="outlined"
              />
              <TextInput
                label="State"
                value={formData.originState}
                onChangeText={(value) => updateFormData('originState', value)}
                style={[styles.input, styles.quarterWidth, validationErrors.originState ? styles.errorInput : {}]}
                mode="outlined"
              />
              <TextInput
                label="ZIP"
                value={formData.originZip}
                onChangeText={(value) => updateFormData('originZip', value)}
                style={[styles.input, styles.quarterWidth, validationErrors.originZip ? styles.errorInput : {}]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Destination Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#F44336" />
              <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Location</Text>
            </View>

            <TextInput
              label="Facility Name"
              value={formData.destinationName}
              onChangeText={(value) => updateFormData('destinationName', value)}
              style={[styles.input, validationErrors.destinationName ? styles.errorInput : {}]}
              mode="outlined"
            />

            <AddressAutocomplete
              label="Address"
              value={formData.destinationAddress}
              onChangeText={(value) => updateFormData('destinationAddress', value)}
              onAddressSelected={(addressComponents) => {
                updateFormData('destinationAddress', addressComponents.street);
                updateFormData('destinationCity', addressComponents.city);
                updateFormData('destinationState', addressComponents.state);
                updateFormData('destinationZip', addressComponents.zipCode);
              }}
              style={[styles.input, validationErrors.destinationAddress ? styles.errorInput : {}]}
              mode="outlined"
              placeholder="Enter delivery address..."
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={formData.destinationCity}
                onChangeText={(value) => updateFormData('destinationCity', value)}
                style={[styles.input, styles.halfWidth, validationErrors.destinationCity ? styles.errorInput : {}]}
                mode="outlined"
              />
              <TextInput
                label="State"
                value={formData.destinationState}
                onChangeText={(value) => updateFormData('destinationState', value)}
                style={[styles.input, styles.quarterWidth, validationErrors.destinationState ? styles.errorInput : {}]}
                mode="outlined"
              />
              <TextInput
                label="ZIP"
                value={formData.destinationZip}
                onChangeText={(value) => updateFormData('destinationZip', value)}
                style={[styles.input, styles.quarterWidth, validationErrors.destinationZip ? styles.errorInput : {}]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Dates and Pricing */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>Schedule & Pricing</Text>
            </View>

            <View style={styles.row}>
              <DatePickerInput
                label="Pickup Date"
                value={formData.pickupDate}
                onDateChange={(value) => updateFormData('pickupDate', value)}
                style={[styles.input, styles.halfWidth, validationErrors.pickupDate ? styles.errorInput : {}]}
                mode="date"
                minimumDate={new Date()}
              />
              <DatePickerInput
                label="Delivery Date"
                value={formData.deliveryDate}
                onDateChange={(value) => updateFormData('deliveryDate', value)}
                style={[styles.input, styles.halfWidth, validationErrors.deliveryDate ? styles.errorInput : {}]}
                mode="date"
                minimumDate={formData.pickupDate || new Date()}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Rate ($)"
                value={formData.rate}
                onChangeText={(value) => updateFormData('rate', value)}
                style={[styles.input, styles.halfWidth, validationErrors.rate ? styles.errorInput : {}]}
                mode="outlined"
                keyboardType="numeric"
              />
              <TextInput
                label="Fuel Surcharge ($)"
                value={formData.fuelSurcharge}
                onChangeText={(value) => updateFormData('fuelSurcharge', value)}
                style={[styles.input, styles.halfWidth, validationErrors.fuelSurcharge ? styles.errorInput : {}]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Special Requirements */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Truck size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>Special Requirements</Text>
            </View>

            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Hazmat</Text>
              <Switch
                value={formData.hazmat}
                onValueChange={(value) => updateFormData('hazmat', value)}
              />
            </View>

            {formData.hazmat && (
              <TextInput
                label="Hazmat Class"
                value={formData.hazmatClass}
                onChangeText={(value) => updateFormData('hazmatClass', value)}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., Class 3 - Flammable Liquids"
              />
            )}

            {formData.equipment === 'reefer' && (
              <View style={styles.row}>
                <TextInput
                  label="Min Temp (°F)"
                  value={formData.temperatureMin}
                  onChangeText={(value) => updateFormData('temperatureMin', value)}
                  style={[styles.input, styles.halfWidth, validationErrors.temperatureMin ? styles.errorInput : {}]}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <TextInput
                  label="Max Temp (°F)"
                  value={formData.temperatureMax}
                  onChangeText={(value) => updateFormData('temperatureMax', value)}
                  style={[styles.input, styles.halfWidth, validationErrors.temperatureMax ? styles.errorInput : {}]}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
            )}

            <TextInput
              label="Special Instructions"
              value={formData.instructions}
              onChangeText={(value) => updateFormData('instructions', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Create Load
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    zIndex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  card: {
    marginBottom: 16,
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
    zIndex: 1,
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  quarterWidth: {
    flex: 0.5,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
  },
  chipContainer: {
    marginBottom: 12,
  },
  equipmentChip: {
    marginRight: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
    zIndex: 1,
  },
  button: {
    flex: 1,
  },
});
