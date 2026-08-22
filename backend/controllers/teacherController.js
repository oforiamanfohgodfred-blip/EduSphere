const pool = require("../config/db");
const bcrypt = require("bcrypt");

// =======================
// Get All Teachers
// =======================
const getTeachers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        created_at
      FROM teachers
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
// Add Teacher
// =======================
const addTeacher = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      organization_id,
      full_name,
      email,
      subject,
      phone,
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

    // Check teacher email
    const existingTeacher = await client.query(
      "SELECT id FROM teachers WHERE email = $1",
      [email]
    );

    if (existingTeacher.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Teacher with this email already exists.",
      });
    }

    // Check users table email
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

    // Generate Teacher ID
    const countResult = await client.query(
      "SELECT COUNT(*) FROM teachers WHERE organization_id = $1",
      [organization_id]
    );

    const teacherNumber = String(
      Number(countResult.rows[0].count) + 1
    ).padStart(3, "0");

    const orgCode = String(organization_id).padStart(3, "0");

    const teacher_id = `ORG${orgCode}-TCH${teacherNumber}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert Teacher
    const teacherResult = await client.query(
      `
      INSERT INTO teachers
      (
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        password
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING
        id,
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        created_at
      `,
      [
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        hashedPassword,
      ]
    );

    const teacher = teacherResult.rows[0];

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
        "teacher",
        teacher.id,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json(teacher);

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to add teacher.",
    });

  } finally {
    client.release();
  }
};

// =======================
// Get Single Teacher
// =======================
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        created_at
      FROM teachers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Teacher not found.",
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
// Update Teacher
// =======================
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      subject,
      phone,
    } = req.body;

    const existingTeacher = await pool.query(
      "SELECT id FROM teachers WHERE email = $1",
      [email]
    );

    if (
      existingTeacher.rows.length > 0 &&
      existingTeacher.rows[0].id !== Number(id)
    ) {
      return res.status(400).json({
        message: "Teacher with this email already exists.",
      });
    }

    const result = await pool.query(
      `
      UPDATE teachers
      SET
        full_name = $1,
        email = $2,
        subject = $3,
        phone = $4
      WHERE id = $5
      RETURNING
        id,
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        created_at
      `,
      [
        full_name,
        email,
        subject,
        phone,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    // Keep users table in sync
    await pool.query(
      `
      UPDATE users
      SET email = $1
      WHERE role = 'teacher'
      AND reference_id = $2
      `,
      [email, id]
    );

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update teacher.",
    });
  }
};

// =======================
// Delete Teacher
// =======================
const deleteTeacher = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    await client.query(
      `
      DELETE FROM users
      WHERE role = 'teacher'
      AND reference_id = $1
      `,
      [id]
    );

    const result = await client.query(
      `
      DELETE FROM teachers
      WHERE id = $1
      RETURNING
        id,
        teacher_id,
        organization_id,
        full_name,
        email,
        subject,
        phone,
        created_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Teacher deleted successfully.",
      teacher: result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to delete teacher.",
    });

  } finally {
    client.release();
  }
};

module.exports = {
  getTeachers,
  addTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};