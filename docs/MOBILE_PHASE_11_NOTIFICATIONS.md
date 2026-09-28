# Mobile Phase 11 — Notifications & Deep-Link Security

## 1. Executive Summary

Phase 11 implements a secure, role-aware push and in-app notification system for the MPLADS-AI (`MPLADS AI`) mobile application.

The notification infrastructure is built on:
* **Expo Notifications (`expo-notifications` ~57.0.20)** & **Expo Device (`expo-device` ~57.0.2)**: Native push token retrieval, foreground notification presentation, and Android channel management.
* **Authoritative FastAPI Backend**: Centralized device token registry (`POST /api/v1/notifications/devices`), user-scoped notification stream, unread counts, mark-as-read endpoints, and notification preferences.
* **In-App Notification Center (`mobile/app/notifications/index.tsx`)**: High-performance feed with category tabs (`EVIDENCE`, `RISK`, `SLA`, `INSPECTION`, `PROJECT`, `SYSTEM`), visual read/unread indicators, pull-to-refresh, empty states, and error handling.
* **Header Notification Bell (`NotificationBell.tsx`)**: Integrated widget with live unread badge count updating automatically via TanStack Query.
* **Strict RBAC Deep-Link Guard (`NotificationRouter`)**: Client-side authorization guard ensuring citizens can never access privileged officer routes (such as `officer/risk/...` or `officer/evidence/...`) even if malicious or crafted deep links are received.
* **Session & User Isolation**: Full device token deactivation on logout (`DELETE /api/v1/notifications/devices/{id}`) and local TanStack Query cache purge to prevent cross-account notification leakage.
* **Lock-Screen Privacy**: Push notification bodies contain strictly neutral, non-sensational summaries without revealing confidential financial anomalies, exact citizen GPS coordinates, or private identities.

---

## 2. Notification Architecture & Flow

```text
Backend Statutory Event (e.g. Evidence Submitted / Risk Assessment / SLA Warning)
      ↓
FastAPI Centralized Notification Engine (Persists Notification Record)
      ↓
Target User Device Push Registry (Expo Push Token / FCM / APNs)
      ↓
Mobile OS Notification Delivery (Foreground / Background / Terminated)
      ↓
User Taps Notification
      ↓
NotificationRouter (RBAC Verification against Authenticated Session)
      ├── Authorized Role → Dispatches Deep Link (e.g. /(officer)/risk/WRK-001)
      └── Unauthorized Role → Rejection & Fallback to /notifications
```

---

## 3. Backend Endpoints & Schemas

The FastAPI backend exposes the following protected endpoints under `/api/v1/notifications`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/notifications/devices` | Registers device push token, UUID, platform, and app version for caller. | Bearer JWT |
| `DELETE` | `/api/v1/notifications/devices/{device_id}` | Deactivates device token upon logout to prevent cross-account delivery. | Bearer JWT |
| `GET` | `/api/v1/notifications` | Retrieves user-scoped notification feed sorted newest-first. Supports `category` filter. | Bearer JWT |
| `GET` | `/api/v1/notifications/unread-count` | Computes unread count for caller. | Bearer JWT |
| `POST` | `/api/v1/notifications/{id}/read` | Marks single notification as read. Validates caller ownership (rejects 403 on tampering). | Bearer JWT |
| `GET` | `/api/v1/notifications/preferences` | Returns user notification preferences. | Bearer JWT |
| `PUT` | `/api/v1/notifications/preferences` | Updates user notification preferences. | Bearer JWT |

---

## 4. Mobile Architecture & Layering

### 4.1 Domain Layer
* **Entities (`src/domain/entities/index.ts`)**: `NotificationEntity`, `NotificationType`, `NotificationCategory`, `NotificationPreferencesEntity`, `DeviceRegistrationEntity`.
* **Repository Interface (`src/domain/interfaces/index.ts`)**: `INotificationRepository`.

### 4.2 Data & Remote Layer
* **DTOs (`src/data/remote/dto/index.ts`)**: `NotificationDTO`, `DeviceRegistrationRequestDTO`, `DeviceRegistrationResponseDTO`, `UnreadCountResponseDTO`, `NotificationPreferencesResponseDTO`.
* **Mappers (`src/data/remote/mappers/index.ts`)**: `DataMappers.mapNotificationDTOToEntity`, `DataMappers.mapNotificationPreferencesDTOToEntity`.
* **Repository (`src/data/repositories/RemoteNotificationRepository.ts`)**: Full API client implementation.

### 4.3 Feature & State Management
* **Queries & Mutations (`src/features/notifications/queries.ts`)**:
  * `useNotificationsQuery(category?: string)`
  * `useUnreadNotificationCountQuery()` (with 60s background polling)
  * `useMarkNotificationReadMutation()`
  * `useNotificationPreferencesQuery()`
  * `useUpdateNotificationPreferencesMutation()`
  * `useRegisterDeviceMutation()`
  * `useUnregisterDeviceMutation()`

### 4.4 Services & Routing
* **Notification Service (`src/services/notificationService.ts`)**:
  * `initialize()`: Sets up Android channels and listeners.
  * `requestPermissions()`: Handles physical device vs simulator detection and system permission requests.
  * `registerDeviceForPush()`: Retrieves Expo Push Token and syncs to backend.
  * `unregisterDeviceOnLogout()`: Purges device registration on backend.
  * `handleNotificationNavigation()`: Centralized `NotificationRouter` with strict RBAC deep-link validation.

---

## 5. Security & Privacy Guarantees

### 5.1 Lock-Screen Privacy
* Push payloads never embed full financial transaction records, corruption flags, or citizen GPS coordinates.
* Standardized factual phrasing is enforced:
  * **Good (Push Body)**: *"New evidence review task assigned."*
  * **Bad (Forbidden)**: *"Citizen Ramesh at [25.09, 85.31] reported ₹50 lakh scam on Project WRK-101."*
* The user must authenticate into the application before reviewing sensitive details.

### 5.2 Deep-Link RBAC Security
* All incoming deep links (`mplads://...`) and push payload navigation targets are routed through `NotificationService.handleNotificationNavigation`.
* The router cross-references the active user in `useAuthStore`:
  * If unauthenticated: Dispatches to `/(auth)/login`.
  * If a `CITIZEN` receives an `officer/*` deep link: Blocked with a security warning and safely routed to `/notifications`.
  * If a `DISTRICT_OFFICER` receives an `officer/risk/*` link: Dispatches to `/(officer)/risk/{id}`.

