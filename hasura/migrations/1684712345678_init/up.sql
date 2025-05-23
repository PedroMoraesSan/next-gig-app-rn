-- Create users table
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "email" text NOT NULL,
    "password_hash" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    UNIQUE ("email")
);

-- Create profiles table
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "bio" text,
    "location" text,
    "avatar_url" text,
    "resume_url" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("user_id")
);

-- Create jobs table
CREATE TABLE "public"."jobs" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "company" text NOT NULL,
    "company_logo" text,
    "location" text NOT NULL,
    "job_type" text NOT NULL,
    "tags" jsonb NOT NULL DEFAULT '[]',
    "salary" text,
    "description" text NOT NULL,
    "posted_date" date NOT NULL DEFAULT now(),
    "requirements" jsonb NOT NULL DEFAULT '[]',
    "benefits" jsonb NOT NULL DEFAULT '[]',
    "featured" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Create saved_jobs table
CREATE TABLE "public"."saved_jobs" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "job_id" uuid NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("user_id", "job_id")
);

-- Create applications table
CREATE TABLE "public"."applications" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "job_id" uuid NOT NULL,
    "resume_url" text NOT NULL,
    "cover_letter" text,
    "status" text NOT NULL DEFAULT 'submitted',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create job_alerts table
CREATE TABLE "public"."job_alerts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "keywords" text[] NOT NULL DEFAULT '{}',
    "location" text,
    "job_type" text,
    "frequency" text NOT NULL DEFAULT 'daily',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_users_updated_at"
BEFORE UPDATE ON "public"."users"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_profiles_updated_at"
BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_jobs_updated_at"
BEFORE UPDATE ON "public"."jobs"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_applications_updated_at"
BEFORE UPDATE ON "public"."applications"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_job_alerts_updated_at"
BEFORE UPDATE ON "public"."job_alerts"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();
