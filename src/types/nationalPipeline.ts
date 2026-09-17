// TypeScript Definitions for National MPLADS Data Ingestion & Verification Pipeline

export type NormalizedProjectStatus = 
  | 'Recommended'
  | 'Sanctioned'
  | 'Ongoing'
  | 'Completed'
  | 'Pending';

export type CoverageTier = 
  | 'Complete/High Coverage'
  | 'Partial Coverage'
  | 'Limited Coverage';

export type VillageMatchType = 
  | 'LGD_CODE_MATCH'
  | 'NAME_BASED_REQUIRES_VERIFICATION'
  | 'UNMATCHED';

export type DataSourceVerificationStatus = 
  | 'VERIFIED_OFFICIAL'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED';

export interface DataSourceRecord {
  source_id: string;
  source_name: string;
  organization: string;
  source_url: string;
  dataset_name: string;
  dataset_type: 'MPLADS/eSAKSHI' | 'data.gov.in' | 'LGD' | 'State Government OGD' | 'District Administration' | 'Official Procurement Portal';
  coverage: string;
  publication_date: string | null;
  last_updated: string;
  retrieved_at: string;
  verification_status: DataSourceVerificationStatus;
  record_count: number;
  checksum: string;
  notes: string;
}

export interface NationalProjectRecord {
  project_id: string;
  source_project_id: string | null;
  project_name: string;
  description: string | null;
  
  // Administrative Hierarchy
  state: string;
  state_code: string | null;
  district: string;
  district_code: string | null;
  sub_district: string | null;
  sub_district_code: string | null;
  village: string | null;
  village_code: string | null;
  village_match_type: VillageMatchType;
  
  // Parliamentary Representation
  constituency: string | null;
  mp_name: string | null;
  mp_type: string | null; // e.g. "Lok Sabha" | "Rajya Sabha" | "Nominated"
  
  // Sector Taxonomy
  sector: string | null;
  sub_sector: string | null;
  
  // Dates
  recommendation_date: string | null;
  sanction_date: string | null;
  start_date: string | null;
  expected_completion_date: string | null;
  actual_completion_date: string | null;
  
  // Status Provenance
  source_status: string;
  normalized_status: NormalizedProjectStatus;
  
  // Financial (INR)
  approved_amount: number | null;
  sanctioned_amount: number | null;
  expenditure: number | null;
  
  // Coordinates (strictly null if unverified)
  latitude: number | null;
  longitude: number | null;
  
  // Execution Entities
  contractor_name: string | null;
  contractor_id: string | null;
  vendor_name: string | null;
  vendor_id: string | null;
  
  // Provenance & Quality
  source_id: string;
  source_url: string;
  last_verified: string;
  data_quality_score: number; // 0 to 100
  
  is_potential_duplicate: boolean;
  duplicate_group_id?: string;
  has_source_conflict: boolean;
  is_synthetic: boolean;
}

export interface AdminStateRecord {
  state_code: string;
  state_name: string;
  coverage_tier: CoverageTier;
  districts_count: number;
  total_works: number;
  total_expenditure_inr: number;
  criteria_notes: string;
}

export interface AdminDistrictRecord {
  district_code: string;
  district_name: string;
  state_name: string;
  ida_office: string;
  project_count: number;
  total_expenditure_inr: number;
}

export interface AdminVillageRecord {
  village_code: string;
  village_name: string;
  sub_district_name: string;
  district_name: string;
  state_name: string;
  is_lgd_verified: boolean;
  project_count: number;
}

export interface DataQualityReport {
  report_id: string;
  dataset_name: string;
  evaluation_timestamp: string;
  total_records: number;
  valid_records: number;
  duplicate_records: number;
  missing_project_ids: number;
  missing_village: number;
  missing_district: number;
  missing_state: number;
  missing_expenditure: number;
  missing_dates: number;
  missing_contractor: number;
  missing_coordinates: number;
  invalid_dates: number;
  invalid_amounts: number;
  conflicting_records: number;
  overall_quality_score: number;
  summary_notes: string[];
}

export interface DuplicateRecordGroup {
  group_id: string;
  primary_project: NationalProjectRecord;
  duplicate_project: NationalProjectRecord;
  confidence: number;
  match_reasons: string[];
  status: 'PENDING_REVIEW' | 'CONFIRMED_DUPLICATE' | 'CONFIRMED_DISTINCT';
}

export interface SourceConflictRecord {
  conflict_id: string;
  project_id: string;
  project_name: string;
  conflicting_field: string;
  source_a: {
    source_name: string;
    value: string;
    date: string;
  };
  source_b: {
    source_name: string;
    value: string;
    date: string;
  };
  status: 'UNRESOLVED' | 'RESOLVED_A' | 'RESOLVED_B';
  resolution_notes?: string;
}

export interface VerifiedContractorRecord {
  contractor_id: string;
  contractor_name: string;
  source: string;
  source_url: string;
  project_count: number;
  district_count: number;
  state_count: number;
  total_disbursed_inr: number;
}

export interface ProcurementNoticeRecord {
  opportunity_id: string;
  project_id: string;
  tender_reference: string;
  procurement_authority: string;
  publication_date: string | null;
  closing_date: string | null;
  tender_status: string;
  estimated_value: number | null;
  official_url: string;
  source_id: string;
  last_verified: string;
}

export interface DataTrustMetadata {
  dataSource: string;
  lastUpdated: string;
  recordsAnalyzed: number;
  coverage: string;
  dataQuality: number;
  dataMode: 'REAL_DATA_MODE' | 'DEMO_MODE_SYNTHETIC';
}
