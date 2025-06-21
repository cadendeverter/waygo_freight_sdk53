import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput, Button, SegmentedButtons, Switch, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLoad } from '../../../../state/loadContext';

type ActivityType = 'receiving' | 'shipping' | 'inventory' | 'cross_dock' | 'maintenance';

const CreateWarehouseActivity = () => {
  const theme = useTheme();
  const router = useRouter();
  const { loads } = useLoad();

  const [activityType, setActivityType] = useState<ActivityType>('receiving');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [requiresEquipment, setRequiresEquipment] = useState(false);
  const [equipment, setEquipment] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an activity title');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call to create warehouse activity
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating warehouse activity:', {
        type: activityType,
        title,
        description,
        priority,
        assignedTo,
        estimatedDuration,
        requiresEquipment,
        equipment,
        notes
      });

      Alert.alert(
        'Success',
        'Warehouse activity created successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create warehouse activity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 24, fontWeight: 'bold' }}>
          Create Warehouse Activity
        </Text>

        {/* Activity Type */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Activity Type
            </Text>
            <SegmentedButtons
              value={activityType}
              onValueChange={(value) => setActivityType(value as ActivityType)}
              buttons={[
                { value: 'receiving', label: 'Receiving' },
                { value: 'shipping', label: 'Shipping' },
                { value: 'inventory', label: 'Inventory' },
                { value: 'cross_dock', label: 'Cross-dock' },
                { value: 'maintenance', label: 'Maintenance' }
              ]}
            />
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Basic Information
            </Text>
            
            <TextInput
              label="Activity Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={{ marginBottom: 12 }}
              placeholder="Enter activity title"
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 12 }}
              placeholder="Enter activity description"
            />

            <TextInput
              label="Assigned To"
              value={assignedTo}
              onChangeText={setAssignedTo}
              mode="outlined"
              style={{ marginBottom: 12 }}
              placeholder="Enter employee name or ID"
            />

            <TextInput
              label="Estimated Duration (hours)"
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Enter estimated hours"
            />
          </Card.Content>
        </Card>

        {/* Priority */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Priority Level
            </Text>
            <SegmentedButtons
              value={priority}
              onValueChange={setPriority}
              buttons={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
          </Card.Content>
        </Card>

        {/* Equipment Requirements */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="titleMedium" style={{ flex: 1 }}>
                Equipment Required
              </Text>
              <Switch
                value={requiresEquipment}
                onValueChange={setRequiresEquipment}
              />
            </View>
            
            {requiresEquipment && (
              <TextInput
                label="Equipment Details"
                value={equipment}
                onChangeText={setEquipment}
                mode="outlined"
                multiline
                numberOfLines={2}
                placeholder="Specify required equipment (forklift, pallet jack, etc.)"
              />
            )}
          </Card.Content>
        </Card>

        {/* Additional Notes */}
        <Card style={{ marginBottom: 24 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Additional Notes
            </Text>
            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Enter any additional notes or special instructions"
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={{ flex: 1 }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={{ flex: 1 }}
            loading={isLoading}
            disabled={isLoading}
          >
            Create Activity
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateWarehouseActivity;
