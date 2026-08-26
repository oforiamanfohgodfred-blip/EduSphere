import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/dashboard.css";
import "../../styles/vle.css";

const emptyForm = { full_name: "", email: "", subject: "", phone: "", password: "", class_ids: [] };

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [teachersResponse, classesResponse] = await Promise.all([
        api.get("/teachers"),
        api.get("/classes"),
      ]);
      setTeachers(teachersResponse.data);
      setClasses(classesResponse.data);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load teachers and classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) =>
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const toggleClass = (classId) => {
    setForm((current) => ({
      ...current,
      class_ids: current.class_ids.includes(classId)
        ? current.class_ids.filter((id) => id !== classId)
        : [...current.class_ids, classId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.class_ids.length) {
      setError("Assign the teacher to at least one class before creating the account.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await api.post("/teachers", form);
      setForm(emptyForm);
      await loadData();
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
    <div className="dashboard-page people-page vle-page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">FACULTY DIRECTORY</span>
          <h1>Teacher Management</h1>
          <p>Build your teaching team and connect every teacher to their real learning spaces.</p>
        </div>
        <div className="stat-card">
          <strong>{teachers.length}</strong>
          <span>Active Teachers</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="dashboard-card people-form-card vle-form-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">ACCOUNT + CLASS CONNECTION</span>
            <h2>Create Teacher Account</h2>
            <p>A teacher account must be connected to at least one class from the moment it is created.</p>
          </div>
          <span className="section-accent">VLE Faculty</span>
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
            Main subject
            <input name="subject" placeholder="e.g. Mathematics" value={form.subject} onChange={handleChange} />
          </label>
          <label>
            Phone
            <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Temporary password
            <input name="password" type="password" placeholder="Create temporary password" value={form.password} onChange={handleChange} required />
          </label>

          <div className="wide-field teacher-class-picker">
            <div className="picker-heading">
              <div>
                <strong>Assign Classes</strong>
                <span>Select every class this teacher should manage.</span>
              </div>
              <b>{form.class_ids.length} selected</b>
            </div>
            {classes.length === 0 ? (
              <div className="picker-empty">No classes exist yet. Create a class first, then return here.</div>
            ) : (
              <div className="teacher-class-options">
                {classes.map((item) => {
                  const selected = form.class_ids.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`teacher-class-option ${selected ? "selected" : ""}`}
                      onClick={() => toggleClass(item.id)}
                    >
                      <span className="class-option-check">{selected ? "✓" : ""}</span>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.code || "No code"} · {item.student_count || 0} students</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-action">
            <button type="submit" disabled={saving || !classes.length}>
              {saving ? "Creating..." : "+ Create Teacher & Assign Class"}
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">CONNECTED FACULTY</span>
            <h2>Teaching Team</h2>
            <p>Every teacher below is connected to their current learning spaces.</p>
          </div>
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
                  <div className="teacher-assigned-chips">
                    {(teacher.classes || []).map((item) => <span key={item.id}>{item.name}</span>)}
                  </div>
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
