const pool = require("../config/db");

const getActor = (req) => ({
  userId: req.user?.userId || req.user?.id,
  role: req.user?.role,
  referenceId: req.user?.referenceId || req.user?.reference_id,
  organizationId: req.user?.organizationId || req.user?.organization_id,
});

const getTeacherClassIds = async (client, teacherId) => {
  const { rows } = await client.query(
    "SELECT class_id FROM class_teachers WHERE teacher_id = $1",
    [teacherId]
  );
  return rows.map((row) => row.class_id);
};

const requireClassAccess = async (client, req, classId, write = false) => {
  const actor = getActor(req);
  const classResult = await client.query(
    "SELECT id, organization_id FROM classes WHERE id = $1",
    [classId]
  );
  if (!classResult.rows[0]) return { ok: false, status: 404, message: "Class not found." };

  const klass = classResult.rows[0];
  if (actor.organizationId && Number(klass.organization_id) !== Number(actor.organizationId)) {
    return { ok: false, status: 403, message: "You cannot access another organization." };
  }

  if (actor.role === "organization") return { ok: !write || true, klass };

  if (actor.role === "teacher") {
    const assigned = await client.query(
      "SELECT 1 FROM class_teachers WHERE class_id = $1 AND teacher_id = $2",
      [classId, actor.referenceId]
    );
    if (!assigned.rows[0]) return { ok: false, status: 403, message: "You are not assigned to this class." };
    return { ok: true, klass };
  }

  if (actor.role === "student") {
    const enrolled = await client.query(
      "SELECT 1 FROM students WHERE id = $1 AND class_id = $2",
      [actor.referenceId, classId]
    );
    if (!enrolled.rows[0]) return { ok: false, status: 403, message: "You are not enrolled in this class." };
    return { ok: !write, status: write ? 403 : undefined, message: write ? "Students cannot modify class content." : undefined, klass };
  }

  return { ok: false, status: 403, message: "Insufficient permissions." };
};

const listClassAssignments = async (req, res) => {
  const client = await pool.connect();
  try {
    const access = await requireClassAccess(client, req, req.params.classId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const { rows } = await client.query(
      `SELECT a.*, s.name AS subject_name, t.name AS teacher_name
       FROM assignments a
       LEFT JOIN subjects s ON s.id = a.subject_id
       JOIN teachers t ON t.id = a.teacher_id
       WHERE a.class_id = $1 AND a.status <> 'draft'
       ORDER BY a.due_at NULLS LAST, a.created_at DESC`,
      [req.params.classId]
    );
    res.json(rows);
  } catch (error) { res.status(500).json({ message: "Unable to load assignments." }); }
  finally { client.release(); }
};

const createAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const actor = getActor(req);
    if (actor.role !== "teacher") return res.status(403).json({ message: "Only teachers can create assignments." });
    const { classId, subjectId, title, instructions, maxMarks, dueAt, status = "draft" } = req.body;
    if (!classId || !title?.trim()) return res.status(400).json({ message: "Class and title are required." });
    const access = await requireClassAccess(client, req, classId, true);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    if (subjectId) {
      const subject = await client.query(
        `SELECT 1 FROM class_subjects WHERE class_id = $1 AND subject_id = $2`,
        [classId, subjectId]
      );
      if (!subject.rows[0]) return res.status(400).json({ message: "Subject is not offered in this class." });
    }

    const { rows } = await client.query(
      `INSERT INTO assignments (organization_id, class_id, subject_id, teacher_id, title, instructions, max_marks, due_at, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [access.klass.organization_id, classId, subjectId || null, actor.referenceId, title.trim(), instructions?.trim() || null, Number(maxMarks) || 100, dueAt || null, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ message: "Unable to create assignment." }); }
  finally { client.release(); }
};

module.exports = { listClassAssignments, createAssignment, getTeacherClassIds };
