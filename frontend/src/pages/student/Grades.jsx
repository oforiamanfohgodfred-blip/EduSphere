import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import "../../styles/student-grades.css";

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
      <div className="grades-page">
        <header className="grades-hero">
          <div><span className="section-kicker">LEARNING PROGRESS</span><h1>My Grades</h1><p>Track your submissions, marks and teacher feedback in one place.</p></div>
          <div className="grades-score"><span>Overall</span><strong>{loading ? "—" : `${percentage}%`}</strong><small>{statusText}</small></div>
        </header>
        {error && <div className="error-message" role="alert">{error}</div>}
        {loading ? <div className="section-card grades-loading"><p>Loading your grades...</p></div> : <>
          <section className="grade-summary">
            <div className="grade-stat"><span className="grade-stat-icon">✓</span><div><strong>{graded.length}</strong><small>Graded</small></div></div>
            <div className="grade-stat"><span className="grade-stat-icon">↗</span><div><strong>{submissions.length}</strong><small>Submitted</small></div></div>
            <div className="grade-stat"><span className="grade-stat-icon">★</span><div><strong>{totalMarks}/{totalPossible}</strong><small>Total marks</small></div></div>
          </section>
          <section className="section-card grades-list-card">
            <div className="card-heading"><div><span className="section-kicker">ASSESSMENT HISTORY</span><h2>Your work</h2><p>Every submitted assignment and its latest grading status.</p></div></div>
            {submissions.length ? <div className="grades-list">{submissions.map((submission) => (
              <article className="grade-item" key={submission.id}>
                <div className="grade-item-main"><div><span className={`grade-status ${submission.marks != null ? "graded" : "pending"}`}>{submission.marks != null ? "Graded" : "Awaiting grading"}</span><h3>{submission.title}</h3><p>{submission.submitted_at ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}` : "Not submitted"}</p></div><div className="grade-mark">{submission.marks != null ? <><strong>{submission.marks}<small>/{submission.max_marks}</small></strong><span>{submission.max_marks ? Math.round((Number(submission.marks) / Number(submission.max_marks)) * 100) : 0}%</span></> : <strong>—</strong>}</div></div>
                {submission.marks != null && <div className="grade-feedback"><span>Teacher feedback</span><p>{submission.feedback || "No feedback provided."}</p></div>}
              </article>
            ))}</div> : <div className="empty-state"><strong>No grades yet</strong><span>Your submitted and graded assignments will appear here.</span><Link to="/student/assignments">View assignments →</Link></div>}
          </section>
        </>}
      </div>
    </DashboardLayout>
  );
}

export default Grades;
