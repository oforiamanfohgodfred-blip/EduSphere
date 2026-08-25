const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getMyLearningSpace,
  getAssignment,
  submitAssignment,
} = require("../controllers/studentLearningController");

router.use(authenticateToken, authorizeRoles("student"));

router.get("/space", getMyLearningSpace);
router.get("/assignments/:id", getAssignment);
router.post("/assignments/:id/submissions", submitAssignment);

module.exports = router;
