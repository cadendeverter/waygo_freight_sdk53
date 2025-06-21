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
  FAB,
  IconButton,
  Menu,
  Divider,
  Searchbar,
  ProgressBar
} from 'react-native-paper';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Clock,
  Send,
  Eye,
  Edit,
  Trash,
  MoreVertical,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  iconSource
} from '../../../utils/icons';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  loadId: string;
  loadNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentTerms: string;
  description: string;
  lineItems: InvoiceLineItem[];
  sentAt?: Date;
  paidAt?: Date;
  notes?: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'cust1',
    customerName: 'ABC Manufacturing Corp',
    loadId: 'load1',
    loadNumber: 'L-2024-001',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: 'SENT',
    subtotal: 2500.00,
    taxAmount: 200.00,
    totalAmount: 2700.00,
    paidAmount: 0,
    remainingBalance: 2700.00,
    paymentTerms: 'Net 30',
    description: 'Transportation services - Chicago to Dallas',
    lineItems: [
      { id: '1', description: 'Freight Transportation', quantity: 1, unitPrice: 2500.00, totalPrice: 2500.00 }
    ],
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    customerId: 'cust2',
    customerName: 'XYZ Logistics Inc',
    loadId: 'load2',
    loadNumber: 'L-2024-002',
    issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'OVERDUE',
    subtotal: 3200.00,
    taxAmount: 256.00,
    totalAmount: 3456.00,
    paidAmount: 0,
    remainingBalance: 3456.00,
    paymentTerms: 'Net 30',
    description: 'Transportation services - New York to Miami',
    lineItems: [
      { id: '1', description: 'Freight Transportation', quantity: 1, unitPrice: 3000.00, totalPrice: 3000.00 },
      { id: '2', description: 'Fuel Surcharge', quantity: 1, unitPrice: 200.00, totalPrice: 200.00 }
    ],
    sentAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-003',
    customerId: 'cust3',
    customerName: 'Tech Solutions Ltd',
    loadId: 'load3',
    loadNumber: 'L-2024-003',
    issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'PAID',
    subtotal: 1800.00,
    taxAmount: 144.00,
    totalAmount: 1944.00,
    paidAmount: 1944.00,
    remainingBalance: 0,
    paymentTerms: 'Net 15',
    description: 'Transportation services - Denver to Phoenix',
    lineItems: [
      { id: '1', description: 'Freight Transportation', quantity: 1, unitPrice: 1800.00, totalPrice: 1800.00 }
    ],
    sentAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2024-004',
    customerId: 'cust1',
    customerName: 'ABC Manufacturing Corp',
    loadId: 'load4',
    loadNumber: 'L-2024-004',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'DRAFT',
    subtotal: 2100.00,
    taxAmount: 168.00,
    totalAmount: 2268.00,
    paidAmount: 0,
    remainingBalance: 2268.00,
    paymentTerms: 'Net 30',
    description: 'Transportation services - Atlanta to Jacksonville',
    lineItems: [
      { id: '1', description: 'Freight Transportation', quantity: 1, unitPrice: 2100.00, totalPrice: 2100.00 }
    ]
  }
];

