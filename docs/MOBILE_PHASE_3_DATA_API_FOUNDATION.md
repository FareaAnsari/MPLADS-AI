# Phase 3: Clean Architecture Core + Data/API Foundation Report
**Project**: MPLADS AI — AI-Powered MPLADS Monitoring & Verification Intelligence Layer  
**Target Mobile Platforms**: Cross-Platform Android + iOS (React Native, Expo SDK 52+, TypeScript, Expo Router v4)  
**Date**: September 19, 2026  
**Status**: Completed — Core Data & API Layer Operational  

---

## 1. Clean Architecture Boundaries

The mobile application strictly enforces a 4-layer dependency structure:

```text
Presentation Layer (React Native / Expo Router / UI Hooks)
         │
         ▼
Domain Layer (Entities, Use Cases, Repository Interfaces - Pure TypeScript)
         │
         ▼
Data Layer (Remote Repositories, DTOs, Mappers, Axios ApiClient, Local Interfaces)
         │
         ▼
Infrastructure Layer (Native Device Integrations, Future Storage & Hardware Hooks)
```

- **Domain Independence**: All entities and repository interfaces contain zero React Native, Expo, Axios, or storage dependencies.
- **DTO to Domain Decoupling**: All remote response schemas from the FastAPI backend are mapped to domain models via `DataMappers`.

---

## 2. Implemented Domain Entities & Use Cases

- **Domain Entities** (`mobile/src/domain/entities/index.ts`):
  - `ProjectEntity` (Core MPLADS work record with financial status, workflow stage, and provenance)
  - `MPEntity` (Elected / Nominated MP record with allocation limits)
  - `RiskAssessmentEntity` & `RiskBreakdownEntity` (Composite risk 0-100 and component breakdown)
  - `SLABottleneckEntity` (Stage history duration vs MoSPI benchmark ratio)
  - `InspectorScheduleEntity` (Geodesic inspection routing itinerary)
  - `CitizenEvidenceEntity` & `EvidenceVerificationResultEntity` (Geotagged physical evidence)
  - `NationalDataSummaryEntity` (Data pipeline rollups)

- **Use Cases** (`mobile/src/domain/usecases/`):
  - `FetchProjectsUseCase`, `FetchProjectDetailsUseCase`, `FetchMPsUseCase`, `FetchDatasetSummaryUseCase`
  - `FetchRiskScoreUseCase`, `FetchSLABottleneckUseCase`, `FetchOptimizedInspectionsUseCase`

---

## 3. Remote Data & API Client

- **Centralized Axios Client** (`mobile/src/data/remote/apiClient.ts`):
  - Timeout: 15 seconds
  - Base URL: Configured via `src/config/environment.ts`
  - Request Interceptor: Logging & placeholder boundary for Phase 4 JWT token attachment
  - Response Interceptor: HTTP error normalization via `normalizeHttpError`
- **Error Model** (`mobile/src/data/remote/errors.ts`):
  - Standardized `ApiError` class classifying `NETWORK_ERROR`, `TIMEOUT`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, and `SERVER_ERROR`.

---

## 4. TanStack Query & Caching Foundation

- **Query Client Configuration** (`mobile/src/config/queryClient.ts`):
  - Default Stale Time: 5 minutes
  - Garbage Collection Window: 24 hours
  - Retry Policy: Max 2 retries on 5xx server errors; 0 retries on 4xx client errors or mutations.
- **Centralized Query Keys** (`mobile/src/data/remote/queryKeys.ts`):
  - `QueryKeys.projects.list(params)`
  - `QueryKeys.projects.detail(workId)`
  - `QueryKeys.risk.detail(workId)`
  - `QueryKeys.risk.slaBottleneck(workId)`
  - `QueryKeys.risk.inspections()`
- **Application Hooks** (`mobile/src/features/`):
  - `useProjectsQuery`, `useProjectDetailQuery`, `useDatasetSummaryQuery`, `useMPsQuery`
  - `useRiskProjectsQuery`, `useProjectRiskQuery`, `useSLABottleneckQuery`, `useOptimizedInspectionsQuery`

---

## 5. Zustand UI State & Storage Boundaries

- **Zustand Store** (`mobile/src/store/appStore.ts`):
  - Manages non-sensitive UI preferences: `language` (`en` | `hi`), `themeMode` (`light` | `dark` | `system`), `isOffline` boolean, and `activeRolePreview`.
  - **Zero credentials stored in Zustand**.
- **Secure Storage Boundary** (`mobile/src/data/local/interfaces/secureStorage.ts`):
  - `ISecureStorage` interface established for Phase 4 `expo-secure-store` implementation.
- **Local Data Source Boundary** (`mobile/src/data/local/interfaces/localDataSources.ts`):
  - `ILocalProjectDataSource`, `ILocalRiskDataSource`, and `IOfflineMutationQueue` established for future WatermelonDB offline persistence.

---

## 6. Testing & Static Validation

- **TypeScript Compilation (`npx tsc --noEmit`)**: **PASS** (Zero errors)
- **Unit Tests (`npx jest`)**: **PASS** (3 passed in `tests/domainMappers.test.ts` validating DTO mapping, score breakdown, and currency/risk formatting).
- **API Smoke Test Result**:
  - Remote Vercel preview domain (`https://mplads-ai.vercel.app`) returned standard `DEPLOYMENT_NOT_FOUND` header (deployment cold).
  - Local direct API client and mapper validation passed against static contract fixtures.
- **Zero Modifications**: No backend code, database schemas, or existing web files were altered.
