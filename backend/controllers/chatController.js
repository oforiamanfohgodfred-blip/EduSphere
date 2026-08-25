const pool = require("../config/db");

const getUserId = (req) => Number(req.user?.userId);
const getOrganizationId = (req) => Number(req.user?.organization_id);
const getReferenceId = (req) => Number(req.user?.reference_id);
const getRole = (req) => req.user?.role;

const getClassMembership = async (userId, role, referenceId, organizationId, classId) => {
  if (role === "teacher") {
    const result = await pool.query(
      `SELECT 1
       FROM class_teachers ct
       JOIN teachers t ON t.id=ct.teacher_id
       WHERE ct.class_id=$1 AND ct.teacher_id=$2 AND t.organization_id=$3`,
      [classId, referenceId, organizationId]
    );
    return result.rows.length > 0;
  }

  if (role === "student") {
    const result = await pool.query(
      `SELECT 1 FROM students
       WHERE id=$1 AND class_id=$2 AND organization_id=$3`,
      [referenceId, classId, organizationId]
    );
    return result.rows.length > 0;
  }

  // Organization administrators may monitor class conversations but do not
  // participate as normal class members.
  if (["organization", "org_admin", "admin"].includes(role)) {
    const result = await pool.query(
      `SELECT 1 FROM classes WHERE id=$1 AND organization_id=$2`,
      [classId, organizationId]
    );
    return result.rows.length > 0;
  }

  return false;
};

const getClassChat = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const classId = Number(req.params.classId);
    if (!organizationId || !classId) return res.status(400).json({ message: "Class is required." });

    const allowed = await getClassMembership(
      getUserId(req), getRole(req), getReferenceId(req), organizationId, classId
    );
    if (!allowed) return res.status(403).json({ message: "You do not have access to this class chat." });

    const result = await pool.query(
      `SELECT m.id, m.class_id, m.message, m.created_at,
              u.id AS sender_user_id, u.role AS sender_role, u.email AS sender_email,
              COALESCE(t.full_name, s.full_name, u.email) AS sender_name
       FROM class_chat_messages m
       JOIN users u ON u.id=m.sender_user_id
       LEFT JOIN teachers t ON t.id=u.reference_id AND u.role='teacher'
       LEFT JOIN students s ON s.id=u.reference_id AND u.role='student'
       WHERE m.class_id=$1 AND m.organization_id=$2
       ORDER BY m.created_at ASC, m.id ASC`,
      [classId, organizationId]
    );

    res.json({ class_id: classId, messages: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load class chat." });
  }
};

const sendClassMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const organizationId = getOrganizationId(req);
    const classId = Number(req.params.classId);
    const message = String(req.body?.message || "").trim();

    if (!userId || !organizationId || !classId || !message) {
      return res.status(400).json({ message: "Class and message are required." });
    }
    if (message.length > 5000) return res.status(400).json({ message: "Message is too long." });
    if (!["teacher", "student"].includes(getRole(req))) {
      return res.status(403).json({ message: "Only teachers and students can send class messages." });
    }

    const allowed = await getClassMembership(
      userId, getRole(req), getReferenceId(req), organizationId, classId
    );
    if (!allowed) return res.status(403).json({ message: "You are not a member of this class." });

    const result = await pool.query(
      `INSERT INTO class_chat_messages
       (organization_id,class_id,sender_user_id,message)
       VALUES ($1,$2,$3,$4)
       RETURNING id,class_id,sender_user_id,message,created_at`,
      [organizationId, classId, userId, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send class message." });
  }
};

const getStaffChat = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const role = getRole(req);
    if (!organizationId || !["teacher", "organization", "org_admin", "admin"].includes(role)) {
      return res.status(403).json({ message: "Staff chat is restricted to teachers and organization staff." });
    }

    const result = await pool.query(
      `SELECT m.id, m.message, m.created_at,
              u.id AS sender_user_id, u.role AS sender_role, u.email AS sender_email,
              COALESCE(t.full_name, u.email) AS sender_name
       FROM staff_chat_messages m
       JOIN users u ON u.id=m.sender_user_id
       LEFT JOIN teachers t ON t.id=u.reference_id AND u.role='teacher'
       WHERE m.organization_id=$1
       ORDER BY m.created_at ASC, m.id ASC`,
      [organizationId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load staff chat." });
  }
};

const sendStaffMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const organizationId = getOrganizationId(req);
    const role = getRole(req);
    const message = String(req.body?.message || "").trim();

    if (!userId || !organizationId || !message) {
      return res.status(400).json({ message: "Message is required." });
    }
    if (message.length > 5000) return res.status(400).json({ message: "Message is too long." });
    if (!["teacher", "organization", "org_admin", "admin"].includes(role)) {
      return res.status(403).json({ message: "Staff chat is restricted to teachers and organization staff." });
    }

    const result = await pool.query(
      `INSERT INTO staff_chat_messages
       (organization_id,sender_user_id,message)
       VALUES ($1,$2,$3)
       RETURNING id,sender_user_id,message,created_at`,
      [organizationId, userId, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send staff message." });
  }
};

module.exports = {
  getClassChat,
  sendClassMessage,
  getStaffChat,
  sendStaffMessage,
};
