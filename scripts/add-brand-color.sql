-- ═══════════════════════════════════════════════════════
-- Add brandColor column to User table
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "brandColor" VARCHAR(50) DEFAULT '#000000';
