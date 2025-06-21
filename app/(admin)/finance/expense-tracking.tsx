// waygo-freight/app/(admin)/finance/expense-tracking.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View, Alert, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from 'react-native-paper';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Searchbar, 
  Avatar, 
  Badge,
  FAB,
  IconButton,
  ProgressBar,
  Surface,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { 
  Receipt, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Fuel,
  Wrench,
  Coffee,
  MapPin,
  User,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Download,
  Eye
} from '../../../utils/icons';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface ExpenseItem {
  id: string;
  loadId: string;
  driverId: string;
  driverName: string;
  category: 'fuel' | 'tolls' | 'meals' | 'maintenance' | 'parking' | 'permits' | 'lodging' | 'other';
  description: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receiptUrl?: string;
  receiptNumber: string;
  location?: string;
  mileage?: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseSummary {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalReimbursed: number;
  monthlyTotal: number;
  averagePerTrip: number;
  topCategory: string;
  pendingCount: number;
}

// Mock expense data
const mockExpenses: ExpenseItem[] = [
  {
    id: 'EXP001',
    loadId: 'LD001',
    driverId: 'DRV001',
    driverName: 'John Smith',
    category: 'fuel',
    description: 'Fuel purchase at Shell Station',
    amount: 245.80,
    currency: 'USD',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    receiptNumber: 'RCT001',
    location: 'Dallas, TX',
    mileage: 1250,
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'EXP002',
    loadId: 'LD002',
    driverId: 'DRV002',
    driverName: 'Maria Garcia',
    category: 'meals',
    description: 'Lunch at truck stop',
    amount: 18.50,
    currency: 'USD',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'approved',
    receiptNumber: 'RCT002',
    location: 'Phoenix, AZ',
    approvedBy: 'admin@waygo.com',
    approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'EXP003',
    loadId: 'LD003',
    driverId: 'DRV001',
    driverName: 'John Smith',
    category: 'tolls',
    description: 'Highway toll fees',
    amount: 45.25,
    currency: 'USD',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'reimbursed',
    receiptNumber: 'RCT003',
    location: 'Chicago, IL',
    approvedBy: 'admin@waygo.com',
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'EXP004',
    loadId: 'LD004',
    driverId: 'DRV003',
    driverName: 'Robert Johnson',
    category: 'maintenance',
    description: 'Tire repair service',
    amount: 125.00,
    currency: 'USD',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'rejected',
    receiptNumber: 'RCT004',
    location: 'Denver, CO',
    rejectionReason: 'Insufficient documentation',
    companyId: 'dev-company',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  }
];

const mockSummary: ExpenseSummary = {
  totalPending: 245.80,
  totalApproved: 18.50,
  totalRejected: 125.00,
  totalReimbursed: 45.25,
  monthlyTotal: 434.55,
  averagePerTrip: 108.64,
  topCategory: 'fuel',
  pendingCount: 1
};

const ExpenseTrackingScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isDevMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  useEffect(() => {
    if (isDevMode || !user?.companyId) {
      setExpenses(mockExpenses);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'expenses'),
      where('companyId', '==', user.companyId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expenseItems = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          approvedAt: data.approvedAt?.toDate() || undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ExpenseItem;
      });
      setExpenses(expenseItems);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching expenses:', error);
      setExpenses(mockExpenses);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.companyId, isDevMode]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = searchQuery === '' || 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.loadId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || expense.status === selectedFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [expenses, searchQuery, selectedFilter]);

  const summary = useMemo(() => {
    if (isDevMode && expenses === mockExpenses) {
      return mockSummary;
    }

    const totalPending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    const totalApproved = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
    const totalRejected = expenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0);
    const totalReimbursed = expenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter(e => 
      e.date.getMonth() === currentMonth && e.date.getFullYear() === currentYear
    );
    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categories = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0]?.[0] || 'fuel';
    
    return {
      totalPending,
      totalApproved,
      totalRejected,
      totalReimbursed,
      monthlyTotal,
      averagePerTrip: expenses.length > 0 ? monthlyTotal / expenses.length : 0,
      topCategory,
      pendingCount: expenses.filter(e => e.status === 'pending').length
    };
  }, [expenses, isDevMode]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel': return Fuel;
      case 'tolls': return MapPin;
      case 'meals': return Coffee;
      case 'maintenance': return Wrench;
      case 'parking': return MapPin;
      case 'permits': return FileText;
      case 'lodging': return MapPin;
      default: return Receipt;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fuel': return '#2196F3';
      case 'tolls': return '#FF9800';
      case 'meals': return '#4CAF50';
      case 'maintenance': return '#F44336';
      case 'parking': return '#9C27B0';
      case 'permits': return '#795548';
      case 'lodging': return '#607D8B';
      default: return theme.colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'reimbursed': return '#2196F3';
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'reimbursed': return CreditCard;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Loading expenses...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const renderSummaryCards = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Clock size={24} color='#FF9800' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              ${summary.totalPending.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Pending ({summary.pendingCount})
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <CheckCircle size={24} color='#4CAF50' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              ${summary.totalApproved.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Approved
            </Text>
          </View>
        </Card>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <DollarSign size={24} color='#2196F3' />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              ${summary.monthlyTotal.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Monthly Total
            </Text>
          </View>
        </Card>
        
        <Card style={{ flex: 1, padding: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <TrendingUp size={24} color={theme.colors.primary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              ${summary.averagePerTrip.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              Avg per Trip
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 16, marginBottom: 16 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['all', 'pending', 'approved', 'rejected', 'reimbursed'].map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            showSelectedCheck={false}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  const renderExpenseCard = (expense: ExpenseItem) => {
    const CategoryIcon = getCategoryIcon(expense.category);
    const StatusIcon = getStatusIcon(expense.status);
    
    return (
      <Card key={expense.id} style={{ marginBottom: 12, marginHorizontal: 16 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Avatar.Icon
              size={40}
              icon={() => <CategoryIcon size={20} color="white" />}
              style={{ backgroundColor: getCategoryColor(expense.category) }}
            />
            
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16 }}>
                    {expense.description}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                    {expense.driverName} • Load {expense.loadId}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                    {new Date(expense.date).toLocaleDateString()} • {expense.location}
                  </Text>
                  {expense.vendor && (
                    <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                      {expense.vendor}
                    </Text>
                  )}
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold',
                    color: theme.colors.primary
                  }}>
                    ${expense.amount.toFixed(2)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <StatusIcon size={14} color={getStatusColor(expense.status)} />
                    <Text style={{ 
                      fontSize: 12, 
                      marginLeft: 4,
                      color: getStatusColor(expense.status),
                      fontWeight: '500'
                    }}>
                      {expense.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              {expense.notes && (
                <View style={{ 
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 4
                }}>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    {expense.notes}
                  </Text>
                </View>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {expense.receiptUrl && (
                    <Button
                      mode="outlined"
                      compact
                      icon={() => <Eye size={16} color={theme.colors.primary} />}
                      onPress={() => Alert.alert('View Receipt', 'Receipt viewing functionality')}
                    >
                      Receipt
                    </Button>
                  )}
                </View>
                
                {expense.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      mode="outlined"
                      compact
                      textColor={theme.colors.error}
                      onPress={() => Alert.alert('Reject Expense', 'Please provide a reason for rejection:')}
                    >
                      Reject
                    </Button>
                    <Button
                      mode="contained"
                      compact
                      onPress={() => Alert.alert('Approve Expense', 'Are you sure you want to approve this expense?')}
                    >
                      Approve
                    </Button>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{
          title: 'Expense Tracking',
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 8 }}>
              <IconButton icon={Download} onPress={() => Alert.alert('Export', 'Export feature coming soon')} />
            </View>
          )
        }}
      />
      
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {renderSummaryCards()}
        
        {/* Search and Filter Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Searchbar
            placeholder="Search expenses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ 
              marginBottom: 12,
              backgroundColor: theme.colors.surface 
            }}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['all', 'pending', 'approved', 'rejected', 'reimbursed'].map((status) => (
                <Chip
                  key={status}
                  selected={selectedFilter === status}
                  onPress={() => setSelectedFilter(status)}
                  mode={selectedFilter === status ? 'flat' : 'outlined'}
                  style={{ 
                    backgroundColor: selectedFilter === status 
                      ? theme.colors.primaryContainer 
                      : theme.colors.surface 
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Expense List */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {filteredExpenses.map((expense) => (
            <Card
              key={expense.id}
              style={{
                marginBottom: 12,
                backgroundColor: theme.colors.surface,
                elevation: 2,
                borderRadius: 12
              }}
            >
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Avatar.Icon
                        size={32}
                        icon={getCategoryIcon(expense.category)}
                        style={{ 
                          backgroundColor: getCategoryColor(expense.category),
                          marginRight: 12 
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text 
                          variant="titleMedium" 
                          style={{ 
                            fontWeight: '600',
                            color: theme.colors.onSurface,
                            marginBottom: 2
                          }}
                        >
                          {expense.description}
                        </Text>
                        <Text 
                          variant="bodySmall" 
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {expense.driverName} • Load #{expense.loadId}
                        </Text>
                      </View>
                      <Chip
                        icon={getStatusIcon(expense.status)}
                        textStyle={{
                          color: getStatusColor(expense.status),
                          fontSize: 11,
                          fontWeight: '600'
                        }}
                        style={{
                          backgroundColor: `${getStatusColor(expense.status)}15`,
                          borderColor: getStatusColor(expense.status),
                          borderWidth: 1,
                          height: 24
                        }}
                      >
                        {expense.status.toUpperCase()}
                      </Chip>
                    </View>

                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 8 
                    }}>
                      <Text 
                        variant="headlineSmall" 
                        style={{ 
                          fontWeight: '700',
                          color: theme.colors.primary 
                        }}
                      >
                        ${expense.amount.toFixed(2)}
                      </Text>
                      <Text 
                        variant="bodySmall" 
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        {expense.date.toLocaleDateString()}
                      </Text>
                    </View>

                    {expense.location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <MapPin size={14} color={theme.colors.onSurfaceVariant} />
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            marginLeft: 4,
                            color: theme.colors.onSurfaceVariant 
                          }}
                        >
                          {expense.location}
                        </Text>
                      </View>
                    )}

                    {expense.receiptNumber && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Receipt size={14} color={theme.colors.onSurfaceVariant} />
                        <Text 
                          variant="bodySmall" 
                          style={{ 
                            marginLeft: 4,
                            color: theme.colors.onSurfaceVariant 
                          }}
                        >
                          Receipt: {expense.receiptNumber}
                        </Text>
                      </View>
                    )}

                    {expense.notes && (
                      <Text 
                        variant="bodySmall" 
                        style={{ 
                          fontStyle: 'italic',
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 8
                        }}
                      >
                        {expense.notes}
                      </Text>
                    )}

                    {expense.rejectionReason && (
                      <Surface 
                        style={{ 
                          padding: 8, 
                          borderRadius: 6,
                          backgroundColor: `${theme.colors.error}10`,
                          marginBottom: 8
                        }}
                      >
                        <Text 
                          variant="bodySmall" 
                          style={{ color: theme.colors.error }}
                        >
                          Rejection Reason: {expense.rejectionReason}
                        </Text>
                      </Surface>
                    )}

                    {expense.approvedBy && expense.approvedAt && (
                      <Text 
                        variant="bodySmall" 
                        style={{ 
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 8
                        }}
                      >
                        Approved by {expense.approvedBy} on {expense.approvedAt.toLocaleDateString()}
                      </Text>
                    )}

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button
                          mode="outlined"
                          compact
                          icon={Eye}
                          onPress={() => Alert.alert('View Receipt', 'Receipt viewer coming soon')}
                        >
                          View Receipt
                        </Button>
                      </View>
                      
                      {expense.status === 'pending' && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Button
                            mode="outlined"
                            compact
                            textColor={theme.colors.error}
                            onPress={() => Alert.alert('Reject Expense', 'Please provide a reason for rejection:')}
                          >
                            Reject
                          </Button>
                          <Button
                            mode="contained"
                            compact
                            onPress={() => Alert.alert('Approve Expense', 'Are you sure you want to approve this expense?')}
                          >
                            Approve
                          </Button>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredExpenses.length === 0 && (
            <Card style={{ 
              padding: 32, 
              alignItems: 'center',
              backgroundColor: theme.colors.surface 
            }}>
              <Receipt size={48} color={theme.colors.onSurfaceVariant} />
              <Text 
                variant="titleMedium" 
                style={{ 
                  marginTop: 16, 
                  marginBottom: 8,
                  color: theme.colors.onSurface 
                }}
              >
                No Expenses Found
              </Text>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  textAlign: 'center',
                  color: theme.colors.onSurfaceVariant 
                }}
              >
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Expenses will appear here once drivers submit them'
                }
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon={Plus}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => Alert.alert('Add Expense', 'Add expense form coming soon')}
      />
    </ScreenWrapper>
  );
};

export default ExpenseTrackingScreen;
