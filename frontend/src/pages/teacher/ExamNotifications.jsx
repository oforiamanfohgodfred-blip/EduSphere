import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

function ExamNotifications() {
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [venue, setVenue] = useState("");
  const [instructions, setInstructions] = useState("");

  const [exams, setExams] = useState([]);

  const handleAddExam = () => {
    if (!examTitle || !examDate || !venue) {
      alert("Please fill all required fields");
      return;
    }

    const newExam = {
      id: Date.now(),
      examTitle,
      examDate,
      venue,
      instructions,
    };

    setExams([...exams, newExam]);

    setExamTitle("");
    setExamDate("");
    setVenue("");
    setInstructions("");
  };

  const handleDelete = (id) => {
    setExams(exams.filter((exam) => exam.id !== id));
  };

  return (
    <DashboardLayout role="teacher">
      <h1>Exam Notifications</h1>

      <div className="assignment-form">
        <input
          type="text"
          placeholder="Exam Title"
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
        />

        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />

        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />

        <button
          className="action-btn"
          onClick={handleAddExam}
        >
          Publish Exam Notification
        </button>
      </div>

      <div className="section-card">
        <h2>Published Exam Notifications</h2>

        {exams.length === 0 ? (
          <p>No exam notifications yet.</p>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="assignment-item"
            >
              <h3>{exam.examTitle}</h3>

              <p>
                <strong>Date:</strong> {exam.examDate}
              </p>

              <p>
                <strong>Venue:</strong> {exam.venue}
              </p>

              <p>{exam.instructions}</p>

              <button
                className="delete-btn"
                onClick={() => handleDelete(exam.id)}
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

export default ExamNotifications;