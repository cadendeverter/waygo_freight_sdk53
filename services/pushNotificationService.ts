// waygo-freight/services/pushNotificationService.ts
import { Alert } from 'react-native';

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

interface NotificationPermissions {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private permissionStatus: string = 'undetermined';
  private listeners: Map<string, (notification: any) => void> = new Map();

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private async initialize() {
    try {
      console.log('Initializing Push Notification Service...');
      // In a real app, you would initialize expo-notifications here
      // await Notifications.setNotificationHandler({
      //   handleNotification: async () => ({
      //     shouldShowAlert: true,
      //     shouldPlaySound: true,
      //     shouldSetBadge: false,
      //   }),
      // });
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  public async requestPermissions(): Promise<NotificationPermissions> {
    try {
      console.log('Requesting notification permissions...');
      
      // Simulate permission request
      // In a real app, you would use:
      // const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      
      const mockPermission: NotificationPermissions = {
        status: 'granted',
        canAskAgain: true
      };

      this.permissionStatus = mockPermission.status;
      return mockPermission;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { status: 'denied', canAskAgain: false };
    }
  }

  public async sendNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (this.permissionStatus !== 'granted') {
        console.log('Notifications not permitted, showing alert instead');
        Alert.alert(notification.title, notification.body);
        return null;
      }

      console.log('Sending notification:', notification);
      
      // In a real app, you would use:
      // const notificationId = await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: notification.title,
      //     body: notification.body,
      //     data: notification.data,
      //     sound: notification.sound !== false,
      //     priority: notification.priority || 'high',
      //   },
      //   trigger: null, // Send immediately
      // });

      // Simulate notification ID
      const notificationId = `notification_${Date.now()}`;
      
      // Trigger local listeners
      this.listeners.forEach((listener) => {
        listener({
          identifier: notificationId,
          content: notification,
          date: new Date().getTime()
        });
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  public addNotificationListener(id: string, listener: (notification: any) => void) {
    this.listeners.set(id, listener);
    console.log(`Added notification listener: ${id}`);
  }

  public removeNotificationListener(id: string) {
    this.listeners.delete(id);
    console.log(`Removed notification listener: ${id}`);
  }

  public async sendAlertNotification(alert: {
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    driverName?: string;
    location?: string;
  }) {
    const priorityMap = {
      'LOW': 'normal' as const,
      'MEDIUM': 'normal' as const,
      'HIGH': 'high' as const,
      'CRITICAL': 'high' as const
    };

    const notification: NotificationData = {
      title: `${alert.severity} Alert: ${alert.title}`,
      body: alert.description + (alert.driverName ? ` (Driver: ${alert.driverName})` : ''),
      data: {
        type: 'alert',
        severity: alert.severity,
        location: alert.location,
        timestamp: new Date().toISOString()
      },
      priority: priorityMap[alert.severity],
      sound: alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
    };

    return this.sendNotification(notification);
  }

  public async sendDeliveryNotification(delivery: {
    loadNumber: string;
    status: 'picked_up' | 'in_transit' | 'delivered' | 'delayed';
    driverName: string;
    eta?: Date;
  }) {
    const statusMessages = {
      'picked_up': 'Load has been picked up',
      'in_transit': 'Load is in transit',
      'delivered': 'Load has been delivered',
      'delayed': 'Load delivery is delayed'
    };

    const notification: NotificationData = {
      title: `Load ${delivery.loadNumber}`,
      body: `${statusMessages[delivery.status]} by ${delivery.driverName}`,
      data: {
        type: 'delivery',
        loadNumber: delivery.loadNumber,
        status: delivery.status,
        timestamp: new Date().toISOString()
      },
      priority: delivery.status === 'delayed' ? 'high' : 'normal'
    };

    return this.sendNotification(notification);
  }

  public async sendMaintenanceNotification(maintenance: {
    vehicleNumber: string;
    type: 'due' | 'overdue' | 'completed';
    serviceType: string;
    dueDate?: Date;
  }) {
    const notification: NotificationData = {
      title: `Vehicle ${maintenance.vehicleNumber} Maintenance`,
      body: `${maintenance.serviceType} is ${maintenance.type}`,
      data: {
        type: 'maintenance',
        vehicleNumber: maintenance.vehicleNumber,
        serviceType: maintenance.serviceType,
        timestamp: new Date().toISOString()
      },
      priority: maintenance.type === 'overdue' ? 'high' : 'normal'
    };

    return this.sendNotification(notification);
  }

  public getPermissionStatus(): string {
    return this.permissionStatus;
  }
}

export default PushNotificationService.getInstance();
