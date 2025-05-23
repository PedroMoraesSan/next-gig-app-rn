-- Insert sample users
INSERT INTO "public"."users" ("id", "name", "email", "password_hash") VALUES
('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', '$2a$10$rQEL5.Nwz1LVj8tk2xMcgeRMlK.yoB7TdNxS5H1Qx.Xy3z1VUbzfC'),
('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', '$2a$10$rQEL5.Nwz1LVj8tk2xMcgeRMlK.yoB7TdNxS5H1Qx.Xy3z1VUbzfC');

-- Insert sample profiles
INSERT INTO "public"."profiles" ("user_id", "bio", "location", "avatar_url") VALUES
('00000000-0000-0000-0000-000000000001', 'Senior Software Engineer with 5+ years of experience', 'San Francisco, CA', 'https://via.placeholder.com/150'),
('00000000-0000-0000-0000-000000000002', 'UX Designer passionate about creating intuitive interfaces', 'New York, NY', 'https://via.placeholder.com/150');

-- Insert sample jobs
INSERT INTO "public"."jobs" ("id", "title", "company", "company_logo", "location", "job_type", "tags", "salary", "description", "posted_date", "requirements", "benefits", "featured") VALUES
('00000000-0000-0000-0000-000000000001', 'Senior React Native Developer', 'Tech Innovations', 'https://via.placeholder.com/100', 'Remote', 'Full-time', '["React Native", "TypeScript", "Mobile"]', '$120k - $150k', 'We are looking for an experienced React Native developer to join our team and help build our next-generation mobile applications. The ideal candidate will have strong TypeScript skills and experience with state management solutions.', '2025-05-15', '["At least 3 years of experience with React Native", "Strong TypeScript skills", "Experience with GraphQL and Apollo Client", "Knowledge of mobile app architecture", "Experience with CI/CD pipelines for mobile apps"]', '["Competitive salary", "Health insurance", "Remote work", "Flexible hours", "Professional development budget"]', true),
('00000000-0000-0000-0000-000000000002', 'UX/UI Designer', 'Creative Solutions', 'https://via.placeholder.com/100', 'New York, NY', 'Contract', '["Figma", "UI Design", "User Research"]', '$90k - $110k', 'Creative Solutions is seeking a talented UX/UI Designer to create amazing user experiences. You will work with product managers and developers to design intuitive interfaces for web and mobile applications.', '2025-05-18', '["Portfolio demonstrating UI/UX projects", "Proficiency in Figma or similar design tools", "Understanding of user-centered design principles", "Experience conducting user research", "Knowledge of design systems"]', '["Competitive pay", "Flexible schedule", "Remote work options", "Creative environment", "Professional growth opportunities"]', false),
('00000000-0000-0000-0000-000000000003', 'Full Stack Developer', 'Global Tech', 'https://via.placeholder.com/100', 'San Francisco, CA', 'Full-time', '["React", "Node.js", "PostgreSQL"]', '$130k - $160k', 'Join our team as a Full Stack Developer and work on challenging projects using modern technologies. You will be responsible for developing and maintaining web applications from front-end to back-end.', '2025-05-10', '["Strong experience with React and Node.js", "Database design and management skills", "Knowledge of RESTful APIs and GraphQL", "Experience with cloud services (AWS, Azure, or GCP)", "Understanding of CI/CD principles"]', '["Competitive salary", "Health, dental, and vision insurance", "401(k) matching", "Unlimited PTO", "Remote work options"]', true),
('00000000-0000-0000-0000-000000000004', 'DevOps Engineer', 'Cloud Systems', 'https://via.placeholder.com/100', 'Remote', 'Full-time', '["AWS", "Kubernetes", "CI/CD"]', '$140k - $170k', 'We are looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You will work with development teams to implement CI/CD pipelines and ensure system reliability.', '2025-05-20', '["Experience with AWS or other cloud providers", "Knowledge of container orchestration (Kubernetes)", "Experience with CI/CD tools (Jenkins, GitHub Actions)", "Infrastructure as Code experience (Terraform, CloudFormation)", "Strong scripting skills (Bash, Python)"]', '["Competitive salary", "Health benefits", "Remote work", "Learning budget", "Home office stipend"]', false),
('00000000-0000-0000-0000-000000000005', 'Product Manager', 'Innovate Inc', 'https://via.placeholder.com/100', 'Austin, TX', 'Full-time', '["Product Strategy", "Agile", "User Research"]', '$110k - $140k', 'Innovate Inc is seeking a Product Manager to lead our product development efforts. You will work closely with design, engineering, and marketing teams to define product vision and roadmap.', '2025-05-12', '["Experience managing digital products", "Strong analytical and problem-solving skills", "Knowledge of agile methodologies", "Excellent communication and stakeholder management", "Data-driven decision making skills"]', '["Competitive compensation", "Health insurance", "Stock options", "Flexible work arrangements", "Professional development opportunities"]', true);

-- Insert sample saved jobs
INSERT INTO "public"."saved_jobs" ("user_id", "job_id") VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001');

-- Insert sample applications
INSERT INTO "public"."applications" ("user_id", "job_id", "resume_url", "cover_letter", "status") VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'https://example.com/resumes/john-doe.pdf', 'I am excited to apply for this position...', 'submitted'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'https://example.com/resumes/john-doe.pdf', NULL, 'interview'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'https://example.com/resumes/jane-smith.pdf', 'I believe my design experience makes me a perfect fit...', 'submitted');

-- Insert sample job alerts
INSERT INTO "public"."job_alerts" ("user_id", "keywords", "location", "job_type", "frequency") VALUES
('00000000-0000-0000-0000-000000000001', '{"React Native", "Mobile Developer"}', 'Remote', 'Full-time', 'daily'),
('00000000-0000-0000-0000-000000000002', '{"UX Designer", "UI Designer", "Product Designer"}', 'New York', NULL, 'weekly');
