import { create } from "zustand";
import { UserRole, Project, Constituency } from "@/lib/types";
import { getProjects, getConstituencies, updateProjectInvestigationCase } from "@/lib/synthetic/fixtures/dataset";

interface RiskLensState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  projects: Project[];
  constituencies: Constituency[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  takeOfficerAction: (
    projectId: string,
    action: "Mark False Alarm" | "Needs More Evidence" | "Confirm Issue",
    notes?: string
  ) => void;
}

export const useRiskLensStore = create<RiskLensState>((set, get) => ({
  currentRole: "district", // Default to District Authority for live judge investigation flow
  setRole: (role) => set({ currentRole: role }),
  projects: getProjects(),
  constituencies: getConstituencies(),
  selectedProjectId: "HERO-MPLADS-001",
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  takeOfficerAction: (projectId, action, notes) => {
    const roleTitle =
      get().currentRole === "district"
        ? "District Planning Authority"
        : get().currentRole === "state"
        ? "State Nodal Officer"
        : get().currentRole === "ministry"
        ? "MoSPI Ministry Directorate"
        : "Member of Parliament Representative";

    const updated = updateProjectInvestigationCase(projectId, {
      officerAction: action,
      notes,
      role: roleTitle,
    });

    if (updated) {
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? { ...updated } : p)),
      }));
    }
  },
}));
