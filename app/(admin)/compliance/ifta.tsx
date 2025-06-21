import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  List,
  Surface,
  Dialog,
  Portal,
  TextInput,
  DataTable,
  Divider,
  IconButton,
  ProgressBar,
  Menu,
  FAB
} from 'react-native-paper';
import {
  Fuel,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Filter,
  Eye,
  Calculator,
  TrendingUp,
  BarChart3,
  RefreshCw
} from '../../../utils/icons';
import { router } from 'expo-router';

interface IFTARecord {
  id: string;
  quarter: string;
  year: number;
  jurisdiction: string;
  jurisdictionCode: string;
  miles: number;
  gallons: number;
  fuelCost: number;
  taxRate: number;
  taxOwed: number;
  status: 'draft' | 'calculated' | 'filed' | 'paid';
  dueDate: Date;
  filedDate?: Date;
  paidDate?: Date;
}

interface IFTAJurisdiction {
  code: string;
  name: string;
  taxRate: number;
  miles: number;
  gallons: number;
  taxOwed: number;
  status: 'compliant' | 'pending' | 'overdue';
}

interface FuelTransaction {
  id: string;
  date: Date;
  location: string;
  state: string;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  vendor: string;
  truckId: string;
  receiptUrl?: string;
}

export default function IFTACompliance() {
  const theme = useTheme();
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [quarterMenuVisible, setQuarterMenuVisible] = useState(false);
  const [calculationDialogVisible, setCalculationDialogVisible] = useState(false);
  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  
  // Mock IFTA data
  const [iftaRecords, setIftaRecords] = useState<IFTARecord[]>([
    {
      id: '1',
      quarter: 'Q1',
      year: 2024,
      jurisdiction: 'California',
      jurisdictionCode: 'CA',
      miles: 15420,
      gallons: 2156,
      fuelCost: 8624.00,
      taxRate: 0.533,
      taxOwed: 1149.15,
      status: 'filed',
      dueDate: new Date('2024-04-30'),
      filedDate: new Date('2024-04-15')
    },
    {
      id: '2',
      quarter: 'Q1',
      year: 2024,
      jurisdiction: 'Texas',
      jurisdictionCode: 'TX',
      miles: 18750,
      gallons: 2625,
      fuelCost: 9843.75,
      taxRate: 0.200,
      taxOwed: 525.00,
      status: 'paid',
      dueDate: new Date('2024-04-30'),
      filedDate: new Date('2024-04-10'),
      paidDate: new Date('2024-04-12')
    },
    {
      id: '3',
      quarter: 'Q2',
      year: 2024,
      jurisdiction: 'Florida',
      jurisdictionCode: 'FL',
      miles: 12300,
      gallons: 1722,
      fuelCost: 6888.00,
      taxRate: 0.336,
      taxOwed: 578.59,
      status: 'calculated',
      dueDate: new Date('2024-07-31')
    },
    {
      id: '4',
      quarter: 'Q2',
      year: 2024,
      jurisdiction: 'Georgia',
      jurisdictionCode: 'GA',
      miles: 9850,
      gallons: 1378,
      fuelCost: 5512.00,
      taxRate: 0.295,
      taxOwed: 406.51,
      status: 'draft',
      dueDate: new Date('2024-07-31')
    }
  ]);

  const [jurisdictions, setJurisdictions] = useState<IFTAJurisdiction[]>([
    {
      code: 'CA',
      name: 'California',
      taxRate: 0.533,
      miles: 15420,
      gallons: 2156,
      taxOwed: 1149.15,
      status: 'compliant'
    },
    {
      code: 'TX',
      name: 'Texas',
      taxRate: 0.200,
      miles: 18750,
      gallons: 2625,
      taxOwed: 525.00,
      status: 'compliant'
    },
    {
      code: 'FL',
      name: 'Florida',
      taxRate: 0.336,
      miles: 12300,
      gallons: 1722,
      taxOwed: 578.59,
      status: 'pending'
    },
    {
      code: 'GA',
      name: 'Georgia',
      taxRate: 0.295,
      miles: 9850,
      gallons: 1378,
      taxOwed: 406.51,
      status: 'pending'
    }
  ]);

  const [recentTransactions, setRecentTransactions] = useState<FuelTransaction[]>([
    {
      id: '1',
      date: new Date('2024-01-15'),
      location: 'Flying J Travel Center',
      state: 'CA',
      gallons: 156.5,
      pricePerGallon: 4.25,
      totalCost: 665.63,
      vendor: 'Flying J',
      truckId: 'TRK-001'
    },
    {
      id: '2',
      date: new Date('2024-01-16'),
      location: 'Pilot Travel Center',
      state: 'TX',
      gallons: 189.2,
      pricePerGallon: 3.89,
      totalCost: 736.39,
      vendor: 'Pilot',
      truckId: 'TRK-002'
    },
    {
      id: '3',
      date: new Date('2024-01-17'),
      location: 'TA Travel Center',
      state: 'FL',
      gallons: 142.8,
      pricePerGallon: 4.12,
      totalCost: 588.34,
      vendor: 'TA',
      truckId: 'TRK-001'
    }
  ]);

  // Summary calculations
  const totalMiles = iftaRecords.reduce((sum, record) => sum + record.miles, 0);
  const totalGallons = iftaRecords.reduce((sum, record) => sum + record.gallons, 0);
  const totalTaxOwed = iftaRecords.reduce((sum, record) => sum + record.taxOwed, 0);
  const totalFuelCost = iftaRecords.reduce((sum, record) => sum + record.fuelCost, 0);
  const averageMPG = totalMiles / totalGallons;

  const currentQuarterRecords = iftaRecords.filter(record => 
    record.quarter === `Q${currentQuarter}` && record.year === currentYear
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'compliant':
        return '#4CAF50';
      case 'filed':
      case 'calculated':
        return '#FF9800';
      case 'draft':
      case 'pending':
        return '#2196F3';
      case 'overdue':
        return '#F44336';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'compliant':
        return CheckCircle;
      case 'filed':
      case 'calculated':
        return FileText;
      case 'draft':
      case 'pending':
        return Clock;
      case 'overdue':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const calculateTaxes = () => {
    setCalculationDialogVisible(true);
    // Simulate tax calculation
    setTimeout(() => {
      setIftaRecords(prev =>
        prev.map(record =>
          record.status === 'draft'
            ? { ...record, status: 'calculated' }
            : record
        )
      );
      setCalculationDialogVisible(false);
      Alert.alert('Success', 'IFTA taxes calculated successfully!');
    }, 2000);
  };

  const generateReport = () => {
    setReportDialogVisible(true);
    // Simulate report generation
    setTimeout(() => {
      setReportDialogVisible(false);
      Alert.alert('Report Generated', 'IFTA quarterly report has been generated and is ready for download.');
    }, 3000);
  };

  const fileReturn = (recordId: string) => {
    setIftaRecords(prev =>
      prev.map(record =>
        record.id === recordId
          ? { ...record, status: 'filed', filedDate: new Date() }
          : record
      )
    );
    Alert.alert('Filed Successfully', 'IFTA return has been filed with the jurisdiction.');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IFTA Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>IFTA Compliance</Text>
              <Menu
                visible={quarterMenuVisible}
                onDismiss={() => setQuarterMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setQuarterMenuVisible(true)}
                    icon={() => <Calendar size={16} color={theme.colors.primary} />}
                  >
                    Q{currentQuarter} {currentYear}
                  </Button>
                }
              >
                <Menu.Item title="Q1 2024" onPress={() => { setCurrentQuarter(1); setQuarterMenuVisible(false); }} />
                <Menu.Item title="Q2 2024" onPress={() => { setCurrentQuarter(2); setQuarterMenuVisible(false); }} />
                <Menu.Item title="Q3 2024" onPress={() => { setCurrentQuarter(3); setQuarterMenuVisible(false); }} />
                <Menu.Item title="Q4 2024" onPress={() => { setCurrentQuarter(4); setQuarterMenuVisible(false); }} />
              </Menu>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <Surface style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <MapPin size={24} color="#2196F3" />
                </View>
                <Text variant="bodySmall" style={styles.summaryLabel}>Total Miles</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {totalMiles.toLocaleString()}
                </Text>
              </Surface>

              <Surface style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Fuel size={24} color="#FF9800" />
                </View>
                <Text variant="bodySmall" style={styles.summaryLabel}>Total Gallons</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {totalGallons.toLocaleString()}
                </Text>
              </Surface>

              <Surface style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <DollarSign size={24} color="#4CAF50" />
                </View>
                <Text variant="bodySmall" style={styles.summaryLabel}>Tax Owed</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  ${totalTaxOwed.toLocaleString()}
                </Text>
              </Surface>

              <Surface style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <TrendingUp size={24} color="#9C27B0" />
                </View>
                <Text variant="bodySmall" style={styles.summaryLabel}>Avg MPG</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {averageMPG.toFixed(1)}
                </Text>
              </Surface>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={calculateTaxes}
                icon={() => <Calculator size={16} color="#fff" />}
                style={styles.actionButton}
              >
                Calculate Taxes
              </Button>
              <Button
                mode="outlined"
                onPress={generateReport}
                icon={() => <FileText size={16} color={theme.colors.primary} />}
                style={styles.actionButton}
              >
                Generate Report
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Jurisdiction Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Jurisdiction Status</Text>
            
            {jurisdictions.map(jurisdiction => (
              <Surface key={jurisdiction.code} style={styles.jurisdictionCard}>
                <View style={styles.jurisdictionHeader}>
                  <View style={styles.jurisdictionInfo}>
                    <Text variant="bodyLarge" style={styles.jurisdictionName}>
                      {jurisdiction.name} ({jurisdiction.code})
                    </Text>
                    <Text variant="bodySmall" style={styles.jurisdictionDetails}>
                      {jurisdiction.miles.toLocaleString()} miles • {jurisdiction.gallons.toLocaleString()} gal
                    </Text>
                  </View>
                  <Chip
                    icon={() => React.createElement(getStatusIcon(jurisdiction.status), {
                      size: 16,
                      color: getStatusColor(jurisdiction.status)
                    })}
                    style={[styles.statusChip, { backgroundColor: getStatusColor(jurisdiction.status) }]}
                    textStyle={{ color: '#fff' }}
                  >
                    {jurisdiction.status.toUpperCase()}
                  </Chip>
                </View>
                
                <View style={styles.jurisdictionMetrics}>
                  <View style={styles.metric}>
                    <Text variant="bodySmall">Tax Rate</Text>
                    <Text variant="bodyMedium">${jurisdiction.taxRate}/gal</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text variant="bodySmall">Tax Owed</Text>
                    <Text variant="bodyMedium" style={styles.taxAmount}>
                      ${jurisdiction.taxOwed.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Current Quarter Records */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Q{currentQuarter} {currentYear} Records
              </Text>
              <IconButton
                icon={() => <RefreshCw size={20} color={theme.colors.primary} />}
                onPress={() => Alert.alert('Refreshed', 'IFTA records updated from fuel transactions.')}
              />
            </View>

            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Jurisdiction</DataTable.Title>
                <DataTable.Title numeric>Miles</DataTable.Title>
                <DataTable.Title numeric>Gallons</DataTable.Title>
                <DataTable.Title numeric>Tax Owed</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {currentQuarterRecords.map(record => (
                <DataTable.Row key={record.id}>
                  <DataTable.Cell>{record.jurisdictionCode}</DataTable.Cell>
                  <DataTable.Cell numeric>{record.miles.toLocaleString()}</DataTable.Cell>
                  <DataTable.Cell numeric>{record.gallons.toLocaleString()}</DataTable.Cell>
                  <DataTable.Cell numeric>${record.taxOwed.toFixed(2)}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      style={[styles.tableStatusChip, { backgroundColor: getStatusColor(record.status) }]}
                      textStyle={{ color: '#fff', fontSize: 10 }}
                    >
                      {record.status.toUpperCase()}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {record.status === 'calculated' && (
                      <Button
                        mode="contained"
                        onPress={() => fileReturn(record.id)}
                        style={styles.fileButton}
                      >
                        File
                      </Button>
                    )}
                    {record.status === 'filed' && (
                      <IconButton
                        icon={() => <Eye size={16} color={theme.colors.primary} />}
                        onPress={() => Alert.alert('View Details', `Filed on ${record.filedDate?.toLocaleDateString()}`)}
                      />
                    )}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        {/* Recent Fuel Transactions */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Recent Fuel Transactions</Text>
              <Button
                mode="outlined"
                onPress={() => router.push('/(admin)/fleet/fuel-management')}
                icon={() => <BarChart3 size={16} color={theme.colors.primary} />}
              >
                View All
              </Button>
            </View>

            {recentTransactions.map(transaction => (
              <List.Item
                key={transaction.id}
                title={transaction.vendor}
                description={`${transaction.location} • ${transaction.state}`}
                left={() => (
                  <Surface style={styles.transactionIcon}>
                    <Fuel size={20} color={theme.colors.primary} />
                  </Surface>
                )}
                right={() => (
                  <View style={styles.transactionDetails}>
                    <Text variant="bodyMedium" style={styles.transactionAmount}>
                      ${transaction.totalCost.toFixed(2)}
                    </Text>
                    <Text variant="bodySmall" style={styles.transactionGallons}>
                      {transaction.gallons} gal
                    </Text>
                  </View>
                )}
                style={styles.transactionItem}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Compliance Calendar */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Upcoming Deadlines</Text>
            
            <List.Item
              title="Q2 2024 IFTA Filing"
              description="Due: July 31, 2024"
              left={() => <Calendar size={24} color="#FF9800" />}
              right={() => (
                <Chip
                  style={styles.deadlineChip}
                  textStyle={{ color: '#fff' }}
                >
                  15 days
                </Chip>
              )}
            />

            <List.Item
              title="Q3 2024 Tax Calculation"
              description="Recommended: September 15, 2024"
              left={() => <Calculator size={24} color="#2196F3" />}
              right={() => (
                <Chip
                  style={[styles.deadlineChip, { backgroundColor: '#2196F3' }]}
                  textStyle={{ color: '#fff' }}
                >
                  45 days
                </Chip>
              )}
            />
          </Card.Content>
        </Card>

        {/* Export and Integration */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Export & Integration</Text>
            
            <View style={styles.exportButtons}>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Export', 'Exporting IFTA data to Excel...')}
                icon={() => <Download size={16} color="#fff" />}
                style={styles.exportButton}
              >
                Export to Excel
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Import', 'Import fuel transactions from ELD...')}
                icon={() => <Upload size={16} color={theme.colors.primary} />}
                style={styles.exportButton}
              >
                Import ELD Data
              </Button>
            </View>

            <Divider style={styles.divider} />

            <Text variant="bodyMedium" style={styles.integrationText}>
              Connected integrations: Samsara ELD, Comdata Fuel Cards, QuickBooks
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Loading Dialogs */}
      <Portal>
        <Dialog visible={calculationDialogVisible} dismissable={false}>
          <Dialog.Content>
            <View style={styles.loadingDialog}>
              <ProgressBar indeterminate />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Calculating IFTA taxes...
              </Text>
            </View>
          </Dialog.Content>
        </Dialog>

        <Dialog visible={reportDialogVisible} dismissable={false}>
          <Dialog.Content>
            <View style={styles.loadingDialog}>
              <ProgressBar indeterminate />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Generating quarterly report...
              </Text>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Quick Action FAB */}
      <FAB
        icon={() => <Plus size={24} color="#fff" />}
        style={styles.fab}
        onPress={() => Alert.alert('Add Transaction', 'Manual fuel transaction entry')}
        label="Add Transaction"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 1,
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jurisdictionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 1,
  },
  jurisdictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jurisdictionInfo: {
    flex: 1,
  },
  jurisdictionName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jurisdictionDetails: {
    opacity: 0.7,
  },
  statusChip: {
    borderRadius: 12,
  },
  jurisdictionMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  metric: {
    alignItems: 'center',
  },
  taxAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tableStatusChip: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  fileButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  transactionIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  transactionDetails: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  transactionGallons: {
    opacity: 0.7,
  },
  transactionItem: {
    paddingVertical: 8,
  },
  deadlineChip: {
    backgroundColor: '#FF9800',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  exportButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  integrationText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingDialog: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});
