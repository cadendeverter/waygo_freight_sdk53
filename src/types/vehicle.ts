import { Timestamp } from 'firebase/firestore';

export type VehicleType = 'TRACTOR' | 'STRAIGHT_TRUCK' | 'TRAILER' | 'VAN' | 'REEFER' | 'FLATBED' | 'STEP_DECK' | 'LOWBOY' | 'TANKER' | 'HAZMAT' | 'OTHER';
export type VehicleStatus = 'AVAILABLE' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE' | 'IN_TRANSIT' | 'NEEDS_INSPECTION';
export type FuelType = 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'CNG' | 'LNG' | 'OTHER';

export interface Vehicle {
  id: string;
  companyId: string;
  name: string;
  unitNumber: string;
  licensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  fuelType: FuelType;
  fuelCapacity: number; // in gallons
  mpg: number; // miles per gallon
  odometer: number; // current odometer reading
  lastServiceMileage: number;
  lastServiceDate: Timestamp;
  nextServiceMileage: number;
  nextServiceDate: Timestamp;
  insurance: {
    policyNumber: string;
    provider: string;
    expirationDate: Timestamp;
    liabilityLimit: number;
    cargoLimit: number;
  };
  registration: {
    expirationDate: Timestamp;
    state: string;
    documentUrl?: string;
  };
  ifta: {
    accountNumber: string;
    expirationDate: Timestamp;
    documentUrl?: string;
  };
  annualInspection: {
    expirationDate: Timestamp;
    documentUrl?: string;
  };
  vinInspection: {
    date: Timestamp;
    documentUrl?: string;
  };
  eldDevice: {
    provider: string;
    serialNumber: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  };
  isActive: boolean;
  notes?: string;
  currentDriverId?: string;
  currentDriverName?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: Timestamp;
  };
  currentLoadId?: string;
  currentLoadName?: string;
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    expirationDate?: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  date: Timestamp;
  odometer: number;
  location: string;
  status: 'PASSED' | 'FAILED' | 'OUT_OF_SERVICE';
  notes?: string;
  defects: Array<{
    id: string;
    description: string;
    isCritical: boolean;
    isRepaired: boolean;
    repairNotes?: string;
    repairDate?: Timestamp;
    repairDocumentUrl?: string;
  }>;
  inspectorSignature: {
    name: string;
    url: string;
    timestamp: Timestamp;
  };
  reviewerSignature?: {
    name: string;
    url: string;
    timestamp: Timestamp;
  };
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'SCHEDULED' | 'UNSCHEDULED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  title: string;
  description: string;
  odometer: number;
  dateReported: Timestamp;
  dateCompleted?: Timestamp;
  vendor?: {
    name: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
  };
  cost: number;
  invoiceNumber?: string;
  invoiceUrl?: string;
  parts: Array<{
    id: string;
    name: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    warrantyExpiration?: Timestamp;
  }>;
  laborHours: number;
  laborRate: number;
  laborCost: number;
  totalCost: number;
  notes?: string;
  assignedToId?: string;
  assignedToName?: string;
  completedById?: string;
  completedByName?: string;
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
