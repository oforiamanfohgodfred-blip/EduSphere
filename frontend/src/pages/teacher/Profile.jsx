import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user } = useAuth();
  const name = user?.full_name || user?.name || "Teacher";
  const email = user?.email || "—";
  const subject = user?.subject || "Teaching staff";
  const teacherId = user?.teacher_id || "—";
  const phone = user?.phone || "Not provided";

  return (
    <DashboardLayout role="teacher">
      <h1>Teacher Profile</h1>
      <p className="dashboard-subtitle">Your authenticated EduSphere teacher account.</p>
      <div className="profile-card">
        <h2>{name}</h2>
        <p><strong>Teacher ID:</strong> {teacherId}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Organization ID:</strong> {user?.organization_id || "—"}</p>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
