import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Dashboard() {
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadClass = async () => {
      try {
        const response = await api.get("/classes/student/my");
        if (active) setClassInfo(response.data?.[0] || null);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load your class.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadClass();
    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout role="student">
      <h1>Student Dashboard</h1>
      <p className="dashboard-subtitle">
        {classInfo ? `Welcome to ${classInfo.name}.` : "Welcome back! Here is your learning overview."}
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>My Class</h3>
          <p>{loading ? "—" : classInfo?.name || "Not assigned"}</p>
        </div>
        <div className="stat-card">
          <h3>Classmates</h3>
          <p>{loading ? "—" : classInfo?.student_count ?? "—"}</p>
        </div>
        <div className="stat-card">
          <h3>Teachers</h3>
          <p>{loading ? "—" : classInfo?.teacher_count ?? "—"}</p>
        </div>
        <div className="stat-card">
          <h3>Subjects</h3>
          <p>{loading ? "—" : classInfo?.subject_count ?? "—"}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h2>My Learning Space</h2>
          <p>
            {classInfo
              ? "Your class is connected. Learning materials, assignments, announcements and other VLE tools will appear here as they are made available."
              : "You have not been assigned to a class yet. Your organization will assign one when your account is set up."}
          </p>
          {classInfo && (
            <Link to={`/student/classes/${classInfo.id}`}>Open my class →</Link>
          )}
        </div>

        <div className="section-card">
          <h2>Upcoming Activities</h2>
          <p>No upcoming activities have been published yet.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
