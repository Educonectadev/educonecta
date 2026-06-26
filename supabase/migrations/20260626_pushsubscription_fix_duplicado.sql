-- ============================================================
-- Resolución: eliminar columna duplicada "userid" (minúscula)
-- La nueva columna correcta es "userId" (camelCase).
--
-- ANTES de ejecutar, verifica que userId tenga los datos correctos:
-- ============================================================

-- 1) Ver cuántas filas hay en cada columna
SELECT
  (SELECT COUNT(*) FROM "PushSubscription" WHERE "userid" IS NOT NULL) AS filas_userid_min,
  (SELECT COUNT(*) FROM "PushSubscription" WHERE "userId" IS NOT NULL) AS filas_userId_camel;

-- 2) Si userId está vacía pero userid tiene datos, copiar:
UPDATE "PushSubscription"
SET "userId" = "userid"
WHERE "userId" IS NULL OR "userId" = 0;

-- 3) Verificar que ya no quedan filas solo con userid
SELECT COUNT(*) AS huerfanas
FROM "PushSubscription"
WHERE "userid" IS NOT NULL AND ("userId" IS NULL OR "userId" = 0);

-- 4) Eliminar la columna duplicada (vieja, minúscula)
ALTER TABLE "PushSubscription" DROP COLUMN IF EXISTS userid;

-- 5) Renombrar las restantes a camelCase (idempotente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'useragent')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'PushSubscription' AND column_name = 'userAgent') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN useragent TO "userAgent";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'createdat')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'PushSubscription' AND column_name = 'createdAt') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN createdat TO "createdAt";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PushSubscription' AND column_name = 'updatedat')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'PushSubscription' AND column_name = 'updatedAt') THEN
    ALTER TABLE "PushSubscription" RENAME COLUMN updatedat TO "updatedAt";
  END IF;
END $$;

-- 6) Reconstruir índice sobre userId
DROP INDEX IF EXISTS idx_push_sub_user;
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON "PushSubscription"("userId");

-- 7) Verificación final
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'PushSubscription'
ORDER BY ordinal_position;