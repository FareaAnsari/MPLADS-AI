// Backend DTO interfaces directly matching FastAPI Python Pydantic responses

export interface ProvenanceMetadataDTO {
  source: string;
  source_type: string;
  source_url?: string | null;
  retrieved_at?: string;
  is_synthetic?: boolean;
}

export interface ProjectDTO {
  id?: string | null;
  work_id: string;
  work_title: string;
  work_category: string;
  work_description?: string | null;
  mp_name?: string | null;
  ida_office?: string | null;
  state: string;
  constituency?: string | null;
  sanctioned_amount_inr: number;
  disbursed_amount_inr: number;
  current_stage?: string;
  has_official_images?: boolean;
  provenance?: ProvenanceMetadataDTO | null;
}

export interface MPDTO {
  id?: string | null;
  mp_name: string;
  house: string;
  category: string;
  state: string;
  constituency?: string | null;
  allocated_limit_inr: number;
  provenance?: ProvenanceMetadataDTO | null;
}

export interface RiskScoreBreakdownDTO {
  cost_anomaly_score?: number;
  time_delay_score?: number;
  duplicate_risk_score?: number;
  cluster_density_score?: number;
  cost_anomaly?: number;
  delay_anomaly?: number;
  payment_pattern?: number;
  spatial_signal?: number;
  evidence_issue?: number;
}

export interface RiskAssessmentDTO {
  project_id?: string;
  work_id: string;
  risk_score: number;
  anomaly_flag: string;
  explanation?: Record<string, any>;
  score_breakdown?: RiskScoreBreakdownDTO;
  component_breakdown?: RiskScoreBreakdownDTO;
  peer_group_id?: string;
  evaluated_at?: string;
}

export interface SLABottleneckDTO {
  project_id: string;
  current_stage: string;
  days_in_current_stage: number;
  expected_benchmark_days: number;
  delay_ratio: number;
  responsible_role: string;
  is_bottleneck: boolean;
}

export interface InspectorScheduleItemDTO {
  inspection_priority_rank: number;
  project_id: string;
  work_id: string;
  priority_score: number;
  risk_score: number;
  disbursed_amount_inr: number;
  distance_from_base_km: number;
  recommended_action: string;
}

export interface CitizenEvidenceSubmissionDTO {
  project_id: string;
  latitude: number;
  longitude: number;
  timestamp_captured: string;
  is_live_camera_capture: boolean;
  image_base64?: string | null;
}

export interface EvidenceVerificationResultDTO {
  evidence_id: string;
  project_id: string;
  distance_to_project_meters: number;
  location_verified: boolean;
  phash_value?: string | null;
  duplicate_detected: boolean;
  verification_status: string;
}

// Notification DTOs
export interface DeviceRegistrationRequestDTO {
  push_token: string;
  device_id: string;
  platform: string;
  app_version?: string;
}

export interface DeviceRegistrationResponseDTO {
  status: string;
  device_id: string;
  registered_at: string;
}

export interface NotificationDTO {
  id: string;
  user_id: string;
  role: string;
  type: string;
  category: string;
  title: string;
  body: string;
  entity_type?: string | null;
  entity_id?: string | null;
  deep_link?: string | null;
  read_at?: string | null;
  created_at: string;
}

export interface UnreadCountResponseDTO {
  unread_count: number;
}

export interface NotificationPreferencesRequestDTO {
  push_enabled?: boolean;
  evidence_updates?: boolean;
  risk_alerts?: boolean;
  sla_alerts?: boolean;
  inspection_updates?: boolean;
  project_milestones?: boolean;
}

export interface NotificationPreferencesResponseDTO {
  push_enabled: boolean;
  evidence_updates: boolean;
  risk_alerts: boolean;
  sla_alerts: boolean;
  inspection_updates: boolean;
  project_milestones: boolean;
  updated_at: string;
}

