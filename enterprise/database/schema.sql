-- =================================================================================
-- Enterprise Multi-Tenant Blood Bank Management System - Database Schema
-- =================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE org_type AS ENUM ('BLOOD_BANK', 'HOSPITAL');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE component_type AS ENUM ('WHOLE_BLOOD', 'PLASMA', 'PLATELETS', 'RBC', 'CRYOPRECIPITATE');
CREATE TYPE donation_status AS ENUM ('PENDING', 'TESTING', 'APPROVED', 'REJECTED', 'DISCARDED');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'PARTIAL', 'FULFILLED', 'REJECTED');
CREATE TYPE test_result AS ENUM ('PENDING', 'SAFE', 'UNSAFE');

-- ==========================================
-- 1. TENANT / ORGANIZATION
-- ==========================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type org_type NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    time_zone VARCHAR(100) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, setting_key)
);

-- ==========================================
-- 2. ROLES & PERMISSIONS
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., SUPER_ADMIN, BLOOD_BANK_ADMIN, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL, -- e.g., CREATE_USER, VIEW_INVENTORY
    resource VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(action, resource)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ==========================================
-- 3. USERS (Multi-Tenant)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for Super Admin
    role_id UUID NOT NULL REFERENCES roles(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    force_password_change BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. DONORS (Multi-Tenant)
-- ==========================================
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    blood_group blood_group NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    last_donation_date DATE,
    is_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE donor_medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    has_diseases BOOLEAN DEFAULT false,
    disease_details TEXT,
    medications TEXT,
    allergies TEXT,
    weight_kg DECIMAL(5,2),
    hemoglobin_level DECIMAL(5,2),
    blood_pressure VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. DONATIONS & TESTING
-- ==========================================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donors(id),
    bag_number VARCHAR(100) UNIQUE NOT NULL,
    volume_ml INTEGER NOT NULL,
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status donation_status DEFAULT 'PENDING',
    collected_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blood_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tested_by UUID REFERENCES users(id),
    hiv_result test_result DEFAULT 'PENDING',
    hbv_result test_result DEFAULT 'PENDING',
    hcv_result test_result DEFAULT 'PENDING',
    syphilis_result test_result DEFAULT 'PENDING',
    malaria_result test_result DEFAULT 'PENDING',
    overall_safe BOOLEAN DEFAULT false,
    test_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. INVENTORY
-- ==========================================
CREATE TABLE blood_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    donation_id UUID REFERENCES donations(id), -- Origin of the blood
    blood_group blood_group NOT NULL,
    component_type component_type NOT NULL,
    bag_number VARCHAR(100) UNIQUE NOT NULL,
    volume_ml INTEGER NOT NULL,
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    storage_location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ALLOCATED, DISCARDED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. HOSPITALS & PATIENTS
-- ==========================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    hospital_number VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    blood_group blood_group NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    attending_doctor VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. BLOOD REQUESTS
-- ==========================================
CREATE TABLE blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requesting_org_id UUID NOT NULL REFERENCES organizations(id), -- Hospital
    fulfilling_org_id UUID REFERENCES organizations(id), -- Blood Bank
    patient_id UUID REFERENCES patients(id),
    priority VARCHAR(50) DEFAULT 'ROUTINE', -- ROUTINE, URGENT, EMERGENCY
    status request_status DEFAULT 'PENDING',
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    required_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blood_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    blood_group blood_group NOT NULL,
    component_type component_type NOT NULL,
    units_requested INTEGER NOT NULL,
    units_fulfilled INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 9. AUDIT & LOGS
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id), -- NULL for system-wide events
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- Multi-Tenancy Policy Enforcement
-- ==========================================

-- Enable RLS on all tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

-- Create policies utilizing application-set configuration 'app.current_tenant'
-- The Spring Boot backend will execute `SET LOCAL app.current_tenant = 'org-uuid'` 
-- and `SET LOCAL app.is_super_admin = 'true|false'` before executing queries.

CREATE POLICY tenant_isolation_users ON users
    USING (current_setting('app.is_super_admin', true) = 'true' OR organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_donors ON donors
    USING (current_setting('app.is_super_admin', true) = 'true' OR organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_donations ON donations
    USING (current_setting('app.is_super_admin', true) = 'true' OR organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_inventory ON blood_inventory
    USING (current_setting('app.is_super_admin', true) = 'true' OR organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY tenant_isolation_requests ON blood_requests
    USING (current_setting('app.is_super_admin', true) = 'true' OR requesting_org_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid OR fulfilling_org_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
