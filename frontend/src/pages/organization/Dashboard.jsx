import OrganizationSidebar from "../../components/layout/OrganizationSidebar";
import DashboardHome from "./DashboardHome";

function Dashboard() {
  return (
    <div className="dashboard-container organization-shell">
      <OrganizationSidebar />
      <main className="main-section">
        <div className="organization-topbar">
          <div>
            <span className="topbar-label">ORGANIZATION WORKSPACE</span>
            <strong>EduSphere Administration</strong>
          </div>
          <div className="topbar-badge">● System active</div>
        </div>
        <div className="content organization-content">
          <DashboardHome />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
