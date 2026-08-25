const express = require("express");
const { getClasses, addClass, updateClass, getClassDetails, replaceClassTeachers, replaceClassSubjects, deleteClass } = require("../controllers/classController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken, authorizeRoles("organization"));
router.get("/", getClasses);
router.post("/", addClass);
router.get("/:id", getClassDetails);
router.put("/:id", updateClass);
router.put("/:id/teachers", replaceClassTeachers);
router.put("/:id/subjects", replaceClassSubjects);
router.delete("/:id", deleteClass);

module.exports = router;
