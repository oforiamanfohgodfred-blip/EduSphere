import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user } = useAuth();
  const name = user?.full_name || user?.organization_name || user?.name || "User";
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Account";

  return (
    <div className="navbar">
      <h2>Dashboard</h2>
      <div className="user-info">
        Welcome, {name} · {role}
      </div>
    </div>
  );
}

export default Navbar;
