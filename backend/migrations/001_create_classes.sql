-- EduSphere Classes module
-- Run once against the EduSphere PostgreSQL database.

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  academic_year VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT classes_organization_name_unique UNIQUE (organization_id, name),
  CONSTRAINT classes_organization_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_classes_organization_id
  ON classes (organization_id);
