-- ============================================================================
-- Seed Test Users (Password: Password123 for all)
-- Hash: $2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi
-- ============================================================================

INSERT INTO users (email, mobile, password_hash, full_name, role, vertical) VALUES
  -- Superintendents (one per vertical)
  ('supt.boys@hostelpro.in', '+919999900002', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Rajesh Kumar', 'SUPERINTENDENT', 'BOYS_HOSTEL'),
  ('supt.girls@hostelpro.in', '+919999900003', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Sunita Devi', 'SUPERINTENDENT', 'GIRLS_ASHRAM'),
  ('supt.dharamshala@hostelpro.in', '+919999900004', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Mahesh Jain', 'SUPERINTENDENT', 'DHARAMSHALA'),

  -- Trustees
  ('trustee1@hostelpro.in', '+919999900005', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Shantilal Shah', 'TRUSTEE', NULL),
  ('trustee2@hostelpro.in', '+919999900006', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Chandrakant Mehta', 'TRUSTEE', NULL),

  -- Accounts
  ('accounts@hostelpro.in', '+919999900007', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Priya Sharma', 'ACCOUNTS', NULL),

  -- Students
  ('amit.jain@student.in', '+919999900010', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Amit Kumar Jain', 'STUDENT', 'BOYS_HOSTEL'),
  ('sneha.shah@student.in', '+919999900011', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Sneha Shah', 'STUDENT', 'GIRLS_ASHRAM'),

  -- Parents
  ('parent.jain@parent.in', '+919999900020', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Suresh Jain', 'PARENT', NULL),
  ('parent.shah@parent.in', '+919999900021', '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'Ramesh Shah', 'PARENT', NULL);
