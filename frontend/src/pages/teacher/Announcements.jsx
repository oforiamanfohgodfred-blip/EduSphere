import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Announcements() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
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

  const loadAnnouncements = async (classId) => {
    if (!classId) return setAnnouncements([]);
    try {
      const response = await api.get(`/vle/classes/${classId}/announcements`);
      setAnnouncements(response.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load announcements.");
    }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadAnnouncements(selectedClass); }, [selectedClass]);

  const publish = async (event) => {
    event.preventDefault();
    if (!selectedClass) return setError("Select a class first.");
    try {
      setSaving(true); setError("");
      await api.post("/vle/announcements", { classId: Number(selectedClass), ...form });
      setForm({ title: "", body: "" });
      await loadAnnouncements(selectedClass);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to publish announcement.");
    } finally {
      setSaving(false);
    }
  };

  return <DashboardLayout role="teacher">
    <h1>Announcements</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div className="section-card">
      <label htmlFor="announcement-class">Class</label>
      <select id="announcement-class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={loading}>
        <option value="">Select class</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    <div className="section-card">
      <h2>Publish Announcement</h2>
      <form onSubmit={publish}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Message for your class" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required />
        <button className="login-btn" disabled={saving}>{saving ? "Publishing..." : "Publish"}</button>
      </form>
    </div>
    <div className="section-card">
      <h2>Class Announcements</h2>
      {announcements.length ? announcements.map(a => <article key={a.id}><h3>{a.title}</h3><p>{a.body}</p><small>{a.teacher_name || "You"} · {new Date(a.created_at).toLocaleString()}</small><hr /></article>) : <p>No announcements for this class yet.</p>}
    </div>
  </DashboardLayout>;
}

export default Announcements;
