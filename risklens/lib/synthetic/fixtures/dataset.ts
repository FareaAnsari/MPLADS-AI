import { generateSyntheticDataset } from "../generate";
import { Project, Constituency } from "@/lib/types";

// Generate deterministic synthetic dataset
const initialDataset = generateSyntheticDataset(180);

let currentProjects: Project[] = [...initialDataset.projects];
let currentConstituencies: Constituency[] = [...initialDataset.constituencies];

export function getProjects(): Project[] {
  return currentProjects;
}

export function getProjectById(id: string): Project | undefined {
  return currentProjects.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function getConstituencies(): Constituency[] {
  return currentConstituencies;
}

export function updateProjectInvestigationCase(
  projectId: string,
  update: {
    officerAction: "Mark False Alarm" | "Needs More Evidence" | "Confirm Issue";
    notes?: string;
    role: string;
  }
): Project | undefined {
  const proj = currentProjects.find((p) => p.id.toLowerCase() === projectId.toLowerCase());
  if (!proj) return undefined;

  let newStatus = proj.investigationCase?.status || "Open";
  let escalationLevel = proj.investigationCase?.escalationLevel || "District";

  if (update.officerAction === "Mark False Alarm") {
    newStatus = "Resolved - False Alarm";
  } else if (update.officerAction === "Needs More Evidence") {
    newStatus = "Under Review";
  } else if (update.officerAction === "Confirm Issue") {
    newStatus = "Escalated";
    escalationLevel =
      escalationLevel === "District"
        ? "State Nodal"
        : escalationLevel === "State Nodal"
        ? "Ministry / CVC"
        : "Ministry / CVC";
  }

  proj.investigationCase = {
    id: proj.investigationCase?.id || `CASE-${proj.id}`,
    projectId: proj.id,
    status: newStatus,
    flaggedSignals: proj.riskScore.breakdown.filter((b) => b.isTriggered).map((b) => b.label),
    officerAction: update.officerAction,
    actionNotes: update.notes || "Case reviewed by officer during live session.",
    actedByRole: update.role,
    actedAt: new Date().toISOString(),
    escalationLevel,
  };

  return { ...proj };
}
