import DashboardLayout from "../../components/layout/DashboardLayout";

function Timetables() {
  return (
    <DashboardLayout role="teacher">
      <h1>Timetables</h1>
      <div className="section-card">
        <h2>Class Timetables</h2>
        <p>Timetable publishing will be connected to class VLE data. No browser-only timetable entries are stored.</p>
      </div>
    </DashboardLayout>
  );
}

export default Timetables;
