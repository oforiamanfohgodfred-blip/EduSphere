const pool = require("../config/db");

const getTeacherId = (req) => Number(req.user?.reference_id);
const getOrganizationId = (req) => Number(req.user?.organization_id);

const getMyClasses = async (req, res) => {
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);

    if (!teacherId || !organizationId) {
      return res.status(400).json({ message: "Teacher organization context is required." });
    }

    const result = await pool.query(
      `SELECT c.id, c.organization_id, c.name, c.code, c.description, c.academic_year,
              COUNT(DISTINCT s.id)::int AS student_count,
              COUNT(DISTINCT cs.subject_id)::int AS subject_count
       FROM class_teachers ct
       JOIN classes c ON c.id = ct.class_id
       LEFT JOIN students s ON s.class_id = c.id
       LEFT JOIN class_subjects cs ON cs.class_id = c.id
       WHERE ct.teacher_id = $1 AND c.organization_id = $2
       GROUP BY c.id
       ORDER BY c.name ASC`,
      [teacherId, organizationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load your classes." });
  }
};

const getMyClassDetails = async (req, res) => {
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const classId = Number(req.params.id);

    if (!teacherId || !organizationId || !classId) {
      return res.status(400).json({ message: "Valid teacher and class context are required." });
    }

    const classResult = await pool.query(
      `SELECT c.id, c.organization_id, c.name, c.code, c.description, c.academic_year
       FROM classes c
       JOIN class_teachers ct ON ct.class_id = c.id
       WHERE c.id = $1 AND ct.teacher_id = $2 AND c.organization_id = $3`,
      [classId, teacherId, organizationId]
    );

    if (!classResult.rows.length) {
      return res.status(404).json({ message: "Class not found or you are not assigned to this class." });
    }

    const [students, teachers, subjects] = await Promise.all([
      pool.query(
        `SELECT id, student_id, full_name, email, phone, gender, class_id
         FROM students
         WHERE class_id = $1 AND organization_id = $2
         ORDER BY full_name`,
        [classId, organizationId]
      ),
      pool.query(
        `SELECT t.id, t.teacher_id, t.full_name, t.email, t.subject, t.phone
         FROM class_teachers ct
         JOIN teachers t ON t.id = ct.teacher_id
         WHERE ct.class_id = $1 AND t.organization_id = $2
         ORDER BY t.full_name`,
        [classId, organizationId]
      ),
      pool.query(
        `SELECT s.id, s.name, s.code, s.description
         FROM class_subjects cs
         JOIN subjects s ON s.id = cs.subject_id
         WHERE cs.class_id = $1 AND s.organization_id = $2
         ORDER BY s.name`,
        [classId, organizationId]
      )
    ]);

    res.json({
      ...classResult.rows[0],
      students: students.rows,
      teachers: teachers.rows,
      subjects: subjects.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load class space." });
  }
};

module.exports = { getMyClasses, getMyClassDetails };
