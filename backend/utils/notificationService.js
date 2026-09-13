const notifyClassUsers = async (client, { organizationId, classId, type, title, body, link, excludeUserId = null }) => {
  const { rows } = await client.query(
    `SELECT DISTINCT u.id
     FROM users u
     WHERE u.organization_id = $1
       AND u.is_active = TRUE
       AND u.id <> COALESCE($3, -1)
       AND (
         (u.role = 'student' AND EXISTS (
           SELECT 1 FROM students s WHERE s.id = u.reference_id AND s.organization_id = $1 AND s.class_id = $2
         ))
         OR
         (u.role = 'teacher' AND EXISTS (
           SELECT 1 FROM teachers t
           JOIN class_teachers ct ON ct.teacher_id = t.id
           WHERE t.id = u.reference_id AND t.organization_id = $1 AND ct.class_id = $2
         ))
       )`,
    [organizationId, classId, excludeUserId]
  );

  if (!rows.length) return 0;
  const values = [];
  const placeholders = rows.map((row, index) => {
    const base = index * 6;
    values.push(organizationId, row.id, type, title, body || null, link || null);
    return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6})`;
  }).join(',');

  await client.query(
    `INSERT INTO notifications (organization_id,user_id,type,title,body,link) VALUES ${placeholders}`,
    values
  );
  return rows.length;
};

const notifyUser = async (client, { organizationId, userId, type, title, body, link }) => {
  if (!userId) return 0;
  await client.query(
    `INSERT INTO notifications (organization_id,user_id,type,title,body,link) VALUES ($1,$2,$3,$4,$5,$6)`,
    [organizationId, userId, type, title, body || null, link || null]
  );
  return 1;
};

module.exports = { notifyClassUsers, notifyUser };
