// $ProjectName/services/vehicleService.ts
import { db } from '../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions(); // Initialize Firebase Functions
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Vehicle } from '../utils/types'; // MaintenanceRecord and VehicleComplianceItem are not defined

const getAssignedVehicleDetailsCallable = httpsCallable<{ vehicleId: string }, Vehicle | null>(functions, 'getAssignedVehicleDetailsFreight');
// const getVehicleMaintenanceRecordsCallable = httpsCallable<{ vehicleId: string, limit?: number }, MaintenanceRecord[]>(functions, 'getVehicleMaintenanceRecordsFreight'); // MaintenanceRecord type is missing
const adminAddVehicleCallable = httpsCallable<Omit<Vehicle, 'id'>, {success: boolean, vehicleId?: string, message?: string}>(functions, 'adminAddVehicle');
const adminUpdateVehicleCallable = httpsCallable<{vehicleId: string, updates: Partial<Vehicle>}, {success: boolean, message?: string}>(functions, 'adminUpdateVehicle');
const adminGetVehicleDetailsCallable = httpsCallable<{vehicleId: string}, Vehicle | null>(functions, 'adminGetVehicleDetails'); // For admin view
const adminUpdateVehicleComplianceItemCallable = httpsCallable<{vehicleId: string, item: Omit<any, 'id'> & {id?: string}}, {success: boolean, message?: string, itemId?: string}>(functions, 'adminUpdateVehicleComplianceItem'); // VehicleComplianceItem replaced with any


export const fetchAssignedVehicleDetails = async (vehicleId: string): Promise<Vehicle | null> => {
  if (!vehicleId) return null;
  try {
    const result = await getAssignedVehicleDetailsCallable({ vehicleId });
    return result.data;
  } catch (error: any) {
    console.error(`Error fetching vehicle details for ${vehicleId}:`, error.message);
    return null; 
  }
};

// export const fetchVehicleMaintenanceRecords = async (vehicleId: string, count: number = 10): Promise<MaintenanceRecord[]> => {
//   if (!vehicleId) return [];
//   try {
//     // const result = await getVehicleMaintenanceRecordsCallable({ vehicleId, limit: count }); // MaintenanceRecord type is missing
//     // return result.data;
//     return []; // Placeholder
//   } catch (error: any) {
//     console.error(`Error fetching maintenance for vehicle ${vehicleId}:`, error.message);
//     return [];
//   }
// };

// Admin functions for vehicles
export const adminAddNewVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<{success: boolean, vehicleId?: string, message?: string}> => {
    try {
        const result = await adminAddVehicleCallable(vehicleData);
        return result.data;
    } catch (error: any) {
        console.error("Error adding new vehicle:", error.message);
        throw new Error(error.message || "Failed to add vehicle.");
    }
};

export const adminUpdateVehicleDetails = async (vehicleId: string, updates: Partial<Vehicle>): Promise<{success: boolean, message?: string}> => {
    try {
        const result = await adminUpdateVehicleCallable({vehicleId, updates});
        return result.data;
    } catch (error: any) {
        console.error(`Error updating vehicle ${vehicleId}:`, error.message);
        throw new Error(error.message || "Failed to update vehicle.");
    }
};

export const fetchAllVehiclesForAdmin = async (companyId: string): Promise<Vehicle[]> => {
    try {
        const vehiclesRef = collection(db, "vehiclesFreight");
        const q = query(vehiclesRef, where("companyId", "==", companyId), orderBy("licensePlate", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({id: d.id, ...d.data()}) as Vehicle);
    } catch (error: any) {
        console.error(`Error fetching vehicles for company ${companyId}:`, error.message);
        return [];
    }
};

export const adminFetchVehicleDetails = async (vehicleId: string): Promise<Vehicle | null> => {
    try {
        const result = await adminGetVehicleDetailsCallable({ vehicleId });
        return result.data;
    } catch (error: any) {
        console.error(`Admin: Error fetching vehicle details for ${vehicleId}:`, error.message);
        return null;
    }
};

export const adminUpsertVehicleComplianceItem = async (vehicleId: string, item: Omit<any, 'id'> & {id?: string}): Promise<{success: boolean, message?: string, itemId?: string}> => { // VehicleComplianceItem replaced with any
    try {
        const result = await adminUpdateVehicleComplianceItemCallable({vehicleId, item});
        return result.data;
    } catch (error: any) {
        console.error(`Admin: Error upserting compliance item for vehicle ${vehicleId}:`, error.message);
        throw new Error(error.message || "Failed to update vehicle compliance.");
    }
};
