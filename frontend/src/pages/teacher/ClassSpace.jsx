import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ChatPanel from "../../components/vle/ChatPanel";
import api from "../../services/api";

function ClassSpace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/teachers/classes/${id}`)
      .then((response) => setSpace(response.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load this class."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout role="teacher"><div className="section-card"><p>Loading class space...</p></div></DashboardLayout>;
  if (error) return <DashboardLayout role="teacher"><div className="section-card"><h2>Class unavailable</h2><p>{error}</p><button className="secondary-button" onClick={() => navigate("/teacher/dashboard")}>← Back</button></div></DashboardLayout>;

  return (
    <DashboardLayout role="teacher">
      <div className="vle-page-shell">
        <button className="secondary-button back-button" onClick={() => navigate("/teacher/dashboard")}>← Back to Dashboard</button>
        <div className="dashboard-header vle-class-hero">
          <div>
            <span className="section-kicker">TEACHING SPACE</span>
            <h1>{space.name}</h1>
            <p className="dashboard-subtitle">{space.description || "Manage learning for this class."}</p>
            {space.code && <span className="class-code">{space.code}</span>}
          </div>
          <div className="stat-card vle-hero-stat"><h3>Academic Year</h3><p>{space.academic_year || "—"}</p></div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><h3>Students</h3><p>{space.students?.length || 0}</p></div>
          <div className="stat-card"><h3>Teachers</h3><p>{space.teachers?.length || 0}</p></div>
          <div className="stat-card"><h3>Subjects</h3><p>{space.subjects?.length || 0}</p></div>
        </div>

        <div className="dashboard-sections">
          <div className="section-card">
            <h2>Students</h2>
            {space.students?.length ? space.students.map((student) => <article className="list-item" key={student.id}><h3>{student.full_name}</h3><small>{student.email}</small></article>) : <p>No students are assigned yet.</p>}
          </div>
          <div className="section-card">
            <h2>Subjects</h2>
            {space.subjects?.length ? space.subjects.map((subject) => <article className="list-item" key={subject.id}><h3>{subject.name}</h3><small>{subject.code || "Subject"}</small></article>) : <p>No subjects are assigned yet.</p>}
          </div>
        </div>

        <ChatPanel
          type="class"
          classId={space.id}
          title="Class Chat"
          subtitle="Communicate with the students and teachers in this class."
        />
      </div>
    </DashboardLayout>
  );
}

export default ClassSpace;
