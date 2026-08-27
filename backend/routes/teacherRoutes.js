const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getTeachers,
  addTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

// Organization owns teacher administration. Platform-admin cross-organization
// management will be added with the dedicated admin module.
router.get("/", authenticateToken, authorizeRoles("organization"), getTeachers);
router.post("/", authenticateToken, authorizeRoles("organization"), addTeacher);
router.get("/:id", authenticateToken, authorizeRoles("organization"), getTeacherById);
router.put("/:id", authenticateToken, authorizeRoles("organization"), updateTeacher);
router.delete("/:id", authenticateToken, authorizeRoles("organization"), deleteTeacher);

module.exports = router;
