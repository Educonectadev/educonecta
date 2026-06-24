-- Reset Supabase Database (EduConecta)
-- Run this FIRST to drop everything, then run supabase-schema.sql

-- Drop triggers
DROP TRIGGER IF EXISTS update_Institution_updatedAt ON "Institution" CASCADE;
DROP TRIGGER IF EXISTS update_User_updatedAt ON "User" CASCADE;
DROP TRIGGER IF EXISTS update_InstitutionalAdmin_updatedAt ON "InstitutionalAdmin" CASCADE;
DROP TRIGGER IF EXISTS update_Teacher_updatedAt ON "Teacher" CASCADE;
DROP TRIGGER IF EXISTS update_Parent_updatedAt ON "Parent" CASCADE;
DROP TRIGGER IF EXISTS update_Grade_updatedAt ON "Grade" CASCADE;
DROP TRIGGER IF EXISTS update_Section_updatedAt ON "Section" CASCADE;
DROP TRIGGER IF EXISTS update_Student_updatedAt ON "Student" CASCADE;
DROP TRIGGER IF EXISTS update_Course_updatedAt ON "Course" CASCADE;
DROP TRIGGER IF EXISTS update_Schedule_updatedAt ON "Schedule" CASCADE;
DROP TRIGGER IF EXISTS update_Enrollment_updatedAt ON "Enrollment" CASCADE;
DROP TRIGGER IF EXISTS update_Attendance_updatedAt ON "Attendance" CASCADE;
DROP TRIGGER IF EXISTS update_Tardiness_updatedAt ON "Tardiness" CASCADE;
DROP TRIGGER IF EXISTS update_Homework_updatedAt ON "Homework" CASCADE;
DROP TRIGGER IF EXISTS update_HomeworkSubmission_updatedAt ON "HomeworkSubmission" CASCADE;
DROP TRIGGER IF EXISTS update_GradeRecord_updatedAt ON "GradeRecord" CASCADE;
DROP TRIGGER IF EXISTS update_Discipline_updatedAt ON "Discipline" CASCADE;
DROP TRIGGER IF EXISTS update_Communication_updatedAt ON "Communication" CASCADE;
DROP TRIGGER IF EXISTS update_Notification_updatedAt ON "Notification" CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (order respects FK dependencies)
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "NotificationRead" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Communication" CASCADE;
DROP TABLE IF EXISTS "Discipline" CASCADE;
DROP TABLE IF EXISTS "GradeRecord" CASCADE;
DROP TABLE IF EXISTS "HomeworkSubmission" CASCADE;
DROP TABLE IF EXISTS "Homework" CASCADE;
DROP TABLE IF EXISTS "Tardiness" CASCADE;
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "Enrollment" CASCADE;
DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "CourseTeacher" CASCADE;
DROP TABLE IF EXISTS "Course" CASCADE;
DROP TABLE IF EXISTS "ParentStudent" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
DROP TABLE IF EXISTS "Section" CASCADE;
DROP TABLE IF EXISTS "Grade" CASCADE;
DROP TABLE IF EXISTS "Parent" CASCADE;
DROP TABLE IF EXISTS "Teacher" CASCADE;
DROP TABLE IF EXISTS "InstitutionalAdmin" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Institution" CASCADE;
