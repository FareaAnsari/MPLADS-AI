export type ProjectMPLADSStatus = 
  | 'Recommended'
  | 'Under Administrative Processing'
  | 'Sanctioned'
  | 'Procurement/Tender Published'
  | 'Tender Open'
  | 'Work in Progress'
  | 'Completed';

export type SourceVerificationStatus = 
  | 'Verified'
  | 'Partially Verified'
  | 'Source Information Missing';

export type ProcurementSourceType = 
  | 'CPPP' 
  | 'GeM' 
  | 'State e-Procurement' 
  | 'District Portal' 
  | 'MoSPI e-SAKSHI';

export interface ProcurementSource {
  source_url: string;
  source_name: string;
  source_type: ProcurementSourceType;
  source_date: string;
  last_verified: string;
}

export interface OpportunityLifecycleStage {
  stageId: string;
  stageName: string;
  stageNumber: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'INFORMATION_UNAVAILABLE';
  date: string | null;
  authority: string | null;
  notes: string | null;
}

export interface OpportunityRecord {
  id: string; // e.g. OPP-MH-2026-001
  projectId: string; // e.g. WS/MP418/2024-2025/133409
  workName: string;
  location: string;
  village: string | null;
  subDistrict: string | null;
  district: string;
  state: string;
  constituency: string;
  mpName: string;
  sector: string;
  currentStatus: ProjectMPLADSStatus;
  estimatedCost: number | null; // in Rupees
  recommendationDate: string | null;
  sanctionDate: string | null;
  tenderStatus: string | null; // e.g. "Active - Technical Bid Opened", "Notice Published", "No Tender Initiated"
  tenderReference: string | null; // NIT / Tender Reference No.
  tenderingAuthority: string | null;
  tenderPublicationDate: string | null;
  tenderClosingDate: string | null;
  officialSource: ProcurementSource | null;
  verificationStatus: SourceVerificationStatus;
  verificationNote: string;
  timelineStages: OpportunityLifecycleStage[];
}

export interface OpportunityFilterState {
  state: string;
  district: string;
  constituency: string;
  sector: string;
  projectStatus: string;
  procurementStatus: string;
  valueRange: string;
  recommendationDate: string;
  sanctionDate: string;
  tenderPublicationDate: string;
  tenderClosingDate: string;
  officialSource: string;
}

export interface OpportunityKPISummary {
  recommendedWorks: number;
  sanctionedWorks: number;
  worksWithProcurementInfo: number;
  openTenderOpportunities: number;
  upcomingPlannedWorks: number;
  projectsWithoutTenderInfo: number;
}

export interface ContractorInterestRecord {
  id: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  authorizedPerson: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  relevantSector: string;
  experienceYears: number;
  registrationNumber?: string;
  gstin?: string;
  companyProfile?: string;
  reasonForInterest: string;
  submittedAt: string;
  disclaimerAccepted: boolean;
  officialSourceUrl?: string;
  tenderStatus?: string;
}

export interface ContractorAlertSubscription {
  id: string;
  state: string;
  district: string;
  sector: string;
  projectType: string;
  email: string;
  createdAt: string;
}
