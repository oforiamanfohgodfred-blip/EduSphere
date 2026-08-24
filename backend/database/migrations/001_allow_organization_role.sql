-- EduSphere migration: allow organization accounts in the shared users table.
-- Run once against the EduSphere PostgreSQL database.

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('organization', 'teacher', 'student', 'admin'));
