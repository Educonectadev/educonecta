-- Migration 007: Add detailed fields to Teacher table (PostgreSQL/Supabase)
-- These columns were in 003 but used MySQL COMMENT syntax; this is the PG version.

ALTER TABLE "Teacher"
  ADD COLUMN IF NOT EXISTS "educationLevel" VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "hireDate" DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "address" VARCHAR(255) DEFAULT NULL;

-- Note: documentId, contractType, emergencyContact, emergencyPhone already exist
-- in the base schema. professionalTitle is stored as "title".
