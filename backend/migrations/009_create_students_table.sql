-- =============================================================================
-- CREATE STUDENTS TABLE
-- Separate table for student-specific data, linked to users table
-- =============================================================================

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE student_status AS ENUM ('PENDING', 'CHECKED_IN', 'ON_LEAVE', 'SUSPENDED', 'ALUMNI', 'WITHDRAWN');
CREATE TYPE renewal_status AS ENUM ('NOT_DUE', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Personal Information
    gender gender_type,
    date_of_birth DATE,
    aadhar_number TEXT,
    native_place TEXT,
    permanent_address TEXT,

    -- Guardian Information
    father_name TEXT,
    father_mobile TEXT,
    mother_name TEXT,
    mother_mobile TEXT,
    guardian_name TEXT,
    guardian_mobile TEXT,
    guardian_relation TEXT,

    -- Academic Information
    institution TEXT,
    course TEXT,
    year_of_study TEXT,
    enrollment_number TEXT,

    -- Hostel Information
    vertical vertical_type NOT NULL,
    joining_date DATE,
    current_period TEXT,  -- e.g., 'SEMESTER_1', 'SEMESTER_2'
    academic_year TEXT,   -- e.g., '2024-25'

    -- Status
    status student_status NOT NULL DEFAULT 'PENDING',

    -- Renewal Information
    renewal_status renewal_status DEFAULT 'NOT_DUE',
    renewal_due_date DATE,
    last_renewal_date DATE,

    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,

    -- Medical Information (optional)
    blood_group TEXT,
    medical_conditions TEXT,
    allergies TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_vertical ON students(vertical);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_renewal_status ON students(renewal_status);
CREATE INDEX idx_students_father_mobile ON students(father_mobile);
CREATE INDEX idx_students_mother_mobile ON students(mother_mobile);

-- Update trigger
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Students table created successfully!' as status;
