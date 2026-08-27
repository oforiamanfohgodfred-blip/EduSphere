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
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ role = "teacher" }) {
  const { logout } = useAuth();

  const teacherLinks = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: <FaHome /> },
    { name: "Assignments", path: "/teacher/assignments", icon: <FaClipboardList /> },
    { name: "Timetables", path: "/teacher/timetables", icon: <FaCalendarAlt /> },
    { name: "Exam Notifications", path: "/teacher/exams", icon: <FaBook /> },
    { name: "Resources", path: "/teacher/resources", icon: <FaFolderOpen /> },
    { name: "Announcements", path: "/teacher/announcements", icon: <FaBullhorn /> },
    { name: "Profile", path: "/teacher/profile", icon: <FaUser /> },
  ];

  const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard", icon: <FaHome /> },
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
          <Link key={link.path} to={link.path} className="sidebar-link">
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}
        <button type="button" onClick={logout} className="sidebar-link logout">
          <span className="sidebar-icon"><FaSignOutAlt /></span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
