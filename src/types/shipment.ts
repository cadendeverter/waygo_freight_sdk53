import { DocumentReference, Timestamp } from 'firebase/firestore';

export type ShipmentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'DELAYED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface Stop {
  id: string;
  type: 'PICKUP' | 'DROPOFF' | 'STOP';
  sequence: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
  scheduledAt: Timestamp;
  completedAt?: Timestamp;
  status: 'PENDING' | 'ARRIVED' | 'LOADING' | 'UNLOADING' | 'COMPLETED' | 'SKIPPED';
  signatureUrl?: string;
  documents?: DocumentReference[];
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number; // in meters
  geofenceEnteredAt?: Timestamp;
  geofenceExitedAt?: Timestamp;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  referenceNumber?: string;
  status: ShipmentStatus;
  stops: Stop[];
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedTruckId?: string;
  assignedTruckName?: string;
  assignedTrailerId?: string;
  assignedTrailerName?: string;
  customerId: string;
  customerName: string;
  customerReference?: string;
  customerNotes?: string;
  rate: number;
  distance: number; // in miles
  weight: number; // in lbs
  pieces?: number;
  commodity?: string;
  temperatureRange?: {
    min: number;
    max: number;
    unit: 'F' | 'C';
  };
  isHazmat: boolean;
  hazmatDetails?: {
    class: string;
    unNumber: string;
    packingGroup: string;
    emergencyPhone: string;
  };
  specialInstructions?: string;
  documents?: DocumentReference[];
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  pickupDate: Timestamp;
  deliveryDate: Timestamp;
  completedAt?: Timestamp;
  metadata?: {
    [key: string]: any;
  };
}

export interface ShipmentDocument {
  id: string;
  type: 'BOL' | 'POD' | 'INVOICE' | 'RATE_CONFIRMATION' | 'OTHER';
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  size: number;
  mimeType: string;
  notes?: string;
}

export interface ShipmentEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'LOCATION_UPDATE' | 'DOCUMENT_UPLOAD' | 'NOTE_ADDED' | 'OTHER';
  timestamp: Timestamp;
  userId: string;
  userName: string;
  userRole: string;
  details: {
    [key: string]: any;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
