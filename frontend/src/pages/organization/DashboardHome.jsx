import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";

const safeArray = (result) => (result.status === "fulfilled" && Array.isArray(result.value.data) ? result.value.data : []);
const safeObject = (result, fallback) => (result.status === "fulfilled" && result.value.data ? result.value.data : fallback);

function DashboardHome() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ teachers: 0, students: 0, classes: 0, subjects: 0 });
  const [monitoring, setMonitoring] = useState({ published_assignments: 0, submitted_work: 0, awaiting_grading: 0, upcoming_exams: 0 });
  const [loading, setLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState(false);
  const [monitoringError, setMonitoringError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const results = await Promise.allSettled([
        api.get("/teachers"),
        api.get("/students"),
        api.get("/classes"),
        api.get("/subjects"),
        api.get("/organizations/monitoring"),
      ]);

      if (!active) return;

      const [teachers, students, classes, subjects, activity] = results;
      const successfulDirectoryRequests = [teachers, students, classes, subjects].filter((result) => result.status === "fulfilled").length;

      setCounts({
        teachers: safeArray(teachers).length,
        students: safeArray(students).length,
        classes: safeArray(classes).length,
        subjects: safeArray(subjects).length,
      });
      setMonitoring(safeObject(activity, { published_assignments: 0, submitted_work: 0, awaiting_grading: 0, upcoming_exams: 0 }));
      setDirectoryError(successfulDirectoryRequests < 4);
      setMonitoringError(activity.status !== "fulfilled");
      setLoading(false);
    })();

    return () => { active = false; };
  }, []);

  const displayName = user?.organization_name || user?.organization?.name || user?.name || "your organization";

  return (
    <div className="dashboard-page home-page">
      <section className="dashboard-welcome">
        <div className="welcome-copy">
          <span className="eyebrow">EDUSPHERE ORGANIZATION HUB</span>
          <h1>Welcome, {displayName} <span aria-hidden="true">👋</span></h1>
          <p>Everything you need to organize your teachers, learners, classes and curriculum — all in one place.</p>
          <div className="welcome-actions"><Link to="/organization/teachers">Add a teacher</Link><Link to="/organization/students">Add a student</Link></div>
        </div>
        <div className="welcome-visual" aria-hidden="true"><div className="visual-ring ring-one" /><div className="visual-ring ring-two" /><div className="visual-book"><span>EDU</span><small>LEARN</small></div></div>
      </section>

      {directoryError && <div className="error-message" role="alert">Some organization records could not be loaded. The available figures are still shown.</div>}

      <section className="dashboard-home-stats">
        <div className="home-stat blue"><div className="home-stat-icon">👨‍🏫</div><div><strong>{loading ? "—" : counts.teachers}</strong><small>Teachers</small></div></div>
        <div className="home-stat green"><div className="home-stat-icon">🎓</div><div><strong>{loading ? "—" : counts.students}</strong><small>Students</small></div></div>
        <div className="home-stat orange"><div className="home-stat-icon">🏫</div><div><strong>{loading ? "—" : counts.classes}</strong><small>Classes</small></div></div>
        <div className="home-stat purple"><div className="home-stat-icon">📚</div><div><strong>{loading ? "—" : counts.subjects}</strong><small>Subjects</small></div></div>
      </section>

      <section className="dashboard-card">
        <div className="card-heading"><div><span className="section-kicker">LIVE ACADEMIC MONITORING</span><h2>Learning activity</h2><p>Organization-level activity across connected classes.</p></div></div>
        {monitoringError && <div className="inline-warning">Live activity monitoring is temporarily unavailable. Core organization counts are still available.</div>}
        <div className="dashboard-home-stats">
          <div className="home-stat blue"><strong>{loading ? "—" : monitoring.published_assignments || 0}</strong><small>Published assignments</small></div>
          <div className="home-stat green"><strong>{loading ? "—" : monitoring.submitted_work || 0}</strong><small>Submitted work</small></div>
          <div className="home-stat orange"><strong>{loading ? "—" : monitoring.awaiting_grading || 0}</strong><small>Awaiting grading</small></div>
          <div className="home-stat purple"><strong>{loading ? "—" : monitoring.upcoming_exams || 0}</strong><small>Upcoming exams</small></div>
        </div>
      </section>

      <section className="dashboard-card quick-start">
        <div className="card-heading"><div><span className="section-kicker">GET STARTED</span><h2>Your learning hub</h2><p>Use these areas to build and manage your organization.</p></div></div>
        <div className="hub-grid">
          <Link to="/organization/teachers" className="hub-item blue-accent"><b>👨‍🏫 Build your team</b><span>Manage faculty information and add teachers.</span><em>Open Teachers →</em></Link>
          <Link to="/organization/students" className="hub-item green-accent"><b>🎓 Grow your learners</b><span>Register students and keep learner records organized.</span><em>Open Students →</em></Link>
          <Link to="/organization/classes" className="hub-item orange-accent"><b>🏫 Structure classes</b><span>Create the learning groups your organization needs.</span><em>Open Classes →</em></Link>
          <Link to="/organization/subjects" className="hub-item purple-accent"><b>📚 Plan subjects</b><span>Set up the subjects that shape your curriculum.</span><em>Open Subjects →</em></Link>
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
