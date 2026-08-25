-- EduSphere VLE communication layer
-- Safe to run after vle_relationships.sql.

CREATE TABLE IF NOT EXISTS class_chat_messages (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_chat_messages (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_class_chat_class_created
  ON class_chat_messages(class_id, created_at);
CREATE INDEX IF NOT EXISTS idx_class_chat_org
  ON class_chat_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_chat_org_created
  ON staff_chat_messages(organization_id, created_at);
