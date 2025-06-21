import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, FAB, useTheme, ProgressBar, List, Avatar } from 'react-native-paper';
import { useFleet } from '../../../state/fleetContext';
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Truck, 
  Plus,
  Settings,
  TrendingUp,
  AlertCircle
} from '../../../utils/icons';
import { Vehicle, MaintenanceRecord } from '../../../types';

interface MaintenanceScheduleItem {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  type: 'oil_change' | 'inspection' | 'tire_rotation' | 'brake_service' | 'emissions' | 'dot_inspection';
  description: string;
  dueDate: Date;
  dueMileage?: number;
  currentMileage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  status: 'scheduled' | 'overdue' | 'in_progress' | 'completed';
  lastCompleted?: Date;
}

const MAINTENANCE_TYPES = {
  oil_change: { label: 'Oil Change', interval: 15000, icon: 'oil-temperature' },
  inspection: { label: 'Safety Inspection', interval: 50000, icon: 'clipboard-check' },
  tire_rotation: { label: 'Tire Rotation', interval: 12000, icon: 'tire' },
  brake_service: { label: 'Brake Service', interval: 40000, icon: 'car-brake-parking' },
  emissions: { label: 'Emissions Test', interval: 24000, icon: 'air-filter' },
  dot_inspection: { label: 'DOT Inspection', interval: 12, icon: 'shield-check' }
};

export default function MaintenanceScreen() {
  const theme = useTheme();
  const { vehicles, loading } = useFleet();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceScheduleItem[]>([]);

  useEffect(() => {
    generateMaintenanceSchedule();
  }, [vehicles]);

  const generateMaintenanceSchedule = () => {
    const schedule: MaintenanceScheduleItem[] = [];
    
    vehicles.forEach(vehicle => {
      // Generate maintenance items for each vehicle
      Object.entries(MAINTENANCE_TYPES).forEach(([type, config]) => {
        const currentMileage = vehicle.mileage || 0;
        const lastServiceMileage = getLastServiceMileage(vehicle.id, type);
        const milesSinceService = currentMileage - lastServiceMileage;
        const milesTillDue = config.interval - milesSinceService;
        
        let dueDate = new Date();
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let status: 'scheduled' | 'overdue' | 'in_progress' | 'completed' = 'scheduled';
        
        if (type === 'dot_inspection') {
          // DOT inspection is time-based (annually)
          dueDate = new Date(Date.now() + config.interval * 30 * 24 * 60 * 60 * 1000);
        } else {
          // Estimate due date based on average miles per day
          const avgMilesPerDay = 300;
          const daysUntilDue = Math.max(0, milesTillDue / avgMilesPerDay);
          dueDate = new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000);
        }
        
        // Determine priority and status
        if (milesTillDue <= 0) {
          status = 'overdue';
          priority = 'critical';
        } else if (milesTillDue <= config.interval * 0.1) {
          priority = 'high';
        } else if (milesTillDue <= config.interval * 0.2) {
          priority = 'medium';
        }
        
        schedule.push({
          id: `${vehicle.id}-${type}`,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.unitNumber,
          type: type as any,
          description: config.label,
          dueDate,
          dueMileage: type !== 'dot_inspection' ? lastServiceMileage + config.interval : undefined,
          currentMileage,
          priority,
          estimatedCost: getEstimatedCost(type),
          status,
          lastCompleted: getLastCompletedDate(vehicle.id, type)
        });
      });
    });
    
    setMaintenanceSchedule(schedule.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }));
  };

  const getLastServiceMileage = (vehicleId: string, type: string): number => {
    // Mock data - in real app, this would come from maintenance records
    return Math.floor(Math.random() * 50000);
  };

  const getLastCompletedDate = (vehicleId: string, type: string): Date => {
    // Mock data - in real app, this would come from maintenance records
    return new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  };

  const getEstimatedCost = (type: string): number => {
    const costs = {
      oil_change: 150,
      inspection: 300,
      tire_rotation: 100,
      brake_service: 800,
      emissions: 200,
      dot_inspection: 250
    };
    return costs[type as keyof typeof costs] || 200;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.colors.error;
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle size={20} color={theme.colors.error} />;
      case 'in_progress': return <Clock size={20} color="#FF9800" />;
      case 'completed': return <CheckCircle size={20} color="#4CAF50" />;
      default: return <Calendar size={20} color={theme.colors.primary} />;
    }
  };

  const filteredSchedule = maintenanceSchedule.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'due_soon') return item.priority === 'high' || item.priority === 'critical';
    if (selectedFilter === 'overdue') return item.status === 'overdue';
    return item.priority === selectedFilter;
  });

  const overdueCOunt = maintenanceSchedule.filter(item => item.status === 'overdue').length;
  const dueSoonCount = maintenanceSchedule.filter(item => item.priority === 'high' || item.priority === 'critical').length;
  const totalCost = filteredSchedule.reduce((sum, item) => sum + item.estimatedCost, 0);

  const scheduleMaintenance = (item: MaintenanceScheduleItem) => {
    Alert.alert(
      'Schedule Maintenance',
      `Schedule ${item.description} for vehicle ${item.vehicleNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Schedule', 
          onPress: () => {
            // In real app, this would create a work order
            Alert.alert('Success', 'Maintenance scheduled successfully');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading maintenance schedule...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header Stats */}
      <View style={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
          Fleet Maintenance
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={24} color={theme.colors.error} />
              <View>
                <Text variant="headlineMedium">{overdueCOunt}</Text>
                <Text variant="bodySmall">Overdue</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Clock size={24} color="#FF9800" />
              <View>
                <Text variant="headlineMedium">{dueSoonCount}</Text>
                <Text variant="bodySmall">Due Soon</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={24} color="#4CAF50" />
              <View>
                <Text variant="headlineMedium">${totalCost.toLocaleString()}</Text>
                <Text variant="bodySmall">Est. Cost</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'overdue', label: 'Overdue' },
              { key: 'due_soon', label: 'Due Soon' },
              { key: 'critical', label: 'Critical' },
              { key: 'high', label: 'High Priority' },
              { key: 'medium', label: 'Medium' },
              { key: 'low', label: 'Low' }
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

      {/* Maintenance Schedule List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredSchedule.map(item => (
          <Card key={item.id} style={{ marginBottom: 12 }}>
            <List.Item
              title={`${item.vehicleNumber} - ${item.description}`}
              description={`Due: ${item.dueDate.toLocaleDateString()} ${item.dueMileage ? `| ${item.dueMileage.toLocaleString()} mi` : ''}`}
              left={(props) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar.Icon 
                    {...props} 
                    icon="truck" 
                    style={{ backgroundColor: getPriorityColor(item.priority) }}
                  />
                  {getStatusIcon(item.status)}
                </View>
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text variant="labelLarge">${item.estimatedCost}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {item.currentMileage.toLocaleString()} mi
                  </Text>
                </View>
              )}
              onPress={() => scheduleMaintenance(item)}
            />
            
            {/* Progress bar for mileage-based maintenance */}
            {item.dueMileage && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <ProgressBar 
                  progress={Math.min(1, item.currentMileage / item.dueMileage)}
                  color={getPriorityColor(item.priority)}
                  style={{ height: 4 }}
                />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.outline }}>
                  {((item.currentMileage / item.dueMileage) * 100).toFixed(0)}% complete
                </Text>
              </View>
            )}
          </Card>
        ))}
        
        {filteredSchedule.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <CheckCircle size={48} color="#4CAF50" />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              All Caught Up!
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              No maintenance items match your current filter.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Schedule Service"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Manual maintenance scheduling will be available in a future update.');
        }}
      />
    </View>
  );
}
