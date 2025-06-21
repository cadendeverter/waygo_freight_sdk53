import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Text, 
  Card, 
  Button, 
  TextInput,
  SegmentedButtons,
  Switch,
  Chip,
  Menu,
  Divider
} from 'react-native-paper';
import { useTheme } from '../../../../theme/ThemeContext';
import { useFleet } from '../../../../state/fleetContext';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { 
  Truck, 
  ArrowLeft, 
  Calendar, 
  Wrench, 
  Shield,
  Fuel,
  MapPin,
  ChevronDown
} from '../../../../utils/icons';

interface VehicleFormData {
  vehicleId: string;
  manufacturer: string;
  model: string;
  year: string;
  licensePlate: string;
  vin: string;
  equipmentType: 'tractor' | 'trailer' | 'van' | 'straight_truck';
  status: 'active' | 'maintenance' | 'inactive';
  
  // Maintenance tracking
  odometer: string;
  lastServiceDate: Date | null;
  nextServiceDue: string;
  insuranceExpiry: Date | null;
  registrationExpiry: Date | null;
  
  // Specifications
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  maxWeight: string;
  color: string;
  notes: string;
  
  // Safety & Compliance
  dotInspectionExpiry: Date | null;
  hasGPS: boolean;
  hasELD: boolean;
  hasDashCam: boolean;
}

