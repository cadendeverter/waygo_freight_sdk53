// waygo-freight/app/(admin)/compliance/permits.tsx
import React, { useState, useCallback } from 'react';
import { View, ScrollView, FlatList, Alert, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../theme/ThemeContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Heading from '../../../components/typography/Heading';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Searchbar, 
  FAB, 
  Badge,
  Menu,
  Divider,
  IconButton,
  ProgressBar
} from 'react-native-paper';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Edit, 
  Trash, 
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  MapPin
} from '../../../utils/icons';

const { width } = Dimensions.get('window');

interface Permit {
  id: string;
  type: 'oversize' | 'overweight' | 'hazmat' | 'international' | 'state_specific' | 'temporary';
  name: string;
  permitNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'active' | 'expired' | 'pending_renewal' | 'suspended' | 'cancelled';
  associatedVehicles: string[];
  routes?: string[];
  conditions?: string[];
  renewalCost: number;
  autoRenewal: boolean;
  reminderDays: number;
  attachments: string[];
}

const mockPermits: Permit[] = [
  {
    id: '1',
    type: 'oversize',
    name: 'Oversize Load Permit - Route 66',
    permitNumber: 'OS-2024-001',
    issuingAuthority: 'Arizona DOT',
    issueDate: new Date('2024-01-15'),
    expirationDate: new Date('2024-12-31'),
    status: 'active',
    associatedVehicles: ['TRK-001', 'TRK-002'],
    routes: ['I-40 Phoenix to Flagstaff'],
    conditions: ['Daylight hours only', 'No holidays', 'Escort required'],
    renewalCost: 125.00,
    autoRenewal: true,
    reminderDays: 30,
    attachments: ['permit-os-001.pdf']
  },
  {
    id: '2',
    type: 'hazmat',
    name: 'Hazardous Materials Transport',
    permitNumber: 'HM-2024-047',
    issuingAuthority: 'Federal DOT',
    issueDate: new Date('2024-02-01'),
    expirationDate: new Date('2024-12-15'),
    status: 'pending_renewal',
    associatedVehicles: ['TRK-003', 'TRK-005'],
    renewalCost: 275.00,
    autoRenewal: false,
    reminderDays: 60,
    attachments: ['hazmat-cert.pdf', 'driver-training.pdf']
  },
  {
    id: '3',
    type: 'international',
    name: 'US-Canada Border Crossing',
    permitNumber: 'INTL-2024-089',
    issuingAuthority: 'US Customs',
    issueDate: new Date('2024-03-10'),
    expirationDate: new Date('2025-03-10'),
    status: 'active',
    associatedVehicles: ['TRK-001', 'TRK-004'],
    renewalCost: 450.00,
    autoRenewal: true,
    reminderDays: 45,
    attachments: ['border-permit.pdf']
  }
];

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'active':
      return '#34C759';
    case 'pending_renewal':
      return '#FFB366';
    case 'expired':
    case 'suspended':
    case 'cancelled':
      return theme.colors.error;
    default:
      return theme.colors.outline;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'oversize':
    case 'overweight':
      return FileText;
    case 'hazmat':
      return AlertTriangle;
    case 'international':
      return MapPin;
    default:
      return FileText;
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDaysUntilExpiration = (expirationDate: Date) => {
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface PermitCardProps {
  permit: Permit;
  onPress: () => void;
  onMenuPress: () => void;
}

const PermitCard: React.FC<PermitCardProps> = ({ permit, onPress, onMenuPress }) => {
  const theme = useTheme();
  const IconComponent = getTypeIcon(permit.type);
  const daysUntilExpiration = getDaysUntilExpiration(permit.expirationDate);
  const isExpiringSoon = daysUntilExpiration <= permit.reminderDays;

  return (
    <Card style={{ marginBottom: 12 }} onPress={onPress}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <IconComponent size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Text variant="titleMedium" style={{ flex: 1, fontWeight: '600' }}>
                {permit.name}
              </Text>
              <Badge 
                style={{ 
                  backgroundColor: getStatusColor(permit.status, theme),
                  marginLeft: 8
                }}
              >
                {permit.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </View>

            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
              Permit #{permit.permitNumber}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              Issued by {permit.issuingAuthority}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Calendar size={14} color={theme.colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Expires {formatDate(permit.expirationDate)}
              </Text>
              {isExpiringSoon && (
                <Chip 
                  mode="outlined" 
                  compact 
                  style={{ 
                    marginLeft: 8,
                    backgroundColor: daysUntilExpiration <= 0 ? theme.colors.errorContainer : '#FFF3CD'
                  }}
                >
                  {daysUntilExpiration <= 0 ? 'EXPIRED' : `${daysUntilExpiration} days`}
                </Chip>
              )}
            </View>

            {permit.associatedVehicles.length > 0 && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Vehicles: {permit.associatedVehicles.join(', ')}
              </Text>
            )}

            {permit.autoRenewal && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <RefreshCw size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                  Auto-renewal enabled
                </Text>
              </View>
            )}
          </View>

          <IconButton
            icon={() => <MoreVertical size={20} color={theme.colors.onSurfaceVariant} />}
            onPress={onMenuPress}
            size={20}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const PermitRenewalsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [permits] = useState<Permit[]>(mockPermits);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});

  const statuses = ['all', 'active', 'pending_renewal', 'expired'];
  const types = ['all', 'oversize', 'overweight', 'hazmat', 'international', 'state_specific', 'temporary'];

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permit.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permit.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
    const matchesType = typeFilter === 'all' || permit.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openMenu = (permitId: string) => {
    setMenuVisible(prev => ({ ...prev, [permitId]: true }));
  };

  const closeMenu = (permitId: string) => {
    setMenuVisible(prev => ({ ...prev, [permitId]: false }));
  };

  const handleRenewPermit = async (permit: Permit) => {
    closeMenu(permit.id);
    Alert.alert(
      'Renew Permit',
      `Are you sure you want to renew ${permit.name}?\n\nRenewal cost: $${permit.renewalCost.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Renew', 
          onPress: () => {
            // TODO: Implement permit renewal
            Alert.alert('Success', 'Permit renewal has been initiated. You will receive confirmation shortly.');
          }
        }
      ]
    );
  };

  const handleDownloadPermit = async (permit: Permit) => {
    closeMenu(permit.id);
    // TODO: Implement permit download
    Alert.alert('Download', `Downloading ${permit.name}...`);
  };

  const handleEditPermit = (permit: Permit) => {
    closeMenu(permit.id);
    router.push(`/(admin)/compliance/permits/${permit.id}/edit`);
  };

  const handleDeletePermit = async (permit: Permit) => {
    closeMenu(permit.id);
    Alert.alert(
      'Delete Permit',
      `Are you sure you want to delete ${permit.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement permit deletion
            Alert.alert('Success', 'Permit has been deleted.');
          }
        }
      ]
    );
  };

  const renderPermitCard = ({ item }: { item: Permit }) => (
    <View>
      <PermitCard
        permit={item}
        onPress={() => router.push(`/(admin)/compliance/permits/${item.id}`)}
        onMenuPress={() => openMenu(item.id)}
      />
      <Menu
        visible={menuVisible[item.id] || false}
        onDismiss={() => closeMenu(item.id)}
        anchor={<View />}
        contentStyle={{ marginTop: 50 }}
      >
        {item.status === 'pending_renewal' || getDaysUntilExpiration(item.expirationDate) <= item.reminderDays ? (
          <Menu.Item
            onPress={() => handleRenewPermit(item)}
            title={`Renew ($${item.renewalCost.toFixed(2)})`}
            leadingIcon={() => <RefreshCw size={20} color={theme.colors.primary} />}
          />
        ) : null}
        <Menu.Item
          onPress={() => handleDownloadPermit(item)}
          title="Download"
          leadingIcon={() => <Download size={20} color={theme.colors.onSurface} />}
        />
        <Divider />
        <Menu.Item
          onPress={() => handleEditPermit(item)}
          title="Edit"
          leadingIcon={() => <Edit size={20} color={theme.colors.onSurface} />}
        />
        <Menu.Item
          onPress={() => handleDeletePermit(item)}
          title="Delete"
          leadingIcon={() => <Trash size={20} color={theme.colors.error} />}
        />
      </Menu>
    </View>
  );

  // Calculate summary stats
  const totalPermits = permits.length;
  const activePermits = permits.filter(p => p.status === 'active').length;
  const expiring = permits.filter(p => getDaysUntilExpiration(p.expirationDate) <= 30).length;
  const pendingRenewal = permits.filter(p => p.status === 'pending_renewal').length;

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Permit Renewals' }} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Heading variant="h1" style={{ marginBottom: 16 }}>
            Permit Renewals
          </Heading>

          {/* Summary Cards */}
          <View style={{ marginBottom: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <FileText size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Total Permits
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                    {totalPermits}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <CheckCircle size={24} color="#34C759" />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Active
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600', color: '#34C759' }}>
                    {activePermits}
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
                    {expiring}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={{ flex: 1 }}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <AlertTriangle size={24} color={theme.colors.error} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Pending Renewal
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.error }}>
                    {pendingRenewal}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </View>

          <Searchbar
            placeholder="Search permits..."
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
              {filteredPermits.length} Permit{filteredPermits.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredPermits}
            renderItem={renderPermitCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <Card style={{ padding: 32, alignItems: 'center' }}>
                <FileText size={48} color={theme.colors.outline} />
                <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
                  No permits found
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first permit to get started'
                  }
                </Text>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={() => router.push('/(admin)/compliance/permits/create')}
                    style={{ marginTop: 16 }}
                    icon="plus"
                  >
                    Add Permit
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
        onPress={() => router.push('/(admin)/compliance/permits/create')}
      />
    </ScreenWrapper>
  );
};

export default PermitRenewalsScreen;
