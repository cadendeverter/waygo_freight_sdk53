import * as Location from '../utils/location';
import { Platform } from 'react-native';
import { db } from '../firebase/config';
import { doc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Location as LocationType, VehicleTelematics } from '../types';

export interface GeofenceAlert {
  id: string;
  vehicleId: string;
  driverId?: string;
  type: 'entry' | 'exit';
  geofenceName: string;
  location: LocationType;
  timestamp: Date;
  acknowledged: boolean;
}

export interface TrackingSession {
  id: string;
  vehicleId: string;
  driverId?: string;
  startTime: Date;
  endTime?: Date;
  startLocation: LocationType | null;
  endLocation?: LocationType | null;
  totalDistance: number;
  totalTime: number;
  averageSpeed: number;
  maxSpeed: number;
  fuelUsed: number;
  status: 'active' | 'completed' | 'paused';
}

export interface RouteOptimization {
  routeId: string;
  vehicleId: string;
  stops: LocationType[];
  optimizedOrder: number[];
  totalDistance: number;
  estimatedTime: number;
  fuelCost: number;
  efficiency: number;
  createdAt: Date;
}

export interface TelemtricsData {
  vehicleId: string;
  location: LocationType;
  speed: number;
  heading: number;
  odometer: number;
  engineHours: number;
  fuelLevel: number;
  engineRpm: number;
  batteryVoltage: number;
  engineCoolantTemp: number;
  oilPressure: number;
  diagnosticCodes: string[];
  driverBehavior: {
    harshBraking: boolean;
    rapidAcceleration: boolean;
    sharpTurning: boolean;
    speeding: boolean;
    idleTime: number;
  };
  timestamp: Date;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'warehouse' | 'customer' | 'restricted' | 'high_theft' | 'rest_area' | 'fuel_station';
  coordinates: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  alertOnEntry: boolean;
  alertOnExit: boolean;
  companyId: string;
}

