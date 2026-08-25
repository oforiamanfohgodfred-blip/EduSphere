const pool = require("../config/db");

const organizationId = (req) => Number(req.user?.organization_id);

const getClasses = async (req, res) => {
  try {
    const orgId = organizationId(req);
    if (!orgId) return res.status(400).json({ message: "Organization context is required." });
    const result = await pool.query(
      `SELECT c.id, c.organization_id, c.name, c.code, c.description, c.academic_year, c.created_at,
              COUNT(DISTINCT s.id)::int AS student_count,
              COUNT(DISTINCT ct.teacher_id)::int AS teacher_count,
              COUNT(DISTINCT cs.subject_id)::int AS subject_count
       FROM classes c
       LEFT JOIN students s ON s.class_id = c.id
       LEFT JOIN class_teachers ct ON ct.class_id = c.id
       LEFT JOIN class_subjects cs ON cs.class_id = c.id
       WHERE c.organization_id = $1
       GROUP BY c.id
       ORDER BY c.name ASC`,
      [orgId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load classes." });
  }
};

const addClass = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const { name, code, description, academic_year } = req.body;
    if (!orgId) return res.status(400).json({ message: "Organization context is required." });
    if (!name || !code) return res.status(400).json({ message: "Class name and code are required." });
    const result = await pool.query(
      `INSERT INTO classes (organization_id, name, code, description, academic_year)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, organization_id, name, code, description, academic_year, created_at`,
      [orgId, name.trim(), code.trim().toUpperCase(), description || null, academic_year || null]
    );
    res.status(201).json({ ...result.rows[0], student_count: 0, teacher_count: 0, subject_count: 0 });
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ message: "A class with this name or code already exists." });
    console.error(error);
    res.status(500).json({ message: "Failed to add class." });
  }
};

const updateClass = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const { name, code, description, academic_year } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Class name and code are required." });
    const result = await pool.query(
      `UPDATE classes SET name=$1, code=$2, description=$3, academic_year=$4
       WHERE id=$5 AND organization_id=$6
       RETURNING id, organization_id, name, code, description, academic_year, created_at`,
      [name.trim(), code.trim().toUpperCase(), description || null, academic_year || null, req.params.id, orgId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Class not found." });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ message: "A class with this name or code already exists." });
    console.error(error);
    res.status(500).json({ message: "Failed to update class." });
  }
};

const getClassDetails = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const classResult = await pool.query(
      `SELECT id, organization_id, name, code, description, academic_year, created_at
       FROM classes WHERE id=$1 AND organization_id=$2`,
      [req.params.id, orgId]
    );
    if (!classResult.rows.length) return res.status(404).json({ message: "Class not found." });

    const [students, teachers, subjects] = await Promise.all([
      pool.query(
        `SELECT id, student_id, full_name, email, phone, gender, class_id
         FROM students WHERE class_id=$1 AND organization_id=$2 ORDER BY full_name`,
        [req.params.id, orgId]
      ),
      pool.query(
        `SELECT t.id, t.teacher_id, t.full_name, t.email, t.subject, t.phone
         FROM class_teachers ct JOIN teachers t ON t.id=ct.teacher_id
         WHERE ct.class_id=$1 AND t.organization_id=$2 ORDER BY t.full_name`,
        [req.params.id, orgId]
      ),
      pool.query(
        `SELECT s.id, s.name, s.code, s.description
         FROM class_subjects cs JOIN subjects s ON s.id=cs.subject_id
         WHERE cs.class_id=$1 AND s.organization_id=$2 ORDER BY s.name`,
        [req.params.id, orgId]
      )
    ]);

    res.json({ ...classResult.rows[0], students: students.rows, teachers: teachers.rows, subjects: subjects.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load class details." });
  }
};

const replaceClassTeachers = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orgId = organizationId(req);
    const teacherIds = Array.isArray(req.body.teacher_ids) ? req.body.teacher_ids.map(Number).filter(Boolean) : [];
    const valid = await client.query("SELECT id FROM teachers WHERE organization_id=$1 AND id=ANY($2::int[])", [orgId, teacherIds]);
    if (valid.rows.length !== teacherIds.length) { await client.query("ROLLBACK"); return res.status(400).json({ message: "One or more teachers are invalid for this organization." }); }
    await client.query("DELETE FROM class_teachers WHERE class_id=$1", [req.params.id]);
    for (const teacherId of teacherIds) await client.query("INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1,$2)", [req.params.id, teacherId]);
    await client.query("COMMIT");
    res.json({ message: "Class teachers updated successfully." });
  } catch (error) { await client.query("ROLLBACK"); console.error(error); res.status(500).json({ message: "Failed to update class teachers." }); }
  finally { client.release(); }
};

const replaceClassSubjects = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orgId = organizationId(req);
    const subjectIds = Array.isArray(req.body.subject_ids) ? req.body.subject_ids.map(Number).filter(Boolean) : [];
    const valid = await client.query("SELECT id FROM subjects WHERE organization_id=$1 AND id=ANY($2::int[])", [orgId, subjectIds]);
    if (valid.rows.length !== subjectIds.length) { await client.query("ROLLBACK"); return res.status(400).json({ message: "One or more subjects are invalid for this organization." }); }
    await client.query("DELETE FROM class_subjects WHERE class_id=$1", [req.params.id]);
    for (const subjectId of subjectIds) await client.query("INSERT INTO class_subjects (class_id, subject_id) VALUES ($1,$2)", [req.params.id, subjectId]);
    await client.query("COMMIT");
    res.json({ message: "Class subjects updated successfully." });
  } catch (error) { await client.query("ROLLBACK"); console.error(error); res.status(500).json({ message: "Failed to update class subjects." }); }
  finally { client.release(); }
};

const deleteClass = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const result = await pool.query("DELETE FROM classes WHERE id=$1 AND organization_id=$2 RETURNING id", [req.params.id, orgId]);
    if (!result.rows.length) return res.status(404).json({ message: "Class not found." });
    res.json({ message: "Class deleted successfully." });
  } catch (error) { console.error(error); res.status(500).json({ message: "Failed to delete class." }); }
};

module.exports = { getClasses, addClass, updateClass, getClassDetails, replaceClassTeachers, replaceClassSubjects, deleteClass };
