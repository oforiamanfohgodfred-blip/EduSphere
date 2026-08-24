const pool = require("../config/db");
const bcrypt = require("bcrypt");

const generateOrganizationCode = (name) => {
  const prefix = name.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "ORG";
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}${random}`;
};

const registerOrganization = async (req, res) => {
  const client = await pool.connect();

  try {
    const { organization_name, organization_type, email, password, country } = req.body;

    if (!organization_name || !organization_type || !email || !password || !country) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await client.query("BEGIN");

    const existingOrganization = await client.query(
      "SELECT id FROM organizations WHERE email = $1",
      [email]
    );
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingOrganization.rows.length || existingUser.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Email already exists." });
    }

    let organizationCode;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = generateOrganizationCode(organization_name);
      const codeCheck = await client.query(
        "SELECT id FROM organizations WHERE organization_code = $1",
        [candidate]
      );
      if (!codeCheck.rows.length) {
        organizationCode = candidate;
        break;
      }
    }

    if (!organizationCode) {
      await client.query("ROLLBACK");
      return res.status(500).json({ message: "Could not generate a unique organization code." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organizationResult = await client.query(
      `INSERT INTO organizations
       (organization_name, organization_code, organization_type, email, password, country)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, organization_name, organization_code, organization_type, email, country`,
      [organization_name, organizationCode, organization_type, email, hashedPassword, country]
    );

    const organization = organizationResult.rows[0];

    // Keep organization registration and the shared login system synchronized.
    await client.query(
      `INSERT INTO users (organization_id, email, password, role, reference_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [organization.id, email, hashedPassword, "organization", organization.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Organization registered successfully.",
      organization_code: organization.organization_code,
      organization: {
        id: organization.id,
        organization_name: organization.organization_name,
        organization_type: organization.organization_type,
        email: organization.email,
        country: organization.country,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
};

module.exports = {
  registerOrganization,
};
