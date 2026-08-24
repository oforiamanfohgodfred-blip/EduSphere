const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getTeachers,
  addTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

// Organization/admin access to teacher management
router.get(
  "/",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  getTeachers
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  addTeacher
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  getTeacherById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  updateTeacher
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  deleteTeacher
);

module.exports = router;
