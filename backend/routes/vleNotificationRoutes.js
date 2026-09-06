const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { listNotifications, markNotificationRead } = require("../controllers/vleNotificationController");
const router = express.Router();
router.use(authenticateToken);
router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
module.exports = router;
