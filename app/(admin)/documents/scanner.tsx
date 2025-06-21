// waygo-freight/app/(admin)/documents/scanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, Dimensions, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  IconButton,
  Surface,
  Dialog,
  Portal,
  TextInput,
  Menu,
  List,
  ActivityIndicator,
  ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';

import { 
  Camera as CameraIcon,
  FileText,
  Image as ImageIcon,
  Download,
  Upload,
  Share,
  Check,
  X,
  RotateCw,
  Crop,
  Contrast,
  Brightness6,
  Eye,
  Trash,
  Folder,
  Tag,
  Search,
  Filter,
  ScanLine,
  Zap,
  Settings,
  iconSource
} from '../../../utils/icons';

interface ScannedDocument {
  id: string;
  filename: string;
  documentType: 'BOL' | 'POD' | 'INVOICE' | 'RECEIPT' | 'INSURANCE' | 'PERMIT' | 'OTHER';
  uri: string;
  thumbnailUri?: string;
  size: number;
  scannedAt: Date;
  uploadedAt?: Date;
  ocrText?: string;
  confidence?: number;
  tags: string[];
  loadId?: string;
  driverId?: string;
  metadata: DocumentMetadata;
  status: 'SCANNED' | 'PROCESSING' | 'PROCESSED' | 'UPLOADED' | 'FAILED';
}

interface DocumentMetadata {
  pages: number;
  resolution: string;
  colorMode: 'COLOR' | 'GRAYSCALE' | 'BLACK_WHITE';
  fileFormat: 'PDF' | 'JPEG' | 'PNG';
  compression: number;
  orientation: number;
}

interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  regions: OCRRegion[];
}

interface OCRWord {
  text: string;
  confidence: number;
  boundingBox: number[];
}

interface OCRRegion {
  text: string;
  boundingBox: number[];
  lines: OCRLine[];
}

interface OCRLine {
  text: string;
  boundingBox: number[];
  words: OCRWord[];
}

