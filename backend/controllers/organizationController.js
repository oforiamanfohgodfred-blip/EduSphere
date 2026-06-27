const pool = require("../config/db");
const bcrypt = require("bcrypt");

// Generate Organization Code
const generateOrganizationCode = (name) => {
  const prefix = name
    .replace(/[^A-Za-z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  const random = Math.floor(100 + Math.random() * 900);

  return `${prefix}${random}`;
};

// Register Organization
const registerOrganization = async (req, res) => {
  try {
    const {
      organization_name,
      organization_type,
      email,
      password,
      country,
    } = req.body;

    // Validate input
    if (
      !organization_name ||
      !organization_type ||
      !email ||
      !password ||
      !country
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check if email already exists
    const existing = await pool.query(
      "SELECT * FROM organizations WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Organization already exists.",
      });
    }

    // Generate organization code
    const organization_code =
      generateOrganizationCode(organization_name);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save organization
    await pool.query(
      `INSERT INTO organizations
      (
        organization_name,
        organization_code,
        organization_type,
        email,
        password,
        country
      )
      VALUES
      ($1,$2,$3,$4,$5,$6)`,
      [
        organization_name,
        organization_code,
        organization_type,
        email,
        hashedPassword,
        country,
      ]
    );

    res.status(201).json({
      message: "Organization registered successfully.",
      organization_code,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
};

module.exports = {
  registerOrganization,
};