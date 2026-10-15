import React, { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  BarChart3,
  History,
  Target,
  Settings,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { AudioMiniPlayer } from "@/components/audio/AudioMiniPlayer"
import { LotusIcon } from "@/components/layout/Header"

interface SidebarItem {
  label: string
  hindiLabel: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    hindiLabel: "मुख्य पृष्ठ",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Add Jap",
    hindiLabel: "जप जोड़ें",
    icon: PlusCircle,
    path: "/add-jap",
  },
  {
    label: "My Progress",
    hindiLabel: "मेरी साधना",
    icon: TrendingUp,
    path: "/progress",
  },
  {
    label: "Analytics",
    hindiLabel: "विश्लेषण",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    label: "History",
    hindiLabel: "इतिहास",
    icon: History,
    path: "/history",
  },
  {
    label: "Targets",
    hindiLabel: "संकल्प व लक्ष्य",
    icon: Target,
    path: "/targets",
  },
  {
    label: "Settings",
    hindiLabel: "सेटिंग्स",
    icon: Settings,
    path: "/settings",
  },
  {
    label: "Profile",
    hindiLabel: "प्रोफ़ाइल",
    icon: User,
    path: "/profile",
  },
]

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const location = useLocation()
  const navigate = useNavigate()

  // Contexts
  const authContext = useAuth ? useAuth() : null
  const { user, signOut } = authContext || {}

  const themeContext = useTheme ? useTheme() : null
  const currentTheme = themeContext?.theme || "light"
  const isDark = currentTheme === "dark"

  const handleToggleTheme = () => {
    if (themeContext?.toggleTheme) {
      themeContext.toggleTheme()
    } else if (themeContext?.setTheme) {
      themeContext.setTheme(isDark ? "light" : "dark")
    }
  }

  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut()
      }
      navigate("/login")
    } catch (err) {
      console.error("Sign out error:", err)
      navigate("/login")
    }
  }

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false)
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile sidebar on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  // Derive user display info safely
  const userName =
    (user as any)?.user_metadata?.full_name ||
    (user as any)?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Devotee"
  const userEmail = user?.email || "devotee@radharadha.app"
  const profileAvatar = (authContext as any)?.profile?.avatar_url || localStorage.getItem(`radha_avatar_${user?.id}`)
  const userAvatar = profileAvatar || (user as any)?.user_metadata?.avatar_url

  // Check if a navigation item is active
  const isItemActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return (
      location.pathname === itemPath ||
      location.pathname.startsWith(`${itemPath}/`) ||
      // Also match alternate /dashboard/path structure if routes are nested
      location.pathname === `/dashboard${itemPath}` ||
      location.pathname.startsWith(`/dashboard${itemPath}/`)
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-950 via-[#131131] to-slate-950 text-slate-200 border-r border-indigo-900/40 select-none flex-shrink-0 z-30">
          {/* Sidebar Top: Logo */}
          <div className="p-5 border-b border-indigo-900/30 flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-amber-300 ring-1 ring-amber-400/40 shadow-lg shadow-indigo-950">
                <LotusIcon className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                    Radha Radha
                  </h1>
                  <span className="text-xs font-devanagari font-semibold text-amber-400">
                    राधे राधे
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                  Naam Jap Tracker
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = isItemActive(item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    active
                      ? "bg-gradient-to-r from-indigo-700/80 to-indigo-800/80 text-white font-semibold shadow-md shadow-indigo-950/40 ring-1 ring-amber-400/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        active ? "text-amber-300" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  <span
                    className={cn(
                      "text-[11px] font-devanagari transition-opacity",
                      active ? "text-amber-300/90 font-medium" : "text-slate-400/60 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {item.hindiLabel}
                  </span>

                  {/* Active highlight glow border */}
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Devotional Footer */}
          <div className="p-4 m-3 rounded-xl bg-indigo-950/40 border border-indigo-800/30 text-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-400/5 rounded-full blur-xl" />
            <p className="font-devanagari font-bold text-amber-300 text-sm tracking-wider flex items-center justify-center gap-1.5">
              <span>🙏</span> राधे राधे <span>🙏</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1 italic font-serif">
              "Radha Naam is supreme bliss"
            </p>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Backdrop & Menu */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <aside className="relative flex flex-col w-72 max-w-[80vw] bg-gradient-to-b from-slate-950 via-[#131131] to-slate-950 text-slate-200 shadow-2xl z-10 border-r border-indigo-900/50">
              {/* Header */}
              <div className="p-4 border-b border-indigo-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-amber-300">
                    <LotusIcon className="w-5 h-5 text-amber-300" />
                  </div>
                  <span className="font-serif font-bold text-base text-white">
                    Radha Radha
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const active = isItemActive(item.path)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-950/40"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-4 h-4", active ? "text-amber-300" : "text-slate-400")} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[11px] font-devanagari text-slate-400">
                        {item.hindiLabel}
                      </span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Drawer Footer */}
              <div className="p-4 border-t border-indigo-900/40 text-center">
                <span className="font-devanagari font-bold text-amber-300 text-sm">
                  राधे राधे 🙏
                </span>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 h-16 bg-background/85 backdrop-blur-md border-b border-border/60 px-4 sm:px-6 flex items-center justify-between transition-colors">
            {/* Left: Mobile hamburger & breadcrumb/greeting */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden w-9 h-9 rounded-lg text-foreground hover:bg-accent"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-devanagari font-semibold text-amber-600 dark:text-amber-400">
                    राधे राधे
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">
                    {userName}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                  May your sadhana be blissful today 🙏
                </span>
              </div>
            </div>

            {/* Right: Actions (Theme Toggle, Notifications, User Menu) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleTheme}
                className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-transform active:scale-95"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
                )}
              </Button>

              {/* Notification Bell */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent relative"
                  aria-label="View notifications"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-background" />
                </Button>

                {/* Notifications dropdown menu */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-xl z-50 p-3 animate-scale-in">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Daily Sadhana Reminders
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Active
                      </span>
                    </div>
                    <div className="py-3 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-accent/40 border border-border/40">
                        <p className="font-medium text-foreground">
                          Brahma Muhurta Reminder
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Morning jap hours bring maximum peace and absorption.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-accent/40 border border-border/40">
                        <p className="font-medium text-foreground">Daily Target</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Complete your daily rounds to maintain your streak!
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 text-center border-t border-border/50">
                      <Link
                        to="/targets"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] text-devotional-indigo dark:text-devotional-lavender hover:underline font-medium"
                      >
                        Manage Sadhana Targets →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-amber-400/40 shadow-sm overflow-hidden flex-shrink-0">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-[100px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 p-2 animate-scale-in">
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {userName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Profile & Sadhana</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleSignOut()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 overflow-x-hidden">
            {children || <Outlet />}
          </main>
        </div>
      </div>

      {/* Persistent Mini Audio Player at the bottom */}
      <AudioMiniPlayer />
    </div>
  )
}

export default DashboardLayout
