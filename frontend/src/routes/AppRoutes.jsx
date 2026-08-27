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

const protectedPage = (role, element) => (
  <ProtectedRoute role={role}>{element}</ProtectedRoute>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<RegisterChoice />} />
      <Route path="/register-organization" element={<RegisterOrganization />} />
      <Route path="/join-organization" element={<JoinOrganization />} />
      <Route path="/organization-success" element={<OrganizationSuccess />} />

      <Route path="/teacher/dashboard" element={protectedPage("teacher", <TeacherDashboard />)} />
      <Route path="/teacher/assignments" element={protectedPage("teacher", <Assignments />)} />
      <Route path="/teacher/timetables" element={protectedPage("teacher", <Timetables />)} />
      <Route path="/teacher/exams" element={protectedPage("teacher", <ExamNotifications />)} />
      <Route path="/teacher/resources" element={protectedPage("teacher", <Resources />)} />
      <Route path="/teacher/announcements" element={protectedPage("teacher", <Announcements />)} />
      <Route path="/teacher/profile" element={protectedPage("teacher", <Profile />)} />

      <Route path="/student/dashboard" element={protectedPage("student", <StudentDashboard />)} />
      <Route path="/student/assignments" element={protectedPage("student", <StudentAssignments />)} />
      <Route path="/student/timetables" element={protectedPage("student", <StudentTimetables />)} />
      <Route path="/student/exams" element={protectedPage("student", <StudentExamNotifications />)} />
      <Route path="/student/announcements" element={protectedPage("student", <StudentAnnouncements />)} />
      <Route path="/student/resources" element={protectedPage("student", <StudentResources />)} />
      <Route path="/student/profile" element={protectedPage("student", <StudentProfile />)} />

      <Route path="/organization/dashboard" element={protectedPage("organization", <OrganizationDashboard />)} />
      <Route path="/organization/teachers" element={protectedPage("organization", <Teachers />)} />
      <Route path="/organization/students" element={protectedPage("organization", <Students />)} />
      <Route path="/organization/classes" element={protectedPage("organization", <Classes />)} />
      <Route path="/organization/classes/:id" element={protectedPage("organization", <ClassDetails />)} />
      <Route path="/organization/subjects" element={protectedPage("organization", <Subjects />)} />
      <Route path="/organization/settings" element={protectedPage("organization", <Settings />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
