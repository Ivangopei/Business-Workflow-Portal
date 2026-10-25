-- Dummy data
-- Dates are written relative to CURRENT_DATE, so "due today" is always today.

INSERT INTO clients (name, type, industry, location, status) VALUES
  ('ABC Manufacturing',  'business',   'Manufacturing',     'Wilmington, DE',  'active'),      -- 1
  ('XYZ Logistics',      'business',   'Logistics',         'Dover, DE',       'waiting'),     -- 2
  ('Global Foods',       'business',   'Food processing',   'Newark, DE',      'active'),      -- 3
  ('Midwest Industries', 'business',   'Industrial supply', 'Middletown, DE',  'active'),      -- 4
  ('Acme Construction',  'business',   'Construction',      'Georgetown, DE',  'onboarding'),  -- 5
  ('Green Valley Farms', 'business',   'Agriculture',       'Smyrna, DE',      'active'),      -- 6
  ('Maria Lopez',        'individual', NULL,                'Dover, DE',       'waiting'),     -- 7
  ('Andrei Popescu',     'individual', NULL,                'Newark, DE',      'onboarding');  -- 8

INSERT INTO contacts (client_id, name, role, email, phone, is_primary, last_contacted_on) VALUES
  (1, 'John Smith',     'HR Manager',         'john@abcmanufacturing.com',   '(555) 123-4567', true, CURRENT_DATE - 2),   -- 1
  (2, 'Sarah Miller',   'Recruiter',          'sarah@xyzlogistics.com',      '(555) 234-5678', true, CURRENT_DATE - 9),   -- 2
  (3, 'Mike Johnson',   'Owner',              'mike@globalfoods.com',        '(555) 345-6789', true, CURRENT_DATE - 1),   -- 3
  (4, 'Emily Davis',    'Operations Manager', 'emily@midwestindustries.com', '(555) 456-7890', true, CURRENT_DATE - 8),   -- 4
  (5, 'David Lee',      'Owner',              'david@acmeconstruction.com',  '(555) 567-8901', true, CURRENT_DATE - 4),   -- 5
  (6, 'Tom Baker',      'Owner',              'tom@greenvalleyfarms.com',    '(555) 678-9012', true, CURRENT_DATE - 2),   -- 6
  (7, 'Maria Lopez',    NULL,                 'maria.lopez@email.com',       NULL,             true, CURRENT_DATE - 1),   -- 7
  (8, 'Andrei Popescu', NULL,                 NULL,                          '(302) 555-0148', true, CURRENT_DATE - 4),   -- 8
  (1, 'Linda Park',     'Plant Manager',      'linda@abcmanufacturing.com',  '(555) 123-9876', false, NULL);              -- 9

INSERT INTO projects (client_id, name, program, status) VALUES
  (1, 'ABC Manufacturing Hiring',    'h2b', 'active'),     -- 1
  (2, 'XYZ Logistics Recruitment',   'h2b', 'active'),     -- 2
  (3, 'Global Foods Expansion',      'h2a', 'active'),     -- 3
  (4, 'Midwest Industries Staffing', 'eb3', 'active'),     -- 4
  (1, 'ABC Welder Sponsorship',      'eb3', 'on-hold'),    -- 5
  (6, 'Green Valley Seasonal 2027',  'h2a', 'active'),     -- 6
  (7, 'Maria Lopez EB-3',            'eb3', 'active');     -- 7

