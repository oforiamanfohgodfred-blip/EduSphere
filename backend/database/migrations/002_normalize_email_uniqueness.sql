-- EduSphere migration: enforce case-insensitive email uniqueness at the database layer.
-- Run after confirming existing email values do not contain duplicates.

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS organizations_email_lower_unique
  ON organizations (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS teachers_email_lower_unique
  ON teachers (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS students_email_lower_unique
  ON students (LOWER(email));
