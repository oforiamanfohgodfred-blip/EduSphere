-- EduSphere V1 class chat
-- Run after the existing VLE relationship and user tables are available.
BEGIN;

CREATE TABLE IF NOT EXISTS class_messages (
  id BIGSERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('organization', 'teacher', 'student')),
  sender_reference_id INTEGER NOT NULL,
  message TEXT NOT NULL CHECK (char_length(btrim(message)) BETWEEN 1 AND 2000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_class_messages_class_time
  ON class_messages(class_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_class_messages_org_time
  ON class_messages(organization_id, created_at DESC);

COMMIT;
