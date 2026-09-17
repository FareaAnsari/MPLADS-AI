import { PaymentTranche, StageEvent, EvidencePhoto } from "@/lib/types";

export interface RuleCheckResult {
  triggered: boolean;
  points: number;
  reason: string;
}

/**
 * Checks compliance rules for payment disbursements, timelines, and mandatory documentation.
 */
export function checkComplianceRules(
  sanctionDate: string,
  tranches: PaymentTranche[],
  stageEvents: StageEvent[],
  photos: EvidencePhoto[]
): RuleCheckResult {
  const sanctionTimestamp = new Date(sanctionDate).getTime();

  // Rule 1: Disbursement issued prior to sanction order date
  for (const tranche of tranches) {
    const trancheTimestamp = new Date(tranche.disbursedDate).getTime();
    if (trancheTimestamp < sanctionTimestamp) {
      return {
        triggered: true,
        points: 15,
        reason: `Payment tranche #${tranche.trancheNumber} disbursed on ${tranche.disbursedDate} predates statutory sanction date ${sanctionDate}.`,
      };
    }
  }

  // Rule 2: Multiple disbursements released without Utilization Certificate (UC)
  const missingUCs = tranches.filter(
    (t, idx) => idx > 0 && !t.utilizationCertificateSubmitted
  );
  if (missingUCs.length > 0) {
    return {
      triggered: true,
      points: 12,
      reason: `Tranche #${missingUCs[0].trancheNumber} released without mandatory prior Utilization Certificate (UC) on file.`,
    };
  }

  // Rule 3: Missing site inspection photo for advanced/completion tranches
  if (tranches.length >= 2 && photos.length === 0) {
    return {
      triggered: true,
      points: 10,
      reason: "Multiple payment tranches released without uploaded photographic site verification.",
    };
  }

  return {
    triggered: false,
    points: 0,
    reason: "All statutory payment milestones and documentation rules satisfied.",
  };
}
