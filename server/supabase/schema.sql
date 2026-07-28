-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('super_admin', 'admin', 'donor', 'hospital', 'staff')),
    active BOOLEAN DEFAULT true,
    avatar TEXT DEFAULT '',
    refresh_token TEXT,
    reset_password_token TEXT,
    reset_password_expire TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: donors
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE NOT NULL,
    age INTEGER NOT NULL,
    weight NUMERIC NOT NULL CHECK (weight >= 45),
    phone TEXT NOT NULL,
    address JSONB DEFAULT '{}'::jsonb,
    medical_history TEXT[] DEFAULT '{}',
    eligibility BOOLEAN DEFAULT true,
    last_donation_date TIMESTAMP WITH TIME ZONE,
    profile_image TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: hospitals
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    hospital_name TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: camps
CREATE TABLE camps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_name TEXT NOT NULL,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    capacity INTEGER DEFAULT 100,
    registered_donors_count INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: donations
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units NUMERIC DEFAULT 1 CHECK (units >= 1),
    donation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    camp_id UUID REFERENCES camps(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Registered' CHECK (status IN ('Registered', 'Screening', 'Collected', 'Testing', 'Stored', 'Rejected')),
    rejection_reason TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: blood_tests
CREATE TABLE blood_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE UNIQUE,
    hiv TEXT NOT NULL CHECK (hiv IN ('Negative', 'Positive')),
    hepatitis_b TEXT NOT NULL CHECK (hepatitis_b IN ('Negative', 'Positive')),
    hepatitis_c TEXT NOT NULL CHECK (hepatitis_c IN ('Negative', 'Positive')),
    malaria TEXT NOT NULL CHECK (malaria IN ('Negative', 'Positive')),
    syphilis TEXT NOT NULL CHECK (syphilis IN ('Negative', 'Positive')),
    hemoglobin NUMERIC NOT NULL,
    blood_pressure TEXT NOT NULL,
    remarks TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('Approved', 'Rejected')),
    tested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: inventories
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units NUMERIC NOT NULL CHECK (units >= 1),
    collection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    batch_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Expired', 'Discarded')),
    donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: requests
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units NUMERIC NOT NULL CHECK (units >= 1),
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Urgent', 'Emergency')),
    required_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT DEFAULT '',
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Allocated', 'Completed', 'Rejected')),
    rejection_reason TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    receiver UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_role TEXT DEFAULT 'all' CHECK (receiver_role IN ('all', 'super_admin', 'admin', 'donor', 'hospital', 'staff')),
    read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'General' CHECK (type IN ('StockAlert', 'DonationReminder', 'RequestStatus', 'CampUpdate', 'General')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: activity_logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    ip_address TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update timestamp functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_donors_modtime BEFORE UPDATE ON donors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hospitals_modtime BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_camps_modtime BEFORE UPDATE ON camps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_donations_modtime BEFORE UPDATE ON donations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_blood_tests_modtime BEFORE UPDATE ON blood_tests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventories_modtime BEFORE UPDATE ON inventories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_requests_modtime BEFORE UPDATE ON requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notifications_modtime BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_activity_logs_modtime BEFORE UPDATE ON activity_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
