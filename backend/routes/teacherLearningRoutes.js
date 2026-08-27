const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createAssignment,
  getMyAssignments,
  getClassAssignments,
  createResource,
  getClassResources,
  createAnnouncement,
  getClassAnnouncements,
  createLiveMeeting,
} = require("../controllers/teacherLearningController");

router.use(authenticateToken, authorizeRoles("teacher"));
router.get("/assignments", getMyAssignments);
router.post("/assignments", createAssignment);
router.get("/classes/:classId/assignments", getClassAssignments);
router.post("/resources", createResource);
router.get("/classes/:classId/resources", getClassResources);
router.post("/announcements", createAnnouncement);
router.get("/classes/:classId/announcements", getClassAnnouncements);
router.post("/live-meetings", createLiveMeeting);
module.exports = router;
