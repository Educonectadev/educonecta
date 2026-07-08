-- PostgreSQL Schema for EduConecta (Supabase)
-- Run this in the Supabase SQL Editor AFTER running cleanup-supabase.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Institution ──
CREATE TABLE "Institution" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'public',
  ruc VARCHAR(11) DEFAULT NULL,
  address TEXT,
  district VARCHAR(255),
  province VARCHAR(255),
  department VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255),
  website VARCHAR(255),
  directorName VARCHAR(255),
  educationalLevel VARCHAR(255),
  shifts VARCHAR(255),
  foundedYear INT DEFAULT NULL,
  description TEXT,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User ──
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'INSTITUTIONAL_ADMIN', 'SECRETARY', 'TEACHER', 'PARENT', 'STUDENT')),
  phone VARCHAR(255),
  brandColor VARCHAR(9) DEFAULT '#000000',
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  institutionId INT REFERENCES "Institution"(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_institution ON "User"(institutionId);

-- ── InstitutionalAdmin ──
CREATE TABLE "InstitutionalAdmin" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inst_admin_institution ON "InstitutionalAdmin"(institutionId);

-- ── Secretary ──
CREATE TABLE "Secretary" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_secretary_institution ON "Secretary"(institutionId);

-- ── Teacher ──
CREATE TABLE "Teacher" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  speciality VARCHAR(255),
  documentId VARCHAR(255),
  title VARCHAR(255),
  contractType VARCHAR(255),
  emergencyContact VARCHAR(255),
  emergencyPhone VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teacher_institution ON "Teacher"(institutionId);

-- ── Parent ──
CREATE TABLE "Parent" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  occupation VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parent_institution ON "Parent"(institutionId);

-- ── Grade ──
CREATE TABLE "Grade" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(255) NOT NULL,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  shift VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, level, institutionId)
);

CREATE INDEX idx_grade_institution ON "Grade"(institutionId);

-- ── Section ──
CREATE TABLE "Section" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gradeId INT NOT NULL REFERENCES "Grade"(id) ON DELETE CASCADE,
  capacity INT DEFAULT 30,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, gradeId)
);

CREATE INDEX idx_section_grade ON "Section"(gradeId);

-- ── Student ──
CREATE TABLE "Student" (
  id SERIAL PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  documentId VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(255),
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL,
  sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL,
  shift VARCHAR(50) DEFAULT NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_institution ON "Student"(institutionId);
CREATE INDEX idx_student_grade ON "Student"(gradeId);
CREATE INDEX idx_student_section ON "Student"(sectionId);
CREATE INDEX idx_student_document ON "Student"(documentId);

-- ── ParentStudent (many-to-many) ──
CREATE TABLE "ParentStudent" (
  id SERIAL PRIMARY KEY,
  parentId INT NOT NULL REFERENCES "Parent"(id) ON DELETE CASCADE,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  relationship VARCHAR(255),
  UNIQUE (parentId, studentId)
);

CREATE INDEX idx_parent_student_student ON "ParentStudent"(studentId);

-- ── Course ──
CREATE TABLE "Course" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  description TEXT,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, institutionId)
);

CREATE INDEX idx_course_institution ON "Course"(institutionId);

-- ── CourseTeacher ──
CREATE TABLE "CourseTeacher" (
  id SERIAL PRIMARY KEY,
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL,
  sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL,
  UNIQUE (courseId, teacherId, gradeId, sectionId)
);

CREATE INDEX idx_course_teacher_teacher ON "CourseTeacher"(teacherId);

-- ── Schedule ──
CREATE TABLE "Schedule" (
  id SERIAL PRIMARY KEY,
  dayOfWeek INT NOT NULL CHECK (dayOfWeek BETWEEN 1 AND 7),
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  classroom VARCHAR(255),
  shift VARCHAR(50) NOT NULL DEFAULT 'MAÑANA',
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT REFERENCES "Teacher"(id) ON DELETE SET NULL,
  gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL,
  sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedule_course ON "Schedule"(courseId);
CREATE INDEX idx_schedule_institution ON "Schedule"(institutionId);
CREATE INDEX idx_schedule_teacher ON "Schedule"(teacherId);
CREATE INDEX idx_schedule_grade ON "Schedule"(gradeId);
CREATE INDEX idx_schedule_section ON "Schedule"(sectionId);

-- ── Enrollment ──
CREATE TABLE "Enrollment" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  gradeId INT NOT NULL REFERENCES "Grade"(id) ON DELETE CASCADE,
  sectionId INT NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE,
  academicYear VARCHAR(9) NOT NULL,
  enrollmentDate TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studentId, academicYear)
);

CREATE INDEX idx_enrollment_grade ON "Enrollment"(gradeId);
CREATE INDEX idx_enrollment_section ON "Enrollment"(sectionId);
CREATE INDEX idx_enrollment_year ON "Enrollment"(academicYear);

-- ── Attendance ──
CREATE TABLE "Attendance" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  isPresent BOOLEAN NOT NULL DEFAULT TRUE,
  note TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studentId, date)
);

