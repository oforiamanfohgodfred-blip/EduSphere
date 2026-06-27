import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({
  children,
  role = "teacher",
}) {
  return (
    <div className="dashboard-container">
      <Sidebar role={role} />

      <div className="main-section">
        <Navbar />

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;