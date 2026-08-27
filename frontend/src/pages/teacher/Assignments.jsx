import DashboardLayout from "../../components/layout/DashboardLayout";

function Assignments() {
  return (
    <DashboardLayout role="teacher">
      <h1>Assignments</h1>
      <div className="section-card">
        <h2>Class Assignments</h2>
        <p>Assignment publishing will be connected to class VLE data. No local-only assignments are stored in the browser.</p>
      </div>
    </DashboardLayout>
  );
}

export default Assignments;
