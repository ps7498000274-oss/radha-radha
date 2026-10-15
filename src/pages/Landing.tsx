import React from "react"
import { Link } from "react-router-dom"
import {
  Sparkles,
  ArrowRight,
  Shield,
  Heart,
  Calendar,
  BarChart3,
  Flame,
  Award,
  Music,
  Smartphone,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header, LotusIcon } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { AudioFullPlayer } from "@/components/audio/AudioFullPlayer"
import { MILESTONES, APP_NAME, APP_TAGLINE, APP_SUBTITLE } from "@/lib/constants"
import { formatIndianNumber } from "@/lib/formatters"

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-amber-400/30">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-indigo-950/20 via-background to-background">
          {/* Spiritual Ambient Glows */}
          <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-[500px] w-[500px] md:h-[700px] md:w-[700px] rounded-full bg-gradient-to-br from-devotional-indigo/15 to-devotional-gold/15 blur-3xl opacity-70" />
          <div className="pointer-events-none absolute right-10 top-40 h-72 w-72 rounded-full bg-devotional-gold/10 blur-3xl" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
            {/* Sacred Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-devotional-gold mb-8 animate-fade-in">
              <LotusIcon className="h-4 w-4 text-devotional-gold" />
              <span>श्री राधा कृपा कटाक्ष • Personal Naam Jap Tracker</span>
            </div>

            {/* Main Sacred Heading */}
            <h1 className="font-devanagari text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-foreground drop-shadow-sm mb-4">
              राधे राधे
            </h1>

            {/* Subtitles */}
            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-devotional-indigo dark:text-devotional-lavender font-medium mb-3">
              {APP_TAGLINE}
            </p>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground font-sans mb-10 leading-relaxed">
              {APP_SUBTITLE}. Record every single chant with devotion, witness your spiritual momentum, and complete your sacred milestones.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
              <Link to="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 text-base font-semibold bg-gradient-to-r from-devotional-indigo to-indigo-600 hover:from-devotional-indigo hover:to-indigo-500 shadow-xl shadow-devotional-indigo/20 gap-2"
                >
                  <span>Start Your Sadhana</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-13 px-8 text-base font-semibold border-devotional-indigo/30 hover:bg-devotional-indigo/10 gap-2"
                >
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>

            {/* Mini Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>100% Private & Row-Level Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Milestones: 1 Cr to 12 Cr</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-indigo-500" />
                <span>Continuous Devotional Audio</span>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIO PLAYER HIGHLIGHT */}
        <section id="audio" className="py-16 md:py-20 bg-muted/30 border-y border-border/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-devotional-gold">
                Continuous Chanting
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">Immerse In Divine Naam</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Listen to soothing “Radha Radha” naam dhun while you record your sadhana entries.
              </p>
            </div>
            <AudioFullPlayer />
          </div>
        </section>

        {/* MILESTONE TARGETS PREVIEW */}
        <section id="milestones" className="py-20 md:py-28 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-devotional-indigo dark:text-devotional-lavender mb-2">
              <Award className="h-4 w-4 text-devotional-gold" />
              <span>Sacred Milestones</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              A Journey of Lifetime Dedication
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              Progressive cumulative milestones designed to keep your devotion vibrant and disciplined over years of practice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map((m, idx) => (
              <div
                key={m.name}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-devotional-gold/40 group"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-devotional-indigo/10 text-sm font-bold text-devotional-indigo dark:text-devotional-lavender">
                    #{idx + 1}
                  </span>
                  <LotusIcon className="h-5 w-5 text-devotional-gold transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">{m.name}</h3>
                <p className="text-2xl font-extrabold text-devotional-indigo dark:text-devotional-lavender mt-1 tracking-tight">
                  {formatIndianNumber(m.count)}
                </p>
                <p className="text-xs text-muted-foreground mt-3 border-t border-border/50 pt-3">
                  Sacred aggregate lifetime count milestone.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-20 md:py-28 bg-muted/20 border-t border-border/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-devotional-gold">
                Engineered For Devotion
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
                Everything You Need For Consistent Sadhana
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-devotional-indigo dark:text-devotional-lavender">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Daily Naam Jap Log</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Log your daily chant count with quick-add helpers (+108, +1,008, +5,000, +10,000) and personal reflection notes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Streaks & Consistency</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Build unwavering daily habit momentum with current streak tracking, best streak records, and active days analysis.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Deep Visual Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Analyze trends across 7 days, 30 days, months, and years with interactive charts and a GitHub-style activity heatmap.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Completely Private Data</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Your sadhana is sacred and personal. Zero public leaderboards, zero shared counts, protected with Row-Level Security.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <Music className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Persistent Devotional Audio</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Keep continuous “Radha Radha” chanting playing seamlessly across page changes while you review stats or add entries.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Mobile Responsive</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Chant and record on mobile, tablet, or desktop with equal elegance, touch-optimized buttons, and dark mode support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 bg-gradient-to-b from-card to-devotional-indigo/10 border-t border-border/60">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <LotusIcon className="h-10 w-10 text-devotional-gold mx-auto mb-4" />
            <h2 className="font-devanagari text-3xl sm:text-4xl font-bold mb-3">
              आज ही अपनी साधना प्रारंभ करें
            </h2>
            <p className="text-muted-foreground text-base mb-8">
              “Every chant counts, every breath in Radha Naam purifies.” Create your free private account now.
            </p>
            <Link to="/register">
              <Button size="lg" className="h-13 px-8 text-base bg-gradient-to-r from-devotional-indigo to-indigo-600 shadow-xl">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
