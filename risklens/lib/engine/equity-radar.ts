import { Constituency, Project } from "@/lib/types";

export interface ConstituencyEquityMetric {
  constituencyId: string;
  stateCode: string;
  totalWorksCount: number;
  entitlementSanctionedINR: number;
  utilizationRatePct: number; // Disbursed / Sanctioned
  inspectionCoveragePct: number; // Inspected works / Total works
  sanctionVelocityScore: number; // 0 - 100
  isUnderServed: boolean;
  neglectSeverityTier: "Normal" | "Attention Required" | "Critically Underserved";
  equityRationale: string;
}

export function evaluateConstituencyEquity(
  constituency: Constituency,
  constituencyProjects: Project[]
): ConstituencyEquityMetric {
  const totalWorks = constituencyProjects.length;
  const sanctioned = constituencyProjects.reduce((acc, p) => acc + p.sanctionedAmountINR, 0);
  const disbursed = constituencyProjects.reduce((acc, p) => acc + p.expenditureAmountINR, 0);

  const utilizationRatePct =
    sanctioned > 0 ? Math.round((disbursed / sanctioned) * 100) : 0;

  // Estimate inspection coverage based on completed stage events
  const inspectedCount = constituencyProjects.filter((p) =>
    p.stageEvents.some((s) => s.completionDate)
  ).length;
  const inspectionCoveragePct =
    totalWorks > 0 ? Math.round((inspectedCount / totalWorks) * 100) : 0;

  const isLowUtilization = utilizationRatePct < 40;
  const isLowCoverage = inspectionCoveragePct < 25;
  const isSparseWorks = totalWorks < 4;

  let isUnderServed = false;
  let neglectSeverityTier: ConstituencyEquityMetric["neglectSeverityTier"] = "Normal";
  let equityRationale = "Constituency fund allocation and utilization track within standard national percentiles.";

  if (constituency.isNeglectedEquityFlagged || (isLowUtilization && isLowCoverage)) {
    isUnderServed = true;
    neglectSeverityTier = "Critically Underserved";
    equityRationale = `Low disbursement rate (${utilizationRatePct}%) compounded by severe inspection deficit (${inspectionCoveragePct}% coverage). Attention warranted to expedite sanctioning.`;
  } else if (isLowUtilization || isSparseWorks) {
    isUnderServed = true;
    neglectSeverityTier = "Attention Required";
    equityRationale = `Under-allocation observed: only ${totalWorks} works sanctioned against ₹5.00 Cr annual entitlement cap.`;
  }

  return {
    constituencyId: constituency.id,
    stateCode: constituency.stateCode,
    totalWorksCount: totalWorks,
    entitlementSanctionedINR: sanctioned,
    utilizationRatePct,
    inspectionCoveragePct,
    sanctionVelocityScore: Math.round(Math.min(100, utilizationRatePct * 0.7 + inspectionCoveragePct * 0.3)),
    isUnderServed,
    neglectSeverityTier,
    equityRationale,
  };
}
