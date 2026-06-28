-- Migration 011: Add STUDENT role + Student.userId
-- El alumno tiene cuenta propia con email personal (gmail/outlook).
-- Puede entrar a /dashboard/student para ver cursos, tareas, notas,
-- comunicados y descargar constancias.

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_role_check";
ALTER TABLE "User" ADD CONSTRAINT "User_role_check"
  CHECK (role IN ('SUPER_ADMIN', 'INSTITUTIONAL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'));

ALTER TABLE "Student"
  ADD COLUMN IF NOT EXISTS "userId" INT UNIQUE REFERENCES "User"(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_student_user ON "Student"("userId");