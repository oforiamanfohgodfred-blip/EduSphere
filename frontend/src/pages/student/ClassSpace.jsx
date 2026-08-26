import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ChatPanel from "../../components/vle/ChatPanel";
import api from "../../services/api";

function formatDate(value) {
  if (!value) return "No date set";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function ClassSpace() {
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/students/learning/space")
      .then((response) => {
        if (active) setSpace(response.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load your class space.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const upcomingMeetings = useMemo(() => {
    if (!space?.live_meetings) return [];
    return space.live_meetings.filter((meeting) => new Date(meeting.starts_at) >= new Date()).slice(0, 4);
  }, [space]);

  if (loading) {
    return <DashboardLayout role="student"><div className="section-card"><p>Loading your class space...</p></div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout role="student"><div className="section-card"><h2>Class space unavailable</h2><p>{error}</p></div></DashboardLayout>;
  }

  const classInfo = space?.class;
  const assignments = space?.assignments || [];
  const resources = space?.resources || [];
  const announcements = space?.announcements || [];
  const students = space?.students || [];
  const teachers = space?.teachers || [];
  const subjects = space?.subjects || [];

  return (
    <DashboardLayout role="student">
      <div className="vle-page-shell">
        <button className="secondary-button back-button" onClick={() => navigate("/student/dashboard")}>← Back to Dashboard</button>

        <div className="dashboard-header vle-class-hero">
          <div>
            <span className="section-kicker">YOUR LEARNING SPACE</span>
            <h1>{classInfo?.name || "My Class"}</h1>
            <p className="dashboard-subtitle">{classInfo?.description || "Everything your teachers publish for your class appears here."}</p>
            {classInfo?.code && <span className="class-code">{classInfo.code}</span>}
          </div>
          <div className="stat-card vle-hero-stat">
            <h3>Academic Year</h3>
            <p>{classInfo?.academic_year || "—"}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><h3>Students</h3><p>{students.length}</p></div>
          <div className="stat-card"><h3>Teachers</h3><p>{teachers.length}</p></div>
          <div className="stat-card"><h3>Subjects</h3><p>{subjects.length}</p></div>
          <div className="stat-card"><h3>Assignments</h3><p>{assignments.length}</p></div>
        </div>

        <div className="vle-member-strip">
          <div>
            <span className="section-kicker">SUBJECTS</span>
            <div className="vle-chip-list">
              {subjects.length ? subjects.map((subject) => <span className="vle-chip" key={subject.id}>{subject.name}</span>) : <span>No subjects assigned yet.</span>}
            </div>
          </div>
          <div>
            <span className="section-kicker">TEACHERS</span>
            <div className="vle-chip-list">
              {teachers.length ? teachers.map((teacher) => <span className="vle-chip" key={teacher.id}>{teacher.full_name}</span>) : <span>No teachers assigned yet.</span>}
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section-card">
            <h2>Announcements</h2>
            {announcements.length === 0 ? <p>No announcements yet.</p> : announcements.slice(0, 5).map((item) => (
              <article key={item.id} className="list-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>{item.teacher_name} · {formatDate(item.created_at)}</small>
              </article>
            ))}
          </div>

          <div className="section-card">
            <h2>Upcoming Live Meetings</h2>
            {upcomingMeetings.length === 0 ? <p>No upcoming meetings.</p> : upcomingMeetings.map((meeting) => (
              <article key={meeting.id} className="list-item">
                <h3>{meeting.title}</h3>
                <p>{meeting.subject_name || "Class meeting"}</p>
                <small>{formatDate(meeting.starts_at)} · {meeting.teacher_name}</small>
                {meeting.meeting_url && <a href={meeting.meeting_url} target="_blank" rel="noreferrer">Join meeting</a>}
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section-card">
            <h2>Assignments</h2>
            {assignments.length === 0 ? <p>No assignments yet.</p> : assignments.slice(0, 8).map((assignment) => (
              <article key={assignment.id} className="list-item">
                <h3>{assignment.title}</h3>
                <p>{assignment.subject_name} · {assignment.teacher_name}</p>
                <small>Due: {formatDate(assignment.due_at)} · {assignment.max_score} marks</small>
                <a href={`/student/assignments?assignment=${assignment.id}`}>Open assignment</a>
              </article>
            ))}
          </div>

          <div className="section-card">
            <h2>Class Resources</h2>
            {resources.length === 0 ? <p>No resources yet.</p> : resources.slice(0, 8).map((resource) => (
              <article key={resource.id} className="list-item">
                <h3>{resource.title}</h3>
                <p>{resource.description || resource.subject_name || "Class resource"}</p>
                <small>{resource.teacher_name} · {resource.resource_type}</small>
                <a href={resource.resource_url} target="_blank" rel="noreferrer">Open resource</a>
              </article>
            ))}
          </div>
        </div>

        {classInfo?.id && (
          <ChatPanel
            type="class"
            classId={classInfo.id}
            title="Class Chat"
            subtitle="Ask questions, discuss lessons and stay connected with your classmates and teachers."
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default ClassSpace;
