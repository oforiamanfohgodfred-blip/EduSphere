import DashboardLayout from "../../components/layout/DashboardLayout";

function ExamNotifications() {
  return (
    <DashboardLayout role="student">
      <h1>Exam Notifications</h1>
      <div className="section-card">
        <h2>Published Exams</h2>
        <p>Exam notifications published to your class will appear here.</p>
      </div>
    </DashboardLayout>
  );
}

export default ExamNotifications;
