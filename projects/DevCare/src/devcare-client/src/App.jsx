import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import PatientList from './pages/doctor/PatientList'
import PatientDetail from './pages/doctor/PatientDetail'
import AssignTherapy from './pages/doctor/AssignTherapy'
import FeedbackReview from './pages/doctor/FeedbackReview'
import ShareConnection from './pages/doctor/ShareConnection'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import TherapySession from './pages/patient/TherapySession'
import SessionResult from './pages/patient/SessionResult'
import SessionDetail from './pages/patient/SessionDetail'
import TherapyRoadmap from './pages/patient/TherapyRoadmap'
import Progress from './pages/patient/Progress'
import Feedback from './pages/patient/Feedback'
import JoinDoctor from './pages/patient/JoinDoctor'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />
      <Route path="/join/:token" element={<JoinDoctor />} />
      
      {/* Internal Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Doctor Routes */}
        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patient/:id"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/assign"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AssignTherapy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/feedback"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <FeedbackReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/share"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <ShareConnection />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapy-session"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <TherapySession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session-result"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <SessionResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session-result/:sessionId"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <SessionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-sessions"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <TherapyRoadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Feedback />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
