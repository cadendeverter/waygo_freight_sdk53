// $ProjectName/utils/types.ts
// Fully implemented types for production use.
// Firebase cloud messaging types (minimal) – adjust as needed
type FirebaseMessagingTypes = any;

export interface Coordinates { latitude: number; longitude: number; }
export type AppRole = 'DRIVER_FREIGHT' | 'DISPATCHER_FREIGHT' | 'WAREHOUSE_FREIGHT' | 'ADMIN_FREIGHT' | 'CUSTOMER_FREIGHT' | 'UNKNOWN';

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  appRole: AppRole;
  displayName?: string | null;
  phone?: string;
  companyId?: string;
  createdAt: string | { seconds: number; nanoseconds: number };
  updatedAt?: string | { seconds: number; nanoseconds: number };
  fcmToken?: string;
  isAvailable?: boolean; // Driver specific
  assignedTruckId?: string; // Driver specific
  currentLocation?: Coordinates; // Driver specific
  currentLocationUpdatedAt?: string | { seconds: number; nanoseconds: number }; // Driver specific
  currentLoadId?: string | null; // Driver specific
  lastSafetyTrainingCompletedDate?: string | { seconds: number; nanoseconds: number };
  referralCode?: string;
  referredBy?: string;
  referralRewardApplied?: boolean;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  subscriptionTier?: string;
  stripeCustomerId?: string;
}

export type LoadStatus =
  | 'pending_assignment' | 'tendered' | 'declined' | 'assigned' | 'driver_en_route_to_shipper'
  | 'arrived_at_shipper' | 'loading' | 'departed_shipper' | 'in_transit'
  | 'arrived_at_intermediate_stop' | 'departed_intermediate_stop' | 'arrived_at_consignee'
  | 'unloading' | 'delivered' | 'completed' | 'cancelled' | 'issue_reported' | 'delayed';

export type DocumentType = 'BOL' | 'POD' | 'LUMPER_RECEIPT' | 'FUEL_RECEIPT' | 'SCALE_TICKET' | 'CUSTOMS' | 'PHOTO_PROOF' | 'DVIR' | 'ACCIDENT_REPORT' | 'MAINTENANCE_RECORD' | 'INCIDENT_PHOTO' | 'EXPENSE_RECEIPT' | 'HAZMAT_INFO' | 'SAFETY_BULLETIN' | 'COMPLIANCE_DOC' | 'PERSONAL_DOCUMENT' | 'OTHER';

export interface DocumentInfo {
  id: string; name: string; type: DocumentType; url: string;
  uploadedAt: string; // ISO String
  uploadedBy: string; 
  notes?: string;
}

export interface Stop {
  id: string; type: 'PICKUP' | 'DROPOFF' | 'INTERMEDIATE'; locationName: string; address: string;
  coordinates?: Coordinates; 
  appointmentWindowStart: string; // ISO String
  appointmentWindowEnd: string; // ISO String
  status: 'PENDING' | 'ARRIVED' | 'LOADING' | 'UNLOADING' | 'DEPARTED' | 'COMPLETED' | 'SKIPPED';
  actualArrivalTime?: string | null; // ISO String
  actualDepartureTime?: string | null; // ISO String
  notes?: string; contactName?: string; contactPhone?: string; referenceNumbers?: string[];
  documents: DocumentInfo[]; 
}

export interface CargoItem { 
    id: string; description: string; quantity: number; unit: 'PALLET' | 'CASE' | 'UNIT' | 'LBS' | 'KG';
    weightLbs?: number; isHazmat?: boolean; unNumber?: string; hazmatClass?: string;
    temperatureSensitive?: boolean; requiredTempMin?: number; requiredTempMax?: number;
}

export interface FreightLoad {
  id: string; loadNumber: string; status: LoadStatus;
  companyId: string;
  customerName: string;
  commodity: string;
  equipmentTypeRequired: 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'TANKER' | 'INTERMODAL_CHASSIS' | 'BOX_TRUCK' | 'CARGO_VAN' | 'OTHER';
  stops: Stop[];
  documents: DocumentInfo[];
  createdAt: string; // ISO String
  updatedAt?: string; // ISO String
  assignedDriverId?: string | null;
  assignedDriverName?: string;
  assignedTruckId?: string;
  specialInstructions?: string;
  isHazmat?: boolean;
  cargoDetails?: CargoItem[]; 
  rate?: number;
  statusHistory?: { 
      status: LoadStatus, 
      timestamp: string, // ISO String
      notes?: string, 
      updatedBy: string 
  }[];
}

export interface Vehicle {
  id: string; make?: string; model?: string; year?: number; licensePlate: string;
  type: 'TRACTOR' | 'STRAIGHT_TRUCK' | 'TRAILER_DRYVAN' | 'TRAILER_REEFER' | 'TRAILER_FLATBED' | 'CONTAINER_CHASSIS';
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'; currentDriverId?: string;
  currentLocation?: Coordinates; lastLocationUpdate?: string | { seconds: number; nanoseconds: number };
  odometer?: number; fuelLevelPercent?: number; engineHours?: number;
  diagnosticCodes?: { code: string; description: string; timestamp: string | { seconds: number; nanoseconds: number }}[] ; 
  telematics?: any; 
  nextServiceDue?: string | { seconds: number; nanoseconds: number };
  nextServiceType?: string;
  lastDVIRId?: string; companyId?: string;
  complianceItems?: any[];
}

