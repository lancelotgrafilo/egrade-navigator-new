import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage/ForgotPasswordPage';
import { CreateNewPassword } from './components/CreateNewPassword/CreateNewPassword';
import { AdminDashboard } from './pages/AdminDashboard/AdminDashboard';
import { ClassProgramInformation } from './components/ClassProgramInformation/ClassProgramInformation';
import { Subjects } from './components/Subjects/Subjects';
import { SubjectFaculty } from './components/FacultyStaff/SubjectFaculty/SubjectFaculty';
import { Instructors } from './components/Instructors/Instructors';
import { Students } from './components/Students/Students';
import { Student } from './components/Students/Student';
import { StudentsFaculty } from './components/FacultyStaff/StudentsFaculty/StudentsFaculty';
import { StudentFaculty } from './components/FacultyStaff/StudentsFaculty/StudentFaculty';
import { StudentGrades } from './components/FacultyStaff/StudentGrades/StudentGrades';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { ActivityLogHistory } from './components/ActivityLogHistory/ActivitiyLogHistory';
import { Settings } from './components/Settings/Settings';
import { SettingsFaculty } from './components/FacultyStaff/SettingsFaculty/SettingsFaculty';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DashboardFaculty } from './components/FacultyStaff/Dashboard/DashboardFaculty';
import { StudentSubject } from './components/StudentSubject/StudentSubject';
import { ActiveUsers } from './components/ActiveUsers/ActiveUsers';
import { Instructor } from './components/Instructors/Instructor';
import { InstructorsLoad } from './components/InstructorsLoad/InstructorsLoad';
import { InstructorsStudent } from './components/InstructorsStudent/InstructorsStudent';
import { ClassProgInstructor } from './components/ClassProgInstructor/ClassProgInstructor';
import { ClassProgStudent } from './components/ClassProgStudent/ClassProgStudent';
import { StudentDashboard } from './pages/StudentDashboard/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard/FacultyDashboard';
import { CollegeDashboard } from './pages/CollegeDashboard/CollegeDashboard';
import { RegistrarDashboard } from './pages/RegistrarDashboard/RegistrarDashboard';
import { UsersList } from './components/UsersList/UsersList';
import { AppProviders } from './utils/contexts/AppProviders';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'; // Import the ProtectedRoute component
import { StudentsDashboard } from './components/StudentsDashboard/Dashboard/StudentsDashboard';
import { StudentsSettings } from './components/StudentsDashboard/StudentsSettings/StudentsSettings';
import { Documents } from './components/Documents/Documents';

export default function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Example, replace with your auth logic
  const userTitle = JSON.parse(localStorage.getItem('user'))?.title; // Example, replace with your auth logic

  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
          <Route path="/createNewPassword" element={<CreateNewPassword />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} isAuthenticated={isAuthenticated} requiredTitle="admin" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classProgramInformation" element={<ClassProgramInformation />} />
            <Route path="classProgramInformation/instructor/:id" element={<ClassProgInstructor />} />
            <Route path="classProgramInformation/students/:id" element={<ClassProgStudent />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="instructors" element={<Instructors />}>
              <Route index element={<Instructor />} />
              <Route path="instructors_load/:id" element={<InstructorsLoad />} />
              <Route path="instructors_load/:id/instructors_student/:loadId" element={<InstructorsStudent />} />
            </Route>
            <Route path="students" element={<Students />}>
              <Route index element={<Student />} />
              <Route path="student_subject/:id" element={<StudentSubject />} />
            </Route>
            <Route path="documents" element={ <Documents/> } />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="activityLogHistory" element={<ActivityLogHistory />} />
            <Route path="activeUsers" element={<ActiveUsers />} />
            <Route path="usersList" element={<UsersList />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Student Route */}
          <Route path="/student" element={<ProtectedRoute element={<StudentDashboard />} isAuthenticated={isAuthenticated} requiredTitle="student" />} >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={ <StudentsDashboard /> } />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<StudentsSettings />} />
          </Route>

          {/* Faculty Staff Route */}
          <Route path="/facultyStaff" element={<ProtectedRoute element={<FacultyDashboard />} isAuthenticated={isAuthenticated} requiredTitle="faculty_staff" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<DashboardFaculty />} />
            <Route path="subjects" element={<SubjectFaculty />} />
            <Route path="instructors" element={<Instructors />}>
              <Route index element={<Instructor />} />
              <Route path="instructors_load/:id" element={<InstructorsLoad />} />
              <Route path="instructors_load/:id/instructors_student/:loadId" element={<InstructorsStudent />} />
            </Route>
            <Route path="students" element={<StudentFaculty />}>
              <Route index element={<StudentsFaculty />} />
              <Route path="/facultyStaff/students/student_grades/:instructorId/:studentId/:subjectId" element={<StudentGrades />} />
            </Route>
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<SettingsFaculty />} />
          </Route>

          {/* College Staff Route */}
          <Route path="/collegeStaff" element={<ProtectedRoute element={<CollegeDashboard />} isAuthenticated={isAuthenticated} requiredTitle="college_staff" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classProgramInformation" element={<ClassProgramInformation />} />
            <Route path="classProgramInformation/instructor/:id" element={<ClassProgInstructor />} />
            <Route path="classProgramInformation/students/:id" element={<ClassProgStudent />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="instructors" element={<Instructors />}>
              <Route index element={<Instructor />} />
              <Route path="instructors_load/:id" element={<InstructorsLoad />} />
              <Route path="instructors_load/:id/instructors_student/:loadId" element={<InstructorsStudent />} />
            </Route>
            <Route path="students" element={<Students />}>
              <Route index element={<Student />} />
              <Route path="student_subject/:id" element={<StudentSubject />} />
            </Route>
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="documents" element={ <Documents/> } />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Registrar Staff Route */}
          <Route path="/registrarStaff" element={<ProtectedRoute element={<RegistrarDashboard />} isAuthenticated={isAuthenticated} requiredTitle="registrar_staff" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classProgramInformation" element={<ClassProgramInformation />} />
            <Route path="classProgramInformation/instructor/:id" element={<ClassProgInstructor />} />
            <Route path="classProgramInformation/students/:id" element={<ClassProgStudent />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="instructors" element={<Instructors />}>
              <Route index element={<Instructor />} />
              <Route path="instructors_load/:id" element={<InstructorsLoad />} />
              <Route path="instructors_load/:id/instructors_student/:loadId" element={<InstructorsStudent />} />
            </Route>
            <Route path="students" element={<Students />}>
              <Route index element={<Student />} />
              <Route path="student_subject/:id" element={<StudentSubject />} />
            </Route>
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
