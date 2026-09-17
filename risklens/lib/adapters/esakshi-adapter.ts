import { Project, PaymentTranche, StageEvent, EvidencePhoto, WorkCategory, ProjectStatus } from "@/lib/types";

/**
 * eSAKSHI Official Schema Input Format Definition.
 * Mirrors the data dictionary used in the Ministry of Statistics and Programme Implementation (MoSPI)
 * eSAKSHI portal for MPLADS works.
 */
export interface EsakshiRawRecord {
  recommendation_id: string; // e.g. "REC/2024/0918"
  work_title: string;
  category_name: string;
  constituency_code: string; // Anonymized e.g. "Constituency A-04"
  state_identifier: string; // Anonymized e.g. "State X"
  sanction_order_no: string;
  sanction_order_date: string;
  estimated_cost_inr: number;
  expenditure_inr: number;
  implementing_agency_designation: string; // Strict role-only
  target_completion_date: string;
  actual_completion_date?: string;
  latitude: number;
  longitude: number;
  disbursement_milestones: Array<{
    tranche: number;
    amount: number;
    date: string;
    milestone_description: string;
    has_utilization_certificate: boolean;
  }>;
  stage_history: Array<{
    stage: string;
    normative_sla_days: number;
    actual_taken_days: number;
    start_date: string;
    end_date?: string;
    assigned_role: string;
  }>;
  inspections_and_evidence: Array<{
    photo_id: string;
    image_uri: string;
    description: string;
    timestamp: string;
    lat: number;
    lng: number;
    phash_fingerprint: string;
  }>;
}

/**
 * Normalizes eSAKSHI official records into RiskLens domain model.
 */
export function normalizeEsakshiRecord(raw: EsakshiRawRecord): Omit<Project, "riskScore" | "investigationCase"> {
  const tranches: PaymentTranche[] = raw.disbursement_milestones.map((m) => ({
    trancheNumber: m.tranche,
    amountINR: m.amount,
    disbursedDate: m.date,
    stageMilestone: m.milestone_description,
    utilizationCertificateSubmitted: m.has_utilization_certificate,
    voucherRefNumber: `VCH-${raw.recommendation_id.slice(-4)}-${m.tranche}`,
  }));

  const stageEvents: StageEvent[] = raw.stage_history.map((s) => ({
    stageName: s.stage,
    expectedDays: s.normative_sla_days,
    actualDays: s.actual_taken_days,
    startDate: s.start_date,
    completionDate: s.end_date,
    responsibleRole: s.assigned_role,
    isDelayed: s.actual_taken_days > s.normative_sla_days,
    delayRatio: Number((s.actual_taken_days / s.normative_sla_days).toFixed(2)),
  }));

  const photos: EvidencePhoto[] = raw.inspections_and_evidence.map((p) => ({
    id: p.photo_id,
    url: p.image_uri,
    caption: p.description,
    capturedAt: p.timestamp,
    latitude: p.lat,
    longitude: p.lng,
    pHash: p.phash_fingerprint,
  }));

  let status: ProjectStatus = "In Progress";
  if (raw.actual_completion_date) {
    status = "Completed";
  } else if (stageEvents.some((s) => s.isDelayed && s.delayRatio > 2.0)) {
    status = "Delayed";
  }

  return {
    id: raw.recommendation_id,
    title: raw.work_title,
    workCategory: raw.category_name as WorkCategory,
    constituencyId: raw.constituency_code,
    stateCode: raw.state_identifier,
    sanctionedAmountINR: raw.estimated_cost_inr,
    expenditureAmountINR: raw.expenditure_inr,
    physicalProgressPct: raw.actual_completion_date ? 100 : Math.min(100, Math.round((raw.expenditure_inr / Math.max(1, raw.estimated_cost_inr)) * 100)),
    peerGroupMedianINR: raw.estimated_cost_inr * 0.85,
    peerGroupRangeMinINR: raw.estimated_cost_inr * 0.7,
    peerGroupRangeMaxINR: raw.estimated_cost_inr * 1.15,
    sanctionDate: raw.sanction_order_date,
    targetCompletionDate: raw.target_completion_date,
    actualCompletionDate: raw.actual_completion_date,
    status,
    latitude: raw.latitude,
    longitude: raw.longitude,
    implementingAgencyRole: raw.implementing_agency_designation,
    paymentTranches: tranches,
    stageEvents,
    photos,
    synthetic: true,
    dataSource: "synthetic",
  };
}
