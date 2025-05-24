-- Insert sample users
INSERT INTO users (id, name, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'Bob Johnson', 'bob@example.com');

-- Insert sample profiles
INSERT INTO profiles (user_id, bio, location, avatar_url) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Senior Frontend Developer with 5 years of experience', 'San Francisco, CA', 'https://randomuser.me/api/portraits/men/1.jpg'),
  ('00000000-0000-0000-0000-000000000002', 'UX Designer passionate about user-centered design', 'New York, NY', 'https://randomuser.me/api/portraits/women/2.jpg'),
  ('00000000-0000-0000-0000-000000000003', 'Full Stack Developer with React and Node.js expertise', 'Remote', 'https://randomuser.me/api/portraits/men/3.jpg');

-- Insert sample jobs
INSERT INTO jobs (id, title, company, company_logo, location, job_type, tags, salary, description, requirements, benefits, featured, posted_date) VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'Senior Frontend Developer',
    'TechCorp',
    'https://logo.clearbit.com/techcorp.com',
    'San Francisco, CA (Remote)',
    'Full-time',
    ARRAY['React', 'TypeScript', 'Redux', 'CSS'],
    '$120,000 - $150,000',
    'We are looking for a Senior Frontend Developer to join our team. You will be responsible for building and maintaining our web applications.',
    ARRAY['5+ years of experience with React.js', 'Strong proficiency in JavaScript and TypeScript', 'Experience with state management libraries like Redux', 'Understanding of responsive design principles'],
    ARRAY['Competitive salary', 'Health, dental, and vision insurance', '401(k) matching', 'Unlimited PTO', 'Remote work options'],
    TRUE,
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'UX/UI Designer',
    'DesignHub',
    'https://logo.clearbit.com/designhub.io',
    'New York, NY',
    'Full-time',
    ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    '$90,000 - $120,000',
    'We are seeking a talented UX/UI Designer to create amazing user experiences for our products.',
    ARRAY['3+ years of experience in UX/UI design', 'Proficiency with design tools like Figma and Adobe XD', 'Portfolio demonstrating user-centered design process', 'Experience conducting user research and usability testing'],
    ARRAY['Competitive salary', 'Health benefits', 'Flexible work hours', 'Professional development budget'],
    FALSE,
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'Full Stack Developer',
    'WebSolutions',
    'https://logo.clearbit.com/websolutions.dev',
    'Remote',
    'Contract',
    ARRAY['Node.js', 'React', 'MongoDB', 'Express'],
    '$70 - $90 per hour',
    'We are looking for a Full Stack Developer to help build our next generation of web applications.',
    ARRAY['Experience with MERN stack (MongoDB, Express, React, Node.js)', 'Understanding of RESTful APIs', 'Knowledge of Git version control', 'Ability to work independently'],
    ARRAY['Flexible hours', 'Remote work', 'Long-term contract potential'],
    FALSE,
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'DevOps Engineer',
    'CloudTech',
    'https://logo.clearbit.com/cloudtech.io',
    'Seattle, WA (Hybrid)',
    'Full-time',
    ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    '$130,000 - $160,000',
    'Join our team as a DevOps Engineer to help build and maintain our cloud infrastructure.',
    ARRAY['3+ years of experience with AWS', 'Experience with containerization using Docker', 'Knowledge of Kubernetes', 'Experience with CI/CD pipelines'],
    ARRAY['Competitive salary', 'Stock options', 'Health benefits', '401(k) with company match', 'Hybrid work model'],
    TRUE,
    NOW() - INTERVAL '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'Mobile Developer (React Native)',
    'AppWorks',
    'https://logo.clearbit.com/appworks.dev',
    'Remote',
    'Full-time',
    ARRAY['React Native', 'JavaScript', 'TypeScript', 'Mobile Development'],
    '$100,000 - $130,000',
    'We are looking for a React Native developer to join our team and help build cross-platform mobile applications.',
    ARRAY['2+ years of experience with React Native', 'Strong JavaScript/TypeScript skills', 'Experience with mobile app deployment', 'Understanding of mobile UI/UX principles'],
    ARRAY['Remote work', 'Flexible hours', 'Health insurance', 'Equipment allowance', 'Professional development budget'],
    FALSE,
    NOW() - INTERVAL '4 days'
  );

-- Insert sample saved jobs
INSERT INTO saved_jobs (user_id, job_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000105');

-- Insert sample applications
INSERT INTO applications (user_id, job_id, status, resume_url, cover_letter) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000103',
    'submitted',
    'https://storage.example.com/resumes/john-doe-resume.pdf',
    'I am excited to apply for the Full Stack Developer position at WebSolutions. With my experience in the MERN stack and passion for building web applications, I believe I would be a great fit for your team.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000105',
    'in_review',
    'https://storage.example.com/resumes/jane-smith-resume.pdf',
    'As a UX Designer with mobile experience, I am interested in transitioning to React Native development. My design background gives me a unique perspective on creating user-friendly mobile applications.'
  );

-- Insert sample job alerts
INSERT INTO job_alerts (user_id, keywords, location, job_type, frequency) VALUES
  ('00000000-0000-0000-0000-000000000001', ARRAY['React', 'Frontend', 'JavaScript'], 'Remote', 'Full-time', 'daily'),
  ('00000000-0000-0000-0000-000000000002', ARRAY['UX', 'Design', 'Figma'], 'New York', NULL, 'weekly'),
  ('00000000-0000-0000-0000-000000000003', ARRAY['Full Stack', 'Node.js'], NULL, 'Contract', 'instant');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, body, data, read) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'job_alert',
    'New Job Match',
    'We found a new job matching your "React, Frontend, JavaScript" alert',
    '{"jobId": "00000000-0000-0000-0000-000000000105"}',
    FALSE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'application_update',
    'Application Status Update',
    'Your application for Full Stack Developer at WebSolutions has been received',
    '{"applicationId": "00000000-0000-0000-0000-000000000001", "status": "submitted"}',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'application_update',
    'Application Status Update',
    'Your application for Mobile Developer at AppWorks is now being reviewed',
    '{"applicationId": "00000000-0000-0000-0000-000000000002", "status": "in_review"}',
    FALSE
  );

-- Insert sample device tokens
INSERT INTO device_tokens (user_id, token, platform) VALUES
  ('00000000-0000-0000-0000-000000000001', 'exampleFCMtoken123456789', 'android'),
  ('00000000-0000-0000-0000-000000000002', 'exampleAPNtoken987654321', 'ios');
