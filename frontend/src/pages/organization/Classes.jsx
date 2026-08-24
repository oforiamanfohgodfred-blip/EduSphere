import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/dashboard.css";

const emptyForm = { name: "", code: "", description: "", academic_year: "" };

function Classes() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/classes");
      setClasses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load classes.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadClasses(); }, []);
  const handleChange = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError("");
      if (editingId) {
        const response = await api.put(`/classes/${editingId}`, form);
        setClasses((current) => current.map((item) => item.id === editingId ? response.data : item));
      } else {
        const response = await api.post("/classes", form);
        setClasses((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetForm();
    } catch (err) { setError(err.response?.data?.message || "Unable to save class."); }
    finally { setSaving(false); }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, code: item.code, description: item.description || "", academic_year: item.academic_year || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      setError(""); await api.delete(`/classes/${id}`);
      setClasses((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (err) { setError(err.response?.data?.message || "Unable to delete class."); }
  };

  return (
    <div className="dashboard-page classes-page">
      <div className="page-header">
        <div><h1>Class Management</h1><p>Create and organize the classes in your school or organization.</p></div>
        <div className="stat-card"><strong>{classes.length}</strong><span>Total Classes</span></div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <section className="dashboard-card class-form-card">
        <div className="card-heading">
          <div><h2>{editingId ? "Edit Class" : "Create Class"}</h2><p>{editingId ? "Update the class details." : "Add a class to your organization."}</p></div>
          {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
        </div>
        <form onSubmit={handleSubmit} className="class-form-grid">
          <label>Class name<input name="name" placeholder="e.g. JHS 1" value={form.name} onChange={handleChange} required /></label>
          <label>Class code<input name="code" placeholder="e.g. JHS1" value={form.code} onChange={handleChange} required /></label>
          <label>Academic year<input name="academic_year" placeholder="e.g. 2026/2027" value={form.academic_year} onChange={handleChange} /></label>
          <label className="wide-field">Description<textarea name="description" rows="3" placeholder="Optional class description" value={form.description} onChange={handleChange} /></label>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Create Class"}</button>
        </form>
      </section>
      <section className="dashboard-card">
        <div className="card-heading"><div><h2>Your Classes</h2><p>Classes belonging only to this organization are shown.</p></div></div>
        {loading ? <div className="empty-state">Loading classes...</div> : classes.length === 0 ? <div className="empty-state"><strong>No classes yet</strong><span>Create your first class above.</span></div> : (
          <div className="class-grid">
            {classes.map((item) => <article className="class-card" key={item.id}>
              <div className="class-card-top"><span className="class-code">{item.code}</span><span>{item.academic_year || "No year set"}</span></div>
              <h3>{item.name}</h3><p>{item.description || "No description provided."}</p>
              <div className="class-actions"><button type="button" onClick={() => startEdit(item)}>Edit</button><button type="button" className="danger-button" onClick={() => handleDelete(item.id)}>Delete</button></div>
            </article>)}
          </div>
        )}
      </section>
    </div>
  );
}

export default Classes;
