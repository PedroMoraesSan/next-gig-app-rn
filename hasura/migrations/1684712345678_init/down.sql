-- Drop triggers
DROP TRIGGER IF EXISTS "set_users_updated_at" ON "public"."users";
DROP TRIGGER IF EXISTS "set_profiles_updated_at" ON "public"."profiles";
DROP TRIGGER IF EXISTS "set_jobs_updated_at" ON "public"."jobs";
DROP TRIGGER IF EXISTS "set_applications_updated_at" ON "public"."applications";
DROP TRIGGER IF EXISTS "set_job_alerts_updated_at" ON "public"."job_alerts";

-- Drop function
DROP FUNCTION IF EXISTS "public"."set_updated_at"();

-- Drop tables
DROP TABLE IF EXISTS "public"."job_alerts";
DROP TABLE IF EXISTS "public"."applications";
DROP TABLE IF EXISTS "public"."saved_jobs";
DROP TABLE IF EXISTS "public"."jobs";
DROP TABLE IF EXISTS "public"."profiles";
DROP TABLE IF EXISTS "public"."users";
