import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Truck, 
  BarChart, 
  Clock, 
  FileText, 
  Package, 
  MapPin, 
  DollarSign, 
  User, 
  Settings, 
  Shield, 
  Archive, 
  Users, 
  Building2, 
  Calculator, 
  Globe 
} from '../utils/icons';

interface QuickTile {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
}

interface QuickAccessContextType {
  quickTiles: QuickTile[];
  addTileToQuickAccess: (tileId: string) => void;
  removeTileFromQuickAccess: (tileId: string) => void;
}

const QuickAccessContext = createContext<QuickAccessContextType | undefined>(undefined);

// Base default tile definitions (component functions cannot be serialized)
const DEFAULT_TILES: QuickTile[] = [
  {
    id: 'shipments',
    title: 'Active Shipments',
    subtitle: 'Track your shipments',
    icon: Truck,
    route: '/shipments',
    color: '#007AFF'
  }
];

// Full catalog of tiles that may be added to quick access
const AVAILABLE_TILES: QuickTile[] = [
  // Fleet Management
  {
    id: 'fleet-overview',
    title: 'Fleet Overview',
    subtitle: 'Real-time fleet status',
    icon: Truck,
    route: '/(admin)/fleet',
    color: '#007AFF'
  },
  {
    id: 'vehicle-maintenance',
    title: 'Vehicle Maintenance',
    subtitle: 'Maintenance schedules',
    icon: Settings,
    route: '/(admin)/fleet/maintenance',
    color: '#FF9500'
  },
  {
    id: 'driver-management',
    title: 'Driver Management',
    subtitle: 'Driver profiles',
    icon: User,
    route: '/(admin)/drivers',
    color: '#34C759'
  },
  
  // Operations & Dispatch
  {
    id: 'dispatch-board',
    title: 'Dispatch Board',
    subtitle: 'Load assignment',
    icon: MapPin,
    route: '/(admin)/operations/dispatch',
    color: '#007AFF'
  },
  {
    id: 'load-management',
    title: 'Load Management',
    subtitle: 'Manage freight loads',
    icon: Package,
    route: '/(admin)/loads',
    color: '#5856D6'
  },
  {
    id: 'route-optimization',
    title: 'Route Optimization',
    subtitle: 'AI-powered routes',
    icon: Globe,
    route: '/(admin)/analytics/route-optimization',
    color: '#10B981'
  },
  
  // Compliance & Safety
  {
    id: 'hos-tracking',
    title: 'Hours of Service',
    subtitle: 'HOS compliance',
    icon: Clock,
    route: '/(admin)/compliance/hours-of-service',
    color: '#F59E0B'
  },
  {
    id: 'dvir',
    title: 'DVIR & Inspections',
    subtitle: 'Vehicle inspections',
    icon: Shield,
    route: '/(admin)/fleet/inspections',
    color: '#EF4444'
  },
  {
    id: 'compliance-docs',
    title: 'Compliance Documents',
    subtitle: 'Safety documentation',
    icon: FileText,
    route: '/(admin)/compliance',
    color: '#8B5CF6'
  },
  
  // Warehouse & Inventory
  {
    id: 'warehouse-management',
    title: 'Warehouse Operations',
    subtitle: 'Manage warehouse',
    icon: Building2,
    route: '/(admin)/warehouse',
    color: '#06B6D4'
  },
  {
    id: 'inventory-tracking',
    title: 'Inventory Tracking',
    subtitle: 'Real-time inventory',
    icon: Archive,
    route: '/(admin)/warehouse/inventory',
    color: '#84CC16'
  },
  
  // Finance & Billing
  {
    id: 'billing-invoices',
    title: 'Billing & Invoices',
    subtitle: 'Manage billing',
    icon: DollarSign,
    route: '/(admin)/billing',
    color: '#22C55E'
  },
  {
    id: 'expense-tracking',
    title: 'Expense Tracking',
    subtitle: 'Track expenses',
    icon: Calculator,
    route: '/(admin)/billing/expenses',
    color: '#F97316'
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports',
    subtitle: 'Financial analytics',
    icon: BarChart,
    route: '/(admin)/reports',
    color: '#3B82F6'
  },
  
  // Customer Portal
  {
    id: 'customer-portal',
    title: 'Customer Portal',
    subtitle: 'Customer dashboard',
    icon: Users,
    route: '/(customer)/portal',
    color: '#EC4899'
  },
  {
    id: 'shipment-tracking',
    title: 'Shipment Tracking',
    subtitle: 'Track shipments',
    icon: MapPin,
    route: '/(customer)/tracking',
    color: '#14B8A6'
  },
  
  // Analytics & Reporting
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    subtitle: 'Business intelligence',
    icon: BarChart,
    route: '/(admin)/analytics',
    color: '#6366F1'
  },
  {
    id: 'financial-analytics',
    title: 'Financial Analytics',
    subtitle: 'Revenue analysis',
    icon: DollarSign,
    route: '/(admin)/analytics/financial',
    color: '#10B981'
  },
  {
    id: 'custom-reports',
    title: 'Custom Reports',
    subtitle: 'Generate reports',
    icon: FileText,
    route: '/(admin)/reports',
    color: '#8B5CF6'
  },
  
  // Admin & Settings
  {
    id: 'user-management',
    title: 'User Management',
    subtitle: 'Manage users',
    icon: Users,
    route: '/(admin)/users',
    color: '#F59E0B'
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    subtitle: 'Configure system',
    icon: Settings,
    route: '/(admin)/system/settings',
    color: '#6B7280'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    subtitle: 'API management',
    icon: Globe,
    route: '/(admin)/integrations',
    color: '#EF4444'
  }
];

