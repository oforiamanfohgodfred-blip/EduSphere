import DashboardLayout from "../../components/layout/DashboardLayout";

function Assignments() {
  const assignments = [
    {
      id: 1,
      title: "Mathematics Assignment",
      course: "Mathematics",
      description: "Complete exercises 1–10 from Chapter 5.",
      dueDate: "1st December 2025",
    },
    {
      id: 2,
      title: "Programming Project",
      course: "Computer Science",
      description: "Build a simple calculator using JavaScript.",
      dueDate: "5th December 2025",
    },
    {
      id: 3,
      title: "English Essay",
      course: "English Language",
      description: "Write a 500-word essay on Climate Change.",
      dueDate: "10th December 2025",
    },
  ];

  return (
    <DashboardLayout role="student">
      <h1>Assignments</h1>

      <div className="assignments-container">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <h3>{assignment.title}</h3>

            <p>
              <strong>Course:</strong> {assignment.course}
            </p>

            <p>{assignment.description}</p>

            <p className="due-date">
              <strong>Due:</strong> {assignment.dueDate}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Assignments;