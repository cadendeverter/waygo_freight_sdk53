// data/sampleDataProvider.ts
import { shouldUseSampleData } from '../config/environment';
import { Load, Driver, Vehicle, InventoryItem, Customer, Address, Facility, LoadStop, Dimensions, WarehouseLocation } from '../types';

// Sample data only available in development mode
const sampleLoads: Load[] = [
  {
    id: 'load-001',
    loadNumber: 'LD-2024-001',
    companyId: 'dev-company',
    customerId: 'customer-001',
    driverId: 'driver-001',
    vehicleId: 'vehicle-001',
    status: 'assigned',
    priority: 'normal',
    origin: {
      sequence: 1,
      type: 'pickup',
      facility: {
        name: 'Distribution Center A',
        address: {
          street: '123 Industrial Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        phone: '555-0101',
        hours: '7:00 AM - 6:00 PM',
        loadingDocks: 12
      },
      appointmentTime: new Date('2024-01-15T08:00:00Z'),
      instructions: 'Use dock 3',
      contacts: [{
        name: 'John Smith',
        phone: '555-0102',
        email: 'john@facility.com',
        role: 'Dock Supervisor'
      }],
      status: 'pending'
    },
    destination: {
      sequence: 2,
      type: 'delivery',
      facility: {
        name: 'Retail Store B',
        address: {
          street: '456 Commerce St',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          country: 'USA'
        },
        phone: '555-0201',
        hours: '9:00 AM - 5:00 PM',
        loadingDocks: 2
      },
      appointmentTime: new Date('2024-01-16T10:00:00Z'),
      instructions: 'Rear entrance only',
      contacts: [{
        name: 'Jane Doe',
        phone: '555-0202',
        email: 'jane@retailstore.com',
        role: 'Receiving Manager'
      }],
      status: 'pending'
    },
    stops: [],
    commodity: 'Electronics',
    weight: 25000,
    pieces: 150,
    equipment: 'dry_van',
    hazmat: false,
    rate: 2500,
    fuelSurcharge: 250,
    accessorials: [],
    totalCharges: 2750,
    pickupDate: new Date('2024-01-15T08:00:00Z'),
    deliveryDate: new Date('2024-01-16T10:00:00Z'),
    estimatedTransitTime: 26,
    documents: [],
    tracking: [],
    referenceNumbers: [
      { type: 'pro', value: 'PRO12345' },
      { type: 'po', value: 'PO987654' }
    ],
    customerPO: 'PO987654',
    createdAt: new Date('2024-01-14T12:00:00Z'),
    updatedAt: new Date('2024-01-14T12:00:00Z')
  }
];

const sampleDrivers: Driver[] = [
  {
    id: 'driver-001',
    userId: 'user-driver-001',
    companyId: 'dev-company',
    driverNumber: 'D001',
    cdlNumber: 'CDL123456',
    cdlClass: 'A',
    cdlEndorsements: ['X', 'H'],
    cdlExpires: new Date('2025-12-31'),
    medicalCertExpires: new Date('2025-06-01'),
    currentStatus: 'off_duty',
    hosData: {
      driverId: 'driver-001',
      currentStatus: 'OFF_DUTY',
      drivingTime: 0,
      onDutyTime: 0,
      weeklyDrivingTime: 45,
      dailyDrivingLimit: 11,
      weeklyDrivingLimit: 70,
      restBreakRequired: false,
      lastStatusChange: new Date(),
      violations: []
    },
    qualifications: [],
    safetyScore: 95,
    performanceMetrics: {
      totalMiles: 125000,
      totalDeliveries: 450,
      onTimePercentage: 98,
      fuelEfficiency: 7.2,
      safetyEvents: 0,
      customerRating: 4.8,
      averageRevenuePerMile: 2.15
    },
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  }
];

const sampleVehicles: Vehicle[] = [
  {
    id: 'vehicle-001',
    companyId: 'dev-company',
    vehicleNumber: 'TRK-001',
    vin: '1HGCM82633A123456',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    plateNumber: 'ABC1234',
    type: 'tractor',
    status: 'active',
    telematics: {
      odometer: 125000,
      engineHours: 8500,
      fuelLevel: 75,
      speed: 0,
      engineRpm: 0,
      batteryVoltage: 12.6,
      engineCoolantTemp: 180,
      oilPressure: 45,
      diagnosticCodes: [],
      lastUpdate: new Date()
    },
    maintenance: [],
    inspections: [],
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date()
  }
];

const sampleInventory: InventoryItem[] = [
  {
    id: 'inv-001',
    companyId: 'dev-company',
    warehouseId: 'warehouse-001',
    sku: 'ELEC-TV-55-001',
    description: '55" Smart TV',
    category: 'Electronics',
    weight: 45,
    dimensions: {
      length: 48.5,
      width: 28.1,
      height: 3.4,
      unit: 'inches'
    },
    quantity: 25,
    quantityOnHand: 25,
    quantityAvailable: 20,
    quantityReserved: 5,
    unitValue: 450,
    location: {
      warehouseId: 'warehouse-001',
      zone: 'A',
      aisle: '12',
      bay: '03',
      level: '2',
      position: 'B'
    },
    value: 11250,
    lastCountDate: new Date('2024-01-01'),
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date()
  },
  {
    id: 'inv-002',
    companyId: 'dev-company',
    warehouseId: 'warehouse-001',
    sku: 'FURN-CHAIR-001',
    description: 'Office Chair',
    category: 'Furniture',
    weight: 35,
    dimensions: {
      length: 26,
      width: 26,
      height: 48,
      unit: 'inches'
    },
    quantity: 50,
    quantityOnHand: 50,
    quantityAvailable: 45,
    quantityReserved: 5,
    unitValue: 120,
    location: {
      warehouseId: 'warehouse-001',
      zone: 'B',
      aisle: '08',
      bay: '15',
      level: '1',
      position: 'A'
    },
    value: 6000,
    lastCountDate: new Date('2024-01-01'),
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date()
  }
];

const sampleCustomers: Customer[] = [
  {
    id: 'customer-001',
    companyId: 'dev-company',
    name: 'ABC Electronics Corp',
    type: 'shipper',
    accountNumber: 'ACC-001',
    creditLimit: 50000,
    paymentTerms: 'Net 30',
    address: {
      street: '789 Business Ave',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA'
    },
    contacts: [{
      name: 'Mike Johnson',
      phone: '555-0301',
      email: 'mike@abcelectronics.com',
      role: 'Logistics Manager'
    }],
    facilities: [],
    rates: [],
    preferences: {
      notifications: ['email', 'sms'],
      preferredCarriers: [],
      restrictions: [],
      specialInstructions: 'Handle with care'
    },
    status: 'active',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date()
  },
  {
    id: 'customer-002',
    companyId: 'dev-company',
    name: 'XYZ Manufacturing',
    type: 'consignee',
    creditLimit: 75000,
    paymentTerms: 'Net 15',
    address: {
      street: '321 Industrial Pkwy',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      country: 'USA'
    },
    contacts: [{
      name: 'Sarah Wilson',
      phone: '555-0401',
      email: 'sarah@xyzmfg.com',
      role: 'Procurement Director'
    }],
    facilities: [],
    rates: [],
    preferences: {
      notifications: ['email'],
      preferredCarriers: [],
      restrictions: ['no_hazmat'],
      specialInstructions: 'Dock available 24/7'
    },
    status: 'active',
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date()
  }
];

// Sample data provider functions
export class SampleDataProvider {
  static getLoads(): Load[] {
    return shouldUseSampleData() ? [...sampleLoads] : [];
  }

  static getDrivers(): Driver[] {
    return shouldUseSampleData() ? [...sampleDrivers] : [];
  }

  static getVehicles(): Vehicle[] {
    return shouldUseSampleData() ? [...sampleVehicles] : [];
  }

  static getInventory(): InventoryItem[] {
    return shouldUseSampleData() ? [...sampleInventory] : [];
  }

  static getCustomers(): Customer[] {
    return shouldUseSampleData() ? [...sampleCustomers] : [];
  }

  static getLoadById(id: string): Load | undefined {
    return shouldUseSampleData() ? sampleLoads.find(load => load.id === id) : undefined;
  }

  static getDriverById(id: string): Driver | undefined {
    return shouldUseSampleData() ? sampleDrivers.find(driver => driver.id === id) : undefined;
  }

  static getVehicleById(id: string): Vehicle | undefined {
    return shouldUseSampleData() ? sampleVehicles.find(vehicle => vehicle.id === id) : undefined;
  }

  static getCustomerById(id: string): Customer | undefined {
    return shouldUseSampleData() ? sampleCustomers.find(customer => customer.id === id) : undefined;
  }

  // Helper to check if sample data is enabled
  static isSampleDataEnabled(): boolean {
    return shouldUseSampleData();
  }

  // Production-safe empty data
  static getEmptyState<T>(): T[] {
    return [];
  }
}

export default SampleDataProvider;
