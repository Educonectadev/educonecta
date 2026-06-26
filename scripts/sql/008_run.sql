-- scripts/sql/008_run.sql
-- Ejecuta este script en el SQL editor de Supabase para aplicar la migración 008.

ALTER TABLE "Teacher"
  ADD COLUMN IF NOT EXISTS "assignedLevels" TEXT[] DEFAULT NULL;

UPDATE "Teacher" t
SET "assignedLevels" = sub.levels
FROM (
  SELECT
    ct."teacherId" AS tid,
    ARRAY_AGG(DISTINCT UPPER(TRIM(g.level))) AS levels
  FROM "CourseTeacher" ct
  JOIN "Grade" g ON g.id = ct."gradeId"
  WHERE g.level IS NOT NULL AND TRIM(g.level) <> ''
  GROUP BY ct."teacherId"
) AS sub
WHERE t.id = sub.tid
  AND (t."assignedLevels" IS NULL OR array_length(t."assignedLevels", 1) IS NULL);

-- Verifica los niveles asignados por docente:
SELECT
  t.id,
  u.name,
  t."assignedLevels",
  (SELECT ARRAY_AGG(DISTINCT UPPER(TRIM(g.level)))
     FROM "CourseTeacher" ct JOIN "Grade" g ON g.id = ct."gradeId"
     WHERE ct."teacherId" = t.id) AS derived_levels
FROM "Teacher" t
JOIN "User" u ON u.id = t."userId"
ORDER BY u.name;
