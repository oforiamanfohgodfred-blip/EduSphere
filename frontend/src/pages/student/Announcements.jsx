import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const classes = await api.get("/classes/student/my");
        const classInfo = classes.data?.[0];
        if (!classInfo) return;
        const response = await api.get(`/vle/classes/${classInfo.id}/announcements`);
        if (active) setAnnouncements(response.data || []);
      } catch (e) {
        if (active) setError(e.response?.data?.message || "Unable to load announcements.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return <DashboardLayout role="student">
    <h1>Announcements</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div className="section-card">
      <h2>Class Announcements</h2>
      {loading ? <p>Loading announcements...</p> : announcements.length ? announcements.map(a => <article key={a.id}><h3>{a.title}</h3><p>{a.body}</p><small>{a.teacher_name || "Teacher"} · {new Date(a.created_at).toLocaleString()}</small><hr /></article>) : <p>No announcements have been published to your class yet.</p>}
    </div>
  </DashboardLayout>;
}

export default Announcements;
