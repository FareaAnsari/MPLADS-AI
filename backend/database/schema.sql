-- =============================================================================
-- PRATYAKSH — AI-Powered MPLADS Monitoring & Verification Intelligence Layer
-- Canonical PostgreSQL / PostGIS Schema DDL (Phase 1)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- -----------------------------------------------------------------------------
-- ENUM DEFINITIONS (Strict Neutral Vocabulary & Provenance Enums)
-- -----------------------------------------------------------------------------

CREATE TYPE source_type_enum AS ENUM (
    'OFFICIAL_PUBLIC',       -- data.gov.in, official eSAKSHI public reports
    'EXTERNAL_SATELLITE',    -- Sentinel-2, Landsat public data
    'CITIZEN_PWA',           -- Live mobile citizen verification
    'SYNTHETIC_DEMO'         -- Synthetic demonstration data — not official government data
);

CREATE TYPE house_type_enum AS ENUM (
    'LOK_SABHA',
    'RAJYA_SABHA'
);

CREATE TYPE mp_category_enum AS ENUM (
    'ELECTED',
    'NOMINATED'
);

CREATE TYPE workflow_stage_enum AS ENUM (
    'PROPOSAL_SUBMITTED',
    'DISTRICT_RECOMMENDATION',
    'ADMINISTRATIVE_SANCTION',
    'FUND_RELEASE',
    'TENDER_AWARD',
    'WORK_EXECUTION',
    'INSPECTION_PENDING',
    'COMPLETION_REPORTED',
    'FINAL_PAYMENT'
);

CREATE TYPE anomaly_flag_enum AS ENUM (
    'NORMAL',
    'POTENTIAL_ANOMALY',
    'REQUIRES_VERIFICATION',
    'EVIDENCE_CONFLICT',
    'HIGH_RISK_COST_DEVIATION',
    'STAGE_DELAY_BOTTLENECK'
);

CREATE TYPE verification_status_enum AS ENUM (
    'VERIFIED_MATCH',
    'PARTIAL_MATCH',
    'EVIDENCE_CONFLICT',
    'INDEPENDENT_EVIDENCE_UNAVAILABLE',
    'PENDING_INSPECTION'
);

-- -----------------------------------------------------------------------------
-- 1. MEMBERS OF PARLIAMENT (MPs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mp_name VARCHAR(255) NOT NULL,
    house house_type_enum NOT NULL,
    category mp_category_enum NOT NULL DEFAULT 'ELECTED',
    state VARCHAR(100) NOT NULL,
    constituency VARCHAR(150),
    allocated_limit_inr NUMERIC(15, 2) DEFAULT 0.00,
    term_start_year INT,
    
    -- Provenance Metadata
    source VARCHAR(255) DEFAULT 'data.gov.in',
    source_type source_type_enum DEFAULT 'OFFICIAL_PUBLIC',
    source_url VARCHAR(500),
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_synthetic BOOLEAN DEFAULT FALSE,
    data_quality_score NUMERIC(3,2) DEFAULT 1.00,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. IMPLEMENTING DISTRICT AUTHORITIES (IDAs) / DISTRICT OFFICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS district_authorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_name VARCHAR(150) NOT NULL,
    state VARCHAR(100) NOT NULL,
    office_title VARCHAR(255) NOT NULL, -- e.g. "DISTRICT PLANNING OFFICER ARARIA_IDA"
    location GEOMETRY(Point, 4326),

    -- Provenance Metadata
    source VARCHAR(255) DEFAULT 'data.gov.in',
    source_type source_type_enum DEFAULT 'OFFICIAL_PUBLIC',
    source_url VARCHAR(500),
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_synthetic BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. MPLADS PROJECTS / WORKS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_id VARCHAR(100) UNIQUE NOT NULL, -- e.g. "WS/MP418/2024-2025/133409"
    work_category VARCHAR(150) NOT NULL, -- e.g. "Roads", "School Rooms", "Community Halls"
    work_title TEXT NOT NULL,
    work_description TEXT,
    
    mp_id UUID REFERENCES mps(id) ON DELETE SET NULL,
    district_authority_id UUID REFERENCES district_authorities(id) ON DELETE SET NULL,
    
    state VARCHAR(100) NOT NULL,
    constituency VARCHAR(150),
    
    sanctioned_amount_inr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    disbursed_amount_inr NUMERIC(15, 2) DEFAULT 0.00,
    estimated_cost_inr NUMERIC(15, 2),
    
    current_stage workflow_stage_enum DEFAULT 'PROPOSAL_SUBMITTED',
    completion_date DATE,
    has_official_images BOOLEAN DEFAULT FALSE,
    
    -- Spatial location of project site
    site_location GEOMETRY(Point, 4326),
    pincode VARCHAR(10),

    -- Provenance Metadata
    source VARCHAR(255) DEFAULT 'eSAKSHI / data.gov.in',
    source_type source_type_enum DEFAULT 'OFFICIAL_PUBLIC',
    source_url VARCHAR(500),
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_synthetic BOOLEAN DEFAULT FALSE,
    data_quality_score NUMERIC(3,2) DEFAULT 1.00,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast spatial and text queries
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects USING GIST(site_location);
CREATE INDEX IF NOT EXISTS idx_projects_work_category ON projects(work_category);
CREATE INDEX IF NOT EXISTS idx_projects_state_constituency ON projects(state, constituency);

-- -----------------------------------------------------------------------------
-- 4. EXPENDITURES & PAYMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenditures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    expenditure_date DATE NOT NULL,
    vendor_name VARCHAR(255),
    payment_status VARCHAR(100) DEFAULT 'DISBURSED',
    fund_disbursed_amount_inr NUMERIC(15, 2) NOT NULL,
    disbursement_stage workflow_stage_enum,

    -- Provenance Metadata
    source VARCHAR(255) DEFAULT 'eSAKSHI / data.gov.in',
    source_type source_type_enum DEFAULT 'OFFICIAL_PUBLIC',
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_synthetic BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. STAGE-WISE BOTTLENECK / WORKFLOW SLA TRACKING
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage workflow_stage_enum NOT NULL,
    entered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    exited_at TIMESTAMP WITH TIME ZONE,
    duration_days NUMERIC(8, 2),
    expected_benchmark_days NUMERIC(8, 2),
    delay_ratio NUMERIC(5, 2), -- e.g. 4.1x expected duration
    responsible_role VARCHAR(150), -- e.g. "District Verification Officer", "IDA Finance Division"
    is_bottleneck BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. RISK ASSESSMENTS (AI Risk Engine Output — Feature 1 & 2)
-- STRICT SCORE SEPARATION: Risk Score (0-100) is independent of Verification Confidence
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Composite Risk Score (0 = lowest risk, 100 = highest potential anomaly)
    risk_score NUMERIC(5, 2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    
    -- Risk Score Components (Explainable Breakdown)
    cost_anomaly_score NUMERIC(5, 2) DEFAULT 0,       -- Z-Score / IQR vs peer group
    time_delay_score NUMERIC(5, 2) DEFAULT 0,         -- SLA delay vs peer group benchmark
    duplicate_risk_score NUMERIC(5, 2) DEFAULT 0,      -- Photo / description perceptual overlap
    cluster_density_score NUMERIC(5, 2) DEFAULT 0,     -- Unnatural geographic clustering
    
    anomaly_flag anomaly_flag_enum DEFAULT 'NORMAL',
    explanation JSONB,                                 -- Key factors driving risk score
    peer_group_id VARCHAR(150),                       -- Grouping key (Category + State + Budget Tier)
    
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) DEFAULT 'v1.0.0-isolation-forest-zscore'
);

