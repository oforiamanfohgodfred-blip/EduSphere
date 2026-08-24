const express = require("express");
const { getSubjects, addSubject, updateSubject, deleteSubject } = require("../controllers/subjectController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken, authorizeRoles("organization", "admin"));
router.get("/", getSubjects);
router.post("/", addSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
