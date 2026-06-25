-- ═══════════════════════════════════════════════════════
-- Fix exec_sql: bind parameters and wrap SELECT in jsonb_agg
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION exec_sql(query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  is_select BOOLEAN;
  param_val TEXT;
  final_query TEXT;
BEGIN
  query := trim(query);
  is_select := (upper(left(query, 6)) = 'SELECT' OR upper(left(query, 4)) = 'WITH');

  -- Replace ? with safely quoted parameter values
  final_query := query;
  FOR param_val IN SELECT jsonb_array_elements_text(params) LOOP
    final_query := regexp_replace(final_query, '\?', quote_literal(param_val), '');
  END LOOP;

  IF is_select THEN
    -- Wrap in jsonb_agg so we always return a JSON array
    final_query := 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || final_query || ') t';
    EXECUTE final_query INTO result;
    RETURN result;
  ELSE
    EXECUTE final_query;
    RETURN '{"affectedRows": 1}'::jsonb;
  END IF;
END;
$$;

-- ═══════════════════════════════════════════════════════
-- Add missing columns to Teacher table
-- ═══════════════════════════════════════════════════════

ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "educationLevel" VARCHAR(255);
ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "hireDate" VARCHAR(255);
ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "address" TEXT;
