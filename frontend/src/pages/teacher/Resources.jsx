import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Resources() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", resourceUrl: "", resourceType: "link", subjectId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/teacher/my");
      const items = Array.isArray(response.data) ? response.data : [];
      setClasses(items);
      if (!selectedClass && items[0]) setSelectedClass(String(items[0].id));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async (classId) => {
    if (!classId) return setResources([]);
    try {
      const response = await api.get(`/vle/classes/${classId}/resources`);
      setResources(response.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load resources.");
    }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadResources(selectedClass); }, [selectedClass]);

  const selected = classes.find(c => String(c.id) === selectedClass);
  const subjects = selected?.subjects || [];

  const publish = async (event) => {
    event.preventDefault();
    if (!selectedClass) return setError("Select a class first.");
    try {
      setSaving(true); setError("");
      await api.post("/vle/resources", { classId: Number(selectedClass), ...form, subjectId: form.subjectId ? Number(form.subjectId) : undefined });
      setForm({ title: "", description: "", resourceUrl: "", resourceType: "link", subjectId: "" });
      await loadResources(selectedClass);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to publish resource.");
    } finally {
      setSaving(false);
    }
  };

  return <DashboardLayout role="teacher">
    <h1>Resources</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div className="section-card">
      <label htmlFor="resource-class">Class</label>
      <select id="resource-class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={loading}>
        <option value="">Select class</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    <div className="section-card">
      <h2>Add Learning Resource</h2>
      <form onSubmit={publish}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="url" placeholder="https://..." value={form.resourceUrl} onChange={e => setForm({ ...form, resourceUrl: e.target.value })} required />
        <select value={form.resourceType} onChange={e => setForm({ ...form, resourceType: e.target.value })}><option value="link">Link</option><option value="video">Video</option><option value="document">Document</option></select>
        {subjects.length > 0 && <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">General</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select>}
        <button className="login-btn" disabled={saving}>{saving ? "Publishing..." : "Publish Resource"}</button>
      </form>
    </div>
    <div className="section-card">
      <h2>Class Resources</h2>
      {resources.length ? resources.map(r => <article key={r.id}><h3>{r.title}</h3><p>{r.description || ""}</p><small>{r.subject_name || "General"} · {r.resource_type}</small><br /><a href={r.resource_url} target="_blank" rel="noreferrer">Open resource</a><hr /></article>) : <p>No resources for this class yet.</p>}
    </div>
  </DashboardLayout>;
}

export default Resources;
