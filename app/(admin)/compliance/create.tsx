import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  useTheme,
  SegmentedButtons,
  List,
  Switch,
  Divider,
  Surface
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Shield, 
  Truck,
  CheckCircle,
  Clock,
  User
} from '../../../utils/icons';

interface ComplianceFormData {
  type: 'safety' | 'maintenance' | 'dot' | 'driver' | 'environmental';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedDriver: string;
  vehicleId: string;
  dueDate: string;
  requiresDocumentation: boolean;
  isRecurring: boolean;
  recurringInterval: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  complianceCategory: string;
  regulations: string[];
}

const complianceTypes = [
  { value: 'safety', label: 'Safety' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'dot', label: 'DOT' },
  { value: 'driver', label: 'Driver' },
  { value: 'environmental', label: 'Environmental' }
];

const priorityLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const recurringOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const mockDrivers = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Wilson' },
  { id: '4', name: 'Lisa Anderson' }
];

const mockVehicles = [
  { id: '1', name: 'Truck #101 - Peterbilt 579' },
  { id: '2', name: 'Truck #102 - Freightliner Cascadia' },
  { id: '3', name: 'Truck #103 - Volvo VNL' },
  { id: '4', name: 'Trailer #201 - Dry Van' }
];

export default function CreateComplianceScreen() {
  const theme = useTheme();
  
  const [formData, setFormData] = useState<ComplianceFormData>({
    type: 'safety',
    title: '',
    description: '',
    priority: 'medium',
    assignedDriver: '',
    vehicleId: '',
    dueDate: '',
    requiresDocumentation: true,
    isRecurring: false,
    recurringInterval: 'monthly',
    complianceCategory: '',
    regulations: []
  });

  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    input: {
      marginBottom: 16,
    },
    footer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    priorityButton: {
      marginBottom: 8,
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    typeCard: {
      padding: 12,
      borderRadius: 8,
      minWidth: '30%',
      alignItems: 'center',
      borderWidth: 1,
    },
    typeIcon: {
      marginBottom: 4,
    },
    typeLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
  });

  const updateFormData = (field: keyof ComplianceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.dueDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Compliance item created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create compliance item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safety': return <Shield size={20} color={theme.colors.primary} />;
      case 'maintenance': return <Truck size={20} color={theme.colors.primary} />;
      case 'dot': return <FileText size={20} color={theme.colors.primary} />;
      case 'driver': return <User size={20} color={theme.colors.primary} />;
      case 'environmental': return <AlertTriangle size={20} color={theme.colors.primary} />;
      default: return <FileText size={20} color={theme.colors.primary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button 
          mode="text" 
          onPress={() => router.back()}
          icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
          style={{ marginRight: 8 }}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={{ flex: 1, color: theme.colors.onSurface }}>
          Create Compliance Item
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Compliance Type */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Compliance Type</Text>
            
            <View style={styles.typeGrid}>
              {complianceTypes.map((type) => (
                <Surface
                  key={type.value}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: formData.type === type.value ? theme.colors.primaryContainer : 'transparent',
                      borderColor: formData.type === type.value ? theme.colors.primary : theme.colors.outline,
                    }
                  ]}
                  onPress={() => updateFormData('type', type.value)}
                >
                  <View style={styles.typeIcon}>
                    {getTypeIcon(type.value)}
                  </View>
                  <Text 
                    style={[
                      styles.typeLabel,
                      { 
                        color: formData.type === type.value ? theme.colors.primary : theme.colors.onSurface,
                        fontWeight: formData.type === type.value ? 'bold' : 'normal'
                      }
                    ]}
                  >
                    {type.label}
                  </Text>
                </Surface>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="Title *"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., DOT Safety Inspection"
              left={<TextInput.Icon icon={() => <FileText size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Describe the compliance requirement..."
            />

            <TextInput
              label="Due Date *"
              value={formData.dueDate}
              onChangeText={(text) => updateFormData('dueDate', text)}
              mode="outlined"
              style={styles.input}
              placeholder="MM/DD/YYYY"
              left={<TextInput.Icon icon={() => <Calendar size={20} color={theme.colors.onSurfaceVariant} />} />}
            />

            <TextInput
              label="Compliance Category"
              value={formData.complianceCategory}
              onChangeText={(text) => updateFormData('complianceCategory', text)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Federal Motor Carrier Safety"
            />
          </Card.Content>
        </Card>

        {/* Priority Level */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            
            <SegmentedButtons
              value={formData.priority}
              onValueChange={(value) => updateFormData('priority', value)}
              buttons={priorityLevels.map(level => ({
                ...level,
                style: { 
                  backgroundColor: formData.priority === level.value ? getPriorityColor(level.value) + '20' : 'transparent'
                }
              }))}
            />
          </Card.Content>
        </Card>

        {/* Assignment */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Assignment</Text>
            
            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              Assigned Driver
            </Text>
            {mockDrivers.map((driver) => (
              <List.Item
                key={driver.id}
                title={driver.name}
                left={() => <User size={20} color={theme.colors.primary} />}
                right={() => 
                  formData.assignedDriver === driver.id ? 
                    <CheckCircle size={20} color={theme.colors.primary} /> : null
                }
                onPress={() => updateFormData('assignedDriver', driver.id)}
                style={{
                  backgroundColor: formData.assignedDriver === driver.id ? theme.colors.primaryContainer : 'transparent',
                  borderRadius: 8,
                  marginBottom: 4,
                }}
              />
            ))}

            <Divider style={{ marginVertical: 16 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
              Vehicle/Equipment
            </Text>
            {mockVehicles.map((vehicle) => (
              <List.Item
                key={vehicle.id}
                title={vehicle.name}
                left={() => <Truck size={20} color={theme.colors.primary} />}
                right={() => 
                  formData.vehicleId === vehicle.id ? 
                    <CheckCircle size={20} color={theme.colors.primary} /> : null
                }
                onPress={() => updateFormData('vehicleId', vehicle.id)}
                style={{
                  backgroundColor: formData.vehicleId === vehicle.id ? theme.colors.primaryContainer : 'transparent',
                  borderRadius: 8,
                  marginBottom: 4,
                }}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Requires Documentation</Text>
              <Switch
                value={formData.requiresDocumentation}
                onValueChange={(value) => updateFormData('requiresDocumentation', value)}
              />
            </View>
            
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              Completion will require document upload or photo evidence
            </Text>

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Recurring Compliance</Text>
              <Switch
                value={formData.isRecurring}
                onValueChange={(value) => updateFormData('isRecurring', value)}
              />
            </View>
            
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              Automatically create future compliance items
            </Text>

            {formData.isRecurring && (
              <>
                <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
                  Recurring Interval
                </Text>
                <SegmentedButtons
                  value={formData.recurringInterval}
                  onValueChange={(value) => updateFormData('recurringInterval', value)}
                  buttons={recurringOptions}
                />
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
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
          onPress={handleSave}
          style={styles.button}
          loading={loading}
          disabled={loading}
          icon={() => <Save size={20} color="#FFFFFF" />}
        >
          Create Compliance
        </Button>
      </View>
    </View>
  );
}
