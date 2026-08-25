const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getClassChat,
  sendClassMessage,
  getStaffChat,
  sendStaffMessage,
} = require("../controllers/chatController");

router.use(authenticateToken);

router.get(
  "/classes/:classId",
  authorizeRoles("teacher", "student", "organization", "org_admin", "admin"),
  getClassChat
);

router.post(
  "/classes/:classId",
  authorizeRoles("teacher", "student"),
  sendClassMessage
);

router.get(
  "/staff",
  authorizeRoles("teacher", "organization", "org_admin", "admin"),
  getStaffChat
);

router.post(
  "/staff",
  authorizeRoles("teacher", "organization", "org_admin", "admin"),
  sendStaffMessage
);

module.exports = router;
