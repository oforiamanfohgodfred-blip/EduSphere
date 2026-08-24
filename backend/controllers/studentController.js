const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getOrganizationId = (req) =>
  req.user?.role === "admin" ? null : req.user?.organization_id;

const getStudents = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT id, student_id, organization_id, full_name, email, phone, gender,
              date_of_birth, class_name, created_at
       FROM students
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

const addStudent = async (req, res) => {
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

    const { full_name, email, phone, gender, date_of_birth, class_name, password } = req.body;
    if (!full_name || !email || !password) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Full name, email and password are required." });
    }

    const organization = await client.query(
      "SELECT id FROM organizations WHERE id = $1",
      [organizationId]
    );
    if (organization.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Organization not found." });
    }

    const existingStudent = await client.query(
      "SELECT id FROM students WHERE email = $1",
      [email]
    );
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingStudent.rows.length || existingUser.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Email already exists." });
    }

    const countResult = await client.query(
      "SELECT COUNT(*) FROM students WHERE organization_id = $1",
      [organizationId]
    );
    const studentNumber = String(Number(countResult.rows[0].count) + 1).padStart(3, "0");
    const orgCode = String(organizationId).padStart(3, "0");
    const student_id = `ORG${orgCode}-STD${studentNumber}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const studentResult = await client.query(
      `INSERT INTO students
       (student_id, organization_id, full_name, email, phone, gender, date_of_birth, class_name, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, student_id, organization_id, full_name, email, phone, gender, date_of_birth, class_name, created_at`,
      [student_id, organizationId, full_name, email, phone, gender, date_of_birth, class_name, hashedPassword]
    );
    const student = studentResult.rows[0];

    await client.query(
      `INSERT INTO users (organization_id, email, password, role, reference_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [organizationId, email, hashedPassword, "student", student.id]
    );

    await client.query("COMMIT");
    res.status(201).json(student);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to add student." });
  } finally {
    client.release();
  }
};

const getStudentById = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT id, student_id, organization_id, full_name, email, phone, gender,
              date_of_birth, class_name, created_at
       FROM students
       WHERE id = $1 AND ($2::integer IS NULL OR organization_id = $2)`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Student not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { full_name, email, phone, gender, date_of_birth, class_name } = req.body;
    const existing = await pool.query(
      `SELECT id FROM students WHERE email = $1 AND id <> $2`,
      [email, req.params.id]
    );
    if (existing.rows.length) return res.status(400).json({ message: "Student with this email already exists." });

    const result = await pool.query(
      `UPDATE students SET full_name=$1, email=$2, phone=$3, gender=$4,
              date_of_birth=$5, class_name=$6
       WHERE id=$7 AND ($8::integer IS NULL OR organization_id=$8)
       RETURNING id, student_id, organization_id, full_name, email, phone, gender, date_of_birth, class_name, created_at`,
      [full_name, email, phone, gender, date_of_birth, class_name, req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Student not found." });

    await pool.query(
      `UPDATE users SET email=$1 WHERE role='student' AND reference_id=$2`,
      [email, req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update student." });
  }
};

const deleteStudent = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const organizationId = getOrganizationId(req);
    const userResult = await client.query(
      `DELETE FROM users WHERE role='student' AND reference_id=$1
       AND ($2::integer IS NULL OR organization_id=$2)`,
      [req.params.id, organizationId]
    );
    const result = await client.query(
      `DELETE FROM students WHERE id=$1 AND ($2::integer IS NULL OR organization_id=$2)
       RETURNING id, student_id, organization_id, full_name, email, phone, gender, date_of_birth, class_name, created_at`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student not found." });
    }
    await client.query("COMMIT");
    res.status(200).json({ message: "Student deleted successfully.", student: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to delete student." });
  } finally {
    client.release();
  }
};

module.exports = { getStudents, addStudent, getStudentById, updateStudent, deleteStudent };