export default function InvoicingScreen() {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return theme.colors.outline;
      case 'SENT': return '#2196F3';
      case 'PAID': return '#4CAF50';
      case 'OVERDUE': return '#F44336';
      case 'CANCELLED': return '#9E9E9E';
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit size={20} color={theme.colors.outline} />;
      case 'SENT': return <Send size={20} color="#2196F3" />;
      case 'PAID': return <CheckCircle size={20} color="#4CAF50" />;
      case 'OVERDUE': return <AlertCircle size={20} color="#F44336" />;
      case 'CANCELLED': return <XCircle size={20} color="#9E9E9E" />;
      default: return <FileText size={20} color={theme.colors.outline} />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchQuery || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.loadNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || invoice.status.toLowerCase() === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalOutstanding = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((sum, i) => sum + i.remainingBalance, 0);
  const totalOverdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.remainingBalance, 0);
  const paidThisMonth = invoices.filter(i => {
    const thisMonth = new Date();
    const invoiceMonth = i.paidAt ? new Date(i.paidAt) : null;
    return invoiceMonth && 
           invoiceMonth.getMonth() === thisMonth.getMonth() && 
           invoiceMonth.getFullYear() === thisMonth.getFullYear();
  }).reduce((sum, i) => sum + i.paidAmount, 0);
  const draftCount = invoices.filter(i => i.status === 'DRAFT').length;

  const sendInvoice = (invoiceId: string) => {
    Alert.alert(
      'Send Invoice',
      'Are you sure you want to send this invoice to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            setInvoices(prev => prev.map(inv =>
              inv.id === invoiceId
                ? { ...inv, status: 'SENT' as any, sentAt: new Date() }
                : inv
            ));
            Alert.alert('Success', 'Invoice sent successfully!');
          }
        }
      ]
    );
  };

  const markAsPaid = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    Alert.prompt(
      'Mark as Paid',
      `Enter payment amount (Outstanding: $${invoice.remainingBalance.toFixed(2)}):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: (amount) => {
            const paidAmount = parseFloat(amount || '0');
            if (isNaN(paidAmount) || paidAmount <= 0) {
              Alert.alert('Error', 'Please enter a valid payment amount');
              return;
            }

            setInvoices(prev => prev.map(inv =>
              inv.id === invoiceId
                ? { 
                    ...inv, 
                    paidAmount: inv.paidAmount + paidAmount,
                    remainingBalance: Math.max(0, inv.remainingBalance - paidAmount),
                    status: (inv.remainingBalance - paidAmount <= 0 ? 'PAID' : inv.status) as any,
                    paidAt: inv.remainingBalance - paidAmount <= 0 ? new Date() : inv.paidAt
                  }
                : inv
            ));
            Alert.alert('Success', 'Payment recorded successfully!');
          }
        }
      ],
      'plain-text',
      invoice.remainingBalance.toString()
    );
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    const lineItemsText = invoice.lineItems.map(item => 
      `${item.description}: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.totalPrice.toFixed(2)}`
    ).join('\n');

    Alert.alert(
      `Invoice ${invoice.invoiceNumber}`,
      `Customer: ${invoice.customerName}
Load: ${invoice.loadNumber}
Issue Date: ${invoice.issueDate.toLocaleDateString()}
Due Date: ${invoice.dueDate.toLocaleDateString()}
Status: ${invoice.status}

Line Items:
${lineItemsText}

