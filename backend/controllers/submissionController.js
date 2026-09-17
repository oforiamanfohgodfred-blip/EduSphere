const pool = require("../config/db");
const { notifyUser } = require("../utils/notificationService");

const getActor = (req) => ({
  userId: req.user?.userId || req.user?.id,
  role: req.user?.role,
  referenceId: req.user?.referenceId ?? req.user?.reference_id,
  organizationId: req.user?.organizationId ?? req.user?.organization_id,
});

const requireStudentContext = (actor) => (
  actor.role === "student" && Number.isInteger(Number(actor.referenceId)) && Number.isInteger(Number(actor.organizationId))
);

const requireTeacherContext = (actor) => (
  actor.role === "teacher" && Number.isInteger(Number(actor.referenceId)) && Number.isInteger(Number(actor.organizationId))
);

const submitAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (!requireStudentContext(a)) return res.status(403).json({ message: "Only authenticated students can submit assignments." });
    const assignmentId = Number(req.params.assignmentId);
    const { submissionText = "" } = req.body;
    if (!Number.isInteger(assignmentId) || assignmentId < 1) return res.status(400).json({ message: "Invalid assignment." });
    if (typeof submissionText !== "string") return res.status(400).json({ message: "Submission must be text." });

    const assignment = await client.query(
      `SELECT a.id, a.class_id, a.status, a.due_at, a.organization_id
       FROM assignments a
       JOIN students s ON s.class_id = a.class_id AND s.id = $2 AND s.organization_id = $3
       WHERE a.id = $1 AND a.organization_id = $3`,
      [assignmentId, Number(a.referenceId), Number(a.organizationId)]
    );
    if (!assignment.rows[0]) return res.status(404).json({ message: "Assignment not found or unavailable." });
    if (assignment.rows[0].status !== "published") return res.status(400).json({ message: "This assignment is not accepting submissions." });
    if (!submissionText.trim()) return res.status(400).json({ message: "Submission cannot be empty." });

    const { rows } = await client.query(
      `INSERT INTO submissions (assignment_id, student_id, submission_text, submitted_at, status)
       VALUES ($1,$2,$3,CURRENT_TIMESTAMP,'submitted')
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET submission_text = EXCLUDED.submission_text, submitted_at = CURRENT_TIMESTAMP, status = 'submitted'
       RETURNING *`,
      [assignmentId, Number(a.referenceId), submissionText.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to submit assignment." }); } finally { client.release(); }
};

const listMySubmissions = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (!requireStudentContext(a)) return res.status(403).json({ message: "Only authenticated students can view their submissions here." });
    const { rows } = await client.query(
      `SELECT s.*, a.title, a.max_marks, g.marks, g.feedback, g.graded_at
       FROM submissions s JOIN assignments a ON a.id = s.assignment_id
       LEFT JOIN grades g ON g.submission_id = s.id
       WHERE s.student_id = $1 AND a.organization_id = $2
       ORDER BY s.submitted_at DESC NULLS LAST`,
      [Number(a.referenceId), Number(a.organizationId)]
    );
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load submissions." }); } finally { client.release(); }
};

const listClassSubmissions = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (!requireTeacherContext(a)) return res.status(403).json({ message: "Only authenticated teachers can view class submissions." });
    const classId = Number(req.params.classId);
    if (!Number.isInteger(classId) || classId < 1) return res.status(400).json({ message: "Invalid class." });
    const assigned = await client.query(
      `SELECT 1 FROM classes c JOIN class_teachers ct ON ct.class_id = c.id
       WHERE c.id = $1 AND ct.teacher_id = $2 AND c.organization_id = $3`,
      [classId, Number(a.referenceId), Number(a.organizationId)]
    );
    if (!assigned.rows[0]) return res.status(403).json({ message: "You are not assigned to this class." });
    const { rows } = await client.query(
      `SELECT s.id AS submission_id, s.assignment_id, s.student_id, st.full_name AS student_name,
              st.student_id AS student_code, s.submission_text, s.submitted_at, s.status,
              a.title AS assignment_title, a.max_marks, g.marks, g.feedback, g.graded_at
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       JOIN students st ON st.id = s.student_id
       LEFT JOIN grades g ON g.submission_id = s.id
       WHERE a.class_id = $1 AND a.organization_id = $2 AND st.organization_id = $2
       ORDER BY s.submitted_at DESC NULLS LAST, st.full_name`,
      [classId, Number(a.organizationId)]
    );
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load class submissions." }); } finally { client.release(); }
};

const gradeSubmission = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = getActor(req);
    if (!requireTeacherContext(a)) return res.status(403).json({ message: "Only authenticated teachers can grade submissions." });
    const submissionId = Number(req.params.submissionId);
    const marks = Number(req.body.marks);
    if (!Number.isInteger(submissionId) || !Number.isFinite(marks) || marks < 0) return res.status(400).json({ message: "Valid submission and marks are required." });
    const submission = await client.query(
      `SELECT s.id, s.student_id, a.max_marks, a.class_id, a.organization_id
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       JOIN class_teachers ct ON ct.class_id = a.class_id AND ct.teacher_id = $2
       WHERE s.id = $1 AND a.organization_id = $3`,
      [submissionId, Number(a.referenceId), Number(a.organizationId)]
    );
    if (!submission.rows[0]) return res.status(404).json({ message: "Submission not found or not assigned to you." });
    if (marks > Number(submission.rows[0].max_marks)) return res.status(400).json({ message: "Marks cannot exceed the assignment maximum." });
    const { rows } = await client.query(
      `INSERT INTO grades (submission_id, teacher_id, marks, feedback) VALUES ($1,$2,$3,$4)
       ON CONFLICT (submission_id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, marks = EXCLUDED.marks, feedback = EXCLUDED.feedback, graded_at = CURRENT_TIMESTAMP RETURNING *`,
      [submissionId, Number(a.referenceId), marks, req.body.feedback?.trim() || null]
    );

    const studentUser = await client.query(
      `SELECT id FROM users WHERE role = 'student' AND reference_id = $1 AND organization_id = $2 AND is_active = true`,
      [submission.rows[0].student_id, submission.rows[0].organization_id]
    );
    if (studentUser.rows[0]) {
      await notifyUser(client, {
        organizationId: submission.rows[0].organization_id,
        userId: studentUser.rows[0].id,
        type: "grade_returned",
        title: "Assignment graded",
        body: `Your submission has been graded: ${marks}/${submission.rows[0].max_marks}.`,
        link: "/student/grades",
      });
    }

    res.json(rows[0]);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to grade submission." }); } finally { client.release(); }
};

module.exports = { submitAssignment, listMySubmissions, listClassSubmissions, gradeSubmission };
