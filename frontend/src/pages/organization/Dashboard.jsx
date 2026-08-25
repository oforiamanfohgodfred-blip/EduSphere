import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OrganizationSidebar from "../../components/layout/OrganizationSidebar";
import DashboardHome from "./DashboardHome";

function Dashboard() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/organization/dashboard");
    }
  };

  return (
    <div className="dashboard-container organization-shell">
      <OrganizationSidebar />
      <main className="main-section">
        <div className="organization-topbar">
          <button type="button" className="dashboard-back-button" onClick={handleBack}>
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="organization-topbar-title">
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
