-- EduSphere VLE relationship layer
-- Run once in pgAdmin after the existing organizations/classes/teachers/students/subjects tables exist.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS class_teachers (
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS class_subjects (
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher_id ON class_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject_id ON class_subjects(subject_id);

-- Connect existing students that already have a class_name.
UPDATE students s
SET class_id = c.id
FROM classes c
WHERE s.class_id IS NULL
  AND s.organization_id = c.organization_id
  AND LOWER(TRIM(s.class_name)) = LOWER(TRIM(c.name));
