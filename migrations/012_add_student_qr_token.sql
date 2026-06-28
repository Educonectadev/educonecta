-- Migration 012: Student QR token + Attendance confirm flag
-- El carnet del estudiante lleva un QR que apunta a una página
-- pública con sus datos. Desde ahí, cualquier persona puede registrar
-- la asistencia del alumno; el docente luego la confirma.

ALTER TABLE "Student"
  ADD COLUMN IF NOT EXISTS "qrToken" VARCHAR(64) UNIQUE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_student_qr_token ON "Student"("qrToken");

ALTER TABLE "Attendance"
  ADD COLUMN IF NOT EXISTS "source" VARCHAR(20) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS "confirmedByTeacher" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "registeredByName" VARCHAR(255) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_confirmed ON "Attendance"("confirmedByTeacher", date);