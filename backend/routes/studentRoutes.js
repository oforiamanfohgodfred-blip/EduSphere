const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

// Organization/admin access to student management
router.get(
  "/",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  getStudents
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  addStudent
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  getStudentById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  updateStudent
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("organization", "admin"),
  deleteStudent
);

module.exports = router;
