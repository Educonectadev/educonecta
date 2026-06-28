-- Migration 015: InstitutionCarouselImage
-- Imágenes del carrusel del dashboard del admin institucional.
-- Soporta URLs externas (CDN) y archivos subidos (convertidos a
-- data URL/blob URL por el cliente, o subidos a Storage).

CREATE TABLE IF NOT EXISTS "InstitutionCarouselImage" (
  id SERIAL PRIMARY KEY,
  "institutionId" INT NOT NULL REFERENCES "Institution"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255) DEFAULT NULL,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carousel_institution ON "InstitutionCarouselImage"("institutionId", "order");