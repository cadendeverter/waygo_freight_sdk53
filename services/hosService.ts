import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { HOSData, HOSViolation, Location } from '../types';

export interface HOSEntry {
  id: string;
  driverId: string;
  date: string; // YYYY-MM-DD format
  status: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  location?: Location;
  vehicle?: string;
  trailer?: string;
  odometer?: number;
  engineHours?: number;
  notes?: string;
  editRequested?: boolean;
  editReason?: string;
  malfunction?: boolean;
  dataSource: 'automatic' | 'manual' | 'assumed';
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HOSLimits {
  drive: number;      // 11 hours
  onDuty: number;     // 14 hours
  shift: number;      // 14 hours
  cycle: number;      // 70 hours (8 days)
  break: number;      // 30 minutes
  off: number;        // 10 hours
  sleeper: number;    // 10 hours (can be split)
}

export interface HOSRuleSet {
  interstate: HOSLimits;
  intrastate_ca: HOSLimits;
  intrastate_tx: HOSLimits;
  canada: HOSLimits;
}

export interface HOSCalculation {
  drive: {
    used: number;
    remaining: number;
    limit: number;
  };
  onDuty: {
    used: number;
    remaining: number;
    limit: number;
  };
  shift: {
    used: number;
    remaining: number;
    limit: number;
  };
  cycle: {
    used: number;
    remaining: number;
    limit: number;
  };
  violations: HOSViolation[];
  nextBreakRequired?: Date;
  nextRestRequired?: Date;
  canDrive: boolean;
  canWork: boolean;
}

class HOSService {
  private readonly HOS_RULES: HOSRuleSet = {
    interstate: {
      drive: 11 * 60,      // 11 hours
      onDuty: 14 * 60,     // 14 hours
      shift: 14 * 60,      // 14 hours
      cycle: 70 * 60,      // 70 hours
      break: 30,           // 30 minutes
      off: 10 * 60,        // 10 hours
      sleeper: 10 * 60,    // 10 hours
    },
    intrastate_ca: {
      drive: 12 * 60,      // 12 hours (California)
      onDuty: 16 * 60,     // 16 hours
      shift: 16 * 60,      // 16 hours
      cycle: 80 * 60,      // 80 hours
      break: 30,           // 30 minutes
      off: 8 * 60,         // 8 hours
      sleeper: 8 * 60,     // 8 hours
    },
    intrastate_tx: {
      drive: 12 * 60,      // 12 hours (Texas)
      onDuty: 15 * 60,     // 15 hours
      shift: 15 * 60,      // 15 hours
      cycle: 70 * 60,      // 70 hours
      break: 30,           // 30 minutes
      off: 8 * 60,         // 8 hours
      sleeper: 8 * 60,     // 8 hours
    },
    canada: {
      drive: 13 * 60,      // 13 hours (Canada)
      onDuty: 14 * 60,     // 14 hours
      shift: 14 * 60,      // 14 hours
      cycle: 70 * 60,      // 70 hours
      break: 30,           // 30 minutes
      off: 8 * 60,         // 8 hours
      sleeper: 8 * 60,     // 8 hours
    },
  };

