# Mobile Phase 9 — Evidence, Camera, GPS & Maps Hardware Integration

## 1. Executive Summary

Phase 9 upgrades the MPLADS-AI (`MPLADS AI`) mobile application from the Phase 6 simulated evidence submission flow to **real native hardware integrations**:
* **Native Camera Capture**: Implemented via `expo-camera` (`CameraView`) with live on-site capture enforcement, front/back lens toggle, and photo preview/retake workflows.
* **Real Device GPS Acquisition**: Implemented via `expo-location` with high-precision coordinate capture, dynamic accuracy indicators ($\pm\text{meters}$), timeout guards (10s), and device location status checks (`hasServicesEnabledAsync`).
* **Geospatial Map Rendering**: Implemented via `react-native-maps` (`MapView`, `Marker`) displaying official project coordinates against ground evidence capture coordinates, accompanied by fully accessible text alternatives.
* **Multi-Stage State Machine**: Enforces a robust step progression (`IDLE` $\rightarrow$ `CAMERA_PERMISSION` $\rightarrow$ `CAMERA_CAPTURE` $\rightarrow$ `IMAGE_PREVIEW` $\rightarrow$ `LOCATION_PERMISSION` $\rightarrow$ `GETTING_LOCATION` $\rightarrow$ `LOCATION_READY` $\rightarrow$ `REVIEW` $\rightarrow$ `UPLOADING` $\rightarrow$ `SUBMITTED`) preventing illegal or partial capture states.
* **Clean Architecture & Backend Authority**: Client-side calculations (such as Haversine distance) provide UX context only; the backend remains the authoritative statutory spatial verification and image matching engine.

---

## 2. Hardware Architecture & Workflow State Machine

```text
[ Citizen Evidence Screen ]
            │
            ▼
 ┌──────────────────────┐
 │         IDLE         │  Select / Verify Work ID
 └──────────┬───────────┘
            │ handleStartCapture()
            ▼
 ┌──────────────────────┐
 │  CAMERA_PERMISSION   │  Check / Request `expo-camera` Permission
 └──────────┬───────────┘
            │ granted
            ▼
 ┌──────────────────────┐
 │    CAMERA_CAPTURE    │  Live Viewfinder (facing toggle, flash, shutter)
 └──────────┬───────────┘
            │ handleTakePicture() -> URI & base64
            ▼
 ┌──────────────────────┐
 │    IMAGE_PREVIEW     │  Review captured photo (Retake / Accept)
 └──────────┬───────────┘
            │ handleAcceptPhoto()
            ▼
 ┌──────────────────────┐
 │ LOCATION_PERMISSION  │  Check / Request `expo-location` Foreground Permission
 └──────────┬───────────┘
            │ granted
            ▼
 ┌──────────────────────┐
 │   GETTING_LOCATION   │  High-Accuracy GPS (10s timeout, accuracy metrics)
 └──────────┬───────────┘
            │ position locked
            ▼
 ┌──────────────────────┐
 │ LOCATION_READY & MAP │  Interactive MapView (Project Pin + Evidence Pin)
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │        REVIEW        │  Project details, photo thumb, coords, accuracy
 └──────────┬───────────┘
            │ handleFinalSubmit()
            ▼
 ┌──────────────────────┐
 │      UPLOADING       │  TanStack Mutation (multipart / base64 payload)
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │      SUBMITTED       │  Statutory verification confirmation & Evidence ID
 └──────────────────────┘
```

---

## 3. Native Service Implementations

### 3.1 CameraService (`mobile/src/services/cameraService.ts`)
- **Permission Checking & Requesting**: Wraps `Camera.getCameraPermissionsAsync()` and `Camera.requestCameraPermissionsAsync()`.
- **Photo Validation**: Ensures returned URIs are readable local file references (`file://`, `ph://`, `content://`, `data:image/`) with supported image extensions (`.jpg`, `.jpeg`, `.png`, `.webp`).

