-- Keep the legacy students.class_name field synchronized with the
-- authoritative students.class_id -> classes.id relationship.
-- New code should read the joined class name from classes.

CREATE OR REPLACE FUNCTION sync_student_class_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE students
  SET class_name = NEW.name
  WHERE class_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_student_class_name ON classes;

CREATE TRIGGER trg_sync_student_class_name
AFTER UPDATE OF name ON classes
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION sync_student_class_name();
