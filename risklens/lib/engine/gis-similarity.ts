import { WorkCategory } from "@/lib/types";

export interface GisProximityResult {
  triggered: boolean;
  points: number;
  nearbySimilarCount: number;
  nearestDistanceMeters: number;
  matchedProjectId?: string;
  textOverlapSimilarity?: number; // 0 - 100%
  reason: string;
}

export function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Basic Jaccard word n-gram text similarity for asset descriptions.
 */
export function calculateTextOverlap(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const wordsA = new Set(
    textA.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3)
  );
  const wordsB = new Set(
    textB.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3)
  );

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });

  const union = wordsA.size + wordsB.size - intersection;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100);
}

export function evaluateGisSimilarity(
  currentLat: number,
  currentLon: number,
  currentCategory: WorkCategory,
  currentProjectId: string,
  allProjects: Array<{
    id: string;
    latitude: number;
    longitude: number;
    workCategory: WorkCategory;
    title?: string;
  }>
): GisProximityResult {
  let nearbyCount = 0;
  let minDistance = Infinity;
  let closestMatchId: string | undefined;
  let maxTextOverlap = 0;

  const currentProject = allProjects.find((p) => p.id === currentProjectId);
  const currentTitle = currentProject?.title || "";

  for (const p of allProjects) {
    if (p.id === currentProjectId) continue;
    if (p.workCategory === currentCategory) {
      const dist = calculateHaversineMeters(currentLat, currentLon, p.latitude, p.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestMatchId = p.id;
      }
      if (dist <= 150) {
        nearbyCount++;
        const overlap = calculateTextOverlap(currentTitle, p.title || "");
        if (overlap > maxTextOverlap) {
          maxTextOverlap = overlap;
        }
      }
    }
  }

  if (nearbyCount >= 1 && minDistance <= 150) {
    const points = Math.min(16, 12 + nearbyCount * 2);
    const textNote = maxTextOverlap > 40 ? ` with ${maxTextOverlap}% asset description textual similarity` : "";
    return {
      triggered: true,
      points,
      nearbySimilarCount: nearbyCount,
      nearestDistanceMeters: minDistance,
      matchedProjectId: closestMatchId,
      textOverlapSimilarity: maxTextOverlap,
      reason: `Geographic proximity anomaly: ${nearbyCount} work(s) of identical category within ${minDistance}m (nearest: ${closestMatchId})${textNote}.`,
    };
  }

  return {
    triggered: false,
    points: 0,
    nearbySimilarCount: nearbyCount,
    nearestDistanceMeters: minDistance === Infinity ? 0 : minDistance,
    reason: "Spatial coordinate distance from existing works within normal dispersion norms.",
  };
}
