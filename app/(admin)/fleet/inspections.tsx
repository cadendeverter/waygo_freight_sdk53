import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, Searchbar, FAB } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useFleet } from '../../../state/fleetContext';
import { useAuth } from '../../../state/authContext';
import { Truck, CheckCircle, AlertTriangle, XCircle, Clock, Calendar } from '../../../utils/icons';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface VehicleInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  inspectorId: string;
  inspectorName: string;
  type: 'pre_trip' | 'post_trip' | 'annual' | 'roadside';
  status: 'passed' | 'failed' | 'defects_found' | 'pending';
  date: Date;
  location: string;
  odometer: number;
  defects: InspectionDefect[];
  notes?: string;
  signatures: {
    driver?: string;
    inspector?: string;
  };
  dueDate?: Date;
}

interface InspectionDefect {
  id: string;
  category: 'brakes' | 'lights' | 'tires' | 'engine' | 'steering' | 'other';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location: string;
  repaired: boolean;
  repairedDate?: Date;
  cost?: number;
}

export default function InspectionsScreen() {
  const theme = useTheme();
  const { vehicles } = useFleet();
  const { user, isDevMode } = useAuth();
  
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for dev mode
  const mockInspections: VehicleInspection[] = [
    {
      id: '1',
      vehicleId: 'VEH-001',
      vehicleName: 'Kenworth T680 #001',
      plateNumber: 'ABC-1234',
      inspectorId: 'DRV-001',
      inspectorName: 'John Smith',
      type: 'pre_trip',
      status: 'passed',
      date: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      location: 'Atlanta Terminal',
      odometer: 125670,
      defects: [],
      notes: 'All systems operational',
      signatures: {
        driver: 'John Smith',
        inspector: 'John Smith'
      }
    },
    {
      id: '2',
      vehicleId: 'VEH-002',
      vehicleName: 'Freightliner Cascadia #002',
      plateNumber: 'DEF-5678',
      inspectorId: 'DRV-002',
      inspectorName: 'Sarah Johnson',
      type: 'post_trip',
      status: 'defects_found',
      date: new Date(Date.now() - 1 * 24 * 3600000), // 1 day ago
      location: 'Nashville Hub',
      odometer: 98432,
      defects: [
        {
          id: 'd1',
          category: 'lights',
          severity: 'minor',
          description: 'Left rear marker light not working',
          location: 'Trailer rear left',
          repaired: false
        },
        {
          id: 'd2',
          category: 'tires',
          severity: 'major',
          description: 'Irregular wear pattern on right front tire',
          location: 'Tractor right front',
          repaired: false
        }
      ],
      notes: 'Requires maintenance before next dispatch',
      signatures: {
        driver: 'Sarah Johnson'
      }
    },
    {
      id: '3',
      vehicleId: 'VEH-003',
      vehicleName: 'Peterbilt 579 #003',
      plateNumber: 'GHI-9012',
      inspectorId: 'MECH-001',
      inspectorName: 'Mike Wilson',
      type: 'annual',
      status: 'failed',
      date: new Date(Date.now() - 3 * 24 * 3600000), // 3 days ago
      location: 'Service Center',
      odometer: 187654,
      defects: [
        {
          id: 'd3',
          category: 'brakes',
          severity: 'critical',
          description: 'Brake pad thickness below minimum',
          location: 'Front axle',
          repaired: true,
          repairedDate: new Date(Date.now() - 2 * 24 * 3600000),
          cost: 450
        },
        {
          id: 'd4',
          category: 'engine',
          severity: 'major',
          description: 'Oil leak from valve cover gasket',
          location: 'Engine compartment',
          repaired: true,
          repairedDate: new Date(Date.now() - 2 * 24 * 3600000),
          cost: 275
        }
      ],
      notes: 'Annual DOT inspection - all defects corrected',
      signatures: {
        inspector: 'Mike Wilson'
      },
      dueDate: new Date(Date.now() + 365 * 24 * 3600000) // Next year
    }
  ];

  useEffect(() => {
    if (isDevMode) {
      // Use mock data for dev mode
      setInspections(mockInspections);
      setLoading(false);
      return;
    }

    // Production mode - real Firebase data
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'vehicle_inspections'),
        where('companyId', '==', user?.companyId),
        orderBy('date', 'desc')
      ),
      (snapshot) => {
        const inspectionData: VehicleInspection[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          inspectionData.push({
            id: doc.id,
            vehicleId: data.vehicleId,
            vehicleName: data.vehicleName,
            plateNumber: data.plateNumber,
            inspectorId: data.inspectorId,
            inspectorName: data.inspectorName,
            type: data.type,
            status: data.status,
            date: data.date?.toDate() || new Date(),
            location: data.location,
            odometer: data.odometer || 0,
            defects: (data.defects || []).map((d: any) => ({
              ...d,
              repairedDate: d.repairedDate?.toDate()
            })),
            notes: data.notes,
            signatures: data.signatures || {},
            dueDate: data.dueDate?.toDate()
          });
        });
        setInspections(inspectionData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching inspection data:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.companyId, isDevMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isDevMode) {
      // Simulate refresh delay for dev mode
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } else {
      // In production, the real-time listener will handle updates
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'defects_found': return '#FF9800';
      case 'pending': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return CheckCircle;
      case 'failed': return XCircle;
      case 'defects_found': return AlertTriangle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'major': return '#FF9800';
      case 'minor': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pre_trip': return 'Pre-Trip';
      case 'post_trip': return 'Post-Trip';
      case 'annual': return 'Annual DOT';
      case 'roadside': return 'Roadside';
      default: return type;
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inspection.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inspection.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || inspection.type === filterType;
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading inspection data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const passedInspections = inspections.filter(i => i.status === 'passed').length;
  const failedInspections = inspections.filter(i => i.status === 'failed').length;
  const pendingDefects = inspections.reduce((acc, i) => acc + i.defects.filter(d => !d.repaired).length, 0);

  return (
    <ScreenWrapper>
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Truck size={32} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
                DVIR & Inspections
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Driver Vehicle Inspection Reports and compliance
              </Text>
            </View>
          </View>

          {/* Search */}
          <Searchbar
            placeholder="Search vehicles, plates, or inspectors..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          {/* Filters */}
          <View style={{ marginBottom: 16 }}>
            <Text variant="bodySmall" style={{ marginBottom: 8, fontWeight: 'bold' }}>
              Inspection Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['all', 'pre_trip', 'post_trip', 'annual', 'roadside'].map((type) => (
                  <Chip
                    key={type}
                    selected={filterType === type}
                    onPress={() => setFilterType(type)}
                    style={{ backgroundColor: filterType === type ? theme.colors.primary : undefined }}
                  >
                    {type === 'all' ? 'ALL' : getTypeLabel(type)}
                  </Chip>
                ))}
              </View>
            </ScrollView>

            <Text variant="bodySmall" style={{ marginBottom: 8, fontWeight: 'bold' }}>
              Status
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['all', 'passed', 'defects_found', 'failed', 'pending'].map((status) => (
                  <Chip
                    key={status}
                    selected={filterStatus === status}
                    onPress={() => setFilterStatus(status)}
                    style={{ backgroundColor: filterStatus === status ? theme.colors.primary : undefined }}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Summary Stats */}
          <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {passedInspections}
                </Text>
                <Text variant="bodySmall">Passed</Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#F44336' }}>
                  {failedInspections}
                </Text>
                <Text variant="bodySmall">Failed</Text>
              </Card.Content>
            </Card>
            <Card style={{ flex: 1 }} mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {pendingDefects}
                </Text>
                <Text variant="bodySmall">Pending Repairs</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Inspection Cards */}
          {filteredInspections.map((inspection) => {
            const StatusIcon = getStatusIcon(inspection.status);
            const unrepairedDefects = inspection.defects.filter(d => !d.repaired);
            
            return (
              <Card key={inspection.id} style={{ marginBottom: 16 }} mode="elevated">
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {inspection.vehicleName}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {inspection.plateNumber} • {inspection.odometer.toLocaleString()} miles
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        📍 {inspection.location}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <StatusIcon size={16} color={getStatusColor(inspection.status)} />
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            marginLeft: 4, 
                            color: getStatusColor(inspection.status),
                            fontWeight: 'bold'
                          }}
                        >
                          {inspection.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Chip 
                        compact 
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                      >
                        {getTypeLabel(inspection.type)}
                      </Chip>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Inspector
                      </Text>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {inspection.inspectorName}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Date
                      </Text>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {inspection.date.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Defects */}
                  {inspection.defects.length > 0 && (
                    <View style={{ marginBottom: 12 }}>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        Defects ({inspection.defects.length})
                      </Text>
                      {inspection.defects.slice(0, 3).map((defect) => (
                        <View 
                          key={defect.id}
                          style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginBottom: 4,
                            padding: 8,
                            backgroundColor: defect.repaired ? '#4CAF5020' : getSeverityColor(defect.severity) + '20',
                            borderRadius: 8
                          }}
                        >
                          <View 
                            style={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: 4, 
                              backgroundColor: defect.repaired ? '#4CAF50' : getSeverityColor(defect.severity),
                              marginRight: 8
                            }} 
                          />
                          <View style={{ flex: 1 }}>
                            <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                              {defect.description}
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              {defect.location} • {defect.severity.toUpperCase()}
                              {defect.repaired && defect.cost && ` • $${defect.cost}`}
                            </Text>
                          </View>
                          {defect.repaired && (
                            <CheckCircle size={16} color="#4CAF50" />
                          )}
                        </View>
                      ))}
                      {inspection.defects.length > 3 && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          +{inspection.defects.length - 3} more defects
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Notes */}
                  {inspection.notes && (
                    <View style={{ marginBottom: 12 }}>
                      <Text variant="bodySmall" style={{ fontStyle: 'italic', color: theme.colors.onSurfaceVariant }}>
                        "{inspection.notes}"
                      </Text>
                    </View>
                  )}

                  {/* Due Date for Annual Inspections */}
                  {inspection.type === 'annual' && inspection.dueDate && (
                    <View style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Calendar size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                          Next annual inspection due: {inspection.dueDate.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                    <Button 
                      mode="outlined"
                      onPress={() => router.push(`/(admin)/fleet/inspections/${inspection.id}`)}
                    >
                      View Details
                    </Button>
                    {unrepairedDefects.length > 0 && (
                      <Button 
                        mode="contained"
                        buttonColor="#FF9800"
                        onPress={() => router.push(`/(admin)/fleet/maintenance/repair/${inspection.id}`)}
                      >
                        Schedule Repair
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })}

          {filteredInspections.length === 0 && (
            <Card mode="elevated">
              <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Truck size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center' }}>
                  No inspections found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {searchQuery ? 'Try adjusting your search or filters' : 'No inspections available'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => router.push('/(admin)/fleet/inspections/new')}
      />
    </ScreenWrapper>
  );
}
