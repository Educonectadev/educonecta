-- Diagnóstico de RLS y permisos en PushSubscription
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'PushSubscription';

SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'PushSubscription';

-- Forzar recarga del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';