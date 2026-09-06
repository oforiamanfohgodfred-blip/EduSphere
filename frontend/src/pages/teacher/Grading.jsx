import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Grading() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/teacher/my");
      const items = Array.isArray(response.data) ? response.data : [];
      setClasses(items);
      if (!selectedClass && items[0]) setSelectedClass(String(items[0].id));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (classId) => {
    if (!classId) return setSubmissions([]);
    try {
      const response = await api.get(`/vle/classes/${classId}/submissions`);
      setSubmissions(response.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load submissions.");
    }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadSubmissions(selectedClass); }, [selectedClass]);

  const grade = async (submission) => {
    const draft = drafts[submission.submission_id] || {};
    try {
      setError("");
      await api.post(`/vle/submissions/${submission.submission_id}/grade`, {
        marks: draft.marks ?? submission.marks ?? 0,
        feedback: draft.feedback ?? submission.feedback ?? "",
      });
      await loadSubmissions(selectedClass);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save grade.");
    }
  };

  return <DashboardLayout role="teacher">
    <h1>Grading</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    <div className="section-card">
      <label htmlFor="grading-class">Class</label>
      <select id="grading-class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={loading}>
        <option value="">Select class</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    <div className="dashboard-sections">
      {submissions.length ? submissions.map(s => {
        const draft = drafts[s.submission_id] || {};
        return <div className="section-card" key={s.submission_id}>
          <h2>{s.assignment_title}</h2>
          <p><strong>{s.student_name}</strong> · {s.student_code}</p>
          <p>{s.submission_text || "No submission text."}</p>
          <small>Submitted {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "not submitted"} · Maximum {s.max_marks}</small>
          <input type="number" min="0" max={s.max_marks} step="0.01" placeholder={`Marks / ${s.max_marks}`} value={draft.marks ?? s.marks ?? ""} onChange={e => setDrafts({ ...drafts, [s.submission_id]: { ...draft, marks: e.target.value } })} />
          <textarea placeholder="Feedback" value={draft.feedback ?? s.feedback ?? ""} onChange={e => setDrafts({ ...drafts, [s.submission_id]: { ...draft, feedback: e.target.value } })} />
          <button className="login-btn" type="button" onClick={() => grade(s)}>{s.marks != null ? "Update Grade" : "Grade Submission"}</button>
        </div>;
      }) : <div className="section-card"><p>No submissions are available for this class yet.</p></div>}
    </div>
  </DashboardLayout>;
}

export default Grading;
