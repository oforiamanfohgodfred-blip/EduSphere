import DashboardLayout from "../../components/layout/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout role="student">
      <h1>Student Dashboard</h1>

      <p className="dashboard-subtitle">
        Welcome back! Here is your learning overview.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Assignments Due</h3>
          <p>4</p>
        </div>

        <div className="stat-card">
          <h3>Upcoming Classes</h3>
          <p>6</p>
        </div>

        <div className="stat-card">
          <h3>Upcoming Exams</h3>
          <p>2</p>
        </div>

        <div className="stat-card">
          <h3>Resources Available</h3>
          <p>15</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h2>Latest Announcements</h2>

          <ul>
            <li>Assignment deadline extended.</li>
            <li>Exam venue changed.</li>
            <li>New study material uploaded.</li>
          </ul>
        </div>

        <div className="section-card">
          <h2>Upcoming Activities</h2>

          <ul>
            <li>Mathematics Class - Monday</li>
            <li>Physics Lab - Tuesday</li>
            <li>Midterm Exam - Friday</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;