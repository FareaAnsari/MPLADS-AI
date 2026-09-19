import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { RemoteNotificationRepository } from '../data/repositories/RemoteNotificationRepository';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


const notificationRepository = new RemoteNotificationRepository();

export interface NotificationPayloadData {
  notificationId?: string;
  type?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  deepLink?: string;
}

export class NotificationService {
  private static isInitialized = false;
  private static registeredToken: string | null = null;
  private static currentDeviceId: string | null = null;

  /**
   * Initializes notification channels and listeners.
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Configure Android notification channels
    if (Platform.OS === 'android') {
      await this.configureAndroidChannels();
    }

    this.setupListeners();
    this.isInitialized = true;
    logger.info('NotificationService', 'Notification service initialized');
  }

  /**
   * Configure Android Notification Channels for categorized delivery
   */
  static async configureAndroidChannels(): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync('critical-alerts', {
        name: 'Critical Operational Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DC2626',
      });

      await Notifications.setNotificationChannelAsync('evidence-channel', {
        name: 'Citizen Evidence Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#2563EB',
      });

      await Notifications.setNotificationChannelAsync('project-channel', {
        name: 'Project Milestones & Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#0D9488',
      });

      await Notifications.setNotificationChannelAsync('system-channel', {
        name: 'System Notices',
        importance: Notifications.AndroidImportance.LOW,
      });
    } catch (error) {
      logger.warn('NotificationService', 'Failed to configure Android notification channels', error);
    }
  }

  /**
   * Request system push notification permission with clear rationale
   */
  static async requestPermissions(): Promise<{ granted: boolean; status: string; isSimulator: boolean }> {
    if (!Device.isDevice) {
      logger.warn('NotificationService', 'Must use physical device for real push notifications');
      return { granted: false, status: 'simulator', isSimulator: true };
    }

    try {
      const existingStatus = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus.status;

      if (existingStatus.status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }

      return {
        granted: finalStatus === 'granted',
        status: finalStatus,
        isSimulator: false,
      };
    } catch (error) {
      logger.error('NotificationService', 'Error requesting notification permissions', error);
      return { granted: false, status: 'error', isSimulator: false };
    }
  }

  /**
   * Obtains device push token and registers it with the backend for the active user.
   */
  static async registerDeviceForPush(): Promise<string | null> {
    const authState = useAuthStore.getState();
    if (authState.status !== 'AUTHENTICATED' || !authState.user) {
      logger.warn('NotificationService', 'Cannot register device push token without active authenticated session');
      return null;
    }

    const { granted, isSimulator } = await this.requestPermissions();
    if (!granted || isSimulator) {
      logger.info('NotificationService', 'Push permission not granted or simulator environment - skipping remote token registration');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      const deviceId = Device.osInternalBuildId || `dev-${Platform.OS}-${authState.user.id.slice(0, 8)}`;
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

      await notificationRepository.registerDevice({
        pushToken,
        deviceId,
        platform,
        appVersion: '1.0.0',
      });

      this.registeredToken = pushToken;
      this.currentDeviceId = deviceId;
      logger.info('NotificationService', `Push token registered successfully for user ${authState.user.id}`);
      return pushToken;
    } catch (error) {
      logger.error('NotificationService', 'Failed to obtain or register push token', error);
      return null;
    }
  }

  /**
   * Unregisters device token upon user logout to prevent cross-account notification leakages.
   */
  static async unregisterDeviceOnLogout(): Promise<void> {
    if (!this.currentDeviceId) return;

    try {
      await notificationRepository.unregisterDevice(this.currentDeviceId);
      logger.info('NotificationService', `Device ${this.currentDeviceId} unregistered on logout`);
    } catch (error) {
      logger.warn('NotificationService', 'Failed to unregister device on backend logout', error);
    } finally {
      this.registeredToken = null;
      this.currentDeviceId = null;
    }
  }

  /**
   * Set up foreground and notification tap listeners
   */
  private static setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    Notifications.addNotificationReceivedListener((notification) => {
      logger.info('NotificationService', 'Received foreground notification', notification.request.content.title);
    });

    // Listener for user tapping/interacting with notification banner
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationPayloadData;
      logger.info('NotificationService', 'User tapped notification', data);
      this.handleNotificationNavigation(data);
    });
  }

  /**
   * Centralized Notification Router with strict Role-Based Access Control (RBAC)
   */
  static handleNotificationNavigation(data: NotificationPayloadData): boolean {
    const authState = useAuthStore.getState();
    const currentUser = authState.user;
    const isAuthenticated = authState.status === 'AUTHENTICATED' && !!currentUser;

    if (!isAuthenticated || !currentUser) {
      logger.warn('NotificationRouter', 'Notification tap rejected - user not authenticated. Redirecting to login.');
      router.push('/(auth)/login');
      return false;
    }

    const { entityType, entityId, deepLink } = data;

    // 1. Direct explicit deep link parsing
    if (deepLink) {
      return this.dispatchSafeDeepLink(deepLink, currentUser.role);
    }

    // 2. Entity-based fallback routing
    if (entityType && entityId) {
      return this.dispatchEntityRoute(entityType, entityId, currentUser.role);
    }

    // Default: Navigate to Notification Center
    router.push('/notifications');
    return true;
  }

  /**
   * Validates and executes a safe deep link according to user role
   */
  private static dispatchSafeDeepLink(url: string, userRole: string): boolean {
    // Clean protocol prefix
    const path = url.replace(/^[a-zA-Z0-9_-]+:\/\//, '').replace(/^\/+/, '');

    // Strict RBAC Guard: Citizens & Contractors cannot access officer-only routes
    if (path.startsWith('officer/') && userRole !== 'DISTRICT_OFFICER') {
      logger.warn('NotificationRouter', `Security rejection: ${userRole} attempted privileged route ${path}`);
      router.push('/notifications');
      return false;
    }

    // Strict RBAC Guard: Citizens & Contractors cannot access MP-only routes
    if (path.startsWith('mp/') && userRole !== 'MP_OFFICE') {
      logger.warn('NotificationRouter', `Security rejection: ${userRole} attempted MP-only route ${path}`);
      router.push('/notifications');
      return false;
    }

    // Strict RBAC Guard: Non-Contractors cannot access contractor routes
    if (path.startsWith('contractor/') && userRole !== 'CONTRACTOR') {
      logger.warn('NotificationRouter', `Security rejection: ${userRole} attempted contractor route ${path}`);
      router.push('/notifications');
      return false;
    }

    // Contractor routes
    if (path.startsWith('contractor/')) {
      const parts = path.split('/');
      if (parts[1] === 'projects' && parts[2]) {
        router.push(`/(contractor)/projects/${parts[2]}` as any);
        return true;
      }
      if (parts[1] === 'projects') {
        router.push('/(contractor)/projects' as any);
        return true;
      }
      router.push('/(contractor)' as any);
      return true;
    }

    // Citizens routes
    if (path.startsWith('citizen/')) {
      const parts = path.split('/');
      if (parts[1] === 'projects' && parts[2]) {
        router.push(`/(citizen)/projects/${parts[2]}` as any);
        return true;
      }
      if (parts[1] === 'evidence') {
        router.push('/(citizen)/evidence/submit' as any);
        return true;
      }
    }

    // Officer routes
    if (path.startsWith('officer/')) {
      const parts = path.split('/');
      if (parts[1] === 'evidence') {
        router.push('/(officer)/evidence-review' as any);
        return true;
      }
      if (parts[1] === 'risk' && parts[2]) {
        router.push(`/(officer)/risk/${parts[2]}` as any);
        return true;
      }
      if (parts[1] === 'sla') {
        router.push('/(officer)/projects' as any);
        return true;
      }
    }

    // MP Office routes
    if (path.startsWith('mp/')) {
      const parts = path.split('/');
      if (parts[1] === 'projects' && parts[2]) {
        router.push(`/(mp)/projects/${parts[2]}` as any);
        return true;
      }
      if (parts[1] === 'projects') {
        router.push('/(mp)/projects' as any);
        return true;
      }
      router.push('/(mp)' as any);
      return true;
    }

    // Fallback: Notifications screen
    router.push('/notifications');
    return true;
  }

  /**
   * Resolves entity-type navigation targets
   */
  private static dispatchEntityRoute(entityType: string, entityId: string, userRole: string): boolean {
    switch (entityType.toLowerCase()) {
      case 'evidence':
        if (userRole === 'DISTRICT_OFFICER') {
          router.push('/(officer)/evidence-review' as any);
          return true;
        }
        if (userRole === 'MP_OFFICE') {
          router.push('/(mp)/projects' as any);
          return true;
        }
        if (userRole === 'CONTRACTOR') {
          router.push(`/(contractor)/projects/${entityId}` as any);
          return true;
        }
        router.push('/(citizen)/evidence/submit' as any);
        return true;

      case 'risk':
        if (userRole === 'DISTRICT_OFFICER') {
          router.push(`/(officer)/risk/${entityId}` as any);
          return true;
        }
        if (userRole === 'MP_OFFICE') {
          router.push(`/(mp)/projects/${entityId}` as any);
          return true;
        }
        if (userRole === 'CONTRACTOR') {
          router.push(`/(contractor)/projects/${entityId}` as any);
          return true;
        }
        // Citizens cannot access raw risk intelligence screens
        router.push(`/(citizen)/projects/${entityId}` as any);
        return true;

      case 'project':
        if (userRole === 'DISTRICT_OFFICER') {
          router.push('/(officer)/projects' as any);
          return true;
        }
        if (userRole === 'MP_OFFICE') {
          router.push(`/(mp)/projects/${entityId}` as any);
          return true;
        }
        if (userRole === 'CONTRACTOR') {
          router.push(`/(contractor)/projects/${entityId}` as any);
          return true;
        }
        router.push(`/(citizen)/projects/${entityId}` as any);
        return true;

      default:
        router.push('/notifications');
        return true;
    }
  }

}
