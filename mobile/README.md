# Pratyaksh Mobile — Cross-Platform Client (Android + iOS)

Official cross-platform mobile application for **Pratyaksh** — AI-Powered MPLADS Monitoring & Verification Intelligence Layer.

---

## 1. Overview & Technology Stack
- **Framework**: React Native 0.86+ with Expo SDK 52+ (Expo Router v4)
- **Language**: TypeScript 5.x / 6.x
- **Architecture**: 4-Layer Clean Architecture (`Presentation`, `Domain`, `Data`, `Infrastructure`)
- **Navigation**: Role-scoped navigation with Expo Router file-based route groups

---

## 2. Directory Structure

```text
mobile/
├── app/                  # Expo Router navigation tree
│   ├── _layout.tsx       # Root layout with SafeArea & ErrorBoundary
│   ├── index.tsx         # Mobile home gateway
│   ├── (auth)/           # Identity & authentication route group
│   ├── (citizen)/        # Citizen village tracking & verification group
│   ├── (officer)/        # District officer inspection routing group
│   ├── (mp)/             # MP constituency intelligence group
│   └── (contractor)/     # Contractor tender & payment portal group
│
├── src/
│   ├── config/           # Safe environment & API endpoint configuration
│   ├── domain/           # Pure TypeScript entities & repository interfaces
│   ├── data/             # Data layer & API repositories (Phase 3)
│   ├── infrastructure/   # Hardware & native module hooks (Phase 4)
│   ├── ui/
│   │   ├── theme/        # Government semantic colors, typography, spacing
│   │   └── components/   # Base accessible components (Screen, Text, Button, Card, Badge)
│   └── utils/            # Logging & helpers
│
├── assets/               # Splash icons & images
├── app.json              # Expo application configuration
├── eas.json              # EAS build profiles (development, staging, production)
└── package.json          # Dependencies
```

---

## 3. Development Commands

From the `mobile/` directory:

```bash
# Start development server
npm run start

# Run on iOS Simulator (macOS + Xcode required)
npm run ios

# Run on Android Emulator (Android SDK / adb required)
npm run android

# Run on Web (Browser preview)
npm run web

# TypeScript check
npx tsc --noEmit
```

---

## 4. Current Phase 2 Limitations
- **Authentication**: Phase 2 implements placeholder navigation only. Production biometric and OTP authentication is deferred to security phases.
- **Backend API Integration**: API endpoints are mapped in `src/config/api.ts`, but active network communication is deferred to Phase 3.
- **Hardware Integrations**: Camera, GPS telemetry, and offline WatermelonDB persistence will be connected in dedicated phases.
- **AI Models**: All 9 analytical AI engines remain server-side; mobile acts exclusively as a thin REST client.
