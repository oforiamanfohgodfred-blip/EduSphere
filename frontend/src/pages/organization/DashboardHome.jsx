function DashboardHome() {
  return (
    <div>
      <h1>Organization Dashboard</h1>

      <p>
        Welcome to your EduSphere Organization.
      </p>

      <div className="stats-grid">

        <div className="stat-card">
          <h2>0</h2>
          <p>Teachers</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Students</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Classes</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Subjects</p>
        </div>

      </div>

      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h3>Recent Activity</h3>

        <p>No activity yet.</p>
      </div>
    </div>
  );
}

export default DashboardHome;