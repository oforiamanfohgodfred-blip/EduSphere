function TeacherDashboardContent() {
  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <p className="dashboard-subtitle">
        Welcome back! Manage your classes and resources here.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Assignments</h3>
          <p>12</p>
        </div>

        <div className="stat-card">
          <h3>Timetables</h3>
          <p>5</p>
        </div>

        <div className="stat-card">
          <h3>Exam Notices</h3>
          <p>3</p>
        </div>

        <div className="stat-card">
          <h3>Announcements</h3>
          <p>8</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h2>Recent Activity</h2>

          <ul>
            <li>Assignment uploaded</li>
            <li>Exam notice posted</li>
            <li>Timetable updated</li>
          </ul>
        </div>

        <div className="section-card">
          <h2>Quick Actions</h2>

          <button className="action-btn">
            Upload Assignment
          </button>

          <button className="action-btn">
            Add Timetable
          </button>

          <button className="action-btn">
            Post Exam Notice
          </button>

          <button className="action-btn">
            Make Announcement
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardContent;