import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";

function TeacherDashboardContent() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/teachers/classes")
      .then((response) => setClasses(response.data || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load your classes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="section-kicker">TEACHING WORKSPACE</span>
          <h1>Teacher Dashboard</h1>
          <p>Manage your assigned classes and everything you publish to them.</p>
        </div>
        <Link className="primary-button" to="/teacher/staff-chat">Open Staff Chat</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>My Classes</h3><p>{classes.length}</p></div>
        <div className="stat-card"><h3>Students</h3><p>{classes.reduce((sum, item) => sum + Number(item.student_count || 0), 0)}</p></div>
        <div className="stat-card"><h3>Subjects</h3><p>{classes.reduce((sum, item) => sum + Number(item.subject_count || 0), 0)}</p></div>
        <div className="stat-card"><h3>VLE</h3><p>Connected</p></div>
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div><span className="section-kicker">YOUR CLASSES</span><h2>Teaching Spaces</h2><p>Open a class to work with its students, subjects and class chat.</p></div>
        </div>
        {error && <div className="error-message">{error}</div>}
        {loading ? <p>Loading your classes...</p> : classes.length === 0 ? (
          <div className="empty-state"><strong>No classes assigned yet.</strong><span>Your organization needs to assign you to a class first.</span></div>
        ) : (
          <div className="class-grid">
            {classes.map((item) => (
              <Link key={item.id} to={`/teacher/classes/${item.id}`} className="class-card teacher-class-link">
                <span className="class-code">{item.code || "CLASS"}</span>
                <h3>{item.name}</h3>
                <p>{item.description || "Open this teaching space."}</p>
                <div className="class-mini-stats"><span>{item.student_count || 0} students</span><span>{item.subject_count || 0} subjects</span></div>
                <em>Open class →</em>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboardContent;
