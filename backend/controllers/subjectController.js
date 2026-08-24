const pool = require("../config/db");

const getOrganizationId = (req) =>
  req.user?.role === "admin" ? null : Number(req.user?.organization_id);

const getSubjects = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `SELECT id, organization_id, name, code, description, created_at
       FROM subjects
       WHERE ($1::integer IS NULL OR organization_id = $1)
       ORDER BY name ASC`,
      [organizationId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load subjects." });
  }
};

const addSubject = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { name, code, description } = req.body;
    if (!organizationId || !name || !code) {
      return res.status(400).json({ message: "Subject name and code are required." });
    }
    const result = await pool.query(
      `INSERT INTO subjects (organization_id, name, code, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, organization_id, name, code, description, created_at`,
      [organizationId, name.trim(), code.trim().toUpperCase(), description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "A subject with this name or code already exists in this organization." });
    }
    res.status(500).json({ message: "Failed to add subject." });
  }
};

const updateSubject = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const { name, code, description } = req.body;
    const result = await pool.query(
      `UPDATE subjects
       SET name=$1, code=$2, description=$3
       WHERE id=$4 AND ($5::integer IS NULL OR organization_id=$5)
       RETURNING id, organization_id, name, code, description, created_at`,
      [name?.trim(), code?.trim().toUpperCase(), description || null, req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Subject not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") return res.status(400).json({ message: "A subject with this name or code already exists in this organization." });
    res.status(500).json({ message: "Failed to update subject." });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const result = await pool.query(
      `DELETE FROM subjects
       WHERE id=$1 AND ($2::integer IS NULL OR organization_id=$2)
       RETURNING id`,
      [req.params.id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Subject not found." });
    res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete subject." });
  }
};

module.exports = { getSubjects, addSubject, updateSubject, deleteSubject };
