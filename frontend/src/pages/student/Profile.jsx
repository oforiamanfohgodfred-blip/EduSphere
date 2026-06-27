import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaUserGraduate, FaEnvelope, FaPhone, FaSchool } from "react-icons/fa";

function Profile() {
  const student = {
    name: "John Doe",
    studentId: "EDS2025001",
    email: "johndoe@example.com",
    phone: "+233 20 123 4567",
    programme: "BSc Computer Science",
    level: "Level 300",
  };

  return (
    <DashboardLayout role="student">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          <FaUserGraduate />
        </div>

        <h2>{student.name}</h2>

        <div className="profile-info">
          <p><strong>Student ID:</strong> {student.studentId}</p>

          <p>
            <FaEnvelope /> {student.email}
          </p>

          <p>
            <FaPhone /> {student.phone}
          </p>

          <p>
            <FaSchool /> {student.programme}
          </p>

          <p>
            <strong>Level:</strong> {student.level}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;