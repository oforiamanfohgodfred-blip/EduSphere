import DashboardLayout from "../../components/layout/DashboardLayout";

function ExamNotifications() {
  return (
    <DashboardLayout role="teacher">
      <h1>Exam Notifications</h1>
      <div className="section-card">
        <h2>Class Exam Notifications</h2>
        <p>Exam publishing will be connected to class VLE data. No browser-only exam records are stored.</p>
      </div>
    </DashboardLayout>
  );
}

export default ExamNotifications;
