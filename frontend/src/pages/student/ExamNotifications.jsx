import DashboardLayout from "../../components/layout/DashboardLayout";

function ExamNotifications() {
  const exams = [
    {
      id: 1,
      course: "Mathematics",
      date: "15 Dec 2025",
      time: "9:00 AM",
      venue: "Hall A",
    },
    {
      id: 2,
      course: "Programming",
      date: "17 Dec 2025",
      time: "1:00 PM",
      venue: "Computer Lab",
    },
    {
      id: 3,
      course: "Physics",
      date: "20 Dec 2025",
      time: "11:00 AM",
      venue: "Science Block",
    },
  ];

  return (
    <DashboardLayout role="student">
      <h1>Exam Notifications</h1>

      <div className="exam-container">
        {exams.map((exam) => (
          <div className="exam-card" key={exam.id}>
            <h3>{exam.course}</h3>

            <p><strong>Date:</strong> {exam.date}</p>
            <p><strong>Time:</strong> {exam.time}</p>
            <p><strong>Venue:</strong> {exam.venue}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default ExamNotifications;