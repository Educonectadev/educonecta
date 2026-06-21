-- Migration 004: Create Classroom table
CREATE TABLE IF NOT EXISTS Classroom (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) DEFAULT NULL COMMENT 'Código del aula (ej. A-101)',
  capacity INT DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL COMMENT 'Pabellón, piso, etc.',
  institutionId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institutionId) REFERENCES Institution(id) ON DELETE CASCADE,
  UNIQUE KEY uk_classroom_name_institution (name, institutionId)
) ENGINE=InnoDB;
