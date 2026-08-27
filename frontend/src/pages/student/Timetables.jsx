import DashboardLayout from "../../components/layout/DashboardLayout";

function Timetables() {
  return (
    <DashboardLayout role="student">
      <h1>Class Timetable</h1>
      <div className="section-card">
        <h2>Your Timetable</h2>
        <p>Timetable entries published for your class will appear here.</p>
      </div>
    </DashboardLayout>
  );
}

export default Timetables;
