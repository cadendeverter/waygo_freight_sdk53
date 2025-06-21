import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { getDb, isFirebaseInitialized } from '../firebase/config';
import { Load, LoadStop, TrackingEvent, ProofOfDelivery, Location, Customer } from '../types';
import { useAuth } from './authContext';

interface LoadState {
  loads: Load[];
  customers: Customer[];
  activeLoads: Load[];
  pendingLoads: Load[];
  completedLoads: Load[];
  loading: boolean;
  error: string | null;
}

interface LoadContextType extends LoadState {
  // Load Management
  createLoad: (load: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLoad: (id: string, updates: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
  assignDriver: (loadId: string, driverId: string, vehicleId: string) => Promise<void>;
  unassignDriver: (loadId: string) => Promise<void>;
  
  // Load Status Updates
  updateLoadStatus: (loadId: string, status: Load['status']) => Promise<void>;
  addTrackingEvent: (loadId: string, event: Omit<TrackingEvent, 'id'>) => Promise<void>;
  updateStopStatus: (loadId: string, stopIndex: number, status: LoadStop['status']) => Promise<void>;
  recordArrival: (loadId: string, stopIndex: number, location: Location) => Promise<void>;
  recordDeparture: (loadId: string, stopIndex: number) => Promise<void>;
  
  // Proof of Delivery
  submitProofOfDelivery: (loadId: string, pod: ProofOfDelivery) => Promise<void>;
  
  // Route Optimization
  optimizeRoute: (loadId: string) => Promise<LoadStop[]>;
  calculateETA: (loadId: string, currentLocation: Location) => Promise<Date>;
  suggestAlternateRoute: (loadId: string, reason: string) => Promise<LoadStop[]>;
  
  // Load Matching and Assignment
  findAvailableDrivers: (load: Load) => Promise<string[]>;
  autoAssignLoad: (loadId: string) => Promise<void>;
  suggestBackhaul: (driverId: string, currentLocation: Location) => Promise<Load[]>;
  
  // Customer Management
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  
  // Analytics
  getLoadsByStatus: () => Record<string, number>;
  getRevenue: (period: string) => number;
  getOnTimePercentage: (period: string) => number;
  getAverageTransitTime: (period: string) => number;
}

type LoadAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADS'; payload: Load[] }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_LOAD'; payload: Load }
  | { type: 'UPDATE_LOAD'; payload: { id: string; updates: Partial<Load> } }
  | { type: 'DELETE_LOAD'; payload: string }
  | { type: 'ADD_TRACKING_EVENT'; payload: { loadId: string; event: TrackingEvent } };

const initialState: LoadState = {
  loads: [],
  customers: [],
  activeLoads: [],
  pendingLoads: [],
  completedLoads: [],
  loading: false,
  error: null,
};

function loadReducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LOADS':
      const loads = action.payload;
      return {
        ...state,
        loads,
        activeLoads: loads.filter(l => ['assigned', 'en_route_pickup', 'at_pickup', 'loaded', 'en_route_delivery', 'at_delivery'].includes(l.status)),
        pendingLoads: loads.filter(l => l.status === 'pending'),
        completedLoads: loads.filter(l => ['delivered', 'completed'].includes(l.status)),
        loading: false,
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_LOAD':
      const newLoad = action.payload;
      const updatedLoads = [...state.loads, newLoad];
      return {
        ...state,
        loads: updatedLoads,
        pendingLoads: newLoad.status === 'pending' ? [...state.pendingLoads, newLoad] : state.pendingLoads,
      };
    case 'UPDATE_LOAD':
      const { id, updates } = action.payload;
      const loadsAfterUpdate = state.loads.map(l => l.id === id ? { ...l, ...updates } : l);
      return {
        ...state,
        loads: loadsAfterUpdate,
        activeLoads: loadsAfterUpdate.filter(l => ['assigned', 'en_route_pickup', 'at_pickup', 'loaded', 'en_route_delivery', 'at_delivery'].includes(l.status)),
        pendingLoads: loadsAfterUpdate.filter(l => l.status === 'pending'),
        completedLoads: loadsAfterUpdate.filter(l => ['delivered', 'completed'].includes(l.status)),
      };
    case 'DELETE_LOAD':
      return {
        ...state,
        loads: state.loads.filter(l => l.id !== action.payload),
        activeLoads: state.activeLoads.filter(l => l.id !== action.payload),
        pendingLoads: state.pendingLoads.filter(l => l.id !== action.payload),
        completedLoads: state.completedLoads.filter(l => l.id !== action.payload),
      };
    case 'ADD_TRACKING_EVENT':
      return {
        ...state,
        loads: state.loads.map(l => 
          l.id === action.payload.loadId 
            ? { ...l, tracking: [...(l.tracking || []), action.payload.event] }
            : l
        ),
      };
    default:
      return state;
  }
}

