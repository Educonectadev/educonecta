-- Migration 010: Leads + LeadMessage
-- Captura solicitudes de colegios que llenan el formulario "Quiero que me
-- contacten" desde /planes. El super-admin gestiona el chat desde el panel.

CREATE TABLE IF NOT EXISTS "Lead" (
  id SERIAL PRIMARY KEY,
  "institutionName" VARCHAR(255) NOT NULL,
  "directorName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  plan VARCHAR(20) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NUEVO',
  notes TEXT DEFAULT NULL,
  "unreadByAdmin" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_status ON "Lead"(status);
CREATE INDEX idx_lead_created ON "Lead"("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "LeadMessage" (
  id SERIAL PRIMARY KEY,
  "leadId" INT NOT NULL REFERENCES "Lead"(id) ON DELETE CASCADE,
  "authorRole" VARCHAR(20) NOT NULL CHECK ("authorRole" IN ('LEAD', 'ADMIN')),
  "authorName" VARCHAR(255) DEFAULT NULL,
  body TEXT NOT NULL,
  "readByAdmin" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_message_lead ON "LeadMessage"("leadId", "createdAt");