### 3.2 LocationService (`mobile/src/services/locationService.ts`)
- **Permission Checking & Requesting**: Wraps `Location.getForegroundPermissionsAsync()` and `Location.requestForegroundPermissionsAsync()`.
- **Hardware Status**: Checks if location hardware is enabled via `Location.hasServicesEnabledAsync()`.
- **High-Accuracy Acquisition**: Requests `Location.Accuracy.High` with a 10,000ms `Promise.race` timeout guard.
- **Geodesic Distance**: Implements Haversine distance calculation in meters strictly for client UX reference.

### 3.3 ImageService (`mobile/src/services/imageService.ts`)
- Validates file format, non-empty URI, and safe base64 sanitization (stripping `data:image/...;base64,` prefixes when required for backend phash processing).

---

## 4. Operating System & App Configuration

### 4.1 iOS Configuration (`mobile/app.json`)
```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.mplads.mplads.dev",
  "infoPlist": {
    "NSCameraUsageDescription": "Camera access is required to capture project ground evidence.",
    "NSLocationWhenInUseUsageDescription": "Location access is required to verify that ground evidence was captured near the project site."
  }
}
```

### 4.2 Android Configuration (`mobile/app.json`)
```json
"android": {
  "package": "com.mplads.mplads.dev",
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION"
  ]
}
```

### 4.3 Expo Plugins (`mobile/app.json`)
- `expo-camera` with `cameraPermission` description.
- `expo-location` with `locationWhenInUsePermission` description.

---

## 5. Backend Contract & Review Compatibility

### 5.1 Evidence Submission API
* **Endpoint**: `POST /api/v1/intelligence/citizen/evidence`
* **Authorization**: JWT Bearer token with `evidence:submit` claim.
* **Payload**:
  ```json
  {
    "project_id": "WRK-2024-001",
    "latitude": 25.0961,
    "longitude": 85.3131,
    "timestamp_captured": "2026-09-19T12:00:00.000Z",
    "is_live_camera_capture": true,
    "image_base64": "..."
  }
  ```
* **Response**:
  ```json
  {
    "status": "RECORDED",
    "evidence_id": "ev-101",
    "project_id": "WRK-2024-001",
    "distance_to_project_meters": 32.4,
    "location_verified": true,
    "verification_status": "VERIFIED_COGNIZANT"
  }
  ```

### 5.2 Officer Review Compatibility (`mobile/app/(officer)/evidence/index.tsx`)
* Phase 7 District Officer Evidence Review console updated to display real geodesic coordinates (e.g. `📍 25.0961, 85.3131`), live camera badge, calculated distance to official site coordinates, and operational action buttons (`ACCEPTED`, `NEEDS_INFO`, `REJECTED`).

---

## 6. Privacy & Security Considerations

1. **Data Minimization**: Coordinates and camera photos are acquired strictly when the user initiates evidence capture for a specific project. No continuous tracking or background location polling is performed.
2. **Ephemeral Memory Management**: Large image binary data is not held permanently in global application state. References use local file URIs during capture and preview.
3. **Log Sanitization**: Image binary payloads and sensitive access tokens are stripped from application console logs.

---

## 7. Bilingual Localization & Accessibility (WCAG 2.1 AA)

* **Parity**: 100% bilingual dictionary parity across English (`en-IN`) and formal Hindi (`hi-IN`) for all camera controls, GPS accuracy banners, and map labels.
* **Text Alternatives for Map**: Screen reader accessibility labels provide comprehensive verbal summaries (e.g., `accessibilityLabel="Map showing project site and current evidence coordinates."`).
* **Non-Color Verification Badges**: Location consistency is communicated with explicit text (`Location-Consistent Match` vs `Location Inconsistent (>100m threshold)`) and semantic icons (`✓` / `⚠`).

---

## 8. Quality Assurance & Verification

* **TypeScript Compilation**: `npx tsc --noEmit` passes with **0 errors**.
* **Jest Test Suite**: All 7 test suites pass with **71 tests passing**:
  * `tests/evidenceCameraGps.test.ts` (Camera permissions, photo validation, location permissions, GPS accuracy, Haversine distance, submission use case, i18n, accessibility)
  * `tests/riskIntelligence.test.ts`
  * `tests/officerFeatures.test.ts`
  * `tests/citizenFeatures.test.ts`
  * `tests/localizationAccessibility.test.ts`
  * `tests/authRBAC.test.ts`
  * `tests/domainMappers.test.ts`
