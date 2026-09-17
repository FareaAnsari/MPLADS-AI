import { WorkCategory } from "@/lib/types";
import { evaluatePeerCostAnomaly, PEER_BENCHMARKS } from "./peer-cost";

export interface PreSanctionCheckInput {
  proposedWorkTitle: string;
  workCategory: WorkCategory;
  proposedCostINR: number;
  assignedImplementingRole: string;
  constituencyId: string;
  activeProjectsWithAgencyCount?: number;
}

export interface PreSanctionAssessment {
  canSanction: boolean;
  warningFlags: string[];
  costZScore: number;
  peerCohortMedianINR: number;
  peerCohortRangeMinINR: number;
  peerCohortRangeMaxINR: number;
  agencyCapacityStatus: "Optimal" | "Caution - Elevated Workload" | "Capacity Bottleneck";
  recommendationNote: string;
}

export function runPreSanctionScan(input: PreSanctionCheckInput): PreSanctionAssessment {
  const costEval = evaluatePeerCostAnomaly(input.workCategory, input.proposedCostINR);
  const warningFlags: string[] = [];

  if (costEval.triggered) {
    warningFlags.push(costEval.reason);
  }

  // Agency workload capacity check
  const agencyCount = input.activeProjectsWithAgencyCount ?? 3;
  let agencyCapacity: PreSanctionAssessment["agencyCapacityStatus"] = "Optimal";
  if (agencyCount >= 8) {
    agencyCapacity = "Capacity Bottleneck";
    warningFlags.push(
      `Agency role '${input.assignedImplementingRole}' manages ${agencyCount} active delayed works; risk of execution delay.`
    );
  } else if (agencyCount >= 5) {
    agencyCapacity = "Caution - Elevated Workload";
  }

  const canSanction = warningFlags.length === 0 || !costEval.triggered;

  let recommendationNote = "Proposed project cost and agency workload conform to peer cohort parameters. Safe to sanction.";
  if (warningFlags.length > 0) {
    recommendationNote = `Pre-sanction advisory: ${warningFlags.join(" ")} Officer concurrence required before formal sanction order.`;
  }

  return {
    canSanction,
    warningFlags,
    costZScore: costEval.zScore,
    peerCohortMedianINR: costEval.peerMedianINR,
    peerCohortRangeMinINR: costEval.peerRangeMinINR,
    peerCohortRangeMaxINR: costEval.peerRangeMaxINR,
    agencyCapacityStatus: agencyCapacity,
    recommendationNote,
  };
}
