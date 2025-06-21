import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme,
  List,
  Chip,
  Surface,
  ProgressBar,
  SegmentedButtons,
  Badge,
  IconButton,
  Searchbar,
  Menu
} from 'react-native-paper';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Filter,
  Plus,
  Scan,
  Clipboard,
  TrendingUp,
  ArrowUpDown
} from '../../utils/icons';

interface WarehouseTask {
  id: string;
  type: 'loading' | 'unloading' | 'inventory' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  shipmentId?: string;
  description: string;
  assignedTo: string;
  estimatedTime: number; // minutes
  actualTime?: number; // minutes
  location: string;
  dueTime: string;
  startTime?: string;
  completedTime?: string;
  items?: Array<{
    sku: string;
    description: string;
    quantity: number;
    handled: number;
  }>;
}

interface DockStatus {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'maintenance';
  currentTask?: string;
  vehicleId?: string;
  estimatedCompletion?: string;
}

const mockTasks: WarehouseTask[] = [
  {
    id: '1',
    type: 'loading',
    priority: 'high',
    status: 'in_progress',
    shipmentId: 'SH-2024-001',
    description: 'Load electronics shipment to Dallas',
    assignedTo: 'Mike Johnson',
    estimatedTime: 120,
    actualTime: 90,
    location: 'Dock 3',
    dueTime: '2:00 PM',
    startTime: '12:30 PM',
    items: [
      { sku: 'EL-TV-55', description: '55" Smart TV', quantity: 10, handled: 8 },
      { sku: 'EL-LAP-15', description: 'Laptop 15"', quantity: 25, handled: 25 },
    ]
  },
  {
    id: '2',
    type: 'unloading',
    priority: 'medium',
    status: 'pending',
    shipmentId: 'SH-2024-002',
    description: 'Unload furniture from Houston',
    assignedTo: 'Sarah Wilson',
    estimatedTime: 90,
    location: 'Dock 1',
    dueTime: '3:30 PM',
    items: [
      { sku: 'FU-SOF-001', description: 'Leather Sofa', quantity: 5, handled: 0 },
      { sku: 'FU-TAB-002', description: 'Dining Table', quantity: 3, handled: 0 },
    ]
  },
  {
    id: '3',
    type: 'inventory',
    priority: 'low',
    status: 'pending',
    description: 'Cycle count - Section A',
    assignedTo: 'David Lee',
    estimatedTime: 180,
    location: 'Section A',
    dueTime: '5:00 PM',
  },
  {
    id: '4',
    type: 'maintenance',
    priority: 'high',
    status: 'completed',
    description: 'Forklift #3 hydraulic repair',
    assignedTo: 'Tom Brown',
    estimatedTime: 240,
    actualTime: 180,
    location: 'Maintenance Bay',
    dueTime: '1:00 PM',
    startTime: '10:00 AM',
    completedTime: '1:00 PM',
  }
];

const mockDocks: DockStatus[] = [
  { id: '1', number: 1, status: 'occupied', currentTask: 'Unloading SH-2024-002', vehicleId: 'Truck #102', estimatedCompletion: '3:30 PM' },
  { id: '2', number: 2, status: 'available' },
  { id: '3', number: 3, status: 'occupied', currentTask: 'Loading SH-2024-001', vehicleId: 'Truck #101', estimatedCompletion: '2:00 PM' },
  { id: '4', number: 4, status: 'maintenance' },
  { id: '5', number: 5, status: 'available' },
  { id: '6', number: 6, status: 'available' },
];

