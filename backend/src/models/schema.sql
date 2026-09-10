-- RakshaSetu Relational PostgreSQL Schema
-- AI-Powered Confidential Workplace Harassment Reporting & Case Management

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS support_contacts CASCADE;
DROP TABLE IF EXISTS consents CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS police_referrals CASCADE;
DROP TABLE IF EXISTS matching_reports CASCADE;
DROP TABLE IF EXISTS matching_patterns CASCADE;
DROP TABLE IF EXISTS case_status_history CASCADE;
DROP TABLE IF EXISTS evidence_hashes CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Organizations
CREATE TABLE organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    industry VARCHAR(128),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles
CREATE TABLE roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT
);

INSERT INTO roles (id, name, description) VALUES
('USER', 'Survivor / Employee', 'Can document incidents privately, draft complaints, track cases, maintain evidence vault'),
('ADMIN', 'ICC / Organization Officer', 'Internal Complaints Committee officer, oversees workplace cases, POSH compliance'),
('POLICE', 'Law Enforcement Authority', 'Assigned authority for criminal escalation, FIR inquiry, evidence hash validation');

-- 3. Users
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    anonymous_display_name VARCHAR(255),
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL REFERENCES roles(id),
    organization_id VARCHAR(64) REFERENCES organizations(id),
    department VARCHAR(128),
    preferred_language VARCHAR(32) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Consents & Privacy Settings
