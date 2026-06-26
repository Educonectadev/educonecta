-- Migration 008: Add assignedLevels to Teacher table (PostgreSQL/Supabase)
-- Stores the educational levels a teacher is assigned to:
--   INICIAL, PRIMARIA, SECUNDARIA
-- Stored as a text array; NULL means "not configured yet".

ALTER TABLE "Teacher"
  ADD COLUMN IF NOT EXISTS "assignedLevels" TEXT[] DEFAULT NULL;
