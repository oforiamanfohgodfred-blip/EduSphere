import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Assignments() {
  const [classes, setClasses] = useState([]);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ class_id: "", subject_id: "", title: "", instructions: "", due_at: "", max_score: 100 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const { data } = await api.get("/teacher-classes");
      setClasses(data);
      if (data[0]) await selectClass(data[0].id, data);
    } catch (e) { setError(e.response?.data?.message || "Unable to load your classes."); }
    finally { setLoading(false); }
  };

  const selectClass = async (id, source = classes) => {
    const selected = source.find((item) => item.id === Number(id));
    setForm((f) => ({ ...f, class_id: String(id), subject_id: "" }));
    try {
      const { data } = await api.get(`/teacher-classes/${id}`);
      setClassData(data);
      const { data: items } = await api.get(`/teacher-learning/classes/${id}/assignments`);
      setAssignments(items);
      if (data.subjects?.length) setForm((f) => ({ ...f, subject_id: String(data.subjects[0].id) }));
    } catch (e) { setError(e.response?.data?.message || "Unable to load class assignments."); }
    if (!selected) setClassData(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.class_id || !form.subject_id) return setError("Select a class and subject.");
    try {
      setSaving(true); setError("");
      await api.post("/teacher-learning/assignments", { ...form, due_at: form.due_at || null, max_score: Number(form.max_score) });
      setForm((f) => ({ ...f, title: "", instructions: "", due_at: "" }));
      await selectClass(form.class_id);
    } catch (e) { setError(e.response?.data?.message || "Unable to publish assignment."); }
    finally { setSaving(false); }
  };

  return <DashboardLayout role="teacher">
    <div className="vle-page-shell">
      <div className="page-header"><div><span className="eyebrow">LEARNING WORKSPACE</span><h1>Assignments</h1><p>Create assignments directly for the classes you teach.</p></div></div>
      {error && <div className="error-message">{error}</div>}
      {loading ? <div className="empty-state">Loading your classes...</div> : <>
        <section className="dashboard-card vle-form-card">
          <div className="card-heading"><div><span className="eyebrow">PUBLISH TO CLASS</span><h2>New Assignment</h2></div></div>
          <form onSubmit={submit} className="class-form-grid">
            <label>Class<select value={form.class_id} onChange={(e) => selectClass(e.target.value)} required><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Subject<select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required><option value="">Select subject</option>{(classData?.subjects || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Assignment title" /></label>
            <label>Due date<input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} /></label>
            <label>Maximum score<input type="number" min="1" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} /></label>
            <label className="wide-field">Instructions<textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Tell students what they need to do..." /></label>
            <div className="form-action"><button type="submit" disabled={saving || !classes.length}>{saving ? "Publishing..." : "Publish Assignment"}</button></div>
          </form>
        </section>
        <section className="dashboard-card"><div className="card-heading"><div><span className="eyebrow">{classData?.name || "MY CLASSES"}</span><h2>Published Assignments</h2></div><span className="section-accent">{assignments.length} total</span></div>
          {assignments.length ? <div className="people-grid">{assignments.map((a) => <article className="person-card" key={a.id}><div className="person-info"><span className="person-id">{a.subject_name}</span><h3>{a.title}</h3><p>{a.instructions || "No additional instructions."}</p><small>Due: {a.due_at ? new Date(a.due_at).toLocaleString() : "No due date"}</small><small>Submissions: {a.submission_count || 0}</small></div></article>)}</div> : <div className="empty-state"><strong>No assignments yet</strong><span>Create one above for {classData?.name || "your class"}.</span></div>}
        </section>
      </>}
    </div>
  </DashboardLayout>;
}
export default Assignments;