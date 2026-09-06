import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const emptyForm = { classId: "", dayOfWeek: "1", startTime: "08:00", endTime: "09:00", room: "" };
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Timetables() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/classes/teacher/my").then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setClasses(list);
      if (list[0]) { setSelectedClass(String(list[0].id)); setForm((current) => ({ ...current, classId: String(list[0].id) })); }
    }).catch(() => setMessage("Unable to load your classes.")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    api.get(`/vle/classes/${selectedClass}/timetable`).then(({ data }) => setEntries(Array.isArray(data) ? data : [])).catch(() => setMessage("Unable to load timetable."));
  }, [selectedClass]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await api.post("/vle/timetable", { ...form, classId: Number(selectedClass), dayOfWeek: Number(form.dayOfWeek) });
      const { data } = await api.get(`/vle/classes/${selectedClass}/timetable`);
      setEntries(Array.isArray(data) ? data : []); setMessage("Timetable entry published.");
    } catch (e) { setMessage(e.response?.data?.message || "Unable to publish timetable entry."); }
    finally { setSaving(false); }
  };

  return <DashboardLayout role="teacher"><h1>Timetables</h1>{message && <div className="error-message" role="status">{message}</div>}
    {loading ? <div className="section-card"><p>Loading classes...</p></div> : !classes.length ? <div className="section-card"><p>No classes are assigned to you yet.</p></div> : <>
      <div className="section-card"><label htmlFor="timetable-class">Class</label><select id="timetable-class" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setForm((f) => ({ ...f, classId: e.target.value })); }}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="section-card"><h2>Publish timetable entry</h2><form onSubmit={submit} className="form-grid">
        <label>Day<select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>{days.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></label>
        <label>Start<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></label>
        <label>End<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></label>
        <label>Room<input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Optional" /></label>
        <button className="login-btn" disabled={saving}>{saving ? "Publishing..." : "Publish entry"}</button>
      </form></div>
      <div className="section-card"><h2>Published timetable</h2>{entries.length ? entries.map((e) => <article key={e.id}><h3>{days[e.day_of_week - 1]} · {e.start_time?.slice(0, 5)}–{e.end_time?.slice(0, 5)}</h3><p>{e.subject_name || "Class session"}{e.room ? ` · Room ${e.room}` : ""}</p><hr /></article>) : <p>No timetable entries yet.</p>}</div>
    </>}
  </DashboardLayout>;
}
export default Timetables;
