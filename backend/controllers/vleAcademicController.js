const pool = require("../config/db");
const { notifyClassUsers } = require("../utils/notificationService");

const actor = (req) => ({ role: req.user?.role, userId: req.user?.userId || req.user?.id, referenceId: req.user?.referenceId ?? req.user?.reference_id, organizationId: req.user?.organizationId ?? req.user?.organization_id });

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
    const { rows } = await client.query(`SELECT t.*, s.name AS subject_name, tr.full_name AS teacher_name FROM timetables t LEFT JOIN subjects s ON s.id=t.subject_id LEFT JOIN teachers tr ON tr.id=t.teacher_id WHERE t.class_id=$1 ORDER BY t.day_of_week, t.start_time`, [req.params.classId]);
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load timetable." }); } finally { client.release(); }
};

const createTimetable = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = actor(req);
    if (!["teacher", "organization"].includes(a.role)) return res.status(403).json({ message: "You cannot manage the timetable." });
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;
    if (!classId || !dayOfWeek || !startTime || !endTime) return res.status(400).json({ message: "Class, day and times are required." });
    const allowed = await access(client, req, classId, true);
    if (!allowed.ok) return res.status(allowed.code).json({ message: allowed.message });
    const day = Number(dayOfWeek);
    if (!Number.isInteger(day) || day < 1 || day > 7) return res.status(400).json({ message: "Day of week must be between 1 and 7." });
    const timePattern = /^([01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?$/;
    if (!timePattern.test(startTime) || !timePattern.test(endTime) || startTime >= endTime) return res.status(400).json({ message: "Start and end times must be valid, with the end time after the start time." });
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
    const classConflict = await client.query(`SELECT id FROM timetables WHERE organization_id=$1 AND class_id=$2 AND day_of_week=$3 AND start_time < $5::time AND end_time > $4::time LIMIT 1`, [allowed.klass.organization_id, classId, day, startTime, endTime]);
    if (classConflict.rows[0]) return res.status(409).json({ message: "This class already has a timetable entry during that time." });
    if (selectedTeacher) {
      const teacherConflict = await client.query(`SELECT id FROM timetables WHERE organization_id=$1 AND teacher_id=$2 AND day_of_week=$3 AND start_time < $5::time AND end_time > $4::time LIMIT 1`, [allowed.klass.organization_id, selectedTeacher, day, startTime, endTime]);
      if (teacherConflict.rows[0]) return res.status(409).json({ message: "This teacher is already scheduled during that time." });
    }
    const { rows } = await client.query(`INSERT INTO timetables (organization_id,class_id,subject_id,teacher_id,day_of_week,start_time,end_time,room) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [allowed.klass.organization_id,classId,subjectId||null,selectedTeacher,day,startTime,endTime,room?.trim()||null]);
    res.status(201).json(rows[0]);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to create timetable entry." }); } finally { client.release(); }
};

const listExams = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = await access(client, req, req.params.classId);
    if (!a.ok) return res.status(a.code).json({ message: a.message });
    const { rows } = await client.query(`SELECT e.*, s.name AS subject_name, t.full_name AS teacher_name FROM exams e LEFT JOIN subjects s ON s.id=e.subject_id LEFT JOIN teachers t ON t.id=e.teacher_id WHERE e.class_id=$1 ORDER BY e.starts_at`, [req.params.classId]);
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load exams." }); } finally { client.release(); }
};

const createExam = async (req, res) => {
  const client = await pool.connect();
  try {
    const a = actor(req);
    if (!["teacher", "organization"].includes(a.role)) return res.status(403).json({ message: "You cannot create exams." });
    const { classId, subjectId, teacherId, title, description, startsAt, durationMinutes, maxMarks = 100 } = req.body;
    if (!classId || !title?.trim() || !startsAt || !durationMinutes) return res.status(400).json({ message: "Class, title, start time and duration are required." });
    const allowed = await access(client, req, classId, true);
    if (!allowed.ok) return res.status(allowed.code).json({ message: allowed.message });
    if (subjectId) {
      const r = await client.query("SELECT 1 FROM class_subjects WHERE class_id=$1 AND subject_id=$2", [classId, subjectId]);
      if (!r.rows[0]) return res.status(400).json({ message: "Subject is not assigned to this class." });
    }
    const selectedTeacher = a.role === "teacher" ? a.referenceId : (teacherId || null);
    if (selectedTeacher) {
      const r = await client.query("SELECT 1 FROM class_teachers WHERE class_id=$1 AND teacher_id=$2", [classId, selectedTeacher]);
      if (!r.rows[0]) return res.status(400).json({ message: "Teacher is not assigned to this class." });
    }
    const parsedDuration = Number(durationMinutes);
    const parsedMaxMarks = Number(maxMarks);
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) return res.status(400).json({ message: "Exam duration must be a positive whole number of minutes." });
    if (!Number.isFinite(parsedMaxMarks) || parsedMaxMarks <= 0) return res.status(400).json({ message: "Maximum marks must be greater than zero." });
    if (Number.isNaN(Date.parse(startsAt))) return res.status(400).json({ message: "Exam start time is invalid." });
    const { rows } = await client.query(`INSERT INTO exams (organization_id,class_id,subject_id,teacher_id,title,description,starts_at,duration_minutes,max_marks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [allowed.klass.organization_id,classId,subjectId||null,selectedTeacher,title.trim(),description?.trim()||null,startsAt,parsedDuration,parsedMaxMarks]);
    const exam = rows[0];
    await notifyClassUsers(client, {
      organizationId: allowed.klass.organization_id,
      classId,
      type: "exam_created",
      title: `New exam: ${exam.title}`,
      body: `An exam has been scheduled for ${new Date(exam.starts_at).toLocaleString()} (${exam.duration_minutes} minutes).`,
      link: `/student/exams`,
      excludeUserId: a.userId,
    });
    res.status(201).json(exam);
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to create exam." }); } finally { client.release(); }
};

module.exports = { listTimetable, createTimetable, listExams, createExam };
