const pool = require("../config/db");

const getOrganizationId = (user) =>
  Number(user?.role === "organization" ? user.reference_id || user.organization_id : user.organization_id);

const getClassAccess = async (user, classId) => {
  const organizationId = getOrganizationId(user);
  if (!organizationId || !Number.isInteger(Number(classId))) return null;

  if (user.role === "organization") {
    const result = await pool.query(
      `SELECT id, organization_id, name
       FROM classes
       WHERE id = $1 AND organization_id = $2`,
      [classId, organizationId]
    );
    return result.rows[0] || null;
  }

  if (user.role === "teacher") {
    const result = await pool.query(
      `SELECT c.id, c.organization_id, c.name
       FROM classes c
       INNER JOIN class_teachers ct ON ct.class_id = c.id
       WHERE c.id = $1
         AND c.organization_id = $2
         AND ct.teacher_id = $3`,
      [classId, organizationId, user.reference_id]
    );
    return result.rows[0] || null;
  }

  if (user.role === "student") {
    const result = await pool.query(
      `SELECT c.id, c.organization_id, c.name
       FROM classes c
       INNER JOIN students s ON s.class_id = c.id
       WHERE c.id = $1
         AND c.organization_id = $2
         AND s.id = $3`,
      [classId, organizationId, user.reference_id]
    );
    return result.rows[0] || null;
  }

  return null;
};

const messageSelect = `
  SELECT
    m.id,
    m.class_id,
    m.sender_user_id,
    m.sender_role,
    m.sender_reference_id,
    CASE
      WHEN m.sender_role = 'organization' THEN o.organization_name
      WHEN m.sender_role = 'teacher' THEN t.full_name
      WHEN m.sender_role = 'student' THEN s.full_name
      ELSE 'EduSphere member'
    END AS sender_name,
    m.message,
    m.created_at
  FROM class_messages m
  LEFT JOIN organizations o
    ON m.sender_role = 'organization' AND o.id = m.sender_reference_id
  LEFT JOIN teachers t
    ON m.sender_role = 'teacher' AND t.id = m.sender_reference_id
  LEFT JOIN students s
    ON m.sender_role = 'student' AND s.id = m.sender_reference_id
`;

const listMessages = async (req, res) => {
  try {
    const classAccess = await getClassAccess(req.user, req.params.classId);
    if (!classAccess) return res.status(403).json({ message: "You do not have access to this class chat." });

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 100;

    const result = await pool.query(
      `${messageSelect}
       WHERE m.class_id = $1 AND m.organization_id = $2
       ORDER BY m.created_at DESC, m.id DESC
       LIMIT $3`,
      [classAccess.id, classAccess.organization_id, limit]
    );

    res.json(result.rows.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load class chat." });
  }
};

const createMessage = async (req, res) => {
  try {
    const classAccess = await getClassAccess(req.user, req.params.classId);
    if (!classAccess) return res.status(403).json({ message: "You do not have access to this class chat." });

    const message = String(req.body.message || "").trim();
    if (!message) return res.status(400).json({ message: "Message cannot be empty." });
    if (message.length > 2000) return res.status(400).json({ message: "Message cannot exceed 2000 characters." });

    const result = await pool.query(
      `INSERT INTO class_messages
        (organization_id, class_id, sender_user_id, sender_role, sender_reference_id, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        classAccess.organization_id,
        classAccess.id,
        req.user.userId,
        req.user.role,
        req.user.reference_id,
        message,
      ]
    );

    const created = await pool.query(
      `${messageSelect} WHERE m.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(created.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to send class chat message." });
  }
};

module.exports = { listMessages, createMessage };
