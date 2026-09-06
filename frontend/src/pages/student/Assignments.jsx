import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Assignments() {
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const classResponse = await api.get("/classes/student/my");
      const info = classResponse.data?.[0] || null;
      setClassInfo(info);
      if (!info) return;
      const [assignmentResponse, submissionResponse] = await Promise.all([
        api.get(`/vle/classes/${info.id}/assignments`),
        api.get("/vle/submissions/mine"),
      ]);
      setAssignments(assignmentResponse.data || []);
      setSubmissions(submissionResponse.data || []);
    } catch (e) { setError(e.response?.data?.message || "Unable to load assignments."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (assignmentId) => {
    try {
      setError("");
      await api.post(`/vle/assignments/${assignmentId}/submit`, { submissionText: drafts[assignmentId] || "" });
      await load();
    } catch (e) { setError(e.response?.data?.message || "Unable to submit assignment."); }
  };

  const submissionFor = (id) => submissions.find(s => Number(s.assignment_id) === Number(id));

  return <DashboardLayout role="student">
    <h1>Assignments</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    {loading ? <div className="section-card"><p>Loading assignments...</p></div> : !classInfo ? <div className="section-card"><p>You are not assigned to a class yet.</p></div> : <div className="dashboard-sections">
      {assignments.length ? assignments.map(a => {
        const submission = submissionFor(a.id);
        return <div className="section-card" key={a.id}>
          <h2>{a.title}</h2>
          <p>{a.instructions || "No instructions provided."}</p>
          <small>{a.subject_name || "General"} · {a.max_marks} marks{a.due_at ? ` · Due ${new Date(a.due_at).toLocaleString()}` : ""}</small>
          <textarea placeholder={submission?.submission_text || "Write your submission..."} value={drafts[a.id] ?? submission?.submission_text ?? ""} onChange={e => setDrafts({ ...drafts, [a.id]: e.target.value })} />
          <button className="login-btn" type="button" onClick={() => submit(a.id)}>{submission ? "Resubmit" : "Submit"}</button>
          {submission?.marks != null && <p><strong>Grade:</strong> {submission.marks}/{a.max_marks} — {submission.feedback || "No feedback yet."}</p>}
        </div>;
      }) : <div className="section-card"><p>No assignments have been published for your class.</p></div>}
    </div>}
  </DashboardLayout>;
}
export default Assignments;
