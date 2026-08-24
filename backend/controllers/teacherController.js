const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getOrganizationId = (req) =>
  req.user?.role === "admin" ? null : req.user?.organization_id;

const getTeachers = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT id, teacher_id, organization_id, full_name, email, subject, phone, created_at
       FROM teachers
       WHERE ($1::integer IS NULL OR organization_id = $1)
       ORDER BY id ASC`,
      [organizationId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const addTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const requestedOrganizationId = Number(req.body.organization_id);
    const organizationId =
      req.user?.role === "admin"
        ? requestedOrganizationId
        : Number(req.user?.organization_id);

    if (!organizationId || Number.isNaN(organizationId)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Valid organization is required." });
    }

    const { full_name, email, subject, phone, password } = req.body;
    if (!full_name || !email || !password) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Full name, email and password are required." });
    }

    const organization = await client.query(
      "SELECT id FROM organizations WHERE id = $1",
      [organizationId]
    );
    if (!organization.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Organization not found." });
    }

    const existingTeacher = await client.query(
      "SELECT id FROM teachers WHERE email = $1",
      [email]
    );
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingTeacher.rows.length || existingUser.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Email already exists." });
    }

    const countResult = await client.query(
      "SELECT COUNT(*) FROM teachers WHERE organization_id = $1",
      [organizationId]
    );
    const teacherNumber = String(Number(countResult.rows[0].count) + 1).padStart(3, "0");
    const orgCode = String(organizationId).padStart(3, "0");
    const teacher_id = `ORG${orgCode}-TCH${teacherNumber}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacherResult = await client.query(
      `INSERT INTO teachers
       (teacher_id, organization_id, full_name, email, subject, phone, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, teacher_id, organization_id, full_name, email, subject, phone, created_at`,
      [teacher_id, organizationId, full_name, email, subject, phone, hashedPassword]
    );
    const teacher = teacherResult.rows[0];

    await client.query(
      `INSERT INTO users (organization_id, email, password, role, reference_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [organizationId, email, hashedPassword, "teacher", teacher.id]
    );

    await client.query("COMMIT");
    res.status(201).json(teacher);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to add teacher." });
  } finally {
    client.release();
  }
};

const getTeacherById = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT id, teacher_id, organization_id, full_name, email, subject, phone, created_at
       FROM teachers
       WHERE id=$1 AND ($2::integer IS NULL OR organization_id=$2)`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Teacher not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { full_name, email, subject, phone } = req.body;
    const existing = await pool.query(
      `SELECT id FROM teachers WHERE email=$1 AND id<>$2`,
      [email, req.params.id]
    );
    if (existing.rows.length) return res.status(400).json({ message: "Teacher with this email already exists." });

    const result = await pool.query(
      `UPDATE teachers SET full_name=$1, email=$2, subject=$3, phone=$4
       WHERE id=$5 AND ($6::integer IS NULL OR organization_id=$6)
       RETURNING id, teacher_id, organization_id, full_name, email, subject, phone, created_at`,
      [full_name, email, subject, phone, req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Teacher not found." });

    await pool.query(
      `UPDATE users SET email=$1 WHERE role='teacher' AND reference_id=$2`,
      [email, req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update teacher." });
  }
};

const deleteTeacher = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    await client.query(
      `DELETE FROM users WHERE role='teacher' AND reference_id=$1
       AND ($2::integer IS NULL OR organization_id=$2)`,
      [req.params.id, organizationId]
    );
    const result = await client.query(
      `DELETE FROM teachers WHERE id=$1 AND ($2::integer IS NULL OR organization_id=$2)
       RETURNING id, teacher_id, organization_id, full_name, email, subject, phone, created_at`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Teacher not found." });
    }
    await client.query("COMMIT");
    res.status(200).json({ message: "Teacher deleted successfully.", teacher: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to delete teacher." });
  } finally {
    client.release();
  }
};

module.exports = { getTeachers, addTeacher, getTeacherById, updateTeacher, deleteTeacher };
