const express = require("express");
const { getSubjects, addSubject, updateSubject, deleteSubject } = require("../controllers/subjectController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Organization owns curriculum administration. Platform-admin controls will
// be introduced through the dedicated admin module.
router.use(authenticateToken, authorizeRoles("organization"));
router.get("/", getSubjects);
router.post("/", addSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
