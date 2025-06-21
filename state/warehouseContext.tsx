import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { InventoryItem, Shipment, Warehouse, LoadingAssignment, CrossDockOperation } from '../types';
import { useAuth } from './authContext';

interface WarehouseState {
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  shipments: Shipment[];
  loadingAssignments: LoadingAssignment[];
  crossDockOperations: CrossDockOperation[];
  loading: boolean;
  error: string | null;
}

interface WarehouseContextType extends WarehouseState {
  // Warehouse Management
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => Promise<void>;
  
  // Inventory Management
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  scanBarcode: (barcode: string, warehouseId: string) => Promise<InventoryItem | null>;
  adjustInventory: (itemId: string, quantity: number, reason: string) => Promise<void>;
  transferInventory: (itemId: string, fromWarehouse: string, toWarehouse: string, quantity: number) => Promise<void>;
  
  // Shipment Management
  createShipment: (shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateShipmentStatus: (id: string, status: Shipment['status']) => Promise<void>;
  assignToLoad: (shipmentId: string, loadId: string) => Promise<void>;
  
  // Loading Operations
  createLoadingAssignment: (assignment: Omit<LoadingAssignment, 'id' | 'createdAt'>) => Promise<void>;
  updateLoadingStatus: (id: string, status: LoadingAssignment['status']) => Promise<void>;
  
  // Cross-Docking
  createCrossDockOperation: (operation: Omit<CrossDockOperation, 'id' | 'createdAt'>) => Promise<void>;
  updateCrossDockStatus: (id: string, status: CrossDockOperation['status']) => Promise<void>;
  
  // Analytics
  getInventoryValue: (warehouseId?: string) => number;
  getUtilizationRate: (warehouseId: string) => number;
  getTurnoverRate: (itemId: string) => number;
}

type WarehouseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WAREHOUSES'; payload: Warehouse[] }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_SHIPMENTS'; payload: Shipment[] }
  | { type: 'SET_LOADING_ASSIGNMENTS'; payload: LoadingAssignment[] }
  | { type: 'SET_CROSSDOCK_OPERATIONS'; payload: CrossDockOperation[] };

const initialState: WarehouseState = {
  warehouses: [],
  inventory: [],
  shipments: [],
  loadingAssignments: [],
  crossDockOperations: [],
  loading: false,
  error: null,
};

