import { NextRequest, NextResponse } from "next/server";
import { calculateHammingDistance } from "@/lib/engine/phash";
import { getProjects } from "@/lib/synthetic/fixtures/dataset";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get("hash");
  const threshold = parseInt(searchParams.get("threshold") || "10", 10);

  if (!hash) {
    return NextResponse.json(
      { error: "Query parameter 'hash' is required" },
      { status: 400 }
    );
  }

  const projects = getProjects();
  const matches: Array<{
    projectId: string;
    photoId: string;
    url: string;
    hammingDistance: number;
    similarityPercent: number;
  }> = [];

  for (const proj of projects) {
    for (const photo of proj.photos) {
      const dist = calculateHammingDistance(hash, photo.pHash);
      if (dist <= threshold) {
        matches.push({
          projectId: proj.id,
          photoId: photo.id,
          url: photo.url,
          hammingDistance: dist,
          similarityPercent: Math.round(100 - (dist / 64) * 100),
        });
      }
    }
  }

  return NextResponse.json({
    queryHash: hash,
    threshold,
    totalMatches: matches.length,
    matches,
  });
}
