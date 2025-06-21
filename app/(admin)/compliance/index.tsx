// waygo-freight/app/(admin)/compliance/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import { useCompliance } from '../../../state/complianceContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, Button, Chip, Searchbar, ProgressBar, Badge, FAB, Menu, Divider } from 'react-native-paper';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Truck, User, Calendar, Plus, MoreVertical, Edit, Trash, Calculator } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ConditionalMapView as MapView, ConditionalMarker as Marker } from '../../../components/MapView';
import { ComplianceRecord } from '../../../types';

const { width } = Dimensions.get('window');

const getSeverityColor = (severity: string, theme: any) => {
  switch (severity) {
    case 'CRITICAL':
      return theme.colors.error;
    case 'HIGH':
      return '#FF6B6B';
    case 'MEDIUM':
      return '#FFB366';
    case 'LOW':
      return '#74B9FF';
    default:
      return theme.colors.outline;
  }
};

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'ACTIVE':
    case 'COMPLIANT':
      return '#34C759';
    case 'EXPIRING_SOON':
      return '#FFB366';
    case 'EXPIRED':
    case 'NON_COMPLIANT':
      return theme.colors.error;
    case 'PENDING':
      return '#74B9FF';
    default:
      return theme.colors.outline;
  }
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

interface ComplianceCardProps {
  record: ComplianceRecord;
  onPress: () => void;
  onMenuPress: () => void;
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({ record, onPress, onMenuPress }) => {
  const theme = useTheme();
  const severityColor = getSeverityColor(record.type, theme); // Using type as severity for now
  const statusColor = getStatusColor(record.status, theme);
  
  return (
    <Card style={{ marginBottom: 16 }} onPress={onPress}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
              {record.type.replace(/_/g, ' ')}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              Entity: {record.entityType} • ID: {record.entityId}
            </Text>
            <Badge 
              size={24}
              style={{ 
                backgroundColor: statusColor,
                alignSelf: 'flex-start'
              }}
            >
              {record.status.replace(/_/g, ' ')}
            </Badge>
          </View>
          <Button mode="text" onPress={onMenuPress} compact>
            <MoreVertical size={20} color={theme.colors.onSurfaceVariant} />
          </Button>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Issue Date
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
              {record.issuedDate ? formatDate(record.issuedDate) : 'N/A'}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Expiry Date
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
              {record.expiryDate ? formatDate(record.expiryDate) : 'N/A'}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Updated
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
              {formatDate(record.updatedAt)}
            </Text>
          </View>
        </View>

        {record.description && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            {record.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

export default function AdminComplianceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    complianceRecords, loading, error,
    addComplianceRecord,
    updateComplianceRecord,
    deleteComplianceRecord,
    checkExpiringSoon
  } = useCompliance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});

  // Get unique types and statuses
  const types = ['all', ...Array.from(new Set(complianceRecords.map(record => record.type)))];
  const statuses = ['all', ...Array.from(new Set(complianceRecords.map(record => record.status)))];

  const filteredRecords = complianceRecords.filter((record: ComplianceRecord) => {
    const matchesSearch = record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (record.description && record.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const openMenu = (recordId: string) => {
    setMenuVisible(prev => ({ ...prev, [recordId]: true }));
  };

  const closeMenu = (recordId: string) => {
    setMenuVisible(prev => ({ ...prev, [recordId]: false }));
  };

  const handleRecordPress = (record: ComplianceRecord) => {
    router.push(`/(admin)/compliance/${record.id}`);
  };

  const handleCreateRecord = () => {
    router.push('/(admin)/compliance/create');
  };

  const handleUpdateStatus = async (record: ComplianceRecord, newStatus: string) => {
    try {
      await updateComplianceRecord(record.id, { status: newStatus as any });
      closeMenu(record.id);
    } catch (error) {
      console.error('Failed to update compliance record:', error);
    }
  };

  const handleDeleteRecord = async (record: ComplianceRecord) => {
    try {
      await deleteComplianceRecord(record.id);
      closeMenu(record.id);
    } catch (error) {
      console.error('Failed to delete compliance record:', error);
    }
  };

  const renderComplianceCard = ({ item }: { item: ComplianceRecord }) => (
    <View>
      <ComplianceCard
        record={item}
        onPress={() => handleRecordPress(item)}
        onMenuPress={() => openMenu(item.id)}
      />
      <Menu
        visible={menuVisible[item.id] || false}
        onDismiss={() => closeMenu(item.id)}
        anchor={<View />}
        contentStyle={{ marginTop: 50 }}
      >
        <Menu.Item
          onPress={() => handleUpdateStatus(item, 'COMPLIANT')}
          title="Mark Compliant"
          leadingIcon={() => <CheckCircle size={20} color="#34C759" />}
        />
        <Menu.Item
          onPress={() => handleUpdateStatus(item, 'NON_COMPLIANT')}
          title="Mark Non-Compliant"
          leadingIcon={() => <XCircle size={20} color={theme.colors.error} />}
        />
        <Divider />
        <Menu.Item
          onPress={() => router.push(`/(admin)/compliance/${item.id}/edit`)}
          title="Edit Record"
          leadingIcon={() => <Edit size={20} color={theme.colors.onSurface} />}
        />
        <Menu.Item
          onPress={() => handleDeleteRecord(item)}
          title="Delete Record"
          leadingIcon={() => <Trash size={20} color={theme.colors.error} />}
        />
      </Menu>
    </View>
  );

  // Calculate summary stats
  const totalRecords = complianceRecords.length;
  const activeRecords = complianceRecords.filter(r => r.status === 'compliant' || r.status === 'pending').length;
  const expiringRecords = checkExpiringSoon(30).length; // Records expiring in 30 days
  const nonCompliantRecords = complianceRecords.filter(r => r.status === 'non_compliant' || r.status === 'expired').length;

  if (loading && complianceRecords.length === 0) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Compliance & Safety' }} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Heading variant="h1" style={{ marginBottom: 16 }}>
            Compliance & Safety
          </Heading>

          {error && (
            <Card style={{ marginBottom: 16, backgroundColor: theme.colors.errorContainer }}>
              <Card.Content>
                <Text style={{ color: theme.colors.onErrorContainer }}>
                  {error}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Summary Cards */}
          <View style={{ marginBottom: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <FileText size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Total Records
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                    {totalRecords}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <CheckCircle size={24} color="#34C759" />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Compliant
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600', color: '#34C759' }}>
                    {activeRecords}
                  </Text>
                </Card.Content>
              </Card>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Clock size={24} color="#FFB366" />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Expiring Soon
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600', color: '#FFB366' }}>
                    {expiringRecords}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <AlertTriangle size={24} color={theme.colors.error} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Non-Compliant
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.error }}>
                    {nonCompliantRecords}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Button
              mode="outlined"
              onPress={() => router.push('/(admin)/compliance/permits')}
              style={{ flex: 1 }}
              icon={() => <FileText size={18} color={theme.colors.primary} />}
            >
              Permit Renewals
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/(admin)/compliance/ifta')}
              style={{ flex: 1 }}
              icon={() => <Calculator size={18} color={theme.colors.primary} />}
            >
              IFTA Reports
            </Button>
          </View>

          <Searchbar
            placeholder="Search compliance records..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          {/* Type Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {types.map((type) => (
                <Chip
                  key={type}
                  selected={typeFilter === type}
                  onPress={() => setTypeFilter(type)}
                  mode={typeFilter === type ? 'flat' : 'outlined'}
                  style={{ marginRight: 8 }}
                >
                  {type === 'all' ? 'All Types' : type.replace(/_/g, ' ')}
                </Chip>
              ))}
            </View>
          </ScrollView>

          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {statuses.map((status) => (
                <Chip
                  key={status}
                  selected={statusFilter === status}
                  onPress={() => setStatusFilter(status)}
                  mode={statusFilter === status ? 'flat' : 'outlined'}
                  style={{ marginRight: 8 }}
                >
                  {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ')}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="titleMedium">
              {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredRecords}
            renderItem={renderComplianceCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <Card style={{ padding: 32, alignItems: 'center' }}>
                <FileText size={48} color={theme.colors.outline} />
                <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                  No compliance records found
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first compliance record to get started'
                  }
                </Text>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleCreateRecord}
                    style={{ marginTop: 16 }}
                    icon="plus"
                  >
                    Add Record
                  </Button>
                )}
              </Card>
            )}
          />
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={handleCreateRecord}
      />
    </ScreenWrapper>
  );
}
