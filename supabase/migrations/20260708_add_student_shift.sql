ALTER TABLE "Student" ADD COLUMN shift VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN "Student".shift IS 'Turno del alumno (MAÑANA, TARDE). Si es NULL, se hereda del grado.';
