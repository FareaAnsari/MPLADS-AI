export type CoordinateSource = 
  | 'Official LGD / Survey of India Geocodes'
  | 'Bhuvan ISRO Geospatial Registry'
  | 'District Planning Authority GIS'
  | 'Not available in source data';

export type VillageStatusCategory = 
  | '0 recorded projects' 
  | '1-2 recorded projects' 
  | '3-5 recorded projects' 
  | '6+ recorded projects';

export interface DataProvenance {
  source: 'Official MPLADS/eSAKSHI' | 'data.gov.in' | 'Local Government Directory (LGD)' | 'MoSPI Public Release';
  datasetName: string;
  datasetDate: string;
  lastUpdated: string;
  recordCount: number;
  fieldsUsed: string[];
  missingFields: string[];
}

export interface VillageProjectRecord {
  projectId: string;
  workName: string;
  sector: string;
  recommendedDate: string | null;
  sanctionDate: string | null;
  startDate: string | null;
  expectedCompletion: string | null;
  actualCompletion: string | null;
  status: 'COMPLETED' | 'IN PROGRESS' | 'DELAYED';
  expenditure: number; // in Rupees
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  contractor: string | null;
  vendor: string | null;
  missingFields: string[];
}

export interface LGDVillage {
  id: string; // e.g. LGD-556214
  villageCode: string; // Official 6-digit LGD Census village code
  villageName: string;
  state: string;
  district: string;
  subDistrict: string; // Taluka / Tehsil / Block
  constituency: string;
  mpName: string;
  coordinates: { lat: number; lng: number } | null;
  coordinatesSource: CoordinateSource;
  projectCount: number;
  completedCount: number;
  ongoingCount: number;
  delayedCount: number;
  highRiskCount: number;
  totalExpenditure: number; // in Rupees
  lastProjectDate: string | null;
  sectorsPresent: string[];
  projects: VillageProjectRecord[];
  provenance: DataProvenance;
}

export interface VillageFilterState {
  state: string;
  district: string;
  subDistrict: string;
  village: string;
  mp: string;
  constituency: string;
  sector: string;
  status: string;
  year: string;
  riskLevel: string;
  minProjects: number;
  maxProjects: number;
  minExpenditure: number;
  maxExpenditure: number;
}

export interface RuralKPISummary {
  totalVillages: number;
  villagesWithProjects: number;
  villagesZeroProjects: number;
  villages1to2Projects: number;
  villages3to5Projects: number;
  totalProjects: number;
  totalExpenditure: number;
  villagesWithDelayed: number;
  villagesWithHighRisk: number;
}
