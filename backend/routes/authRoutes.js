const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Test Route
router.get("/", (req, res) => {
  res.json({
    message: "Auth route is working!",
  });
});

// Register Route
router.post("/register", register);

// Login Route
router.post("/login", login);

// Verify the currently authenticated user
router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

module.exports = router;
