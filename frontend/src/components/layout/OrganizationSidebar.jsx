import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSchool,
  FaBook,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const links = [
  ["/organization/dashboard", "Dashboard", FaHome],
  ["/organization/teachers", "Teachers", FaChalkboardTeacher],
  ["/organization/students", "Students", FaUserGraduate],
  ["/organization/classes", "Classes", FaSchool],
  ["/organization/subjects", "Subjects", FaBook],
  ["/organization/settings", "Settings", FaCog],
];

function OrganizationSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const organizationName = user?.organization_name || user?.organization?.name || "Organization Hub";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="org-sidebar">
      <div className="org-brand">
        <div className="org-brand-mark">E</div>
        <div>
          <div className="org-brand-name">EduSphere</div>
          <div className="org-brand-subtitle">Learn. Share. Achieve.</div>
        </div>
      </div>

      <div className="org-workspace">
        <span>ORGANIZATION</span>
        <strong>{organizationName}</strong>
      </div>

      <nav className="org-nav" aria-label="Organization navigation">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={label === "Dashboard"}
            className={({ isActive }) => `org-nav-link${isActive ? " active" : ""}`}
          >
            <span className="org-nav-icon"><Icon /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="org-sidebar-footer">
        <div className="org-sidebar-tip">
          <span>🎓</span>
          <div><strong>Keep learning</strong><small>Build a stronger school community.</small></div>
        </div>
        <button type="button" className="org-logout" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default OrganizationSidebar;
