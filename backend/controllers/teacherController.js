const pool = require("../config/db");

const getOrganizationId = (req) => Number(req.user?.organization_id);
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const validateTeacherSubject = async (client, organizationId, subject) => {
  const value = String(subject || "").trim();
  if (!value) return null;
  const result = await client.query(
    "SELECT name FROM subjects WHERE organization_id=$1 AND LOWER(name)=LOWER($2)",
    [organizationId, value]
  );
  return result.rows[0]?.name || null;
};

const getTeachers = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    if (!organizationId) return res.status(400).json({ message: "Organization context is required." });
    const result = await pool.query(
      `SELECT id,teacher_id,organization_id,full_name,email,subject,phone,created_at
       FROM teachers WHERE organization_id=$1 ORDER BY id ASC`,
      [organizationId]
    );
    res.status(200).json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ message: "Server Error" }); }
};

const addTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    const { full_name, phone, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!organizationId) return await rollbackWith(client, res, 400, "Organization context is required.");
    if (!full_name || !email || !password) return await rollbackWith(client, res, 400, "Full name, email and password are required.");

    const validatedSubject = await validateTeacherSubject(client, organizationId, req.body.subject);
    if (!validatedSubject) return await rollbackWith(client, res, 400, "Teaching subject must be selected from your organization's subjects.");

    const organization = await client.query(
      "SELECT id, organization_code FROM organizations WHERE id=$1 FOR UPDATE",
      [organizationId]
    );
    if (!organization.rows.length) return await rollbackWith(client, res, 404, "Organization not found.");

    const existingUser = await client.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [email]);
    if (existingUser.rows.length) return await rollbackWith(client, res, 400, "Email already exists.");

    const countResult = await client.query(
      `SELECT COALESCE(MAX(NULLIF(regexp_replace(teacher_id, '^.*-TCH', ''), '')::integer), 0) AS max_number
       FROM teachers WHERE organization_id=$1`,
      [organizationId]
    );
    const teacherNumber = String(Number(countResult.rows[0].max_number) + 1).padStart(3, "0");
    const teacher_id = `${organization.rows[0].organization_code}-TCH${teacherNumber}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacherResult = await client.query(
      `INSERT INTO teachers (teacher_id,organization_id,full_name,email,subject,phone,password)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id,teacher_id,organization_id,full_name,email,subject,phone,created_at`,
      [teacher_id, organizationId, full_name.trim(), email, validatedSubject, phone || null, hashedPassword]
    );
    const teacher = teacherResult.rows[0];

    await client.query(
      `INSERT INTO users (organization_id,email,password,role,reference_id) VALUES ($1,$2,$3,'teacher',$4)`,
      [organizationId, email, hashedPassword, teacher.id]
    );

    await client.query("COMMIT");
    res.status(201).json(teacher);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(error.code === "23505" ? 400 : 500).json({ message: error.code === "23505" ? "Teacher or email already exists." : "Failed to add teacher." });
  } finally { client.release(); }
};

const getTeacherById = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    if (!organizationId) return res.status(400).json({ message: "Organization context is required." });
    const result = await pool.query(
      `SELECT id,teacher_id,organization_id,full_name,email,subject,phone,created_at
       FROM teachers WHERE id=$1 AND organization_id=$2`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Teacher not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { console.error(error); res.status(500).json({ message: "Server Error" }); }
};

const updateTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    const { full_name, phone } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!organizationId) return await rollbackWith(client, res, 400, "Organization context is required.");
    if (!full_name || !email) return await rollbackWith(client, res, 400, "Full name and email are required.");

    const validatedSubject = await validateTeacherSubject(client, organizationId, req.body.subject);
    if (!validatedSubject) return await rollbackWith(client, res, 400, "Teaching subject must be selected from your organization's subjects.");

    const existing = await client.query("SELECT id FROM teachers WHERE LOWER(email)=LOWER($1) AND id<>$2", [email, req.params.id]);
    const existingUser = await client.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1) AND NOT (role='teacher' AND reference_id=$2)", [email, req.params.id]);
    if (existing.rows.length || existingUser.rows.length) return await rollbackWith(client, res, 400, "Email already exists.");

    const result = await client.query(
      `UPDATE teachers SET full_name=$1,email=$2,subject=$3,phone=$4
       WHERE id=$5 AND organization_id=$6
       RETURNING id,teacher_id,organization_id,full_name,email,subject,phone,created_at`,
      [full_name.trim(), email, validatedSubject, phone || null, req.params.id, organizationId]
    );
    if (!result.rows.length) return await rollbackWith(client, res, 404, "Teacher not found.");

    await client.query(
      `UPDATE users SET email=$1 WHERE role='teacher' AND reference_id=$2 AND organization_id=$3`,
      [email, req.params.id, organizationId]
    );
    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(error.code === "23505" ? 400 : 500).json({ message: error.code === "23505" ? "Teacher or email already exists." : "Failed to update teacher." });
  } finally { client.release(); }
};

const deleteTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    if (!organizationId) return await rollbackWith(client, res, 400, "Organization context is required.");

    const result = await client.query(
      `DELETE FROM teachers WHERE id=$1 AND organization_id=$2
       RETURNING id,teacher_id,organization_id,full_name,email,subject,phone,created_at`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) return await rollbackWith(client, res, 404, "Teacher not found.");

    await client.query("DELETE FROM users WHERE role='teacher' AND reference_id=$1 AND organization_id=$2", [req.params.id, organizationId]);
    await client.query("COMMIT");
    res.status(200).json({ message: "Teacher deleted successfully.", teacher: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to delete teacher." });
  } finally { client.release(); }
};

const rollbackWith = async (client, res, status, message) => {
  await client.query("ROLLBACK");
  return res.status(status).json({ message });
};

module.exports = { getTeachers, addTeacher, getTeacherById, updateTeacher, deleteTeacher };
