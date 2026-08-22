import { Link } from "react-router-dom";
import {
  FaHome,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSchool,
  FaBook,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function OrganizationSidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">EduSphere</h2>

      <nav className="sidebar-menu">
        <Link to="/organization/dashboard" className="sidebar-link">
          <FaHome /> <span>Dashboard</span>
        </Link>

        <Link to="/organization/teachers" className="sidebar-link">
          <FaChalkboardTeacher /> <span>Teachers</span>
        </Link>

        <Link to="/organization/students" className="sidebar-link">
          <FaUserGraduate /> <span>Students</span>
        </Link>

        <Link to="/organization/classes" className="sidebar-link">
          <FaSchool /> <span>Classes</span>
        </Link>

        <Link to="/organization/subjects" className="sidebar-link">
          <FaBook /> <span>Subjects</span>
        </Link>

        <Link to="/organization/settings" className="sidebar-link">
          <FaCog /> <span>Settings</span>
        </Link>

        <Link to="/" className="sidebar-link logout">
          <FaSignOutAlt /> <span>Logout</span>
        </Link>
      </nav>
    </div>
  );
}

export default OrganizationSidebar;