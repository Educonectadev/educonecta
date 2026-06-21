-- Migration 003: Add detailed fields to Teacher table
ALTER TABLE Teacher
  ADD COLUMN documentId VARCHAR(20) DEFAULT NULL COMMENT 'DNI/CE',
  ADD COLUMN professionalTitle VARCHAR(255) DEFAULT NULL COMMENT 'Título profesional',
  ADD COLUMN educationLevel VARCHAR(50) DEFAULT NULL COMMENT 'Bachiller, Titulado, Magister, Doctor',
  ADD COLUMN hireDate DATE DEFAULT NULL COMMENT 'Fecha de contratación',
  ADD COLUMN contractType VARCHAR(50) DEFAULT NULL COMMENT 'Tiempo completo, Medio tiempo, Por horas, CAS',
  ADD COLUMN address VARCHAR(255) DEFAULT NULL,
  ADD COLUMN emergencyContactName VARCHAR(255) DEFAULT NULL,
  ADD COLUMN emergencyContactPhone VARCHAR(50) DEFAULT NULL;
