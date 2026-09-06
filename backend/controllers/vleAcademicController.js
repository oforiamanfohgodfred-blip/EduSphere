const pool = require("../config/db");

const actor = (req) => ({ role: req.user?.role, referenceId: req.user?.referenceId ?? req.user?.reference_id, organizationId: req.user?.organizationId ?? req.user?.organization_id });

async function access(client, req, classId, write = false) {
  const a = actor(req);
  const c = await client.query("SELECT id, organization_id FROM classes WHERE id = $1", [classId]);
  if (!c.rows[0]) return { ok: false, code: 404, message: "Class not found." };
  const klass = c.rows[0];
  if (a.organizationId && Number(a.organizationId) !== Number(klass.organization_id)) return { ok: false, code: 403, message: "Access denied." };
  if (a.role === "organization") return { ok: true, klass };
  if (a.role === "teacher") {
    const r = await client.query("SELECT 1 FROM class_teachers WHERE class_id = $1 AND teacher_id = $2", [classId, a.referenceId]);
    return r.rows[0] ? { ok: true, klass } : { ok: false, code: 403, message: "You are not assigned to this class." };
  }
  if (a.role === "student") {
    const r = await client.query("SELECT 1 FROM students WHERE id = $1 AND class_id = $2", [a.referenceId, classId]);
    if (!r.rows[0]) return { ok: false, code: 403, message: "You are not enrolled in this class." };
    return write ? { ok: false, code: 403, message: "Students cannot modify academic schedules." } : { ok: true, klass };
  }
  return { ok: false, code: 403, message: "Insufficient permissions." };
}

const listTimetable = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = await access(client, req, req.params.classId);
    if (!a.ok) return res.status(a.code).json({ message: a.message });
    const { rows } = await client.query(`SELECT t.*, s.name AS subject_name, tr.name AS teacher_name FROM timetables t LEFT JOIN subjects s ON s.id=t.subject_id LEFT JOIN teachers tr ON tr.id=t.teacher_id WHERE t.class_id=$1 ORDER BY t.day_of_week, t.start_time`, [req.params.classId]);
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load timetable." }); } finally { client.release(); }
};

const createTimetable = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = actor(req);
    if (!["teacher", "organization"].includes(a.role)) return res.status(403).json({ message: "You cannot manage the timetable." });
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;
    const allowed = await access(client, req, classId, true);
    if (!allowed.ok) return res.status(allowed.code).json({ message: allowed.message });
    if (!classId || !dayOfWeek || !startTime || !endTime) return res.status(400).json({ message: "Class, day and times are required." });
    if (subjectId) {
      const r = await client.query("SELECT 1 FROM class_subjects WHERE class_id=$1 AND subject_id=$2", [classId, subjectId]);
      if (!r.rows[0]) return res.status(400).json({ message: "Subject is not assigned to this class." });
    }
    if (a.role === "teacher" && teacherId && Number(teacherId) !== Number(a.referenceId)) return res.status(403).json({ message: "Teachers can only create entries for themselves." });
    const selectedTeacher = a.role === "teacher" ? a.referenceId : (teacherId || null);
    if (selectedTeacher) {
      const r = await client.query("SELECT 1 FROM class_teachers WHERE class_id=$1 AND teacher_id=$2", [classId, selectedTeacher]);
      if (!r.rows[0]) return res.status(400).json({ message: "Teacher is not assigned to this class." });
    }
    const { rows } = await client.query(`INSERT INTO timetables (organization_id,class_id,subject_id,teacher_id,day_of_week,start_time,end_time,room) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [allowed.klass.organization_id,classId,subjectId||null,selectedTeacher,dayOfWeek,startTime,endTime,room?.trim()||null]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to create timetable entry." }); } finally { client.release(); }
};

const listExams = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = await access(client, req, req.params.classId);
    if (!a.ok) return res.status(a.code).json({ message: a.message });
    const { rows } = await client.query(`SELECT e.*, s.name AS subject_name, t.name AS teacher_name FROM exams e LEFT JOIN subjects s ON s.id=e.subject_id LEFT JOIN teachers t ON t.id=e.teacher_id WHERE e.class_id=$1 ORDER BY e.starts_at`, [req.params.classId]);
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load exams." }); } finally { client.release(); }
};

const createExam = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = actor(req);
    if (!["teacher", "organization"].includes(a.role)) return res.status(403).json({ message: "You cannot create exams." });
    const { classId, subjectId, teacherId, title, description, startsAt, durationMinutes, maxMarks = 100 } = req.body;
    const allowed = await access(client, req, classId, true);
    if (!allowed.ok) return res.status(allowed.code).json({ message: allowed.message });
    if (!classId || !title?.trim() || !startsAt || !durationMinutes) return res.status(400).json({ message: "Class, title, start time and duration are required." });
    if (subjectId) {
      const r = await client.query("SELECT 1 FROM class_subjects WHERE class_id=$1 AND subject_id=$2", [classId, subjectId]);
      if (!r.rows[0]) return res.status(400).json({ message: "Subject is not assigned to this class." });
    }
    const selectedTeacher = a.role === "teacher" ? a.referenceId : (teacherId || null);
    if (selectedTeacher) {
      const r = await client.query("SELECT 1 FROM class_teachers WHERE class_id=$1 AND teacher_id=$2", [classId, selectedTeacher]);
      if (!r.rows[0]) return res.status(400).json({ message: "Teacher is not assigned to this class." });
    }
    const { rows } = await client.query(`INSERT INTO exams (organization_id,class_id,subject_id,teacher_id,title,description,starts_at,duration_minutes,max_marks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [allowed.klass.organization_id,classId,subjectId||null,selectedTeacher,title.trim(),description?.trim()||null,startsAt,Number(durationMinutes),Number(maxMarks)||100]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to create exam." }); } finally { client.release(); }
};

module.exports = { listTimetable, createTimetable, listExams, createExam };
