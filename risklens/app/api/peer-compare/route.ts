import { NextRequest, NextResponse } from "next/server";
import { PEER_BENCHMARKS, evaluatePeerCostAnomaly } from "@/lib/engine/peer-cost";
import { WorkCategory } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as WorkCategory;
  const amountStr = searchParams.get("amount");

  if (!category || !PEER_BENCHMARKS[category]) {
    return NextResponse.json({
      allBenchmarks: PEER_BENCHMARKS,
    });
  }

  const amount = amountStr ? parseFloat(amountStr) : PEER_BENCHMARKS[category].medianCostINR;
  const comparison = evaluatePeerCostAnomaly(category, amount);

  return NextResponse.json({
    category,
    amountINR: amount,
    benchmark: PEER_BENCHMARKS[category],
    evaluation: comparison,
  });
}
