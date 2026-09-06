const pool = require("../config/db");

const getActor = (req) => ({
  role: req.user?.role,
  referenceId: req.user?.referenceId ?? req.user?.reference_id,
  organizationId: req.user?.organizationId ?? req.user?.organization_id,
});

const submitAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (a.role !== "student") return res.status(403).json({ message: "Only students can submit assignments." });
    const assignmentId = Number(req.params.assignmentId);
    const { submissionText = "" } = req.body;
    if (!Number.isInteger(assignmentId) || assignmentId < 1) return res.status(400).json({ message: "Invalid assignment." });
    if (typeof submissionText !== "string") return res.status(400).json({ message: "Submission must be text." });

    const assignment = await client.query(
      `SELECT a.id, a.class_id, a.status, a.due_at
       FROM assignments a
       JOIN students s ON s.class_id = a.class_id AND s.id = $2
       WHERE a.id = $1`,
      [assignmentId, a.referenceId]
    );
    if (!assignment.rows[0]) return res.status(404).json({ message: "Assignment not found or unavailable." });
    if (assignment.rows[0].status !== "published") return res.status(400).json({ message: "This assignment is not accepting submissions." });

    const { rows } = await client.query(
      `INSERT INTO submissions (assignment_id, student_id, submission_text, submitted_at, status)
       VALUES ($1,$2,$3,CURRENT_TIMESTAMP,'submitted')
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET submission_text = EXCLUDED.submission_text, submitted_at = CURRENT_TIMESTAMP, status = 'submitted'
       RETURNING *`,
      [assignmentId, a.referenceId, submissionText.trim()]
    );
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to submit assignment." }); } finally { client.release(); }
};

const listMySubmissions = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (a.role !== "student") return res.status(403).json({ message: "Only students can view their submissions here." });
    const { rows } = await client.query(
      `SELECT s.*, a.title, a.max_marks, g.marks, g.feedback, g.graded_at
       FROM submissions s JOIN assignments a ON a.id = s.assignment_id
       LEFT JOIN grades g ON g.submission_id = s.id
       WHERE s.student_id = $1 ORDER BY s.submitted_at DESC NULLS LAST`,
      [a.referenceId]
    );
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load submissions." }); } finally { client.release(); }
};

const listClassSubmissions = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (a.role !== "teacher") return res.status(403).json({ message: "Only teachers can view class submissions." });
    const classId = Number(req.params.classId);
    if (!Number.isInteger(classId) || classId < 1) return res.status(400).json({ message: "Invalid class." });
    const assigned = await client.query(
      `SELECT 1 FROM classes c JOIN class_teachers ct ON ct.class_id = c.id
       WHERE c.id = $1 AND ct.teacher_id = $2 AND ($3::int IS NULL OR c.organization_id = $3)`,
      [classId, a.referenceId, a.organizationId ? Number(a.organizationId) : null]
    );
    if (!assigned.rows[0]) return res.status(403).json({ message: "You are not assigned to this class." });
    const { rows } = await client.query(
      `SELECT s.id AS submission_id, s.assignment_id, s.student_id, st.name AS student_name,
              st.student_id AS student_code, s.submission_text, s.submitted_at, s.status,
              a.title AS assignment_title, a.max_marks, g.marks, g.feedback, g.graded_at
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       JOIN students st ON st.id = s.student_id
       LEFT JOIN grades g ON g.submission_id = s.id
       WHERE a.class_id = $1
       ORDER BY s.submitted_at DESC NULLS LAST, st.name`,
      [classId]
    );
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load class submissions." }); } finally { client.release(); }
};

const gradeSubmission = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (a.role !== "teacher") return res.status(403).json({ message: "Only teachers can grade submissions." });
    const submissionId = Number(req.params.submissionId);
    const marks = Number(req.body.marks);
    if (!Number.isInteger(submissionId) || !Number.isFinite(marks) || marks < 0) return res.status(400).json({ message: "Valid submission and marks are required." });
    const submission = await client.query(
      `SELECT s.id, a.max_marks, a.class_id FROM submissions s JOIN assignments a ON a.id = s.assignment_id
       JOIN class_teachers ct ON ct.class_id = a.class_id AND ct.teacher_id = $2 WHERE s.id = $1`,
      [submissionId, a.referenceId]
    );
    if (!submission.rows[0]) return res.status(404).json({ message: "Submission not found or not assigned to you." });
    if (marks > Number(submission.rows[0].max_marks)) return res.status(400).json({ message: "Marks cannot exceed the assignment maximum." });
    const { rows } = await client.query(
      `INSERT INTO grades (submission_id, teacher_id, marks, feedback) VALUES ($1,$2,$3,$4)
       ON CONFLICT (submission_id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, marks = EXCLUDED.marks, feedback = EXCLUDED.feedback, graded_at = CURRENT_TIMESTAMP RETURNING *`,
      [submissionId, a.referenceId, marks, req.body.feedback?.trim() || null]
    );
    res.json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to grade submission." }); } finally { client.release(); }
};

module.exports = { submitAssignment, listMySubmissions, listClassSubmissions, gradeSubmission };
