import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Profile() {
  const [profile, setProfile] = useState({
    name: "John Smith",
    email: "teacher@edusphere.com",
    department: "Computer Science",
  });

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [department, setDepartment] = useState(profile.department);

  const saveProfile = () => {
    setProfile({
      name,
      email,
      department,
    });

    setEditing(false);
  };

  return (
    <DashboardLayout role="teacher">
      <h1>Teacher Profile</h1>

      <div className="profile-card">
        {editing ? (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
            />

            <button
              className="action-btn"
              onClick={saveProfile}
            >
              Save Profile
            </button>
          </>
        ) : (
          <>
            <h2>{profile.name}</h2>

            <p>
              <strong>Email:</strong> {profile.email}
            </p>

            <p>
              <strong>Department:</strong>{" "}
              {profile.department}
            </p>

            <button
              className="action-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Profile;