function warehouseReducer(state: WarehouseState, action: WarehouseAction): WarehouseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_WAREHOUSES':
      return { ...state, warehouses: action.payload, loading: false };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_SHIPMENTS':
      return { ...state, shipments: action.payload };
    case 'SET_LOADING_ASSIGNMENTS':
      return { ...state, loadingAssignments: action.payload };
    case 'SET_CROSSDOCK_OPERATIONS':
      return { ...state, crossDockOperations: action.payload };
    default:
      return state;
  }
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(warehouseReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.companyId) return;

    const collections = [
      { name: 'warehouses', action: 'SET_WAREHOUSES' as const },
      { name: 'inventoryItems', action: 'SET_INVENTORY' as const },
      { name: 'shipments', action: 'SET_SHIPMENTS' as const },
      { name: 'loadingAssignments', action: 'SET_LOADING_ASSIGNMENTS' as const },
      { name: 'crossDockOperations', action: 'SET_CROSSDOCK_OPERATIONS' as const }
    ];

    const unsubscribes = collections.map(({ name, action }) => {
      const q = query(collection(db, name), where('companyId', '==', user.companyId));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch({ type: action, payload: data as any });
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user?.companyId]);

  const addWarehouse = async (warehouseData: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'warehouses'), {
        ...warehouseData,
        companyId: user?.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
    try {
      await updateDoc(doc(db, 'warehouses', id), { ...updates, updatedAt: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'inventory'), {
        ...itemData,
        companyId: user?.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateDoc(doc(db, 'inventory', id), { ...updates, updatedAt: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const scanBarcode = async (barcode: string, warehouseId: string): Promise<InventoryItem | null> => {
    try {
      const item = state.inventory.find(i => i.barcode === barcode && i.warehouseId === warehouseId);
      return item || null;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return null;
    }
  };

  const adjustInventory = async (itemId: string, quantity: number, reason: string) => {
    try {
      const item = state.inventory.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      await updateInventoryItem(itemId, {
        quantity: item.quantity + quantity,
        lastAdjustment: { quantity, reason, date: new Date(), userId: user?.uid || '' }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const transferInventory = async (itemId: string, fromWarehouse: string, toWarehouse: string, quantity: number) => {
    try {
      const item = state.inventory.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      // Reduce quantity in source warehouse
      await updateInventoryItem(itemId, { quantity: item.quantity - quantity });

      // Create or update item in destination warehouse
      const destItem = state.inventory.find(i => 
        i.sku === item.sku && i.warehouseId === toWarehouse
      );

      if (destItem) {
        await updateInventoryItem(destItem.id, { quantity: destItem.quantity + quantity });
      } else {
        await addInventoryItem({
          ...item,
          warehouseId: toWarehouse,
          quantity,
          location: {
            warehouseId: toWarehouse,
            zone: '',
            aisle: '',
            bay: '',
            level: '',
            position: ''
          }, // Reset location for new warehouse
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const createShipment = async (shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'shipments'), {
        ...shipmentData,
        companyId: user?.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateShipmentStatus = async (id: string, status: Shipment['status']) => {
    try {
      await updateDoc(doc(db, 'shipments', id), { status, updatedAt: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const assignToLoad = async (shipmentId: string, loadId: string) => {
    try {
      await updateDoc(doc(db, 'shipments', shipmentId), { 
        loadId, 
        status: 'assigned',
        updatedAt: new Date() 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const createLoadingAssignment = async (assignmentData: Omit<LoadingAssignment, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'loadingAssignments'), {
        ...assignmentData,
        companyId: user?.companyId,
        createdAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateLoadingStatus = async (id: string, status: LoadingAssignment['status']) => {
    try {
      await updateDoc(doc(db, 'loadingAssignments', id), { status });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const createCrossDockOperation = async (operationData: Omit<CrossDockOperation, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'crossDockOperations'), {
        ...operationData,
        companyId: user?.companyId,
        createdAt: new Date(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateCrossDockStatus = async (id: string, status: CrossDockOperation['status']) => {
    try {
      await updateDoc(doc(db, 'crossDockOperations', id), { status });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const getInventoryValue = (warehouseId?: string): number => {
    const filteredInventory = warehouseId 
      ? state.inventory.filter(i => i.warehouseId === warehouseId)
      : state.inventory;
    
    return filteredInventory.reduce((total, item) => total + (item.quantity * item.unitValue), 0);
  };

  const getUtilizationRate = (warehouseId: string): number => {
    const warehouse = state.warehouses.find(w => w.id === warehouseId);
    if (!warehouse) return 0;

    const usedCapacity = state.inventory
      .filter(i => i.warehouseId === warehouseId)
      .reduce((total, item) => total + item.quantity, 0);

    return (usedCapacity / warehouse.capacity) * 100;
  };

  const getTurnoverRate = (itemId: string): number => {
    // Calculate inventory turnover rate (placeholder implementation)
    return 0;
  };

  const value: WarehouseContextType = {
    ...state,
    addWarehouse,
    updateWarehouse,
    addInventoryItem,
    updateInventoryItem,
    scanBarcode,
    adjustInventory,
    transferInventory,
    createShipment,
    updateShipmentStatus,
    assignToLoad,
    createLoadingAssignment,
    updateLoadingStatus,
    createCrossDockOperation,
    updateCrossDockStatus,
    getInventoryValue,
    getUtilizationRate,
    getTurnoverRate,
  };

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
}
