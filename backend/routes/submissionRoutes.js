const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { submitAssignment, listMySubmissions, listClassSubmissions, gradeSubmission } = require("../controllers/submissionController");

const router = express.Router();
router.use(authenticateToken);
router.post("/assignments/:assignmentId/submit", authorizeRoles("student"), submitAssignment);
router.get("/submissions/mine", authorizeRoles("student"), listMySubmissions);
router.get("/classes/:classId/submissions", authorizeRoles("teacher"), listClassSubmissions);
router.post("/submissions/:submissionId/grade", authorizeRoles("teacher"), gradeSubmission);
module.exports = router;