export default function CreateVehicleScreen() {
  const { theme } = useTheme();
  const { addVehicle, vehicles } = useFleet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Dropdown states
  const [manufacturerMenuVisible, setManufacturerMenuVisible] = useState(false);
  const [modelMenuVisible, setModelMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [isCustomManufacturer, setIsCustomManufacturer] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleId: `VH${Date.now().toString().slice(-6)}`,
    manufacturer: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    equipmentType: 'tractor',
    status: 'active',
    odometer: '',
    lastServiceDate: null,
    nextServiceDue: '',
    insuranceExpiry: null,
    registrationExpiry: null,
    fuelType: 'diesel',
    maxWeight: '',
    color: '',
    notes: '',
    dotInspectionExpiry: null,
    hasGPS: true,
    hasELD: true,
    hasDashCam: false,
  });

  // Dropdown options
  const manufacturerOptions = [
    'Peterbilt', 'Freightliner', 'Kenworth', 'Mack', 'Volvo', 
    'International', 'Western Star', 'Ford', 'Chevrolet', 'Custom'
  ];

  const modelOptions: Record<string, string[]> = {
    'Peterbilt': ['579', '389', '567', '520', '348', 'Custom'],
    'Freightliner': ['Cascadia', 'Century', 'Columbia', 'Coronado', 'Custom'],
    'Kenworth': ['T680', 'T880', 'W990', 'T270', 'T370', 'Custom'],
    'Mack': ['Anthem', 'Pinnacle', 'Granite', 'TerraPro', 'Custom'],
    'Volvo': ['VNL', 'VNR', 'VHD', 'VAH', 'Custom'],
    'International': ['LT', 'RH', 'HX', 'MV', 'Custom'],
    'Western Star': ['4700', '4900', '5700', '6900', 'Custom'],
    'Ford': ['F-150', 'F-250', 'F-350', 'F-450', 'E-Series', 'Transit', 'Custom'],
    'Chevrolet': ['Silverado 1500', 'Silverado 2500', 'Silverado 3500', 'Express', 'Custom'],
    'Custom': ['Custom']
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 35 }, (_, i) => (currentYear - i).toString());

  const colorOptions = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 
    'Yellow', 'Orange', 'Brown', 'Maroon', 'Custom'
  ];

  const updateFormData = (key: keyof VehicleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear validation error when field is updated
    if (validationErrors[key]) {
      setValidationErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleManufacturerSelect = (manufacturer: string) => {
    if (manufacturer === 'Custom') {
      setIsCustomManufacturer(true);
      updateFormData('manufacturer', '');
    } else {
      setIsCustomManufacturer(false);
      updateFormData('manufacturer', manufacturer);
      // Reset model if manufacturer changes
      setIsCustomModel(false);
      updateFormData('model', '');
    }
    setManufacturerMenuVisible(false);
  };

  const handleModelSelect = (model: string) => {
    if (model === 'Custom') {
      setIsCustomModel(true);
      updateFormData('model', '');
    } else {
      setIsCustomModel(false);
      updateFormData('model', model);
    }
    setModelMenuVisible(false);
  };

  const handleColorSelect = (color: string) => {
    if (color === 'Custom') {
      setIsCustomColor(true);
      updateFormData('color', '');
    } else {
      setIsCustomColor(false);
      updateFormData('color', color);
    }
    setColorMenuVisible(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.manufacturer.trim()) {
      errors.manufacturer = 'Manufacturer is required';
    }
    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }
    if (!formData.year.trim()) {
      errors.year = 'Year is required';
    } else if (!/^\d{4}$/.test(formData.year) || parseInt(formData.year) < 1990 || parseInt(formData.year) > new Date().getFullYear() + 1) {
      errors.year = 'Please enter a valid year';
    }
    if (!formData.licensePlate.trim()) {
      errors.licensePlate = 'License plate is required';
    }
    if (!formData.vin.trim()) {
      errors.vin = 'VIN is required';
    } else if (formData.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters';
    } else if (!/^[A-HJ-NPR-Z0-9]+$/.test(formData.vin)) {
      errors.vin = 'VIN can only contain letters and numbers';
    } else if (vehicles.some(vehicle => vehicle.vin === formData.vin)) {
      errors.vin = 'VIN already exists in fleet';
    }
    if (!formData.odometer.trim()) {
      errors.odometer = 'Current mileage is required';
    } else if (isNaN(parseInt(formData.odometer))) {
      errors.odometer = 'Mileage must be a number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Map form data to Vehicle type structure
      const vehicleData = {
        vehicleNumber: formData.vehicleId,
        vin: formData.vin.toUpperCase(),
        make: formData.manufacturer,
        model: formData.model,
        year: parseInt(formData.year),
        plateNumber: formData.licensePlate.toUpperCase(),
        type: formData.equipmentType === 'tractor' ? 'tractor' : formData.equipmentType as 'trailer' | 'van' | 'straight_truck',
        status: formData.status as 'active' | 'maintenance' | 'out_of_service',
        companyId: '', // This will be set by the fleet context
        telematics: {
          odometer: parseInt(formData.odometer),
          engineHours: 0,
          fuelLevel: 75,
          speed: 0,
          engineRpm: 0,
          batteryVoltage: 12.5,
          engineCoolantTemp: 180,
          oilPressure: 40,
          diagnosticCodes: [],
          lastUpdate: new Date()
        },
        maintenance: [],
        inspections: []
      };

      await addVehicle(vehicleData);
      
      Alert.alert(
        'Success',
        'Vehicle has been added to your fleet successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const equipmentOptions = [
    { value: 'tractor', label: 'Tractor' },
    { value: 'trailer', label: 'Trailer' },
    { value: 'van', label: 'Van' },
    { value: 'straight_truck', label: 'Straight Truck' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const fuelOptions = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Add New Vehicle',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerLeft: () => (
            <Button
              mode="text"
              onPress={() => router.back()}
              icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
            >
              Back
            </Button>
          ),
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Basic Information */}
        <Card style={{ margin: 16, marginBottom: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Truck size={20} color={theme.colors.primary} />
              <Text variant="titleLarge" style={{ marginLeft: 12, fontWeight: '600' }}>
                Basic Information
              </Text>
            </View>

            <TextInput
              label="Vehicle ID"
              value={formData.vehicleId}
              onChangeText={(value) => updateFormData('vehicleId', value)}
              style={{ marginBottom: 12 }}
              mode="outlined"
              disabled
            />

            <Menu
              visible={manufacturerMenuVisible}
              onDismiss={() => setManufacturerMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                  labelStyle={{ color: theme.colors.onSurface }}
                  onPress={() => setManufacturerMenuVisible(true)}
                >
                  {formData.manufacturer || 'Select Manufacturer'}
                  <ChevronDown size={20} color={theme.colors.onSurface} style={{ marginLeft: 4 }} />
                </Button>
              }
            >
              {manufacturerOptions.map((manufacturer: string, index: number) => (
                <Menu.Item
                  key={index}
                  title={manufacturer}
                  onPress={() => handleManufacturerSelect(manufacturer)}
                />
              ))}
            </Menu>

            {isCustomManufacturer && (
              <TextInput
                label="Manufacturer"
                value={formData.manufacturer}
                onChangeText={(value) => updateFormData('manufacturer', value)}
                style={{ marginBottom: 12 }}
                mode="outlined"
                error={!!validationErrors.manufacturer}
              />
            )}

            <Menu
              visible={modelMenuVisible}
              onDismiss={() => setModelMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                  labelStyle={{ color: theme.colors.onSurface }}
                  onPress={() => setModelMenuVisible(true)}
                  disabled={!formData.manufacturer || isCustomManufacturer}
                >
                  {formData.model || 'Select Model'}
                  <ChevronDown size={20} color={theme.colors.onSurface} style={{ marginLeft: 4 }} />
                </Button>
              }
            >
              {(modelOptions[formData.manufacturer] || []).map((model: string, index: number) => (
                <Menu.Item
                  key={index}
                  title={model}
                  onPress={() => handleModelSelect(model)}
                />
              ))}
            </Menu>

            {isCustomModel && (
              <TextInput
                label="Model"
                value={formData.model}
                onChangeText={(value) => updateFormData('model', value)}
                style={{ marginBottom: 12 }}
                mode="outlined"
                error={!!validationErrors.model}
              />
            )}

            <Menu
              visible={yearMenuVisible}
              onDismiss={() => setYearMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                  labelStyle={{ color: theme.colors.onSurface }}
                  onPress={() => setYearMenuVisible(true)}
                >
                  {formData.year || 'Select Year'}
                  <ChevronDown size={20} color={theme.colors.onSurface} style={{ marginLeft: 4 }} />
                </Button>
              }
            >
              {yearOptions.map((year: string, index: number) => (
                <Menu.Item
                  key={index}
                  title={year}
                  onPress={() => updateFormData('year', year)}
                />
              ))}
            </Menu>

            <Menu
              visible={colorMenuVisible}
              onDismiss={() => setColorMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                  labelStyle={{ color: theme.colors.onSurface }}
                  onPress={() => setColorMenuVisible(true)}
                >
                  {formData.color || 'Select Color'}
                  <ChevronDown size={20} color={theme.colors.onSurface} style={{ marginLeft: 4 }} />
                </Button>
              }
            >
              {colorOptions.map((color: string, index: number) => (
                <Menu.Item
                  key={index}
                  title={color}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </Menu>

            {isCustomColor && (
              <TextInput
                label="Color"
                value={formData.color}
                onChangeText={(value) => updateFormData('color', value)}
                style={{ marginBottom: 12 }}
                mode="outlined"
              />
            )}

            <Text variant="titleMedium" style={{ marginBottom: 8, marginTop: 8 }}>
              Equipment Type
            </Text>
            <SegmentedButtons
              value={formData.equipmentType}
              onValueChange={(value) => updateFormData('equipmentType', value)}
              buttons={equipmentOptions}
              style={{ marginBottom: 16 }}
            />

            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Status
            </Text>
            <SegmentedButtons
              value={formData.status}
              onValueChange={(value) => updateFormData('status', value)}
              buttons={statusOptions}
              style={{ marginBottom: 16 }}
            />
          </Card.Content>
        </Card>

        {/* Legal & Compliance */}
        <Card style={{ margin: 16, marginVertical: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Shield size={20} color={theme.colors.primary} />
              <Text variant="titleLarge" style={{ marginLeft: 12, fontWeight: '600' }}>
                Legal & Compliance
              </Text>
            </View>

            <TextInput
              label="License Plate *"
              value={formData.licensePlate}
              onChangeText={(value) => updateFormData('licensePlate', value.toUpperCase())}
              style={[{ marginBottom: 12 }, validationErrors.licensePlate ? { borderColor: 'red', borderWidth: 1 } : {}]}
              mode="outlined"
              error={!!validationErrors.licensePlate}
              placeholder="ABC-1234"
              autoCapitalize="characters"
            />

            <TextInput
              label="VIN (Vehicle Identification Number) *"
              value={formData.vin}
              onChangeText={(value) => updateFormData('vin', value.toUpperCase())}
              style={[{ marginBottom: 12 }, validationErrors.vin ? { borderColor: 'red', borderWidth: 1 } : {}]}
              mode="outlined"
              error={!!validationErrors.vin}
              placeholder="1HGBH41JXMN109186"
              autoCapitalize="characters"
              maxLength={17}
            />
            
            {validationErrors.vin && (
              <Text style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {validationErrors.vin}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Specifications */}
        <Card style={{ margin: 16, marginVertical: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Fuel size={20} color={theme.colors.primary} />
              <Text variant="titleLarge" style={{ marginLeft: 12, fontWeight: '600' }}>
                Specifications
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TextInput
                label="Current Mileage *"
                value={formData.odometer}
                onChangeText={(value) => updateFormData('odometer', value)}
                style={[{ flex: 1 }, validationErrors.odometer ? { borderColor: 'red', borderWidth: 1 } : {}]}
                mode="outlined"
                keyboardType="numeric"
                error={!!validationErrors.odometer}
                placeholder="125000"
              />
              <TextInput
                label="Max Weight (lbs)"
                value={formData.maxWeight}
                onChangeText={(value) => updateFormData('maxWeight', value)}
                style={{ flex: 1 }}
                mode="outlined"
                keyboardType="numeric"
                placeholder="80000"
              />
            </View>

            <Text variant="titleMedium" style={{ marginBottom: 8, marginTop: 8 }}>
              Fuel Type
            </Text>
            <SegmentedButtons
              value={formData.fuelType}
              onValueChange={(value) => updateFormData('fuelType', value)}
              buttons={fuelOptions}
              style={{ marginBottom: 16 }}
            />
          </Card.Content>
        </Card>

        {/* Technology & Safety */}
        <Card style={{ margin: 16, marginVertical: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: '600' }}>
              Technology & Safety Features
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text variant="bodyLarge">GPS Tracking</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Real-time location monitoring
                </Text>
              </View>
              <Switch
                value={formData.hasGPS}
                onValueChange={(value) => updateFormData('hasGPS', value)}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text variant="bodyLarge">Electronic Logging Device (ELD)</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Hours of service compliance
                </Text>
              </View>
              <Switch
                value={formData.hasELD}
                onValueChange={(value) => updateFormData('hasELD', value)}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text variant="bodyLarge">Dashboard Camera</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Video recording for safety
                </Text>
              </View>
              <Switch
                value={formData.hasDashCam}
                onValueChange={(value) => updateFormData('hasDashCam', value)}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card style={{ margin: 16, marginVertical: 8 }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: '600' }}>
              Additional Notes
            </Text>

            <TextInput
              label="Notes"
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              style={{ marginBottom: 16 }}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Any additional information about this vehicle..."
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <View style={{ padding: 16, paddingBottom: 32 }}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={{ padding: 8 }}
            contentStyle={{ height: 48 }}
          >
            {loading ? 'Adding Vehicle...' : 'Add Vehicle to Fleet'}
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
