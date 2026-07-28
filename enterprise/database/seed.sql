-- =================================================================================
-- Enterprise Multi-Tenant Blood Bank Management System - Seed Data
-- =================================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. SEED SYSTEM ROLES
-- ==========================================
INSERT INTO roles (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'SUPER_ADMIN', 'Full system access across all organizations'),
  ('22222222-2222-2222-2222-222222222222', 'BLOOD_BANK_ADMIN', 'Administrator for a specific Blood Bank organization'),
  ('33333333-3333-3333-3333-333333333333', 'HOSPITAL_ADMIN', 'Administrator for a specific Hospital organization'),
  ('44444444-4444-4444-4444-444444444444', 'LAB_TECHNICIAN', 'Manages blood testing and results'),
  ('55555555-5555-5555-5555-555555555555', 'INVENTORY_MANAGER', 'Manages blood stock and allocation'),
  ('66666666-6666-6666-6666-666666666666', 'RECEPTIONIST', 'Registers donors and schedules appointments'),
  ('77777777-7777-7777-7777-777777777777', 'DOCTOR', 'Requests blood for patients'),
  ('88888888-8888-8888-8888-888888888888', 'STAFF', 'General staff with limited modular access')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. SEED THE ONLY DEFAULT ACCOUNT
-- ==========================================
-- Business Rule: There must NOT be any default login accounts except ONE Super Admin account.
INSERT INTO users (
    id,
    organization_id, -- Super Admin has NO organization (System-wide)
    role_id,
    name,
    email,
    password_hash,
    force_password_change,
    is_active
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    NULL,
    '11111111-1111-1111-1111-111111111111', -- SUPER_ADMIN role ID
    'System Administrator',
    'superadmin@bloodbank.com',
    crypt('ChangeMe@123', gen_salt('bf')), -- Securely hash temporary password
    true, -- Force password change on first login as per requirements
    true
)
ON CONFLICT (email) DO NOTHING;

-- NO OTHER USERS, ORGANIZATIONS, OR STAFF SHOULD BE SEEDED.
-- EVERYTHING ELSE MUST BE CREATED BY THE SUPER ADMIN THROUGH THE APPLICATION.