INSERT INTO tasks (client_id, project_id, title, status, priority, due_date, waiting_on_contact_id) VALUES
  (1, 1,    'Call John Smith about open positions',    'in-progress', 'high',   CURRENT_DATE,      NULL),
  (1, 1,    'Review candidate documents',              'todo',        'high',   CURRENT_DATE,      NULL),
  (1, 1,    'Send candidate list to John Smith',       'todo',        'medium', CURRENT_DATE + 1,  NULL),
  (1, 1,    'Follow up on background checks',          'todo',        'low',    CURRENT_DATE + 5,  NULL),
  (1, 1,    'Sign service agreement',                  'done',        'high',   CURRENT_DATE - 40, NULL),
  (1, 1,    'Collect job descriptions',                'done',        'medium', CURRENT_DATE - 37, NULL),
  (2, 2,    'Get signed job descriptions',             'waiting',     'high',   CURRENT_DATE - 4,  2),
  (2, 2,    'Schedule interviews for warehouse roles', 'todo',        'medium', CURRENT_DATE + 6,  NULL),
  (2, 2,    'Kickoff meeting with Sarah Miller',       'done',        'medium', CURRENT_DATE - 42, NULL),
  (3, 3,    'Confirm start dates for new hires',       'waiting',     'medium', CURRENT_DATE,      3),
  (3, 3,    'Prepare onboarding packet',               'in-progress', 'low',    CURRENT_DATE + 7,  NULL),
  (3, 3,    'Update hiring timeline',                  'todo',        'low',    CURRENT_DATE + 9,  NULL),
  (3, 3,    'Gather company documents',                'done',        'high',   CURRENT_DATE - 44, NULL),
  (3, 3,    'Confirm number of open roles',            'done',        'medium', CURRENT_DATE - 38, NULL),
  (4, 4,    'Collect shift requirements',              'waiting',     'medium', CURRENT_DATE - 3,  4),
  (4, 4,    'Post openings for machine operators',     'todo',        'high',   CURRENT_DATE,      NULL),
  (4, 4,    'Intro call with Emily Davis',             'done',        'low',    CURRENT_DATE - 36, NULL),
  (5, NULL, 'Kickoff call with Acme Construction',     'todo',        'medium', CURRENT_DATE + 3,  NULL),
  (5, NULL, 'Send welcome email to David Lee',         'done',        'low',    CURRENT_DATE - 6,  NULL),
  (6, 6,    'Confirm number of seasonal workers',      'todo',        'high',   CURRENT_DATE + 2,  NULL),
  (7, 7,    'Get copy of work experience letters',     'waiting',     'medium', CURRENT_DATE + 4,  7);

INSERT INTO follow_ups (contact_id, subject, method, due_at, completed_at) VALUES
  (2, 'Check on signed job descriptions',      'email',   CURRENT_DATE - 4 + TIME '10:00', NULL),
  (4, 'Get shift requirements for new roles',  'call',    CURRENT_DATE - 3 + TIME '14:00', NULL),
  (3, 'Confirm start dates for new hires',     'call',    CURRENT_DATE     + TIME '11:00', NULL),
  (1, 'Weekly hiring check-in',                'meeting', CURRENT_DATE     + TIME '15:30', NULL),
  (5, 'Kickoff call to discuss hiring needs',  'call',    CURRENT_DATE + 3 + TIME '09:00', NULL),
  (2, 'Share interview schedule',              'email',   CURRENT_DATE + 4 + TIME '09:00', NULL),
  (1, 'Send background check results',         'email',   CURRENT_DATE + 12 + TIME '09:00', NULL),
  (6, 'Intro call about the 2027 season',      'call',    CURRENT_DATE - 10 + TIME '13:00', CURRENT_DATE - 10 + TIME '13:20');

INSERT INTO documents (client_id, name, category, status, file_name, file_size_bytes, requested_on, uploaded_on, expires_on) VALUES
  (1, 'Service agreement',          'Contract',  'received', 'service-agreement-abc.pdf', 245760, CURRENT_DATE - 45, CURRENT_DATE - 41, NULL),
  (1, 'Insurance certificate',      'Insurance', 'received', 'insurance-certificate.pdf', 317440, CURRENT_DATE - 40, CURRENT_DATE - 33, CURRENT_DATE + 200),
  (1, 'Candidate list',             'Report',    'received', 'candidate-list-sep.xlsx',    87040, CURRENT_DATE - 30, CURRENT_DATE - 27, NULL),
  (2, 'Signed job descriptions',    'Form',      'waiting',  NULL, NULL, CURRENT_DATE - 35, NULL, NULL),
  (3, 'Business license',           'License',   'received', 'business-license.pdf',      184320, CURRENT_DATE - 60, CURRENT_DATE - 55, CURRENT_DATE + 12),
  (3, 'Service agreement',          'Contract',  'received', 'service-agreement-gf.pdf',  262144, CURRENT_DATE - 58, CURRENT_DATE - 54, NULL),
  (4, 'Shift requirements',         'Form',      'waiting',  NULL, NULL, CURRENT_DATE - 34, NULL, NULL),
  (4, 'Workers'' comp certificate', 'Insurance', 'received', 'workers-comp.pdf',          209920, CURRENT_DATE - 90, CURRENT_DATE - 85, CURRENT_DATE + 7),
  (5, 'Service agreement',          'Contract',  'missing',  NULL, NULL, CURRENT_DATE - 25, NULL, NULL),
  (5, 'W-9 tax form',               'Tax',       'missing',  NULL, NULL, CURRENT_DATE - 25, NULL, NULL),
  (7, 'Work experience letters',    'Form',      'waiting',  NULL, NULL, CURRENT_DATE - 5,  NULL, NULL);