# Phase 5 — Shared UI System, Localization & Accessibility Architecture

## 1. Executive Summary

Phase 5 establishes a unified, accessible, and bilingual presentation foundation for the MPLADS-AI (`Pratyaksh`) mobile application. The implementation adheres strictly to Clean Architecture principles, preserving existing domain/data boundaries while decoupling presentation logic from raw hardcoded strings and ad-hoc styling.

---

## 2. Shared UI Design System & Tokens

The design language respects statutory Ministry of Statistics and Programme Implementation (MoSPI) and Government of India institutional aesthetics.

### 2.1 Design Tokens (`src/ui/theme`)
- **Primary Statutory Green**: `#0B4D3C` (MoSPI Institutional Green) & `#083B2E` (Primary Dark)
- **Secondary Saffron Accents**: `#C67D0A`
- **Statutory Risk Classifications**:
  - `riskLow` (`#10B981` / background: `#ECFDF5`)
  - `riskMedium` (`#F59E0B` / background: `#FFFBEB`)
  - `riskHigh` (`#EF4444` / background: `#FEF2F2`)
  - `riskCritical` (`#7F1D1D` / background: `#450A0A`)
- **Typography**: Semantic scale (`display`, `h1`, `h2`, `h3`, `title`, `bodyLarge`, `body`, `bodyMedium`, `bodySmall`, `label`, `caption`)
- **Radii & Spacing**: 4pt baseline grid (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `2xl: 24`, `3xl: 32`)

### 2.2 Shared UI Component Primitives (`src/ui/components`)
1. **`Screen`**: Safe-area aware, scroll/static container with keyboard-avoiding capabilities.
2. **`Text`**: Semantic typography token binding with color override and text alignment props.
3. **`Button`**: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), supporting `loading`, `disabled`, and pressed states with minimum 44pt touch targets.
4. **`Card`**: Elevated surface container supporting interactive and static variants.
5. **`Badge`**: Status and risk indicators combining text label + background semantics.
6. **`TextField`**: Form input with required indicators (`*`), hint text, inline error state (`accessibilityHint` and `accessibilityLabel` bindings), and secure text toggle.
7. **`EmptyState`**: Standardized empty list/records presentation with iconography and action triggers.
8. **`ErrorState`**: Alert container for network timeouts or service interruptions with retry triggers.
9. **`LanguageSelector`**: Accessible dual-toggle control (`English` / `हिंदी`) directly driving application locale state.
10. **`AuthGuard`**: Protected route decorator verifying RBAC permissions before rendering.
11. **`ErrorBoundary`**: Root and section level crash resilience shield.

---

## 3. Bilingual Localization Architecture (`src/i18n`)

### 3.1 Supported Locales
- **English**: `en-IN` (Default locale)
- **Hindi**: `hi-IN` (Formal statutory Hindi translated for public clarity)

### 3.2 Directory & Namespace Structure
```text
src/i18n/
├── types.ts          # Type-safe dictionary schema
├── locales/
│   ├── en-IN.ts      # English translation dictionary
│   └── hi-IN.ts      # Hindi translation dictionary
└── index.ts          # t(key, params), useTranslation() hook, DICTIONARIES
```

### 3.3 Semantic Translation Namespaces
- `common`: Global actions, branding, network status (`appName`, `loading`, `retry`, `submit`, `cancel`, `search`)
- `auth`: Access gateway, credentials, biometric unlock (`title`, `usernameOrEmail`, `password`, `signIn`, `sessionExpired`)
- `navigation`: Role portals and navigation tabs (`home`, `citizenPortal`, `districtOfficer`, `mpOffice`, `contractorPortal`)
- `projects`: Project records and attributes (`workId`, `sanctionedAmount`, `disbursedAmount`, `stage`, `district`, `mpName`)
- `risk`: AI statutory risk indicators (`compositeScore`, `lowRisk`, `mediumRisk`, `highRisk`, `criticalRisk`, `outlierDeviation`)
- `evidence`: Geotagged submissions (`submitEvidence`, `distanceProximity`, `verifiedMatch`, `liveCameraRequired`)
- `inspections`: Route optimization & itineraries (`itinerary`, `priorityRank`, `distanceFromBase`)
- `errors`: Safe, user-friendly statutory error messages (`generic`, `network`, `timeout`, `unauthorized`, `forbidden`, `notFound`)

### 3.4 Fallback & Interpolation
- **Fallback Hierarchy**: `Target Locale` → `en-IN` → `Raw Key Path`.
- **Dynamic Parameter Interpolation**: Uses `{{paramName}}` pattern (e.g. `t('projects.count', { count: 5 })`).
- **State Management**: Language preference is stored in `useAppStore` (`Zustand`) and does not mix with authentication tokens or sensitive server cache.

---

## 4. Accessibility Architecture (WCAG 2.1 AA / Screen Reader Ready)

1. **Never Color Alone**: Statuses (e.g. risk indicators, errors, approvals) always present explicit textual descriptions alongside color indicators.
2. **Explicit Semantic Roles**: Interactive elements utilize `accessibilityRole` (`button`, `radio`, `radiogroup`, `alert`, `text`).
3. **Labels & Hints**:
   - `TextField`: `accessibilityLabel="${label}, required"`, `accessibilityHint="Error: ${error}"`.
   - `Button`: Announces busy state (`accessibilityState={{ busy: loading, disabled }}`).
   - `LanguageSelector`: Radio button state announced with localized description.
4. **Touch Targets**: All interactive elements enforce minimum 44px hit bounds.
5. **No Token Leaks in A11y**: Accessibility strings strictly exclude sensitive credentials or internal tokens.

---

## 5. Verification & Test Suite

### 5.1 Test Execution
Ran TypeScript compiler and Jest test suite in `mobile/`:
```bash
npx tsc --noEmit && npx jest
```

### 5.2 Test Results
```text
PASS tests/localizationAccessibility.test.ts
PASS tests/authRBAC.test.ts
PASS tests/domainMappers.test.ts

Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        1.655 s
```

---

## 6. Known Limitations

- **Font Files**: Native font bundling uses system default typography matching standard React Native sans-serif fonts; custom TTF fonts for Devanagari (e.g., Noto Sans Devanagari) can be registered via `expo-font` in a later release if brand-specific typefaces are mandated.
- **RTL Support**: Hindi and English are both LTR (Left-to-Right) scripts; RTL layout inversion is not required for this phase.
