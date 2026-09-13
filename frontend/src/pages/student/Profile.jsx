import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaUserGraduate, FaEnvelope, FaPhone, FaSchool } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user } = useAuth();
  const student = {
    name: user?.full_name || user?.name || "Student",
    studentId: user?.student_id || "—",
    email: user?.email || "—",
    phone: user?.phone || "Not provided",
    className: user?.class_name || "Class assignment is shown on your dashboard.",
  };

  return (
    <DashboardLayout role="student">
      <h1>My Profile</h1>
      <p className="dashboard-subtitle">Your authenticated EduSphere student account.</p>
      <div className="profile-card">
        <div className="profile-avatar"><FaUserGraduate /></div>
        <h2>{student.name}</h2>
        <div className="profile-info">
          <p><strong>Student ID:</strong> {student.studentId}</p>
          <p><FaEnvelope /> {student.email}</p>
          <p><FaPhone /> {student.phone}</p>
          <p><FaSchool /> {student.className}</p>
          <p><strong>Organization ID:</strong> {user?.organization_id || "—"}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
