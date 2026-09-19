import * as Location from 'expo-location';
import { logger } from '../utils/logger';

export interface LocationPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  altitudeMeters: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export class LocationService {
  /**
   * Check foreground location permission status.
   */
  static async checkPermission(): Promise<LocationPermissionState> {
    try {
      const response = await Location.getForegroundPermissionsAsync();
      return {
        granted: response.granted,
        canAskAgain: response.canAskAgain,
        status: response.status,
      };
    } catch (error) {
      logger.error('LocationService', 'Error checking location permissions', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    }
  }

  /**
   * Request foreground location permission.
   */
  static async requestPermission(): Promise<LocationPermissionState> {
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      return {
        granted: response.granted,
        canAskAgain: response.canAskAgain,
        status: response.status,
      };
    } catch (error) {
      logger.error('LocationService', 'Error requesting location permissions', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  /**
   * Check if location services are enabled on the device.
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      logger.error('LocationService', 'Error checking if location is enabled', error);
      return false;
    }
  }

  /**
   * Acquire high-accuracy device location with a timeout.
   */
  static async getCurrentPosition(options?: {
    timeoutMs?: number;
  }): Promise<GeoCoordinates> {
    const timeoutMs = options?.timeoutMs || 10000;

    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Location acquisition timed out after 10s.')), timeoutMs);
    });

    try {
      const location = await Promise.race([locationPromise, timeoutPromise]);
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracyMeters: location.coords.accuracy !== null ? location.coords.accuracy : null,
        altitudeMeters: location.coords.altitude !== null ? location.coords.altitude : null,
        heading: location.coords.heading !== null ? location.coords.heading : null,
        speed: location.coords.speed !== null ? location.coords.speed : null,
        timestamp: location.timestamp,
      };
    } catch (error: any) {
      logger.error('LocationService', 'Failed to obtain current position', error);
      throw error;
    }
  }

  /**
   * Calculates Haversine distance in meters between two coordinates.
   * NOTE: This is for client-side visual context only. The backend is the authoritative spatial verification engine.
   */
  static calculateHaversineDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c * 10) / 10;
  }
}
