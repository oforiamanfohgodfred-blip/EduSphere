import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function ClassWorkspace() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ assignments: [], announcements: [], resources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(`/vle/classes/${id}/assignments`),
      api.get(`/vle/classes/${id}/announcements`),
      api.get(`/vle/classes/${id}/resources`),
    ]).then(([a, n, r]) => {
      if (active) setData({ assignments: a.data || [], announcements: n.data || [], resources: r.data || [] });
    }).catch((e) => {
      if (active) setError(e.response?.data?.message || "Unable to load your class.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return <DashboardLayout role="student">
    <Link to="/student/dashboard">← Dashboard</Link>
    <h1>Class Workspace</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
      {["overview", "assignments", "announcements", "resources"].map((item) => <button type="button" key={item} className={tab === item ? "login-btn" : "action-btn"} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
    </div>
    {loading ? <div className="section-card"><p>Loading your class...</p></div> : <div className="dashboard-sections">
      {tab === "overview" && <><div className="section-card"><h2>Assignments</h2><p>{data.assignments.length} published</p></div><div className="section-card"><h2>Announcements</h2><p>{data.announcements.length} posted</p></div><div className="section-card"><h2>Resources</h2><p>{data.resources.length} available</p></div></>}
      {tab === "assignments" && <div className="section-card"><h2>Assignments</h2>{data.assignments.length ? data.assignments.map(a => <article key={a.id}><h3>{a.title}</h3><p>{a.instructions || "No instructions provided."}</p><small>{a.subject_name || "General"} · {a.max_marks} marks{a.due_at ? ` · Due ${new Date(a.due_at).toLocaleString()}` : ""}</small><hr /></article>) : <p>No assignments have been published yet.</p>}</div>}
      {tab === "announcements" && <div className="section-card"><h2>Announcements</h2>{data.announcements.length ? data.announcements.map(a => <article key={a.id}><h3>{a.title}</h3><p>{a.body}</p><small>{a.teacher_name} · {new Date(a.created_at).toLocaleString()}</small><hr /></article>) : <p>No announcements yet.</p>}</div>}
      {tab === "resources" && <div className="section-card"><h2>Resources</h2>{data.resources.length ? data.resources.map(r => <article key={r.id}><h3>{r.title}</h3><p>{r.description || ""}</p><a href={r.resource_url} target="_blank" rel="noreferrer">Open resource</a><hr /></article>) : <p>No resources yet.</p>}</div>}
    </div>}
  </DashboardLayout>;
}
export default ClassWorkspace;
