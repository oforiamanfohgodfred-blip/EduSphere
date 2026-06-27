import DashboardLayout from "../../components/layout/DashboardLayout";
import TeacherDashboardContent from "./components/TeacherDashboardContent";

function Dashboard() {
  return (
    <DashboardLayout role="teacher">
      <TeacherDashboardContent />
    </DashboardLayout>
  );
}

export default Dashboard;