const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Authenticated user.",
    user: req.user,
  });
});

module.exports = router;
