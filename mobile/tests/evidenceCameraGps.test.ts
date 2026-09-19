import { CameraService } from '../src/services/cameraService';
import { LocationService } from '../src/services/locationService';
import { ImageService } from '../src/services/imageService';
import { SubmitCitizenEvidenceUseCase } from '../src/domain/usecases/citizenUseCases';
import { ICitizenRepository } from '../src/domain/interfaces';
import {
  CitizenEvidenceEntity,
  EvidenceVerificationResultEntity,
} from '../src/domain/entities';
import { t, DICTIONARIES } from '../src/i18n';
import { useAppStore } from '../src/store/appStore';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

// Mock expo-camera and expo-location
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
  CameraView: () => null,
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    High: 4,
    Balanced: 3,
    Low: 1,
  },
}));

describe('Phase 9 — Evidence, Camera, GPS & Maps Hardware Integration Tests', () => {
  let mockCitizenRepo: jest.Mocked<ICitizenRepository>;

  const sampleEvidence: CitizenEvidenceEntity = {
    projectId: 'WRK-2024-001',
    latitude: 25.0961,
    longitude: 85.3131,
    accuracyMeters: 12.5,
    timestampCaptured: '2026-09-19T12:00:00.000Z',
    isLiveCameraCapture: true,
    imageUri: 'file:///var/mobile/Containers/Data/Application/photos/photo_001.jpg',
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  };

  const sampleVerificationResult: EvidenceVerificationResultEntity = {
    evidenceId: 'ev-101',
    projectId: 'WRK-2024-001',
    distanceToProjectMeters: 32.4,
    locationVerified: true,
    duplicateDetected: false,
    verificationStatus: 'VERIFIED_COGNIZANT',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ language: 'en' });

    mockCitizenRepo = {
      submitEvidence: jest.fn().mockResolvedValue(sampleVerificationResult),
      getEvidenceHistory: jest.fn(),
    };
  });

  describe('CameraService & Native Image Validation', () => {
    it('checks camera permission status correctly', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });

      const perm = await CameraService.checkPermission();
      expect(perm.granted).toBe(true);
      expect(perm.status).toBe('granted');
    });

    it('requests camera permission when undetermined', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });

      const perm = await CameraService.requestPermission();
      expect(perm.granted).toBe(true);
    });

    it('validates photo URIs accurately', () => {
      expect(CameraService.validateCapturedPhoto('file:///data/user/0/app/cache/photo.jpg')).toBe(true);
      expect(CameraService.validateCapturedPhoto('ph://photos/asset.png')).toBe(true);
      expect(CameraService.validateCapturedPhoto('data:image/jpeg;base64,...')).toBe(true);
      expect(CameraService.validateCapturedPhoto('')).toBe(false);
      expect(CameraService.validateCapturedPhoto(null as any)).toBe(false);
      expect(CameraService.validateCapturedPhoto('   ')).toBe(false);
    });

    it('validates image formats via ImageService', () => {
      expect(ImageService.validateImage('file:///tmp/capture.jpeg').valid).toBe(true);
      expect(ImageService.validateImage('file:///tmp/capture.png').valid).toBe(true);
      expect(ImageService.validateImage('file:///tmp/doc.pdf').valid).toBe(false);
      expect(ImageService.validateImage('').valid).toBe(false);
    });

    it('safely strips base64 header prefixes', () => {
      const raw = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=';
      expect(ImageService.cleanBase64(raw)).toBe('iVBORw0KGgoAAAANSUhEUgAAAAE=');
      expect(ImageService.cleanBase64('rawbase64string')).toBe('rawbase64string');
      expect(ImageService.cleanBase64(null)).toBeNull();
    });
  });

  describe('LocationService & GPS Accuracy', () => {
    it('checks foreground location permission', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });

      const perm = await LocationService.checkPermission();
      expect(perm.granted).toBe(true);
    });

    it('requests location permission from device OS', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });

      const perm = await LocationService.requestPermission();
      expect(perm.granted).toBe(true);
    });

    it('checks if device location service is turned on', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValueOnce(true);
      const isEnabled = await LocationService.isLocationEnabled();
      expect(isEnabled).toBe(true);
    });

    it('acquires high accuracy GPS coordinates with accuracy metrics', async () => {
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
        coords: {
          latitude: 25.0961,
          longitude: 85.3131,
          accuracy: 14.2,
          altitude: 45.0,
          heading: 180,
          speed: 0,
        },
        timestamp: 1726747200000,
      });

      const pos = await LocationService.getCurrentPosition();
      expect(pos.latitude).toBe(25.0961);
      expect(pos.longitude).toBe(85.3131);
      expect(pos.accuracyMeters).toBe(14.2);
    });

    it('calculates Haversine geodesic distance in meters accurately for visual context', () => {
      // Same point -> 0 meters
      const d0 = LocationService.calculateHaversineDistanceMeters(25.0961, 85.3131, 25.0961, 85.3131);
      expect(d0).toBe(0);

      // Known coordinates delta (~111 km for 1 deg latitude)
      const d1 = LocationService.calculateHaversineDistanceMeters(25.0, 85.0, 26.0, 85.0);
      expect(Math.round(d1 / 1000)).toBe(111);
    });
  });

  describe('Citizen Evidence Submission Use Case', () => {
    it('submits ground evidence with GPS location and live camera flag', async () => {
      const useCase = new SubmitCitizenEvidenceUseCase(mockCitizenRepo);
      const result = await useCase.execute(sampleEvidence);

      expect(mockCitizenRepo.submitEvidence).toHaveBeenCalledWith(sampleEvidence);
      expect(result.evidenceId).toBe('ev-101');
      expect(result.locationVerified).toBe(true);
      expect(result.distanceToProjectMeters).toBe(32.4);
    });

    it('throws validation error when projectId is empty', async () => {
      const useCase = new SubmitCitizenEvidenceUseCase(mockCitizenRepo);
      await expect(
        useCase.execute({ ...sampleEvidence, projectId: '' })
      ).rejects.toThrow('Project ID is required');
    });

    it('throws validation error when coordinates are missing or invalid', async () => {
      const useCase = new SubmitCitizenEvidenceUseCase(mockCitizenRepo);
      await expect(
        useCase.execute({ ...sampleEvidence, latitude: NaN })
      ).rejects.toThrow('Valid GPS latitude and longitude');
    });
  });

  describe('Localization Parity for Evidence, Camera, GPS & Maps', () => {
    it('provides all evidence dictionary keys in both English and Hindi', () => {
      const enEvidence = DICTIONARIES['en-IN'].evidence;
      const hiEvidence = DICTIONARIES['hi-IN'].evidence;

      expect(enEvidence).toBeDefined();
      expect(hiEvidence).toBeDefined();

      const keys = Object.keys(enEvidence) as (keyof typeof enEvidence)[];
      keys.forEach((key) => {
        expect(hiEvidence[key]).toBeDefined();
        expect(typeof hiEvidence[key]).toBe('string');
        expect((hiEvidence[key] as string).trim().length).toBeGreaterThan(0);
      });
    });

    it('translates camera and GPS actions accurately in Hindi', () => {
      useAppStore.setState({ language: 'hi' });
      expect(t('evidence.cameraTitle')).toBe('वैधानिक ग्राउंड कैमरा');
      expect(t('evidence.capturePhoto')).toBe('साक्ष्य फोटो खींचें');
      expect(t('evidence.retakePhoto')).toBe('पुनः फोटो लें');
      expect(t('evidence.locationTitle')).toBe('जीपीएस (GPS) स्थल सत्यापन');
      expect(t('evidence.mapTitle')).toBe('भू-स्थानिक स्थल मानचित्र');
      expect(t('evidence.confirmAndSubmit')).toBe('साक्ष्य की पुष्टि करें एवं जमा करें');
    });
  });

  describe('Accessibility & Text Alternatives', () => {
    it('provides text alternative labels for map rendering', () => {
      expect(t('evidence.mapTextAlternative')).toBeDefined();
      expect(t('evidence.mapTextAlternative').length).toBeGreaterThan(10);
    });

    it('does not rely solely on color for verification status', () => {
      const verifiedText = t('evidence.verifiedMatch');
      const inconsistentText = t('evidence.locationInconsistent');
      expect(verifiedText).toContain('Location-Consistent');
      expect(inconsistentText).toContain('>100m threshold');
    });
  });
});
