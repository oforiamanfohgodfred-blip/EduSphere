import DashboardLayout from "../../components/layout/DashboardLayout";

function Timetables() {
  const timetable = [
    {
      id: 1,
      day: "Monday",
      time: "08:00 - 10:00",
      course: "Mathematics",
      venue: "Room A1",
    },
    {
      id: 2,
      day: "Monday",
      time: "10:30 - 12:30",
      course: "Programming",
      venue: "Computer Lab",
    },
    {
      id: 3,
      day: "Tuesday",
      time: "09:00 - 11:00",
      course: "Physics",
      venue: "Science Block",
    },
    {
      id: 4,
      day: "Wednesday",
      time: "08:00 - 10:00",
      course: "English",
      venue: "Room B2",
    },
    {
      id: 5,
      day: "Thursday",
      time: "01:00 - 03:00",
      course: "Database Systems",
      venue: "ICT Lab",
    },
  ];

  return (
    <DashboardLayout role="student">
      <h1>Class Timetable</h1>

      <div className="timetable-container">
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Course</th>
              <th>Venue</th>
            </tr>
          </thead>

          <tbody>
            {timetable.map((lesson) => (
              <tr key={lesson.id}>
                <td>{lesson.day}</td>
                <td>{lesson.time}</td>
                <td>{lesson.course}</td>
                <td>{lesson.venue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Timetables;