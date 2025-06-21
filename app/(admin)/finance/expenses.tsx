import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Searchbar, 
  FAB, 
  Menu, 
  IconButton,
  Badge,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { 
  Receipt, 
  Plus, 
  Filter, 
  Download, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface ExpenseItem {
  id: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: string;
  submittedDate?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  driverId?: string;
  driverName?: string;
  loadId?: string;
  vehicleId?: string;
  receipts: string[];
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  mileage?: number;
  location?: string;
  isReimbursable: boolean;
  tags?: string[];
}

const mockExpenses: ExpenseItem[] = [
  {
    id: 'exp-001',
    category: 'Fuel',
    subcategory: 'Diesel',
    description: 'Fuel purchase at Pilot Flying J',
    amount: 1285.50,
    date: '2025-06-19T14:30:00Z',
    submittedDate: '2025-06-19T15:00:00Z',
    status: 'approved',
    driverId: 'D-001',
    driverName: 'John Smith',
    loadId: 'L-2025-145',
    vehicleId: 'T-001',
    receipts: ['receipt-001.jpg'],
    location: 'Dallas, TX',
    mileage: 450,
    isReimbursable: true,
    approvedBy: 'Manager',
    approvedDate: '2025-06-19T16:30:00Z',
    tags: ['business-travel', 'urgent']
  },
  {
    id: 'exp-002',
    category: 'Maintenance',
    subcategory: 'Routine Service',
    description: 'Oil change and preventive maintenance',
    amount: 425.00,
    date: '2025-06-18T10:15:00Z',
    submittedDate: '2025-06-18T11:00:00Z',
    status: 'paid',
    vehicleId: 'T-003',
    receipts: ['receipt-002.pdf'],
    location: 'Atlanta, GA',
    isReimbursable: false,
    approvedBy: 'Fleet Manager',
    approvedDate: '2025-06-18T14:00:00Z',
    notes: 'Next service due in 10,000 miles'
  },
  {
    id: 'exp-003',
    category: 'Tolls',
    description: 'Highway tolls - I-95 corridor',
    amount: 85.75,
    date: '2025-06-17T08:45:00Z',
    submittedDate: '2025-06-17T20:30:00Z',
    status: 'submitted',
    driverId: 'D-002',
    driverName: 'Mike Johnson',
    loadId: 'L-2025-142',
    receipts: ['receipt-003.jpg'],
    location: 'New York, NY',
    isReimbursable: true,
    tags: ['route-expense']
  },
  {
    id: 'exp-004',
    category: 'Permits',
    subcategory: 'Oversize Load',
    description: 'Special permit for oversized cargo',
    amount: 150.00,
    date: '2025-06-16T12:20:00Z',
    status: 'draft',
    loadId: 'L-2025-140',
    receipts: [],
    location: 'Phoenix, AZ',
    isReimbursable: false,
    notes: 'Awaiting receipt upload'
  },
  {
    id: 'exp-005',
    category: 'Meals',
    description: 'Driver meal allowance',
    amount: 45.00,
    date: '2025-06-15T19:30:00Z',
    submittedDate: '2025-06-16T08:00:00Z',
    status: 'rejected',
    driverId: 'D-003',
    driverName: 'Sarah Wilson',
    receipts: ['receipt-005.jpg'],
    location: 'Denver, CO',
    isReimbursable: true,
    rejectionReason: 'Exceeds daily meal allowance limit',
    tags: ['per-diem']
  }
];

const expenseCategories = [
  'All Categories',
  'Fuel',
  'Maintenance',
  'Tolls',
  'Permits',
  'Meals',
  'Lodging',
  'Insurance',
  'Equipment',
  'Office Supplies',
  'Other'
];

const statusFilters = [
  'All Status',
  'Draft',
  'Submitted',
  'Approved',
  'Rejected',
  'Paid'
];

export default function ExpenseManagementScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showFilters, setShowFilters] = useState(false);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const fetchExpenses = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setExpenses(mockExpenses);
    setFilteredExpenses(mockExpenses);
    setLoading(false);
  };

  const filterExpenses = useCallback(() => {
    let filtered = expenses;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.loadId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(expense => 
        expense.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchQuery, selectedCategory, selectedStatus]);

  React.useEffect(() => {
    filterExpenses();
  }, [filterExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#8E8E93';
      case 'submitted':
        return '#007AFF';
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'paid':
        return '#00C7BE';
      default:
        return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit size={16} color="#8E8E93" />;
      case 'submitted':
        return <Clock size={16} color="#007AFF" />;
      case 'approved':
        return <CheckCircle size={16} color="#34C759" />;
      case 'rejected':
        return <XCircle size={16} color="#FF3B30" />;
      case 'paid':
        return <CheckCircle size={16} color="#00C7BE" />;
      default:
        return <AlertTriangle size={16} color={theme.colors.outline} />;
    }
  };

  const handleExpenseAction = (expense: ExpenseItem, action: 'approve' | 'reject' | 'delete') => {
    setSelectedExpense(expense);
    setActionType(action);
    setActionDialogVisible(true);
  };

  const confirmAction = async () => {
    if (!selectedExpense || !actionType) return;

    const updatedExpenses = expenses.map(exp => {
      if (exp.id === selectedExpense.id) {
        switch (actionType) {
          case 'approve':
            return {
              ...exp, 
              status: 'approved' as const,
              approvedBy: 'Current User',
              approvedDate: new Date().toISOString()
            };
          case 'reject':
            return {
              ...exp, 
              status: 'rejected' as const,
              rejectionReason: rejectionReason || 'No reason provided'
            };
          default:
            return exp;
        }
      }
      return exp;
    });

    if (actionType === 'delete') {
      const filteredExpenses = expenses.filter(exp => exp.id !== selectedExpense.id);
      setExpenses(filteredExpenses);
    } else {
      setExpenses(updatedExpenses);
    }

    setActionDialogVisible(false);
    setSelectedExpense(null);
    setActionType(null);
    setRejectionReason('');
  };

  const getTotalByStatus = (status: string) => {
    return expenses
      .filter(exp => exp.status === status)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Expense Management',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon={() => <Filter size={24} color={theme.colors.onSurface} />}
                onPress={() => setShowFilters(!showFilters)}
              />
              <IconButton
                icon={() => <Download size={24} color={theme.colors.onSurface} />}
                onPress={() => alert('Export functionality would be implemented here')}
              />
            </View>
          ),
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{ padding: 16, backgroundColor: theme.colors.surface }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Receipt size={24} color={theme.colors.primary} />
            <Heading level={2} style={{ marginLeft: 8, flex: 1 }}>
              Expense Management
            </Heading>
          </View>
          
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
            Manage and track business expenses across all operations
          </Text>

          {/* Status Summary Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12 }}>
              {[
                { status: 'submitted', label: 'Pending Review', color: '#007AFF' },
                { status: 'approved', label: 'Approved', color: '#34C759' },
                { status: 'rejected', label: 'Rejected', color: '#FF3B30' },
                { status: 'paid', label: 'Paid', color: '#00C7BE' }
              ].map(({ status, label, color }) => (
                <Card key={status} style={{ minWidth: 140 }}>
                  <Card.Content style={{ padding: 12 }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                      {label}
                    </Text>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color }}>
                      {formatCurrency(getTotalByStatus(status))}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {expenses.filter(exp => exp.status === status).length} items
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Search */}
        <View style={{ padding: 16 }}>
          <Searchbar
            placeholder="Search expenses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: showFilters ? 16 : 0 }}
          />

          {/* Filters */}
          {showFilters && (
            <View>
              <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '600' }}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {expenseCategories.map((category) => (
                    <Chip
                      key={category}
                      mode={selectedCategory === category ? 'flat' : 'outlined'}
                      onPress={() => setSelectedCategory(category)}
                      style={selectedCategory === category ? { backgroundColor: theme.colors.primary } : {}}
                      textStyle={selectedCategory === category ? { color: '#FFFFFF' } : {}}
                    >
                      {category}
                    </Chip>
                  ))}
                </View>
              </ScrollView>

              <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '600' }}>
                Status
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {statusFilters.map((status) => (
                    <Chip
                      key={status}
                      mode={selectedStatus === status ? 'flat' : 'outlined'}
                      onPress={() => setSelectedStatus(status)}
                      style={selectedStatus === status ? { backgroundColor: theme.colors.primary } : {}}
                      textStyle={selectedStatus === status ? { color: '#FFFFFF' } : {}}
                    >
                      {status}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Expense List */}
        <View style={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}>
          {filteredExpenses.length === 0 ? (
            <Card>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Receipt size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
                  No expenses found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first expense to get started'}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            filteredExpenses.map((expense) => (
              <Card key={expense.id} style={{ marginBottom: 12 }}>
                <Card.Content style={{ paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        {getStatusIcon(expense.status)}
                        <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: '500', flex: 1 }}>
                          {expense.description}
                        </Text>
                        <Menu
                          visible={menuVisible[expense.id] || false}
                          onDismiss={() => setMenuVisible({ ...menuVisible, [expense.id]: false })}
                          anchor={
                            <IconButton
                              icon={() => <MoreVertical size={20} color={theme.colors.onSurfaceVariant} />}
                              size={16}
                              onPress={() => setMenuVisible({ ...menuVisible, [expense.id]: true })}
                            />
                          }
                        >
                          <Menu.Item 
                            onPress={() => {
                              setMenuVisible({ ...menuVisible, [expense.id]: false });
                              router.push(`/(admin)/finance/expense-details/${expense.id}`);
                            }} 
                            title="View Details" 
                            leadingIcon={() => <Eye size={16} color={theme.colors.onSurface} />}
                          />
                          {expense.status === 'submitted' && (
                            <>
                              <Menu.Item 
                                onPress={() => {
                                  setMenuVisible({ ...menuVisible, [expense.id]: false });
                                  handleExpenseAction(expense, 'approve');
                                }} 
                                title="Approve" 
                                leadingIcon={() => <CheckCircle size={16} color="#34C759" />}
                              />
                              <Menu.Item 
                                onPress={() => {
                                  setMenuVisible({ ...menuVisible, [expense.id]: false });
                                  handleExpenseAction(expense, 'reject');
                                }} 
                                title="Reject" 
                                leadingIcon={() => <XCircle size={16} color="#FF3B30" />}
                              />
                            </>
                          )}
                          <Menu.Item 
                            onPress={() => {
                              setMenuVisible({ ...menuVisible, [expense.id]: false });
                              handleExpenseAction(expense, 'delete');
                            }} 
                            title="Delete" 
                            leadingIcon={() => <Trash2 size={16} color="#FF3B30" />}
                          />
                        </Menu>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={{ height: 24, marginRight: 8 }}>
                          {expense.category}
                        </Chip>
                        <Chip 
                          mode="outlined"
                          textStyle={{ 
                            color: getStatusColor(expense.status),
                            fontSize: 11
                          }}
                          style={{ height: 24, marginRight: 8 }}
                        >
                          {expense.status.toUpperCase()}
                        </Chip>
                        {expense.isReimbursable && (
                          <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={{ height: 24 }}>
                            Reimbursable
                          </Chip>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {new Date(expense.date).toLocaleDateString()} • {expense.location}
                          </Text>
                          {expense.driverName && (
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Driver: {expense.driverName}
                            </Text>
                          )}
                          {expense.loadId && (
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Load: {expense.loadId}
                            </Text>
                          )}
                        </View>
                        
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                            {formatCurrency(expense.amount)}
                          </Text>
                          {expense.receipts.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                              <Receipt size={12} color={theme.colors.onSurfaceVariant} />
                              <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                                {expense.receipts.length} receipt{expense.receipts.length > 1 ? 's' : ''}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {expense.tags && expense.tags.length > 0 && (
                        <View style={{ flexDirection: 'row', marginTop: 8, gap: 4, flexWrap: 'wrap' }}>
                          {expense.tags.map((tag, index) => (
                            <Badge key={index} size={16} style={{ backgroundColor: theme.colors.primaryContainer }}>
                              {tag}
                            </Badge>
                          ))}
                        </View>
                      )}

                      {expense.rejectionReason && (
                        <View style={{ 
                          marginTop: 8, 
                          padding: 8, 
                          backgroundColor: '#FFF2F2', 
                          borderRadius: 6,
                          borderLeftWidth: 3,
                          borderLeftColor: '#FF3B30'
                        }}>
                          <Text variant="bodySmall" style={{ color: '#FF3B30', fontWeight: '500' }}>
                            Rejection Reason: {expense.rejectionReason}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Action Dialog */}
      <Portal>
        <Dialog visible={actionDialogVisible} onDismiss={() => setActionDialogVisible(false)}>
          <Dialog.Title>
            {actionType === 'approve' && 'Approve Expense'}
            {actionType === 'reject' && 'Reject Expense'}
            {actionType === 'delete' && 'Delete Expense'}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {actionType === 'approve' && `Are you sure you want to approve this expense of ${formatCurrency(selectedExpense?.amount || 0)}?`}
              {actionType === 'reject' && 'Please provide a reason for rejection:'}
              {actionType === 'delete' && 'Are you sure you want to delete this expense? This action cannot be undone.'}
            </Text>
            
            {actionType === 'reject' && (
              <TextInput
                label="Rejection Reason"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                style={{ marginTop: 16 }}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setActionDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={confirmAction}
              buttonColor={actionType === 'delete' ? '#FF3B30' : theme.colors.primary}
              textColor="#FFFFFF"
            >
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'delete' && 'Delete'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Expense FAB */}
      <FAB
        icon={() => <Plus size={24} color="#FFFFFF" />}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => router.push('/(admin)/finance/create-expense')}
      />
    </ScreenWrapper>
  );
}
