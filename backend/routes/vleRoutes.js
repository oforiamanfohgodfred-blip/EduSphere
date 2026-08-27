const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { listClassAssignments, createAssignment } = require("../controllers/vleController");

const router = express.Router();
router.use(authenticateToken);

router.get("/classes/:classId/assignments", authorizeRoles("organization", "teacher", "student"), listClassAssignments);
router.post("/assignments", authorizeRoles("teacher"), createAssignment);

module.exports = router;