CREATE INDEX idx_attendance_teacher ON "Attendance"(teacherId);
CREATE INDEX idx_attendance_date ON "Attendance"(date);

-- ── Tardiness ──
CREATE TABLE "Tardiness" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutesLate INT NOT NULL CHECK (minutesLate > 0),
  note TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studentId, date)
);

CREATE INDEX idx_tardiness_teacher ON "Tardiness"(teacherId);
CREATE INDEX idx_tardiness_date ON "Tardiness"(date);

-- ── Homework ──
CREATE TABLE "Homework" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate TIMESTAMPTZ NOT NULL,
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL,
  sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_homework_course ON "Homework"(courseId);
CREATE INDEX idx_homework_teacher ON "Homework"(teacherId);
CREATE INDEX idx_homework_due ON "Homework"(dueDate);

-- ── HomeworkSubmission ──
CREATE TABLE "HomeworkSubmission" (
  id SERIAL PRIMARY KEY,
  homeworkId INT NOT NULL REFERENCES "Homework"(id) ON DELETE CASCADE,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (homeworkId, studentId)
);

CREATE INDEX idx_hw_submission_student ON "HomeworkSubmission"(studentId);

-- ── GradeRecord ──
CREATE TABLE "GradeRecord" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 20),
  evaluationName VARCHAR(255) NOT NULL,
  evaluationDate DATE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grade_student ON "GradeRecord"(studentId);
CREATE INDEX idx_grade_course ON "GradeRecord"(courseId);
CREATE INDEX idx_grade_teacher ON "GradeRecord"(teacherId);

-- ── Discipline ──
CREATE TABLE "Discipline" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(255) NOT NULL,
  isResolved BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discipline_student ON "Discipline"(studentId);
CREATE INDEX idx_discipline_teacher ON "Discipline"(teacherId);
CREATE INDEX idx_discipline_date ON "Discipline"(date);

-- ── Communication ──
CREATE TABLE "Communication" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  authorId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  teacherId INT REFERENCES "Teacher"(id) ON DELETE SET NULL,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  priority VARCHAR(50) NOT NULL DEFAULT 'normal',
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comm_institution ON "Communication"(institutionId);
CREATE INDEX idx_comm_author ON "Communication"(authorId);

-- ── Notification ──
CREATE TABLE "Notification" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  parentId INT REFERENCES "Parent"(id) ON DELETE SET NULL,
  studentId INT REFERENCES "Student"(id) ON DELETE SET NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  readAt TIMESTAMPTZ,
  confirmedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON "Notification"(userId);
CREATE INDEX idx_notification_read ON "Notification"(userId, isRead);

-- ── PushSubscription ── suscripciones Web Push por usuario/dispositivo
CREATE TABLE "PushSubscription" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  userAgent TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_sub_user ON "PushSubscription"(userId);

CREATE TRIGGER update_PushSubscription_updatedAt BEFORE UPDATE ON "PushSubscription" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── NotificationRead ──
CREATE TABLE "NotificationRead" (
  id SERIAL PRIMARY KEY,
  notificationId INT NOT NULL REFERENCES "Notification"(id) ON DELETE CASCADE,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  readAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notificationId, userId)
);

CREATE INDEX idx_notif_read_user ON "NotificationRead"(userId);

-- ── AuditLog ──
CREATE TABLE "AuditLog" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(255) NOT NULL,
  entityId INT,
  details TEXT,
  ipAddress VARCHAR(45),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON "AuditLog"(userId);
CREATE INDEX idx_audit_entity ON "AuditLog"(entity, entityId);
CREATE INDEX idx_audit_created ON "AuditLog"(createdAt);

-- ── Auto-update updatedAt trigger ──
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table with updatedAt
CREATE TRIGGER update_Institution_updatedAt BEFORE UPDATE ON "Institution" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_User_updatedAt BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_InstitutionalAdmin_updatedAt BEFORE UPDATE ON "InstitutionalAdmin" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Teacher_updatedAt BEFORE UPDATE ON "Teacher" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Parent_updatedAt BEFORE UPDATE ON "Parent" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Grade_updatedAt BEFORE UPDATE ON "Grade" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Section_updatedAt BEFORE UPDATE ON "Section" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Student_updatedAt BEFORE UPDATE ON "Student" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Course_updatedAt BEFORE UPDATE ON "Course" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Schedule_updatedAt BEFORE UPDATE ON "Schedule" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Enrollment_updatedAt BEFORE UPDATE ON "Enrollment" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Attendance_updatedAt BEFORE UPDATE ON "Attendance" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Tardiness_updatedAt BEFORE UPDATE ON "Tardiness" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Homework_updatedAt BEFORE UPDATE ON "Homework" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_HomeworkSubmission_updatedAt BEFORE UPDATE ON "HomeworkSubmission" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_GradeRecord_updatedAt BEFORE UPDATE ON "GradeRecord" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Discipline_updatedAt BEFORE UPDATE ON "Discipline" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Communication_updatedAt BEFORE UPDATE ON "Communication" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Notification_updatedAt BEFORE UPDATE ON "Notification" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
