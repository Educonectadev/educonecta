-- PostgreSQL Schema for EduConecta (Supabase)
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Institution
CREATE TABLE "Institution" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) DEFAULT 'public',
  ruc VARCHAR(11) DEFAULT NULL,
  address VARCHAR(255),
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

-- User
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  institutionId INT REFERENCES "Institution"(id) ON DELETE SET NULL
);

-- InstitutionalAdmin
CREATE TABLE "InstitutionalAdmin" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teacher
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

-- Parent
CREATE TABLE "Parent" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  occupation VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grade
CREATE TABLE "Grade" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(255),
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  shift VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, level, institutionId)
);

-- Section
CREATE TABLE "Section" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gradeId INT NOT NULL REFERENCES "Grade"(id) ON DELETE CASCADE,
  capacity INT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, gradeId)
);

-- Student
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
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ParentStudent (many-to-many)
CREATE TABLE "ParentStudent" (
  parentId INT NOT NULL REFERENCES "Parent"(id) ON DELETE CASCADE,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  relationship VARCHAR(255),
  PRIMARY KEY (parentId, studentId)
);

-- Course
CREATE TABLE "Course" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  description VARCHAR(255),
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, institutionId)
);

-- CourseTeacher
CREATE TABLE "CourseTeacher" (
  id SERIAL PRIMARY KEY,
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL,
  sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL,
  UNIQUE (courseId, teacherId, gradeId, sectionId)
);

-- Schedule
CREATE TABLE "Schedule" (
  id SERIAL PRIMARY KEY,
  dayOfWeek INT NOT NULL,
  startTime VARCHAR(255) NOT NULL,
  endTime VARCHAR(255) NOT NULL,
  classroom VARCHAR(255),
  shift VARCHAR(255) NOT NULL DEFAULT 'MAÑANA',
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrollment
CREATE TABLE "Enrollment" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  gradeId INT NOT NULL REFERENCES "Grade"(id) ON DELETE CASCADE,
  sectionId INT NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE,
  academicYear VARCHAR(255) NOT NULL,
  enrollmentDate TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studentId, academicYear)
);

-- Attendance
CREATE TABLE "Attendance" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  isPresent BOOLEAN NOT NULL DEFAULT TRUE,
  note VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studentId, date)
);

-- Tardiness
CREATE TABLE "Tardiness" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  minutesLate INT NOT NULL,
  note VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studentId, date)
);

-- Homework
CREATE TABLE "Homework" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  dueDate TIMESTAMPTZ NOT NULL,
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL,
  sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HomeworkSubmission
CREATE TABLE "HomeworkSubmission" (
  id SERIAL PRIMARY KEY,
  homeworkId INT NOT NULL REFERENCES "Homework"(id) ON DELETE CASCADE,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  note VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (homeworkId, studentId)
);

-- GradeRecord
CREATE TABLE "GradeRecord" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  grade DECIMAL(5,2) NOT NULL,
  evaluationName VARCHAR(255) NOT NULL,
  evaluationDate TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discipline
CREATE TABLE "Discipline" (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  description VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  isResolved BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Communication
CREATE TABLE "Communication" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  authorId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  teacherId INT REFERENCES "Teacher"(id) ON DELETE SET NULL,
  institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  priority VARCHAR(255) NOT NULL DEFAULT 'normal',
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification
CREATE TABLE "Notification" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  parentId INT REFERENCES "Parent"(id) ON DELETE SET NULL,
  studentId INT REFERENCES "Student"(id) ON DELETE SET NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  readAt TIMESTAMPTZ,
  confirmedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NotificationRead
CREATE TABLE "NotificationRead" (
  id SERIAL PRIMARY KEY,
  notificationId INT NOT NULL REFERENCES "Notification"(id) ON DELETE CASCADE,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  readAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notificationId, userId)
);

-- AuditLog
CREATE TABLE "AuditLog" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(255) NOT NULL,
  entityId INT,
  details VARCHAR(255),
  ipAddress VARCHAR(255),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
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
