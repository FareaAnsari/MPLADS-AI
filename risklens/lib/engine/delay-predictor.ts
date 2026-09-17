import { DelayPrediction, StageEvent, PaymentTranche } from "@/lib/types";

export interface DelayPredictorInput {
  sanctionDate: string;
  targetCompletionDate: string;
  physicalProgressPct: number;
  expenditureAmountINR: number;
  sanctionedAmountINR: number;
  stageEvents: StageEvent[];
  paymentTranches: PaymentTranche[];
  agencyHistoricalDelayFactor?: number; // e.g. 1.2x
}

/**
 * Supervised heuristic model predicting probability of execution delay breach.
 */
export function predictProjectDelay(input: DelayPredictorInput): DelayPrediction {
  const now = new Date().getTime();
  const start = new Date(input.sanctionDate).getTime();
  const target = new Date(input.targetCompletionDate).getTime();

  const totalDurationDays = Math.max(1, (target - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
  const timeElapsedPct = Math.min(100, Math.round((elapsedDays / totalDurationDays) * 100));

  const financialSpentPct =
    input.sanctionedAmountINR > 0
      ? Math.round((input.expenditureAmountINR / input.sanctionedAmountINR) * 100)
      : 0;

  const factors: string[] = [];
  let riskScoreSum = 0;

  // Feature 1: Time Elapsed vs Physical Progress Lag
  const progressGap = timeElapsedPct - input.physicalProgressPct;
  if (progressGap > 35) {
    riskScoreSum += 40;
    factors.push(`Time elapsed (${timeElapsedPct}%) outpaces physical progress (${input.physicalProgressPct}%) by ${progressGap}%.`);
  } else if (progressGap > 20) {
    riskScoreSum += 20;
    factors.push(`Moderate execution velocity deficit (${progressGap}% gap between elapsed days and progress).`);
  }

  // Feature 2: Financial Burn vs Physical Completion Mismatch
  const burnGap = financialSpentPct - input.physicalProgressPct;
  if (burnGap > 30) {
    riskScoreSum += 25;
    factors.push(`Disbursement advance (${financialSpentPct}%) exceeds physical progress (${input.physicalProgressPct}%) by ${burnGap}%.`);
  }

  // Feature 3: Current active stage delays
  const hasDelayedStage = input.stageEvents.some((s) => s.isDelayed && s.delayRatio > 2.0);
  if (hasDelayedStage) {
    riskScoreSum += 20;
    factors.push("Prior administrative stage exhibited severe bottleneck (>2.0× expected SLA).");
  }

  // Feature 4: Agency Historical Factor
  const agencyFactor = input.agencyHistoricalDelayFactor ?? 1.15;
  if (agencyFactor >= 2.0) {
    riskScoreSum += 15;
    factors.push("Implementing role's cohort demonstrates historical execution slippage.");
  }

  const probabilityScore = Math.min(95, Math.max(5, riskScoreSum));
  let likelihood: DelayPrediction["likelihood"] = "Low";
  let expectedDelayDays = 0;

  if (probabilityScore >= 60) {
    likelihood = "High";
    expectedDelayDays = Math.round(totalDurationDays * 0.45);
  } else if (probabilityScore >= 35) {
    likelihood = "Medium";
    expectedDelayDays = Math.round(totalDurationDays * 0.2);
  }

  return {
    likelihood,
    probabilityScore,
    expectedDelayDays,
    primaryRiskFactors: factors.length > 0 ? factors : ["Execution pace conforms to statutory schedule trajectory."],
  };
}