-- -----------------------------------------------------------------------------
-- 7. EVIDENCE & VERIFICATION (Feature 3, 4, 5)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    evidence_type VARCHAR(50) NOT NULL, -- 'OFFICIAL_PHOTO', 'CITIZEN_PHOTO', 'SATELLITE_IMAGE'
    submitted_by_role VARCHAR(100),    -- 'CITIZEN', 'OFFICIAL_INSPECTOR', 'AGENCY_CLAIM'
    
    image_url VARCHAR(500),
    phash_value VARCHAR(64),            -- Perceptual hash for duplication detection
    
    -- Location-bound citizen evidence metadata
    location GEOMETRY(Point, 4326),
    distance_to_project_meters NUMERIC(10, 2),
    timestamp_captured TIMESTAMP WITH TIME ZONE,
    is_live_camera_capture BOOLEAN DEFAULT FALSE,
    device_telemetry JSONB,
    
    verification_status verification_status_enum DEFAULT 'PENDING_INSPECTION',

    -- Provenance Metadata
    source_type source_type_enum DEFAULT 'CITIZEN_PWA',
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. VERIFICATION CONFIDENCE & EVIDENCE TRIANGULATION (Feature 5 & 9)
-- STRICT SCORE SEPARATION: Verification Confidence (0-100) vs Risk Score
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Verification Confidence Score (0 = no verification, 100 = full multi-source triangulation)
    verification_confidence NUMERIC(5, 2) NOT NULL CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
    
    -- Feature 9 Safeguard Status
    independent_evidence_status VARCHAR(100) DEFAULT 'INDEPENDENT_EVIDENCE_UNAVAILABLE',
    is_low_connectivity_region BOOLEAN DEFAULT FALSE,
    
    -- Signal contributions
    agency_claim_score NUMERIC(5, 2) DEFAULT 0,
    citizen_evidence_score NUMERIC(5, 2) DEFAULT 0,
    photo_similarity_score NUMERIC(5, 2) DEFAULT 0,
    satellite_signal_score NUMERIC(5, 2) DEFAULT 0,
    
    triangulation_summary JSONB,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. CONFIDENCE & EVIDENCE LEDGER (Feature 8 — Immutable Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- 'RISK_EVALUATED', 'VERIFICATION_UPDATED', 'INSPECTION_SCHEDULED', 'OFFICIAL_REVIEW'
    
    data_source VARCHAR(255) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    rules_version VARCHAR(50) NOT NULL,
    
    risk_score_at_action NUMERIC(5, 2),
    verification_confidence_at_action NUMERIC(5, 2),
    
    actor_role VARCHAR(100) DEFAULT 'SYSTEM_ENGINE',
    human_decision VARCHAR(100), -- 'APPROVED', 'DISPATCHED_FOR_INSPECTION', 'FLAGGED_FOR_CLARIFICATION'
    human_notes TEXT,
    
    snapshot_payload JSONB NOT NULL, -- Full deterministic state snapshot
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick timeline lookup
CREATE INDEX IF NOT EXISTS idx_ledger_project_timestamp ON audit_ledger(project_id, timestamp DESC);
