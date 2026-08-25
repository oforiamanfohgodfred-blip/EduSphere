import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import RegisterChoice from "../pages/auth/RegisterChoice";
import RegisterOrganization from "../pages/auth/RegisterOrganization";
import JoinOrganization from "../pages/auth/JoinOrganization";
import OrganizationSuccess from "../pages/auth/OrganizationSuccess";
import TeacherDashboard from "../pages/teacher/Dashboard";
import Assignments from "../pages/teacher/Assignments";
import Timetables from "../pages/teacher/Timetables";
import ExamNotifications from "../pages/teacher/ExamNotifications";
import Resources from "../pages/teacher/Resources";
import Announcements from "../pages/teacher/Announcements";
import Profile from "../pages/teacher/Profile";
import StudentDashboard from "../pages/student/Dashboard";
import StudentAssignments from "../pages/student/Assignments";
import StudentTimetables from "../pages/student/Timetables";
import StudentExamNotifications from "../pages/student/ExamNotifications";
import StudentAnnouncements from "../pages/student/Announcements";
import StudentResources from "../pages/student/Resources";
import StudentProfile from "../pages/student/Profile";
import OrganizationDashboard from "../pages/organization/Dashboard";
import Teachers from "../pages/organization/Teachers";
import Students from "../pages/organization/Students";
import Classes from "../pages/organization/Classes";
import ClassDetails from "../pages/organization/ClassDetails";
import Subjects from "../pages/organization/Subjects";
import Settings from "../pages/organization/Settings";
import ProtectedRoute from "../components/ProtectedRoute";
const p=(role,element)=><ProtectedRoute role={role}>{element}</ProtectedRoute>;
function AppRoutes(){return <Routes>
<Route path="/" element={<Login/>}/><Route path="/register" element={<RegisterChoice/>}/><Route path="/register-organization" element={<RegisterOrganization/>}/><Route path="/join-organization" element={<JoinOrganization/>}/><Route path="/organization-success" element={<OrganizationSuccess/>}/>
<Route path="/teacher/dashboard" element={p("teacher",<TeacherDashboard/>)}/><Route path="/teacher/assignments" element={p("teacher",<Assignments/>)}/><Route path="/teacher/timetables" element={p("teacher",<Timetables/>)}/><Route path="/teacher/exams" element={p("teacher",<ExamNotifications/>)}/><Route path="/teacher/resources" element={p("teacher",<Resources/>)}/><Route path="/teacher/announcements" element={p("teacher",<Announcements/>)}/><Route path="/teacher/profile" element={p("teacher",<Profile/>)}/>
<Route path="/student/dashboard" element={p("student",<StudentDashboard/>)}/><Route path="/student/assignments" element={p("student",<StudentAssignments/>)}/><Route path="/student/timetables" element={p("student",<StudentTimetables/>)}/><Route path="/student/exams" element={p("student",<StudentExamNotifications/>)}/><Route path="/student/resources" element={p("student",<StudentResources/>)}/><Route path="/student/announcements" element={p("student",<StudentAnnouncements/>)}/><Route path="/student/profile" element={p("student",<StudentProfile/>)}/>
<Route path="/organization/dashboard" element={<OrganizationDashboard/>}/><Route path="/organization/teachers" element={<Teachers/>}/><Route path="/organization/students" element={<Students/>}/><Route path="/organization/classes" element={<Classes/>}/><Route path="/organization/classes/:id" element={<ClassDetails/>}/><Route path="/organization/subjects" element={<Subjects/>}/><Route path="/organization/settings" element={<Settings/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>}
export default AppRoutes;
