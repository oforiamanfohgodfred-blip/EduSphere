import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user } = useAuth();
  const profile = user?.profile;
  const role = user?.role || "user";
  const name = profile?.full_name || profile?.name || "EduSphere User";

  return (
    <div className="navbar">
      <div>
        <h2>Dashboard</h2>
        <small>{role.charAt(0).toUpperCase() + role.slice(1)} workspace</small>
      </div>
      <div className="user-info">
        <strong>{name}</strong>
        <span>{profile?.email || "Signed in to EduSphere"}</span>
      </div>
    </div>
  );
}

export default Navbar;
