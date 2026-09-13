import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const initialForm = { title: "", instructions: "", maxMarks: 100, dueAt: "", subjectId: "", status: "published" };

function Assignments() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
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

  const loadClassData = async (classId) => {
    if (!classId) {
      setSubjects([]);
      setAssignments([]);
      return;
    }
    try {
      const [classResponse, assignmentResponse] = await Promise.all([
        api.get(`/classes/teacher/my/${classId}`),
        api.get(`/vle/classes/${classId}/assignments`),
      ]);
      setSubjects(classResponse.data?.subjects || []);
      setAssignments(assignmentResponse.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load class assignments.");
    }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadClassData(selectedClass); }, [selectedClass]);

  const createAssignment = async (event) => {
    event.preventDefault();
    if (!selectedClass) return setError("Select a class first.");
    try {
      setSaving(true);
      setError("");
      await api.post("/vle/assignments", {
        ...form,
        classId: Number(selectedClass),
        maxMarks: Number(form.maxMarks),
        subjectId: form.subjectId ? Number(form.subjectId) : undefined,
      });
      setForm(initialForm);
      await loadClassData(selectedClass);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create assignment.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (assignment, status) => {
    try {
      setUpdatingId(assignment.id);
      setError("");
      await api.patch(`/vle/assignments/${assignment.id}`, {
        title: assignment.title,
        instructions: assignment.instructions || "",
        maxMarks: Number(assignment.max_marks),
        dueAt: assignment.due_at || undefined,
        status,
      });
      await loadClassData(selectedClass);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update assignment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="page-header">
        <div>
          <span className="section-kicker">TEACHING WORKSPACE</span>
          <h1>Assignments</h1>
          <p>Create, publish and close work for your assigned classes.</p>
        </div>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      <div className="assignment-toolbar section-card">
        <div>
          <span className="section-kicker">ACTIVE CLASS</span>
          <strong>{classes.find((item) => String(item.id) === String(selectedClass))?.name || "Choose a class"}</strong>
        </div>
        <select id="assignment-class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={loading}>
          <option value="">Select class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="assignment-layout">
        <section className="section-card assignment-form-card">
          <div className="card-heading">
            <div><span className="section-kicker">NEW WORK</span><h2>Create Assignment</h2><p>Prepare work privately or publish it immediately.</p></div>
          </div>
          <form className="assignment-form" onSubmit={createAssignment}>
            <div className="input-group"><label htmlFor="assignment-title">Title</label><input id="assignment-title" placeholder="e.g. Algebra Practice" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="input-group"><label htmlFor="assignment-subject">Subject</label><select id="assignment-subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}><option value="">General / no subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}{subject.code ? ` (${subject.code})` : ""}</option>)}</select></div>
            <div className="input-group assignment-wide"><label htmlFor="assignment-instructions">Instructions</label><textarea id="assignment-instructions" rows="5" placeholder="Tell students what they need to complete..." value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
            <div className="input-group"><label htmlFor="assignment-marks">Maximum marks</label><input id="assignment-marks" type="number" min="1" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} required /></div>
            <div className="input-group"><label htmlFor="assignment-due">Due date</label><input id="assignment-due" type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></div>
            <div className="input-group assignment-wide"><label htmlFor="assignment-status">Initial status</label><select id="assignment-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Save as draft</option><option value="published">Publish now</option></select></div>
            <button className="login-btn" disabled={saving || !selectedClass}>{saving ? "Saving..." : form.status === "draft" ? "Save Draft" : "Publish Assignment"}</button>
          </form>
        </section>

        <section className="section-card assignment-list-card">
          <div className="card-heading"><div><span className="section-kicker">CLASS WORK</span><h2>Assignments</h2><p>{assignments.length} assignment{assignments.length === 1 ? "" : "s"} in this class.</p></div></div>
          {assignments.length ? <div className="assignment-list">{assignments.map((a) => (
            <article className="assignment-item" key={a.id}>
              <div className="assignment-item-top"><div><span className={`status-pill status-${a.status}`}>{a.status}</span><h3>{a.title}</h3></div><strong>{a.max_marks} marks</strong></div>
              <p>{a.instructions || "No instructions provided."}</p>
              <div className="assignment-meta"><span>{a.subject_name || "General"}</span><span>{a.due_at ? `Due ${new Date(a.due_at).toLocaleString()}` : "No due date"}</span></div>
              <div className="assignment-actions">
                {a.status === "draft" && <button type="button" className="action-btn" disabled={updatingId === a.id} onClick={() => changeStatus(a, "published")}>{updatingId === a.id ? "Publishing..." : "Publish"}</button>}
                {a.status === "published" && <button type="button" className="secondary-button" disabled={updatingId === a.id} onClick={() => changeStatus(a, "closed")}>{updatingId === a.id ? "Closing..." : "Close Assignment"}</button>}
                {a.status === "closed" && <span className="closed-note">Closed — no further changes</span>}
              </div>
            </article>
          ))}</div> : <div className="empty-state"><strong>No assignments yet</strong><span>Create the first piece of work for this class.</span></div>}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Assignments;
