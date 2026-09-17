import { WorkCategory } from "@/lib/types";

export interface PeerCostBenchmark {
  workCategory: WorkCategory;
  medianCostINR: number;
  minRangeINR: number;
  maxRangeINR: number;
  stdDevINR: number;
}

// Typical peer group benchmark ranges by work category
export const PEER_BENCHMARKS: Record<WorkCategory, PeerCostBenchmark> = {
  "Roads & Bridges": {
    workCategory: "Roads & Bridges",
    medianCostINR: 3500000,
    minRangeINR: 2800000,
    maxRangeINR: 4200000,
    stdDevINR: 450000,
  },
  "Drinking Water": {
    workCategory: "Drinking Water",
    medianCostINR: 1200000,
    minRangeINR: 800000,
    maxRangeINR: 1600000,
    stdDevINR: 200000,
  },
  "Community Halls": {
    workCategory: "Community Halls",
    medianCostINR: 2500000,
    minRangeINR: 1900000,
    maxRangeINR: 3100000,
    stdDevINR: 350000,
  },
  "School Infrastructure": {
    workCategory: "School Infrastructure",
    medianCostINR: 2200000,
    minRangeINR: 1600000,
    maxRangeINR: 2800000,
    stdDevINR: 300000,
  },
  "Sanitation & Public Health": {
    workCategory: "Sanitation & Public Health",
    medianCostINR: 900000,
    minRangeINR: 600000,
    maxRangeINR: 1200000,
    stdDevINR: 150000,
  },
  "Solar & Street Lighting": {
    workCategory: "Solar & Street Lighting",
    medianCostINR: 750000,
    minRangeINR: 500000,
    maxRangeINR: 1000000,
    stdDevINR: 120000,
  },
};

export interface PeerCostAnalysisResult {
  triggered: boolean;
  points: number;
  ratio: number;
  zScore: number;
  peerMedianINR: number;
  peerRangeMinINR: number;
  peerRangeMaxINR: number;
  reason: string;
}

export function evaluatePeerCostAnomaly(
  workCategory: WorkCategory,
  sanctionedAmountINR: number
): PeerCostAnalysisResult {
  const benchmark = PEER_BENCHMARKS[workCategory] || PEER_BENCHMARKS["Roads & Bridges"];
  const ratio = sanctionedAmountINR / benchmark.medianCostINR;
  const zScore = (sanctionedAmountINR - benchmark.medianCostINR) / benchmark.stdDevINR;

  const costLakhs = (sanctionedAmountINR / 100000).toFixed(1);
  const minLakhs = (benchmark.minRangeINR / 100000).toFixed(1);
  const maxLakhs = (benchmark.maxRangeINR / 100000).toFixed(1);

  if (sanctionedAmountINR > benchmark.maxRangeINR * 1.5) {
    const points = Math.min(25, Math.round(18 + Math.min(7, (ratio - 1.5) * 5)));
    return {
      triggered: true,
      points,
      ratio: Number(ratio.toFixed(2)),
      zScore: Number(zScore.toFixed(2)),
      peerMedianINR: benchmark.medianCostINR,
      peerRangeMinINR: benchmark.minRangeINR,
      peerRangeMaxINR: benchmark.maxRangeINR,
      reason: `Sanctioned cost (₹${costLakhs}L) exceeds peer cohort normal range (₹${minLakhs}L–₹${maxLakhs}L) by ${(ratio * 100 - 100).toFixed(0)}% (z-score +${zScore.toFixed(1)}).`,
    };
  }

  if (sanctionedAmountINR < benchmark.minRangeINR * 0.4) {
    return {
      triggered: true,
      points: 10,
      ratio: Number(ratio.toFixed(2)),
      zScore: Number(zScore.toFixed(2)),
      peerMedianINR: benchmark.medianCostINR,
      peerRangeMinINR: benchmark.minRangeINR,
      peerRangeMaxINR: benchmark.maxRangeINR,
      reason: `Sanctioned cost (₹${costLakhs}L) is severely below peer baseline (₹${minLakhs}L), indicating potential scope truncation.`,
    };
  }

  return {
    triggered: false,
    points: 0,
    ratio: Number(ratio.toFixed(2)),
    zScore: Number(zScore.toFixed(2)),
    peerMedianINR: benchmark.medianCostINR,
    peerRangeMinINR: benchmark.minRangeINR,
    peerRangeMaxINR: benchmark.maxRangeINR,
    reason: `Cost within normal peer range (₹${minLakhs}L–₹${maxLakhs}L, z-score ${zScore >= 0 ? "+" : ""}${zScore.toFixed(1)}).`,
  };
}