  async startDutyStatus(
    driverId: string,
    status: HOSEntry['status'],
    location?: Location,
    vehicle?: string,
    trailer?: string,
    odometer?: number,
    engineHours?: number,
    notes?: string
  ): Promise<HOSEntry> {
    try {
      // End current duty status
      await this.endCurrentDutyStatus(driverId);

      // Create new duty status entry
      const entry: Omit<HOSEntry, 'id'> = {
        driverId,
        date: new Date().toISOString().split('T')[0],
        status,
        startTime: new Date(),
        location,
        vehicle,
        trailer,
        odometer,
        engineHours,
        notes,
        dataSource: 'manual',
        sequence: await this.getNextSequence(driverId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'hosEntries'), {
        ...entry,
        startTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...entry,
      };
    } catch (error) {
      console.error('Error starting duty status:', error);
      throw error;
    }
  }

  async endCurrentDutyStatus(driverId: string): Promise<void> {
    try {
      const currentEntry = await this.getCurrentDutyStatus(driverId);
      if (currentEntry && !currentEntry.endTime) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - currentEntry.startTime.getTime()) / 60000);

        await updateDoc(doc(db, 'hosEntries', currentEntry.id), {
          endTime: serverTimestamp(),
          duration,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error ending current duty status:', error);
    }
  }

  async getCurrentDutyStatus(driverId: string): Promise<HOSEntry | null> {
    try {
      const q = query(
        collection(db, 'hosEntries'),
        where('driverId', '==', driverId),
        orderBy('startTime', 'desc')
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime?.toDate(),
          endTime: doc.data().endTime?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as HOSEntry;
      }
      return null;
    } catch (error) {
      console.error('Error getting current duty status:', error);
      return null;
    }
  }

  async getHOSEntries(driverId: string, startDate: Date, endDate: Date): Promise<HOSEntry[]> {
    try {
      const q = query(
        collection(db, 'hosEntries'),
        where('driverId', '==', driverId),
        where('startTime', '>=', startDate),
        where('startTime', '<=', endDate),
        orderBy('startTime', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as HOSEntry[];
    } catch (error) {
      console.error('Error getting HOS entries:', error);
      return [];
    }
  }

  async calculateHOS(
    driverId: string,
    ruleSet: keyof HOSRuleSet = 'interstate'
  ): Promise<HOSCalculation> {
    try {
      const rules = this.HOS_RULES[ruleSet];
      const now = new Date();
      const last8Days = new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000));
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Get HOS entries for last 8 days
      const entries = await this.getHOSEntries(driverId, last8Days, now);
      
      // Calculate current day totals
      const todayEntries = entries.filter(entry => 
        entry.startTime >= today
      );

      const driveTime = this.calculateTotalTime(todayEntries, 'driving');
      const onDutyTime = this.calculateTotalTime(todayEntries, ['on_duty', 'driving']);
      
      // Calculate shift time (from first on-duty to now or last off-duty)
      const shiftTime = this.calculateShiftTime(todayEntries);
      
      // Calculate 8-day cycle
      const cycleTime = this.calculateCycleTime(entries);

      // Check for violations
      const violations = this.checkViolations(entries, rules, ruleSet);

      // Calculate next required breaks/rest
      const nextBreakRequired = this.calculateNextBreakRequired(todayEntries, rules);
      const nextRestRequired = this.calculateNextRestRequired(todayEntries, rules);

      return {
        drive: {
          used: driveTime,
          remaining: Math.max(0, rules.drive - driveTime),
          limit: rules.drive,
        },
        onDuty: {
          used: onDutyTime,
          remaining: Math.max(0, rules.onDuty - onDutyTime),
          limit: rules.onDuty,
        },
        shift: {
          used: shiftTime,
          remaining: Math.max(0, rules.shift - shiftTime),
          limit: rules.shift,
        },
        cycle: {
          used: cycleTime,
          remaining: Math.max(0, rules.cycle - cycleTime),
          limit: rules.cycle,
        },
        violations,
        nextBreakRequired,
        nextRestRequired,
        canDrive: this.canDrive(driveTime, onDutyTime, shiftTime, cycleTime, rules, violations),
        canWork: this.canWork(onDutyTime, shiftTime, cycleTime, rules, violations),
      };
    } catch (error) {
      console.error('Error calculating HOS:', error);
      throw error;
    }
  }

  private calculateTotalTime(entries: HOSEntry[], statuses: string | string[]): number {
    const statusArray = Array.isArray(statuses) ? statuses : [statuses];
    return entries
      .filter(entry => statusArray.includes(entry.status))
      .reduce((total, entry) => {
        if (entry.endTime) {
          return total + (entry.duration || 0);
        } else {
          // Current ongoing entry
          const duration = Math.floor((new Date().getTime() - entry.startTime.getTime()) / 60000);
          return total + duration;
        }
      }, 0);
  }

  private calculateShiftTime(entries: HOSEntry[]): number {
    if (entries.length === 0) return 0;

    const firstOnDuty = entries.find(entry => 
      entry.status === 'on_duty' || entry.status === 'driving'
    );

    if (!firstOnDuty) return 0;

    const lastOffDuty = entries
      .filter(entry => entry.status === 'off_duty' || entry.status === 'sleeper_berth')
      .reverse()[0];

    const endTime = lastOffDuty?.endTime || new Date();
    return Math.floor((endTime.getTime() - firstOnDuty.startTime.getTime()) / 60000);
  }

  private calculateCycleTime(entries: HOSEntry[]): number {
    return entries
      .filter(entry => entry.status === 'on_duty' || entry.status === 'driving')
      .reduce((total, entry) => total + (entry.duration || 0), 0);
  }

  private checkViolations(
    entries: HOSEntry[],
    rules: HOSLimits,
    ruleSet: keyof HOSRuleSet
  ): HOSViolation[] {
    const violations: HOSViolation[] = [];
    
    // Check for various violations
    // This is a simplified implementation - real ELD systems have more complex violation detection
    
    const todayEntries = entries.filter(entry => 
      entry.startTime >= new Date(new Date().setHours(0, 0, 0, 0))
    );

    const driveTime = this.calculateTotalTime(todayEntries, 'driving');
    const onDutyTime = this.calculateTotalTime(todayEntries, ['on_duty', 'driving']);

    if (driveTime > rules.drive) {
      violations.push({
        id: `drive_${Date.now()}`,
        type: 'DAILY_DRIVING_LIMIT',
        description: `Drive time exceeded ${rules.drive / 60} hours`,
        timestamp: new Date(),
        severity: 'critical',
        resolved: false,
      });
    }

    if (onDutyTime > rules.onDuty) {
      violations.push({
        id: `duty_${Date.now()}`,
        type: 'ON_DUTY_LIMIT',
        description: `On-duty time exceeded ${rules.onDuty / 60} hours`,
        timestamp: new Date(),
        severity: 'critical',
        resolved: false,
      });
    }

    return violations;
  }

  private calculateNextBreakRequired(entries: HOSEntry[], rules: HOSLimits): Date | undefined {
    const driveTime = this.calculateTotalTime(entries, 'driving');
    const lastBreak = this.getLastBreak(entries);
    
    if (driveTime >= 8 * 60 && !lastBreak) {
      // 30-minute break required after 8 hours of driving
      return new Date(Date.now() + 30 * 60 * 1000);
    }
    
    return undefined;
  }

  private calculateNextRestRequired(entries: HOSEntry[], rules: HOSLimits): Date | undefined {
    const shiftTime = this.calculateShiftTime(entries);
    
    if (shiftTime >= rules.shift) {
      return new Date(Date.now() + rules.off * 60 * 1000);
    }
    
    return undefined;
  }

  private getLastBreak(entries: HOSEntry[]): HOSEntry | undefined {
    return entries
      .filter(entry => 
        entry.status === 'off_duty' && 
        (entry.duration || 0) >= 30
      )
      .reverse()[0];
  }

  private canDrive(
    driveTime: number,
    onDutyTime: number,
    shiftTime: number,
    cycleTime: number,
    rules: HOSLimits,
    violations: HOSViolation[]
  ): boolean {
    return (
      driveTime < rules.drive &&
      onDutyTime < rules.onDuty &&
      shiftTime < rules.shift &&
      cycleTime < rules.cycle &&
      violations.filter(v => v.severity === 'critical').length === 0
    );
  }

  private canWork(
    onDutyTime: number,
    shiftTime: number,
    cycleTime: number,
    rules: HOSLimits,
    violations: HOSViolation[]
  ): boolean {
    return (
      onDutyTime < rules.onDuty &&
      shiftTime < rules.shift &&
      cycleTime < rules.cycle &&
      violations.filter(v => v.severity === 'critical').length === 0
    );
  }

  private async getNextSequence(driverId: string): Promise<number> {
    const q = query(
      collection(db, 'hosEntries'),
      where('driverId', '==', driverId),
      orderBy('sequence', 'desc')
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const lastEntry = snapshot.docs[0].data();
      return (lastEntry.sequence || 0) + 1;
    }
    return 1;
  }

  async requestEdit(
    entryId: string,
    reason: string,
    newStatus?: HOSEntry['status'],
    newStartTime?: Date,
    newEndTime?: Date
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'hosEntries', entryId), {
        editRequested: true,
        editReason: reason,
        requestedStatus: newStatus,
        requestedStartTime: newStartTime,
        requestedEndTime: newEndTime,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error requesting edit:', error);
      throw error;
    }
  }

  async exportHOSData(driverId: string, startDate: Date, endDate: Date): Promise<string> {
    try {
      const entries = await this.getHOSEntries(driverId, startDate, endDate);
      
      // Convert to ELD file format (simplified)
      const eldData = {
        driver: driverId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        entries: entries.map(entry => ({
          date: entry.date,
          sequence: entry.sequence,
          status: entry.status,
          startTime: entry.startTime.toISOString(),
          endTime: entry.endTime?.toISOString(),
          duration: entry.duration,
          location: entry.location,
          vehicle: entry.vehicle,
          odometer: entry.odometer,
          engineHours: entry.engineHours,
          dataSource: entry.dataSource,
        })),
      };

      return JSON.stringify(eldData, null, 2);
    } catch (error) {
      console.error('Error exporting HOS data:', error);
      throw error;
    }
  }
}

export const hosService = new HOSService();
