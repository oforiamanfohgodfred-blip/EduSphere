const express = require("express");
const {
  getClasses,
  addClass,
  updateClass,
  deleteClass,
} = require("../controllers/classController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("organization", "admin"));
router.get("/", getClasses);
router.post("/", addClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

module.exports = router;
