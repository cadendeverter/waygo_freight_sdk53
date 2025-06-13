import { z } from 'zod';
import { Driver, Vehicle, Shipment, UserProfile } from '../types';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code');

export const vinSchema = z
  .string()
  .length(17, 'VIN must be 17 characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Invalid VIN format');

export const licensePlateSchema = z
  .string()
  .min(2, 'License plate is too short')
  .max(10, 'License plate is too long');

export const driverSchema: z.ZodType<Partial<Driver>> = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  status: z.enum(['AVAILABLE', 'ON_LOAD', 'OFF_DUTY', 'ON_BREAK', 'OUT_OF_SERVICE']),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zipCode: zipCodeSchema,
    country: z.string().default('US'),
  }),
  license: z.object({
    number: z.string().min(1, 'License number is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  }),
  medicalCertificate: z.object({
    expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  }),
});

export const vehicleSchema: z.ZodType<Partial<Vehicle>> = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  licensePlate: licensePlateSchema,
  vin: vinSchema,
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  type: z.enum(['TRACTOR', 'STRAIGHT_TRUCK', 'TRAILER', 'VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'LOWBOY', 'TANKER', 'HAZMAT', 'OTHER']),
  status: z.enum(['AVAILABLE', 'IN_MAINTENANCE', 'OUT_OF_SERVICE', 'IN_TRANSIT', 'NEEDS_INSPECTION']),
  fuelType: z.enum(['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID', 'CNG', 'LNG', 'OTHER']),
  odometer: z.number().min(0, 'Odometer cannot be negative'),
  insurance: z.object({
    policyNumber: z.string().min(1, 'Policy number is required'),
    provider: z.string().min(1, 'Provider is required'),
    expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  }),
});

export const shipmentSchema: z.ZodType<Partial<Shipment>> = z.object({
  referenceNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'CANCELLED', 'COMPLETED']),
  stops: z.array(
    z.object({
      type: z.enum(['PICKUP', 'DROPOFF', 'STOP']),
      sequence: z.number().min(1, 'Sequence must be at least 1'),
      name: z.string().min(1, 'Stop name is required'),
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().length(2, 'State must be 2 characters'),
      zipCode: zipCodeSchema,
      contactName: z.string().min(1, 'Contact name is required'),
      contactPhone: phoneSchema,
      scheduledAt: z.any(), // Will be converted to Timestamp
    })
  ).min(2, 'At least 2 stops (pickup and dropoff) are required'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  distance: z.number().min(0, 'Distance cannot be negative'),
  weight: z.number().min(0, 'Weight cannot be negative'),
  isHazmat: z.boolean().default(false),
  hazmatDetails: z.object({
    class: z.string(),
    unNumber: z.string(),
    packingGroup: z.string(),
    emergencyPhone: z.string(),
  }).optional(),
  pickupDate: z.any(), // Will be converted to Timestamp
  deliveryDate: z.any(), // Will be converted to Timestamp
});

export const userProfileSchema: z.ZodType<Partial<UserProfile>> = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: emailSchema,
  phoneNumber: phoneSchema.optional(),
  role: z.enum(['ADMIN_FREIGHT', 'DISPATCHER', 'DRIVER', 'WAREHOUSE', 'CUSTOMER']),
  companyId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const validateForm = <T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
};

export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join('\n');
};

// Helper function to convert form data to proper types for Firestore
export const prepareFormData = <T>(data: any): T => {
  // This is a simplified version - you might need to add more type conversions
  const prepared: any = { ...data };
  
  // Convert date strings to Firestore Timestamps
  const dateFields = ['date', 'createdAt', 'updatedAt', 'pickupDate', 'deliveryDate', 'expirationDate', 'hireDate', 'terminationDate'];
  
  for (const key in prepared) {
    if (dateFields.includes(key) && typeof prepared[key] === 'string') {
      prepared[key] = new Date(prepared[key]);
    } else if (typeof prepared[key] === 'object' && prepared[key] !== null) {
      prepared[key] = prepareFormData(prepared[key]);
    }
  }
  
  return prepared as T;
};
