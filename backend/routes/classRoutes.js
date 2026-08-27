const express = require("express");
const {
  getClasses,
  getTeacherClasses,
  getStudentClasses,
  addClass,
  updateClass,
  getClassDetails,
  getTeacherClassDetails,
  getStudentClassDetails,
  replaceClassTeachers,
  replaceClassSubjects,
  deleteClass,
} = require("../controllers/classController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Every class endpoint requires authentication.
router.use(authenticateToken);

// Organization: full class management.
router.get("/", authorizeRoles("organization", "admin"), getClasses);
router.post("/", authorizeRoles("organization", "admin"), addClass);
router.get("/:id", authorizeRoles("organization", "admin"), getClassDetails);
router.put("/:id", authorizeRoles("organization", "admin"), updateClass);
router.put("/:id/teachers", authorizeRoles("organization", "admin"), replaceClassTeachers);
router.put("/:id/subjects", authorizeRoles("organization", "admin"), replaceClassSubjects);
router.delete("/:id", authorizeRoles("organization", "admin"), deleteClass);

// Teacher: read-only access to assigned classes.
router.get("/teacher/my", authorizeRoles("teacher"), getTeacherClasses);
router.get("/teacher/my/:id", authorizeRoles("teacher"), getTeacherClassDetails);

// Student: read-only access to the student's enrolled class.
router.get("/student/my", authorizeRoles("student"), getStudentClasses);
router.get("/student/my/:id", authorizeRoles("student"), getStudentClassDetails);

module.exports = router;
