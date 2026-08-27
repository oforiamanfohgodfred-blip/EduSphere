const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

// Organization owns student administration. Platform-admin cross-organization
// management will be added with the dedicated admin module.
router.get("/", authenticateToken, authorizeRoles("organization"), getStudents);
router.post("/", authenticateToken, authorizeRoles("organization"), addStudent);
router.get("/:id", authenticateToken, authorizeRoles("organization"), getStudentById);
router.put("/:id", authenticateToken, authorizeRoles("organization"), updateStudent);
router.delete("/:id", authenticateToken, authorizeRoles("organization"), deleteStudent);

module.exports = router;
