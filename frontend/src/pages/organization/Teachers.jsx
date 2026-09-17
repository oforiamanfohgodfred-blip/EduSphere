import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/dashboard.css";

const emptyForm = { full_name: "", email: "", subject: "", phone: "", password: "" };

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/teachers");
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      setSubjectLoading(true);
      const response = await api.get("/subjects");
      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load organization subjects.");
    } finally {
      setSubjectLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadSubjects();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await api.post("/teachers", form);
      setForm(emptyForm);
      await loadTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add teacher.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      setError("");
      await api.delete(`/teachers/${id}`);
      setTeachers((current) => current.filter((teacher) => teacher.id !== id));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to delete teacher.");
    }
  };

  return (
    <div className="dashboard-page people-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">FACULTY DIRECTORY</span>
          <h1>Teacher Management</h1>
          <p>Build and manage the teaching team behind your organization.</p>
        </div>
        <div className="stat-card"><strong>{teachers.length}</strong><span>Active Teachers</span></div>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      <section className="dashboard-card people-form-card">
        <div className="card-heading">
          <div>
            <h2>Add a Teacher</h2>
            <p>Choose a subject from the organization curriculum instead of typing a free-form subject.</p>
          </div>
          <span className="section-accent">Faculty</span>
        </div>

        <form onSubmit={handleSubmit} className="class-form-grid">
          <label>
            Full name
            <input name="full_name" placeholder="e.g. Ama Mensah" value={form.full_name} onChange={handleChange} required />
          </label>
          <label>
            Email address
            <input name="email" type="email" placeholder="teacher@example.com" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Teaching subject
            <select name="subject" value={form.subject} onChange={handleChange} required disabled={subjectLoading}>
              <option value="">{subjectLoading ? "Loading subjects..." : "Select a subject"}</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>{subject.name} ({subject.code})</option>
              ))}
            </select>
            {!subjectLoading && !subjects.length && <small className="field-help warning-text">Create a subject first from Subject Management.</small>}
          </label>
          <label>
            Phone
            <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Temporary password
            <input name="password" type="password" placeholder="Create temporary password" value={form.password} onChange={handleChange} required />
          </label>
          <div className="form-action">
            <button type="submit" disabled={saving || !subjects.length}>
              {saving ? "Creating..." : "+ Add Teacher"}
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-card">
        <div className="card-heading">
          <div><h2>Teaching Team</h2><p>Teachers registered in your organization.</p></div>
        </div>
        {loading ? (
          <div className="empty-state">Loading teaching team...</div>
        ) : teachers.length === 0 ? (
          <div className="empty-state"><strong>No teachers yet</strong><span>Add your first teacher above.</span></div>
        ) : (
          <div className="people-grid">
            {teachers.map((teacher) => (
              <article className="person-card" key={teacher.id}>
                <div className="person-avatar">{teacher.full_name?.charAt(0)?.toUpperCase()}</div>
                <div className="person-info">
                  <span className="person-id">{teacher.teacher_id}</span>
                  <h3>{teacher.full_name}</h3>
                  <p>{teacher.subject || "Teaching staff"}</p>
                  <small>{teacher.email}</small>
                  {teacher.phone && <small>{teacher.phone}</small>}
                </div>
                <button className="person-delete" type="button" onClick={() => handleDelete(teacher.id)}>Remove</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Teachers;
