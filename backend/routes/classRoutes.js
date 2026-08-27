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

// Named routes must be registered before /:id.
router.get("/teacher/my", authorizeRoles("teacher"), getTeacherClasses);
router.get("/teacher/my/:id", authorizeRoles("teacher"), getTeacherClassDetails);
router.get("/student/my", authorizeRoles("student"), getStudentClasses);
router.get("/student/my/:id", authorizeRoles("student"), getStudentClassDetails);

// Organization owns class administration. Platform-admin cross-organization
// controls will be introduced with the dedicated admin module.
router.get("/", authorizeRoles("organization"), getClasses);
router.post("/", authorizeRoles("organization"), addClass);
router.get("/:id", authorizeRoles("organization"), getClassDetails);
router.put("/:id", authorizeRoles("organization"), updateClass);
router.put("/:id/teachers", authorizeRoles("organization"), replaceClassTeachers);
router.put("/:id/subjects", authorizeRoles("organization"), replaceClassSubjects);
router.delete("/:id", authorizeRoles("organization"), deleteClass);

module.exports = router;
