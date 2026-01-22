-- =============================================================================
-- SEED DATA FOR STUDENTS TABLE
-- Run after 009_create_students_table.sql
-- =============================================================================

INSERT INTO students (
    id, user_id, gender, date_of_birth, aadhar_number, native_place, permanent_address,
    father_name, father_mobile, mother_name, mother_mobile,
    institution, course, year_of_study,
    vertical, joining_date, current_period, academic_year,
    status, renewal_status, renewal_due_date
) VALUES
-- Rahul Kumar (u1) - Boys Hostel
(
    'bb000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Male', '2002-05-15', 'XXXX-XXXX-1234', 'Mumbai, Maharashtra',
    '123, Shanti Nagar, Andheri West, Mumbai - 400058',
    'Rajesh Kumar', '9876543220', 'Sunita Kumar', '9876543230',
    'Mumbai University', 'B.Com', '3rd Year',
    'BOYS_HOSTEL', '2024-01-15', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'PENDING', '2026-07-15'
),

-- Amit Kumar Jain (u5) - Boys Hostel
(
    'bb000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'Male', '2003-03-20', 'XXXX-XXXX-2345', 'Jaipur, Rajasthan',
    '45, Vaishali Nagar, Jaipur - 302021',
    'Suresh Kumar Jain', '9876543221', 'Kamla Jain', '9876543231',
    'BITS Pilani', 'B.Tech', '2nd Year',
    'BOYS_HOSTEL', '2024-06-15', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'PENDING', '2026-06-15'
),

-- Priya Sharma (u6) - Girls Ashram
(
    'bb000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000006',
    'Female', '2003-08-10', 'XXXX-XXXX-3456', 'Ahmedabad, Gujarat',
    '78, Navrangpura, Ahmedabad - 380009',
    'Rajesh Sharma', '9876543222', 'Meena Sharma', '9876543232',
    'Gujarat University', 'B.Sc', '2nd Year',
    'GIRLS_ASHRAM', '2024-07-01', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-07-01'
),

-- Rahul Verma (u7) - Boys Hostel
(
    'bb000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000007',
    'Male', '2002-11-25', 'XXXX-XXXX-4567', 'Delhi',
    '12, Model Town, Delhi - 110009',
    'Ramesh Verma', '9876543223', 'Suman Verma', '9876543233',
    'Delhi University', 'B.A', '3rd Year',
    'BOYS_HOSTEL', '2024-08-01', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-08-01'
),

-- Neha Gupta (u8) - Girls Ashram
(
    'bb000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000008',
    'Female', '2003-04-18', 'XXXX-XXXX-5678', 'Pune, Maharashtra',
    '56, Koregaon Park, Pune - 411001',
    'Ashok Gupta', '9876543224', 'Rekha Gupta', '9876543234',
    'Pune University', 'B.Com', '2nd Year',
    'GIRLS_ASHRAM', '2024-08-15', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-08-15'
),

-- Vikram Singh (u14) - Boys Hostel
(
    'bb000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000014',
    'Male', '2002-07-12', 'XXXX-XXXX-6789', 'Lucknow, UP',
    '89, Gomti Nagar, Lucknow - 226010',
    'Surender Singh', '9876543225', 'Kavita Singh', '9876543235',
    'Lucknow University', 'B.Tech', '3rd Year',
    'BOYS_HOSTEL', '2024-09-01', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-09-01'
),

-- Anjali Patel (u15) - Girls Ashram
(
    'bb000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000015',
    'Female', '2003-12-05', 'XXXX-XXXX-7890', 'Surat, Gujarat',
    '23, Adajan, Surat - 395009',
    'Hitesh Patel', '9876543226', 'Bhavna Patel', '9876543236',
    'SVNIT Surat', 'B.Tech', '2nd Year',
    'GIRLS_ASHRAM', '2024-09-15', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-09-15'
),

-- Karan Mehta (u16) - Boys Hostel
(
    'bb000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000016',
    'Male', '2003-02-28', 'XXXX-XXXX-8901', 'Indore, MP',
    '67, Vijay Nagar, Indore - 452010',
    'Prakash Mehta', '9876543227', 'Anita Mehta', '9876543237',
    'IIT Indore', 'B.Tech', '2nd Year',
    'BOYS_HOSTEL', '2024-10-01', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-10-01'
),

-- Sneha Reddy (u17) - Girls Ashram
(
    'bb000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000017',
    'Female', '2002-09-22', 'XXXX-XXXX-9012', 'Hyderabad, Telangana',
    '12, Banjara Hills, Hyderabad - 500034',
    'Venkat Reddy', '9876543228', 'Lakshmi Reddy', '9876543238',
    'JNTU Hyderabad', 'B.Tech', '3rd Year',
    'GIRLS_ASHRAM', '2024-10-15', 'SEMESTER_2', '2024-25',
    'CHECKED_IN', 'NOT_DUE', '2026-10-15'
),

-- Vijay Kumar (u18) - Boys Hostel (newly approved)
(
    'bb000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000018',
    'Male', '2004-02-14', 'XXXX-XXXX-0123', 'Nagpur, Maharashtra',
    '34, Civil Lines, Nagpur - 440001',
    'Ramesh Kumar', '9876543229', 'Seema Kumar', '9876543239',
    'VNIT Nagpur', 'B.Tech', '2nd Year',
    'BOYS_HOSTEL', '2026-01-07', 'SEMESTER_1', '2025-26',
    'PENDING', 'NOT_DUE', NULL
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Students seed data inserted!' as status;
SELECT 'Students: ' || count(*) FROM students;
