const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { listAnnouncements, createAnnouncement, listResources, createResource } = require("../controllers/vleContentController");

const router = express.Router();
router.use(authenticateToken);

router.get("/classes/:classId/announcements", authorizeRoles("organization", "teacher", "student"), listAnnouncements);
router.post("/announcements", authorizeRoles("teacher"), createAnnouncement);
router.get("/classes/:classId/resources", authorizeRoles("organization", "teacher", "student"), listResources);
router.post("/resources", authorizeRoles("teacher"), createResource);

module.exports = router;
