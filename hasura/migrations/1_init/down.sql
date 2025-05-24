-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
DROP TRIGGER IF EXISTS update_job_alerts_updated_at ON job_alerts;
DROP TRIGGER IF EXISTS update_device_tokens_updated_at ON device_tokens;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS device_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS job_alerts;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS pgcrypto;
