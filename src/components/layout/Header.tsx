import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Sun, Moon, Sparkles, LogIn, ArrowRight, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Devotional Lotus Icon SVG
 */
export function LotusIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3C12 3 13.8 6.8 15.2 9.4C16.8 12.2 19.5 13.6 21.5 14C19.5 14.8 16.5 14.4 14.2 13.2C14.7 15.4 15 17.8 13.8 20C13 18.2 12.5 16.2 12 14.8C11.5 16.2 11 18.2 10.2 20C9 17.8 9.3 15.4 9.8 13.2C7.5 14.4 4.5 14.8 2.5 14C4.5 13.6 7.2 12.2 8.8 9.4C10.2 6.8 12 3 12 3Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <circle cx="12" cy="11" r="1.5" fill="#f59e0b" />
    </svg>
  )
}

interface NavItem {
  label: string
  href: string
  hindiLabel?: string
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", hindiLabel: "गृह" },
  { label: "Features", href: "/#features", hindiLabel: "विशेषताएं" },
  { label: "About", href: "/#about", hindiLabel: "परिचय" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Theme context safe integration
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

  // Auth context safe integration
  const authContext = useAuth ? useAuth() : null
  const user = authContext?.user
  const isAuthenticated = Boolean(user)

  // Scroll listener for translucent glassmorphic effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/50 shadow-sm shadow-indigo-950/5 py-3"
          : "bg-transparent py-4 sm:py-5"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
            aria-label="Radha Radha Home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-amber-300 shadow-md shadow-indigo-500/20 ring-1 ring-amber-400/30 group-hover:ring-amber-400/60 transition-all">
              <LotusIcon className="w-6 h-6 text-amber-300" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-devotional-indigo transition-colors">
                  Radha Radha
                </span>
                <span className="text-sm font-devanagari font-semibold text-amber-600 dark:text-amber-400">
                  राधे राधे
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide -mt-0.5">
                Naam Jap Tracker • नाम जप साधना
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? location.pathname === "/" && !location.hash
                  : location.hash === item.href.replace("/", "")

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                    isActive
                      ? "text-devotional-indigo dark:text-devotional-lavender font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.hindiLabel && (
                      <span className="text-[10px] opacity-60 font-devanagari">
                        {item.hindiLabel}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-amber-400 to-indigo-600 rounded-full" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-transform active:scale-95"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
              )}
            </Button>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm shadow-indigo-600/25 gap-2"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-foreground hover:text-devotional-indigo hover:bg-accent/60"
                >
                  <Link to="/login" className="flex items-center gap-1.5">
                    <LogIn className="w-4 h-4 text-muted-foreground" />
                    <span>Login</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="bg-devotional-gold hover:bg-devotional-gold-light text-slate-900 font-semibold shadow-md shadow-amber-500/20 border border-amber-300/40 hover:shadow-lg transition-all gap-1.5 group"
                >
                  <Link to="/register">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="w-9 h-9 rounded-lg text-muted-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg text-foreground hover:bg-accent/80"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl animate-accordion-down">
          <div className="container mx-auto px-4 py-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-devanagari font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                श्री राधा नाम संकीर्तन
              </span>
              <span className="text-xs text-muted-foreground">
                🙏 Naam Jap Tracker
              </span>
            </div>

            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-base font-medium text-foreground hover:bg-accent/80 transition-colors"
                >
                  <span>{item.label}</span>
                  {item.hindiLabel && (
                    <span className="text-xs font-devanagari text-muted-foreground">
                      {item.hindiLabel}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            <div className="pt-2 border-t border-border/40 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm gap-2"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center gap-2"
                  >
                    <Link to="/login">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-center bg-devotional-gold hover:bg-devotional-gold-light text-slate-900 font-semibold shadow-md gap-2"
                  >
                    <Link to="/register">
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
export default Header
