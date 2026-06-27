-- Migration 009: Subscriptions table
-- Cada institución tiene una suscripción activa (plan + monto + período).
-- El precio por padre (S/ 2) es la base; el colegio paga el total según
-- la cantidad de padres aportantes. El super-admin activa/cambia el plan
-- desde el dashboard.

CREATE TABLE IF NOT EXISTS "Subscription" (
  id SERIAL PRIMARY KEY,
  "institutionId" INT NOT NULL UNIQUE REFERENCES "Institution"(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('ESENCIAL', 'PROFESIONAL', 'INSTITUCIONAL')),
  "pricePerParent" DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  "parentCount" INT NOT NULL DEFAULT 0,
  "monthlyAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMPTZ DEFAULT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT DEFAULT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_institution ON "Subscription"("institutionId");
CREATE INDEX idx_subscription_plan ON "Subscription"(plan);

-- Columna de cache opcional para joins rápidos desde Institution
ALTER TABLE "Institution"
  ADD COLUMN IF NOT EXISTS "currentPlan" VARCHAR(20) DEFAULT NULL;