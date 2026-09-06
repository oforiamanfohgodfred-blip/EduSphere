const pool = require("../config/db");

const getActor = (req) => ({ userId: req.user?.userId ?? req.user?.id, role: req.user?.role, organizationId: req.user?.organizationId ?? req.user?.organization_id });

const listNotifications = async (req, res) => {
  const a = getActor(req);
  if (!a.userId) return res.status(401).json({ message: "Authentication required." });
  try {
    const { rows } = await pool.query(`SELECT id,type,title,body,link,read_at,created_at FROM notifications WHERE user_id=$1 AND ($2::int IS NULL OR organization_id=$2) ORDER BY created_at DESC LIMIT 100`, [a.userId, a.organizationId ? Number(a.organizationId) : null]);
    res.json(rows);
  } catch { res.status(500).json({ message: "Unable to load notifications." }); }
};

const markNotificationRead = async (req, res) => {
  const a = getActor(req);
  try {
    const { rows } = await pool.query(`UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=$1 AND user_id=$2 RETURNING *`, [Number(req.params.id), a.userId]);
    if (!rows[0]) return res.status(404).json({ message: "Notification not found." });
    res.json(rows[0]);
  } catch { res.status(500).json({ message: "Unable to update notification." }); }
};

module.exports = { listNotifications, markNotificationRead };