const DocumentScanner: React.FC = () => {
  const theme = useTheme();
  const cameraRef = useRef<Camera>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ScannedDocument | null>(null);
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [scanMode, setScanMode] = useState<'SINGLE' | 'MULTI' | 'AUTO'>('SINGLE');
  const [documentType, setDocumentType] = useState<ScannedDocument['documentType']>('OTHER');
  const [processing, setProcessing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  // Scanner settings
  const [autoCapture, setAutoCapture] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [resolution, setResolution] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [colorMode, setColorMode] = useState<'COLOR' | 'GRAYSCALE' | 'BLACK_WHITE'>('COLOR');
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [compressionLevel, setCompressionLevel] = useState(80);

  const documentTypes = [
    { value: 'BOL', label: 'Bill of Lading', icon: FileText },
    { value: 'POD', label: 'Proof of Delivery', icon: Check },
    { value: 'INVOICE', label: 'Invoice', icon: FileText },
    { value: 'RECEIPT', label: 'Receipt', icon: FileText },
    { value: 'INSURANCE', label: 'Insurance', icon: FileText },
    { value: 'PERMIT', label: 'Permit', icon: FileText },
    { value: 'OTHER', label: 'Other', icon: FileText }
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureDocument = async () => {
    if (!cameraRef.current || !cameraReady) return;

    setIsScanning(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: resolution === 'HIGH' ? 1.0 : resolution === 'MEDIUM' ? 0.7 : 0.5,
        base64: false,
        skipProcessing: false
      });

      const newDocument: ScannedDocument = {
        id: `doc_${Date.now()}`,
        filename: `document_${Date.now()}.jpg`,
        documentType,
        uri: photo.uri,
        size: photo.width * photo.height * 3, // Approximate size
        scannedAt: new Date(),
        tags: [],
        metadata: {
          pages: 1,
          resolution: `${photo.width}x${photo.height}`,
          colorMode,
          fileFormat: 'JPEG',
          compression: compressionLevel,
          orientation: 0
        },
        status: 'SCANNED'
      };

      setCurrentDocument(newDocument);
      setShowPreview(true);
      
      if (ocrEnabled) {
        processOCR(newDocument);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to capture document');
      console.error('Camera error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const processOCR = async (document: ScannedDocument) => {
    setProcessing(true);
    
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOCRResult: OCRResult = {
        text: `Document Type: ${document.documentType}\nDate: ${new Date().toLocaleDateString()}\nAmount: $1,234.56\nReference: REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        confidence: 0.92,
        words: [],
        regions: []
      };

      setCurrentDocument(prev => prev ? {
        ...prev,
        ocrText: mockOCRResult.text,
        confidence: mockOCRResult.confidence,
        status: 'PROCESSED'
      } : null);

    } catch (error) {
      console.error('OCR error:', error);
      setCurrentDocument(prev => prev ? {
        ...prev,
        status: 'FAILED'
      } : null);
    } finally {
      setProcessing(false);
    }
  };

  const saveDocument = () => {
    if (!currentDocument) return;

    const savedDoc = {
      ...currentDocument,
      status: 'UPLOADED' as const,
      uploadedAt: new Date()
    };

    setDocuments(prev => [savedDoc, ...prev]);
    setCurrentDocument(null);
    setShowPreview(false);
    
    Alert.alert('Success', 'Document saved successfully');
  };

  const retakePhoto = () => {
    setCurrentDocument(null);
    setShowPreview(false);
  };

  const getStatusColor = (status: ScannedDocument['status']) => {
    switch (status) {
      case 'UPLOADED': return '#4caf50';
      case 'PROCESSED': return '#2196f3';
      case 'PROCESSING': return '#ff9800';
      case 'FAILED': return '#f44336';
      default: return theme.colors.onSurface;
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Requesting camera permissions...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <CameraIcon size={64} color={theme.colors.outline} />
        <Text variant="headlineSmall" style={{ marginTop: 16, textAlign: 'center' }}>
          Camera Access Required
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
          Please enable camera permissions to scan documents
        </Text>
        <Button 
          mode="contained" 
          onPress={() => Camera.requestCameraPermissionsAsync()}
          style={{ marginTop: 24 }}
        >
          Grant Permission
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!showPreview ? (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <Surface style={{ padding: 16, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                  Document Scanner
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                  Scan and process documents with OCR
                </Text>
              </View>
              <IconButton 
                icon={iconSource(Settings)} 
                onPress={() => setSettingsVisible(true)}
              />
            </View>

            {/* Document Type Selector */}
            <View style={{ marginTop: 16 }}>
              <Menu
                visible={typeMenuVisible}
                onDismiss={() => setTypeMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setTypeMenuVisible(true)}
                    icon={iconSource(documentTypes.find(t => t.value === documentType)?.icon)}
                  >
                    {documentTypes.find(t => t.value === documentType)?.label}
                  </Button>
                }
              >
                {documentTypes.map((type) => (
                  <Menu.Item
                    key={type.value}
                    onPress={() => {
                      setDocumentType(type.value as ScannedDocument['documentType']);
                      setTypeMenuVisible(false);
                    }}
                    title={type.label}
                    leadingIcon={iconSource(type.icon)}
                  />
                ))}
              </Menu>
            </View>
          </Surface>

          {/* Camera View */}
          <View style={{ flex: 1, position: 'relative' }}>
            <Camera
              ref={cameraRef}
              style={{ flex: 1 }}
              type={CameraType.back}
              flashMode={Camera.Constants.FlashMode[flashMode]}
              onCameraReady={() => setCameraReady(true)}
            />
            
            {/* Camera Overlay */}
            <View style={StyleSheet.absoluteFillObject}>
              {/* Scan Frame */}
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <View style={{
                  width: Dimensions.get('window').width * 0.8,
                  height: Dimensions.get('window').height * 0.6,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  borderRadius: 12,
                  backgroundColor: 'transparent'
                }}>
                  {/* Corner markers */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>

              {/* Instructions */}
              <View style={{
                position: 'absolute',
                top: 100,
                left: 0,
                right: 0,
                alignItems: 'center'
              }}>
                <Card style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <Card.Content style={{ padding: 12 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>
                      Position document within the frame
                    </Text>
                  </Card.Content>
                </Card>
              </View>

              {/* Controls */}
              <View style={{
                position: 'absolute',
                bottom: 60,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center'
              }}>
                <IconButton
                  icon={iconSource(flashMode === 'off' ? 'flash-off' : 'flash')}
                  iconColor="white"
                  size={32}
                  onPress={() => {
                    setFlashMode(prev => 
                      prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'
                    );
                  }}
                />
                
                <Button
                  mode="contained"
                  onPress={captureDocument}
                  disabled={!cameraReady || isScanning}
                  loading={isScanning}
                  icon={iconSource(CameraIcon)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: 50,
                    paddingHorizontal: 24
                  }}
                >
                  {isScanning ? 'Scanning...' : 'Capture'}
                </Button>

                <IconButton
                  icon={iconSource(Folder)}
                  iconColor="white"
                  size={32}
                  onPress={() => {/* Show documents list */}}
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Document Preview
        <View style={{ flex: 1 }}>
          <Surface style={{ padding: 16, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                Document Preview
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <IconButton icon={iconSource(X)} onPress={retakePhoto} />
                <IconButton icon={iconSource(Check)} onPress={saveDocument} />
              </View>
            </View>
          </Surface>

          <View style={{ flex: 1, padding: 16 }}>
            {currentDocument && (
              <Card style={{ flex: 1 }}>
                <Card.Cover 
                  source={{ uri: currentDocument.uri }} 
                  style={{ flex: 1, margin: 16, borderRadius: 8 }}
                />
                
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      {documentTypes.find(t => t.value === currentDocument.documentType)?.label}
                    </Text>
                    <Chip 
                      icon={() => <View style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: getStatusColor(currentDocument.status) 
                      }} />}
                    >
                      {currentDocument.status}
                    </Chip>
                  </View>

                  {processing && (
                    <View style={{ marginBottom: 16 }}>
                      <Text variant="bodySmall" style={{ marginBottom: 8 }}>
                        Processing document with OCR...
                      </Text>
                      <ProgressBar indeterminate />
                    </View>
                  )}

                  {currentDocument.ocrText && (
                    <View>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        Extracted Text ({Math.round((currentDocument.confidence || 0) * 100)}% confidence)
                      </Text>
                      <Card style={{ backgroundColor: theme.colors.surfaceVariant }}>
                        <Card.Content>
                          <Text variant="bodySmall" style={{ fontFamily: 'monospace' }}>
                            {currentDocument.ocrText}
                          </Text>
                        </Card.Content>
                      </Card>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
                    <Button mode="outlined" onPress={retakePhoto} icon={iconSource(X)}>
                      Retake
                    </Button>
                    <Button mode="contained" onPress={saveDocument} icon={iconSource(Check)}>
                      Save Document
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        </View>
      )}

      {/* Settings Dialog */}
      <Portal>
        <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
          <Dialog.Title>Scanner Settings</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Resolution"
              description={resolution}
              right={() => (
                <Menu
                  anchor={<Button mode="outlined">{resolution}</Button>}
                  visible={false}
                >
                  <Menu.Item title="LOW" onPress={() => setResolution('LOW')} />
                  <Menu.Item title="MEDIUM" onPress={() => setResolution('MEDIUM')} />
                  <Menu.Item title="HIGH" onPress={() => setResolution('HIGH')} />
                </Menu>
              )}
            />
            
            <List.Item
              title="OCR Processing"
              description="Extract text from documents"
              right={() => (
                <Button 
                  mode={ocrEnabled ? 'contained' : 'outlined'}
                  onPress={() => setOcrEnabled(!ocrEnabled)}
                >
                  {ocrEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              )}
            />

            <List.Item
              title="Compression Level"
              description={`${compressionLevel}%`}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default DocumentScanner;
