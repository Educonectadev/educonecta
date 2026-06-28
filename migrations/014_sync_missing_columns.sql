-- Migration 014: Sincronizar columnas faltantes
-- Esta migración repara dos desincronizaciones entre el código y la BD:
--   1. User.brandColor — usado por /api/user/brand-color.
--   2. ParentStudent.id — usado por /api/admin/parents y por la tabla
--      `create` que retorna el id recién insertado. La PK actual es
--      compuesta (parentId, studentId) pero el código asume un id único.
--
-- Para evitar romper foreign keys u otros registros, conservamos la PK
-- compuesta y añadimos id como columna de identidad independiente.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "brandColor" VARCHAR(9) DEFAULT '#000000';

ALTER TABLE "ParentStudent"
  ADD COLUMN IF NOT EXISTS "id" SERIAL;

-- Rellenar id en filas existentes para que la columna no quede NULL
-- (la generación serial ya lo hace para nuevos registros).
UPDATE "ParentStudent"
  SET "id" = nextval(pg_get_serial_sequence('"ParentStudent"', 'id'))
  WHERE "id" IS NULL;

-- Backfill User.brandColor con el valor por defecto para filas existentes
UPDATE "User"
  SET "brandColor" = '#000000'
  WHERE "brandColor" IS NULL;