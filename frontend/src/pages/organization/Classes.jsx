import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/dashboard.css";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  academic_year: "",
  teacher_ids: [],
  subject_ids: [],
};

function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [classResponse, teacherResponse, subjectResponse] = await Promise.all([
        api.get("/classes"),
        api.get("/teachers"),
        api.get("/subjects"),
      ]);
      setClasses(Array.isArray(classResponse.data) ? classResponse.data : []);
      setTeachers(Array.isArray(teacherResponse.data) ? teacherResponse.data : []);
      setSubjects(Array.isArray(subjectResponse.data) ? subjectResponse.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load classes, teachers and subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value, multiple, selectedOptions } = event.target;
    setForm((current) => ({
      ...current,
      [name]: multiple ? Array.from(selectedOptions, (option) => option.value) : value,
    }));
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        academic_year: form.academic_year,
        teacher_ids: form.teacher_ids.map(Number),
        subject_ids: form.subject_ids.map(Number),
      };

      if (editingId) {
        const response = await api.put(`/classes/${editingId}`, payload);
        setClasses((current) => current.map((item) => (
          item.id === editingId
            ? { ...item, ...response.data, teacher_ids: payload.teacher_ids, subject_ids: payload.subject_ids }
            : item
        )));
      } else {
        const response = await api.post("/classes", payload);
        setClasses((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      reset();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save class.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      code: item.code || "",
      description: item.description || "",
      academic_year: item.academic_year || "",
      teacher_ids: (item.teacher_ids || []).map(String),
      subject_ids: (item.subject_ids || []).map(String),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this class? Students will be unassigned, but their accounts will remain.")) return;
    try {
      setError("");
      await api.delete(`/classes/${id}`);
      setClasses((current) => current.filter((item) => item.id !== id));
      if (editingId === id) reset();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to delete class.");
    }
  };

  return (
    <div className="dashboard-page classes-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">VLE CLASS MANAGEMENT</span>
          <h1>Classes</h1>
          <p>Create real learning spaces that connect students, teachers and subjects.</p>
        </div>
        <div className="stat-card">
          <strong>{classes.length}</strong>
          <span>Learning Spaces</span>
        </div>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      <section className="dashboard-card class-form-card">
        <div className="card-heading">
          <div>
            <h2>{editingId ? "Edit Class" : "Create a Class"}</h2>
            <p>{editingId ? "Update class details and its connected teaching team and subjects." : "Set up the class and connect its teachers and subjects in one step."}</p>
          </div>
          {editingId && <button type="button" className="secondary-button" onClick={reset}>Cancel</button>}
        </div>

        <form onSubmit={submit} className="class-form-grid">
          <label>
            Class name
            <input name="name" placeholder="e.g. JHS 1" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Class code
            <input name="code" placeholder="e.g. JHS1" value={form.code} onChange={handleChange} required />
          </label>
          <label>
            Academic year
            <input name="academic_year" placeholder="e.g. 2026/2027" value={form.academic_year} onChange={handleChange} />
          </label>
          <label>
            Assign teachers
            <select name="teacher_ids" multiple size={Math.min(5, Math.max(3, teachers.length || 3))} value={form.teacher_ids} onChange={handleChange}>
              {teachers.length ? teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.full_name}{teacher.subject ? ` · ${teacher.subject}` : ""}</option>
              )) : <option disabled>Create teachers first</option>}
            </select>
            <small className="field-help">Hold Ctrl while clicking to select more than one teacher.</small>
          </label>
          <label>
            Add subjects
            <select name="subject_ids" multiple size={Math.min(5, Math.max(3, subjects.length || 3))} value={form.subject_ids} onChange={handleChange}>
              {subjects.length ? subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
              )) : <option disabled>Create subjects first</option>}
            </select>
            <small className="field-help">Choose only subjects offered to this class.</small>
          </label>
          <label className="wide-field">
            Description
            <textarea name="description" rows="3" placeholder="What will this class learn?" value={form.description} onChange={handleChange} />
          </label>
          <button type="submit" disabled={saving || (!teachers.length && !subjects.length && !form.name)}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "+ Create Class"}
          </button>
        </form>
      </section>

      <section className="dashboard-card">
        <div className="card-heading">
          <div>
            <h2>Your Learning Spaces</h2>
            <p>Open a class to manage its connected VLE community.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading classes, teachers and subjects...</div>
        ) : !classes.length ? (
          <div className="empty-state">
            <strong>No classes yet</strong>
            <span>Create your first learning space above.</span>
          </div>
        ) : (
          <div className="class-grid">
            {classes.map((item) => (
              <article className="class-card class-space-card" key={item.id} onClick={() => navigate(`/organization/classes/${item.id}`)}>
                <div className="class-card-top"><span className="class-code">{item.code}</span><span>{item.academic_year || "No year set"}</span></div>
                <h3>{item.name}</h3>
                <p>{item.description || "Open this learning space to connect your VLE community."}</p>
                <div className="class-metrics">
                  <span>👨‍🎓 {item.student_count || 0} Students</span>
                  <span>👨‍🏫 {item.teacher_count || 0} Teachers</span>
                  <span>📚 {item.subject_count || 0} Subjects</span>
                </div>
                <div className="class-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => navigate(`/organization/classes/${item.id}`)}>Open Class</button>
                  <button type="button" onClick={() => edit(item)}>Edit</button>
                  <button type="button" className="danger-button" onClick={() => remove(item.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Classes;
