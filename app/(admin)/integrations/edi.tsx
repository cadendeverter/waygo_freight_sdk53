// waygo-freight/app/(admin)/integrations/edi.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { 
  Text, Card, Button, Chip, useTheme, Surface, 
  Dialog, Portal, TextInput, List, DataTable,
  FAB, ProgressBar, Menu, IconButton, ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Database, FileText, CheckCircle, AlertTriangle, 
  RefreshCw, Download, Upload, Settings, Send,
  Clock, ArrowRight, MoreVertical, Eye
} from '../../../utils/icons';

interface EDITransaction {
  id: string;
  transactionType: '204' | '214' | '210' | '997' | '856' | '810' | '850';
  description: string;
  partner: string;
  direction: 'Inbound' | 'Outbound';
  status: 'Pending' | 'Processing' | 'Sent' | 'Received' | 'Error' | 'Acknowledged';
  timestamp: string;
  documentNumber?: string;
  errorMessage?: string;
  fileSize?: number;
}

interface EDIPartner {
  id: string;
  name: string;
  qualifierId: string;
  interchangeId: string;
  status: 'Active' | 'Inactive' | 'Testing';
  protocols: string[];
  transactionTypes: string[];
  lastActivity: string;
}

export default function EDIManagement() {
  const theme = useTheme();
  
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'PARTNERS' | 'MAPPING' | 'LOGS'>('TRANSACTIONS');
  const [transactions, setTransactions] = useState<EDITransaction[]>([]);
  const [partners, setPartners] = useState<EDIPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<EDITransaction | null>(null);

  useEffect(() => {
    loadEDIData();
  }, []);

  const loadEDIData = async () => {
    try {
      const sampleTransactions: EDITransaction[] = [
        {
          id: 'EDI001',
          transactionType: '204',
          description: 'Load Tender',
          partner: 'C.H. Robinson',
          direction: 'Inbound',
          status: 'Received',
          timestamp: '2024-01-16T10:30:00Z',
          documentNumber: 'LT-240116-001',
          fileSize: 2048
        },
        {
          id: 'EDI002',
          transactionType: '214',
          description: 'Transportation Carrier Shipment Status',
          partner: 'J.B. Hunt',
          direction: 'Outbound',
          status: 'Sent',
          timestamp: '2024-01-16T09:15:00Z',
          documentNumber: 'SS-240116-001',
          fileSize: 1536
        },
        {
          id: 'EDI003',
          transactionType: '997',
          description: 'Functional Acknowledgment',
          partner: 'Schneider National',
          direction: 'Outbound',
          status: 'Error',
          timestamp: '2024-01-16T08:45:00Z',
          errorMessage: 'Invalid partner qualifier',
          fileSize: 512
        }
      ];

      const samplePartners: EDIPartner[] = [
        {
          id: 'PARTNER001',
          name: 'C.H. Robinson',
          qualifierId: 'ZZ',
          interchangeId: 'CHRB',
          status: 'Active',
          protocols: ['AS2', 'SFTP'],
          transactionTypes: ['204', '214', '210', '997'],
          lastActivity: '2024-01-16T10:30:00Z'
        },
        {
          id: 'PARTNER002',
          name: 'J.B. Hunt',
          qualifierId: 'ZZ',
          interchangeId: 'JBHT',
          status: 'Active',
          protocols: ['AS2'],
          transactionTypes: ['204', '214', '997', '856'],
          lastActivity: '2024-01-16T09:15:00Z'
        }
      ];

      setTransactions(sampleTransactions);
      setPartners(samplePartners);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': case 'Received': case 'Acknowledged': case 'Active': return '#4CAF50';
      case 'Processing': case 'Pending': case 'Testing': return '#FF9800';
      case 'Error': case 'Inactive': return '#f44336';
      default: return '#757575';
    }
  };

  const getTransactionTypeDescription = (type: string) => {
    const descriptions = {
      '204': 'Motor Carrier Load Tender',
      '214': 'Transportation Carrier Shipment Status',
      '210': 'Motor Carrier Freight Details',
      '997': 'Functional Acknowledgment',
      '856': 'Ship Notice/Manifest',
      '810': 'Invoice',
      '850': 'Purchase Order'
    };
    return descriptions[type] || type;
  };

  const renderTransactions = () => (
    <ScrollView>
      <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Recent Transactions</Text>
          <Button mode="outlined" icon="refresh" onPress={loadEDIData}>Refresh</Button>
        </View>

        {transactions.map(transaction => (
          <Card key={transaction.id} style={{ marginBottom: 12 }} onPress={() => {
            setSelectedTransaction(transaction);
            setDetailVisible(true);
          }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      {transaction.transactionType}
                    </Text>
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8,
                        backgroundColor: getStatusColor(transaction.status) + '20' 
                      }}
                      textStyle={{ color: getStatusColor(transaction.status), fontSize: 10 }}
                    >
                      {transaction.status}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium">{transaction.description}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {transaction.partner} • {transaction.direction}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Clock size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </Text>
                  </View>

                  {transaction.errorMessage && (
                    <Text variant="bodySmall" style={{ color: '#f44336', marginTop: 4 }}>
                      Error: {transaction.errorMessage}
                    </Text>
                  )}
                </View>
                
                <IconButton 
                  icon="eye" 
                  size={20}
                  onPress={() => {
                    setSelectedTransaction(transaction);
                    setDetailVisible(true);
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </Surface>
    </ScrollView>
  );

  const renderPartners = () => (
    <ScrollView>
      <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Trading Partners</Text>
          <Button mode="outlined" icon="plus">Add Partner</Button>
        </View>

        {partners.map(partner => (
          <Card key={partner.id} style={{ marginBottom: 12 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{partner.name}</Text>
                    <Chip 
                      compact 
                      style={{ 
                        marginLeft: 8,
                        backgroundColor: getStatusColor(partner.status) + '20' 
                      }}
                      textStyle={{ color: getStatusColor(partner.status), fontSize: 10 }}
                    >
                      {partner.status}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium">ID: {partner.interchangeId} ({partner.qualifierId})</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Protocols: {partner.protocols.join(', ')}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Transaction Types: {partner.transactionTypes.join(', ')}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Clock size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                      Last activity: {new Date(partner.lastActivity).toLocaleString()}
                    </Text>
                  </View>
                </View>
                
                <IconButton icon="settings" size={20} />
              </View>
            </Card.Content>
          </Card>
        ))}
      </Surface>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading EDI data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Surface style={{ elevation: 1 }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>EDI Management</Text>
          <IconButton icon="settings" onPress={() => Alert.alert('Settings', 'EDI configuration settings')} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'TRANSACTIONS', label: 'Transactions', icon: 'file-document' },
              { key: 'PARTNERS', label: 'Partners', icon: 'domain' },
              { key: 'MAPPING', label: 'Mapping', icon: 'map' },
              { key: 'LOGS', label: 'Logs', icon: 'text-box' }
            ].map(tab => (
              <Chip
                key={tab.key}
                selected={activeTab === tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{ marginRight: 8 }}
                mode={activeTab === tab.key ? 'flat' : 'outlined'}
                icon={tab.icon}
              >
                {tab.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      {/* Content */}
      {activeTab === 'TRANSACTIONS' && renderTransactions()}
      {activeTab === 'PARTNERS' && renderPartners()}
      {activeTab === 'MAPPING' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Data Mapping</Text>
          <Text style={{ marginTop: 8 }}>Configure field mappings for EDI transactions.</Text>
        </ScrollView>
      )}
      {activeTab === 'LOGS' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text variant="headlineSmall">Transaction Logs</Text>
          <Text style={{ marginTop: 8 }}>View detailed EDI transaction logs and audit trails.</Text>
        </ScrollView>
      )}

      {/* Transaction Detail Dialog */}
      <Portal>
        <Dialog visible={detailVisible} onDismiss={() => setDetailVisible(false)}>
          <Dialog.Title>Transaction Details</Dialog.Title>
          <Dialog.Content>
            {selectedTransaction && (
              <View>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  {selectedTransaction.transactionType} - {getTransactionTypeDescription(selectedTransaction.transactionType)}
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <Text variant="bodyMedium">Partner: {selectedTransaction.partner}</Text>
                  <Text variant="bodyMedium">Direction: {selectedTransaction.direction}</Text>
                  <Text variant="bodyMedium">Status: {selectedTransaction.status}</Text>
                  <Text variant="bodyMedium">Timestamp: {new Date(selectedTransaction.timestamp).toLocaleString()}</Text>
                  {selectedTransaction.documentNumber && (
                    <Text variant="bodyMedium">Document: {selectedTransaction.documentNumber}</Text>
                  )}
                  {selectedTransaction.fileSize && (
                    <Text variant="bodyMedium">Size: {selectedTransaction.fileSize} bytes</Text>
                  )}
                </View>

                {selectedTransaction.errorMessage && (
                  <View style={{ padding: 12, backgroundColor: '#ffebee', borderRadius: 8 }}>
                    <Text variant="bodyMedium" style={{ color: '#d32f2f' }}>
                      Error: {selectedTransaction.errorMessage}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDetailVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="send"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => Alert.alert('Send EDI', 'Send new EDI transaction')}
      />
    </SafeAreaView>
  );
}
