import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Grades() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/vle/submissions/mine");
        setSubmissions(response.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load your grades.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const graded = submissions.filter((submission) => submission.marks != null);
  const totalMarks = graded.reduce((sum, submission) => sum + Number(submission.marks), 0);
  const totalPossible = graded.reduce((sum, submission) => sum + Number(submission.max_marks || 0), 0);
  const percentage = totalPossible ? Math.round((totalMarks / totalPossible) * 100) : 0;

  const statusText = useMemo(() => {
    if (!submissions.length) return "No submissions yet";
    if (!graded.length) return "Awaiting grading";
    return `${graded.length} graded assignment${graded.length === 1 ? "" : "s"}`;
  }, [submissions.length, graded.length]);

  return (
    <DashboardLayout role="student">
      <h1>My Grades</h1>
      <p>Track your assignment submissions, marks and teacher feedback.</p>
      {error && <div className="error-message" role="alert">{error}</div>}

      {loading ? (
        <div className="section-card"><p>Loading grades...</p></div>
      ) : (
        <>
          <div className="dashboard-sections">
            <div className="section-card"><h2>Overall</h2><strong>{percentage}%</strong><p>{statusText}</p></div>
            <div className="section-card"><h2>Marks</h2><strong>{totalMarks}/{totalPossible}</strong><p>Across graded assignments</p></div>
            <div className="section-card"><h2>Submitted</h2><strong>{submissions.length}</strong><p>Total submissions recorded</p></div>
          </div>

          <div className="dashboard-sections">
            {submissions.length ? submissions.map((submission) => (
              <div className="section-card" key={submission.id}>
                <h2>{submission.title}</h2>
                <p>{submission.submitted_at ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}` : "Not submitted"}</p>
                {submission.marks != null ? (
                  <>
                    <p><strong>Mark:</strong> {submission.marks}/{submission.max_marks}</p>
                    <p><strong>Feedback:</strong> {submission.feedback || "No feedback provided."}</p>
                  </>
                ) : <p><strong>Status:</strong> Submitted — awaiting teacher grading.</p>}
              </div>
            )) : <div className="section-card"><p>Your graded and submitted assignments will appear here.</p></div>}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Grades;
