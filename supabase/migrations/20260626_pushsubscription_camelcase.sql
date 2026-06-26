-- ============================================================
-- Migración: renombrar columnas de PushSubscription a camelCase
-- para que coincidan con el código (route.ts) y el schema original.
--
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- ============================================================

-- Renombrar columnas (idempotente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'userid') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN userid TO "userId";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'p256dh') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN p256dh TO "p256dh";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'auth') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN auth TO "auth";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'useragent') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN useragent TO "userAgent";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'createdat') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN createdat TO "createdAt";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'updatedat') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN updatedat TO "updatedAt";
  END IF;
END $$;

-- Asegurar FK correcta a User(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'PushSubscription'
      AND constraint_name = 'PushSubscription_userId_fkey'
  ) THEN
    ALTER TABLE "PushSubscription"
      ADD CONSTRAINT "PushSubscription_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Reconstruir índice sobre la columna renombrada
DROP INDEX IF EXISTS idx_push_sub_user;
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON "PushSubscription"("userId");

-- Trigger updatedAt (mantener)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_PushSubscription_updatedAt ON "PushSubscription";
CREATE TRIGGER update_PushSubscription_updatedAt
BEFORE UPDATE ON "PushSubscription"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificación final
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'PushSubscription'
ORDER BY ordinal_position;