class GPSTrackingService {
  private trackingInterval: NodeJS.Timeout | null = null;
  private geofences: Geofence[] = [];
  private lastKnownLocation: Location.LocationObject | null = null;
  private trackingSession: TrackingSession | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web geolocation permissions
        if ('geolocation' in navigator) {
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            );
          });
        }
        return false;
      }

      // Mobile permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return false;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      return backgroundStatus === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async startTracking(vehicleId: string, driverId?: string): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permissions not granted');
      }

      // Stop any existing tracking
      await this.stopTracking();

      // Start continuous location tracking
      this.trackingInterval = setInterval(async () => {
        await this.updateLocation(vehicleId, driverId);
      }, 30000); // Update every 30 seconds

      // Initial location update
      await this.updateLocation(vehicleId, driverId);

      // Create a new tracking session
      const trackingSessionData = {
        id: Math.random().toString(36).substr(2, 9),
        vehicleId,
        driverId,
        startTime: new Date(),
        startLocation: this.lastKnownLocation ? {
          latitude: this.lastKnownLocation.coords.latitude,
          longitude: this.lastKnownLocation.coords.longitude,
          timestamp: new Date(),
          speed: this.lastKnownLocation.coords.speed || 0,
          heading: this.lastKnownLocation.coords.heading || 0,
          accuracy: this.lastKnownLocation.coords.accuracy || 0,
        } : null,
        totalDistance: 0,
        totalTime: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        fuelUsed: 0,
        status: 'active' as const,
      };

      this.trackingSession = trackingSessionData;

      // Save the tracking session to Firestore
      await addDoc(collection(db, 'trackingSessions'), trackingSessionData);

      return true;
    } catch (error) {
      console.error('Error starting GPS tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Update the tracking session status to 'completed'
    if (this.trackingSession) {
      const updatedSession = {
        ...this.trackingSession,
        status: 'completed' as const,
        endTime: new Date(),
        endLocation: this.lastKnownLocation ? {
          latitude: this.lastKnownLocation.coords.latitude,
          longitude: this.lastKnownLocation.coords.longitude,
          timestamp: new Date(),
          speed: this.lastKnownLocation.coords.speed || 0,
          heading: this.lastKnownLocation.coords.heading || 0,
          accuracy: this.lastKnownLocation.coords.accuracy || 0,
        } : null,
      };

      this.trackingSession = updatedSession;

      // Save the updated tracking session to Firestore
      if (this.trackingSession.id) {
        await updateDoc(doc(db, 'trackingSessions', this.trackingSession.id), updatedSession);
      }
    }
  }

  private async updateLocation(vehicleId: string, driverId?: string): Promise<void> {
    try {
      let location: Location.LocationObject;

      if (Platform.OS === 'web') {
        // Web geolocation
        location = await this.getWebLocation();
      } else {
        // Mobile location
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 30000,
          distanceInterval: 100,
        });
      }

      this.lastKnownLocation = location;

      const locationData: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(),
        speed: location.coords.speed || 0,
        heading: location.coords.heading || 0,
        accuracy: location.coords.accuracy || 0,
      };

      // Update vehicle location in Firestore
      await this.updateVehicleLocation(vehicleId, locationData);

      // Update driver location if provided
      if (driverId) {
        await this.updateDriverLocation(driverId, locationData);
      }

      // Check geofences
      await this.checkGeofences(vehicleId, driverId, locationData);

      // Generate mock telematics data (in real implementation, this would come from vehicle hardware)
      const telematicsData = this.generateMockTelematicsData(vehicleId, locationData);
      await this.updateVehicleTelematics(vehicleId, telematicsData);

      // Update the tracking session
      if (this.trackingSession && locationData.speed !== undefined) {
        const updatedSession = {
          ...this.trackingSession,
          totalDistance: this.trackingSession.totalDistance + 100,
          totalTime: this.trackingSession.totalTime + 30,
          averageSpeed: (this.trackingSession.totalDistance + 100) / (this.trackingSession.totalTime + 30),
          maxSpeed: Math.max(this.trackingSession.maxSpeed, locationData.speed),
          fuelUsed: this.trackingSession.fuelUsed + 0.1,
        };

        this.trackingSession = updatedSession;

        // Save the updated tracking session to Firestore
        await updateDoc(doc(db, 'trackingSessions', this.trackingSession.id), updatedSession);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  private async getWebLocation(): Promise<Location.LocationObject> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            },
            timestamp: position.timestamp,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  private async updateVehicleLocation(vehicleId: string, location: LocationType): Promise<void> {
    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        currentLocation: location,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating vehicle location:', error);
    }
  }

  private async updateDriverLocation(driverId: string, location: LocationType): Promise<void> {
    try {
      const driverRef = doc(db, 'drivers', driverId);
      await updateDoc(driverRef, {
        currentLocation: location,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  }

  private async updateVehicleTelematics(vehicleId: string, telematics: Partial<VehicleTelematics>): Promise<void> {
    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        telematics: telematics,
        updatedAt: serverTimestamp(),
      });

      // Also save telematics history
      await addDoc(collection(db, 'telematicsHistory'), {
        vehicleId,
        ...telematics,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating vehicle telematics:', error);
    }
  }

  private generateMockTelematicsData(vehicleId: string, location: LocationType): Partial<VehicleTelematics> {
    // In a real implementation, this data would come from vehicle hardware/ELD
    const baseOdometer = 150000; // Base mileage
    const randomVariation = Math.random() * 10;
    
    return {
      odometer: baseOdometer + Math.floor(Math.random() * 50000),
      engineHours: 8500 + Math.floor(Math.random() * 1000),
      fuelLevel: 50 + Math.floor(Math.random() * 50), // 50-100%
      speed: location.speed || (Math.random() * 70), // 0-70 mph
      engineRpm: location.speed ? 1200 + (location.speed * 25) : 800, // RPM based on speed
      batteryVoltage: 12.2 + (Math.random() * 1.6), // 12.2-13.8V
      engineCoolantTemp: 180 + Math.floor(Math.random() * 20), // 180-200°F
      oilPressure: 30 + Math.floor(Math.random() * 20), // 30-50 PSI
      diagnosticCodes: Math.random() > 0.95 ? ['P0420', 'P0171'] : [], // 5% chance of codes
      lastUpdate: new Date(),
    };
  }

  private async checkGeofences(vehicleId: string, driverId: string | undefined, location: LocationType): Promise<void> {
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.coordinates.latitude,
        geofence.coordinates.longitude
      );

      const isInside = distance <= geofence.coordinates.radius;
      
      // Check if this is a new entry/exit event
      const wasInside = await this.wasVehicleInGeofence(vehicleId, geofence.id);
      
      if (isInside && !wasInside && geofence.alertOnEntry) {
        await this.createGeofenceAlert(vehicleId, driverId, geofence, 'entry', location);
      } else if (!isInside && wasInside && geofence.alertOnExit) {
        await this.createGeofenceAlert(vehicleId, driverId, geofence, 'exit', location);
      }

      // Update geofence status
      await this.updateGeofenceStatus(vehicleId, geofence.id, isInside);
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private async wasVehicleInGeofence(vehicleId: string, geofenceId: string): Promise<boolean> {
    // This would typically check the last known geofence status from database
    // For now, returning false to simulate new entry
    return false;
  }

  private async createGeofenceAlert(
    vehicleId: string,
    driverId: string | undefined,
    geofence: Geofence,
    type: 'entry' | 'exit',
    location: LocationType
  ): Promise<void> {
    try {
      const alert: Omit<GeofenceAlert, 'id'> = {
        vehicleId,
        driverId,
        type,
        geofenceName: geofence.name,
        location,
        timestamp: new Date(),
        acknowledged: false,
      };

      await addDoc(collection(db, 'geofenceAlerts'), {
        ...alert,
        timestamp: serverTimestamp(),
      });

      console.log(`Geofence ${type} alert created for vehicle ${vehicleId} at ${geofence.name}`);
    } catch (error) {
      console.error('Error creating geofence alert:', error);
    }
  }

  private async updateGeofenceStatus(vehicleId: string, geofenceId: string, isInside: boolean): Promise<void> {
    // Update the vehicle's current geofence status
    // This would be stored in a separate collection for tracking
  }

  async loadGeofences(companyId: string): Promise<void> {
    // In a real implementation, this would load geofences from Firestore
    this.geofences = [
      {
        id: '1',
        name: 'Main Warehouse',
        type: 'warehouse',
        coordinates: { latitude: 32.7767, longitude: -96.7970, radius: 500 },
        alertOnEntry: true,
        alertOnExit: true,
        companyId,
      },
      {
        id: '2',
        name: 'Customer Site A',
        type: 'customer',
        coordinates: { latitude: 30.2672, longitude: -97.7431, radius: 300 },
        alertOnEntry: true,
        alertOnExit: true,
        companyId,
      },
    ];
  }

  getCurrentLocation(): Location.LocationObject | null {
    return this.lastKnownLocation;
  }

  /**
   * Set geofences for monitoring
   */
  setGeofences(geofences: Geofence[]) {
    this.geofences = geofences;
  }

  async getTrackingSession(vehicleId: string): Promise<TrackingSession | null> {
    try {
      const q = query(collection(db, 'trackingSessions'), where('vehicleId', '==', vehicleId), orderBy('startTime', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      const trackingSession = querySnapshot.docs[0].data() as TrackingSession;
      return trackingSession;
    } catch (error) {
      console.error('Error getting tracking session:', error);
      return null;
    }
  }

  async getRouteOptimization(vehicleId: string): Promise<RouteOptimization | null> {
    try {
      const q = query(collection(db, 'routeOptimizations'), where('vehicleId', '==', vehicleId), orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      const routeOptimization = querySnapshot.docs[0].data() as RouteOptimization;
      return routeOptimization;
    } catch (error) {
      console.error('Error getting route optimization:', error);
      return null;
    }
  }

  async createRouteOptimization(vehicleId: string, stops: LocationType[]): Promise<void> {
    try {
      const routeOptimization = {
        routeId: Math.random().toString(36).substr(2, 9),
        vehicleId,
        stops,
        optimizedOrder: [],
        totalDistance: 0,
        estimatedTime: 0,
        fuelCost: 0,
        efficiency: 0,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'routeOptimizations'), routeOptimization);

      console.log(`Route optimization created for vehicle ${vehicleId}`);
    } catch (error) {
      console.error('Error creating route optimization:', error);
    }
  }
}

export const gpsTrackingService = new GPSTrackingService();
