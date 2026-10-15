import React from "react"
import { Link, Outlet } from "react-router-dom"
import { ArrowLeft, Sparkles, Heart } from "lucide-react"
import { LotusIcon } from "@/components/layout/Header"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children?: React.ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background antialiased selection:bg-amber-400/30 selection:text-foreground">
      {/* Left Devotional Side (Visible on lg and up) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex-col justify-between p-12 overflow-hidden border-r border-indigo-900/40 select-none">
        {/* Subtle Decorative Mandala/Floral Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <svg
            className="w-[700px] h-[700px] text-amber-300 animate-spin-slow"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            style={{ animation: "spin 120s linear infinite" }}
          >
            <circle cx="100" cy="100" r="90" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="70" />
            <circle cx="100" cy="100" r="50" strokeDasharray="2 2" />
            <circle cx="100" cy="100" r="30" />
            <path d="M100 10 L100 190 M10 100 L190 100" />
            <path d="M36 36 L164 164 M36 164 L164 36" />
            <polygon points="100,20 170,140 30,140" fill="none" />
            <polygon points="100,180 170,60 30,60" fill="none" />
          </svg>
        </div>

        {/* Ambient glowing radial light */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Return Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-amber-300 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Home</span>
          </Link>

          <span className="text-xs font-devanagari text-amber-400/80 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            श्री राधा कृपा कटाक्ष
          </span>
        </div>

        {/* Center Devotional Hero Branding & Quotes */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-8">
          {/* Sacred Lotus Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-amber-400/30 backdrop-blur-md shadow-xl shadow-indigo-950/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white">
              <LotusIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-base">
                Radha Radha
              </span>
              <span className="text-xs text-amber-300/80 font-devanagari ml-2 font-semibold">
                नाम जप साधना
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-devanagari text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 drop-shadow-sm">
              राधे राधे
            </h1>
            <p className="text-xl font-serif text-slate-200 leading-snug">
              Every sacred chant connects your soul with infinite divine grace.
            </p>
          </div>

          {/* Devotional Quote Box */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-b from-indigo-950/70 to-slate-900/80 border border-indigo-700/30 backdrop-blur-sm shadow-xl">
            <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-semibold uppercase tracking-wider">
              Sacred Shloka
            </span>
            <p className="font-devanagari text-base sm:text-lg text-amber-200 leading-relaxed pt-1">
              "राधे तू बड़भागिनी, कौन तपस्या कीन। <br />
              तीन लोक तरण तारण, सो तेरे आधीन॥"
            </p>
            <p className="text-xs text-slate-300/80 mt-3 font-sans leading-relaxed italic border-t border-white/10 pt-2.5">
              "O Sri Radhe, your fortune is matchless! The beloved Lord of all three worlds is lovingly bound by your selfless surrender."
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>Daily Sadhana Tracker</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>Spiritual Milestones</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>Jap Malas Counter</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>Ambient Kirtan Audio</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>Radha Radha — Naam Jap Tracker</span>
          <span className="flex items-center gap-1 font-devanagari text-amber-300">
            श्री राधे शरणम् मम्
          </span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-10 sm:py-16">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile Top Header (Visible only on < lg) */}
          <div className="lg:hidden text-center space-y-3 pb-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-amber-300 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-amber-400/30">
                <LotusIcon className="w-6 h-6 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="font-serif font-bold text-lg text-foreground">
                  Radha Radha
                </div>
                <div className="text-xs font-devanagari text-amber-600 dark:text-amber-400 font-semibold -mt-0.5">
                  राधे राधे • नाम जप
                </div>
              </div>
            </div>

            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif pt-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Desktop Form Title/Subtitle if passed */}
          {(title || subtitle) && (
            <div className="hidden lg:block space-y-1">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}

          {/* Form Content / Route Children */}
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-lg shadow-indigo-950/5 relative overflow-hidden">
            {/* Subtle top sacred border accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-600 to-amber-400" />
            {children || <Outlet />}
          </div>

          {/* Form bottom blessing */}
          <div className="text-center text-xs text-muted-foreground font-devanagari">
            🙏 जय श्री राधे कृष्ण • सर्वे भवन्तु सुखिनः
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
