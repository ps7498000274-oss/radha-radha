import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
// Lazy-loaded route guards and layouts
const ProtectedRoute = lazy(() =>
  import('./components/layout/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute }))
)
const DashboardLayout = lazy(() =>
  import('./components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
)

// Loading fallback — lightweight, no external deps
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="font-devanagari text-primary font-bold text-sm">राधे</span>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

// Lazy-loaded public pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./pages/Admin'))

// Lazy-loaded protected pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DailyEntry = lazy(() => import('./pages/DailyEntry'))
const Progress = lazy(() => import('./pages/Progress'))
const Analytics = lazy(() => import('./pages/Analytics'))
const History = lazy(() => import('./pages/History'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const TapCounter = lazy(() => import('./pages/TapCounter'))

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  )
}
