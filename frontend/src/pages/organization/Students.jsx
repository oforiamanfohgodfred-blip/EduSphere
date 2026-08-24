import { useEffect, useState } from "react";
import api from "../../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    class_name: "",
    password: "",
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await api.post("/students", form);
      setForm({ full_name: "", email: "", phone: "", gender: "", date_of_birth: "", class_name: "", password: "" });
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add student.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      setError("");
      await api.delete(`/students/${id}`);
      setStudents((current) => current.filter((student) => student.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete student.");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Student Management</h1>
          <p>Add and manage students in your organization.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="dashboard-card">
        <h2>Add Student</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input name="full_name" placeholder="Full name" value={form.full_name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
          <input name="class_name" placeholder="Class" value={form.class_name} onChange={handleChange} />
          <input name="password" type="password" placeholder="Temporary password" value={form.password} onChange={handleChange} required />
          <button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Student"}</button>
        </form>
      </section>

      <section className="dashboard-card">
        <h2>Students</h2>
        {loading ? <p>Loading students...</p> : students.length === 0 ? <p>No students have been added yet.</p> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Class</th><th>Phone</th><th>Action</th></tr></thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{student.full_name}</td>
                    <td>{student.email}</td>
                    <td>{student.class_name || "—"}</td>
                    <td>{student.phone || "—"}</td>
                    <td><button type="button" onClick={() => handleDelete(student.id)}>Delete</button></td>
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

export default Students;
