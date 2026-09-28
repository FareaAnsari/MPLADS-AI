# Phase 0: Pre-Flight Safety Baseline & Development Environment Report
**Project**: MPLADS AI — AI-Powered MPLADS Monitoring Intelligence Layer  
**Workspace**: `/Users/themonishnawaz/Downloads/MPLADS/MPLADS-AI`  
**Date**: September 19, 2026  
**Status**: Completed — Read-Only Verification Baseline  

---

## A. Repository Identity

- **Absolute Repository Path**: `/Users/themonishnawaz/Downloads/MPLADS/MPLADS-AI`
- **Git Top-Level Verification**: Verified via `git rev-parse --show-toplevel`
- **Git Remote**: `origin` -> `https://github.com/FareaAnsari/MPLADS-AI` (fetch & push)
- **Current Branch**: `mobile-app` (dedicated branch for mobile engineering)
- **Current Commit**: `bcf6bdd` (*"Ignore environment file"*)
- **Working Tree Status**: No modified or deleted tracked files. Untracked documentation (`docs/`) and newly scaffolded mobile app directory (`mobile/`) present.

---

## B. Technology Baseline

- **Node.js**: `v22.14.0` (path: `/Users/themonishnawaz/.local/node/bin/node`)
- **npm**: `10.9.2` (path: `/Users/themonishnawaz/.local/node/bin/npm`)
- **Package Manager**: `npm` (manifests: `package.json`, `package-lock.json`)
- **Web Frontend Framework**: React 19.2.8, Vite 8.3.0, Tailwind CSS 3.4.19, React Router DOM 7.18.3
- **TypeScript**: `~6.0.2` (tsconfig configs: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`)
- **Backend Framework**: Python FastAPI 0.100+, Uvicorn 0.22+, Pydantic v2.0+
- **Database & Schemas**: PostgreSQL 15+ / PostGIS canonical SQL DDL (`backend/database/schema.sql`, `national_pipeline_schema.sql`)
- **AI/ML & Data Science**: Scikit-Learn 1.2+, Pandas 2.0+, NumPy 1.24+, Pillow 9.5+, ImageHash 4.3+, OpenCV Headless 4.7+, GeoPy 2.3+

---

## C. Mobile Toolchain Baseline

| Component | Status / Version | Details |
|---|---|---|
| **Expo CLI** | `57.0.26` | Verified via `npx expo --version` |
| **macOS Version** | macOS 27.0 (Build 26A428) | Darwin Kernel |
| **Xcode** | Xcode 27.0 (Build 27A266a) | Developer Path: `/Applications/Xcode.app/Contents/Developer` |
| **iOS Simulators** | ✅ Available | Runtimes detected: iPhone 17 Pro, iPhone 17 Pro Max, iPad Pro (M5), etc. |
| **Java Runtime** | ❌ Not Installed | Command `java -version` returns "Unable to locate a Java Runtime" |
| **Android SDK / ADB** | ❌ Not Found in PATH | Command `adb` returns `command not found` |
| **EAS CLI** | ❌ `eas-cli` not globally installed | `eas --version` / `npx eas` not installed |
| **Git LFS** | ❌ Not Installed | `git lfs` command unavailable |

---

## D. Existing Mobile Readiness & Structure

- **Mobile App Shell**: `mobile/` directory scaffolded with Expo SDK 52 tabs template (TypeScript + Expo Router v4).
- **Navigation Tree**: `mobile/app/_layout.tsx`, `mobile/app/(tabs)/index.tsx`, `mobile/app/(tabs)/explore.tsx`.
- **Native Directories (`ios/`, `android/`)**: Not yet generated (Expo Managed Workflow in place).

---

## E. Existing Application Health Baseline

> [!IMPORTANT]
> The following validation results represent the untouched baseline of the existing repository:

- **TypeScript (`npm run build` -> `tsc -b`)**: `PRE-EXISTING BASELINE FAILURE` (Exit Code 127: `tsc: command not found` in web root because root `node_modules` are not installed locally).
- **Linter (`npm run lint` -> `oxlint`)**: `PRE-EXISTING BASELINE FAILURE` (Exit Code 127: `oxlint: command not found` in web root because root `node_modules` are not installed locally).
- **Backend Startup / Import Integrity**: All 9 AI engine files, routers, and schemas syntactically valid and free of circular imports.

---

## F. Security Findings (Zero-Secret Policy)

1. **Third-Party API Key in Source**:
   - `src/services/groqAIService.ts` (Line 5)
   - Type: Fallback AI Inference Key (`gsk_...`)
   - Severity: **CRITICAL FOR MOBILE**
   - Action: Must be routed exclusively through backend proxy endpoints; never compiled into mobile bundle.

2. **Third-Party Speech Key in Source**:
   - `src/services/elevenLabsAudioService.ts` (Line 4)
   - Type: Fallback Audio TTS Key (`sk_...`)
   - Severity: **CRITICAL FOR MOBILE**
   - Action: Must be routed exclusively through backend proxy endpoints; never compiled into mobile bundle.

3. **Backend Environment File**:
   - `backend/.env`
   - Type: Database URL, Port, Host, AI Secrets
   - Severity: **HIGH**
   - Action: Kept local; ensure never packaged or committed into git repository.

4. **Root `.gitignore` Assessment**:
   - `.gitignore` currently does not explicitly list `.env` or `.env.*`.
   - Recommended action: Add `.env`, `*.env`, `.env.local` to `.gitignore`.

---

## G. Authentication & Authorization Reality

- **Authentication**: `MISSING` on backend (FastAPI endpoints have no JWT / OAuth bearer token verification).
- **Authorization & Access Control**: `MISSING` on backend.
- **Role Enforcement**: `CLIENT-SIDE ONLY` (Mock role state switcher in React web application).
- **Mobile Path**: Mobile client will manage a local session store (`expo-secure-store`) with role-scoped navigation until backend JWT service is introduced.

---

## H. Architecture & Audit References

- **Mobile Architecture Reference**: Clean 4-Layer Architecture (`mobile_architecture.md`)
- **Phase 1 Audit Reference**: [`docs/MOBILE_PHASE_1_AUDIT.md`](file:///Users/themonishnawaz/Downloads/MPLADS/MPLADS-AI/docs/MOBILE_PHASE_1_AUDIT.md)
- **Backend API OpenAPI Schema**: FastAPI automatic OpenAPI / Swagger endpoints at `/docs`

---

## I. Blockers Classification

### BLOCKING
*None for Expo iOS Simulator / Web development.*

### HIGH PRIORITY (For Android Local Builds & Native Compilation)
1. **Java & Android SDK**: Java Runtime and Android Platform Tools (`adb`) must be installed if testing on local Android emulators or performing bare native builds. (Expo Go / iOS Simulator works immediately).
2. **Backend AI Proxy**: Create lightweight backend proxy endpoints before deploying mobile release builds to prevent exposing Groq and ElevenLabs keys.

### NON-BLOCKING
1. Root web `node_modules` installation (`npm install` for web linting/building).

---

## J. Phase 0 Exit Checklist

- [x] Correct repository root identified (`/Users/themonishnawaz/Downloads/MPLADS/MPLADS-AI`)
- [x] Git repository verified
- [x] Remote verified (`origin` -> `https://github.com/FareaAnsari/MPLADS-AI`)
- [x] Current branch recorded (`mobile-app`)
- [x] Current commit recorded (`bcf6bdd`)
- [x] Working tree protected (No destructive commands executed)
- [x] Mobile development branch available (`mobile-app`)
- [x] Architecture document identified
- [x] Phase 1 audit identified (`docs/MOBILE_PHASE_1_AUDIT.md`)
- [x] Node verified (`v22.14.0`)
- [x] npm/package manager verified (`10.9.2`)
- [x] Expo toolchain verified (`57.0.26`)
- [x] Xcode verified (`Xcode 27.0`)
- [x] iOS Simulator availability checked (iPhone 17 series available)
- [x] Android tooling checked (Java / ADB missing recorded)
- [x] EAS availability checked (`eas-cli` not globally installed recorded)
- [x] Existing web health baseline recorded (pre-existing missing root `node_modules`)
- [x] Backend baseline recorded
- [x] AI engine locations confirmed (9 server-side engines)
- [x] Existing mobile code checked (`mobile/` directory in managed Expo workflow)
- [x] API surface checked
- [x] Authentication state checked (Client-side mock only)
- [x] Secret scan completed (Third-party keys identified for proxying)
- [x] `.gitignore` reviewed
- [x] Environment files reviewed
- [x] Database safety verified (Zero modifications made)
- [x] No production database changed
- [x] No existing source code modified
- [x] Phase 0 documentation created (`docs/MOBILE_PHASE_0_BASELINE.md`)
- [x] Final git status checked
