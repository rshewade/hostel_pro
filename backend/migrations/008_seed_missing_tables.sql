-- =============================================================================
-- SEED DATA FOR MISSING TABLES
-- Run after 007_create_missing_tables.sql
-- =============================================================================

-- ============================================
-- 1. INTERVIEWS
-- ============================================
INSERT INTO interviews (id, application_id, scheduled_date, scheduled_time, schedule_datetime, mode, status, meeting_link, superintendent_id, trustee_id, notes, final_score, internal_remarks, completed_at, created_at) VALUES
-- Scheduled interview for Ananya Desai (Girls Ashram)
('11000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', '2026-01-15', '10:00:00', '2026-01-15T10:00:00Z', 'ONLINE', 'SCHEDULED', 'https://meet.google.com/abc-defg-hij', 'a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'Interview scheduled for Girls Ashram admission', NULL, NULL, NULL, '2026-01-08T10:00:00Z'),

-- Completed interview for Vijay Kumar (approved)
('11000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000006', '2026-01-05', '11:00:00', '2026-01-05T11:00:00Z', 'IN_PERSON', 'COMPLETED', NULL, 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Interview completed successfully', 85, 'Excellent candidate with strong academic background', '2026-01-05T12:00:00Z', '2026-01-03T10:00:00Z'),

-- Completed interview for Ravi Tiwari (rejected)
('11000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000007', '2026-01-04', '14:00:00', '2026-01-04T14:00:00Z', 'ONLINE', 'COMPLETED', 'https://meet.google.com/xyz-uvwx-rst', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Interview completed - not recommended', 45, 'Does not meet age criteria for new admission', '2026-01-04T15:00:00Z', '2026-01-02T10:00:00Z');

-- ============================================
-- 2. NOTIFICATIONS
-- ============================================
INSERT INTO notifications (id, user_id, type, title, message, read, read_at, created_at) VALUES
-- Rahul Kumar notifications
('22000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'FEE_REMINDER', 'Fee Payment Due', 'Your mess fees of Rs. 3000 is due on Jan 25, 2026.', false, NULL, '2026-01-10T09:00:00Z'),
('22000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'LEAVE_APPROVED', 'Leave Approved', 'Your leave request for Jan 20 (Night Out) has been approved.', true, '2026-01-18T12:00:00Z', '2026-01-18T10:00:00Z'),
('22000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'RENEWAL_REMINDER', 'Renewal Due Soon', 'Your hostel renewal is due on Jul 15, 2026. Please start the renewal process.', false, NULL, '2026-01-01T09:00:00Z'),

-- Amit Kumar notifications
('22000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'FEE_REMINDER', 'Mess Fee Reminder', 'Your mess fees of Rs. 3000 is due on Jan 25, 2026.', false, NULL, '2026-01-10T09:00:00Z'),
('22000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'LEAVE_APPROVED', 'Leave Approved', 'Your home visit leave for Jan 25-28 has been approved.', true, '2026-01-20T12:00:00Z', '2026-01-20T10:00:00Z'),

-- Priya Sharma notifications
('22000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'FEE_OVERDUE', 'Fee Overdue', 'Your mess fees of Rs. 3000 is overdue. Please pay immediately.', false, NULL, '2026-01-20T09:00:00Z'),

-- Superintendent notifications
('22000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'APPLICATION_UPDATE', 'New Applications', 'You have 3 new applications pending review.', false, NULL, '2026-01-11T09:00:00Z'),

-- Vijay Kumar (newly approved)
('22000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000018', 'APPLICATION_UPDATE', 'Application Approved', 'Congratulations! Your hostel application has been approved.', false, NULL, '2026-01-07T16:00:00Z');

-- ============================================
-- 3. COMMUNICATIONS
-- ============================================
INSERT INTO communications (id, type, template, recipient_id, recipient_name, recipient_mobile, recipient_email, subject, message, status, sent_at, delivered_at, created_at) VALUES
-- SMS for leave approval
('33000000-0000-0000-0000-000000000001', 'SMS', 'LEAVE_APPROVED', 'a0000000-0000-0000-0000-000000000001', 'Rahul Kumar', '9876543210', NULL, NULL, 'Your leave request for Dec 25-27 has been approved. Have a safe journey!', 'DELIVERED', '2025-12-20T10:30:00Z', '2025-12-20T10:30:15Z', '2025-12-20T10:30:00Z'),

-- Email to parent about leave
('33000000-0000-0000-0000-000000000002', 'EMAIL', 'PARENT_LEAVE_NOTIFICATION', 'a0000000-0000-0000-0000-000000000011', 'Rajesh Kumar', NULL, 'parent@example.com', 'Leave Approved - Rahul Kumar', 'Your ward Rahul Kumar''s leave request for Dec 25-27 has been approved.', 'DELIVERED', '2025-12-20T10:30:00Z', '2025-12-20T10:31:00Z', '2025-12-20T10:30:00Z'),

-- WhatsApp fee reminder
('33000000-0000-0000-0000-000000000003', 'WHATSAPP', 'FEE_REMINDER', 'a0000000-0000-0000-0000-000000000005', 'Amit Kumar Jain', '9876543214', NULL, NULL, 'Reminder: Your mess fees of Rs. 3000 is due on Jan 25, 2026. Pay now to avoid late charges.', 'DELIVERED', '2026-01-10T09:00:00Z', '2026-01-10T09:00:30Z', '2026-01-10T09:00:00Z'),

-- SMS for interview schedule
('33000000-0000-0000-0000-000000000004', 'SMS', 'INTERVIEW_SCHEDULED', NULL, 'Ananya Desai', '9988776675', NULL, NULL, 'Your hostel admission interview is scheduled for Jan 15, 2026 at 10:00 AM (Online). Link: meet.google.com/abc-defg-hij', 'DELIVERED', '2026-01-08T10:00:00Z', '2026-01-08T10:00:20Z', '2026-01-08T10:00:00Z'),

-- Email for application approval
('33000000-0000-0000-0000-000000000005', 'EMAIL', 'APPLICATION_APPROVED', 'a0000000-0000-0000-0000-000000000018', 'Vijay Kumar', NULL, 'vijay.kumar@email.com', 'Hostel Application Approved', 'Congratulations! Your application for Boys Hostel has been approved. Please complete the payment to confirm your admission.', 'DELIVERED', '2026-01-07T16:00:00Z', '2026-01-07T16:01:00Z', '2026-01-07T16:00:00Z');

-- ============================================
-- 4. EXIT REQUESTS
-- ============================================
INSERT INTO exit_requests (id, student_user_id, reason, expected_exit_date, requested_date, forwarding_address, bank_account_holder, bank_account_number, bank_ifsc_code, bank_name, status, created_at) VALUES
-- Sneha Reddy - clearance in progress
('44000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000017', 'Course completion and relocation', '2026-02-28', '2026-01-10', '12, Banjara Hills, Hyderabad - 500034', 'Sneha Reddy', '1234567890', 'HDFC0001234', 'HDFC Bank', 'CLEARANCE_PENDING', '2026-01-10T09:00:00Z'),

-- Rahul Kumar - pending approval
('44000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Transferring to another college hostel', '2026-03-31', '2026-01-12', '45, Model Town, Delhi - 110009', 'Rahul Kumar', '9876543210', 'SBIN0001234', 'State Bank of India', 'PENDING', '2026-01-12T09:00:00Z');

-- ============================================
-- 5. CLEARANCES
-- ============================================
INSERT INTO clearances (id, exit_request_id, student_user_id, status, initiated_date, expected_completion, room_cleared, library_cleared, mess_cleared, accounts_cleared, remarks, created_at) VALUES
-- Sneha Reddy clearance
('55000000-0000-0000-0000-000000000001', '44000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000017', 'IN_PROGRESS', '2026-01-10T09:00:00Z', '2026-02-25', 'PENDING', 'CLEARED', 'PENDING', 'PENDING', 'Clearance process initiated for course completion exit', '2026-01-10T09:00:00Z'),

-- Rahul Kumar clearance (not started yet)
('55000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'NOT_STARTED', '2026-01-12T09:00:00Z', '2026-03-28', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'Exit request pending approval', '2026-01-12T09:00:00Z');

-- ============================================
-- 6. INTERVIEW SLOTS (for next week)
-- ============================================
INSERT INTO interview_slots (id, slot_date, start_time, end_time, mode, max_interviews, booked_count, is_available, superintendent_id, trustee_id, location, vertical, created_at) VALUES
-- Boys Hostel slots
('66000000-0000-0000-0000-000000000001', '2026-01-25', '10:00:00', '11:00:00', 'IN_PERSON', 2, 0, true, 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Boys Hostel Office, Room 1', 'BOYS_HOSTEL', NOW()),
('66000000-0000-0000-0000-000000000002', '2026-01-25', '11:00:00', '12:00:00', 'IN_PERSON', 2, 0, true, 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Boys Hostel Office, Room 1', 'BOYS_HOSTEL', NOW()),
('66000000-0000-0000-0000-000000000003', '2026-01-25', '14:00:00', '15:00:00', 'ONLINE', 3, 0, true, 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', NULL, 'BOYS_HOSTEL', NOW()),

-- Girls Ashram slots
('66000000-0000-0000-0000-000000000004', '2026-01-26', '10:00:00', '11:00:00', 'IN_PERSON', 2, 0, true, 'a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'Girls Ashram Office', 'GIRLS_ASHRAM', NOW()),
('66000000-0000-0000-0000-000000000005', '2026-01-26', '11:00:00', '12:00:00', 'ONLINE', 3, 1, true, 'a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', NULL, 'GIRLS_ASHRAM', NOW());

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Seed data for missing tables inserted!' as status;
SELECT 'Interviews: ' || count(*) FROM interviews;
SELECT 'Notifications: ' || count(*) FROM notifications;
SELECT 'Communications: ' || count(*) FROM communications;
SELECT 'Exit Requests: ' || count(*) FROM exit_requests;
SELECT 'Clearances: ' || count(*) FROM clearances;
SELECT 'Interview Slots: ' || count(*) FROM interview_slots;
