import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ComplianceRecord, IFTARecord, SafetyEvent, HOSData, DriverQualification } from '../types';
import { useAuth } from './authContext';

interface ComplianceState {
  complianceRecords: ComplianceRecord[];
  iftaRecords: IFTARecord[];
  safetyEvents: SafetyEvent[];
  hosViolations: any[];
  expiringDocuments: ComplianceRecord[];
  loading: boolean;
  error: string | null;
}

interface ComplianceContextType extends ComplianceState {
  // Compliance Management
  addComplianceRecord: (record: Omit<ComplianceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateComplianceRecord: (id: string, updates: Partial<ComplianceRecord>) => Promise<void>;
  deleteComplianceRecord: (id: string) => Promise<void>;
  checkExpiringSoon: (days: number) => ComplianceRecord[];
  
  // IFTA Management
  createIFTARecord: (record: Omit<IFTARecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIFTARecord: (id: string, updates: Partial<IFTARecord>) => Promise<void>;
  calculateIFTATaxes: (vehicleId: string, period: string) => Promise<IFTARecord>;
  generateIFTAReport: (period: string) => Promise<any>;
  
  // Safety Management
  addSafetyEvent: (event: Omit<SafetyEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSafetyEvent: (id: string, updates: Partial<SafetyEvent>) => Promise<void>;
  assignSafetyAction: (eventId: string, action: any) => Promise<void>;
  generateSafetyReport: (period: string) => Promise<any>;
  
  // HOS Management
  validateHOSCompliance: (driverId: string) => Promise<boolean>;
  getHOSViolations: (driverId: string, period: string) => Promise<any[]>;
  updateDriverHOS: (driverId: string, hosData: Partial<HOSData>) => Promise<void>;
  
  // Document Management
  uploadComplianceDocument: (type: string, entityId: string, file: File) => Promise<string>;
  getDocumentsByEntity: (entityId: string) => ComplianceRecord[];
  
  // DOT Inspection Management
  createDOTInspection: (inspection: any) => Promise<void>;
  updateDOTInspection: (id: string, updates: any) => Promise<void>;
  
  // Drug Testing Management
  scheduleDrugTest: (driverId: string, type: string, dueDate: Date) => Promise<void>;
  recordDrugTestResult: (testId: string, result: any) => Promise<void>;
  
  // Training Management
  assignTraining: (driverId: string, trainingType: string, dueDate: Date) => Promise<void>;
  recordTrainingCompletion: (trainingId: string, completionData: any) => Promise<void>;
  
  // Permit Management
  addPermit: (permit: any) => Promise<void>;
  updatePermit: (id: string, updates: any) => Promise<void>;
  checkPermitStatus: (permitId: string) => Promise<string>;
  
  // CSA Score Management
  updateCSAScores: (companyId: string, scores: any) => Promise<void>;
  getCSAAlerts: () => any[];
  
  // Analytics
  getComplianceScore: () => number;
  getViolationTrends: (period: string) => any[];
  getSafetyMetrics: () => any;
}

type ComplianceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMPLIANCE_RECORDS'; payload: ComplianceRecord[] }
  | { type: 'SET_IFTA_RECORDS'; payload: IFTARecord[] }
  | { type: 'SET_SAFETY_EVENTS'; payload: SafetyEvent[] }
  | { type: 'SET_HOS_VIOLATIONS'; payload: any[] }
  | { type: 'ADD_COMPLIANCE_RECORD'; payload: ComplianceRecord }
  | { type: 'UPDATE_COMPLIANCE_RECORD'; payload: { id: string; updates: Partial<ComplianceRecord> } }
  | { type: 'DELETE_COMPLIANCE_RECORD'; payload: string };

const initialState: ComplianceState = {
  complianceRecords: [],
  iftaRecords: [],
  safetyEvents: [],
  hosViolations: [],
  expiringDocuments: [],
  loading: false,
  error: null,
};

function complianceReducer(state: ComplianceState, action: ComplianceAction): ComplianceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_COMPLIANCE_RECORDS':
      const records = action.payload;
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return {
        ...state,
        complianceRecords: records,
        expiringDocuments: records.filter(r => r.dueDate <= thirtyDaysFromNow && r.status !== 'compliant'),
        loading: false,
      };
    case 'SET_IFTA_RECORDS':
      return { ...state, iftaRecords: action.payload };
    case 'SET_SAFETY_EVENTS':
      return { ...state, safetyEvents: action.payload };
    case 'SET_HOS_VIOLATIONS':
      return { ...state, hosViolations: action.payload };
    case 'ADD_COMPLIANCE_RECORD':
      return { ...state, complianceRecords: [...state.complianceRecords, action.payload] };
    case 'UPDATE_COMPLIANCE_RECORD':
      return {
        ...state,
        complianceRecords: state.complianceRecords.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };
    case 'DELETE_COMPLIANCE_RECORD':
      return {
        ...state,
        complianceRecords: state.complianceRecords.filter(r => r.id !== action.payload),
      };
    default:
      return state;
  }
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  const { user } = useAuth();

  // Real-time compliance data subscriptions
  useEffect(() => {
    if (!user?.companyId) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    // Subscribe to compliance records
    const complianceQuery = query(
      collection(db, 'complianceRecords'),
      where('companyId', '==', user.companyId),
      orderBy('dueDate')
    );

    const unsubscribeCompliance = onSnapshot(complianceQuery, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ComplianceRecord[];
      dispatch({ type: 'SET_COMPLIANCE_RECORDS', payload: records });
    }, (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    });

    // Subscribe to IFTA records
    const iftaQuery = query(
      collection(db, 'iftaRecords'),
      where('companyId', '==', user.companyId),
      orderBy('period', 'desc')
    );

    const unsubscribeIFTA = onSnapshot(iftaQuery, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        filedDate: doc.data().filedDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as IFTARecord[];
      dispatch({ type: 'SET_IFTA_RECORDS', payload: records });
    });

    // Subscribe to safety events
    const safetyQuery = query(
      collection(db, 'safetyEvents'),
      where('companyId', '==', user.companyId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeSafety = onSnapshot(safetyQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as SafetyEvent[];
      dispatch({ type: 'SET_SAFETY_EVENTS', payload: events });
    });

    return () => {
      unsubscribeCompliance();
      unsubscribeIFTA();
      unsubscribeSafety();
    };
  }, [user?.companyId]);