export default function WarehouseOperationsScreen() {
  const theme = useTheme();
  
  const [tasks] = useState<WarehouseTask[]>(mockTasks);
  const [docks] = useState<DockStatus[]>(mockDocks);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    dockGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    dockCard: {
      width: '30%',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 2,
    },
    dockNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    dockStatus: {
      fontSize: 12,
      textAlign: 'center',
    },
    taskCard: {
      marginBottom: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 16,
    },
    taskInfo: {
      flex: 1,
      marginRight: 8,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    taskDetails: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    taskMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    progressSection: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 16,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
      alignItems: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      padding: 16,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'delayed': return '#EF4444';
      default: return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return theme.colors.outline;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'loading': return <ArrowUpDown size={20} color={theme.colors.primary} />;
      case 'unloading': return <Package size={20} color={theme.colors.secondary} />;
      case 'inventory': return <Clipboard size={20} color="#F59E0B" />;
      case 'maintenance': return <ArrowUpDown size={20} color="#6366F1" />;
      default: return <Package size={20} color={theme.colors.primary} />;
    }
  };

  const getDockColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'occupied': return '#3B82F6';
      case 'maintenance': return '#EF4444';
      default: return theme.colors.outline;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesSearch = task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.shipmentId && task.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const delayedTasks = tasks.filter(t => t.status === 'delayed').length;

  const availableDocks = docks.filter(d => d.status === 'available').length;
  const occupiedDocks = docks.filter(d => d.status === 'occupied').length;

  const getTaskProgress = (task: WarehouseTask) => {
    if (!task.items) return 0;
    const totalItems = task.items.reduce((sum, item) => sum + item.quantity, 0);
    const handledItems = task.items.reduce((sum, item) => sum + item.handled, 0);
    return totalItems > 0 ? (handledItems / totalItems) * 100 : 0;
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'loading', label: 'Loading' },
    { value: 'unloading', label: 'Unloading' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

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
          Warehouse Operations
        </Text>
        <Button 
          mode="outlined" 
          onPress={() => {}}
          icon={() => <Plus size={20} color={theme.colors.primary} />}
          compact
        >
          New Task
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {/* Overview Stats */}
        <View style={styles.statsRow}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Clipboard size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {totalTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
              Total Tasks
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#3B82F6' + '20' }]}>
            <TrendingUp size={24} color="#3B82F6" />
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {inProgressTasks}
            </Text>
            <Text style={[styles.statLabel, { color: '#3B82F6' }]}>
              In Progress
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#10B981' + '20' }]}>
            <CheckCircle size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {completedTasks}
            </Text>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>
              Completed
            </Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: '#F59E0B' + '20' }]}>
            <Clock size={24} color="#F59E0B" />
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {pendingTasks}
            </Text>
            <Text style={[styles.statLabel, { color: '#F59E0B' }]}>
              Pending
            </Text>
          </Surface>
        </View>

        {/* Dock Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Dock Status</Text>
            
            <View style={styles.dockGrid}>
              {docks.map((dock) => (
                <Surface
                  key={dock.id}
                  style={[
                    styles.dockCard,
                    { 
                      backgroundColor: getDockColor(dock.status) + '20',
                      borderColor: getDockColor(dock.status)
                    }
                  ]}
                >
                  <Text style={[styles.dockNumber, { color: getDockColor(dock.status) }]}>
                    {dock.number}
                  </Text>
                  <Text style={[styles.dockStatus, { color: getDockColor(dock.status) }]}>
                    {dock.status.toUpperCase()}
                  </Text>
                  {dock.vehicleId && (
                    <Text style={{ fontSize: 10, marginTop: 2, textAlign: 'center' }}>
                      {dock.vehicleId}
                    </Text>
                  )}
                </Surface>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <Text variant="bodyMedium">
                <Text style={{ color: '#10B981' }}>●</Text> Available: {availableDocks}
              </Text>
              <Text variant="bodyMedium">
                <Text style={{ color: '#3B82F6' }}>●</Text> Occupied: {occupiedDocks}
              </Text>
              <Text variant="bodyMedium">
                <Text style={{ color: '#EF4444' }}>●</Text> Maintenance: {docks.filter(d => d.status === 'maintenance').length}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Filter and Search */}
        <View style={styles.filterRow}>
          <Searchbar
            placeholder="Search tasks..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ flex: 1 }}
          />
          
          <Menu
            visible={showFilterMenu}
            onDismiss={() => setShowFilterMenu(false)}
            anchor={
              <IconButton
                icon={() => <Filter size={20} color={theme.colors.primary} />}
                mode="outlined"
                onPress={() => setShowFilterMenu(true)}
              />
            }
          >
            {filterOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setFilterType(option.value);
                  setShowFilterMenu(false);
                }}
                title={option.label}
                leadingIcon={filterType === option.value ? 'check' : undefined}
              />
            ))}
          </Menu>
        </View>

        {/* Tasks List */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            
            {filteredTasks.map((task) => (
              <Card 
                key={task.id}
                style={[
                  styles.taskCard,
                  { borderLeftColor: getStatusColor(task.status) }
                ]}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.description}</Text>
                    <Text style={styles.taskDetails}>Assigned to: {task.assignedTo}</Text>
                    <Text style={styles.taskDetails}>Location: {task.location}</Text>
                    <Text style={styles.taskDetails}>Due: {task.dueTime}</Text>
                    {task.shipmentId && (
                      <Text style={styles.taskDetails}>Shipment: {task.shipmentId}</Text>
                    )}
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Chip 
                      mode="flat"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                      textStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                    >
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </View>
                </View>

                <View style={styles.taskMeta}>
                  <Chip mode="outlined" style={{ backgroundColor: theme.colors.surfaceVariant }}>
                    {getTypeIcon(task.type)}
                    <Text style={{ marginLeft: 4 }}>{task.type}</Text>
                  </Chip>
                  
                  <Chip 
                    mode="outlined" 
                    style={{ backgroundColor: getPriorityColor(task.priority) + '20' }}
                    textStyle={{ color: getPriorityColor(task.priority) }}
                  >
                    {task.priority} priority
                  </Chip>
                  
                  <Chip mode="outlined" style={{ backgroundColor: theme.colors.surfaceVariant }}>
                    <Clock size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={{ marginLeft: 4 }}>{task.estimatedTime}m</Text>
                  </Chip>
                </View>

                {task.items && task.items.length > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>Progress</Text>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                        {Math.round(getTaskProgress(task))}%
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={getTaskProgress(task) / 100} 
                      color={task.status === 'completed' ? '#10B981' : theme.colors.primary}
                      style={{ marginBottom: 8 }}
                    />
                    
                    {task.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text variant="bodySmall" style={{ flex: 1 }}>
                          {item.description}
                        </Text>
                        <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                          {item.handled}/{item.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.actionButtons}>
                  {task.status === 'pending' && (
                    <Button 
                      mode="contained" 
                      style={{ flex: 1 }}
                      icon={() => <CheckCircle size={16} color="#FFFFFF" />}
                      onPress={() => {}}
                    >
                      Start Task
                    </Button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <>
                      <Button 
                        mode="outlined" 
                        style={{ flex: 1 }}
                        icon={() => <Scan size={16} color={theme.colors.primary} />}
                        onPress={() => {}}
                      >
                        Scan Items
                      </Button>
                      <Button 
                        mode="contained" 
                        style={{ flex: 1 }}
                        icon={() => <CheckCircle size={16} color="#FFFFFF" />}
                        onPress={() => {}}
                      >
                        Complete
                      </Button>
                    </>
                  )}

                  {task.status === 'completed' && (
                    <Button 
                      mode="outlined" 
                      style={{ flex: 1 }}
                      icon={() => <BarChart3 size={16} color={theme.colors.primary} />}
                      onPress={() => {}}
                    >
                      View Report
                    </Button>
                  )}
                </View>
              </Card>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
