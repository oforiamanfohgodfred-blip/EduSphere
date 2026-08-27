import DashboardLayout from "../../components/layout/DashboardLayout";

function Announcements() {
  return (
    <DashboardLayout role="teacher">
      <h1>Announcements</h1>
      <div className="section-card">
        <h2>Class Announcements</h2>
        <p>Announcement publishing will be connected to class VLE data. No browser-only announcements are stored.</p>
      </div>
    </DashboardLayout>
  );
}

export default Announcements;