export interface DVIRReport {
  id: string; vehicleId: string; vehicleType: 'TRACTOR' | 'TRAILER'; vehicleLicensePlate: string;
  driverId: string; driverName: string; reportType: 'PRE_TRIP' | 'POST_TRIP' | 'INTERIM';
  date: string | { seconds: number; nanoseconds: number }; location: string; odometer?: number;
  defects: any[]; noDefectsFound: boolean; remarks?: string;
  isSafeToOperate: boolean; 
  companyId?: string;
}

export type HOSRuleSet = 'USA_PROPERTY_70_8' | 'USA_PROPERTY_60_7' | 'CA_SOUTH_CYCLE_1' | 'CA_SOUTH_CYCLE_2';
export type HOSStatusType = 'OFF_DUTY' | 'SLEEPER_BERTH' | 'DRIVING' | 'ON_DUTY_NOT_DRIVING';

export interface HOSLogEntry {
  id: string;
  startTime: string; // ISO String
  endTime?: string | null; // ISO String
  status: HOSStatusType;
  notes?: string;
  isCertified?: boolean;
}

export interface HOSSummary {
  driverId: string;
  currentStatus: HOSStatusType;
  currentStatusStartTime: string; // ISO String
  drivingTimeTodaySecs: number; 
  onDutyTimeTodaySecs: number;
  shiftTimeRemainingSecs: number;
  cycleTimeRemainingSecs: number;
  timeUntilBreakRequiredSecs?: number;
  activeRuleSet: HOSRuleSet;
  lastUpdatedAt: string; // ISO String
}

export interface ExpenseReport {
    id: string;
    driverId: string;
    companyId?: string;
    loadId?: string | null; 
    date: string | { seconds: number; nanoseconds: number };
    category: 'FUEL' | 'TOLL' | 'MAINTENANCE' | 'LUMPER' | 'MEAL' | 'LODGING' | 'OTHER';
    amount: number;
    currency: string; 
    description?: string;
    receiptUrl?: string | null; 
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
    submittedAt: string | { seconds: number; nanoseconds: number };
    approvedAt?: string | { seconds: number; nanoseconds: number };
    approvedBy?: string; 
    rejectionReason?: string;
}

export interface SettlementStatement {
    id: string;
    driverId: string;
    companyId: string;
    statementPeriodStart: string; // ISO String
    statementPeriodEnd: string; // ISO String
    statementDate: string; // ISO String
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
    currency: string;
    lineItems: SettlementLineItem[];
    status: 'PENDING' | 'PAID' | 'DISPUTED';
}

export interface SettlementLineItem {
    id: string;
    type: 'LOAD_PAYMENT' | 'FUEL_ADVANCE' | 'REIMBURSEMENT' | 'OTHER_DEDUCTION';
    description: string;
    amount: number;
    date: string; // ISO String
}

export interface CustomerShipmentView { 
    id: string; 
    loadNumber: string;
    status: LoadStatus;
    originCity: string;
    destinationCity: string;
    estimatedDeliveryTime?: any;
    currentLocation?: Coordinates; 
    commodity?: string;
    assignedDriverName?: string;
    stops?: Partial<Stop>[];
}

export interface CustomerOrderRequest {
    id?: string;
    customerId: string;
    customerName?: string;
    companyId: string;
    originAddress: string;
    destinationAddress: string;
    pickupDate: string; // ISO String
    commodity: string;
    equipmentTypeRequired: FreightLoad['equipmentTypeRequired'];
    totalWeightLbs?: number;
    specialInstructions?: string;
    status: 'PENDING_QUOTE' | 'BOOKED' | 'REJECTED';
    requestedAt: string; // ISO String
}

export interface ReceivingTaskItem {
    id: string;
    description: string;
    expectedQuantity: number;
    receivedQuantity: number;
    status: 'PENDING' | 'PARTIAL' | 'COMPLETE';
}

export interface ReceivingTask {
    id: string;
    supplierName: string;
    expectedArrivalDate: string; // ISO String
    status: 'EXPECTED' | 'RECEIVING' | 'COMPLETE' | 'DISCREPANCY';
    items: ReceivingTaskItem[];
}

export interface PickingTaskItem {
    id: string;
    description: string;
    locationInWarehouse: string;
    quantityToPick: number;
    pickedQuantity: number;
    status: 'PENDING' | 'PICKED';
}

export interface PickingTask {
    id: string;
    loadNumber: string;
    destination: string;
    status: 'PENDING' | 'PICKING' | 'STAGED' | 'LOADED';
    items: PickingTaskItem[];
}