Subtotal: $${invoice.subtotal.toFixed(2)}
Tax: $${invoice.taxAmount.toFixed(2)}
Total: $${invoice.totalAmount.toFixed(2)}
Paid: $${invoice.paidAmount.toFixed(2)}
Outstanding: $${invoice.remainingBalance.toFixed(2)}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}`,
      [
        { text: 'OK' },
        invoice.status === 'DRAFT' ? {
          text: 'Send',
          onPress: () => sendInvoice(invoice.id)
        } : undefined,
        invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' ? {
          text: 'Mark Paid',
          onPress: () => markAsPaid(invoice.id)
        } : undefined
      ].filter(Boolean) as any
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportInvoices = () => {
    Alert.alert('Export Invoices', 'Invoice report exported successfully!');
  };

  const createNewInvoice = () => {
    Alert.alert('Create Invoice', 'New invoice creation form will open in a future update.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Invoicing</Text>
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
              onPress={exportInvoices}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <DollarSign size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">${(totalOutstanding / 1000).toFixed(0)}K</Text>
                <Text variant="bodySmall">Outstanding</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={24} color="#F44336" />
              <View>
                <Text variant="headlineMedium">${(totalOverdue / 1000).toFixed(0)}K</Text>
                <Text variant="bodySmall">Overdue</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={24} color="#4CAF50" />
              <View>
                <Text variant="headlineMedium">${(paidThisMonth / 1000).toFixed(0)}K</Text>
                <Text variant="bodySmall">Paid This Month</Text>
              </View>
            </View>
          </Card>
          
          <Card style={{ width: (screenWidth - 44) / 2, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Edit size={24} color="#2196F3" />
              <View>
                <Text variant="headlineMedium">{draftCount}</Text>
                <Text variant="bodySmall">Draft Invoices</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Search */}
        <Searchbar
          placeholder="Search invoices..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'all', label: 'All Invoices' },
              { key: 'draft', label: 'Draft' },
              { key: 'sent', label: 'Sent' },
              { key: 'paid', label: 'Paid' },
              { key: 'overdue', label: 'Overdue' }
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

      {/* Invoices List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredInvoices.map(invoice => (
          <Card key={invoice.id} style={{ marginBottom: 12 }}>
            <List.Item
              title={`${invoice.invoiceNumber} - ${invoice.customerName}`}
              description={`${invoice.loadNumber} • Due: ${invoice.dueDate.toLocaleDateString()} • $${invoice.totalAmount.toFixed(2)}`}
              left={(props) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar.Icon 
                    {...props} 
                    icon="file-text"
                    style={{ backgroundColor: getStatusColor(invoice.status) }}
                  />
                  {getStatusIcon(invoice.status)}
                </View>
              )}
              right={(props) => (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Badge style={{ backgroundColor: getStatusColor(invoice.status) }}>
                    {invoice.status}
                  </Badge>
                  <Menu
                    visible={menuVisible === invoice.id}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => setMenuVisible(invoice.id)}
                      />
                    }
                  >
                    <Menu.Item 
                      onPress={() => {
                        setMenuVisible(null);
                        viewInvoiceDetails(invoice);
                      }} 
                      title="View Details" 
                      leadingIcon="eye"
                    />
                    {invoice.status === 'DRAFT' && (
                      <Menu.Item 
                        onPress={() => {
                          setMenuVisible(null);
                          sendInvoice(invoice.id);
                        }} 
                        title="Send Invoice" 
                        leadingIcon="send"
                      />
                    )}
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                      <Menu.Item 
                        onPress={() => {
                          setMenuVisible(null);
                          markAsPaid(invoice.id);
                        }} 
                        title="Record Payment" 
                        leadingIcon="check-circle"
                      />
                    )}
                    <Menu.Item 
                      onPress={() => {
                        setMenuVisible(null);
                        Alert.alert('Feature Coming Soon', 'Invoice editing will be available in a future update.');
                      }} 
                      title="Edit" 
                      leadingIcon="pencil"
                    />
                  </Menu>
                </View>
              )}
              onPress={() => viewInvoiceDetails(invoice)}
            />
            
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                {invoice.description}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Issued: {invoice.issueDate.toLocaleDateString()}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Terms: {invoice.paymentTerms}
                </Text>
              </View>

              {/* Payment Progress */}
              {invoice.status !== 'DRAFT' && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Payment Progress</Text>
                    <Text variant="bodySmall">
                      ${invoice.paidAmount.toFixed(2)} / ${invoice.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={invoice.paidAmount / invoice.totalAmount} 
                    color={invoice.status === 'PAID' ? '#4CAF50' : invoice.status === 'OVERDUE' ? '#F44336' : '#2196F3'}
                    style={{ height: 6 }}
                  />
                </View>
              )}

              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {invoice.status === 'DRAFT' && (
                  <Button
                    mode="outlined"
                    onPress={() => sendInvoice(invoice.id)}
                    style={{ flex: 1 }}
                    compact
                  >
                    Send Invoice
                  </Button>
                )}
                
                {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && invoice.status !== 'DRAFT' && (
                  <Button
                    mode="outlined"
                    onPress={() => markAsPaid(invoice.id)}
                    style={{ flex: 1 }}
                    compact
                  >
                    Record Payment
                  </Button>
                )}
                
                <Button
                  mode="text"
                  onPress={() => viewInvoiceDetails(invoice)}
                  compact
                >
                  View Details
                </Button>
              </View>
            </View>
          </Card>
        ))}
        
        {filteredInvoices.length === 0 && (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <FileText size={48} color={theme.colors.outline} />
            <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 8 }}>
              No Invoices Found
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.outline }}>
              {searchQuery 
                ? 'No invoices match your search criteria.' 
                : 'Create your first invoice to get started.'}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="New Invoice"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={createNewInvoice}
      />
    </View>
  );
}
