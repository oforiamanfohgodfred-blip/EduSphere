const pool = require("../config/db");

const getTeacherId = (req) => Number(req.user?.reference_id);
const getOrganizationId = (req) => Number(req.user?.organization_id);

const verifyClassTeacher = async (client, teacherId, organizationId, classId) => {
  const result = await client.query(
    `SELECT c.id, c.organization_id, c.name
     FROM classes c
     JOIN class_teachers ct ON ct.class_id = c.id
     WHERE c.id=$1 AND c.organization_id=$2 AND ct.teacher_id=$3`,
    [classId, organizationId, teacherId]
  );
  return result.rows[0] || null;
};

const verifyClassSubject = async (client, classId, subjectId, organizationId) => {
  const result = await client.query(
    `SELECT s.id, s.name
     FROM class_subjects cs
     JOIN subjects s ON s.id=cs.subject_id
     WHERE cs.class_id=$1 AND cs.subject_id=$2 AND s.organization_id=$3`,
    [classId, subjectId, organizationId]
  );
  return result.rows[0] || null;
};

const createAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const { class_id, subject_id, title, instructions, due_at, max_score, status } = req.body;

    if (!teacherId || !organizationId || !class_id || !subject_id || !title) {
      return res.status(400).json({ message: "Class, subject and assignment title are required." });
    }

    await client.query("BEGIN");
    if (!await verifyClassTeacher(client, teacherId, organizationId, Number(class_id))) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "You are not assigned to this class." });
    }
    if (!await verifyClassSubject(client, Number(class_id), Number(subject_id), organizationId)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This subject is not assigned to the selected class." });
    }

    const result = await client.query(
      `INSERT INTO assignments
       (organization_id,class_id,subject_id,teacher_id,title,instructions,due_at,max_score,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [organizationId, Number(class_id), Number(subject_id), teacherId, title.trim(), instructions || null,
       due_at || null, Number(max_score) || 100, status || "published"]
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to create assignment." });
  } finally { client.release(); }
};

const getMyAssignments = async (req, res) => {
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT a.*, c.name AS class_name, c.code AS class_code, s.name AS subject_name,
              COUNT(asub.id)::int AS submission_count
       FROM assignments a
       JOIN classes c ON c.id=a.class_id
       JOIN subjects s ON s.id=a.subject_id
       LEFT JOIN assignment_submissions asub ON asub.assignment_id=a.id
       WHERE a.teacher_id=$1 AND a.organization_id=$2
       GROUP BY a.id,c.name,c.code,s.name
       ORDER BY a.created_at DESC`,
      [teacherId, organizationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load assignments." });
  }
};

const getClassAssignments = async (req, res) => {
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const classId = Number(req.params.classId);
    const access = await pool.query(
      `SELECT 1 FROM class_teachers ct JOIN classes c ON c.id=ct.class_id
       WHERE ct.teacher_id=$1 AND ct.class_id=$2 AND c.organization_id=$3`,
      [teacherId, classId, organizationId]
    );
    if (!access.rows.length) return res.status(403).json({ message: "You are not assigned to this class." });

    const result = await pool.query(
      `SELECT a.*, s.name AS subject_name,
              COUNT(asub.id)::int AS submission_count
       FROM assignments a JOIN subjects s ON s.id=a.subject_id
       LEFT JOIN assignment_submissions asub ON asub.assignment_id=a.id
       WHERE a.class_id=$1 AND a.organization_id=$2
       GROUP BY a.id,s.name ORDER BY a.created_at DESC`,
      [classId, organizationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load class assignments." });
  }
};

const createResource = async (req, res) => {
  const client = await pool.connect();
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const { class_id, subject_id, title, description, resource_url, resource_type } = req.body;
    if (!teacherId || !organizationId || !class_id || !title || !resource_url) {
      return res.status(400).json({ message: "Class, title and resource URL are required." });
    }
    await client.query("BEGIN");
    if (!await verifyClassTeacher(client, teacherId, organizationId, Number(class_id))) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "You are not assigned to this class." });
    }
    if (subject_id && !await verifyClassSubject(client, Number(class_id), Number(subject_id), organizationId)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This subject is not assigned to the selected class." });
    }
    const result = await client.query(
      `INSERT INTO class_resources
       (organization_id,class_id,subject_id,teacher_id,title,description,resource_url,resource_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [organizationId, Number(class_id), subject_id ? Number(subject_id) : null, teacherId,
       title.trim(), description || null, resource_url.trim(), resource_type || "link"]
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to create resource." });
  } finally { client.release(); }
};

const getClassResources = async (req, res) => {
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const classId = Number(req.params.classId);
    const access = await pool.query(
      `SELECT 1 FROM class_teachers ct JOIN classes c ON c.id=ct.class_id
       WHERE ct.teacher_id=$1 AND ct.class_id=$2 AND c.organization_id=$3`,
      [teacherId, classId, organizationId]
    );
    if (!access.rows.length) return res.status(403).json({ message: "You are not assigned to this class." });
    const result = await pool.query(
      `SELECT r.*, s.name AS subject_name, t.full_name AS teacher_name
       FROM class_resources r
       LEFT JOIN subjects s ON s.id=r.subject_id
       JOIN teachers t ON t.id=r.teacher_id
       WHERE r.class_id=$1 AND r.organization_id=$2 ORDER BY r.created_at DESC`,
      [classId, organizationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load resources." });
  }
};

const createAnnouncement = async (req, res) => {
  const client = await pool.connect();
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const { class_id, title, body } = req.body;
    if (!teacherId || !organizationId || !class_id || !title || !body) {
      return res.status(400).json({ message: "Class, title and announcement body are required." });
    }
    await client.query("BEGIN");
    if (!await verifyClassTeacher(client, teacherId, organizationId, Number(class_id))) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "You are not assigned to this class." });
    }
    const result = await client.query(
      `INSERT INTO class_announcements (organization_id,class_id,teacher_id,title,body)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [organizationId, Number(class_id), teacherId, title.trim(), body.trim()]
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to create announcement." });
  } finally { client.release(); }
};

const createLiveMeeting = async (req, res) => {
  const client = await pool.connect();
  try {
    const teacherId = getTeacherId(req);
    const organizationId = getOrganizationId(req);
    const { class_id, subject_id, title, meeting_url, starts_at, ends_at } = req.body;
    if (!teacherId || !organizationId || !class_id || !title || !meeting_url || !starts_at) {
      return res.status(400).json({ message: "Class, title, meeting URL and start time are required." });
    }
    await client.query("BEGIN");
    if (!await verifyClassTeacher(client, teacherId, organizationId, Number(class_id))) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "You are not assigned to this class." });
    }
    if (subject_id && !await verifyClassSubject(client, Number(class_id), Number(subject_id), organizationId)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This subject is not assigned to the selected class." });
    }
    const result = await client.query(
      `INSERT INTO live_meetings
       (organization_id,class_id,subject_id,teacher_id,title,meeting_url,starts_at,ends_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [organizationId, Number(class_id), subject_id ? Number(subject_id) : null, teacherId,
       title.trim(), meeting_url.trim(), starts_at, ends_at || null]
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to schedule live meeting." });
  } finally { client.release(); }
};

module.exports = {
  createAssignment,
  getMyAssignments,
  getClassAssignments,
  createResource,
  getClassResources,
  createAnnouncement,
  createLiveMeeting,
};
