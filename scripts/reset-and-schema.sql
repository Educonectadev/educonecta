-- ═══════════════════════════════════════════════════════
-- EduConecta - Reset + Full Schema (ONE SCRIPT)
-- Copy EVERYTHING below, paste in Supabase SQL Editor, RUN
-- ═══════════════════════════════════════════════════════

DROP TABLE IF EXISTS "InstitutionalAdmin" CASCADE;
DROP TABLE IF EXISTS "Teacher" CASCADE;
DROP TABLE IF EXISTS "Parent" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Institution" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
DROP TABLE IF EXISTS "Grade" CASCADE;
DROP TABLE IF EXISTS "Section" CASCADE;
DROP TABLE IF EXISTS "Course" CASCADE;
DROP TABLE IF EXISTS "CourseTeacher" CASCADE;
DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "ParentStudent" CASCADE;
DROP TABLE IF EXISTS "Enrollment" CASCADE;
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "Tardiness" CASCADE;
DROP TABLE IF EXISTS "Homework" CASCADE;
DROP TABLE IF EXISTS "HomeworkSubmission" CASCADE;
DROP TABLE IF EXISTS "GradeRecord" CASCADE;
DROP TABLE IF EXISTS "Discipline" CASCADE;
DROP TABLE IF EXISTS "Communication" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "NotificationRead" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Classroom" CASCADE;
DROP TABLE IF EXISTS "Version" CASCADE;
DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

