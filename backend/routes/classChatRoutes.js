const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { listMessages, createMessage } = require("../controllers/classChatController");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("organization", "teacher", "student"));
router.get("/classes/:classId/chat", listMessages);
router.post("/classes/:classId/chat", createMessage);

module.exports = router;
