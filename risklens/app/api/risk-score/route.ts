import { NextRequest, NextResponse } from "next/server";
import { computeRiskScore } from "@/lib/engine/risk-score";
import { getProjectById, getProjects } from "@/lib/synthetic/fixtures/dataset";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Query parameter 'projectId' is required" },
      { status: 400 }
    );
  }

  const project = getProjectById(projectId);
  if (!project) {
    return NextResponse.json(
      { error: `Project '${projectId}' not found in registry.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    projectId: project.id,
    riskScore: project.riskScore,
    provenance: {
      source: "RiskLens Explainable Fusion Engine v2.1",
      dataSource: project.dataSource,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const allProjects = getProjects();
    const allContext = allProjects.map((p) => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      workCategory: p.workCategory,
      photos: p.photos,
    }));

    const score = computeRiskScore({
      ...body,
      allProjectsContext: allContext,
    });

    return NextResponse.json({
      riskScore: score,
      algorithm: "RiskLens-v2.1",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid calculation payload", details: error?.message },
      { status: 400 }
    );
  }
}
