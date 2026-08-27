import { useEffect, useState } from "react";
import api from "../../../services/api";

function TeacherDashboardContent() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadClasses = async () => {
      try {
        setLoading(true);
        const response = await api.get("/classes/teacher/my");
        if (active) setClasses(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Unable to load your classes.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadClasses();
    return () => { active = false; };
  }, []);

  const studentCount = classes.reduce((total, item) => total + Number(item.student_count || 0), 0);
  const subjectCount = classes.reduce((total, item) => total + Number(item.subject_count || 0), 0);

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <p className="dashboard-subtitle">Your assigned classes and connected learning spaces.</p>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><h3>My Classes</h3><p>{loading ? "—" : classes.length}</p></div>
        <div className="stat-card"><h3>Students</h3><p>{loading ? "—" : studentCount}</p></div>
        <div className="stat-card"><h3>Subjects</h3><p>{loading ? "—" : subjectCount}</p></div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h2>My Learning Spaces</h2>
          {loading ? (
            <p>Loading your classes...</p>
          ) : classes.length === 0 ? (
            <p>No classes have been assigned to you yet.</p>
          ) : (
            <div className="class-list">
              {classes.map((item) => (
                <div className="action-btn" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.code} · {item.student_count || 0} students · {item.subject_count || 0} subjects</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Class access</h2>
          <p>
            This dashboard now uses live class assignments from the backend.
            Class-level VLE tools will be opened through the dedicated teacher class workspace rather than fake dashboard actions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardContent;
