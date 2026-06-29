-- =============================================================
-- EduConecta: Migration for national-scale performance
-- Run this in Supabase SQL Editor
-- =============================================================

-- 0. ADD MISSING COLUMNS (defined in schema but missing in deployed DB)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Institution' AND column_name = 'isActive') THEN
    ALTER TABLE "Institution" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'isActive') THEN
    ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Student' AND column_name = 'isActive') THEN
    ALTER TABLE "Student" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Teacher' AND column_name = 'isActive') THEN
    ALTER TABLE "Teacher" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

-- 1. COMPOSITE INDEXES (institutionId + commonly queried column)
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

-- 2. COVERING INDEXES (avoids heap lookups for frequent queries)
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON "Attendance"("studentId", date);
CREATE INDEX IF NOT EXISTS idx_grade_record_student_course ON "GradeRecord"("studentId", "courseId");
CREATE INDEX IF NOT EXISTS idx_homework_course_due ON "Homework"("courseId", "dueDate");

-- 3. INDEXES FOR FK CHAINS (tables scoped via join chain)
CREATE INDEX IF NOT EXISTS idx_section_grade_name ON "Section"("gradeId", name);
CREATE INDEX IF NOT EXISTS idx_enrollment_grade_section ON "Enrollment"("gradeId", "sectionId");
CREATE INDEX IF NOT EXISTS idx_enrollment_student_year ON "Enrollment"("studentId", "academicYear");
CREATE INDEX IF NOT EXISTS idx_course_teacher_course ON "CourseTeacher"("courseId", "teacherId");
CREATE INDEX IF NOT EXISTS idx_homework_teacher_due ON "Homework"("teacherId", "dueDate");
CREATE INDEX IF NOT EXISTS idx_notification_user_created ON "Notification"("userId", "createdAt" DESC);
