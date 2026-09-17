# RiskLens Design System & Theme Specification

## 1. Color System & Rules

### Brand & Primary Color
- **Navy Primary**: `hsl(222, 47%, 11%)` (`#0f172a` / `slate-900`)
- **Civic Trust Blue**: `hsl(217, 91%, 60%)` (`#2563eb` / `blue-600`)
- **Primary Text**: `hsl(222, 47%, 11%)` on light backgrounds; crisp high-contrast legibility.

### Neutral Scale
- **Canvas / Background**: `hsl(210, 40%, 98%)` (`#f8fafc` / `slate-50`)
- **Surface / Card**: `#ffffff` (`bg-white`)
- **Borders & Dividers**: `hsl(214, 32%, 91%)` (`#e2e8f0` / `slate-200`)
- **Muted Text / Secondary**: `hsl(215, 16%, 47%)` (`#64748b` / `slate-500`)

### RESERVED ALERT-ACCENT COLOR (MANDATORY RULE)
- **Reserved Alert Accent**: `hsl(0, 84%, 60%)` / `hsl(350, 89%, 60%)` (`#ef4444` / `rose-600` / `red-600`)
> [!CAUTION]
> **STRICT RULE**: The alert-accent color (`red-600` / `rose-600`) is **strictly reserved** for high-risk scores, overdue SLA delays, critical evidence contradictions, and confirmed issue escalation actions. It MUST NEVER be used for decorative borders, primary action buttons, generic icons, marketing accents, or standard notification pings.

### Supporting Diagnostic Status Tokens
- **Low Risk / Supporting Claim**: `hsl(142, 71%, 45%)` (`emerald-600`)
- **Moderate Risk / Inconclusive**: `hsl(38, 92%, 50%)` (`amber-500`)
- **Missing / Unavailable**: `hsl(215, 16%, 60%)` (`slate-400`)

---

## 2. Storage Architecture Decision: Typed JSON Fixtures
- **Decision**: To ensure deterministic, lightning-fast rendering without external database dependencies, native SQLite file locks, or network vulnerabilities during live judge presentations, RiskLens employs **typed JSON fixtures** and a deterministic synthetic dataset pipeline in `/lib/synthetic/fixtures/` and `/lib/synthetic/generate.ts`.
- All operations adhere strictly to the TypeScript interfaces defined in `/lib/types.ts`.
