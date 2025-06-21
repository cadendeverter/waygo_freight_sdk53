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
  ProgressBar,
  IconButton,
  Surface,
  Searchbar
} from 'react-native-paper';
import { 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Activity, 
  Thermometer,
  Battery,
  Gauge,
  Truck,
  Wrench,
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  TrendingDown
} from '../../../utils/icons';

interface VehicleDiagnostic {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  lastUpdate: Date;
  overallHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  faultCodes: DiagnosticCode[];
  telematicsData: TelematicsData;
  maintenanceAlerts: MaintenanceAlert[];
  predictiveInsights: PredictiveInsight[];
}

interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  category: 'ENGINE' | 'TRANSMISSION' | 'BRAKES' | 'ELECTRICAL' | 'EMISSIONS';
  timestamp: Date;
  resolved: boolean;
}

interface TelematicsData {
  engineTemp: number;
  oilPressure: number;
  batteryVoltage: number;
  engineRPM: number;
  coolantLevel: number;
  airFilterStatus: number;
  fuelLevel: number;
  tirePressure: { front: number; rear: number; };
  mileage: number;
  engineHours: number;
}

interface MaintenanceAlert {
  id: string;
  type: 'OIL_CHANGE' | 'FILTER_REPLACEMENT' | 'INSPECTION_DUE' | 'TIRE_ROTATION';
  urgency: 'OVERDUE' | 'DUE_SOON' | 'SCHEDULED';
  description: string;
  dueDate: Date;
  milesRemaining?: number;
}

interface PredictiveInsight {
  component: string;
  prediction: string;
  confidence: number;
  estimatedFailureDate?: Date;
  recommendedAction: string;
}

const mockDiagnostics: VehicleDiagnostic[] = [
  {
    id: 'diag1',
    vehicleId: 'v1',
    vehicleNumber: 'T-101',
    vehicleType: 'Freightliner Cascadia',
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
    overallHealth: 'GOOD',
    faultCodes: [
      {
        code: 'P0171',
        description: 'System Too Lean (Bank 1)',
        severity: 'WARNING',
        category: 'ENGINE',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      }
    ],
    telematicsData: {
      engineTemp: 190,
      oilPressure: 45,
      batteryVoltage: 12.8,
      engineRPM: 1350,
      coolantLevel: 85,
      airFilterStatus: 75,
      fuelLevel: 62,
      tirePressure: { front: 110, rear: 108 },
      mileage: 145672,
      engineHours: 8234
    },
    maintenanceAlerts: [
      {
        id: 'maint1',
        type: 'OIL_CHANGE',
        urgency: 'DUE_SOON',
        description: 'Oil change due in 2,500 miles',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        milesRemaining: 2500
      }
    ],
    predictiveInsights: [
      {
        component: 'Air Filter',
        prediction: 'Replacement needed in 30 days',
        confidence: 87,
        estimatedFailureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recommendedAction: 'Schedule air filter replacement'
      }
    ]
  }
];

