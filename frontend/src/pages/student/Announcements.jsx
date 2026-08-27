import DashboardLayout from "../../components/layout/DashboardLayout";

function Announcements() {
  return (
    <DashboardLayout role="student">
      <h1>Announcements</h1>
      <div className="section-card">
        <h2>Class Announcements</h2>
        <p>Announcements published to your class will appear here.</p>
      </div>
    </DashboardLayout>
  );
}

export default Announcements;