### 5.3 Multi-Device & Logout Isolation
* A single user can register multiple devices (e.g. tablet + phone). The backend registers them by `device_id`.
* Upon logout (`useAuthStore.logout()`), the device registration is explicitly unregistered on the backend (`unregisterDeviceOnLogout()`) and TanStack Query cache is purged (`queryClient.clear()`).
* User A logging out followed by User B logging in prevents User B from receiving User A's private notifications.

---

## 6. Android Notification Channels & iOS Configuration

The application configures 4 dedicated Android Notification Channels:
1. **Critical Operational Alerts (`critical-alerts`)**: `MAX` importance, urgent vibration pattern, red light color (`#DC2626`).
2. **Citizen Evidence Updates (`evidence-channel`)**: `DEFAULT` importance, blue light color (`#2563EB`).
3. **Project Milestones & Updates (`project-channel`)**: `DEFAULT` importance, teal light color (`#0D9488`).
4. **System Notices (`system-channel`)**: `LOW` importance.

---

## 7. Localization & Accessibility

### 7.1 Localization
Translations are centrally provided in `mobile/src/i18n/locales/en-IN.ts` and `mobile/src/i18n/locales/hi-IN.ts` under the following namespaces:
* `notifications.*`
* `notificationPreferences.*`
* `notificationPermissions.*`
* `notificationErrors.*`

### 7.2 Accessibility (WCAG 2.1 AA)
* Every notification card in the Notification Center includes an explicit screen-reader label containing read/unread state, category, title, body, and relative timestamp.
* Unread state is not conveyed by color alone: an unread dot indicator, bold title styling, and an explicit accessibility prefix (`"Unread notification."` / `"अपठित सूचना."`) are combined.
* Header `NotificationBell` provides dynamic accessibility labels indicating the exact unread count (e.g., `"Notifications, 3 unread"`).

---

## 8. Verification & Test Suite

### 8.1 Automated Test Execution
* **TypeScript Typecheck**: `npx tsc --noEmit` passed with 0 errors.
* **Mobile Test Suite**: `npx jest` executed with 9 test suites and 95 passing unit and integration tests.
  * `tests/notifications.test.ts` covers DataMappers, RemoteNotificationRepository, NotificationRouter RBAC deep-link guards, permission handling, unread counts, and bilingual localization dictionaries.
* **Backend Test Suite**: `backend/tests/notification_test.py` covers device registration, logout unregistration, user-scoped feed filtering, unread count computation, mark-as-read, 403 unauthorized mark-read rejection, and preferences management.

---

## 9. Deployment Requirements & Known Limitations

1. **Expo Application Services (EAS) Push Credentials**:
   * For physical production push delivery via APNs (iOS) and FCM (Android), valid Apple Developer APNs keys and Google Firebase Cloud Messaging credentials must be provisioned in `eas.json` and EAS Dashboard (`expo-notifications`).
   * On iOS Simulator and Android Emulator, `Device.isDevice` correctly returns `false`, gracefully skipping remote APNs/FCM token registration while preserving full in-app notification center functionality.
2. **Real Device Testing**:
   * Physical iOS and Android devices must be used to test OS lock-screen banners, background notification taps, and system sound playback.

---

## 10. Next Phase

**PHASE 12 — MP OFFICE APPLICATION**
