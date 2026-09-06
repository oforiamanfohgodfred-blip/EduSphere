import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Timetables() {
  const [classInfo, setClassInfo] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/classes/student/my").then(async ({ data }) => {
      const klass = data?.[0];
      if (!klass) return;
      const timetable = await api.get(`/vle/classes/${klass.id}/timetable`);
      if (active) { setClassInfo(klass); setEntries(Array.isArray(timetable.data) ? timetable.data : []); }
    }).catch((e) => { if (active) setError(e.response?.data?.message || "Unable to load your timetable."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <DashboardLayout role="student"><h1>Class Timetable</h1>{error && <div className="error-message" role="alert">{error}</div>}
    {loading ? <div className="section-card"><p>Loading timetable...</p></div> : !classInfo ? <div className="section-card"><p>You are not assigned to a class yet.</p></div> : <div className="section-card"><h2>{classInfo.name}</h2>{entries.length ? entries.map((entry) => <article key={entry.id}><h3>{days[entry.day_of_week - 1]} · {entry.start_time?.slice(0, 5)}–{entry.end_time?.slice(0, 5)}</h3><p>{entry.subject_name || "Class session"}{entry.teacher_name ? ` · ${entry.teacher_name}` : ""}{entry.room ? ` · Room ${entry.room}` : ""}</p><hr /></article>) : <p>No timetable entries have been published yet.</p>}</div>}
  </DashboardLayout>;
}
export default Timetables;
