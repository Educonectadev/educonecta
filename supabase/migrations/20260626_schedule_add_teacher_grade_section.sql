-- ============================================================
-- Agregar columnas teacherId, gradeId, sectionId a Schedule
-- para soportar notificaciones push por profesor específico.
-- ============================================================

-- 1) Agregar columnas (idempotente)
ALTER TABLE "Schedule"
  ADD COLUMN IF NOT EXISTS "teacherId" INT REFERENCES "Teacher"(id) ON DELETE SET NULL;

ALTER TABLE "Schedule"
  ADD COLUMN IF NOT EXISTS "gradeId" INT REFERENCES "Grade"(id) ON DELETE SET NULL;

ALTER TABLE "Schedule"
  ADD COLUMN IF NOT EXISTS "sectionId" INT REFERENCES "Section"(id) ON DELETE SET NULL;

-- 2) Índices para mejorar las consultas de notificación
CREATE INDEX IF NOT EXISTS idx_schedule_teacher ON "Schedule"("teacherId");
CREATE INDEX IF NOT EXISTS idx_schedule_grade ON "Schedule"("gradeId");
CREATE INDEX IF NOT EXISTS idx_schedule_section ON "Schedule"("sectionId");

-- 3) Forzar recarga del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';

-- 4) Verificación final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Schedule'
ORDER BY ordinal_position;