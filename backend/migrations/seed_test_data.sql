-- =============================================================================
-- SEED DATA FOR HOSTEL MANAGEMENT SYSTEM
-- Run 006_development_schema_adjustments.sql FIRST, then run this script
-- =============================================================================

-- Clear existing data (in reverse order of dependencies)
TRUNCATE audit_logs, payments, fees, leave_requests, room_allocations, documents, applications, rooms, users CASCADE;

-- =============================================================================
-- 1. USERS
-- Note: auth_user_id is NULL for development (we're not using Supabase Auth for testing)
-- role enum: STUDENT, SUPERINTENDENT, TRUSTEE, ACCOUNTS, PARENT
-- vertical enum: BOYS_HOSTEL, GIRLS_ASHRAM, DHARAMSHALA
-- =============================================================================
INSERT INTO users (id, email, mobile, full_name, role, vertical, is_active, requires_password_change, parent_mobile, created_at) VALUES
-- Staff
('a0000000-0000-0000-0000-000000000001', 'student@example.com', '9876543210', 'Rahul Kumar', 'STUDENT', 'BOYS_HOSTEL', true, false, '9876543220', '2024-01-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000002', 'superintendent@jain.org', '9876543211', 'Boys Superintendent', 'SUPERINTENDENT', 'BOYS_HOSTEL', true, false, NULL, '2024-01-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000003', 'trustee@jain.org', '9876543212', 'Trustee Admin', 'TRUSTEE', NULL, true, false, NULL, '2024-01-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000004', 'accounts@jain.org', '9876543213', 'Accounts Admin', 'ACCOUNTS', NULL, true, false, NULL, '2024-01-15T10:00:00Z'),
-- Students (with parent_mobile linking to parent users)
('a0000000-0000-0000-0000-000000000005', 'amit.kumar@email.com', '9876543214', 'Amit Kumar Jain', 'STUDENT', 'BOYS_HOSTEL', true, false, '9876543221', '2024-06-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000006', 'priya.sharma@email.com', '9876543215', 'Priya Sharma', 'STUDENT', 'GIRLS_ASHRAM', true, false, '9876543222', '2024-07-01T10:00:00Z'),
('a0000000-0000-0000-0000-000000000007', 'rahul.verma@email.com', '9876543216', 'Rahul Verma', 'STUDENT', 'BOYS_HOSTEL', true, false, '9876543220', '2024-08-01T10:00:00Z'),
('a0000000-0000-0000-0000-000000000008', 'neha.gupta@email.com', '9876543217', 'Neha Gupta', 'STUDENT', 'GIRLS_ASHRAM', true, false, '9876543222', '2024-08-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000009', 'superintendent-girls@jain.org', '9876543218', 'Girls Superintendent', 'SUPERINTENDENT', 'GIRLS_ASHRAM', true, false, NULL, '2024-01-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000010', 'superintendent-dharamshala@jain.org', '9876543219', 'Dharamshala Superintendent', 'SUPERINTENDENT', 'DHARAMSHALA', true, false, NULL, '2024-01-15T10:00:00Z'),
-- Parents
('a0000000-0000-0000-0000-000000000011', 'parent@example.com', '9876543220', 'Rajesh Kumar', 'PARENT', NULL, true, false, NULL, '2024-01-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000012', 'suresh.jain@email.com', '9876543221', 'Suresh Kumar Jain', 'PARENT', NULL, true, false, NULL, '2024-06-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000013', 'rajesh.sharma@email.com', '9876543222', 'Rajesh Sharma', 'PARENT', NULL, true, false, NULL, '2024-07-01T10:00:00Z'),
-- More students
('a0000000-0000-0000-0000-000000000014', 'vikram.singh@email.com', '9876543223', 'Vikram Singh', 'STUDENT', 'BOYS_HOSTEL', true, false, '9876543221', '2024-09-01T10:00:00Z'),
('a0000000-0000-0000-0000-000000000015', 'anjali.patel@email.com', '9876543224', 'Anjali Patel', 'STUDENT', 'GIRLS_ASHRAM', true, false, '9876543222', '2024-09-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000016', 'karan.mehta@email.com', '9876543225', 'Karan Mehta', 'STUDENT', 'BOYS_HOSTEL', true, false, '9876543220', '2024-10-01T10:00:00Z'),
('a0000000-0000-0000-0000-000000000017', 'sneha.reddy@email.com', '9876543226', 'Sneha Reddy', 'STUDENT', 'GIRLS_ASHRAM', true, false, '9876543221', '2024-10-15T10:00:00Z'),
('a0000000-0000-0000-0000-000000000018', 'vijay.kumar@email.com', '9988776680', 'Vijay Kumar', 'STUDENT', 'BOYS_HOSTEL', true, true, '9876543220', '2026-01-07T16:00:00Z');

-- =============================================================================
-- 2. ROOMS
-- status enum: AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
-- amenities is TEXT[] array
-- =============================================================================
INSERT INTO rooms (id, room_number, vertical, block, floor, capacity, occupied_count, status, amenities, created_at) VALUES
-- Boys Hostel
('b0000000-0000-0000-0000-000000000001', '101', 'BOYS_HOSTEL', 'A', 1, 2, 1, 'AVAILABLE', ARRAY['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000002', '102', 'BOYS_HOSTEL', 'A', 1, 2, 1, 'AVAILABLE', ARRAY['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000003', '103', 'BOYS_HOSTEL', 'A', 1, 2, 1, 'AVAILABLE', ARRAY['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000004', '104', 'BOYS_HOSTEL', 'A', 1, 2, 1, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000005', '105', 'BOYS_HOSTEL', 'A', 1, 2, 1, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000006', '106', 'BOYS_HOSTEL', 'A', 1, 2, 0, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000013', '107', 'BOYS_HOSTEL', 'A', 1, 2, 0, 'MAINTENANCE', ARRAY['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
-- Girls Ashram
('b0000000-0000-0000-0000-000000000007', '201', 'GIRLS_ASHRAM', 'B', 2, 2, 1, 'AVAILABLE', ARRAY['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000008', '202', 'GIRLS_ASHRAM', 'B', 2, 2, 1, 'AVAILABLE', ARRAY['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000009', '203', 'GIRLS_ASHRAM', 'B', 2, 2, 1, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000010', '204', 'GIRLS_ASHRAM', 'B', 2, 2, 1, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], '2024-01-01T00:00:00Z'),
-- Dharamshala
('b0000000-0000-0000-0000-000000000011', '301', 'DHARAMSHALA', 'C', 3, 4, 0, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom'], '2024-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000012', '302', 'DHARAMSHALA', 'C', 3, 4, 0, 'AVAILABLE', ARRAY['Fan', 'Common Bathroom'], '2024-01-01T00:00:00Z');

-- =============================================================================
-- 3. ROOM ALLOCATIONS
-- status enum: ACTIVE, CHECKED_OUT, TRANSFERRED, CANCELLED
-- =============================================================================
INSERT INTO room_allocations (id, student_user_id, room_id, status, allocated_at, vacated_at, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ACTIVE', '2024-01-15T10:00:00Z', NULL, '2024-01-15T10:00:00Z'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'ACTIVE', '2024-06-15T10:00:00Z', NULL, '2024-06-15T10:00:00Z'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 'ACTIVE', '2024-07-01T10:00:00Z', NULL, '2024-07-01T10:00:00Z'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'ACTIVE', '2024-08-01T10:00:00Z', NULL, '2024-08-01T10:00:00Z'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'ACTIVE', '2024-08-15T10:00:00Z', NULL, '2024-08-15T10:00:00Z'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000004', 'ACTIVE', '2024-09-01T10:00:00Z', NULL, '2024-09-01T10:00:00Z'),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000009', 'ACTIVE', '2024-09-15T10:00:00Z', NULL, '2024-09-15T10:00:00Z'),
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000005', 'ACTIVE', '2024-10-01T10:00:00Z', NULL, '2024-10-01T10:00:00Z'),
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000010', 'ACTIVE', '2024-10-15T10:00:00Z', NULL, '2024-10-15T10:00:00Z');

-- =============================================================================
-- 4. LEAVE REQUESTS
-- type enum: HOME_VISIT, SHORT_LEAVE, MEDICAL, EMERGENCY, OTHER
-- status enum: PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
-- =============================================================================
INSERT INTO leave_requests (id, student_user_id, type, start_time, end_time, reason, status, approved_by, approved_at, rejected_at, rejection_reason, parent_notified, parent_notified_at, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'HOME_VISIT', '2025-12-25T00:00:00Z', '2025-12-27T23:59:59Z', 'Family function - Diwali celebration', 'APPROVED', 'a0000000-0000-0000-0000-000000000002', '2025-12-20T10:00:00Z', NULL, NULL, true, '2025-12-20T10:30:00Z', '2025-12-18T09:00:00Z'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SHORT_LEAVE', '2026-01-15T14:00:00Z', '2026-01-15T18:00:00Z', 'Medical appointment at city hospital', 'PENDING', NULL, NULL, NULL, NULL, false, NULL, '2026-01-12T09:00:00Z'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'OTHER', '2026-01-20T18:00:00Z', '2026-01-20T22:00:00Z', 'Dinner with family friends visiting the city', 'APPROVED', 'a0000000-0000-0000-0000-000000000002', '2026-01-18T10:00:00Z', NULL, NULL, true, '2026-01-18T10:30:00Z', '2026-01-17T09:00:00Z'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'SHORT_LEAVE', '2026-01-14T14:00:00Z', '2026-01-14T17:00:00Z', 'Visit to library for project work', 'PENDING', NULL, NULL, NULL, NULL, false, NULL, '2026-01-11T10:00:00Z'),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'HOME_VISIT', '2026-01-25T00:00:00Z', '2026-01-28T23:59:59Z', 'Family wedding in hometown', 'APPROVED', 'a0000000-0000-0000-0000-000000000002', '2026-01-20T10:00:00Z', NULL, NULL, true, '2026-01-20T10:30:00Z', '2026-01-18T09:00:00Z'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'SHORT_LEAVE', '2026-01-13T15:00:00Z', '2026-01-13T18:30:00Z', 'Medical checkup', 'PENDING', NULL, NULL, NULL, NULL, false, NULL, '2026-01-10T14:00:00Z'),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000006', 'HOME_VISIT', '2026-02-01T08:00:00Z', '2026-02-05T18:00:00Z', 'Home visit during semester break', 'PENDING', NULL, NULL, NULL, NULL, false, NULL, '2026-01-22T09:00:00Z'),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007', 'SHORT_LEAVE', '2026-01-16T10:00:00Z', '2026-01-16T14:00:00Z', 'Bank work and documentation', 'APPROVED', 'a0000000-0000-0000-0000-000000000002', '2026-01-14T11:00:00Z', NULL, NULL, true, '2026-01-14T11:30:00Z', '2026-01-13T09:00:00Z'),
('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000014', 'OTHER', '2026-01-17T17:00:00Z', '2026-01-17T21:00:00Z', 'Attending a friend birthday party', 'REJECTED', NULL, NULL, '2026-01-15T10:00:00Z', 'Previous leave violation on record', true, '2026-01-15T10:30:00Z', '2026-01-14T09:00:00Z');

-- =============================================================================
-- 5. FEES
-- head enum: PROCESSING_FEE, SECURITY_DEPOSIT, HOSTEL_FEE, MESS_FEE, MAINTENANCE_FEE, etc.
-- status enum: PENDING, PAID, OVERDUE, WAIVED, REFUNDED, CANCELLED
-- =============================================================================
INSERT INTO fees (id, student_user_id, head, name, description, amount, due_date, status, paid_at, receipt_number, created_at) VALUES
-- Rahul Kumar (user 001)
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'PROCESSING_FEE', 'Processing Fee', 'One-time application processing fee', 500, '2024-01-15', 'PAID', '2024-01-15T14:00:00Z', 'RCP-2024-00001', '2024-01-15T10:00:00Z'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SECURITY_DEPOSIT', 'Security Deposit', 'Refundable security deposit', 10000, '2024-01-15', 'PAID', '2024-01-15T14:30:00Z', 'RCP-2024-00002', '2024-01-15T10:00:00Z'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 1)', 60000, '2024-01-20', 'PAID', '2024-01-18T10:00:00Z', 'RCP-2024-00003', '2024-01-15T10:00:00Z'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'MESS_FEE', 'Mess Fee', 'Mess Fees (Jan 2024)', 3000, '2024-01-25', 'PAID', '2024-01-24T10:00:00Z', 'RCP-2024-00004', '2024-01-20T10:00:00Z'),
('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 2)', 60000, '2024-07-15', 'PAID', '2024-07-10T10:00:00Z', 'RCP-2024-00050', '2024-07-01T10:00:00Z'),
('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'MESS_FEE', 'Mess Fee', 'Mess Fees (Jan 2026)', 3000, '2026-01-25', 'PENDING', NULL, NULL, '2026-01-01T10:00:00Z'),
('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 3 - Renewal)', 60000, '2026-07-15', 'PENDING', NULL, NULL, '2026-01-01T10:00:00Z'),
-- Amit Kumar (user 005)
('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'PROCESSING_FEE', 'Processing Fee', 'Processing Fee', 500, '2024-06-15', 'PAID', '2024-06-14T10:00:00Z', 'RCP-2024-00100', '2024-06-10T10:00:00Z'),
('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 'SECURITY_DEPOSIT', 'Security Deposit', 'Security Deposit', 10000, '2024-06-15', 'PAID', '2024-06-14T10:30:00Z', 'RCP-2024-00101', '2024-06-10T10:00:00Z'),
('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 1)', 60000, '2024-06-20', 'PAID', '2024-06-18T10:00:00Z', 'RCP-2024-00102', '2024-06-10T10:00:00Z'),
('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005', 'MESS_FEE', 'Mess Fee', 'Mess Fees (Jan 2026)', 3000, '2026-01-25', 'PENDING', NULL, NULL, '2026-01-01T10:00:00Z'),
-- Priya Sharma (user 006)
('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', 'PROCESSING_FEE', 'Processing Fee', 'Processing Fee', 500, '2024-07-01', 'PAID', '2024-06-30T10:00:00Z', 'RCP-2024-00150', '2024-06-25T10:00:00Z'),
('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006', 'SECURITY_DEPOSIT', 'Security Deposit', 'Security Deposit', 10000, '2024-07-01', 'PAID', '2024-06-30T10:30:00Z', 'RCP-2024-00151', '2024-06-25T10:00:00Z'),
('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000006', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 1) - Girls Ashram', 55000, '2024-07-05', 'PAID', '2024-07-03T10:00:00Z', 'RCP-2024-00152', '2024-06-25T10:00:00Z'),
('e0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000006', 'MESS_FEE', 'Mess Fee', 'Mess Fees (Jan 2026)', 3000, '2026-01-25', 'OVERDUE', NULL, NULL, '2026-01-01T10:00:00Z'),
-- Other students
('e0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000007', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 2)', 60000, '2026-02-01', 'PENDING', NULL, NULL, '2026-01-15T10:00:00Z'),
('e0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000008', 'HOSTEL_FEE', 'Hostel Fee', 'Hostel Fees (Semester 2) - Girls Ashram', 55000, '2026-02-15', 'PENDING', NULL, NULL, '2026-01-15T10:00:00Z');

-- =============================================================================
-- 6. PAYMENTS (transactions)
-- payment_method enum: CASH, UPI, BANK_TRANSFER, CHEQUE, DEMAND_DRAFT, CARD, OTHER
-- =============================================================================
INSERT INTO payments (id, fee_id, student_user_id, amount, payment_method, transaction_id, status, paid_at, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 500, 'UPI', 'UPI202401150001', 'PAID', '2024-01-15T14:00:30Z', '2024-01-15T14:00:00Z'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 10000, 'BANK_TRANSFER', 'NEFT202401150001', 'PAID', '2024-01-15T14:35:00Z', '2024-01-15T14:30:00Z'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 60000, 'BANK_TRANSFER', 'NB202401180001', 'PAID', '2024-01-18T10:02:00Z', '2024-01-18T10:00:00Z'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 3000, 'UPI', 'UPI202401240001', 'PAID', '2024-01-24T10:00:30Z', '2024-01-24T10:00:00Z'),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 60000, 'BANK_TRANSFER', 'NB202407100001', 'PAID', '2024-07-10T10:02:00Z', '2024-07-10T10:00:00Z'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 500, 'UPI', 'UPI202406140001', 'PAID', '2024-06-14T10:00:30Z', '2024-06-14T10:00:00Z'),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 10000, 'UPI', 'UPI202406140002', 'PAID', '2024-06-14T10:30:30Z', '2024-06-14T10:30:00Z'),
('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 60000, 'BANK_TRANSFER', 'NB202406180001', 'PAID', '2024-06-18T10:02:00Z', '2024-06-18T10:00:00Z'),
('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', 500, 'UPI', 'UPI202406300001', 'PAID', '2024-06-30T10:00:30Z', '2024-06-30T10:00:00Z'),
('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006', 10000, 'UPI', 'UPI202406300002', 'PAID', '2024-06-30T10:30:30Z', '2024-06-30T10:30:00Z'),
('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000006', 55000, 'BANK_TRANSFER', 'NB202407030001', 'PAID', '2024-07-03T10:02:00Z', '2024-07-03T10:00:00Z');

-- =============================================================================
-- 7. APPLICATIONS
-- type enum: NEW, RENEWAL
-- current_status enum: DRAFT, SUBMITTED, REVIEW, INTERVIEW, APPROVED, REJECTED, ARCHIVED
-- =============================================================================
INSERT INTO applications (id, tracking_number, type, applicant_name, applicant_mobile, applicant_email, date_of_birth, gender, student_user_id, current_status, vertical, data, submitted_at, interview_scheduled_at, interview_completed_at, created_at) VALUES
('aa000000-0000-0000-0000-000000000001', 'BH-2025-00001', 'NEW', 'Rohan Desai', '+919988776655', 'rohan.desai@email.com', '2005-04-12', 'Male', NULL, 'SUBMITTED', 'BOYS_HOSTEL',
  '{"education": {"institution": "Mumbai University", "course": "B.Com", "year": "1st Year"}, "guardian_info": {"father_name": "Sunil Desai", "father_mobile": "+919988776656", "mother_name": "Rekha Desai"}, "documents_uploaded": true}',
  '2026-01-10T10:00:00Z', NULL, NULL, '2026-01-09T14:00:00Z'),

('aa000000-0000-0000-0000-000000000002', 'BH-2025-00002', 'NEW', 'Aditya Sharma', '+919988776660', 'aditya.sharma@email.com', '2004-08-22', 'Male', NULL, 'SUBMITTED', 'BOYS_HOSTEL',
  '{"education": {"institution": "BITS Pilani", "course": "B.Tech", "year": "2nd Year"}, "guardian_info": {"father_name": "Rakesh Sharma", "father_mobile": "+919988776661", "mother_name": "Anita Sharma"}, "documents_uploaded": true}',
  '2026-01-11T09:00:00Z', NULL, NULL, '2026-01-10T16:00:00Z'),

('aa000000-0000-0000-0000-000000000003', 'GA-2025-00001', 'NEW', 'Kavya Patel', '+919988776665', 'kavya.patel@email.com', '2005-11-08', 'Female', NULL, 'SUBMITTED', 'GIRLS_ASHRAM',
  '{"education": {"institution": "Gujarat University", "course": "B.Sc", "year": "1st Year"}, "guardian_info": {"father_name": "Hitesh Patel", "father_mobile": "+919988776666", "mother_name": "Bhavna Patel"}, "documents_uploaded": true}',
  '2026-01-11T11:00:00Z', NULL, NULL, '2026-01-10T18:00:00Z'),

('aa000000-0000-0000-0000-000000000004', 'BH-2025-00003', 'NEW', 'Sanjay Gupta', '+919988776670', 'sanjay.gupta@email.com', '2003-06-15', 'Male', NULL, 'REVIEW', 'BOYS_HOSTEL',
  '{"education": {"institution": "MANIT Bhopal", "course": "B.Tech", "year": "3rd Year"}, "guardian_info": {"father_name": "Manoj Gupta", "father_mobile": "+919988776671", "mother_name": "Sunita Gupta"}, "documents_uploaded": true}',
  '2026-01-08T10:00:00Z', NULL, NULL, '2026-01-07T14:00:00Z'),

('aa000000-0000-0000-0000-000000000005', 'GA-2025-00002', 'NEW', 'Ananya Desai', '+919988776675', 'ananya.desai@email.com', '2005-03-25', 'Female', NULL, 'INTERVIEW', 'GIRLS_ASHRAM',
  '{"education": {"institution": "Mumbai University", "course": "B.A", "year": "1st Year"}, "guardian_info": {"father_name": "Suresh Desai", "father_mobile": "+919988776676", "mother_name": "Pramila Desai"}, "documents_uploaded": true, "interview": {"mode": "ONLINE", "scheduled_at": "2026-01-15T10:00:00Z"}}',
  '2026-01-05T09:00:00Z', '2026-01-15T10:00:00Z', NULL, '2026-01-04T11:00:00Z'),

('aa000000-0000-0000-0000-000000000006', 'BH-2025-00004', 'NEW', 'Vijay Kumar', '+919988776680', 'vijay.kumar@email.com', '2004-02-14', 'Male', 'a0000000-0000-0000-0000-000000000018', 'APPROVED', 'BOYS_HOSTEL',
  '{"education": {"institution": "VNIT Nagpur", "course": "B.Tech", "year": "2nd Year"}, "guardian_info": {"father_name": "Ramesh Kumar", "father_mobile": "+919988776681", "mother_name": "Seema Kumar"}, "documents_uploaded": true}',
  '2026-01-02T10:00:00Z', '2026-01-05T11:00:00Z', '2026-01-05T12:00:00Z', '2026-01-01T14:00:00Z'),

('aa000000-0000-0000-0000-000000000007', 'BH-2025-00005', 'NEW', 'Ravi Tiwari', '+919988776685', 'ravi.tiwari@email.com', '2002-09-30', 'Male', NULL, 'REJECTED', 'BOYS_HOSTEL',
  '{"education": {"institution": "Lucknow University", "course": "B.A", "year": "Final Year"}, "guardian_info": {"father_name": "Ashok Tiwari", "father_mobile": "+919988776686", "mother_name": "Maya Tiwari"}, "documents_uploaded": true}',
  '2025-12-28T10:00:00Z', '2026-01-04T14:00:00Z', '2026-01-04T15:00:00Z', '2025-12-27T14:00:00Z'),

('aa000000-0000-0000-0000-000000000008', 'DH-2025-00001', 'NEW', 'Mahesh Joshi', '+919988776690', 'mahesh.joshi@email.com', '1969-05-20', 'Male', NULL, 'DRAFT', 'DHARAMSHALA',
  '{"purpose": "Pilgrimage visit", "expected_duration": "3 days"}',
  NULL, NULL, NULL, '2026-01-12T08:00:00Z');

-- =============================================================================
-- 8. DOCUMENTS
-- document_type enum: PHOTOGRAPH, AADHAAR_CARD, BIRTH_CERTIFICATE, EDUCATION_CERTIFICATE, etc.
-- status enum: UPLOADED, VERIFIED, REJECTED
-- Note: uploaded_by and bucket_id are required fields
-- =============================================================================
INSERT INTO documents (id, student_user_id, application_id, document_type, file_name, bucket_id, storage_path, status, verified_by, verified_at, uploaded_by, created_at) VALUES
('ab000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, 'AADHAAR_CARD', 'Aadhar Card', 'documents', 'documents/u1/aadhar.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000002', '2024-01-16T10:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2024-01-15T10:00:00Z'),
('ab000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', NULL, 'PHOTOGRAPH', 'Passport Photo', 'documents', 'documents/u1/photo.jpg', 'VERIFIED', 'a0000000-0000-0000-0000-000000000002', '2024-01-16T10:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2024-01-15T10:00:00Z'),
('ab000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', NULL, 'EDUCATION_CERTIFICATE', '12th Marksheet', 'documents', 'documents/u1/marksheet.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000002', '2024-01-16T10:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2024-01-15T10:00:00Z'),
('ab000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NULL, 'UNDERTAKING', 'Anti-Ragging Undertaking', 'documents', 'documents/u1/anti_ragging.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000002', '2024-01-16T10:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2024-01-15T10:00:00Z'),
('ab000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', NULL, 'UNDERTAKING', 'Hostel Rules Acknowledgment', 'documents', 'documents/u1/hostel_rules.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000002', '2024-01-16T10:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2024-01-15T10:00:00Z'),
('ab000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NULL, 'RECEIPT', 'Admission Fee Receipt', 'documents', 'documents/u1/fee_receipt.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000004', '2024-01-20T11:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2024-01-20T10:00:00Z'),
('ab000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', NULL, 'AADHAAR_CARD', 'Aadhar Card', 'documents', 'documents/u5/aadhar.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000002', '2024-06-16T10:00:00Z', 'a0000000-0000-0000-0000-000000000005', '2024-06-15T10:00:00Z'),
('ab000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', NULL, 'AADHAAR_CARD', 'Aadhar Card', 'documents', 'documents/u6/aadhar.pdf', 'VERIFIED', 'a0000000-0000-0000-0000-000000000009', '2024-07-02T10:00:00Z', 'a0000000-0000-0000-0000-000000000006', '2024-07-01T10:00:00Z');

-- =============================================================================
-- Done! Test data seeded successfully
-- =============================================================================
SELECT 'Seed data inserted successfully!' as status;
SELECT 'Users: ' || count(*) FROM users;
SELECT 'Rooms: ' || count(*) FROM rooms;
SELECT 'Room Allocations: ' || count(*) FROM room_allocations;
SELECT 'Leave Requests: ' || count(*) FROM leave_requests;
SELECT 'Fees: ' || count(*) FROM fees;
SELECT 'Payments: ' || count(*) FROM payments;
SELECT 'Applications: ' || count(*) FROM applications;
SELECT 'Documents: ' || count(*) FROM documents;
