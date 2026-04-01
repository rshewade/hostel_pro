-- ============================================================================
-- Seed Rooms and Sample Fees
-- ============================================================================

-- Boys Hostel Rooms (Floor 1-3, 5 rooms each)
INSERT INTO rooms (room_number, vertical, floor, capacity, room_type, status) VALUES
  ('B-101', 'BOYS_HOSTEL', 1, 3, 'TRIPLE', 'AVAILABLE'),
  ('B-102', 'BOYS_HOSTEL', 1, 3, 'TRIPLE', 'AVAILABLE'),
  ('B-103', 'BOYS_HOSTEL', 1, 2, 'DOUBLE', 'AVAILABLE'),
  ('B-104', 'BOYS_HOSTEL', 1, 2, 'DOUBLE', 'AVAILABLE'),
  ('B-105', 'BOYS_HOSTEL', 1, 1, 'SINGLE', 'AVAILABLE'),
  ('B-201', 'BOYS_HOSTEL', 2, 3, 'TRIPLE', 'AVAILABLE'),
  ('B-202', 'BOYS_HOSTEL', 2, 3, 'TRIPLE', 'AVAILABLE'),
  ('B-203', 'BOYS_HOSTEL', 2, 2, 'DOUBLE', 'AVAILABLE'),
  ('B-204', 'BOYS_HOSTEL', 2, 2, 'DOUBLE', 'AVAILABLE'),
  ('B-205', 'BOYS_HOSTEL', 2, 1, 'SINGLE', 'AVAILABLE'),
  ('B-301', 'BOYS_HOSTEL', 3, 3, 'TRIPLE', 'AVAILABLE'),
  ('B-302', 'BOYS_HOSTEL', 3, 3, 'TRIPLE', 'AVAILABLE'),
  ('B-303', 'BOYS_HOSTEL', 3, 2, 'DOUBLE', 'AVAILABLE'),
  ('B-304', 'BOYS_HOSTEL', 3, 2, 'DOUBLE', 'MAINTENANCE'),
  ('B-305', 'BOYS_HOSTEL', 3, 1, 'SINGLE', 'AVAILABLE');

-- Girls Ashram Rooms
INSERT INTO rooms (room_number, vertical, floor, capacity, room_type, status) VALUES
  ('G-101', 'GIRLS_ASHRAM', 1, 2, 'DOUBLE', 'AVAILABLE'),
  ('G-102', 'GIRLS_ASHRAM', 1, 2, 'DOUBLE', 'AVAILABLE'),
  ('G-103', 'GIRLS_ASHRAM', 1, 3, 'TRIPLE', 'AVAILABLE'),
  ('G-104', 'GIRLS_ASHRAM', 1, 3, 'TRIPLE', 'AVAILABLE'),
  ('G-201', 'GIRLS_ASHRAM', 2, 2, 'DOUBLE', 'AVAILABLE'),
  ('G-202', 'GIRLS_ASHRAM', 2, 2, 'DOUBLE', 'AVAILABLE'),
  ('G-203', 'GIRLS_ASHRAM', 2, 3, 'TRIPLE', 'AVAILABLE'),
  ('G-204', 'GIRLS_ASHRAM', 2, 3, 'TRIPLE', 'AVAILABLE');

-- Dharamshala Rooms
INSERT INTO rooms (room_number, vertical, floor, capacity, room_type, status) VALUES
  ('D-101', 'DHARAMSHALA', 1, 4, 'QUAD', 'AVAILABLE'),
  ('D-102', 'DHARAMSHALA', 1, 4, 'QUAD', 'AVAILABLE'),
  ('D-103', 'DHARAMSHALA', 1, 2, 'DOUBLE', 'AVAILABLE'),
  ('D-201', 'DHARAMSHALA', 2, 4, 'QUAD', 'AVAILABLE'),
  ('D-202', 'DHARAMSHALA', 2, 4, 'QUAD', 'AVAILABLE'),
  ('D-203', 'DHARAMSHALA', 2, 2, 'DOUBLE', 'AVAILABLE');

-- Sample fees for test students
-- Amit Kumar Jain (Boys Hostel)
INSERT INTO fees (student_id, fee_head, description, academic_session, amount, status, due_date)
SELECT u.id, 'HOSTEL_FEES', 'Hostel Fees - Semester 1', '2025-2026', 30000.00, 'PENDING', '2026-04-15'
FROM users u WHERE u.email = 'amit.jain@student.in';

INSERT INTO fees (student_id, fee_head, description, academic_session, amount, status, due_date)
SELECT u.id, 'SECURITY_DEPOSIT', 'Security Deposit (Refundable)', '2025-2026', 5000.00, 'PENDING', '2026-04-15'
FROM users u WHERE u.email = 'amit.jain@student.in';

INSERT INTO fees (student_id, fee_head, description, academic_session, amount, paid_amount, status, due_date, paid_at)
SELECT u.id, 'PROCESSING_FEE', 'Application Processing Fee', '2025-2026', 500.00, 500.00, 'PAID', '2026-03-01', NOW()
FROM users u WHERE u.email = 'amit.jain@student.in';

INSERT INTO fees (student_id, fee_head, description, academic_session, amount, status, due_date)
SELECT u.id, 'MESS_ADVANCE', 'Mess Advance - Semester 1', '2025-2026', 10000.00, 'PENDING', '2026-04-15'
FROM users u WHERE u.email = 'amit.jain@student.in';

-- Sneha Shah (Girls Ashram)
INSERT INTO fees (student_id, fee_head, description, academic_session, amount, status, due_date)
SELECT u.id, 'HOSTEL_FEES', 'Hostel Fees - Semester 1', '2025-2026', 25000.00, 'PENDING', '2026-04-15'
FROM users u WHERE u.email = 'sneha.shah@student.in';

INSERT INTO fees (student_id, fee_head, description, academic_session, amount, paid_amount, status, due_date, paid_at)
SELECT u.id, 'PROCESSING_FEE', 'Application Processing Fee', '2025-2026', 500.00, 500.00, 'PAID', '2026-03-01', NOW()
FROM users u WHERE u.email = 'sneha.shah@student.in';
