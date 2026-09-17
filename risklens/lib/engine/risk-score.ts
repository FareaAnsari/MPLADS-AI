import {
  Project,
  RiskScore,
  SignalBreakdownItem,
  WorkCategory,
  PaymentTranche,
  StageEvent,
  EvidencePhoto,
} from "@/lib/types";
import { evaluatePeerCostAnomaly } from "./peer-cost";
import { evaluateSlaBottlenecks } from "./sla-tracker";
import { checkComplianceRules } from "./rules";
import { detectDuplicatePhotos } from "./phash";
import { evaluateGisSimilarity } from "./gis-similarity";

export interface ComputeRiskInput {
  id: string;
  workCategory: WorkCategory;
  sanctionedAmountINR: number;
  sanctionDate: string;
  latitude: number;
  longitude: number;
  paymentTranches: PaymentTranche[];
  stageEvents: StageEvent[];
  photos: EvidencePhoto[];
  allProjectsContext?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    workCategory: WorkCategory;
    photos: EvidencePhoto[];
  }>;
}

export function computeRiskScore(input: ComputeRiskInput): RiskScore {
  const costResult = evaluatePeerCostAnomaly(
    input.workCategory,
    input.sanctionedAmountINR
  );

  const slaResult = evaluateSlaBottlenecks(input.stageEvents);

  const rulesResult = checkComplianceRules(
    input.sanctionDate,
    input.paymentTranches,
    input.stageEvents,
    input.photos
  );

  const photoCandidatePool =
    input.allProjectsContext?.map((p) => ({
      projectId: p.id,
      photos: p.photos,
    })) || [];

  const photoResult = detectDuplicatePhotos(input.photos, photoCandidatePool);

  const gisPool =
    input.allProjectsContext?.map((p) => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      workCategory: p.workCategory,
    })) || [];

  const gisResult = evaluateGisSimilarity(
    input.latitude,
    input.longitude,
    input.workCategory,
    input.id,
    gisPool
  );

  const breakdown: SignalBreakdownItem[] = [
    {
      signal: "cost_anomaly",
      label: "Peer Cost Outlier",
      points: costResult.points,
      maxPoints: 25,
      reason: costResult.reason,
      isTriggered: costResult.triggered,
    },
    {
      signal: "sla_delay",
      label: "Stage SLA Bottleneck",
      points: slaResult.points,
      maxPoints: 20,
      reason: slaResult.reason,
      isTriggered: slaResult.triggered,
    },
    {
      signal: "payment_anomaly",
      label: "Disbursement & UC Compliance",
      points: rulesResult.points,
      maxPoints: 15,
      reason: rulesResult.reason,
      isTriggered: rulesResult.triggered,
    },
    {
      signal: "photo_similarity",
      label: "Duplicate Evidence (pHash)",
      points: photoResult.points,
      maxPoints: 20,
      reason: photoResult.reason,
      isTriggered: photoResult.triggered,
    },
    {
      signal: "gis_similarity",
      label: "GIS Spatial Overlap",
      points: gisResult.points,
      maxPoints: 16,
      reason: gisResult.reason,
      isTriggered: gisResult.triggered,
    },
  ];

  const totalPoints = breakdown.reduce((acc, item) => acc + item.points, 0);
  const compositeScore = Math.min(100, Math.max(0, totalPoints));

  let tier: "low" | "moderate" | "high" = "low";
  if (compositeScore >= 60) {
    tier = "high";
  } else if (compositeScore >= 35) {
    tier = "moderate";
  }

  // Generate concise why-flagged summary strictly adhering to neutral vocabulary
  const triggeredItems = breakdown.filter((b) => b.isTriggered);
  let whyFlaggedSummary = "Project metrics align with cohort baselines; no priority anomalies observed.";
  if (triggeredItems.length > 0) {
    const reasons = triggeredItems.map((t) => t.label).join(", ");
    whyFlaggedSummary = `Flagged for verification due to: ${reasons}. Review recommended.`;
  }

  return {
    compositeScore,
    tier,
    whyFlaggedSummary,
    breakdown,
    calculatedAt: new Date().toISOString(),
    algorithmVersion: "RiskLens-v2.1",
  };
}
