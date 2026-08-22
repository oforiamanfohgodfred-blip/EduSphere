const express = require("express");
const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");


// Get all students
router.get(
  "/",
  protect,
  authorize("admin"),
  getStudents
);


// Add student
router.post(
  "/",
  protect,
  authorize("admin"),
  addStudent
);


// Get single student
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getStudentById
);


// Update student
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateStudent
);


// Delete student
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteStudent
);


module.exports = router;