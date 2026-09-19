export const CURRENT_SCHEMA_VERSION = 1;

export const CREATE_SCHEMA_V1_SQL = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  jurisdiction_district TEXT,
  work_id TEXT NOT NULL,
  work_title TEXT NOT NULL,
  work_category TEXT NOT NULL,
  work_description TEXT,
  mp_name TEXT,
  ida_office TEXT,
  state TEXT NOT NULL,
  constituency TEXT,
  sanctioned_amount_inr REAL NOT NULL,
  disbursed_amount_inr REAL NOT NULL,
  current_stage TEXT NOT NULL,
  has_official_images INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_role ON projects(user_id, role);
CREATE INDEX IF NOT EXISTS idx_projects_jurisdiction ON projects(jurisdiction_district);

CREATE TABLE IF NOT EXISTS risk_assessments (
  work_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  risk_score REAL NOT NULL,
  anomaly_flag TEXT NOT NULL,
  score_breakdown_json TEXT NOT NULL,
  primary_risk_reason TEXT,
  top_contributing_factor TEXT,
  evaluated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_user ON risk_assessments(user_id);

CREATE TABLE IF NOT EXISTS evidence_records (
  evidence_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_live_camera INTEGER NOT NULL DEFAULT 1,
  distance_meters REAL NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL,
  timestamp_captured TEXT NOT NULL,
  local_image_uri TEXT
);

CREATE INDEX IF NOT EXISTS idx_evidence_user ON evidence_records(user_id, project_id);

CREATE TABLE IF NOT EXISTS inspection_schedules (
  work_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  inspector_id TEXT,
  priority_rank INTEGER NOT NULL,
  priority_score REAL NOT NULL,
  risk_score REAL NOT NULL,
  disbursed_amount_inr REAL NOT NULL,
  distance_from_base_km REAL NOT NULL,
  recommended_action TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspection_user ON inspection_schedules(user_id);

CREATE TABLE IF NOT EXISTS outbox_mutations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  next_retry_at TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_user ON outbox_mutations(status, user_id);

CREATE TABLE IF NOT EXISTS sync_metadata (
  key TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  last_synced_at TEXT NOT NULL,
  entity_type TEXT NOT NULL
);
`;
