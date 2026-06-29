-- =============================================================
-- EduConecta: Migration for national-scale performance
-- Composite indexes, covering indexes, partial indexes
-- =============================================================

-- 1. COMPOSITE INDEXES (institutionId + commonly filtered column)
CREATE INDEX IF NOT EXISTS idx_user_role_inst ON "User"(role, "institutionId");
CREATE INDEX IF NOT EXISTS idx_user_inst_active ON "User"("institutionId", "isActive");

CREATE INDEX IF NOT EXISTS idx_student_inst_grade ON "Student"("institutionId", "gradeId");
CREATE INDEX IF NOT EXISTS idx_student_inst_active ON "Student"("institutionId", "isActive");
CREATE INDEX IF NOT EXISTS idx_student_inst_doc ON "Student"("institutionId", "documentId");

CREATE INDEX IF NOT EXISTS idx_teacher_inst_active ON "Teacher"("institutionId", "isActive");

CREATE INDEX IF NOT EXISTS idx_course_inst_name ON "Course"("institutionId", name);

CREATE INDEX IF NOT EXISTS idx_grade_inst_level ON "Grade"("institutionId", level);

CREATE INDEX IF NOT EXISTS idx_schedule_inst_day ON "Schedule"("institutionId", "dayOfWeek");

CREATE INDEX IF NOT EXISTS idx_comm_inst_type ON "Communication"("institutionId", type);
CREATE INDEX IF NOT EXISTS idx_comm_inst_created ON "Communication"("institutionId", "createdAt" DESC);

-- 2. COVERING INDEXES (for frequent queries, avoids heap lookups)
CREATE INDEX IF NOT EXISTS idx_attendance_student_date_covering
  ON "Attendance"("studentId", date)
  INCLUDE (isPresent, note, "confirmedByTeacher");

CREATE INDEX IF NOT EXISTS idx_grade_record_student_course_covering
  ON "GradeRecord"("studentId", "courseId")
  INCLUDE (grade, "evaluationName", "evaluationDate");

CREATE INDEX IF NOT EXISTS idx_homework_course_due_covering
  ON "Homework"("courseId", "dueDate")
  INCLUDE (title, description);

-- 4. INDEXES FOR FK CHAINS (tables that join through other tables)
CREATE INDEX IF NOT EXISTS idx_section_grade_name ON "Section"("gradeId", name);
CREATE INDEX IF NOT EXISTS idx_enrollment_grade_section ON "Enrollment"("gradeId", "sectionId");
CREATE INDEX IF NOT EXISTS idx_enrollment_student_year ON "Enrollment"("studentId", "academicYear");
CREATE INDEX IF NOT EXISTS idx_course_teacher_course ON "CourseTeacher"("courseId", "teacherId");
CREATE INDEX IF NOT EXISTS idx_homework_due_status ON "Homework"("teacherId", "dueDate");

-- 5. SUPABASE STORAGE BUCKET for institution files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-files',
  'institution-files',
  false,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access files from their institution
CREATE OR REPLACE FUNCTION storage.is_same_institution(bucket_id text, file_path text)
RETURNS boolean AS $$
DECLARE
  user_inst_id int;
  file_inst_id int;
BEGIN
  -- Extract institutionId from file path: {institutionId}/{uuid}-{filename}
  file_inst_id := split_part(file_path, '/', 1)::int;

  SELECT "institutionId" INTO user_inst_id
  FROM "User"
  WHERE id = auth.uid();

  RETURN COALESCE(user_inst_id = file_inst_id OR EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  ), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "users_can_read_own_institution_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'institution-files'
  AND storage.is_same_institution(bucket_id, name)
);

CREATE POLICY "users_can_insert_own_institution_files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'institution-files'
  AND storage.is_same_institution(bucket_id, name)
);

CREATE POLICY "users_can_delete_own_institution_files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'institution-files'
  AND storage.is_same_institution(bucket_id, name)
);