// MP Office Oversight DTOs
export interface MPProfileSummaryDTO {
  id: string;
  full_name: string;
  role: string;
  constituency?: string | null;
  state?: string | null;
}

export interface MPMetricsDTO {
  total_constituency_projects: number;
  active_count: number;
  completed_count: number;
  delayed_count: number;
  total_sanctioned_inr: number;
  total_disbursed_inr: number;
  high_risk_attention_count: number;
  public_evidence_count: number;
  utilization_percentage: number;
}

export interface MPRiskDistributionDTO {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface MPDashboardDTO {
  mp: MPProfileSummaryDTO;
  metrics: MPMetricsDTO;
  risk_distribution: MPRiskDistributionDTO;
  recent_projects: ProjectDTO[];
}

export interface MPProjectListDTO {
  total: number;
  limit: number;
  offset: number;
  constituency: string;
  state: string;
  projects: ProjectDTO[];
}

export interface MPFinancialSummaryDTO {
  sanctioned_amount_inr: number;
  disbursed_amount_inr: number;
  expenditure_inr: number;
  remaining_balance_inr: number;
  utilization_percentage: number;
}

export interface MPMilestoneDTO {
  stage_id: string;
  stage_name: string;
  is_completed: boolean;
  is_current: boolean;
  benchmark_days: number;
  days_in_stage?: number | null;
  status: string;
}

export interface MPOversightRiskDTO {
  risk_score: number;
  risk_level: string;
  attention_required: boolean;
  primary_risk_signal?: string | null;
  top_contributing_factor?: string | null;
}

export interface MPProjectDetailDTO {
  project: ProjectDTO;
  financials: MPFinancialSummaryDTO;
  milestones: MPMilestoneDTO[];
  risk_oversight: MPOversightRiskDTO;
  public_evidence?: any[];
  expenditures?: any[];
}

// Contractor Operations DTOs
export interface ContractorProfileSummaryDTO {
  id: string;
  full_name: string;
  company_name: string;
  role: string;
  jurisdiction_state?: string | null;
  contractor_id: string;
}

export interface ContractorMetricsDTO {
  assigned_projects_count: number;
  active_works_count: number;
  completed_works_count: number;
  pending_submissions_count: number;
  reported_issues_count: number;
  total_contract_value_inr: number;
}

export interface ContractorProgressUpdateDTO {
  submission_id: string;
  work_id: string;
  contractor_id: string;
  reported_progress_percent: number;
  milestone_stage: string;
  remarks: string;
  field_observations?: string | null;
  status: string;
  submitted_at: string;
  audit_ref: string;
}

export interface ContractorIssueDTO {
  issue_id: string;
  work_id: string;
  contractor_id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  reported_at: string;
  acknowledged_at?: string | null;
}

export interface ContractorMilestoneDTO {
  stage_id: string;
  stage_name: string;
  target_percent: number;
  is_completed: boolean;
}

export interface ContractorDashboardDTO {
  contractor: ContractorProfileSummaryDTO;
  metrics: ContractorMetricsDTO;
  assigned_projects: ProjectDTO[];
  recent_submissions: ContractorProgressUpdateDTO[];
}

export interface ContractorProjectListDTO {
  total: number;
  limit: number;
  offset: number;
  contractor_id: string;
  projects: ProjectDTO[];
}

export interface ContractorProjectDetailDTO {
  project: ProjectDTO;
  contract_value_inr: number;
  reported_progress_percent: number;
  verified_progress_percent: number;
  milestones: ContractorMilestoneDTO[];
  progress_history: ContractorProgressUpdateDTO[];
  issues: ContractorIssueDTO[];
}

export interface ProgressUpdateRequestDTO {
  work_id: string;
  progress_percentage: number;
  milestone_stage?: string;
  remarks: string;
  field_observations?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
}

export interface ContractorIssueRequestDTO {
  work_id: string;
  category: string;
  title: string;
  description: string;
  severity?: string;
}



