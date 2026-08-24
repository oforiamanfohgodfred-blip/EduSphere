const pool = require("../config/db");

const organizationId = (req) => Number(req.user?.organization_id);

const getClasses = async (req, res) => {
  try {
    const orgId = organizationId(req);
    if (!orgId) return res.status(400).json({ message: "Organization context is required." });
    const result = await pool.query(
      `SELECT id, organization_id, name, code, description, academic_year, created_at
       FROM classes WHERE organization_id = $1 ORDER BY name ASC`,
      [orgId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load classes." });
  }
};

const addClass = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const { name, code, description, academic_year } = req.body;
    if (!orgId) return res.status(400).json({ message: "Organization context is required." });
    if (!name || !code) return res.status(400).json({ message: "Class name and code are required." });

    const result = await pool.query(
      `INSERT INTO classes (organization_id, name, code, description, academic_year)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, organization_id, name, code, description, academic_year, created_at`,
      [orgId, name.trim(), code.trim().toUpperCase(), description || null, academic_year || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ message: "A class with this name or code already exists." });
    console.error(error);
    res.status(500).json({ message: "Failed to add class." });
  }
};

const updateClass = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const { name, code, description, academic_year } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Class name and code are required." });
    const result = await pool.query(
      `UPDATE classes SET name=$1, code=$2, description=$3, academic_year=$4
       WHERE id=$5 AND organization_id=$6
       RETURNING id, organization_id, name, code, description, academic_year, created_at`,
      [name.trim(), code.trim().toUpperCase(), description || null, academic_year || null, req.params.id, orgId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Class not found." });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ message: "A class with this name or code already exists." });
    console.error(error);
    res.status(500).json({ message: "Failed to update class." });
  }
};

const deleteClass = async (req, res) => {
  try {
    const orgId = organizationId(req);
    const result = await pool.query(
      "DELETE FROM classes WHERE id=$1 AND organization_id=$2 RETURNING id",
      [req.params.id, orgId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Class not found." });
    res.json({ message: "Class deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete class." });
  }
};

module.exports = { getClasses, addClass, updateClass, deleteClass };
