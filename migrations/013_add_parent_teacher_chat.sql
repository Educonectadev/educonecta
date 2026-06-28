-- Migration 013: ParentTeacherMessage
-- Chat directo entre un apoderado y un docente (relacionado a un
-- estudiante). Se usa desde el portal del padre y del docente.

CREATE TABLE IF NOT EXISTS "ParentTeacherMessage" (
  id SERIAL PRIMARY KEY,
  "parentUserId" INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "teacherUserId" INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "studentId" INT REFERENCES "Student"(id) ON DELETE SET NULL,
  "fromRole" VARCHAR(20) NOT NULL CHECK ("fromRole" IN ('PARENT', 'TEACHER')),
  "fromName" VARCHAR(255) DEFAULT NULL,
  body TEXT NOT NULL,
  "readByParent" BOOLEAN NOT NULL DEFAULT TRUE,
  "readByTeacher" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ptm_parent ON "ParentTeacherMessage"("parentUserId", "createdAt" DESC);
CREATE INDEX idx_ptm_teacher ON "ParentTeacherMessage"("teacherUserId", "createdAt" DESC);
CREATE INDEX idx_ptm_student ON "ParentTeacherMessage"("studentId");