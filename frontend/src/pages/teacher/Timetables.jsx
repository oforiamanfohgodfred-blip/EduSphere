import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Timetables() {
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const [timetable, setTimetable] = useState([]);

  const handleAdd = () => {
    if (!subject || !day || !time) {
      alert("Please fill all fields");
      return;
    }

    const newEntry = {
      id: Date.now(),
      subject,
      day,
      time,
    };

    setTimetable([...timetable, newEntry]);

    setSubject("");
    setDay("");
    setTime("");
  };

  const handleDelete = (id) => {
    setTimetable(
      timetable.filter((entry) => entry.id !== id)
    );
  };

  return (
    <DashboardLayout role="teacher">
      <h1>Timetables</h1>

      <div className="assignment-form">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
        >
          <option value="">Select Day</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button
          className="action-btn"
          onClick={handleAdd}
        >
          Add Timetable Entry
        </button>
      </div>

      <div className="section-card">
        <h2>Timetable Entries</h2>

        {timetable.length === 0 ? (
          <p>No timetable entries yet.</p>
        ) : (
          timetable.map((entry) => (
            <div
              key={entry.id}
              className="assignment-item"
            >
              <h3>{entry.subject}</h3>

              <p>{entry.day}</p>

              <small>{entry.time}</small>

              <br />

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(entry.id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

export default Timetables;