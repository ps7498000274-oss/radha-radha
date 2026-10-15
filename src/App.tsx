import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

// Protected pages
import Dashboard from './pages/Dashboard'
import DailyEntry from './pages/DailyEntry'
import Progress from './pages/Progress'
import Analytics from './pages/Analytics'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import TapCounter from './pages/TapCounter'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/admin" element={<Admin />} />

      {/* Protected routes with dashboard layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tap-counter" element={<TapCounter />} />
          <Route path="/add-jap" element={<DailyEntry />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/targets" element={<Progress />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
