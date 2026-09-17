export type WorkCategory =
  | "Roads & Bridges"
  | "Drinking Water"
  | "Community Halls"
  | "School Infrastructure"
  | "Sanitation & Public Health"
  | "Solar & Street Lighting";

export type ProjectStatus =
  | "Recommended"
  | "Sanctioned"
  | "In Progress"
  | "Completed"
  | "Delayed"
  | "Under Review";

export type DataSourceType = "synthetic" | "public";

export interface DataSourceBadgeProps {
  type: DataSourceType;
  className?: string;
}

export interface PaymentTranche {
  trancheNumber: number;
  amountINR: number;
  disbursedDate: string;
  stageMilestone: string;
  utilizationCertificateSubmitted: boolean;
  voucherRefNumber?: string;
}

export interface StageEvent {
  stageName: string;
  expectedDays: number;
  actualDays: number;
  startDate: string;
  completionDate?: string;
  responsibleRole: string; // e.g. "District Planning Officer IDA", "Executive Engineer PWD" - NEVER personal names
  isDelayed: boolean;
  delayRatio: number;
  physicalProgressAtStage?: number; // 0 - 100%
}

export interface EvidencePhoto {
  id: string;
  url: string;
  caption: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  pHash: string; // 64-bit hexadecimal perceptual hash
  matchedPhotoId?: string;
  matchedProjectId?: string;
  hammingDistance?: number;
  isDuplicateFlagged?: boolean;
  isCryptographicallySigned?: boolean;
  signatureHash?: string;
  deviceFingerprint?: string;
}

export interface SignalBreakdownItem {
  signal:
    | "cost_anomaly"
    | "sla_delay"
    | "payment_anomaly"
    | "gis_similarity"
    | "photo_similarity"
    | "progress_mismatch"
    | "fiscal_rush"
    | "cross_scheme";
  label: string;
  points: number;
  maxPoints: number;
  reason: string;
  isTriggered: boolean;
}

export interface RiskTimelinePoint {
  date: string;
  score: number;
  triggerEvent: string;
}

export interface RiskScore {
  compositeScore: number; // 0 - 100
  tier: "low" | "moderate" | "high";
  whyFlaggedSummary: string;
  breakdown: SignalBreakdownItem[];
  calculatedAt: string;
  algorithmVersion: string;
  history?: RiskTimelinePoint[];
}

export interface DelayPrediction {
  likelihood: "Low" | "Medium" | "High";
  probabilityScore: number; // 0 - 100%
  expectedDelayDays: number;
  primaryRiskFactors: string[];
}

export interface CitizenSubmission {
  id: string;
  projectId: string;
  photoUrl: string;
  submittedAt: string;
  latitude: number;
  longitude: number;
  pHash: string;
  verificationMatch: boolean;
  notes: string;
}

export interface CrossSchemeDuplicate {
  matchedScheme: "PMGSY (Rural Roads)" | "MLA-LAD (State)" | "15th Finance Commission Grant";
  externalProjectId: string;
  assetDescription: string;
  sanctionedAmountINR: number;
  spatialDistanceMeters: number;
  textOverlapScore: number; // 0 - 100%
}

export interface Constituency {
  id: string; // e.g. "Constituency A-01"
  stateCode: string; // e.g. "State X", "State Y"
  totalProjects: number;
  totalSanctionedINR: number;
  totalDisbursedINR: number;
  averageRiskScore: number;
  openFlaggedCasesCount: number;
  avatarSeed: string;
  utilizationRatePct?: number;
  inspectionCoveragePct?: number;
  isNeglectedEquityFlagged?: boolean;
}

export interface InvestigationCase {
  id: string;
  projectId: string;
  status: "Open" | "Under Review" | "Resolved - False Alarm" | "Resolved - Corrective Action Required" | "Escalated";
  flaggedSignals: string[];
  officerAction?: "Mark False Alarm" | "Needs More Evidence" | "Confirm Issue";
  actionNotes?: string;
  actedByRole?: string; // e.g. "District Planning Authority"
  actedAt?: string;
  escalationLevel?: "District" | "State Nodal" | "Ministry / CVC";
  escalatedTo?: string;
}

export interface Project {
  id: string; // e.g. "PRJ-2024-001" or "HERO-MPLADS-001"
  title: string;
  description?: string;
  workCategory: WorkCategory;
  constituencyId: string;
  stateCode: string;
  sanctionedAmountINR: number;
  expenditureAmountINR: number;
  physicalProgressPct: number; // 0 - 100%
  peerGroupMedianINR: number;
  peerGroupRangeMinINR: number;
  peerGroupRangeMaxINR: number;
  sanctionDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  latitude: number;
  longitude: number;
  implementingAgencyRole: string; // Role designation only
  contractorEntityId?: string; // e.g. "ENT-PWD-CORP-42"
  paymentTranches: PaymentTranche[];
  stageEvents: StageEvent[];
  photos: EvidencePhoto[];
  riskScore: RiskScore;
  delayPrediction?: DelayPrediction;
  crossSchemeMatch?: CrossSchemeDuplicate;
  citizenSubmissions?: CitizenSubmission[];
  investigationCase?: InvestigationCase;
  synthetic: boolean;
  dataSource: DataSourceType;
}

export type UserRole = "mp" | "district" | "state" | "ministry";

export interface DemoSession {
  role: UserRole;
  roleTitle: string;
  jurisdiction: string;
  badge: string;
}
