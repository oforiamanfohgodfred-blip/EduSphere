import { useEffect, useState } from "react";
import api from "../../services/api";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    subject: "",
    phone: "",
    password: "",
  });

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/teachers");
      setTeachers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await api.post("/teachers", form);
      setForm({ full_name: "", email: "", subject: "", phone: "", password: "" });
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
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete teacher.");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Teacher Management</h1>
          <p>Add and manage teachers in your organization.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="dashboard-card">
        <h2>Add Teacher</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input name="full_name" placeholder="Full name" value={form.full_name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input name="password" type="password" placeholder="Temporary password" value={form.password} onChange={handleChange} required />
          <button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Teacher"}</button>
        </form>
      </section>

      <section className="dashboard-card">
        <h2>Teachers</h2>
        {loading ? (
          <p>Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p>No teachers have been added yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Phone</th><th>Action</th></tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.teacher_id}</td>
                    <td>{teacher.full_name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.subject || "—"}</td>
                    <td>{teacher.phone || "—"}</td>
                    <td><button type="button" onClick={() => handleDelete(teacher.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Teachers;
