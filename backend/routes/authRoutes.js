const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

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

module.exports = router;