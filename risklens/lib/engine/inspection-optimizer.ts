import { Project } from "@/lib/types";
import { calculateHaversineMeters } from "./gis-similarity";

export interface OptimizedInspectionPlan {
  totalEligibleProjects: number;
  selectedProjectsCount: number;
  mandateMetPercentage: number; // e.g. 14.5% (exceeds 10% mandate)
  estimatedTotalTravelKm: number;
  rankedInspectionSequence: Array<{
    step: number;
    project: Project;
    transitKmFromPrior: number;
    priorityReason: string;
  }>;
}

export function generateInspectionRoute(
  projects: Project[],
  minPercentage: number = 10,
  maxCapacity?: number
): OptimizedInspectionPlan {
  const minRequired = Math.ceil((projects.length * minPercentage) / 100);
  const targetCount = maxCapacity ? Math.max(minRequired, maxCapacity) : minRequired;

  // Score projects by inspection utility = RiskScore * log(Cost)
  const scored = projects.map((p) => {
    const utility = p.riskScore.compositeScore * Math.log10(Math.max(100000, p.sanctionedAmountINR));
    return { project: p, utility };
  });

  scored.sort((a, b) => b.utility - a.utility);

  // Take top candidates
  const candidates = scored.slice(0, targetCount * 2).map((s) => s.project);

  // Greedy Nearest-Neighbor Route Traversal
  const visited: Project[] = [];
  const remaining = [...candidates];

  // Start with highest risk project
  let current = remaining.shift()!;
  visited.push(current);

  let totalMeters = 0;
  const sequence: OptimizedInspectionPlan["rankedInspectionSequence"] = [
    {
      step: 1,
      project: current,
      transitKmFromPrior: 0,
      priorityReason: `High-priority anchor: Score ${current.riskScore.compositeScore}/100 with active review flags.`,
    },
  ];

  while (visited.length < targetCount && remaining.length > 0) {
    let bestNextIdx = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateHaversineMeters(
        current.latitude,
        current.longitude,
        remaining[i].latitude,
        remaining[i].longitude
      );
      if (dist < shortestDist) {
        shortestDist = dist;
        bestNextIdx = i;
      }
    }

    const nextProject = remaining.splice(bestNextIdx, 1)[0];
    totalMeters += shortestDist;
    visited.push(nextProject);

    sequence.push({
      step: visited.length,
      project: nextProject,
      transitKmFromPrior: Number((shortestDist / 1000).toFixed(1)),
      priorityReason: `Cluster neighbor (${(shortestDist / 1000).toFixed(1)} km transit): Risk ${nextProject.riskScore.compositeScore}/100.`,
    });

    current = nextProject;
  }

  const coveragePct = Number(((visited.length / Math.max(1, projects.length)) * 100).toFixed(1));

  return {
    totalEligibleProjects: projects.length,
    selectedProjectsCount: visited.length,
    mandateMetPercentage: coveragePct,
    estimatedTotalTravelKm: Number((totalMeters / 1000).toFixed(1)),
    rankedInspectionSequence: sequence,
  };
}
