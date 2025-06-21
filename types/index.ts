// Core Types for WayGo Freight Operations App
export interface User {
  id: string;
  uid?: string; // Firebase UID
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string; // Firebase display name
  phone: string;
  appRole: 'driver' | 'dispatcher' | 'manager' | 'admin' | 'warehouse' | 'finance' | 'compliance' | 'customer';
  companyId: string;
  driverId?: string;
  permissions: string[];
  isActive: boolean;
  isDevAdmin?: boolean; // Flag for development admin with enhanced permissions
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  dotNumber?: string;
  mcNumber?: string;
  address: Address;
  phone: string;
  email: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CompanySettings {
  timezone: string;
  hosRules: 'interstate' | 'intrastate_ca' | 'intrastate_tx' | 'canada';
  currency: 'USD' | 'CAD';
  distanceUnit: 'miles' | 'kilometers';
  weightUnit: 'lbs' | 'kg';
  fuelUnit: 'gallons' | 'liters';
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  hosAlerts: boolean;
  maintenanceAlerts: boolean;
  deliveryAlerts: boolean;
}

// Fleet Management Types
export interface Vehicle {
  id: string;
  companyId: string;
  vehicleNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  type: 'tractor' | 'trailer' | 'straight_truck' | 'van';
  status: 'active' | 'maintenance' | 'out_of_service' | 'sold';
  currentDriverId?: string;
  assignedDriver?: string; // Driver name for display
  currentLocation?: Location;
  telematics: VehicleTelematics;
  maintenance: MaintenanceRecord[];
  inspections: InspectionRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleTelematics {
  odometer: number;
  engineHours: number;
  fuelLevel: number;
  speed: number;
  engineRpm: number;
  batteryVoltage: number;
  engineCoolantTemp: number;
  oilPressure: number;
  diagnosticCodes: string[];
  lastUpdate: Date;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'annual_inspection' | 'repair' | 'other';
  description: string;
  cost: number;
  mileage: number;
  performedBy: string;
  performedAt: Date;
  nextDueDate?: Date;
  nextDueMileage?: number;
  parts: MaintenancePart[];
  documents: string[];
}

export interface MaintenancePart {
  name: string;
  partNumber?: string;
  quantity: number;
  cost: number;
}

export interface InspectionRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  inspectorId: string;
  type: 'pre_trip' | 'post_trip' | 'annual' | 'roadside';
  status: 'passed' | 'failed' | 'conditional';
  items: InspectionItem[];
  defectsFound: boolean;
  notes?: string;
  signatureUrl?: string;
  defects: InspectionDefect[];
  performedAt: Date;
  expiresAt?: Date;
  documents: string[];
}

export type InspectionStatus = 'satisfactory' | 'unsatisfactory' | 'not_applicable';

export interface InspectionItem {
  id: string;
  name: string;
  category: string;
  status: InspectionStatus;
  notes?: string;
}

export interface InspectionDefect {
  category: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  repaired: boolean;
  repairedAt?: Date;
  photos: string[];
}

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  companyId: string;
  driverNumber: string;
  cdlNumber: string;
  cdlClass: 'A' | 'B' | 'C';
  cdlEndorsements: string[];
  cdlExpires: Date;
  medicalCertExpires: Date;
  hazmatExpires?: Date;
  currentVehicleId?: string;
  currentStatus: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty';
  currentLocation?: Location;
  hosData: HOSData;
  qualifications: DriverQualification[];
  safetyScore: number;
  performanceMetrics: DriverMetrics;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HOSData {
  driverId: string;
  currentStatus: DutyStatus;
  drivingTime: number; // minutes today
  onDutyTime: number; // minutes today
  weeklyDrivingTime: number; // minutes this week
  dailyDrivingLimit: number; // 11 hours = 660 minutes
  weeklyDrivingLimit: number; // 70 hours = 4200 minutes
  restBreakRequired: boolean;
  lastStatusChange: Date;
  violations: HOSViolation[];
}

export interface HOSRecord {
  id: string;
  driverId: string;
  currentStatus: DutyStatus;
  drivingTime: number; // minutes today
  onDutyTime: number; // minutes today
  weeklyDrivingTime: number; // minutes this week
  dailyDrivingLimit: number; // 11 hours = 660 minutes
  weeklyDrivingLimit: number; // 70 hours = 4200 minutes
  restBreakRequired: boolean;
  lastStatusChange: Date;
  violations: HOSViolation[];
  statusHistory: HOSStatusEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HOSStatusEntry {
  status: DutyStatus;
  timestamp: Date;
  location?: string;
  notes?: string;
}

export interface HOSEntry {
  id: string;
  driverId: string;
  date: string; // YYYY-MM-DD format
  status: DutyStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  location?: Location;
  vehicle?: string;
  trailer?: string;
  odometer?: number;
  engineHours?: number;
  notes?: string;
  dataSource: 'manual' | 'automatic' | 'edit';
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HOSViolation {
  id: string;
  type: ViolationType;
  description: string;
  severity: 'warning' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

export type DutyStatus = 'OFF_DUTY' | 'SLEEPER_BERTH' | 'ON_DUTY' | 'DRIVING';
export type ViolationType = 'DAILY_DRIVING_LIMIT' | 'WEEKLY_DRIVING_LIMIT' | 'REST_BREAK_REQUIRED' | 'ON_DUTY_LIMIT';

export interface DriverQualification {
  type: 'license' | 'medical' | 'hazmat' | 'training' | 'drug_test';
  status: 'valid' | 'expired' | 'pending';
  issuedDate: Date;
  expiresDate: Date;
  documentUrl?: string;
}

export interface DriverMetrics {
  totalMiles: number;
  totalDeliveries: number;
  onTimePercentage: number;
  fuelEfficiency: number;
  safetyEvents: number;
  customerRating: number;
  averageRevenuePerMile: number;
}

// Load and Shipment Types
export interface Load {
  id: string;
  loadNumber: string;
  companyId: string;
  customerId: string;
  driverId?: string;
  vehicleId?: string;
  status: 'pending' | 'assigned' | 'en_route_pickup' | 'at_pickup' | 'loaded' | 'en_route_delivery' | 'at_delivery' | 'delivered' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Origin and Destination
  origin: LoadStop;
  destination: LoadStop;
  stops: LoadStop[];
  
  // Load Details
  commodity: string;
  weight: number;
  pieces: number;
  equipment: 'dry_van' | 'reefer' | 'flatbed' | 'tanker' | 'container';
  temperature?: TemperatureRange;
  hazmat: boolean;
  hazmatClass?: string;
  
  // Rates and Charges
  rate: number;
  fuelSurcharge: number;
  accessorials: Accessorial[];
  totalCharges: number;
  
  // Timing
  pickupDate: Date;
  deliveryDate: Date;
  estimatedTransitTime: number;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  
  // Documents and Tracking
  documents: LoadDocument[];
  tracking: TrackingEvent[];
  proofOfDelivery?: ProofOfDelivery;
  
  // References
  referenceNumbers: ReferenceNumber[];
  customerPO?: string;
  brokerageInfo?: BrokerageInfo;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadStop {
  sequence: number;
  type: 'pickup' | 'delivery' | 'fuel' | 'rest';
  facility: Facility;
  appointmentTime?: Date;
  arrivalTime?: Date;
  departureTime?: Date;
  instructions?: string;
  contacts: Contact[];
  status: 'pending' | 'arrived' | 'loading' | 'completed';
}

export interface Facility {
  name: string;
  address: Address;
  phone?: string;
  hours: string;
  loadingDocks?: number;
  restrictions?: string[];
  notes?: string;
}

export interface Contact {
  name: string;
  phone?: string;
  email?: string;
  role: string;
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'F' | 'C';
}

export interface Accessorial {
  type: string;
  description: string;
  charge: number;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface LoadDocument {
  id: string;
  type: 'bol' | 'pod' | 'invoice' | 'rate_confirmation' | 'customs' | 'insurance' | 'other';
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
}

export interface TrackingEvent {
  id: string;
  type: 'dispatched' | 'arrived_pickup' | 'loaded' | 'departed_pickup' | 'en_route' | 'arrived_delivery' | 'delivered' | 'exception';
  description: string;
  location?: Location;
  timestamp: Date;
  createdBy: string;
  automatic: boolean;
}

export interface ProofOfDelivery {
  signedBy: string;
  signatureUrl: string;
  deliveredAt: Date;
  pieces: number;
  condition: 'good' | 'damaged' | 'short' | 'over';
  notes?: string;
  photos: string[];
}

export interface ReferenceNumber {
  type: 'pro' | 'po' | 'bol' | 'pickup' | 'delivery' | 'seal' | 'container';
  value: string;
}

export interface BrokerageInfo {
  brokerName: string;
  brokerMC: string;
  rateConfirmation: string;
  margin: number;
}

// Location and Tracking
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: Date;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

// Customer Types
export interface Customer {
  id: string;
  companyId: string;
  name: string;
  type: 'shipper' | 'consignee' | 'broker' | '3pl';
  accountNumber?: string;
  creditLimit: number;
  paymentTerms: string;
  address: Address;
  contacts: Contact[];
  facilities: Facility[];
  rates: CustomerRate[];
  preferences: CustomerPreferences;
  status: 'active' | 'inactive' | 'credit_hold';
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerRate {
  id: string;
  origin: string;
  destination: string;
  equipment: string;
  ratePerMile: number;
  fuelSurcharge: number;
  minimumRate: number;
  accessorials: Record<string, number>;
  effectiveDate: Date;
  expirationDate?: Date;
}

export interface CustomerPreferences {
  notifications: string[];
  preferredCarriers: string[];
  restrictions: string[];
  specialInstructions?: string;
}

// Inventory and Warehouse Types
export interface InventoryItem {
  id: string;
  companyId: string;
  warehouseId: string;
  sku: string;
  barcode?: string;
  description: string;
  category: string;
  weight: number;
  dimensions: Dimensions;
  quantity: number;
  quantityOnHand: number;
  quantityAvailable: number;
  quantityReserved: number;
  unitValue: number;
  location: WarehouseLocation;
  value: number;
  lastCountDate: Date;
  lastAdjustment?: {
    quantity: number;
    reason: string;
    date: Date;
    userId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}

export interface WarehouseLocation {
  warehouseId: string;
  zone: string;
  aisle: string;
  bay: string;
  level: string;
  position: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  code: string;
  address: Address;
  type: 'main' | 'satellite' | 'cross_dock' | 'customer';
  capacity: number;
  usedCapacity: number;
  zones: WarehouseZone[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'receiving' | 'storage' | 'staging' | 'shipping' | 'cross_dock';
  temperature?: 'ambient' | 'cold' | 'frozen';
  capacity: number;
}

export interface Shipment {
  id: string;
  companyId: string;
  warehouseId: string;
  loadId?: string;
  shipmentNumber: string;
  type: 'inbound' | 'outbound' | 'transfer';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  origin: Facility;
  destination: Facility;
  items: ShipmentItem[];
  totalWeight: number;
  totalValue: number;
  scheduledDate: Date;
  actualDate?: Date;
  carrierInfo?: {
    name: string;
    trackingNumber?: string;
    pro?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentItem {
  inventoryItemId: string;
  quantity: number;
  serialNumbers?: string[];
  lotNumbers?: string[];
}

export interface LoadingAssignment {
  id: string;
  companyId: string;
  warehouseId: string;
  shipmentId: string;
  assignedTo: string;
  dock: string;
  scheduledTime: Date;
  startTime?: Date;
  endTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  equipment: string[];
  instructions?: string;
  createdAt: Date;
}

export interface CrossDockOperation {
  id: string;
  companyId: string;
  warehouseId: string;
  inboundShipmentId: string;
  outboundShipmentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'exception';
  items: CrossDockItem[];
  scheduledTime: Date;
  actualTime?: Date;
  assignedTo?: string;
  createdAt: Date;
}

export interface CrossDockItem {
  inventoryItemId: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'receipt' | 'shipment' | 'adjustment' | 'cycle_count' | 'transfer';
  quantity: number;
  reference: string;
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

// Financial Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  customerId: string;
  loadId?: string;
  type: 'freight' | 'accessorial' | 'fuel_surcharge' | 'detention' | 'other';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  
  // Financial Details
  subtotal: number;
  fuelSurcharge: number;
  accessorials: number;
  taxes: number;
  total: number;
  
  // Dates
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  
  // Line Items
  lineItems: InvoiceLineItem[];
  
  // References
  customerPO?: string;
  terms: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  account?: string;
}

export interface Expense {
  id: string;
  companyId: string;
  driverId?: string;
  vehicleId?: string;
  loadId?: string;
  type: 'fuel' | 'toll' | 'maintenance' | 'permit' | 'lumper' | 'parking' | 'other';
  amount: number;
  description: string;
  vendor?: string;
  receiptUrl?: string;
  approvedBy?: string;
  approvedAt?: Date;
  reimbursed: boolean;
  createdAt: Date;
}

// Compliance Types
export interface ComplianceRecord {
  id: string;
  companyId: string;
  type: 'dot_inspection' | 'ifta_filing' | 'drug_test' | 'training' | 'permit' | 'insurance';
  status: 'compliant' | 'non_compliant' | 'pending' | 'expired';
  entityId: string; // driver, vehicle, or company ID
  entityType: 'driver' | 'vehicle' | 'company';
  description: string;
  dueDate: Date;
  issuedDate?: Date; // When the compliance record was issued
  expiryDate?: Date; // When it expires (same as dueDate typically)
  completedDate?: Date;
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFTARecord {
  id: string;
  companyId: string;
  vehicleId: string;
  period: string; // YYYY-Q1, YYYY-Q2, etc.
  jurisdictions: IFTAJurisdiction[];
  totalMiles: number;
  totalGallons: number;
  totalTax: number;
  filedDate?: Date;
  status: 'draft' | 'filed' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface IFTAJurisdiction {
  state: string;
  miles: number;
  gallons: number;
  taxRate: number;
  tax: number;
}

// Safety and Incident Types
export interface SafetyEvent {
  id: string;
  companyId: string;
  driverId?: string;
  vehicleId?: string;
  type: 'accident' | 'violation' | 'inspection' | 'near_miss' | 'incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: Location;
  timestamp: Date;
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  actions: SafetyAction[];
  documents: string[];
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafetyAction {
  id: string;
  type: 'training' | 'coaching' | 'discipline' | 'vehicle_repair' | 'policy_change';
  description: string;
  assignedTo: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

// Analytics and Reporting Types
export interface KPI {
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastUpdated: Date;
}

export interface ReportFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  customers?: string[];
  drivers?: string[];
  vehicles?: string[];
  lanes?: string[];
  equipment?: string[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface LoadForm {
  customerId: string;
  origin: Partial<LoadStop>;
  destination: Partial<LoadStop>;
  commodity: string;
  weight: number;
  pieces: number;
  equipment: string;
  pickupDate: Date;
  deliveryDate: Date;
  rate: number;
  specialInstructions?: string;
}

export interface DriverForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cdlNumber: string;
  cdlClass: string;
  cdlExpires: Date;
  medicalCertExpires: Date;
  address: Address;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication and Permissions
export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[];
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  units: {
    distance: 'miles' | 'km';
    weight: 'lbs' | 'kg';
    temperature: 'F' | 'C';
  };
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    locationTracking: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
}

// Note: All types are defined in this single file for simplicity
