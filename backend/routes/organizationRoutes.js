const express = require("express");

const router = express.Router();
const { registerOrganization } = require("../controllers/organizationController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const pool = require("../config/db");

router.post("/register", registerOrganization);

// Only non-sensitive organization/class information is exposed publicly so a
// student can choose a class during self-registration.
router.get("/public/:organizationCode/classes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.code
       FROM classes c
       JOIN organizations o ON o.id = c.organization_id
       WHERE UPPER(o.organization_code)=UPPER($1)
       ORDER BY c.name ASC`,
      [String(req.params.organizationCode || "").trim()]
    );
    if (!result.rows.length) {
      const organization = await pool.query(
        "SELECT id FROM organizations WHERE UPPER(organization_code)=UPPER($1)",
        [String(req.params.organizationCode || "").trim()]
      );
      if (!organization.rows.length) return res.status(404).json({ message: "Organization not found." });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load organization classes." });
  }
});

router.get("/me", authenticateToken, authorizeRoles("organization"), (req, res) => {
  res.status(200).json({
    message: "Organization profile endpoint is protected.",
    user: req.user,
  });
});

module.exports = router;
