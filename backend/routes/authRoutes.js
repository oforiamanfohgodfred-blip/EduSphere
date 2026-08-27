const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/login", login);

router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

module.exports = router;
