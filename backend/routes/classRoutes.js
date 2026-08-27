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

router.use(authenticateToken);

// IMPORTANT: named routes must come before /:id so Express cannot treat
// "teacher" or "student" as a class ID.
router.get("/teacher/my", authorizeRoles("teacher"), getTeacherClasses);
router.get("/teacher/my/:id", authorizeRoles("teacher"), getTeacherClassDetails);
router.get("/student/my", authorizeRoles("student"), getStudentClasses);
router.get("/student/my/:id", authorizeRoles("student"), getStudentClassDetails);

// Organization: full class management.
router.get("/", authorizeRoles("organization", "admin"), getClasses);
router.post("/", authorizeRoles("organization", "admin"), addClass);
router.get("/:id", authorizeRoles("organization", "admin"), getClassDetails);
router.put("/:id", authorizeRoles("organization", "admin"), updateClass);
router.put("/:id/teachers", authorizeRoles("organization", "admin"), replaceClassTeachers);
router.put("/:id/subjects", authorizeRoles("organization", "admin"), replaceClassSubjects);
router.delete("/:id", authorizeRoles("organization", "admin"), deleteClass);

module.exports = router;
