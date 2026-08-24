const express = require("express");

const router = express.Router();

const {
  registerOrganization,
} = require("../controllers/organizationController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", registerOrganization);

router.get(
  "/me",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  (req, res) => {
    res.status(200).json({
      message: "Organization profile endpoint is protected.",
      user: req.user,
    });
  }
);

module.exports = router;
