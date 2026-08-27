const express = require("express");
const router = express.Router();

const { login, registerMember } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register-member", registerMember);

router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

module.exports = router;
