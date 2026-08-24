import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/dashboard.css";

const emptyForm = { name: "", code: "", description: "" };

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      if (editingId) {
        const response = await api.put(`/subjects/${editingId}`, form);
        setSubjects((current) => current.map((item) => item.id === editingId ? response.data : item));
      } else {
        const response = await api.post("/subjects", form);
        setSubjects((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save subject.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setForm({ name: subject.name, code: subject.code, description: subject.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      setError("");
      await api.delete(`/subjects/${id}`);
      setSubjects((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete subject.");
    }
  };

  return (
    <div className="dashboard-page subjects-page">
      <div className="page-header">
        <div><h1>Subject Management</h1><p>Create and manage the subjects offered by your organization.</p></div>
        <div className="stat-card"><strong>{subjects.length}</strong><span>Total Subjects</span></div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="dashboard-card">
        <div className="card-heading">
          <div><h2>{editingId ? "Edit Subject" : "Create Subject"}</h2><p>{editingId ? "Update the subject details." : "Add a subject to your organization."}</p></div>
          {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
        </div>
        <form onSubmit={handleSubmit} className="class-form-grid">
          <label>Subject name<input name="name" placeholder="e.g. Mathematics" value={form.name} onChange={handleChange} required /></label>
          <label>Subject code<input name="code" placeholder="e.g. MATH" value={form.code} onChange={handleChange} required /></label>
          <label className="wide-field">Description<textarea name="description" rows="3" placeholder="Optional description" value={form.description} onChange={handleChange} /></label>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Create Subject"}</button>
        </form>
      </section>

      <section className="dashboard-card">
        <div className="card-heading"><div><h2>Your Subjects</h2><p>Only subjects belonging to this organization are shown.</p></div></div>
        {loading ? <div className="empty-state">Loading subjects...</div> : subjects.length === 0 ? <div className="empty-state"><strong>No subjects yet</strong><span>Create your first subject above.</span></div> : (
          <div className="class-grid">
            {subjects.map((subject) => (
              <article className="class-card" key={subject.id}>
                <div className="class-card-top"><span className="class-code">{subject.code}</span></div>
                <h3>{subject.name}</h3>
                <p>{subject.description || "No description provided."}</p>
                <div className="class-actions"><button type="button" onClick={() => startEdit(subject)}>Edit</button><button type="button" className="danger-button" onClick={() => handleDelete(subject.id)}>Delete</button></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Subjects;
