const pool = require("../config/db");

const actor = (req) => ({
  role: req.user?.role,
  referenceId: req.user?.referenceId ?? req.user?.reference_id,
  organizationId: req.user?.organizationId ?? req.user?.organization_id,
});

async function classAccess(client, req, classId, write = false) {
  const a = actor(req);
  const result = await client.query("SELECT id, organization_id FROM classes WHERE id = $1", [classId]);
  if (!result.rows[0]) return { ok: false, code: 404, message: "Class not found." };
  const klass = result.rows[0];
  if (a.organizationId && Number(a.organizationId) !== Number(klass.organization_id)) return { ok: false, code: 403, message: "Access denied." };
  if (a.role === "organization") return { ok: true, klass };
  if (a.role === "teacher") {
    const r = await client.query("SELECT 1 FROM class_teachers WHERE class_id = $1 AND teacher_id = $2", [classId, a.referenceId]);
    return r.rows[0] ? { ok: true, klass } : { ok: false, code: 403, message: "You are not assigned to this class." };
  }
  if (a.role === "student") {
    const r = await client.query("SELECT 1 FROM students WHERE id = $1 AND class_id = $2", [a.referenceId, classId]);
    if (!r.rows[0]) return { ok: false, code: 403, message: "You are not enrolled in this class." };
    return write ? { ok: false, code: 403, message: "Students cannot modify class content." } : { ok: true, klass };
  }
  return { ok: false, code: 403, message: "Insufficient permissions." };
}

const listAnnouncements = async (req, res) => {
  const client = await pool.connect();
  try {
    const access = await classAccess(client, req, req.params.classId);
    if (!access.ok) return res.status(access.code).json({ message: access.message });
    const { rows } = await client.query(`SELECT a.*, t.name AS teacher_name FROM announcements a JOIN teachers t ON t.id = a.teacher_id WHERE a.class_id = $1 ORDER BY a.created_at DESC`, [req.params.classId]);
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load announcements." }); } finally { client.release(); }
};

const createAnnouncement = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = actor(req);
    if (a.role !== "teacher") return res.status(403).json({ message: "Only teachers can post announcements." });
    const { classId, title, body } = req.body;
    if (!classId || !title?.trim() || !body?.trim()) return res.status(400).json({ message: "Class, title and message are required." });
    const access = await classAccess(client, req, classId, true);
    if (!access.ok) return res.status(access.code).json({ message: access.message });
    const { rows } = await client.query(`INSERT INTO announcements (organization_id, class_id, teacher_id, title, body) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [access.klass.organization_id, classId, a.referenceId, title.trim(), body.trim()]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to create announcement." }); } finally { client.release(); }
};

const listResources = async (req, res) => {
  const client = await pool.connect();
  try {
    const access = await classAccess(client, req, req.params.classId);
    if (!access.ok) return res.status(access.code).json({ message: access.message });
    const { rows } = await client.query(`SELECT r.*, s.name AS subject_name, t.name AS teacher_name FROM resources r LEFT JOIN subjects s ON s.id = r.subject_id JOIN teachers t ON t.id = r.teacher_id WHERE r.class_id = $1 ORDER BY r.created_at DESC`, [req.params.classId]);
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load resources." }); } finally { client.release(); }
};

const createResource = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = actor(req);
    if (a.role !== "teacher") return res.status(403).json({ message: "Only teachers can add resources." });
    const { classId, subjectId, title, description, resourceType = "link", resourceUrl } = req.body;
    if (!classId || !title?.trim() || !resourceUrl?.trim()) return res.status(400).json({ message: "Class, title and resource URL are required." });
    const access = await classAccess(client, req, classId, true);
    if (!access.ok) return res.status(access.code).json({ message: access.message });
    if (subjectId) {
      const subject = await client.query("SELECT 1 FROM class_subjects WHERE class_id = $1 AND subject_id = $2", [classId, subjectId]);
      if (!subject.rows[0]) return res.status(400).json({ message: "Subject is not offered in this class." });
    }
    const { rows } = await client.query(`INSERT INTO resources (organization_id, class_id, subject_id, teacher_id, title, description, resource_type, resource_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [access.klass.organization_id, classId, subjectId || null, a.referenceId, title.trim(), description?.trim() || null, resourceType, resourceUrl.trim()]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to create resource." }); } finally { client.release(); }
};

module.exports = { listAnnouncements, createAnnouncement, listResources, createResource };
