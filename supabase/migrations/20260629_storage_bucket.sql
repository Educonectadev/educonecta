-- =============================================================
-- EduConecta: Storage bucket setup
-- Run AFTER the indexes migration, in Supabase SQL Editor
-- =============================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres;

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-files',
  'institution-files',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS function
CREATE OR REPLACE FUNCTION storage.is_same_institution(bucket_id text, file_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_inst_id int;
  file_inst_id int;
BEGIN
  file_inst_id := split_part(file_path, '/', 1)::int;
  SELECT "institutionId" INTO user_inst_id
  FROM "User"
  WHERE id = auth.uid();
  RETURN COALESCE(user_inst_id = file_inst_id OR EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  ), false);
END;
$$;

-- Storage RLS policies
CREATE POLICY "users_can_read_own_institution_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'institution-files'
  AND storage.is_same_institution(bucket_id, name)
);

CREATE POLICY "users_can_insert_own_institution_files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'institution-files'
  AND storage.is_same_institution(bucket_id, name)
);

CREATE POLICY "users_can_delete_own_institution_files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'institution-files'
  AND storage.is_same_institution(bucket_id, name)
);
