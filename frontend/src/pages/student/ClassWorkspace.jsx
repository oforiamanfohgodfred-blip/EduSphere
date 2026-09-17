import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ClassChat from "../../components/vle/ClassChat";
import api from "../../services/api";

function ClassWorkspace() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ assignments: [], announcements: [], resources: [] });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadWorkspace = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get(`/vle/classes/${id}/assignments`),
        api.get(`/vle/classes/${id}/announcements`),
        api.get(`/vle/classes/${id}/resources`),
      ]);
      if (!active) return;

      const [assignments, announcements, resources] = results;
      setData({
        assignments: assignments.status === "fulfilled" ? assignments.value.data || [] : [],
        announcements: announcements.status === "fulfilled" ? announcements.value.data || [] : [],
        resources: resources.status === "fulfilled" ? resources.value.data || [] : [],
      });
      setErrors({
        ...(assignments.status === "rejected" ? { assignments: assignments.reason?.response?.data?.message || "Unable to load assignments." } : {}),
        ...(announcements.status === "rejected" ? { announcements: announcements.reason?.response?.data?.message || "Unable to load announcements." } : {}),
        ...(resources.status === "rejected" ? { resources: resources.reason?.response?.data?.message || "Unable to load resources." } : {}),
      });
      setLoading(false);
    };

    loadWorkspace();
    return () => { active = false; };
  }, [id]);

  const tabs = ["overview", "assignments", "announcements", "resources", "chat"];

  return (
    <DashboardLayout role="student">
      <div className="dashboard-page class-workspace-page">
        <div className="dashboard-header">
          <div>
            <Link to="/student/dashboard">← Dashboard</Link>
            <h1>Class Workspace</h1>
            <p className="dashboard-subtitle">Your connected learning space for assignments, updates, resources and class chat.</p>
          </div>
        </div>

        {Object.keys(errors).length > 0 && tab === "overview" && (
          <div className="error-message" role="alert">Some class sections could not be loaded. Open the affected tab for details.</div>
        )}

        <div className="tab-nav">
          {tabs.map((item) => (
            <button type="button" key={item} className={tab === item ? "login-btn" : "action-btn"} onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div className="section-card"><p>Loading your class...</p></div> : <div className="dashboard-sections">
          {tab === "overview" && <>
            <div className="section-card"><h2>Assignments</h2><p>{data.assignments.length} published</p>{errors.assignments && <div className="inline-warning">{errors.assignments}</div>}</div>
            <div className="section-card"><h2>Announcements</h2><p>{data.announcements.length} posted</p>{errors.announcements && <div className="inline-warning">{errors.announcements}</div>}</div>
            <div className="section-card"><h2>Resources</h2><p>{data.resources.length} available</p>{errors.resources && <div className="inline-warning">{errors.resources}</div>}</div>
            <div className="section-card"><h2>Class Chat</h2><p>Ask questions, share updates, and communicate with your class.</p><button type="button" className="action-btn" onClick={() => setTab("chat")}>Open chat</button></div>
          </>}

          {tab === "assignments" && <div className="section-card"><h2>Assignments</h2>{errors.assignments ? <div className="error-message">{errors.assignments}</div> : data.assignments.length ? data.assignments.map((assignment) => <article key={assignment.id}><h3>{assignment.title}</h3><p>{assignment.instructions || "No instructions provided."}</p><small>{assignment.subject_name || "General"} · {assignment.max_marks} marks{assignment.due_at ? ` · Due ${new Date(assignment.due_at).toLocaleString()}` : ""}</small><hr /></article>) : <p>No assignments have been published yet.</p>}</div>}

          {tab === "announcements" && <div className="section-card"><h2>Announcements</h2>{errors.announcements ? <div className="error-message">{errors.announcements}</div> : data.announcements.length ? data.announcements.map((announcement) => <article key={announcement.id}><h3>{announcement.title}</h3><p>{announcement.body}</p><small>{announcement.teacher_name || "Teacher"} · {new Date(announcement.created_at).toLocaleString()}</small><hr /></article>) : <p>No announcements yet.</p>}</div>}

          {tab === "resources" && <div className="section-card"><h2>Resources</h2>{errors.resources ? <div className="error-message">{errors.resources}</div> : data.resources.length ? data.resources.map((resource) => <article key={resource.id}><h3>{resource.title}</h3><p>{resource.description || ""}</p><a href={resource.resource_url} target="_blank" rel="noreferrer">Open resource</a><hr /></article>) : <p>No resources yet.</p>}</div>}

          {tab === "chat" && <ClassChat classId={id} />}
        </div>}
      </div>
    </DashboardLayout>
  );
}

export default ClassWorkspace;
