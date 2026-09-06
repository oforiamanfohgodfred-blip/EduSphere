const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { listTimetable, createTimetable, listExams, createExam } = require("../controllers/vleAcademicController");

const router = express.Router();
router.use(authenticateToken);
router.get("/classes/:classId/timetable", authorizeRoles("organization", "teacher", "student"), listTimetable);
router.post("/timetable", authorizeRoles("organization", "teacher"), createTimetable);
router.get("/classes/:classId/exams", authorizeRoles("organization", "teacher", "student"), listExams);
router.post("/exams", authorizeRoles("organization", "teacher"), createExam);
module.exports = router;
