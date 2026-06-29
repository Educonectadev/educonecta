CREATE TABLE IF NOT EXISTS "PartnerInstitution" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logoUrl TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_order ON "PartnerInstitution"("order");

CREATE OR REPLACE FUNCTION update_partner_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_partner_timestamp ON "PartnerInstitution";
CREATE TRIGGER trg_update_partner_timestamp
BEFORE UPDATE ON "PartnerInstitution"
FOR EACH ROW
EXECUTE FUNCTION update_partner_timestamp();
