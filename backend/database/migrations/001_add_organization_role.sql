-- EduSphere migration: allow organization accounts in users.role.
-- Run this once against the EduSphere PostgreSQL database.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('admin', 'organization', 'teacher', 'student'));
