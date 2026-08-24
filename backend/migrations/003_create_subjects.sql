CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subjects_organization_name_unique UNIQUE (organization_id, name),
  CONSTRAINT subjects_organization_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_organization_id
ON subjects(organization_id);
