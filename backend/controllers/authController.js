const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// Login
// =======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const userResult = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        message: "This account has been deactivated.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    let profile = null;

    if (user.role === "organization") {
      const organization = await pool.query(
        `SELECT
           id,
           organization_name,
           organization_code,
           organization_type,
           email,
           country,
           created_at
         FROM organizations
         WHERE id = $1`,
        [user.reference_id]
      );

      profile = organization.rows[0] || null;
    } else if (user.role === "teacher") {
      const teacher = await pool.query(
        `SELECT
          id,
          teacher_id,
          organization_id,
          full_name,
          email,
          subject,
          phone,
          created_at
        FROM teachers
        WHERE id = $1 AND organization_id = $2`,
        [user.reference_id, user.organization_id]
      );

      profile = teacher.rows[0] || null;
    } else if (user.role === "student") {
      const student = await pool.query(
        `SELECT
          id,
          student_id,
          organization_id,
          full_name,
          email,
          phone,
          gender,
          date_of_birth,
          class_name,
          class_id,
          created_at
        FROM students
        WHERE id = $1 AND organization_id = $2`,
        [user.reference_id, user.organization_id]
      );

      profile = student.rows[0] || null;
    }

    if (!profile && user.role !== "admin") {
      return res.status(403).json({
        message: "The account profile could not be found.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        organization_id: user.organization_id,
        role: user.role,
        reference_id: user.reference_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error.",
    });
  }
};

module.exports = {
  login,
};
