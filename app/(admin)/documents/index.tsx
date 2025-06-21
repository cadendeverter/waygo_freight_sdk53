import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, Linking } from 'react-native';
import { Card, Title, Button, FAB, Chip, Text, Searchbar, DataTable, Portal, Modal, TextInput, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Upload, Eye, Edit, Trash, Share, Camera, CheckCircle, Clock, AlertCircle } from '../../../utils/icons';
import { useAuth } from '../../../state/authContext';
import { useLoad } from '../../../state/loadContext';

interface Document {
  id: string;
  name: string;
  type: 'bol' | 'pod' | 'invoice' | 'manifest' | 'customs' | 'permit' | 'insurance' | 'other';
  loadId?: string;
  customerId?: string;
  driverId?: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'expired' | 'archived';
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  signedBy?: string[];
  signedAt?: Date;
  expiresAt?: Date;
  tags: string[];
  version: number;
  isActive: boolean;
}

interface eSignatureRequest {
  id: string;
  documentId: string;
  signerEmail: string;
  signerName: string;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  sentAt: Date;
  signedAt?: Date;
  ipAddress?: string;
  location?: string;
}

const DocumentManagement: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { loads } = useLoad();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'signed' | 'expired'>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signatureRequests, setSignatureRequests] = useState<eSignatureRequest[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Mock document data
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: 'doc-001',
        name: 'Bill of Lading - Load LD-2024-001',
        type: 'bol',
        loadId: 'load-001',
        status: 'signed',
        fileUrl: 'https://example.com/bol-001.pdf',
        mimeType: 'application/pdf',
        size: 245760,
        uploadedBy: 'dispatcher-001',
        uploadedAt: new Date('2024-01-15T10:00:00Z'),
        signedBy: ['driver-001', 'customer-001'],
        signedAt: new Date('2024-01-15T11:30:00Z'),
        tags: ['load', 'bol', 'signed'],
        version: 1,
        isActive: true
      },
      {
        id: 'doc-002',
        name: 'Proof of Delivery - Load LD-2024-001',
        type: 'pod',
        loadId: 'load-001',
        status: 'pending_signature',
        fileUrl: 'https://example.com/pod-001.pdf',
        mimeType: 'application/pdf',
        size: 189440,
        uploadedBy: 'driver-001',
        uploadedAt: new Date('2024-01-16T14:00:00Z'),
        tags: ['load', 'pod', 'delivery'],
        version: 1,
        isActive: true
      },
      {
        id: 'doc-003',
        name: 'Commercial Invoice INV-2024-001',
        type: 'invoice',
        loadId: 'load-001',
        customerId: 'customer-001',
        status: 'signed',
        fileUrl: 'https://example.com/invoice-001.pdf',
        mimeType: 'application/pdf',
        size: 156672,
        uploadedBy: 'admin-001',
        uploadedAt: new Date('2024-01-16T16:00:00Z'),
        signedBy: ['customer-001'],
        signedAt: new Date('2024-01-16T18:00:00Z'),
        tags: ['invoice', 'billing', 'signed'],
        version: 2,
        isActive: true
      },
      {
        id: 'doc-004',
        name: 'HazMat Permit - Chemicals',
        type: 'permit',
        status: 'signed',
        fileUrl: 'https://example.com/hazmat-permit.pdf',
        mimeType: 'application/pdf',
        size: 512000,
        uploadedBy: 'compliance-001',
        uploadedAt: new Date('2024-01-10T09:00:00Z'),
        signedBy: ['admin-001'],
        signedAt: new Date('2024-01-10T10:00:00Z'),
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        tags: ['hazmat', 'permit', 'compliance'],
        version: 1,
        isActive: true
      }
    ];

    const mockSignatureRequests: eSignatureRequest[] = [
      {
        id: 'sig-001',
        documentId: 'doc-002',
        signerEmail: 'customer@abcelectronics.com',
        signerName: 'Mike Johnson',
        status: 'pending',
        sentAt: new Date('2024-01-16T14:30:00Z')
      },
      {
        id: 'sig-002',
        documentId: 'doc-001',
        signerEmail: 'driver@waygo.com',
        signerName: 'John Driver',
        status: 'signed',
        sentAt: new Date('2024-01-15T10:30:00Z'),
        signedAt: new Date('2024-01-15T11:30:00Z'),
        ipAddress: '192.168.1.100',
        location: 'Dallas, TX'
      }
    ];

    setDocuments(mockDocuments);
    setSignatureRequests(mockSignatureRequests);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter ||
                         (selectedFilter === 'pending' && doc.status === 'pending_signature');
    
    return matchesSearch && matchesFilter && doc.isActive;
  });

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'signed':
        return '#4CAF50';
      case 'pending_signature':
        return '#FF9800';
      case 'draft':
        return '#2196F3';
      case 'expired':
        return '#F44336';
      case 'archived':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'signed':
        return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending_signature':
        return <Clock size={16} color="#FF9800" />;
      case 'expired':
        return <AlertCircle size={16} color="#F44336" />;
      default:
        return <FileText size={16} color="#2196F3" />;
    }
  };

  const handleDocumentAction = (action: string, document: Document) => {
    switch (action) {
      case 'view':
        // Open document viewer
        Alert.alert('View Document', `Opening ${document.name}`);
        break;
      case 'download':
        // Download document
        Alert.alert('Download', `Downloading ${document.name}`);
        break;
      case 'share':
        // Share document
        Alert.alert('Share Document', `Sharing ${document.name}`);
        break;
      case 'signature':
        setSelectedDocument(document);
        setShowSignatureModal(true);
        break;
      case 'delete':
        Alert.alert(
          'Delete Document',
          `Are you sure you want to delete ${document.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteDocument(document.id) }
          ]
        );
        break;
    }
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, isActive: false } : doc
    ));
  };

  const sendSignatureRequest = (email: string, name: string) => {
    if (!selectedDocument) return;
    
    const newRequest: eSignatureRequest = {
      id: `sig-${Date.now()}`,
      documentId: selectedDocument.id,
      signerEmail: email,
      signerName: name,
      status: 'pending',
      sentAt: new Date()
    };

    setSignatureRequests(prev => [...prev, newRequest]);
    setDocuments(prev => prev.map(doc => 
      doc.id === selectedDocument.id 
        ? { ...doc, status: 'pending_signature' as const }
        : doc
    ));

    Alert.alert('Success', `Signature request sent to ${email}`);
    setShowSignatureModal(false);
    setSelectedDocument(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderDocumentCard = (document: Document) => (
    <Card key={document.id} style={styles.documentCard}>
      <Card.Content>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitle}>
              {getStatusIcon(document.status)}
              <Text style={styles.documentName}>{document.name}</Text>
            </View>
            <View style={styles.documentMeta}>
              <Chip mode="outlined" compact style={styles.typeChip}>
                {document.type.toUpperCase()}
              </Chip>
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.statusChip, { borderColor: getStatusColor(document.status) }]}
                textStyle={{ color: getStatusColor(document.status) }}
              >
                {document.status.replace('_', ' ')}
              </Chip>
            </View>
            <Text style={styles.documentDetails}>
              {formatFileSize(document.size)} • Version {document.version} • 
              {document.uploadedAt.toLocaleDateString()}
            </Text>
            <View style={styles.documentTags}>
              {document.tags.map((tag, index) => (
                <Chip key={index} mode="outlined" compact style={styles.tag}>
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.documentActions}>
          <Button 
            mode="outlined" 
            compact 
            icon={() => <Eye size={16} color="#2196F3" />}
            onPress={() => handleDocumentAction('view', document)}
          >
            View
          </Button>
          <Button 
            mode="outlined" 
            compact 
            icon={() => <Download size={16} color="#2196F3" />}
            onPress={() => handleDocumentAction('download', document)}
            style={styles.actionButton}
          >
            Download
          </Button>
          {document.status === 'draft' && (
            <Button 
              mode="outlined" 
              compact 
              icon={() => <Edit size={16} color="#FF9800" />}
              onPress={() => handleDocumentAction('signature', document)}
              style={styles.actionButton}
            >
              Sign
            </Button>
          )}
          <Button 
            mode="outlined" 
            compact 
            icon={() => <Share size={16} color="#4CAF50" />}
            onPress={() => handleDocumentAction('share', document)}
            style={styles.actionButton}
          >
            Share
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title>📄 Document Management</Title>
        <View style={styles.headerStats}>
          <Text style={styles.statText}>
            {filteredDocuments.length} documents
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search documents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'pending', 'signed', 'expired'].map((filter) => (
            <Chip
              key={filter}
              mode={selectedFilter === filter ? 'flat' : 'outlined'}
              onPress={() => setSelectedFilter(filter as any)}
              style={styles.filterChip}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Document List */}
      <ScrollView
        style={styles.documentList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(renderDocumentCard)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <FileText size={48} color="#ccc" />
              <Text style={styles.emptyText}>No documents found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Upload your first document to get started'}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Upload FAB */}
      <FAB
        style={styles.fab}
        icon={() => <Upload size={24} color="#fff" />}
        onPress={() => setShowUploadModal(true)}
        label="Upload"
      />

      {/* Upload Modal */}
      <Portal>
        <Modal visible={showUploadModal} onDismiss={() => setShowUploadModal(false)}>
          <Card style={styles.modal}>
            <Card.Content>
              <Title>Upload Document</Title>
              <View style={styles.uploadOptions}>
                <Button
                  mode="outlined"
                  icon={() => <Camera size={20} color="#2196F3" />}
                  onPress={() => {
                    Alert.alert('Camera', 'Opening camera for document scan');
                    setShowUploadModal(false);
                  }}
                  style={styles.uploadOption}
                >
                  Scan with Camera
                </Button>
                <Button
                  mode="outlined"
                  icon={() => <Upload size={20} color="#2196F3" />}
                  onPress={() => {
                    Alert.alert('File Upload', 'Opening file picker');
                    setShowUploadModal(false);
                  }}
                  style={styles.uploadOption}
                >
                  Upload from Files
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Signature Request Modal */}
      <Portal>
        <Modal visible={showSignatureModal} onDismiss={() => setShowSignatureModal(false)}>
          <Card style={styles.modal}>
            <Card.Content>
              <Title>Request e-Signature</Title>
              <Text style={styles.modalSubtitle}>
                Send signature request for: {selectedDocument?.name}
              </Text>
              <TextInput
                label="Signer Email"
                mode="outlined"
                style={styles.input}
                placeholder="customer@example.com"
              />
              <TextInput
                label="Signer Name"
                mode="outlined"
                style={styles.input}
                placeholder="John Doe"
              />
              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setShowSignatureModal(false)}>
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => sendSignatureRequest('customer@example.com', 'John Doe')}
                  style={styles.sendButton}
                >
                  Send Request
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statText: {
    color: '#666',
    fontSize: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchbar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  documentList: {
    flex: 1,
  },
  documentCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentName: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  documentMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  documentDetails: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  documentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
    height: 20,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
  emptyCard: {
    margin: 16,
    elevation: 4,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modal: {
    margin: 20,
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  uploadOptions: {
    marginTop: 16,
  },
  uploadOption: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  sendButton: {
    marginLeft: 12,
  },
});

export default DocumentManagement;
