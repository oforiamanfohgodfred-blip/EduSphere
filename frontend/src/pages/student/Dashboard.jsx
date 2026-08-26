import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Dashboard() {
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/students/learning/space")
      .then((response) => setSpace(response.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load your learning overview."))
      .finally(() => setLoading(false));
  }, []);

  const assignments = space?.assignments || [];
  const resources = space?.resources || [];
  const announcements = space?.announcements || [];
  const meetings = space?.live_meetings || [];
  const student = space?.student;

  return (
    <DashboardLayout role="student">
      <div className="vle-page-shell">
        <div className="page-header">
          <div>
            <span className="eyebrow">LEARNING WORKSPACE</span>
            <h1>Welcome back{student?.full_name ? `, ${student.full_name}` : ""}</h1>
            <p>{space?.class?.name ? `${space.class.name} · Your connected learning overview` : "Everything happening in your learning space."}</p>
          </div>
          {space?.class && <Link className="primary-button" to="/student/class">Open My Class</Link>}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card"><h3>Assignments</h3><p>{loading ? "—" : assignments.length}</p></div>
          <div className="stat-card"><h3>Resources</h3><p>{loading ? "—" : resources.length}</p></div>
          <div className="stat-card"><h3>Announcements</h3><p>{loading ? "—" : announcements.length}</p></div>
          <div className="stat-card"><h3>Upcoming Meetings</h3><p>{loading ? "—" : meetings.filter((m) => new Date(m.starts_at) >= new Date()).length}</p></div>
        </div>

        <div className="dashboard-sections">
          <section className="section-card">
            <h2>Latest Announcements</h2>
            {loading ? <p>Loading...</p> : announcements.length === 0 ? <p>No announcements yet.</p> : announcements.slice(0, 4).map((item) => (
              <div className="list-item" key={item.id}><h3>{item.title}</h3><p>{item.body}</p><small>Posted by {item.teacher_name}</small></div>
            ))}
          </section>

          <section className="section-card">
            <h2>Upcoming Activities</h2>
            {loading ? <p>Loading...</p> : meetings.length === 0 && assignments.length === 0 ? <p>No upcoming learning activities.</p> : (
              <>
                {meetings.slice(0, 3).map((item) => <div className="list-item" key={`meeting-${item.id}`}><h3>{item.title}</h3><p>{item.subject_name || "Class meeting"}</p><small>{new Date(item.starts_at).toLocaleString()}</small></div>)}
                {assignments.slice(0, 3).map((item) => <div className="list-item" key={`assignment-${item.id}`}><h3>{item.title}</h3><p>{item.subject_name || "Assignment"}</p><small>{item.due_at ? `Due ${new Date(item.due_at).toLocaleString()}` : "No due date"}</small></div>)}
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