export default function VehicleDiagnosticsScreen() {
  const theme = useTheme();
  const [diagnostics, setDiagnostics] = useState<VehicleDiagnostic[]>(mockDiagnostics);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'EXCELLENT': return '#4CAF50';
      case 'GOOD': return '#8BC34A';
      case 'FAIR': return '#FF9800';
      case 'POOR': return '#FF5722';
      case 'CRITICAL': return '#F44336';
      default: return theme.colors.outline;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#F44336';
      case 'WARNING': return '#FF9800';
      case 'INFO': return '#2196F3';
      default: return theme.colors.outline;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'OVERDUE': return '#F44336';
      case 'DUE_SOON': return '#FF9800';
      case 'SCHEDULED': return '#4CAF50';
      default: return theme.colors.outline;
    }
  };

  const viewVehicleDetails = (vehicle: VehicleDiagnostic) => {
    const activeCodes = vehicle.faultCodes.filter(c => !c.resolved);
    const overdueItems = vehicle.maintenanceAlerts.filter(a => a.urgency === 'OVERDUE');
    
    Alert.alert(
      `Diagnostics - ${vehicle.vehicleNumber}`,
      `Vehicle: ${vehicle.vehicleType}
Overall Health: ${vehicle.overallHealth}
Last Update: ${vehicle.lastUpdate.toLocaleString()}

Engine Status:
• Temperature: ${vehicle.telematicsData.engineTemp}°F
• Oil Pressure: ${vehicle.telematicsData.oilPressure} PSI
• RPM: ${vehicle.telematicsData.engineRPM}
• Battery: ${vehicle.telematicsData.batteryVoltage}V

Active Issues:
• Fault Codes: ${activeCodes.length}
• Overdue Maintenance: ${overdueItems.length}

Vehicle Stats:
• Mileage: ${vehicle.telematicsData.mileage.toLocaleString()} miles
• Engine Hours: ${vehicle.telematicsData.engineHours.toLocaleString()}
• Fuel Level: ${vehicle.telematicsData.fuelLevel}%`,
      [
        { text: 'OK' },
        { text: 'Schedule Service', onPress: () => Alert.alert('Service Scheduled', 'Maintenance appointment scheduled.') }
      ]
    );
  };

  const resolveFaultCode = (vehicleId: string, codeId: string) => {
    setDiagnostics(prev => prev.map(diag => 
      diag.id === vehicleId 
        ? {
            ...diag,
            faultCodes: diag.faultCodes.map(code => 
              code.code === codeId ? { ...code, resolved: true } : code
            )
          }
        : diag
    ));
    Alert.alert('Code Resolved', 'Fault code marked as resolved.');
  };

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Fleet health statistics
  const fleetStats = {
    totalVehicles: diagnostics.length,
    healthyVehicles: diagnostics.filter(d => ['EXCELLENT', 'GOOD'].includes(d.overallHealth)).length,
    criticalVehicles: diagnostics.filter(d => d.overallHealth === 'CRITICAL').length,
    activeFaults: diagnostics.reduce((sum, d) => sum + d.faultCodes.filter(c => !c.resolved).length, 0),
    overdueMaintenence: diagnostics.reduce((sum, d) => sum + d.maintenanceAlerts.filter(a => a.urgency === 'OVERDUE').length, 0)
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Vehicle Diagnostics</Text>
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
              onPress={() => Alert.alert('Export', 'Diagnostic report exported!')}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Fleet Health Overview */}
        <Card style={{ marginBottom: 16, padding: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Fleet Health Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall">{fleetStats.totalVehicles}</Text>
              <Text variant="bodySmall">Total Vehicles</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: '#4CAF50' }}>{fleetStats.healthyVehicles}</Text>
              <Text variant="bodySmall">Healthy</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: fleetStats.criticalVehicles > 0 ? '#F44336' : '#4CAF50' }}>
                {fleetStats.criticalVehicles}
              </Text>
              <Text variant="bodySmall">Critical</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: fleetStats.activeFaults > 0 ? '#F44336' : '#4CAF50' }}>
                {fleetStats.activeFaults}
              </Text>
              <Text variant="bodySmall">Active Faults</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ color: fleetStats.overdueMaintenence > 0 ? '#F44336' : '#4CAF50' }}>
                {fleetStats.overdueMaintenence}
              </Text>
              <Text variant="bodySmall">Overdue</Text>
            </View>
          </View>
        </Card>

        {/* Search */}
        <Searchbar
          placeholder="Search vehicles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Vehicle Diagnostics */}
        {diagnostics.map(vehicle => {
          const activeFaults = vehicle.faultCodes.filter(c => !c.resolved);
          const criticalFaults = activeFaults.filter(c => c.severity === 'CRITICAL');
          const overdueItems = vehicle.maintenanceAlerts.filter(a => a.urgency === 'OVERDUE');
          
          return (
            <Card key={vehicle.id} style={{ marginBottom: 12 }}>
              <List.Item
                title={vehicle.vehicleNumber}
                description={`${vehicle.vehicleType} • Last update: ${vehicle.lastUpdate.toLocaleTimeString()}`}
                left={(props) => (
                  <Avatar.Icon 
                    {...props} 
                    icon="truck"
                    style={{ backgroundColor: getHealthColor(vehicle.overallHealth) }}
                  />
                )}
                right={(props) => (
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                    <Badge style={{ backgroundColor: getHealthColor(vehicle.overallHealth) }}>
                      {vehicle.overallHealth}
                    </Badge>
                    {activeFaults.length > 0 && (
                      <Badge style={{ backgroundColor: '#F44336' }}>
                        {`${activeFaults.length} fault${activeFaults.length !== 1 ? 's' : ''}`}
                      </Badge>
                    )}
                  </View>
                )}
                onPress={() => viewVehicleDetails(vehicle)}
              />

              {/* Telemetrics Quick View */}
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Thermometer size={16} color={vehicle.telematicsData.engineTemp > 200 ? '#F44336' : '#4CAF50'} />
                    <Text variant="bodySmall">{vehicle.telematicsData.engineTemp}°F</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Battery size={16} color={vehicle.telematicsData.batteryVoltage < 12 ? '#F44336' : '#4CAF50'} />
                    <Text variant="bodySmall">{vehicle.telematicsData.batteryVoltage}V</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Gauge size={16} color={theme.colors.outline} />
                    <Text variant="bodySmall">{vehicle.telematicsData.oilPressure} PSI</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Activity size={16} color={theme.colors.outline} />
                    <Text variant="bodySmall">{vehicle.telematicsData.engineRPM} RPM</Text>
                  </View>
                </View>
              </View>

              {/* Active Fault Codes */}
              {activeFaults.length > 0 && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <Surface style={{ padding: 8, borderRadius: 8, backgroundColor: '#FFEBEE' }}>
                    <Text variant="titleSmall" style={{ color: '#F44336', marginBottom: 4 }}>
                      Active Fault Codes ({activeFaults.length})
                    </Text>
                    {activeFaults.slice(0, 2).map(fault => (
                      <View key={fault.code} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <AlertTriangle size={16} color={getSeverityColor(fault.severity)} />
                        <Text variant="bodySmall" style={{ flex: 1 }}>{fault.code}: {fault.description}</Text>
                        <Button 
                          mode="text" 
                          compact 
                          onPress={() => resolveFaultCode(vehicle.id, fault.code)}
                        >
                          Resolve
                        </Button>
                      </View>
                    ))}
                  </Surface>
                </View>
              )}

              {/* Maintenance Alerts */}
              {vehicle.maintenanceAlerts.length > 0 && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <Surface style={{ padding: 8, borderRadius: 8, backgroundColor: '#FFF3E0' }}>
                    <Text variant="titleSmall" style={{ color: '#FF9800', marginBottom: 4 }}>
                      Maintenance Alerts
                    </Text>
                    {vehicle.maintenanceAlerts.slice(0, 2).map(alert => (
                      <View key={alert.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Wrench size={16} color={getUrgencyColor(alert.urgency)} />
                        <Text variant="bodySmall" style={{ flex: 1 }}>{alert.description}</Text>
                        <Badge style={{ backgroundColor: getUrgencyColor(alert.urgency) }}>
                          {alert.urgency}
                        </Badge>
                      </View>
                    ))}
                  </Surface>
                </View>
              )}

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8 }}>
                <Button
                  mode="outlined"
                  onPress={() => viewVehicleDetails(vehicle)}
                  style={{ flex: 1 }}
                  icon="eye"
                  compact
                >
                  Details
                </Button>
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Service', 'Scheduling service appointment...')}
                  icon="wrench"
                  compact
                >
                  Service
                </Button>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}
