import DashboardLayout from "../../components/layout/DashboardLayout";

function Assignments() {
  return (
    <DashboardLayout role="student">
      <h1>Assignments</h1>
      <div className="section-card">
        <h2>Class Assignments</h2>
        <p>Assignments published to your class will appear here.</p>
      </div>
    </DashboardLayout>
  );
}

export default Assignments;
