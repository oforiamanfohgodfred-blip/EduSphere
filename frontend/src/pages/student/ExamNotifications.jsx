import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function ExamNotifications() {
  const [exams, setExams] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/classes/student/my").then(async ({ data }) => {
      const klass = data?.[0];
      if (!klass) return;
      const result = await api.get(`/vle/classes/${klass.id}/exams`);
      if (active) { setClassName(klass.name); setExams(Array.isArray(result.data) ? result.data : []); }
    }).catch((e) => { if (active) setError(e.response?.data?.message || "Unable to load exam notifications."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <DashboardLayout role="student"><h1>Exam Notifications</h1>{error && <div className="error-message" role="alert">{error}</div>}{loading ? <div className="section-card"><p>Loading exam notifications...</p></div> : !className ? <div className="section-card"><p>You are not assigned to a class yet.</p></div> : <div className="section-card"><h2>{className}</h2>{exams.length ? exams.map((exam) => <article key={exam.id}><h3>{exam.title}</h3><p>{new Date(exam.starts_at).toLocaleString()} · {exam.duration_minutes} minutes · {exam.max_marks} marks</p>{exam.description && <p>{exam.description}</p>}<hr /></article>) : <p>No exams have been published for your class yet.</p>}</div>}</DashboardLayout>;
}
export default ExamNotifications;
