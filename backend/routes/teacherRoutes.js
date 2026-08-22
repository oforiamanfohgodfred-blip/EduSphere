const express = require("express");
const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  getTeachers,
  addTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");


// Get all teachers
router.get(
  "/",
  protect,
  authorize("admin"),
  getTeachers
);


// Add teacher
router.post(
  "/",
  protect,
  authorize("admin"),
  addTeacher
);


// Update teacher
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateTeacher
);


// Delete teacher
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteTeacher
);


// Get single teacher
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getTeacherById
);


module.exports = router;