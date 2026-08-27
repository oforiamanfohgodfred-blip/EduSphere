import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

function TeacherDashboardContent() {
  const navigate = useNavigate();
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
        if (active) {
          setError(requestError.response?.data?.message || "Unable to load your classes.");
        }
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
      <p className="dashboard-subtitle">
        Your assigned classes and connected learning spaces.
      </p>

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
                <button
                  type="button"
                  className="action-btn"
                  key={item.id}
                  onClick={() => navigate(`/teacher/classes/${item.id}`)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.code} · {item.student_count || 0} students</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Class access</h2>
          <p>
            Assignments, resources, announcements and other VLE tools will be
            attached to the classes you are assigned to.
          </p>
          {classes[0] && (
            <button
              type="button"
              className="action-btn"
              onClick={() => navigate(`/teacher/classes/${classes[0].id}`)}
            >
              Open first class
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardContent;