// Combined list makes it easy to lookup a tile definition by id
const ALL_TILES: QuickTile[] = [...DEFAULT_TILES, ...AVAILABLE_TILES];

export const QuickAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quickTiles, setQuickTiles] = useState<QuickTile[]>(DEFAULT_TILES);

  // Utility to resolve a tile object by id
const resolveTile = (id: string): QuickTile | undefined => ALL_TILES.find(t => t.id === id);

// Load saved tiles (ids) from storage
  useEffect(() => {
    const loadTiles = async () => {
      try {
        let savedIds = await AsyncStorage.getItem('quickAccessTileIds');
        if (!savedIds) {
          // Legacy migration: older builds stored full tile objects under 'quickAccessTiles'
          const legacy = await AsyncStorage.getItem('quickAccessTiles');
          if (legacy) {
            try {
              const parsed: QuickTile[] = JSON.parse(legacy);
              const idsFromLegacy = parsed.map(t => t.id);
              await AsyncStorage.setItem('quickAccessTileIds', JSON.stringify(idsFromLegacy));
              await AsyncStorage.removeItem('quickAccessTiles');
              savedIds = JSON.stringify(idsFromLegacy);
            } catch {}
          }
        }

        if (savedIds) {
          const ids: string[] = JSON.parse(savedIds);
          const tiles = ids.map(resolveTile).filter(Boolean) as QuickTile[];
          // Extra safety: ensure every tile has a valid icon component
          const validTiles = tiles.filter(t => typeof t.icon === 'function');
          if (validTiles.length) setQuickTiles(validTiles);
        }
      } catch (error) {
        console.log('Error loading quick access tiles:', error);
      }
    };
    loadTiles();
  }, []);

  // Persist only the ids to storage whenever selection changes
  useEffect(() => {
    const saveTiles = async () => {
      try {
        const ids = quickTiles.map(t => t.id);
        await AsyncStorage.setItem('quickAccessTileIds', JSON.stringify(ids));
      } catch (error) {
        console.log('Error saving quick access tiles:', error);
      }
    };
    saveTiles();
  }, [quickTiles]);

  const addTileToQuickAccess = (tileId: string) => {
    const tileTemplate = resolveTile(tileId);
    if (!tileTemplate) {
      console.log('Tile template not found:', tileId);
      return;
    }
    // Check if tile is already in quick access
    if (quickTiles.some(tile => tile.id === tileId)) {
      console.log('Tile already in quick access:', tileId);
      return;
    }

    setQuickTiles([...quickTiles, tileTemplate]);
  };

  const removeTileFromQuickAccess = (tileId: string) => {
    setQuickTiles(prev => prev.filter(tile => tile.id !== tileId));
  };

  return (
    <QuickAccessContext.Provider value={{
      quickTiles,
      addTileToQuickAccess,
      removeTileFromQuickAccess
    }}>
      {children}
    </QuickAccessContext.Provider>
  );
};

export const useQuickAccess = () => {
  const context = useContext(QuickAccessContext);
  if (context === undefined) {
    throw new Error('useQuickAccess must be used within a QuickAccessProvider');
  }
  return context;
};
