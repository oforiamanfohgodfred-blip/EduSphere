import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function ExamNotifications() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", startsAt: "", durationMinutes: 60, maxMarks: 100 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/classes/teacher/my").then(({ data }) => { const list = Array.isArray(data) ? data : []; setClasses(list); if (list[0]) setSelectedClass(String(list[0].id)); }).catch(() => setMessage("Unable to load your classes."));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    api.get(`/vle/classes/${selectedClass}/exams`).then(({ data }) => setExams(Array.isArray(data) ? data : [])).catch(() => setMessage("Unable to load exams."));
  }, [selectedClass]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await api.post("/vle/exams", { ...form, classId: Number(selectedClass), durationMinutes: Number(form.durationMinutes), maxMarks: Number(form.maxMarks) });
      const { data } = await api.get(`/vle/classes/${selectedClass}/exams`); setExams(Array.isArray(data) ? data : []); setForm({ title: "", description: "", startsAt: "", durationMinutes: 60, maxMarks: 100 }); setMessage("Exam notification published.");
    } catch (e) { setMessage(e.response?.data?.message || "Unable to publish exam."); }
    finally { setSaving(false); }
  };

  return <DashboardLayout role="teacher"><h1>Exam Notifications</h1>{message && <div className="error-message" role="status">{message}</div>}
    {!classes.length ? <div className="section-card"><p>No classes are assigned to you yet.</p></div> : <>
      <div className="section-card"><label htmlFor="exam-class">Class</label><select id="exam-class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="section-card"><h2>Publish exam</h2><form onSubmit={submit} className="form-grid"><label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label>Start date/time<input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required /></label><label>Duration (minutes)<input type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required /></label><label>Maximum marks<input type="number" min="1" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><button className="login-btn" disabled={saving}>{saving ? "Publishing..." : "Publish exam"}</button></form></div>
      <div className="section-card"><h2>Upcoming and published exams</h2>{exams.length ? exams.map((exam) => <article key={exam.id}><h3>{exam.title}</h3><p>{new Date(exam.starts_at).toLocaleString()} · {exam.duration_minutes} minutes · {exam.max_marks} marks</p>{exam.description && <p>{exam.description}</p>}<hr /></article>) : <p>No exams have been published for this class.</p>}</div>
    </>}
  </DashboardLayout>;
}
export default ExamNotifications;
