const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// Login
// =======================
const login = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find the account in the shared authentication table.
    const userResult = await pool.query(
      `
      SELECT
        id,
        organization_id,
        email,
        password,
        role,
        reference_id,
        is_active,
        created_at
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = userResult.rows[0];

    // Check active account before allowing authentication.
    if (user.is_active === false) {
      return res.status(403).json({
        message: "This account has been deactivated.",
      });
    }

    // Verify password.
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Load the correct profile for the authenticated role.
    let profile = null;

    if (user.role === "teacher") {
      const teacher = await pool.query(
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
          AND organization_id = $2
        LIMIT 1
        `,
        [user.reference_id, user.organization_id]
      );

      profile = teacher.rows[0] || null;
    } else if (user.role === "student") {
      const student = await pool.query(
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
          AND organization_id = $2
        LIMIT 1
        `,
        [user.reference_id, user.organization_id]
      );

      profile = student.rows[0] || null;
    } else if (user.role === "organization") {
      const organization = await pool.query(
        `
        SELECT
          id,
          organization_name,
          organization_code,
          organization_type,
          email,
          country,
          created_at
        FROM organizations
        WHERE id = $1
        LIMIT 1
        `,
        [user.reference_id]
      );

      profile = organization.rows[0] || null;
    }

    // Generate the shared EduSphere JWT.
    const token = jwt.sign(
      {
        userId: user.id,
        organization_id: user.organization_id,
        role: user.role,
        reference_id: user.reference_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server Error.",
    });
  }
};

module.exports = {
  login,
};
