import OrganizationSidebar from "../../components/layout/OrganizationSidebar";
import DashboardHome from "./DashboardHome";

function Dashboard() {
  return (
    <div className="dashboard">
      <OrganizationSidebar />

      <div className="dashboard-content">
        <DashboardHome />
      </div>
    </div>
  );
}

export default Dashboard;