CREATE TABLE "Institution" (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, code VARCHAR(255) NOT NULL UNIQUE, type VARCHAR(50) DEFAULT 'public', ruc VARCHAR(11), address TEXT, district VARCHAR(255), province VARCHAR(255), department VARCHAR(255), phone VARCHAR(255), email VARCHAR(255), website VARCHAR(255), directorName VARCHAR(255), educationalLevel VARCHAR(255), shifts VARCHAR(255), foundedYear INT, description TEXT, isActive BOOLEAN DEFAULT TRUE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "User" (id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, passwordHash VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN','INSTITUTIONAL_ADMIN','TEACHER','PARENT')), phone VARCHAR(255), isActive BOOLEAN DEFAULT TRUE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), institutionId INT REFERENCES "Institution"(id) ON DELETE SET NULL);

CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_email ON "User"(email);

CREATE TABLE "InstitutionalAdmin" (id SERIAL PRIMARY KEY, userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Teacher" (id SERIAL PRIMARY KEY, userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, speciality VARCHAR(255), documentId VARCHAR(255), title VARCHAR(255), contractType VARCHAR(255), emergencyContact VARCHAR(255), emergencyPhone VARCHAR(255), createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Parent" (id SERIAL PRIMARY KEY, userId INT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, occupation VARCHAR(255), createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Grade" (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, level VARCHAR(255) NOT NULL, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, shift VARCHAR(255), createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (name, level, institutionId));

CREATE TABLE "Section" (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, gradeId INT NOT NULL REFERENCES "Grade"(id) ON DELETE CASCADE, capacity INT DEFAULT 30, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (name, gradeId));

CREATE TABLE "Student" (id SERIAL PRIMARY KEY, firstName VARCHAR(255) NOT NULL, lastName VARCHAR(255) NOT NULL, documentId VARCHAR(255) NOT NULL, email VARCHAR(255), phone VARCHAR(255), institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL, sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL, isActive BOOLEAN DEFAULT TRUE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "ParentStudent" (parentId INT NOT NULL REFERENCES "Parent"(id) ON DELETE CASCADE, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, relationship VARCHAR(255), PRIMARY KEY (parentId, studentId));

CREATE TABLE "Course" (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, code VARCHAR(255), description TEXT, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (name, institutionId));

CREATE TABLE "Classroom" (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, code VARCHAR(255), capacity INT DEFAULT 30, location VARCHAR(255), description TEXT, isActive BOOLEAN DEFAULT TRUE, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "CourseTeacher" (id SERIAL PRIMARY KEY, courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE, teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE, gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL, sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL, UNIQUE (courseId, teacherId, gradeId, sectionId));

CREATE TABLE "Schedule" (id SERIAL PRIMARY KEY, dayOfWeek INT NOT NULL CHECK (dayOfWeek BETWEEN 1 AND 7), startTime TIME NOT NULL, endTime TIME NOT NULL, classroom VARCHAR(255), shift VARCHAR(50) DEFAULT 'MAÑANA', courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE, teacherId INT REFERENCES "Teacher"(id) ON DELETE SET NULL, gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL, sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Enrollment" (id SERIAL PRIMARY KEY, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, gradeId INT NOT NULL REFERENCES "Grade"(id) ON DELETE CASCADE, sectionId INT NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE, academicYear VARCHAR(9) NOT NULL, enrollmentDate TIMESTAMPTZ DEFAULT NOW(), isActive BOOLEAN DEFAULT TRUE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (studentId, academicYear));

CREATE TABLE "Attendance" (id SERIAL PRIMARY KEY, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE, date DATE NOT NULL, isPresent BOOLEAN DEFAULT TRUE, note TEXT, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (studentId, date));

CREATE TABLE "Tardiness" (id SERIAL PRIMARY KEY, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE, date DATE NOT NULL, minutesLate INT NOT NULL CHECK (minutesLate > 0), note TEXT, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (studentId, date));

CREATE TABLE "Homework" (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, dueDate TIMESTAMPTZ NOT NULL, courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE, teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE, gradeId INT REFERENCES "Grade"(id) ON DELETE SET NULL, sectionId INT REFERENCES "Section"(id) ON DELETE SET NULL, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "HomeworkSubmission" (id SERIAL PRIMARY KEY, homeworkId INT NOT NULL REFERENCES "Homework"(id) ON DELETE CASCADE, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, submitted BOOLEAN DEFAULT FALSE, note TEXT, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (homeworkId, studentId));

CREATE TABLE "GradeRecord" (id SERIAL PRIMARY KEY, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, courseId INT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE, teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE, grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 20), evaluationName VARCHAR(255) NOT NULL, evaluationDate DATE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Discipline" (id SERIAL PRIMARY KEY, studentId INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE, teacherId INT NOT NULL REFERENCES "Teacher"(id) ON DELETE CASCADE, date DATE NOT NULL, description TEXT NOT NULL, type VARCHAR(255) NOT NULL, isResolved BOOLEAN DEFAULT FALSE, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Communication" (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, type VARCHAR(50) NOT NULL, authorId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, teacherId INT REFERENCES "Teacher"(id) ON DELETE SET NULL, institutionId INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE, priority VARCHAR(50) DEFAULT 'normal', createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "Notification" (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, type VARCHAR(50) NOT NULL, userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, parentId INT REFERENCES "Parent"(id) ON DELETE SET NULL, studentId INT REFERENCES "Student"(id) ON DELETE SET NULL, isRead BOOLEAN DEFAULT FALSE, readAt TIMESTAMPTZ, confirmedAt TIMESTAMPTZ, createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE "NotificationRead" (id SERIAL PRIMARY KEY, notificationId INT NOT NULL REFERENCES "Notification"(id) ON DELETE CASCADE, userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, readAt TIMESTAMPTZ DEFAULT NOW(), UNIQUE (notificationId, userId));

CREATE TABLE "AuditLog" (id SERIAL PRIMARY KEY, userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, action VARCHAR(255) NOT NULL, entity VARCHAR(255) NOT NULL, entityId INT, details TEXT, ipAddress VARCHAR(45), createdAt TIMESTAMPTZ DEFAULT NOW());

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updatedAt = NOW(); RETURN NEW; END; $$ language 'plpgsql';

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

-- ═══════════════════════════════════════════════════════
-- Version - registro de versiones del sistema
-- ═══════════════════════════════════════════════════════

CREATE TABLE "Version" ("id" SERIAL PRIMARY KEY, "version" VARCHAR(50) NOT NULL, "title" VARCHAR(255), "description" TEXT, "isCurrent" BOOLEAN DEFAULT FALSE, "createdAt" TIMESTAMPTZ DEFAULT NOW());

-- ═══════════════════════════════════════════════════════
-- exec_sql - permite ejecutar SQL desde la app via RPC
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION exec_sql(query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  is_select BOOLEAN;
BEGIN
  query := trim(query);
  is_select := (upper(left(query, 6)) = 'SELECT' OR upper(left(query, 4)) = 'WITH');

  IF is_select THEN
    EXECUTE query INTO result;
    RETURN COALESCE(result, '[]'::jsonb);
  ELSE
    EXECUTE query;
    RETURN '{"affectedRows": 1}'::jsonb;
  END IF;
END;
$$;

-- ═══════════════════════════════════════════════════════
-- DONE! Ahora ve a /super-admin/register en tu app
-- para crear la cuenta de Super Admin.
-- ═══════════════════════════════════════════════════════
