// Script para crear el bucket de storage desde Node.js
// Usa service_role key (bypasea RLS y permisos de schema)
// Ejecutar: node --env-file .env scripts/setup-storage.mjs

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan variables de entorno:")
  console.error("  NEXT_PUBLIC_SUPABASE_URL")
  console.error("  SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // 1. Crear bucket
  const { data: bucket, error: bucketError } = await supabase
    .storage
    .createBucket("institution-files", {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ],
    })

  if (bucketError && !bucketError.message.includes("already exists")) {
    throw bucketError
  }
  console.log("✅ Bucket 'institution-files' listo")

  // 2. Crear policies RLS via SQL (como service_role bypasses RLS,
  //    las policies son defensa adicional para queries desde el cliente anon)
  const { error: sqlError } = await supabase.rpc("exec_sql", {
    query: `
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

      DROP POLICY IF EXISTS "users_can_read_own_institution_files" ON storage.objects;
      CREATE POLICY "users_can_read_own_institution_files"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'institution-files' AND storage.is_same_institution(bucket_id, name));

      DROP POLICY IF EXISTS "users_can_insert_own_institution_files" ON storage.objects;
      CREATE POLICY "users_can_insert_own_institution_files"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'institution-files' AND storage.is_same_institution(bucket_id, name));

      DROP POLICY IF EXISTS "users_can_delete_own_institution_files" ON storage.objects;
      CREATE POLICY "users_can_delete_own_institution_files"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'institution-files' AND storage.is_same_institution(bucket_id, name));
    `,
    params: [],
  })

  if (sqlError) {
    console.warn("⚠️  Policies RLS no se pudieron crear (no crítico, service_role bypasses RLS):", sqlError.message)
  } else {
    console.log("✅ Policies RLS del storage creadas")
  }

  console.log("🎉 Storage configurado correctamente")
}

main().catch((err) => {
  console.error("❌ Error:", err.message)
  process.exit(1)
})
