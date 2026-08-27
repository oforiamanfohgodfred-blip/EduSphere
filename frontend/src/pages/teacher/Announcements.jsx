import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import "../../styles/vle.css";

function Announcements() {
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      const response = await api.get("/teachers/classes");
      const data = response.data || [];
      setClasses(data);
      if (data[0]) setClassId(String(data[0].id));
      const all = [];
      for (const item of data) {
        try {
          const r = await api.get(`/teachers/learning/classes/${item.id}/announcements`);
          (r.data || []).forEach((a) => all.push({ ...a, class_name: item.name }));
        } catch (_) {}
      }
      setAnnouncements(all);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load your classes.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    if (!classId || !title.trim() || !body.trim()) return setError("Select a class and complete the announcement.");
    try {
      setSaving(true); setError("");
      await api.post("/teachers/learning/announcements", { class_id: Number(classId), title, body });
      setTitle(""); setBody(""); await load();
    } catch (e) { setError(e.response?.data?.message || "Unable to post announcement."); }
    finally { setSaving(false); }
  };

  return <DashboardLayout role="teacher">
    <div className="vle-page-shell">
      <div className="page-header"><div><span className="eyebrow">CLASS COMMUNICATION</span><h1>Announcements</h1><p>Publish updates directly to the class you teach.</p></div></div>
      {error && <div className="error-message">{error}</div>}
      <section className="dashboard-card vle-form-card">
        <div className="card-heading"><div><span className="eyebrow">NEW POST</span><h2>Publish Announcement</h2></div></div>
        <form onSubmit={post} className="class-form-grid">
          <label>Class<select value={classId} onChange={(e) => setClassId(e.target.value)} required><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" required /></label>
          <label className="wide-field">Message<textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write an update for your students..." rows="5" required /></label>
          <div className="form-action"><button type="submit" disabled={saving || loading}>{saving ? "Publishing..." : "Publish to Class"}</button></div>
        </form>
      </section>
      <section className="dashboard-card"><div className="card-heading"><div><span className="eyebrow">LIVE FROM DATABASE</span><h2>Published Announcements</h2></div></div>
        {loading ? <div className="empty-state">Loading...</div> : announcements.length === 0 ? <div className="empty-state"><strong>No announcements yet</strong><span>Your published class updates will appear here.</span></div> : announcements.map((a) => <article className="list-item" key={a.id}><span className="vle-chip">{a.class_name}</span><h3>{a.title}</h3><p>{a.body}</p><small>{new Date(a.created_at).toLocaleString()}</small></article>)}
      </section>
    </div>
  </DashboardLayout>;
}
export default Announcements;
