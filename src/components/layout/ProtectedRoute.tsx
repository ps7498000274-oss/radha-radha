import React from "react"
import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LotusIcon } from "@/components/layout/Header"

interface ProtectedRouteProps {
  children?: React.ReactNode
}

/**
 * Route guard component ensuring authenticated access.
 * Shows a serene devotional loader while checking session state.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const authContext = useAuth ? useAuth() : null
  const user = authContext?.user
  const loading = authContext?.loading ?? false

  // Loading state with divine devotional animation
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4">
        <div className="relative flex flex-col items-center justify-center space-y-6">
          {/* Glowing Aura Effect */}
          <div className="absolute w-36 h-36 bg-amber-400/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

          {/* Sacred Lotus Icon Container */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-amber-300 shadow-xl shadow-indigo-600/30 ring-2 ring-amber-400/50">
            <LotusIcon className="w-12 h-12 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
            </span>
          </div>

          {/* Devotional Loading Text */}
          <div className="text-center space-y-1.5 z-10">
            <h2 className="font-devanagari text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-wider">
              राधे राधे
            </h2>
            <p className="text-sm font-medium text-foreground">
              Entering your sacred sadhana space...
            </p>
            <p className="text-xs text-muted-foreground font-serif italic">
              "Every chant brings you closer to divine love"
            </p>
          </div>

          {/* Subtle Spinner Bar */}
          <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-amber-400 via-indigo-600 to-amber-400 animate-shimmer" />
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated: redirect to login while preserving target route
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated: render children or nested Outlet
  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