CREATE TABLE consents (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allow_evidence_sharing BOOLEAN DEFAULT true,
    allow_anonymous_pattern_matching BOOLEAN DEFAULT true,
    allow_cross_org_matching BOOLEAN DEFAULT true,
    allow_police_escalation BOOLEAN DEFAULT false,
    allow_notifications BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Incidents
CREATE TABLE incidents (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id VARCHAR(64) REFERENCES organizations(id),
    incident_date DATE NOT NULL,
    incident_time VARCHAR(32),
    location TEXT NOT NULL,
    department VARCHAR(128),
    category VARCHAR(64) NOT NULL,
    person_involved VARCHAR(255) NOT NULL,
    person_role_or_relationship VARCHAR(255),
    description TEXT NOT NULL,
    has_threat BOOLEAN DEFAULT false,
    has_physical_contact BOOLEAN DEFAULT false,
    has_discrimination BOOLEAN DEFAULT false,
    has_sexual_harassment BOOLEAN DEFAULT false,
    has_stalking BOOLEAN DEFAULT false,
    has_cyber_harassment BOOLEAN DEFAULT false,
    is_still_in_contact BOOLEAN DEFAULT false,
    is_immediate_danger BOOLEAN DEFAULT false,
    audio_url TEXT,
    transcript TEXT,
    audio_language VARCHAR(32) DEFAULT 'en',
    status VARCHAR(32) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Complaints
CREATE TABLE complaints (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    nature_of_harassment TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    witnesses TEXT,
    safety_concerns TEXT,
    requested_action TEXT,
    missing_information TEXT,
    is_private BOOLEAN DEFAULT true,
    submission_target VARCHAR(32) DEFAULT 'PRIVATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cases
CREATE TABLE cases (
    id VARCHAR(64) PRIMARY KEY, -- e.g. RS-2026-000127
    incident_id VARCHAR(64) REFERENCES incidents(id),
    complaint_id VARCHAR(64) REFERENCES complaints(id),
    complainant_id VARCHAR(64) NOT NULL REFERENCES users(id),
    organization_id VARCHAR(64) REFERENCES organizations(id),
    category VARCHAR(64) NOT NULL,
    risk_score INT DEFAULT 0,
    risk_level VARCHAR(32) DEFAULT 'LOW',
    status VARCHAR(64) DEFAULT 'SUBMITTED', 
    -- SUBMITTED, RECEIVED, ASSIGNED, UNDER_INVESTIGATION, EVIDENCE_REVIEW, ACTION_TAKEN, RESOLVED, CLOSED
    assigned_officer_id VARCHAR(64) REFERENCES users(id),
    assigned_officer_name VARCHAR(255),
    recommended_authority VARCHAR(128),
    posh_deadline_date DATE,
    is_police_escalated BOOLEAN DEFAULT false,
    police_case_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Evidence
CREATE TABLE evidence (
    id VARCHAR(64) PRIMARY KEY, -- e.g. EV-2026-00125
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE SET NULL,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    uploader_id VARCHAR(64) NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    integrity_status VARCHAR(32) DEFAULT 'VERIFIED',
    encryption_status VARCHAR(64) DEFAULT 'AES-256 GCM AT REST',
    is_shared_with_police BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Evidence Hashes & Verification Log
CREATE TABLE evidence_hashes (
    id VARCHAR(64) PRIMARY KEY,
    evidence_id VARCHAR(64) NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    sha256_hash VARCHAR(64) NOT NULL,
    verified_by VARCHAR(64),
    verification_source VARCHAR(64), -- 'SERVER_UPLOAD', 'POLICE_VERIFICATION', 'ADMIN_INSPECTION'
    match_status VARCHAR(32) DEFAULT 'MATCH',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Case Status History / Timeline
CREATE TABLE case_status_history (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    from_status VARCHAR(64),
    to_status VARCHAR(64) NOT NULL,
    changed_by_id VARCHAR(64) REFERENCES users(id),
    actor_role VARCHAR(32),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Risk Assessments
CREATE TABLE risk_assessments (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    score INT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    factors JSONB NOT NULL,
    recommended_pathway VARCHAR(128) NOT NULL,
    urgency_level VARCHAR(32) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Matching Patterns (Escrow)
CREATE TABLE matching_patterns (
    id VARCHAR(64) PRIMARY KEY, -- e.g. PAT-2026-008
    matched_subject_hash VARCHAR(128) NOT NULL,
    offender_alias VARCHAR(255) NOT NULL,
    report_count INT DEFAULT 1,
    organizations_count INT DEFAULT 1,
    risk_level VARCHAR(32) DEFAULT 'HIGH',
    threshold_met BOOLEAN DEFAULT false,
    status VARCHAR(32) DEFAULT 'THRESHOLD_REACHED',
    evidence_count INT DEFAULT 0,
    organizations_list JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Matching Reports
CREATE TABLE matching_reports (
    id VARCHAR(64) PRIMARY KEY,
    pattern_id VARCHAR(64) REFERENCES matching_patterns(id) ON DELETE CASCADE,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    offender_normalized_name VARCHAR(255) NOT NULL,
    offender_department VARCHAR(128),
    organization_id VARCHAR(64) REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Police Referrals
CREATE TABLE police_referrals (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    referral_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    referred_by_id VARCHAR(64) REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(64) DEFAULT 'PENDING', 
    -- PENDING, ACCEPTED, INVESTIGATING, FIR_INITIATED, ACTION_TAKEN, CLOSED
    assigned_officer_id VARCHAR(64) REFERENCES users(id),
    assigned_officer_name VARCHAR(255),
    fir_number VARCHAR(128),
    police_notes TEXT,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. POSH Deadlines
CREATE TABLE deadlines (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    complaint_submitted_date DATE NOT NULL,
    investigation_deadline DATE NOT NULL, -- 90 days statutory POSH window
    status VARCHAR(32) DEFAULT 'ON_TRACK', -- ON_TRACK, DUE_SOON, OVERDUE
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Messages
CREATE TABLE messages (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
    sender_role VARCHAR(32) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Notifications
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(64) REFERENCES users(id),
    actor_name VARCHAR(255),
    actor_role VARCHAR(32),
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    case_id VARCHAR(64),
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    result VARCHAR(32) DEFAULT 'SUCCESS',
    details JSONB
);

-- 19. Support Contacts / Helplines
CREATE TABLE support_contacts (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    description TEXT,
    availability VARCHAR(64) DEFAULT '24/7',
    is_emergency BOOLEAN DEFAULT false
);
