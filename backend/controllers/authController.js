const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Authentication service is not configured." });

    const userResult = await pool.query(
      `SELECT id, organization_id, email, password, role, reference_id, is_active
       FROM users WHERE LOWER(email) = $1`, [email]
    );
    if (!userResult.rows.length) return res.status(401).json({ message: "Invalid email or password." });

    const user = userResult.rows[0];
    if (!user.is_active) return res.status(403).json({ message: "This account has been deactivated." });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });

    let profile = null;
    if (user.role === "organization") {
      const result = await pool.query(
        `SELECT id, organization_name, organization_code, organization_type, email, country, created_at
         FROM organizations WHERE id = $1`, [user.reference_id]
      );
      profile = result.rows[0] || null;
    } else if (user.role === "teacher") {
      const result = await pool.query(
        `SELECT id, teacher_id, organization_id, full_name, email, subject, phone, created_at
         FROM teachers WHERE id = $1 AND organization_id = $2`, [user.reference_id, user.organization_id]
      );
      profile = result.rows[0] || null;
    } else if (user.role === "student") {
      const result = await pool.query(
        `SELECT id, student_id, organization_id, full_name, email, phone, gender, date_of_birth, class_id, created_at
         FROM students WHERE id = $1 AND organization_id = $2`, [user.reference_id, user.organization_id]
      );
      profile = result.rows[0] || null;
    }

    if (!profile && user.role !== "admin") return res.status(403).json({ message: "The account profile could not be found." });

    const token = jwt.sign(
      { userId: user.id, organization_id: user.organization_id, role: user.role, reference_id: user.reference_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful.", token, role: user.role, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error." });
  }
};

// Public self-registration is intentionally limited to students. Teachers are
// created by the organization so the organization remains responsible for
// faculty membership and class assignment.
const registerMember = async (req, res) => {
  const client = await pool.connect();
  try {
    const { organizationCode, role, name, password, classId } = req.body;
    const email = normalizeEmail(req.body.email);

    if (role !== "student") return res.status(400).json({ message: "Only student self-registration is available. Teachers are created by their organization." });
    if (!organizationCode || !name || !email || !password || !classId) return res.status(400).json({ message: "Organization code, full name, email, password and class are required." });
    if (String(password).length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

    await client.query("BEGIN");
    const organization = await client.query(
      "SELECT id, organization_code FROM organizations WHERE UPPER(organization_code)=UPPER($1) FOR UPDATE", [String(organizationCode).trim()]
    );
    if (!organization.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Organization not found." });
    }

    const organizationId = organization.rows[0].id;
    const classResult = await client.query(
      "SELECT id, name FROM classes WHERE id=$1 AND organization_id=$2", [classId, organizationId]
    );
    if (!classResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Selected class is invalid for this organization." });
    }

    const existing = await client.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [email]);
    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Email already exists." });
    }

    const numberResult = await client.query(
      `SELECT COALESCE(MAX(NULLIF(regexp_replace(student_id, '^.*-STD', ''), '')::integer), 0) AS max_number
       FROM students WHERE organization_id=$1`, [organizationId]
    );
    const studentNumber = String(Number(numberResult.rows[0].max_number) + 1).padStart(3, "0");
    const studentId = `${organization.rows[0].organization_code}-STD${studentNumber}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const studentResult = await client.query(
      `INSERT INTO students (student_id, organization_id, full_name, email, class_id, class_name, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, student_id, organization_id, full_name, email, class_id, created_at`,
      [studentId, organizationId, name.trim(), email, classId, classResult.rows[0].name, hashedPassword]
    );
    const student = studentResult.rows[0];

    await client.query(
      `INSERT INTO users (organization_id,email,password,role,reference_id) VALUES ($1,$2,$3,'student',$4)`,
      [organizationId, email, hashedPassword, student.id]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Student account created successfully. You can now log in.", student });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(error.code === "23505" ? 400 : 500).json({ message: error.code === "23505" ? "Student or email already exists." : "Unable to create student account." });
  } finally {
    client.release();
  }
};

module.exports = { login, registerMember };
