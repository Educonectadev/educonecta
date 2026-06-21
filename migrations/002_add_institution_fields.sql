-- Migration 002: Add more detailed fields to Institution
ALTER TABLE Institution
  ADD COLUMN type VARCHAR(50) DEFAULT 'public' COMMENT 'public, private',
  ADD COLUMN ruc VARCHAR(11) DEFAULT NULL,
  ADD COLUMN website VARCHAR(255) DEFAULT NULL,
  ADD COLUMN directorName VARCHAR(255) DEFAULT NULL,
  ADD COLUMN district VARCHAR(255) DEFAULT NULL,
  ADD COLUMN province VARCHAR(255) DEFAULT NULL,
  ADD COLUMN department VARCHAR(255) DEFAULT NULL,
  ADD COLUMN educationalLevel VARCHAR(255) DEFAULT NULL COMMENT 'inicial, primaria, secundaria (comma separated)',
  ADD COLUMN shifts VARCHAR(255) DEFAULT NULL COMMENT 'morning, afternoon, evening (comma separated)',
  ADD COLUMN foundedYear INT DEFAULT NULL,
  ADD COLUMN description TEXT DEFAULT NULL;
