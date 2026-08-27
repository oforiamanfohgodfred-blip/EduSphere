import DashboardLayout from "../../components/layout/DashboardLayout";

function Resources() {
  return (
    <DashboardLayout role="teacher">
      <h1>Resources</h1>
      <div className="section-card">
        <h2>Class Resources</h2>
        <p>Resource publishing and file storage will be connected to class VLE data. No browser-only resource records are stored.</p>
      </div>
    </DashboardLayout>
  );
}

export default Resources;
