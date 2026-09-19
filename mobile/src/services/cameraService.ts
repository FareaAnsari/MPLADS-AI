import { Camera, PermissionResponse } from 'expo-camera';
import { logger } from '../utils/logger';

export interface CameraPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class CameraService {
  /**
   * Check current camera permission status.
   */
  static async checkPermission(): Promise<CameraPermissionState> {
    try {
      const response: PermissionResponse = await Camera.getCameraPermissionsAsync();
      return {
        granted: response.granted,
        canAskAgain: response.canAskAgain,
        status: response.status,
      };
    } catch (error) {
      logger.error('CameraService', 'Error checking camera permissions', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    }
  }

  /**
   * Request camera permission from the operating system.
   */
  static async requestPermission(): Promise<CameraPermissionState> {
    try {
      const response: PermissionResponse = await Camera.requestCameraPermissionsAsync();
      return {
        granted: response.granted,
        canAskAgain: response.canAskAgain,
        status: response.status,
      };
    } catch (error) {
      logger.error('CameraService', 'Error requesting camera permissions', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  /**
   * Validate captured photo output.
   */
  static validateCapturedPhoto(photoUri?: string | null): boolean {
    if (!photoUri || typeof photoUri !== 'string' || photoUri.trim().length === 0) {
      return false;
    }
    const cleanUri = photoUri.toLowerCase();
    return (
      cleanUri.startsWith('file://') ||
      cleanUri.startsWith('content://') ||
      cleanUri.startsWith('ph://') ||
      cleanUri.startsWith('data:image/') ||
      cleanUri.includes('camera') ||
      cleanUri.endsWith('.jpg') ||
      cleanUri.endsWith('.jpeg') ||
      cleanUri.endsWith('.png') ||
      cleanUri.endsWith('.webp')
    );
  }
}
