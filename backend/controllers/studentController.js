const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getOrganizationId = (req) => Number(req.user?.organization_id);
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const getStudents = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    if (!organizationId) return res.status(400).json({ message: "Organization context is required." });
    const result = await pool.query(
      `SELECT s.id,s.student_id,s.organization_id,s.full_name,s.email,s.phone,s.gender,
              s.date_of_birth,s.class_id,c.name AS assigned_class_name,c.code AS assigned_class_code,s.created_at
       FROM students s
       LEFT JOIN classes c ON c.id=s.class_id AND c.organization_id=s.organization_id
       WHERE s.organization_id=$1 ORDER BY s.id ASC`,
      [organizationId]
    );
    res.status(200).json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ message: "Server Error" }); }
};

const addStudent = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    const { full_name, phone, gender, date_of_birth, class_id, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!organizationId) return await rollbackWith(client, res, 400, "Organization context is required.");
    if (!full_name || !email || !password || !class_id) return await rollbackWith(client, res, 400, "Full name, email, password and class are required.");

    // Serialize identifier allocation for this organization.
    const organization = await client.query("SELECT id, organization_code FROM organizations WHERE id=$1 FOR UPDATE", [organizationId]);
    if (!organization.rows.length) return await rollbackWith(client, res, 404, "Organization not found.");

    const classResult = await client.query("SELECT id,name FROM classes WHERE id=$1 AND organization_id=$2", [class_id, organizationId]);
    if (!classResult.rows.length) return await rollbackWith(client, res, 400, "Selected class is invalid.");

    const existingUser = await client.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [email]);
    if (existingUser.rows.length) return await rollbackWith(client, res, 400, "Email already exists.");

    const countResult = await client.query(
      `SELECT COALESCE(MAX(NULLIF(regexp_replace(student_id, '^.*-STD', ''), '')::integer), 0) AS max_number
       FROM students WHERE organization_id=$1`, [organizationId]
    );
    const studentNumber = String(Number(countResult.rows[0].max_number) + 1).padStart(3, "0");
    const student_id = `${organization.rows[0].organization_code}-STD${studentNumber}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const studentResult = await client.query(
      `INSERT INTO students (student_id,organization_id,full_name,email,phone,gender,date_of_birth,class_id,class_name,password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id,student_id,organization_id,full_name,email,phone,gender,date_of_birth,class_id,created_at`,
      [student_id, organizationId, full_name.trim(), email, phone || null, gender || null, date_of_birth || null, class_id, classResult.rows[0].name, hashedPassword]
    );
    const student = studentResult.rows[0];

    await client.query(`INSERT INTO users (organization_id,email,password,role,reference_id) VALUES ($1,$2,$3,'student',$4)`, [organizationId, email, hashedPassword, student.id]);
    await client.query("COMMIT");
    res.status(201).json(student);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(error.code === "23505" ? 400 : 500).json({ message: error.code === "23505" ? "Student or email already exists." : "Failed to add student." });
  } finally { client.release(); }
};

const getStudentById = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    if (!organizationId) return res.status(400).json({ message: "Organization context is required." });
    const result = await pool.query(
      `SELECT s.id,s.student_id,s.organization_id,s.full_name,s.email,s.phone,s.gender,s.date_of_birth,
              s.class_id,c.name AS assigned_class_name,c.code AS assigned_class_code,s.created_at
       FROM students s LEFT JOIN classes c ON c.id=s.class_id AND c.organization_id=s.organization_id
       WHERE s.id=$1 AND s.organization_id=$2`, [req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Student not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { console.error(error); res.status(500).json({ message: "Server Error" }); }
};

const updateStudent = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    const { full_name, phone, gender, date_of_birth, class_id } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!organizationId) return await rollbackWith(client, res, 400, "Organization context is required.");
    if (!full_name || !email || !class_id) return await rollbackWith(client, res, 400, "Full name, email and class are required.");

    const classResult = await client.query("SELECT id,name FROM classes WHERE id=$1 AND organization_id=$2", [class_id, organizationId]);
    if (!classResult.rows.length) return await rollbackWith(client, res, 400, "Selected class is invalid.");

    const existing = await client.query("SELECT id FROM students WHERE LOWER(email)=LOWER($1) AND id<>$2", [email, req.params.id]);
    const existingUser = await client.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1) AND NOT (role='student' AND reference_id=$2)", [email, req.params.id]);
    if (existing.rows.length || existingUser.rows.length) return await rollbackWith(client, res, 400, "Email already exists.");

    const result = await client.query(
      `UPDATE students SET full_name=$1,email=$2,phone=$3,gender=$4,date_of_birth=$5,class_id=$6,class_name=$7
       WHERE id=$8 AND organization_id=$9
       RETURNING id,student_id,organization_id,full_name,email,phone,gender,date_of_birth,class_id,created_at`,
      [full_name.trim(), email, phone || null, gender || null, date_of_birth || null, class_id, classResult.rows[0].name, req.params.id, organizationId]
    );
    if (!result.rows.length) return await rollbackWith(client, res, 404, "Student not found.");

    await client.query(`UPDATE users SET email=$1 WHERE role='student' AND reference_id=$2 AND organization_id=$3`, [email, req.params.id, organizationId]);
    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(error.code === "23505" ? 400 : 500).json({ message: error.code === "23505" ? "Student or email already exists." : "Failed to update student." });
  } finally { client.release(); }
};

const deleteStudent = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    if (!organizationId) return await rollbackWith(client, res, 400, "Organization context is required.");
    const result = await client.query(
      `DELETE FROM students WHERE id=$1 AND organization_id=$2
       RETURNING id,student_id,organization_id,full_name,email,phone,gender,date_of_birth,class_id,created_at`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) return await rollbackWith(client, res, 404, "Student not found.");
    await client.query("DELETE FROM users WHERE role='student' AND reference_id=$1 AND organization_id=$2", [req.params.id, organizationId]);
    await client.query("COMMIT");
    res.status(200).json({ message: "Student deleted successfully.", student: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to delete student." });
  } finally { client.release(); }
};

const rollbackWith = async (client, res, status, message) => {
  await client.query("ROLLBACK");
  return res.status(status).json({ message });
};

module.exports = { getStudents, addStudent, getStudentById, updateStudent, deleteStudent };
