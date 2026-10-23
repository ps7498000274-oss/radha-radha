import React, { useState, useEffect } from "react"
import {
  ShieldCheck,
  Lock,
  Users,
  Activity,
  Search,
  LogOut,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { formatIndianNumber, formatDate } from "@/lib/formatters"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Link, Navigate } from "react-router-dom"

interface AdminUserStat {
  user_id: string
  display_name: string | null
  timezone: string
  daily_goal: number
  created_at: string
  total_jap_count: number
  days_active: number
  last_active_date: string | null
}

/**
 * Admin Page — Server-side authorized via Supabase RPC.
 *
 * Authorization flow:
 * 1. User must be authenticated via Supabase Auth (enforced by ProtectedRoute)
 * 2. On mount, calls `get_admin_user_stats()` RPC (no parameters)
 * 3. The RPC checks `auth.uid()` against the `admin_users` table server-side
 * 4. If the user is NOT in admin_users, the RPC raises an exception
 * 5. No credentials are stored in or compared by the frontend
 */
export default function AdminPage() {
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  // Admin authorization state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // null = not yet checked
  const [authError, setAuthError] = useState<string | null>(null)

  // Dashboard Data State
  const [usersList, setUsersList] = useState<AdminUserStat[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "total_jap_count">("created_at")
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  // Fetch admin data — the RPC itself enforces authorization server-side
  const fetchAdminData = async () => {
    if (!isSupabaseConfigured()) {
      setAuthError("Supabase is not configured.")
      setIsAdmin(false)
      return
    }

    setLoading(true)
    setAuthError(null)
    try {
      const { data, error } = await supabase.rpc("get_admin_user_stats")

      if (error) {
        // Check if this is an authorization error
        if (
          error.message?.includes("Unauthorized") ||
          error.message?.includes("admin") ||
          error.code === "P0001" // RAISE EXCEPTION code
        ) {
          setIsAdmin(false)
          setAuthError("You do not have admin privileges for this console.")
        } else {
          // Could be a different error (e.g., function doesn't exist yet)
          setIsAdmin(false)
          setAuthError(
            "Admin access check failed. Ensure migration 004_secure_admin.sql has been applied."
          )
        }
        setUsersList([])
        return
      }

      // If RPC succeeded, the user IS an admin
      setIsAdmin(true)
      setUsersList(data || [])
    } catch (err: any) {
      setIsAdmin(false)
      setAuthError(err?.message || "An unexpected error occurred.")
      setUsersList([])
    } finally {
      setLoading(false)
    }
  }

  // Check admin status on mount (after auth is ready)
  useEffect(() => {
    if (!authLoading && user) {
      fetchAdminData()
    }
  }, [authLoading, user?.id])

  // If not authenticated, redirect to login
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  // Still loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          <p className="text-sm text-slate-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Admin check in progress
  if (isAdmin === null && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-400 animate-pulse" />
          <p className="text-sm text-slate-400">Verifying admin privileges...</p>
        </div>
      </div>
    )
  }

  // Not an admin — show access denied
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide font-serif">
                Access Denied
              </h1>
              <p className="text-xs text-slate-400 max-w-xs">
                {authError || "Your account does not have admin privileges. Contact the system administrator."}
              </p>
            </div>

            <div className="text-center pt-2 space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAdminData}
                className="border-slate-700 text-slate-300 hover:text-white text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry
              </Button>
              <div>
                <Link to="/" className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
                  ← Return to Radha Radha Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filtered and sorted users
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase()
    return (
      (u.display_name || "").toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    )
  })

  filteredUsers.sort((a, b) => {
    if (sortField === "total_jap_count") {
      return sortAsc
        ? a.total_jap_count - b.total_jap_count
        : b.total_jap_count - a.total_jap_count
    }
    // Default created_at
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortAsc ? dateA - dateB : dateB - dateA
  })

  // Aggregate Metrics
  const totalDevotees = usersList.length
  const totalGlobalJap = usersList.reduce((acc, curr) => acc + Number(curr.total_jap_count || 0), 0)
  const totalActiveDays = usersList.reduce((acc, curr) => acc + Number(curr.days_active || 0), 0)

  // -------------------------------------------------------------
  // Render Admin Dashboard (only reached if isAdmin === true)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Radha Radha — Admin Console</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  Admin Active
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Overview of devotee accounts, daily activities, and platform sadhana totals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={loading}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              asChild
              variant="destructive"
              size="sm"
              className="gap-2 text-xs bg-red-600/80 hover:bg-red-600"
            >
              <Link to="/">
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Registered Accounts</span>
                <Users className="w-4 h-4 text-amber-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">
                {totalDevotees}
              </p>
              <p className="text-xs text-slate-500 mt-1">Devotees who created accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Naam Jap Recorded</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-amber-400">
                {formatIndianNumber(totalGlobalJap)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Collective chants recorded</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Active Log Sessions</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-emerald-400">
                {totalActiveDays}
              </p>
              <p className="text-xs text-slate-500 mt-1">Daily entries saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Table & Filter Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                aria-label="Search by devotee name or user ID"
                placeholder="Search by devotee name or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sortField === "total_jap_count") {
                    setSortAsc(!sortAsc)
                  } else {
                    setSortField("total_jap_count")
                    setSortAsc(false)
                  }
                }}
                className={`text-xs h-9 border-slate-800 ${
                  sortField === "total_jap_count" ? "bg-amber-500/20 text-amber-300" : "bg-slate-950 text-slate-300"
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                <span>Sort by Jap Count</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sortField === "created_at") {
                    setSortAsc(!sortAsc)
                  } else {
                    setSortField("created_at")
                    setSortAsc(false)
                  }
                }}
                className={`text-xs h-9 border-slate-800 ${
                  sortField === "created_at" ? "bg-amber-500/20 text-amber-300" : "bg-slate-950 text-slate-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>Sort by Join Date</span>
              </Button>
            </div>
          </div>

          {/* Devotees Accounts Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Devotee Name</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Lifetime Jap Count</th>
                  <th className="py-3 px-4">Active Days</th>
                  <th className="py-3 px-4">Daily Goal</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {loading ? "Loading account records..." : "No devotee accounts found."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((devotee, index) => (
                    <tr key={devotee.user_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {devotee.display_name || "Anonymous Devotee"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">
                        {devotee.user_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-400">
                        {formatIndianNumber(devotee.total_jap_count)}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {devotee.days_active} Days
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {formatIndianNumber(devotee.daily_goal)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {devotee.last_active_date
                          ? formatDate(devotee.last_active_date, "dd MMM yyyy")
                          : "No entries yet"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(devotee.created_at, "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500 pb-8">
          <span>Radha Radha — Naam Jap Tracker Admin Console • Confidential Data</span>
        </div>
      </div>
    </div>
  )
}
