import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Assignments() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: "", instructions: "", maxMarks: 100, dueAt: "", subjectId: "", status: "published" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/teacher/my");
      const items = Array.isArray(response.data) ? response.data : [];
      setClasses(items);
      if (!selectedClass && items[0]) setSelectedClass(String(items[0].id));
    } catch (e) { setError(e.response?.data?.message || "Unable to load classes."); }
    finally { setLoading(false); }
  };

  const loadAssignments = async (classId) => {
    if (!classId) return setAssignments([]);
    try {
      const response = await api.get(`/vle/classes/${classId}/assignments`);
      setAssignments(response.data || []);
    } catch (e) { setError(e.response?.data?.message || "Unable to load assignments."); }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadAssignments(selectedClass); }, [selectedClass]);

  const createAssignment = async (event) => {
    event.preventDefault();
    if (!selectedClass) return setError("Select a class first.");
    try {
      setSaving(true); setError("");
      await api.post("/vle/assignments", { ...form, classId: Number(selectedClass), maxMarks: Number(form.maxMarks), subjectId: form.subjectId ? Number(form.subjectId) : undefined });
      setForm({ title: "", instructions: "", maxMarks: 100, dueAt: "", subjectId: "", status: "published" });
      await loadAssignments(selectedClass);
    } catch (e) { setError(e.response?.data?.message || "Unable to create assignment."); }
    finally { setSaving(false); }
  };

  return <DashboardLayout role="teacher">
    <h1>Assignments</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div className="section-card">
      <label htmlFor="assignment-class">Class</label>
      <select id="assignment-class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={loading}>
        <option value="">Select class</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    <div className="section-card">
      <h2>Create Assignment</h2>
      <form onSubmit={createAssignment}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Instructions" value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} />
        <input type="number" min="1" placeholder="Maximum marks" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} required />
        <input type="datetime-local" value={form.dueAt} onChange={e => setForm({ ...form, dueAt: e.target.value })} />
        <button className="login-btn" disabled={saving}>{saving ? "Publishing..." : "Publish Assignment"}</button>
      </form>
    </div>
    <div className="section-card"><h2>Published Assignments</h2>{assignments.length ? assignments.map(a => <article key={a.id}><h3>{a.title}</h3><p>{a.instructions || "No instructions."}</p><small>{a.max_marks} marks{a.due_at ? ` · Due ${new Date(a.due_at).toLocaleString()}` : ""}</small><hr /></article>) : <p>No published assignments for this class.</p>}</div>
  </DashboardLayout>;
}
export default Assignments;
