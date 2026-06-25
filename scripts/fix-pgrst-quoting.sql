-- ════════════════════════════════════════════════════════════
-- Fix: tell PostgREST to always double-quote identifiers
-- so camelCase column names like "institutionId" are preserved.
-- Run this in your Supabase SQL Editor.
-- ════════════════════════════════════════════════════════════

ALTER ROLE authenticator SET pgrst.db_quoted_identifiers TO 'true';
NOTIFY pgrst, 'reload config';
