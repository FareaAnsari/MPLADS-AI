import { StageEvent } from "@/lib/types";

export interface SlaAnalysisResult {
  triggered: boolean;
  points: number;
  maxDelayRatio: number;
  bottleneckStage?: string;
  attributedRole?: string;
  reason: string;
}

/**
 * Statutory SLA Norms:
 * - Administrative Sanction: 45 days
 * - Technical Sanction & Tendering: 60 days
 * - Project Execution & Handover: 365 days
 */
export function evaluateSlaBottlenecks(stageEvents: StageEvent[]): SlaAnalysisResult {
  if (!stageEvents || stageEvents.length === 0) {
    return {
      triggered: false,
      points: 0,
      maxDelayRatio: 1.0,
      reason: "No active stage delay flags identified.",
    };
  }

  let worstEvent: StageEvent | null = null;
  let highestRatio = 1.0;

  for (const event of stageEvents) {
    const ratio = event.actualDays / Math.max(1, event.expectedDays);
    if (ratio > highestRatio) {
      highestRatio = ratio;
      worstEvent = event;
    }
  }

  if (worstEvent && highestRatio >= 3.0) {
    // 3x to 5x SLA delay
    const points = Math.min(20, Math.round(14 + Math.min(6, (highestRatio - 3.0) * 3)));
    return {
      triggered: true,
      points,
      maxDelayRatio: Number(highestRatio.toFixed(1)),
      bottleneckStage: worstEvent.stageName,
      attributedRole: worstEvent.responsibleRole,
      reason: `Bottleneck in '${worstEvent.stageName}' exceeded statutory SLA by ${highestRatio.toFixed(1)}× (assigned to: ${worstEvent.responsibleRole}).`,
    };
  }

  if (worstEvent && highestRatio >= 1.75) {
    return {
      triggered: true,
      points: 8,
      maxDelayRatio: Number(highestRatio.toFixed(1)),
      bottleneckStage: worstEvent.stageName,
      attributedRole: worstEvent.responsibleRole,
      reason: `Moderate delay in '${worstEvent.stageName}' (${highestRatio.toFixed(1)}× expected days, assigned to: ${worstEvent.responsibleRole}).`,
    };
  }

  return {
    triggered: false,
    points: 0,
    maxDelayRatio: Number(highestRatio.toFixed(1)),
    reason: "Stage execution progressing within statutory timeline boundaries.",
  };
}