const LoadContext = createContext<LoadContextType | undefined>(undefined);

export function LoadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loadReducer, initialState);
  const { user } = useAuth();

  // Real-time load data subscriptions
  useEffect(() => {
    if (!user?.companyId || !isFirebaseInitialized()) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    // Subscribe to loads
    const loadsQuery = query(
      collection(getDb(), 'loads'),
      where('companyId', '==', user.companyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeLoads = onSnapshot(loadsQuery, (snapshot) => {
      const loads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        pickupDate: doc.data().pickupDate?.toDate(),
        deliveryDate: doc.data().deliveryDate?.toDate(),
        actualPickupTime: doc.data().actualPickupTime?.toDate(),
        actualDeliveryTime: doc.data().actualDeliveryTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Load[];
      dispatch({ type: 'SET_LOADS', payload: loads });
    }, (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    });

    // Subscribe to customers
    const customersQuery = query(
      collection(getDb(), 'customers'),
      where('companyId', '==', user.companyId),
      orderBy('name')
    );

    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Customer[];
      dispatch({ type: 'SET_CUSTOMERS', payload: customers });
    });

    return () => {
      unsubscribeLoads();
      unsubscribeCustomers();
    };
  }, [user?.companyId]);

  // Load Management Functions
  const createLoad = async (loadData: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const loadNumber = `L${Date.now()}`;
      const docRef = await addDoc(collection(getDb(), 'loads'), {
        ...loadData,
        loadNumber,
        status: 'pending',
        tracking: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Add initial tracking event
      await addTrackingEvent(docRef.id, {
        type: 'dispatched',
        description: 'Load created and ready for assignment',
        timestamp: new Date(),
        createdBy: user?.id || '',
        automatic: true,
      });
      
      return docRef.id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateLoad = async (id: string, updates: Partial<Load>) => {
    try {
      await updateDoc(doc(getDb(), 'loads', id), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const deleteLoad = async (id: string) => {
    try {
      await deleteDoc(doc(getDb(), 'loads', id));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const assignDriver = async (loadId: string, driverId: string, vehicleId: string) => {
    try {
      await updateDoc(doc(getDb(), 'loads', loadId), {
        driverId,
        vehicleId,
        status: 'assigned',
        updatedAt: new Date(),
      });

      await addTrackingEvent(loadId, {
        type: 'dispatched',
        description: `Load assigned to driver ${driverId}`,
        timestamp: new Date(),
        createdBy: user?.id || '',
        automatic: true,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const unassignDriver = async (loadId: string) => {
    try {
      await updateDoc(doc(getDb(), 'loads', loadId), {
        driverId: null,
        vehicleId: null,
        status: 'pending',
        updatedAt: new Date(),
      });

      await addTrackingEvent(loadId, {
        type: 'exception',
        description: 'Driver unassigned from load',
        timestamp: new Date(),
        createdBy: user?.id || '',
        automatic: true,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Load Status Updates
  const updateLoadStatus = async (loadId: string, status: Load['status']) => {
    try {
      await updateDoc(doc(getDb(), 'loads', loadId), {
        status,
        updatedAt: new Date(),
      });

      const statusDescriptions: Record<Load['status'], string> = {
        pending: 'Load created and pending assignment',
        assigned: 'Load assigned to driver',
        en_route_pickup: 'Driver en route to pickup',
        at_pickup: 'Driver arrived at pickup location',
        loaded: 'Freight loaded and departed pickup',
        en_route_delivery: 'Driver en route to delivery',
        at_delivery: 'Driver arrived at delivery location',
        delivered: 'Freight delivered',
        completed: 'Load completed and invoiced',
        cancelled: 'Load cancelled',
      };

      await addTrackingEvent(loadId, {
        type: status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'exception' : 'en_route',
        description: statusDescriptions[status],
        timestamp: new Date(),
        createdBy: user?.id || '',
        automatic: true,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const addTrackingEvent = async (loadId: string, event: Omit<TrackingEvent, 'id'>) => {
    try {
      const eventWithId = {
        ...event,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      await updateDoc(doc(getDb(), 'loads', loadId), {
        tracking: [...(state.loads.find(l => l.id === loadId)?.tracking || []), eventWithId],
        updatedAt: new Date(),
      });

      dispatch({
        type: 'ADD_TRACKING_EVENT',
        payload: { loadId, event: eventWithId },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateStopStatus = async (loadId: string, stopIndex: number, status: LoadStop['status']) => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      const updatedStops = [...load.stops];
      updatedStops[stopIndex] = { ...updatedStops[stopIndex], status };

      await updateDoc(doc(getDb(), 'loads', loadId), {
        stops: updatedStops,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const recordArrival = async (loadId: string, stopIndex: number, location: Location) => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      const updatedStops = [...load.stops];
      updatedStops[stopIndex] = {
        ...updatedStops[stopIndex],
        arrivalTime: new Date(),
        status: 'arrived',
      };

      await updateDoc(doc(getDb(), 'loads', loadId), {
        stops: updatedStops,
        updatedAt: new Date(),
      });

      await addTrackingEvent(loadId, {
        type: 'arrived_pickup',
        description: `Arrived at ${updatedStops[stopIndex].facility.name}`,
        location,
        timestamp: new Date(),
        createdBy: user?.id || '',
        automatic: true,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const recordDeparture = async (loadId: string, stopIndex: number) => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      const updatedStops = [...load.stops];
      updatedStops[stopIndex] = {
        ...updatedStops[stopIndex],
        departureTime: new Date(),
        status: 'completed',
      };

      await updateDoc(doc(getDb(), 'loads', loadId), {
        stops: updatedStops,
        updatedAt: new Date(),
      });

      await addTrackingEvent(loadId, {
        type: 'departed_pickup',
        description: `Departed ${updatedStops[stopIndex].facility.name}`,
        timestamp: new Date(),
        createdBy: user?.id || '',
        automatic: true,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Proof of Delivery
  const submitProofOfDelivery = async (loadId: string, pod: ProofOfDelivery) => {
    try {
      await updateDoc(doc(getDb(), 'loads', loadId), {
        proofOfDelivery: pod,
        status: 'delivered',
        actualDeliveryTime: pod.deliveredAt,
        updatedAt: new Date(),
      });

      await addTrackingEvent(loadId, {
        type: 'delivered',
        description: `Delivered to ${pod.signedBy}`,
        timestamp: pod.deliveredAt,
        createdBy: user?.id || '',
        automatic: false,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Route Optimization
  const optimizeRoute = async (loadId: string): Promise<LoadStop[]> => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      // Implement route optimization algorithm
      // For now, return stops in current order
      return load.stops;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const calculateETA = async (loadId: string, currentLocation: Location): Promise<Date> => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      // Calculate ETA based on distance and traffic
      // For now, return delivery date
      return load.deliveryDate;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const suggestAlternateRoute = async (loadId: string, reason: string): Promise<LoadStop[]> => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      // Suggest alternate route based on reason (traffic, weather, etc.)
      return load.stops;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Load Matching and Assignment
  const findAvailableDrivers = async (load: Load): Promise<string[]> => {
    try {
      // Query available drivers based on location, HOS, and qualifications
      const driversQuery = query(
        collection(getDb(), 'drivers'),
        where('companyId', '==', user?.companyId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(driversQuery);
      const availableDrivers = snapshot.docs
        .map(doc => doc.id)
        .filter(driverId => {
          // Check driver availability logic here
          return true; // Placeholder
        });

      return availableDrivers;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const autoAssignLoad = async (loadId: string) => {
    try {
      const load = state.loads.find(l => l.id === loadId);
      if (!load) throw new Error('Load not found');

      const availableDrivers = await findAvailableDrivers(load);
      if (availableDrivers.length === 0) {
        throw new Error('No available drivers found');
      }

      // Assign to best driver (first available for now)
      await assignDriver(loadId, availableDrivers[0], 'vehicle-id-placeholder');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const suggestBackhaul = async (driverId: string, currentLocation: Location): Promise<Load[]> => {
    try {
      // Find loads near driver's current location for backhaul
      const backhaulQuery = query(
        collection(getDb(), 'loads'),
        where('companyId', '==', user?.companyId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(backhaulQuery);
      const backhaulLoads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Load[];

      // Filter by proximity to current location
      return backhaulLoads.slice(0, 5); // Return top 5 for now
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Customer Management
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(getDb(), 'customers'), {
        ...customerData,
        companyId: user?.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      await updateDoc(doc(getDb(), 'customers', id), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Analytics Functions
  const getLoadsByStatus = (): Record<string, number> => {
    const statusCounts: Record<string, number> = {};
    state.loads.forEach(load => {
      statusCounts[load.status] = (statusCounts[load.status] || 0) + 1;
    });
    return statusCounts;
  };

  const getRevenue = (period: string): number => {
    const now = new Date();
    const startDate = new Date(now.getTime() - (period === 'month' ? 30 : 7) * 24 * 60 * 60 * 1000);
    
    return state.loads
      .filter(load => load.createdAt >= startDate && ['delivered', 'completed'].includes(load.status))
      .reduce((total, load) => total + load.totalCharges, 0);
  };

  const getOnTimePercentage = (period: string): number => {
    const now = new Date();
    const startDate = new Date(now.getTime() - (period === 'month' ? 30 : 7) * 24 * 60 * 60 * 1000);
    
    const deliveredLoads = state.loads.filter(load => 
      load.actualDeliveryTime && 
      load.actualDeliveryTime >= startDate &&
      ['delivered', 'completed'].includes(load.status)
    );

    if (deliveredLoads.length === 0) return 0;

    const onTimeLoads = deliveredLoads.filter(load => 
      load.actualDeliveryTime! <= load.deliveryDate
    );

    return (onTimeLoads.length / deliveredLoads.length) * 100;
  };

  const getAverageTransitTime = (period: string): number => {
    const now = new Date();
    const startDate = new Date(now.getTime() - (period === 'month' ? 30 : 7) * 24 * 60 * 60 * 1000);
    
    const completedLoads = state.loads.filter(load => 
      load.actualPickupTime && 
      load.actualDeliveryTime &&
      load.actualDeliveryTime >= startDate
    );

    if (completedLoads.length === 0) return 0;

    const totalTransitTime = completedLoads.reduce((total, load) => {
      const transitTime = load.actualDeliveryTime!.getTime() - load.actualPickupTime!.getTime();
      return total + (transitTime / (1000 * 60 * 60)); // Convert to hours
    }, 0);

    return totalTransitTime / completedLoads.length;
  };

  const value: LoadContextType = {
    ...state,
    createLoad,
    updateLoad,
    deleteLoad,
    assignDriver,
    unassignDriver,
    updateLoadStatus,
    addTrackingEvent,
    updateStopStatus,
    recordArrival,
    recordDeparture,
    submitProofOfDelivery,
    optimizeRoute,
    calculateETA,
    suggestAlternateRoute,
    findAvailableDrivers,
    autoAssignLoad,
    suggestBackhaul,
    addCustomer,
    updateCustomer,
    getLoadsByStatus,
    getRevenue,
    getOnTimePercentage,
    getAverageTransitTime,
  };

  return <LoadContext.Provider value={value}>{children}</LoadContext.Provider>;
}

export function useLoad() {
  const context = useContext(LoadContext);
  if (context === undefined) {
    throw new Error('useLoad must be used within a LoadProvider');
  }
  return context;
}
