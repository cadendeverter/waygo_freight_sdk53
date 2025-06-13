import { Timestamp } from 'firebase/firestore';

export type DriverStatus = 'AVAILABLE' | 'ON_LOAD' | 'OFF_DUTY' | 'ON_BREAK' | 'OUT_OF_SERVICE';
export type LicenseClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
export type LicenseEndorsement = 'H' | 'N' | 'P' | 'S' | 'T' | 'X' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export interface Driver {
  id: string;
  companyId: string;
  userId: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  hireDate: string; // YYYY-MM-DD
  terminationDate?: string; // YYYY-MM-DD
  status: DriverStatus;
  isActive: boolean;
  
  // Contact Information
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  }>;

  // License Information
  license: {
    number: string;
    state: string;
    class: LicenseClass;
    endorsements: LicenseEndorsement[];
    expirationDate: string; // YYYY-MM-DD
    issueDate: string; // YYYY-MM-DD
    documentUrl?: string;
  };

  // Medical Certificate
  medicalCertificate: {
    expirationDate: string; // YYYY-MM-DD
    documentUrl?: string;
  };

  // Employment Details
  employmentType: 'COMPANY_DRIVER' | 'OWNER_OPERATOR' | 'LEASE_OPERATOR' | 'CONTRACTOR';
  paymentType: 'PER_MILE' | 'PERCENT_OF_LOAD' | 'SALARY' | 'HOURLY';
  paymentRate: number;
  paymentNotes?: string;

  // Equipment Assignment
  assignedTruckId?: string;
  assignedTruckName?: string;
  assignedTrailerId?: string;
  assignedTrailerName?: string;

  // Compliance
  isEldExempt: boolean;
  eldExemptionNotes?: string;
  isHazmatCertified: boolean;
  hazmatCertificationExpiration?: string; // YYYY-MM-DD
  twicCardNumber?: string;
  twicCardExpiration?: string; // YYYY-MM-DD
  passportNumber?: string;
  passportExpiration?: string; // YYYY-MM-DD

  // Documents
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    expirationDate?: string; // YYYY-MM-DD
    status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    reviewNotes?: string;
    uploadedAt: Timestamp;
    reviewedAt?: Timestamp;
    reviewedBy?: string;
  }>;

  // Stats
  totalMilesDriven: number;
  totalLoads: number;
  onTimePercentage: number;
  safetyScore: number;

  // Current Status
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: Timestamp;
  };
  currentStatus?: {
    status: DriverStatus;
    statusSince: Timestamp;
    currentLoadId?: string;
    currentLoadName?: string;
    nextStopId?: string;
    nextStopName?: string;
    etaToNextStop?: Timestamp;
    odometerReading?: number;
    hoursRemaining?: number; // Hours of service remaining
  };

  // System Fields
  fcmTokens?: string[];
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export interface DriverLog {
  id: string;
  driverId: string;
  driverName: string;
  date: string; // YYYY-MM-DD
  logs: Array<{
    id: string;
    status: 'OFF_DUTY' | 'SLEEPER_BERTH' | 'DRIVING' | 'ON_DUTY' | 'ON_BREAK';
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number; // in minutes
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    odometerStart?: number;
    odometerEnd?: number;
    distance?: number; // in miles
    notes?: string;
    isEdited: boolean;
    editReason?: string;
    editedAt?: Timestamp;
    editedBy?: string;
  }>;
  totalOffDuty: number; // in minutes
  totalSleeperBerth: number; // in minutes
  totalDriving: number; // in minutes
  totalOnDuty: number; // in minutes
  totalOnBreak: number; // in minutes
  violations: Array<{
    type: string;
    description: string;
    duration: number; // in minutes
    rule: string;
  }>;
  certification: {
    certified: boolean;
    certifiedAt: Timestamp;
    certifiedBy: string;
    notes?: string;
  };
  isCertified: boolean;
  certifiedAt?: Timestamp;
  certifiedBy?: string;
  notes?: string;
  submittedAt?: Timestamp;
  submittedBy?: string;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewNotes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CERTIFIED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
