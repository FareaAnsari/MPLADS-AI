-- =============================================================================
-- NATIONAL MPLADS DATA INGESTION & VERIFICATION PIPELINE
-- Canonical PostgreSQL / PostGIS Relational Schema DDL
-- Authoritative Public Government Sources Integration
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. DATA SOURCE REGISTRY (data_sources)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
    source_id VARCHAR(50) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    dataset_name VARCHAR(255) NOT NULL,
    dataset_type VARCHAR(100) NOT NULL, -- 'MPLADS/eSAKSHI', 'data.gov.in', 'LGD', 'State Government OGD', 'District Administration', 'Official Procurement Portal'
    coverage VARCHAR(255) NOT NULL,    -- 'National (All States & UTs)', 'District Specific', etc.
    publication_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED_OFFICIAL', -- 'VERIFIED_OFFICIAL', 'PARTIALLY_VERIFIED', 'UNVERIFIED'
    record_count INTEGER NOT NULL DEFAULT 0,
    checksum VARCHAR(64) NOT NULL,     -- SHA-256 / SHA-1 checksum of source payload
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. ADMINISTRATIVE HIERARCHY TABLES (LGD Master Data)
-- -----------------------------------------------------------------------------
-- Master state directory
CREATE TABLE IF NOT EXISTS states (
    state_code VARCHAR(10) PRIMARY KEY, -- Official LGD State Code
    state_name VARCHAR(150) NOT NULL UNIQUE,
    state_type VARCHAR(50) DEFAULT 'STATE', -- 'STATE' or 'UNION_TERRITORY'
    coverage_tier VARCHAR(50) DEFAULT 'PARTIAL_COVERAGE', -- 'COMPLETE_COVERAGE', 'PARTIAL_COVERAGE', 'LIMITED_COVERAGE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master district directory
CREATE TABLE IF NOT EXISTS districts (
    district_code VARCHAR(20) PRIMARY KEY, -- Official LGD District Code
    state_code VARCHAR(10) NOT NULL REFERENCES states(state_code) ON DELETE RESTRICT,
    district_name VARCHAR(150) NOT NULL,
    ida_office_name VARCHAR(255),          -- Implementing District Authority title
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_state_district UNIQUE (state_code, district_name)
);

-- Master sub-district / block / taluka directory
CREATE TABLE IF NOT EXISTS sub_districts (
    sub_district_code VARCHAR(20) PRIMARY KEY, -- Official LGD Sub-District / Block Code
    district_code VARCHAR(20) NOT NULL REFERENCES districts(district_code) ON DELETE RESTRICT,
    sub_district_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master village / gram panchayat directory
CREATE TABLE IF NOT EXISTS villages (
    village_code VARCHAR(20) PRIMARY KEY, -- Official 6-digit LGD Village Code
    sub_district_code VARCHAR(20) REFERENCES sub_districts(sub_district_code) ON DELETE SET NULL,
    district_code VARCHAR(20) NOT NULL REFERENCES districts(district_code) ON DELETE RESTRICT,
    village_name VARCHAR(150) NOT NULL,
    gram_panchayat_name VARCHAR(150),
    is_lgd_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. NATIONAL PROJECT TABLE (projects)
-- Preserves original source values while maintaining normalized projections
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    project_id VARCHAR(100) PRIMARY KEY,           -- System standard or official normalized ID
    source_project_id VARCHAR(100),                -- Original Work ID in e-SAKSHI (e.g. WS/MP418/2024-2025/133409)
    project_name VARCHAR(500) NOT NULL,            -- Official work title or category
    description TEXT,                              -- Full verbatim work description
    
    -- Administrative linkage
    state VARCHAR(150) NOT NULL,
    state_code VARCHAR(10) REFERENCES states(state_code) ON DELETE SET NULL,
    district VARCHAR(150) NOT NULL,
    district_code VARCHAR(20) REFERENCES districts(district_code) ON DELETE SET NULL,
    sub_district VARCHAR(150),
    sub_district_code VARCHAR(20) REFERENCES sub_districts(sub_district_code) ON DELETE SET NULL,
    village VARCHAR(150),
    village_code VARCHAR(20) REFERENCES villages(village_code) ON DELETE SET NULL,
    village_match_type VARCHAR(50) DEFAULT 'UNMATCHED', -- 'LGD_CODE_MATCH', 'NAME_BASED_REQUIRES_VERIFICATION', 'UNMATCHED'
    
    -- Parliamentary representation
    constituency VARCHAR(150),
    mp_name VARCHAR(255),
    mp_type VARCHAR(100),                          -- 'Lok Sabha' / 'Rajya Sabha' / 'Nominated'
    
    -- Sector taxonomy
    sector VARCHAR(150),
    sub_sector VARCHAR(150),
    
    -- Milestone dates (strictly NULL if missing)
    recommendation_date DATE,
    sanction_date DATE,
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    
    -- Lifecycle Statuses
    source_status VARCHAR(100) NOT NULL,           -- Exact value from source (e.g. 'Normal/Others', 'Payment In-Progress', 'Completed')
    normalized_status VARCHAR(50) NOT NULL,        -- 'Recommended', 'Sanctioned', 'Ongoing', 'Completed', 'Pending'
    
    -- Financial tracking (in INR, NULL if unavailable)
    approved_amount NUMERIC(15, 2),
    sanctioned_amount NUMERIC(15, 2),
    expenditure NUMERIC(15, 2),
    
    -- Geographic coordinates (strictly NULL if not verified)
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    
    -- Execution entities
    contractor_name VARCHAR(255),
    contractor_id VARCHAR(100),
    vendor_name VARCHAR(255),
    vendor_id VARCHAR(100),
    
    -- Provenance & Data Quality
    source_id VARCHAR(50) NOT NULL REFERENCES data_sources(source_id) ON DELETE RESTRICT,
    source_url VARCHAR(500),
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_quality_score NUMERIC(4, 2) DEFAULT 0.00, -- 0.00 to 100.00%
    is_potential_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_group_id VARCHAR(50),
    has_source_conflict BOOLEAN DEFAULT FALSE,
    is_synthetic BOOLEAN DEFAULT FALSE,            -- TRUE ONLY IN MANUAL DEMO MODE
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. CONTRACTORS & VENDORS TABLE (contractors)
-- Strictly derived from official source Vendor/Contractor fields
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contractors (
    contractor_id VARCHAR(100) PRIMARY KEY,
    contractor_name VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    source_url VARCHAR(500),
    project_count INTEGER NOT NULL DEFAULT 0,
    district_count INTEGER NOT NULL DEFAULT 0,
    state_count INTEGER NOT NULL DEFAULT 0,
    total_disbursed_inr NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. PROCUREMENT OPPORTUNITIES TABLE (procurement_opportunities)
-- Populated ONLY when legitimate procurement records exist
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_opportunities (
    opportunity_id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    tender_reference VARCHAR(150) NOT NULL,
    procurement_authority VARCHAR(255) NOT NULL,
    publication_date DATE,
    closing_date DATE,
    tender_status VARCHAR(50) NOT NULL, -- 'Tender Open', 'Procurement/Tender Published', 'Tender Closed', 'Awarded'
    estimated_value NUMERIC(15, 2),
    official_url VARCHAR(500) NOT NULL,
    source_id VARCHAR(50) NOT NULL REFERENCES data_sources(source_id) ON DELETE RESTRICT,
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. DATA QUALITY ENGINE & AUDIT LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_quality_reports (
    report_id VARCHAR(50) PRIMARY KEY,
    dataset_name VARCHAR(255) NOT NULL,
    source_id VARCHAR(50) NOT NULL REFERENCES data_sources(source_id) ON DELETE CASCADE,
    evaluation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_records INTEGER NOT NULL,
    valid_records INTEGER NOT NULL,
    duplicate_records INTEGER NOT NULL,
    missing_project_ids INTEGER NOT NULL,
    missing_village INTEGER NOT NULL,
    missing_district INTEGER NOT NULL,
    missing_state INTEGER NOT NULL,
    missing_expenditure INTEGER NOT NULL,
    missing_dates INTEGER NOT NULL,
    missing_contractor INTEGER NOT NULL,
    missing_coordinates INTEGER NOT NULL,
    invalid_dates INTEGER NOT NULL,
    invalid_amounts INTEGER NOT NULL,
    conflicting_records INTEGER NOT NULL,
    overall_quality_score NUMERIC(5, 2) NOT NULL -- 0.00 to 100.00%
);

-- Duplicate review queue
CREATE TABLE IF NOT EXISTS duplicate_detection_logs (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    project_id_1 VARCHAR(100) NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    project_id_2 VARCHAR(100) NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    match_confidence NUMERIC(4, 2) NOT NULL,
    match_reasons TEXT NOT NULL, -- e.g. 'Identical description and amount in same district'
    review_status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'CONFIRMED_DUPLICATE', 'CONFIRMED_DISTINCT'
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_notes TEXT
);

-- Source conflict logs
CREATE TABLE IF NOT EXISTS conflict_detection_logs (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    conflicting_field VARCHAR(100) NOT NULL, -- e.g. 'expenditure', 'actual_completion_date'
    source_a_id VARCHAR(50) NOT NULL REFERENCES data_sources(source_id),
    source_a_value TEXT,
    source_a_date DATE,
    source_b_id VARCHAR(50) NOT NULL REFERENCES data_sources(source_id),
    source_b_value TEXT,
    source_b_date DATE,
    resolution_status VARCHAR(50) DEFAULT 'UNRESOLVED', -- 'UNRESOLVED', 'MANUALLY_RESOLVED'
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district);
CREATE INDEX IF NOT EXISTS idx_projects_village_code ON projects(village_code);
CREATE INDEX IF NOT EXISTS idx_projects_normalized_status ON projects(normalized_status);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_recommendation_date ON projects(recommendation_date);
CREATE INDEX IF NOT EXISTS idx_projects_sanction_date ON projects(sanction_date);
CREATE INDEX IF NOT EXISTS idx_projects_source_id ON projects(source_id);
CREATE INDEX IF NOT EXISTS idx_projects_duplicate ON projects(is_potential_duplicate);
CREATE INDEX IF NOT EXISTS idx_projects_conflict ON projects(has_source_conflict);
