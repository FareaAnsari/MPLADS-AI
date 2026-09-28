import * as LocalAuthentication from 'expo-local-authentication';
import { logger } from '../../utils/logger';

export interface BiometricCapability {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
}

export class BiometricService {
  async checkAvailability(): Promise<BiometricCapability> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      const supportedTypes = types.map((t) => {
        if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return 'FaceID';
        if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) return 'Fingerprint';
        if (t === LocalAuthentication.AuthenticationType.IRIS) return 'Iris';
        return 'Biometric';
      });

      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes,
      };
    } catch (error) {
      logger.error('BiometricService', 'Failed to inspect biometric capability', error);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  async authenticateForReEntry(reason = 'Verify statutory officer identity to unlock session'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        logger.info('BiometricService', 'Biometric re-entry verification succeeded');
        return true;
      }

      logger.warn('BiometricService', `Biometric verification failed: ${result.error}`);
      return false;
    } catch (error) {
      logger.error('BiometricService', 'Error during biometric authentication prompt', error);
      return false;
    }
  }
}

export const biometricService = new BiometricService();
