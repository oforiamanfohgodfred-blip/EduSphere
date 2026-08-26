import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaUserGraduate, FaEnvelope, FaPhone, FaSchool } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../../styles/vle.css";

function Profile() {
  const { user } = useAuth();
  const student = user?.profile;

  return (
    <DashboardLayout role="student">
      <div className="vle-page-shell">
        <div className="page-header">
          <div>
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1>My Profile</h1>
            <p>Your profile is connected to the student account managed by your organization.</p>
          </div>
        </div>

        <div className="dashboard-card profile-vle-card">
          {!student ? (
            <div className="empty-state"><strong>Profile unavailable</strong><span>Please sign out and sign in again.</span></div>
          ) : (
            <div className="profile-vle-content">
              <div className="profile-vle-avatar"><FaUserGraduate /></div>
              <div className="profile-vle-main">
                <span className="person-id">{student.student_id}</span>
                <h2>{student.full_name}</h2>
                <p>{student.class_name || "Student"}</p>
                <div className="profile-detail-grid">
                  <span><strong>Email</strong><span><FaEnvelope /> {student.email}</span></span>
                  <span><strong>Phone</strong><span><FaPhone /> {student.phone || "Not provided"}</span></span>
                  <span><strong>Class</strong><span><FaSchool /> {student.class_name || "Not assigned"}</span></span>
                  <span><strong>Student ID</strong><span>{student.student_id}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
