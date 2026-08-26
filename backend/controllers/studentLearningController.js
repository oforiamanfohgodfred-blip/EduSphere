const pool = require("../config/db");

const getStudentId = (req) => Number(req.user?.reference_id);
const getOrganizationId = (req) => Number(req.user?.organization_id);

const getStudentContext = async (studentId, organizationId) => {
  const result = await pool.query(
    `SELECT id, organization_id, class_id, full_name
     FROM students WHERE id=$1 AND organization_id=$2`,
    [studentId, organizationId]
  );
  return result.rows[0] || null;
};

const getMyLearningSpace = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    const organizationId = getOrganizationId(req);
    const student = await getStudentContext(studentId, organizationId);
    if (!student || !student.class_id) return res.status(404).json({ message: "Student class not found." });

    const [classResult, students, teachers, subjects, assignments, resources, announcements, meetings] = await Promise.all([
      pool.query(
        `SELECT c.id, c.name, c.code, c.description, c.academic_year
         FROM classes c WHERE c.id=$1 AND c.organization_id=$2`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT id, student_id, full_name, email
         FROM students WHERE class_id=$1 AND organization_id=$2 ORDER BY full_name`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT t.id, t.teacher_id, t.full_name, t.subject
         FROM class_teachers ct
         JOIN teachers t ON t.id=ct.teacher_id
         WHERE ct.class_id=$1 AND t.organization_id=$2 ORDER BY t.full_name`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT s.id, s.name, s.code, s.description
         FROM class_subjects cs
         JOIN subjects s ON s.id=cs.subject_id
         WHERE cs.class_id=$1 AND s.organization_id=$2 ORDER BY s.name`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT a.id, a.title, a.instructions, a.due_at, a.max_score, a.status,
                a.created_at, s.name AS subject_name, t.full_name AS teacher_name
         FROM assignments a
         JOIN subjects s ON s.id=a.subject_id
         JOIN teachers t ON t.id=a.teacher_id
         WHERE a.class_id=$1 AND a.organization_id=$2 AND a.status='published'
         ORDER BY a.due_at NULLS LAST, a.created_at DESC`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT r.id, r.title, r.description, r.resource_url, r.resource_type,
                r.created_at, s.name AS subject_name, t.full_name AS teacher_name
         FROM class_resources r
         LEFT JOIN subjects s ON s.id=r.subject_id
         JOIN teachers t ON t.id=r.teacher_id
         WHERE r.class_id=$1 AND r.organization_id=$2 ORDER BY r.created_at DESC`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT a.id, a.title, a.body, a.created_at, t.full_name AS teacher_name
         FROM class_announcements a JOIN teachers t ON t.id=a.teacher_id
         WHERE a.class_id=$1 AND a.organization_id=$2 ORDER BY a.created_at DESC`,
        [student.class_id, organizationId]
      ),
      pool.query(
        `SELECT m.id, m.title, m.meeting_url, m.starts_at, m.ends_at, m.status,
                s.name AS subject_name, t.full_name AS teacher_name
         FROM live_meetings m
         LEFT JOIN subjects s ON s.id=m.subject_id
         JOIN teachers t ON t.id=m.teacher_id
         WHERE m.class_id=$1 AND m.organization_id=$2 AND m.status <> 'cancelled'
         ORDER BY m.starts_at ASC`,
        [student.class_id, organizationId]
      )
    ]);

    res.json({
      student,
      class: classResult.rows[0] || null,
      students: students.rows,
      teachers: teachers.rows,
      subjects: subjects.rows,
      assignments: assignments.rows,
      resources: resources.rows,
      announcements: announcements.rows,
      live_meetings: meetings.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load your learning space." });
  }
};

const getAssignment = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT a.id, a.class_id, a.subject_id, a.title, a.instructions, a.due_at,
              a.max_score, a.status, a.created_at, s.name AS subject_name,
              t.full_name AS teacher_name, sub.id AS submission_id,
              sub.answer_text, sub.attachment_url, sub.submitted_at, sub.score, sub.feedback, sub.graded_at
       FROM assignments a
       JOIN students st ON st.class_id=a.class_id AND st.id=$1
       JOIN subjects s ON s.id=a.subject_id
       JOIN teachers t ON t.id=a.teacher_id
       LEFT JOIN assignment_submissions sub ON sub.assignment_id=a.id AND sub.student_id=$1
       WHERE a.id=$2 AND a.organization_id=$3 AND a.status='published'`,
      [studentId, Number(req.params.id), organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Assignment not found." });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load assignment." });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    const organizationId = getOrganizationId(req);
    const { answer_text, attachment_url } = req.body;
    const assignment = await pool.query(
      `SELECT a.id FROM assignments a JOIN students st ON st.class_id=a.class_id
       WHERE a.id=$1 AND st.id=$2 AND a.organization_id=$3 AND a.status='published'`,
      [Number(req.params.id), studentId, organizationId]
    );
    if (!assignment.rows.length) return res.status(404).json({ message: "Assignment not found for your class." });
    if (!answer_text && !attachment_url) return res.status(400).json({ message: "Provide an answer or attachment." });

    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id,student_id,answer_text,attachment_url)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (assignment_id,student_id)
       DO UPDATE SET answer_text=EXCLUDED.answer_text,
                     attachment_url=EXCLUDED.attachment_url,
                     submitted_at=CURRENT_TIMESTAMP
       RETURNING *`,
      [Number(req.params.id), studentId, answer_text || null, attachment_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit assignment." });
  }
};

module.exports = { getMyLearningSpace, getAssignment, submitAssignment };
