import { Routes, Route, Navigate } from "react-router-dom";

import Register from "../pages/auth/Register";

import RegisterChoice from "../pages/auth/RegisterChoice";
import RegisterOrganization from "../pages/auth/RegisterOrganization";
import JoinOrganization from "../pages/auth/JoinOrganization";

import Login from "../pages/auth/Login";

import TeacherDashboard from "../pages/teacher/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";

import Assignments from "../pages/teacher/Assignments";
import Timetables from "../pages/teacher/Timetables";
import ExamNotifications from "../pages/teacher/ExamNotifications";
import Resources from "../pages/teacher/Resources";
import Announcements from "../pages/teacher/Announcements";
import Profile from "../pages/teacher/Profile";

import StudentAssignments from "../pages/student/Assignments";
import StudentTimetables from "../pages/student/Timetables";
import StudentExamNotifications from "../pages/student/ExamNotifications";
import StudentAnnouncements from "../pages/student/Announcements";
import StudentResources from "../pages/student/Resources";
import StudentProfile from "../pages/student/Profile";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
   <Route path="/" element={<Login />} />

<Route
  path="/register"
  element={<RegisterChoice />}
/>

<Route
  path="/register-organization"
  element={<RegisterOrganization />}
/>

<Route
  path="/join-organization"
  element={<JoinOrganization />}
/>
      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute role="teacher">
            <Assignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/timetables"
        element={
          <ProtectedRoute role="teacher">
            <Timetables />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/exams"
        element={
          <ProtectedRoute role="teacher">
            <ExamNotifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/resources"
        element={
          <ProtectedRoute role="teacher">
            <Resources />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/announcements"
        element={
          <ProtectedRoute role="teacher">
            <Announcements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute role="teacher">
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute role="student">
            <StudentAssignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/timetables"
        element={
          <ProtectedRoute role="student">
            <StudentTimetables />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/exams"
        element={
          <ProtectedRoute role="student">
            <StudentExamNotifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/announcements"
        element={
          <ProtectedRoute role="student">
            <StudentAnnouncements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/resources"
        element={
          <ProtectedRoute role="student">
            <StudentResources />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute role="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;