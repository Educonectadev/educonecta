-- Agrega columna notification_preferences a User como JSONB
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS notification_preferences JSONB
DEFAULT '{"homework": true, "communications": true, "messages": true, "grades": true, "attendance": true, "discipline": true, "schedule": true}'::jsonb;

-- Crea la tabla NotificationQueue para auditoría de envíos
CREATE TABLE IF NOT EXISTS "NotificationQueue" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  sent BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sentAt TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notif_queue_user ON "NotificationQueue"(userId);
CREATE INDEX IF NOT EXISTS idx_notif_queue_sent ON "NotificationQueue"(sent);
CREATE INDEX IF NOT EXISTS idx_notif_queue_created ON "NotificationQueue"(createdAt);

-- Trigger para updatedAt en NotificationQueue
CREATE TRIGGER IF NOT EXISTS update_NotificationQueue_updatedAt
  BEFORE UPDATE ON "NotificationQueue"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