  // Compliance Management Functions
  const addComplianceRecord = async (recordData: Omit<ComplianceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'complianceRecords'), {
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateComplianceRecord = async (id: string, updates: Partial<ComplianceRecord>) => {
    try {
      await updateDoc(doc(db, 'complianceRecords', id), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const deleteComplianceRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'complianceRecords', id));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const checkExpiringSoon = (days: number): ComplianceRecord[] => {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return state.complianceRecords.filter(record => 
      record.dueDate <= cutoffDate && record.status !== 'compliant'
    );
  };

  // IFTA Management Functions
  const createIFTARecord = async (recordData: Omit<IFTARecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'iftaRecords'), {
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateIFTARecord = async (id: string, updates: Partial<IFTARecord>) => {
    try {
      await updateDoc(doc(db, 'iftaRecords', id), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const calculateIFTATaxes = async (vehicleId: string, period: string): Promise<IFTARecord> => {
    try {
      // Query vehicle tracking data for the period
      // Calculate miles by jurisdiction
      // Apply tax rates
      // This is a complex calculation that would involve:
      // 1. Getting GPS tracking data for the vehicle
      // 2. Determining which jurisdictions were traveled
      // 3. Calculating miles in each jurisdiction
      // 4. Getting fuel purchase data
      // 5. Applying IFTA tax rates

      // Placeholder implementation
      const mockRecord: IFTARecord = {
        id: '',
        companyId: user?.companyId || '',
        vehicleId,
        period,
        jurisdictions: [
          { state: 'CA', miles: 1200, gallons: 200, taxRate: 0.47, tax: 94 },
          { state: 'OR', miles: 800, gallons: 133, taxRate: 0.36, tax: 48 },
        ],
        totalMiles: 2000,
        totalGallons: 333,
        totalTax: 142,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return mockRecord;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const generateIFTAReport = async (period: string) => {
    try {
      const records = state.iftaRecords.filter(r => r.period === period);
      
      return {
        period,
        totalVehicles: records.length,
        totalMiles: records.reduce((sum, r) => sum + r.totalMiles, 0),
        totalGallons: records.reduce((sum, r) => sum + r.totalGallons, 0),
        totalTax: records.reduce((sum, r) => sum + r.totalTax, 0),
        jurisdictions: records.flatMap(r => r.jurisdictions),
        status: records.every(r => r.status === 'filed') ? 'filed' : 'pending',
      };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Safety Management Functions
  const addSafetyEvent = async (eventData: Omit<SafetyEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'safetyEvents'), {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateSafetyEvent = async (id: string, updates: Partial<SafetyEvent>) => {
    try {
      await updateDoc(doc(db, 'safetyEvents', id), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const assignSafetyAction = async (eventId: string, action: any) => {
    try {
      const event = state.safetyEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Safety event not found');

      const updatedActions = [...(event.actions || []), action];
      await updateSafetyEvent(eventId, { actions: updatedActions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const generateSafetyReport = async (period: string) => {
    try {
      const startDate = new Date(Date.now() - (period === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000);
      const events = state.safetyEvents.filter(e => e.timestamp >= startDate);

      return {
        period,
        totalEvents: events.length,
        accidents: events.filter(e => e.type === 'accident').length,
        violations: events.filter(e => e.type === 'violation').length,
        inspections: events.filter(e => e.type === 'inspection').length,
        severityBreakdown: {
          critical: events.filter(e => e.severity === 'critical').length,
          high: events.filter(e => e.severity === 'high').length,
          medium: events.filter(e => e.severity === 'medium').length,
          low: events.filter(e => e.severity === 'low').length,
        },
        totalCost: events.reduce((sum, e) => sum + (e.cost || 0), 0),
      };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // HOS Management Functions
  const validateHOSCompliance = async (driverId: string): Promise<boolean> => {
    try {
      // Check current HOS status against regulations
      // This would involve complex logic to validate:
      // 1. Daily driving limits
      // 2. Weekly limits
      // 3. Rest requirements
      // 4. Break requirements

      return true; // Placeholder
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const getHOSViolations = async (driverId: string, period: string): Promise<any[]> => {
    try {
      // Query HOS violations for driver in period
      const violationsQuery = query(
        collection(db, 'hosViolations'),
        where('driverId', '==', driverId),
        where('companyId', '==', user?.companyId)
      );

      const snapshot = await getDocs(violationsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateDriverHOS = async (driverId: string, hosData: Partial<HOSData>) => {
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        hosData: {
          ...hosData,
          lastUpdate: new Date(),
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Document Management Functions
  const uploadComplianceDocument = async (type: string, entityId: string, file: File): Promise<string> => {
    try {
      // Upload file to Firebase Storage
      // For now, return a placeholder URL
      const documentUrl = `https://storage.googleapis.com/waygo-freight/${type}/${entityId}/${file.name}`;
      
      // Create compliance record
      await addComplianceRecord({
        companyId: user?.companyId || '',
        type,
        status: 'compliant',
        entityId,
        entityType: 'driver', // or 'vehicle' or 'company'
        description: `${type} document uploaded`,
        dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        documentUrl,
        notes: `Uploaded ${file.name}`,
      });

      return documentUrl;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const getDocumentsByEntity = (entityId: string): ComplianceRecord[] => {
    return state.complianceRecords.filter(record => record.entityId === entityId);
  };

  // Additional placeholder functions for comprehensive compliance management
  const createDOTInspection = async (inspection: any) => {
    try {
      await addDoc(collection(db, 'dotInspections'), {
        ...inspection,
        companyId: user?.companyId,
        createdAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateDOTInspection = async (id: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'dotInspections', id), updates);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const scheduleDrugTest = async (driverId: string, type: string, dueDate: Date) => {
    try {
      await addComplianceRecord({
        companyId: user?.companyId || '',
        type: 'drug_test',
        status: 'pending',
        entityId: driverId,
        entityType: 'driver',
        description: `${type} drug test scheduled`,
        dueDate,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const recordDrugTestResult = async (testId: string, result: any) => {
    try {
      await updateComplianceRecord(testId, {
        status: result.passed ? 'compliant' : 'non_compliant',
        completedDate: new Date(),
        notes: `Test result: ${result.result}`,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const assignTraining = async (driverId: string, trainingType: string, dueDate: Date) => {
    try {
      await addComplianceRecord({
        companyId: user?.companyId || '',
        type: 'training',
        status: 'pending',
        entityId: driverId,
        entityType: 'driver',
        description: `${trainingType} training assigned`,
        dueDate,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const recordTrainingCompletion = async (trainingId: string, completionData: any) => {
    try {
      await updateComplianceRecord(trainingId, {
        status: 'compliant',
        completedDate: new Date(),
        notes: `Training completed - Score: ${completionData.score}`,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const addPermit = async (permit: any) => {
    try {
      await addDoc(collection(db, 'permits'), {
        ...permit,
        companyId: user?.companyId,
        createdAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updatePermit = async (id: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'permits', id), updates);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const checkPermitStatus = async (permitId: string): Promise<string> => {
    try {
      // Check permit status with external API
      return 'active'; // Placeholder
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateCSAScores = async (companyId: string, scores: any) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        csaScores: scores,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const getCSAAlerts = (): any[] => {
    // Return CSA alerts based on current scores
    return []; // Placeholder
  };

  // Analytics Functions
  const getComplianceScore = (): number => {
    const total = state.complianceRecords.length;
    if (total === 0) return 100;
    
    const compliant = state.complianceRecords.filter(r => r.status === 'compliant').length;
    return (compliant / total) * 100;
  };

  const getViolationTrends = (period: string): any[] => {
    // Calculate violation trends over time
    return []; // Placeholder
  };

  const getSafetyMetrics = (): any => {
    const events = state.safetyEvents;
    return {
      totalEvents: events.length,
      accidentRate: events.filter(e => e.type === 'accident').length,
      violationRate: events.filter(e => e.type === 'violation').length,
      averageSeverity: events.reduce((sum, e) => {
        const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };
        return sum + (severityValues[e.severity] || 0);
      }, 0) / events.length || 0,
    };
  };

  const value: ComplianceContextType = {
    ...state,
    addComplianceRecord,
    updateComplianceRecord,
    deleteComplianceRecord,
    checkExpiringSoon,
    createIFTARecord,
    updateIFTARecord,
    calculateIFTATaxes,
    generateIFTAReport,
    addSafetyEvent,
    updateSafetyEvent,
    assignSafetyAction,
    generateSafetyReport,
    validateHOSCompliance,
    getHOSViolations,
    updateDriverHOS,
    uploadComplianceDocument,
    getDocumentsByEntity,
    createDOTInspection,
    updateDOTInspection,
    scheduleDrugTest,
    recordDrugTestResult,
    assignTraining,
    recordTrainingCompletion,
    addPermit,
    updatePermit,
    checkPermitStatus,
    updateCSAScores,
    getCSAAlerts,
    getComplianceScore,
    getViolationTrends,
    getSafetyMetrics,
  };

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
}

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
}
