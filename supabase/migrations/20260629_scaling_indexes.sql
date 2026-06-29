-- =============================================================
-- EduConecta: Migration for national-scale performance
-- Only uses columns confirmed to exist in the deployed DB
-- =============================================================

-- Drop any partial indexes that may have been partially created
DROP INDEX IF EXISTS idx_user_active;
DROP INDEX IF EXISTS idx_student_active;
DROP INDEX IF EXISTS idx_notification_unread;

-- 1. COMPOSITE INDEXES (institutionId + commonly queried column)
CREATE INDEX IF NOT EXISTS idx_user_role_inst ON "User"(role, "institutionId");
CREATE INDEX IF NOT EXISTS idx_student_inst_grade ON "Student"("institutionId", "gradeId");
CREATE INDEX IF NOT EXISTS idx_student_inst_doc ON "Student"("institutionId", "documentId");
CREATE INDEX IF NOT EXISTS idx_course_inst_name ON "Course"("institutionId", name);
CREATE INDEX IF NOT EXISTS idx_grade_inst_level ON "Grade"("institutionId", level);
CREATE INDEX IF NOT EXISTS idx_schedule_inst_day ON "Schedule"("institutionId", "dayOfWeek");
CREATE INDEX IF NOT EXISTS idx_comm_inst_type ON "Communication"("institutionId", type);
CREATE INDEX IF NOT EXISTS idx_comm_inst_created ON "Communication"("institutionId", "createdAt" DESC);

-- 2. COVERING INDEXES (avoids heap lookups for frequent queries)
CREATE INDEX IF NOT EXISTS idx_attendance_student_date
  ON "Attendance"("studentId", date);
CREATE INDEX IF NOT EXISTS idx_grade_record_student_course
  ON "GradeRecord"("studentId", "courseId");
CREATE INDEX IF NOT EXISTS idx_homework_course_due
  ON "Homework"("courseId", "dueDate");

-- 3. INDEXES FOR FK CHAINS (tables scoped via join chain)
CREATE INDEX IF NOT EXISTS idx_section_grade_name ON "Section"("gradeId", name);
CREATE INDEX IF NOT EXISTS idx_enrollment_grade_section ON "Enrollment"("gradeId", "sectionId");
CREATE INDEX IF NOT EXISTS idx_enrollment_student_year ON "Enrollment"("studentId", "academicYear");
CREATE INDEX IF NOT EXISTS idx_course_teacher_course ON "CourseTeacher"("courseId", "teacherId");
CREATE INDEX IF NOT EXISTS idx_homework_teacher_due ON "Homework"("teacherId", "dueDate");
CREATE INDEX IF NOT EXISTS idx_notification_user_created ON "Notification"("userId", "createdAt" DESC);

-- 4. SUPABASE STORAGE BUCKET for institution files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-files',
  'institution-files',
  false,
  52428800,
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
