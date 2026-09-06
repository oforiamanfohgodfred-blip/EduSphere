import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const classes = await api.get("/classes/student/my");
        const classInfo = classes.data?.[0];
        if (!classInfo) return;
        const response = await api.get(`/vle/classes/${classInfo.id}/resources`);
        if (active) setResources(response.data || []);
      } catch (e) {
        if (active) setError(e.response?.data?.message || "Unable to load resources.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return <DashboardLayout role="student">
    <h1>Learning Resources</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div className="section-card">
      <h2>Class Resources</h2>
      {loading ? <p>Loading resources...</p> : resources.length ? resources.map(r => <article key={r.id}><h3>{r.title}</h3><p>{r.description || ""}</p><small>{r.subject_name || "General"} · {r.resource_type}</small><br /><a href={r.resource_url} target="_blank" rel="noreferrer">Open resource</a><hr /></article>) : <p>No learning resources have been published to your class yet.</p>}
    </div>
  </DashboardLayout>;
}

export default Resources;
