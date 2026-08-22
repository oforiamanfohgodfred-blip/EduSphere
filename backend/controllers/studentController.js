const pool = require("../config/db");
const bcrypt = require("bcrypt");

// =======================
// Get All Students
// =======================
const getStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        created_at
      FROM students
      ORDER BY id ASC
    `);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =======================
// Add Student
// =======================
const addStudent = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      organization_id,
      full_name,
      email,
      phone,
      gender,
      date_of_birth,
      class_name,
      password,
    } = req.body;

    // Check organization
    const organization = await client.query(
      "SELECT id FROM organizations WHERE id = $1",
      [organization_id]
    );

    if (organization.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    // Check student email
    const existingStudent = await client.query(
      "SELECT id FROM students WHERE email = $1",
      [email]
    );

    if (existingStudent.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Student with this email already exists.",
      });
    }

    // Check users email
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    // Generate Student ID
    const countResult = await client.query(
      "SELECT COUNT(*) FROM students WHERE organization_id = $1",
      [organization_id]
    );

    const studentNumber = String(
      Number(countResult.rows[0].count) + 1
    ).padStart(3, "0");

    const orgCode = String(organization_id).padStart(3, "0");

    const student_id = `ORG${orgCode}-STD${studentNumber}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert Student
    const studentResult = await client.query(
      `
      INSERT INTO students
      (
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        password
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING
        id,
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        created_at
      `,
      [
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        hashedPassword,
      ]
    );

    const student = studentResult.rows[0];

    // Insert User
    await client.query(
      `
      INSERT INTO users
      (
        organization_id,
        email,
        password,
        role,
        reference_id
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        organization_id,
        email,
        hashedPassword,
        "student",
        student.id,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json(student);

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to add student.",
    });

  } finally {
    client.release();
  }
};

// =======================
// Get Single Student
// =======================
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        created_at
      FROM students
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =======================
// Update Student
// =======================
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      phone,
      gender,
      date_of_birth,
      class_name,
    } = req.body;

    const existingStudent = await pool.query(
      "SELECT id FROM students WHERE email = $1",
      [email]
    );

    if (
      existingStudent.rows.length > 0 &&
      existingStudent.rows[0].id !== Number(id)
    ) {
      return res.status(400).json({
        message: "Student with this email already exists.",
      });
    }

    const result = await pool.query(
      `
      UPDATE students
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        gender = $4,
        date_of_birth = $5,
        class_name = $6
      WHERE id = $7
      RETURNING
        id,
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        created_at
      `,
      [
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    // Keep users table in sync
    await pool.query(
      `
      UPDATE users
      SET email = $1
      WHERE role = 'student'
      AND reference_id = $2
      `,
      [email, id]
    );

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update student.",
    });
  }
};

// =======================
// Delete Student
// =======================
const deleteStudent = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    await client.query(
      `
      DELETE FROM users
      WHERE role = 'student'
      AND reference_id = $1
      `,
      [id]
    );

    const result = await client.query(
      `
      DELETE FROM students
      WHERE id = $1
      RETURNING
        id,
        student_id,
        organization_id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        class_name,
        created_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Student not found.",
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Student deleted successfully.",
      student: result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to delete student.",
    });

  } finally {
    client.release();
  }
};

module.exports = {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
};