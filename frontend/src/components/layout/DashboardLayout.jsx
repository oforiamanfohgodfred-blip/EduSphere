import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../../styles/dashboard.css";

function DashboardLayout({ children, role = "teacher" }) {
  return (
    <div className="dashboard-container">
      <Sidebar role={role} />
      <div className="main-section">
        <Navbar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
