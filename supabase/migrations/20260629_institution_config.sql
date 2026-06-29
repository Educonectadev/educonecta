-- =============================================================
-- EduConecta: Institution configuration, academic periods,
-- evaluation system, enrollment enhancements
-- =============================================================

-- 1. SETTINGS JSONB ON INSTITUTION
ALTER TABLE "Institution" ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 2. ACADEMIC PERIODS
CREATE TABLE IF NOT EXISTS "AcademicPeriod" (
  id SERIAL PRIMARY KEY,
  "institutionId" INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bimester', 'trimester', 'semester', 'quarter', 'other')),
  "academicYear" VARCHAR(9) NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "order" INT NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("institutionId", type, "academicYear", "order")
);

CREATE INDEX IF NOT EXISTS idx_academic_period_inst ON "AcademicPeriod"("institutionId", "academicYear");

-- 3. ADD PERIOD AND WEIGHT TO GRADERECORD
ALTER TABLE "GradeRecord" ADD COLUMN IF NOT EXISTS "periodId" INT REFERENCES "AcademicPeriod"(id) ON DELETE SET NULL;
ALTER TABLE "GradeRecord" ADD COLUMN IF NOT EXISTS weight DECIMAL(3,2) NOT NULL DEFAULT 1.00;

CREATE INDEX IF NOT EXISTS idx_grade_record_period ON "GradeRecord"("periodId");

-- 4. ENROLLMENT ENHANCEMENTS
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'withdrawn', 'graduated', 'transferred'));
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "withdrawalDate" DATE;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "withdrawalReason" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "enrollmentType" VARCHAR(50) NOT NULL DEFAULT 'new'
  CHECK ("enrollmentType" IN ('new', 'reEnrollment', 'transfer', 'reincorporation'));

CREATE INDEX IF NOT EXISTS idx_enrollment_status ON "Enrollment"(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_inst ON "Enrollment"("studentId", "academicYear");

-- 5. FEE / APARA MANAGEMENT
CREATE TABLE IF NOT EXISTS "Fee" (
  id SERIAL PRIMARY KEY,
  "institutionId" INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('pension', 'enrollment', 'apafa', 'other')),
  dueDay INT DEFAULT 10,
  "academicYear" VARCHAR(9) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_inst ON "Fee"("institutionId", "academicYear");

CREATE TABLE IF NOT EXISTS "FeePayment" (
  id SERIAL PRIMARY KEY,
  "studentId" INT NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  "feeId" INT NOT NULL REFERENCES "Fee"(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  "dueDate" DATE NOT NULL,
  "paidDate" DATE,
  "paidAmount" DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'exempt')),
  "paymentMethod" VARCHAR(50),
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("studentId", "feeId", "dueDate")
);

CREATE INDEX IF NOT EXISTS idx_fee_payment_student ON "FeePayment"("studentId", status);
CREATE INDEX IF NOT EXISTS idx_fee_payment_fee ON "FeePayment"("feeId");
