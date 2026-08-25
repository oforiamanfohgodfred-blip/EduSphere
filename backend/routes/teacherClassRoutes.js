const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getMyClasses, getMyClassDetails } = require("../controllers/teacherClassController");

router.use(authenticateToken, authorizeRoles("teacher"));

router.get("/", getMyClasses);
router.get("/:id", getMyClassDetails);

module.exports = router;
