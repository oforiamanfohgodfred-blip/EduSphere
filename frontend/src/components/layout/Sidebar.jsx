import { Link } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaCalendarAlt,
  FaBook,
  FaFolderOpen,
  FaBullhorn,
  FaUser,
  FaSignOutAlt,
  FaChalkboard,
} from "react-icons/fa";

function Sidebar({ role = "teacher" }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const teacherLinks = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: <FaHome /> },
    { name: "My Classes", path: "/teacher/dashboard", icon: <FaChalkboard /> },
    { name: "Assignments", path: "/teacher/assignments", icon: <FaClipboardList /> },
    { name: "Timetables", path: "/teacher/timetables", icon: <FaCalendarAlt /> },
    { name: "Exam Notifications", path: "/teacher/exams", icon: <FaBook /> },
    { name: "Resources", path: "/teacher/resources", icon: <FaFolderOpen /> },
    { name: "Announcements", path: "/teacher/announcements", icon: <FaBullhorn /> },
    { name: "Profile", path: "/teacher/profile", icon: <FaUser /> },
  ];

  const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard", icon: <FaHome /> },
    { name: "My Class", path: "/student/class", icon: <FaChalkboard /> },
    { name: "Assignments", path: "/student/assignments", icon: <FaClipboardList /> },
    { name: "Timetables", path: "/student/timetables", icon: <FaCalendarAlt /> },
    { name: "Exam Notifications", path: "/student/exams", icon: <FaBook /> },
    { name: "Resources", path: "/student/resources", icon: <FaFolderOpen /> },
    { name: "Announcements", path: "/student/announcements", icon: <FaBullhorn /> },
    { name: "Profile", path: "/student/profile", icon: <FaUser /> },
  ];

  const links = role === "teacher" ? teacherLinks : studentLinks;

  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">EduSphere</h2>
      <nav className="sidebar-menu">
        {links.map((link) => (
          <Link key={`${link.name}-${link.path}`} to={link.path} className="sidebar-link">
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="sidebar-link logout" style={{ border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left" }}>
          <span className="sidebar-icon"><FaSignOutAlt /></span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
