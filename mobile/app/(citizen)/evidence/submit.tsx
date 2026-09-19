import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import MapView, { Marker } from 'react-native-maps';
import {
  Screen,
  Text,
  Button,
  Card,
  Badge,
  TextField,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useSubmitCitizenEvidenceMutation } from '../../../src/features/citizen/queries';
import {
  EvidenceVerificationResultEntity,
  CaptureStep,
} from '../../../src/domain/entities';
import { CameraService, LocationService, ImageService, GeoCoordinates } from '../../../src/services';
import { logger } from '../../../src/utils/logger';

export default function SubmitCitizenEvidenceScreen() {
  const router = useRouter();
  const { projectId: initialProjectId } = useLocalSearchParams<{ projectId?: string }>();
  const { t, isHindi } = useTranslation();

  const [projectId, setProjectId] = useState<string>(
    (Array.isArray(initialProjectId) ? initialProjectId[0] : initialProjectId) || 'WRK-2024-001'
  );

  // Workflow state machine
  const [step, setStep] = useState<CaptureStep>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedPhotoBase64, setCapturedPhotoBase64] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Location state
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [isAcquiringLocation, setIsAcquiringLocation] = useState<boolean>(false);

  // Default project location for comparison (e.g. Araria / Bihar project default)
  const defaultProjectLat = 25.0961;
  const defaultProjectLon = 85.3131;

  // Final submission state
  const [submissionResult, setSubmissionResult] = useState<EvidenceVerificationResultEntity | null>(null);
  const submitMutation = useSubmitCitizenEvidenceMutation();

  // Reset error when step changes
  useEffect(() => {
    setErrorMessage(null);
  }, [step]);

  // Step 1 -> Launch Camera
  const handleStartCapture = async () => {
    if (!projectId.trim()) {
      setErrorMessage(isHindi ? 'कृपया परियोजना कार्य आईडी दर्ज करें।' : 'Project ID is required.');
      return;
    }

    if (!cameraPermission?.granted) {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        setStep('CAMERA_PERMISSION');
        return;
      }
    }
    setStep('CAMERA_CAPTURE');
  };

  // Step 2 -> Capture photo from viewfinder
  const handleTakePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      if (photo?.uri && CameraService.validateCapturedPhoto(photo.uri)) {
        setCapturedPhotoUri(photo.uri);
        setCapturedPhotoBase64(photo.base64 || null);
        setStep('IMAGE_PREVIEW');
      } else {
        setErrorMessage(t('evidence.cameraCaptureFailed'));
      }
    } catch (err: any) {
      logger.error('SubmitEvidence', 'Camera capture error', err);
      setErrorMessage(t('evidence.cameraCaptureFailed'));
    }
  };

  // Step 3 -> Accept photo and acquire GPS
  const handleAcceptPhoto = async () => {
    setStep('GETTING_LOCATION');
    setIsAcquiringLocation(true);

    try {
      const perm = await LocationService.checkPermission();
      if (!perm.granted) {
        const reqPerm = await LocationService.requestPermission();
        if (!reqPerm.granted) {
          setIsAcquiringLocation(false);
          setStep('LOCATION_PERMISSION');
          return;
        }
      }

      const position = await LocationService.getCurrentPosition({ timeoutMs: 10000 });
      setCoords(position);
      setIsAcquiringLocation(false);
      setStep('LOCATION_READY');
    } catch (err: any) {
      logger.error('SubmitEvidence', 'Location acquisition error', err);
      setIsAcquiringLocation(false);
      setErrorMessage(t('evidence.locationFailed'));
      setStep('LOCATION_PERMISSION');
    }
  };

  // Step 4 -> Final upload to government server
  const handleFinalSubmit = async () => {
    if (!coords || !capturedPhotoUri) {
      Alert.alert(t('errors.generic'), t('evidence.submissionFailed'));
      return;
    }

    setStep('UPLOADING');
    try {
      const result = await submitMutation.mutateAsync({
        projectId: projectId.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        isLiveCameraCapture: true,
        timestampCaptured: new Date(coords.timestamp || Date.now()).toISOString(),
        imageBase64: capturedPhotoBase64,
        imageUri: capturedPhotoUri,
      });

      setSubmissionResult(result);
      setStep('SUBMITTED');
    } catch (err: any) {
      setStep('REVIEW');
      Alert.alert(
        t('errors.generic'),
        err.message || t('evidence.submissionFailed')
      );
    }
  };

  // --------------------------------------------------------------------------
  // RENDER: STEP = SUBMITTED (Success Screen)
  // --------------------------------------------------------------------------
  if (step === 'SUBMITTED' && submissionResult) {
    const isVerified = submissionResult.locationVerified;

    return (
      <Screen scrollable style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.iconCircle}>
            <Text variant="h1">{isVerified ? '✓' : '⚠'}</Text>
          </View>

          <Text variant="h2" align="center" color={Colors.primaryDark} style={styles.successTitle}>
            {t('citizen.submissionSuccessTitle')}
          </Text>

          <Text variant="body" align="center" color={Colors.textSecondary} style={styles.successMessage}>
            {t('evidence.evidenceSubmittedSuccessfully')}
          </Text>

          <View style={styles.resultDetailsBox}>
            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.evidenceId')}:
              </Text>
              <Text variant="bodySmall" style={styles.bold}>
                {submissionResult.evidenceId}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('projects.workId')}:
              </Text>
              <Text variant="bodySmall" style={styles.bold}>
                {submissionResult.projectId}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.distanceToSite')}:
              </Text>
              <Text variant="bodySmall" style={styles.bold}>
                {Math.round(submissionResult.distanceToProjectMeters)} meters
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.verificationStatus')}:
              </Text>
              <Badge
                label={isVerified ? t('evidence.verifiedMatch') : t('evidence.locationInconsistent')}
                variant={isVerified ? 'success' : 'danger'}
                size="sm"
              />
            </View>
          </View>

          <Button
            title={t('citizen.backToEvidenceHub')}
            variant="primary"
            onPress={() => router.replace('/(citizen)/evidence')}
            style={styles.actionBtn}
          />

          <Button
            title={t('navigation.home')}
            variant="ghost"
            onPress={() => router.replace('/(citizen)')}
            style={styles.actionBtn}
          />
        </Card>
      </Screen>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: STEP = CAMERA_CAPTURE (Live Viewfinder)
  // --------------------------------------------------------------------------
  if (step === 'CAMERA_CAPTURE') {
    return (
      <View style={styles.fullScreenCamera}>
        <CameraView style={styles.cameraView} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraControlBtn}
                onPress={() => setStep('IDLE')}
                accessibilityLabel="Cancel camera"
                accessibilityRole="button"
              >
                <Text color={Colors.surface} variant="bodySmall">✕ {t('common.cancel')}</Text>
              </TouchableOpacity>

              <Badge label={projectId} variant="primary" size="sm" />

              <TouchableOpacity
                style={styles.cameraControlBtn}
                onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
                accessibilityLabel={t('evidence.switchCamera')}
                accessibilityRole="button"
              >
                <Text color={Colors.surface} variant="bodySmall">🔄</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewfinderGuide}>
              <Text variant="caption" color={Colors.surface} align="center" style={styles.guideText}>
                {t('evidence.liveCameraRequired')}
              </Text>
            </View>

            <View style={styles.cameraFooter}>
              <TouchableOpacity
                style={styles.shutterButton}
                onPress={handleTakePicture}
                accessibilityLabel={t('evidence.capturePhoto')}
                accessibilityRole="button"
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: STEP = IMAGE_PREVIEW (Captured Photograph Review)
  // --------------------------------------------------------------------------
  if (step === 'IMAGE_PREVIEW' && capturedPhotoUri) {
    return (
      <Screen scrollable style={styles.container}>
        <Card style={styles.card}>
          <Text variant="h2" color={Colors.primaryDark} style={styles.sectionTitle}>
            {t('evidence.cameraTitle')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.subtitle}>
            {t('evidence.liveCameraRequired')}
          </Text>

          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: capturedPhotoUri }}
              style={styles.previewImage}
              resizeMode="cover"
              accessibilityLabel="Captured ground evidence photograph"
            />
          </View>

          <View style={styles.previewActions}>
            <Button
              title={t('evidence.retakePhoto')}
              variant="outline"
              onPress={() => setStep('CAMERA_CAPTURE')}
              style={styles.previewBtn}
            />
            <Button
              title={t('evidence.acceptPhoto')}
              variant="primary"
              onPress={handleAcceptPhoto}
              style={styles.previewBtn}
            />
          </View>
        </Card>
      </Screen>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: STEP = GETTING_LOCATION / LOCATION_PERMISSION
  // --------------------------------------------------------------------------
  if (step === 'GETTING_LOCATION' || step === 'LOCATION_PERMISSION') {
    return (
      <Screen scrollable style={styles.container}>
        <Card style={styles.card}>
          <Text variant="h2" color={Colors.primaryDark} style={styles.sectionTitle}>
            {t('evidence.locationTitle')}
          </Text>

          {isAcquiringLocation ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primaryDark} />
              <Text variant="body" color={Colors.textSecondary} align="center" style={styles.loadingText}>
                {t('evidence.acquiringLocation')}
              </Text>
            </View>
          ) : (
            <View style={styles.permissionBox}>
              <Text variant="body" color={Colors.danger} style={styles.errorBanner}>
                {errorMessage || t('evidence.locationPermissionDenied')}
              </Text>
              <Button
                title={t('evidence.requestLocationPermission')}
                variant="primary"
                onPress={handleAcceptPhoto}
                style={styles.actionBtn}
              />
              <Button
                title={t('evidence.retakePhoto')}
                variant="outline"
                onPress={() => setStep('IMAGE_PREVIEW')}
                style={styles.actionBtn}
              />
            </View>
          )}
        </Card>
      </Screen>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: STEP = LOCATION_READY / REVIEW (Map & Pre-submission review)
  // --------------------------------------------------------------------------
  if ((step === 'LOCATION_READY' || step === 'REVIEW' || step === 'UPLOADING') && coords) {
    const calculatedDistance = LocationService.calculateHaversineDistanceMeters(
      coords.latitude,
      coords.longitude,
      defaultProjectLat,
      defaultProjectLon
    );
    const isNearby = calculatedDistance <= 100;

    return (
      <Screen scrollable style={styles.container}>
        <Card style={styles.card}>
          <Text variant="h2" color={Colors.primaryDark} style={styles.sectionTitle}>
            {t('evidence.reviewTitle')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.subtitle}>
            {t('evidence.reviewNotice')}
          </Text>

          {/* Project & Photo Section */}
          <View style={styles.reviewProjectHeader}>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {t('projects.workId')}: <Text variant="bodySmall" style={styles.bold}>{projectId}</Text>
            </Text>
            {capturedPhotoUri && (
              <Image source={{ uri: capturedPhotoUri }} style={styles.reviewThumb} />
            )}
          </View>

          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              accessibilityLabel={t('evidence.mapTextAlternative')}
            >
              <Marker
                coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
                title={t('evidence.evidenceLocationPin')}
                pinColor={Colors.primaryDark}
              />
              <Marker
                coordinate={{ latitude: defaultProjectLat, longitude: defaultProjectLon }}
                title={t('evidence.projectLocationPin')}
                pinColor={Colors.secondary}
              />
            </MapView>
          </View>

          {/* Coordinates & Accuracy Details */}
          <View style={styles.coordsBox}>
            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.latitudeLabel')}:
              </Text>
              <Text variant="bodySmall" style={styles.mono}>{coords.latitude.toFixed(6)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.longitudeLabel')}:
              </Text>
              <Text variant="bodySmall" style={styles.mono}>{coords.longitude.toFixed(6)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('evidence.accuracyLabel')}:
              </Text>
              <Badge
                label={`±${Math.round(coords.accuracyMeters || 10)}m (${(coords.accuracyMeters || 10) <= 25 ? t('evidence.accuracyHigh') : t('evidence.accuracyMedium')})`}
                variant="info"
                size="sm"
              />
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('evidence.distanceProximity')}:
              </Text>
              <Badge
                label={`~${calculatedDistance}m`}
                variant={isNearby ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <Text variant="caption" color={Colors.textSecondary}>
              ℹ {t('evidence.pendingServerVerification')}
            </Text>
          </View>

          <Button
            title={step === 'UPLOADING' ? t('evidence.uploadingEvidence') : t('evidence.confirmAndSubmit')}
            variant="primary"
            onPress={handleFinalSubmit}
            disabled={step === 'UPLOADING'}
            loading={step === 'UPLOADING'}
            style={styles.actionBtn}
          />

          <Button
            title={t('evidence.retakePhoto')}
            variant="outline"
            onPress={() => setStep('CAMERA_CAPTURE')}
            disabled={step === 'UPLOADING'}
            style={styles.actionBtn}
          />
        </Card>
      </Screen>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: STEP = IDLE / CAMERA_PERMISSION (Initial Entry)
  // --------------------------------------------------------------------------
  return (
    <Screen scrollable style={styles.container}>
      <Card style={styles.card}>
        <Text variant="h2" color={Colors.primaryDark} style={styles.sectionTitle}>
          {t('citizen.evidenceFormTitle')}
        </Text>
        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.subtitle}>
          {t('citizen.evidenceFormSubtitle')}
        </Text>

        {errorMessage && (
          <Text variant="bodySmall" color={Colors.danger} style={styles.errorBanner}>
            {errorMessage}
          </Text>
        )}

        <TextField
          label={t('citizen.projectIdLabel')}
          value={projectId}
          onChangeText={setProjectId}
          placeholder="e.g. WRK-2024-001"
          containerStyle={styles.input}
        />

        <View style={styles.cameraNoticeBox}>
          <Text variant="h3" color={Colors.primaryDark}>
            📷 {t('evidence.cameraTitle')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary} style={styles.noticeText}>
            {t('evidence.liveCameraRequired')}
          </Text>
        </View>

        <Button
          title={t('evidence.capturePhoto')}
          variant="primary"
          onPress={handleStartCapture}
          style={styles.actionBtn}
        />

        <Button
          title={t('common.cancel')}
          variant="ghost"
          onPress={() => router.back()}
          style={styles.actionBtn}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  cameraNoticeBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryDark,
  },
  noticeText: {
    marginTop: Spacing.xs,
  },
  actionBtn: {
    marginTop: Spacing.sm,
  },
  errorBanner: {
    marginBottom: Spacing.md,
  },
  // Fullscreen Camera View
  fullScreenCamera: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
  },
  cameraControlBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  viewfinderGuide: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    alignSelf: 'center',
  },
  guideText: {
    fontWeight: '600',
  },
  cameraFooter: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
  },
  // Image preview
  imagePreviewContainer: {
    height: 320,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  previewBtn: {
    flex: 1,
  },
  // Loading & Permissions
  loadingBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  permissionBox: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  // Review & Map
  reviewProjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reviewThumb: {
    width: 60,
    height: 60,
    borderRadius: Radii.sm,
  },
  mapContainer: {
    height: 200,
    borderRadius: Radii.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  coordsBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  disclaimerBox: {
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
  },
  // Success styles
  successCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    alignSelf: 'center',
  },
  successTitle: {
    marginBottom: Spacing.xs,
  },
  successMessage: {
    marginBottom: Spacing.lg,
  },
  resultDetailsBox: {
    width: '100%',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
});
