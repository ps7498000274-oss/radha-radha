import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Sparkles,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  Hourglass,
  Activity,
  CalendarDays,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { useJapEntries } from "@/hooks/useJapEntries"
import { useTargets } from "@/hooks/useTargets"
import { useAnalytics } from "@/hooks/useAnalytics"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { LotusIcon } from "@/components/layout/Header"
import { MILESTONES, QUICK_ADD_VALUES } from "@/lib/constants"
import {
  formatIndianNumber,
  formatCompactNumber,
  formatPercentage,
  formatDate,
  getTimeGreeting,
} from "@/lib/formatters"
import { calculateMilestoneProgress, calculateEstimatedCompletion } from "@/lib/calculations"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { entries, loading: entriesLoading, addEntry, getEntryByDate } = useJapEntries()
  const { targets, activeTarget, loading: targetsLoading } = useTargets()
  const { toast } = useToast()
  const [quickAddLoading, setQuickAddLoading] = useState<number | null>(null)

  const analytics = useAnalytics(entries, {
    targetCount: activeTarget?.target_count,
    dailyGoal: profile?.daily_goal,
    timezone: profile?.timezone,
  })

  const todayStr = new Date().toISOString().split("T")[0] || ""
  const todayEntry = getEntryByDate(todayStr)
  const todayJapCount = todayEntry ? todayEntry.jap_count : 0

  const greeting = getTimeGreeting()
  const displayName = profile?.display_name || user?.user_metadata?.display_name || "Devotee"

  // Quick Add handler
  const handleQuickAdd = async (amount: number) => {
    setQuickAddLoading(amount)
    try {
      const { error } = await addEntry(todayStr, amount, "Quick Add via Dashboard", false)
      if (error) {
        toast({
          title: "Error adding Jap",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: `+${formatIndianNumber(amount)} Radha Naam Added!`,
          description: `Today's total: ${formatIndianNumber(todayJapCount + amount)}`,
          variant: "default",
        })
      }
    } catch (err: any) {
      toast({
        title: "Failed to record Jap",
        description: err?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setQuickAddLoading(null)
    }
  }

  // Target estimation calculations
  const currentTargetCount = activeTarget?.target_count || MILESTONES[0].count
  const currentTargetTitle = activeTarget?.title || "1 Crore"
  const remainingJap = Math.max(0, currentTargetCount - analytics.allTimeTotalJapCount)
  const progressPercent = Math.min(
    100,
    (analytics.allTimeTotalJapCount / currentTargetCount) * 100
  )

  const activeDayAvg = analytics.avgPerActiveDay
  const calendarDayAvg = analytics.avgPerCalendarDay
  const activeDaysCount = entries.filter((e) => e.jap_count > 0).length

  // Estimation based on 30-day or active-day pace
  const pace = activeDayAvg > 0 ? activeDayAvg : profile?.daily_goal || 10000
  const estCompletion = calculateEstimatedCompletion(remainingJap, pace)

  if (entriesLoading || targetsLoading) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingSkeleton variant="stat" count={4} />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* 1. WELCOME SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-devotional-indigo/20 bg-gradient-to-r from-devotional-navy via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-devotional-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-12 h-48 w-48 rounded-full bg-devotional-indigo/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <LotusIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>{greeting.emoji} {greeting.greeting}</span>
            </div>
            <h1 className="font-devanagari text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              राधे राधे, {displayName} 🙏
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              {formatDate(new Date(), "EEEE, d MMMM yyyy")} • May your chanting bring boundless peace and devotion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/add-jap">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold gap-2 shadow-lg shadow-amber-500/20"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Today's Jap</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID (12 CORE CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-devotional-gold" />
            <span>Sadhana Overview</span>
          </h2>
          <span className="text-xs text-muted-foreground">All metrics update dynamically</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 1. Lifetime Total */}
          <div className="rounded-2xl border border-devotional-gold/30 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Lifetime Total</span>
              <div className="h-8 w-8 rounded-lg bg-devotional-gold/10 flex items-center justify-center text-devotional-gold">
                <LotusIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatIndianNumber(analytics.allTimeTotalJapCount)}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {formatCompactNumber(analytics.allTimeTotalJapCount)} Naam Chanted
            </span>
          </div>

          {/* 2. Today's Jap */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Today's Jap</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatIndianNumber(todayJapCount)}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Daily Goal: {formatIndianNumber(profile?.daily_goal || 10000)}
            </span>
          </div>

          {/* 3. Current Target */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Active Target</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">
              {currentTargetTitle}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {formatIndianNumber(currentTargetCount)}
            </span>
          </div>

          {/* 4. Remaining Jap */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Remaining Jap</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Hourglass className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatIndianNumber(remainingJap)}
            </p>
            <span className="text-[11px] text-muted-foreground">To target completion</span>
          </div>

          {/* 5. Completion Percentage */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Completion</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatPercentage(progressPercent, 1)}
            </p>
            <div className="mt-1">
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </div>

          {/* 6. Current Streak */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Current Streak</span>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {analytics.streakData.current} Days
            </p>
            <span className="text-[11px] text-muted-foreground">
              {analytics.streakData.current > 0 ? "Active streak 🔥" : "Log today to continue"}
            </span>
          </div>

          {/* 7. Best Streak */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Best Streak</span>
              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {analytics.streakData.best} Days
            </p>
            <span className="text-[11px] text-muted-foreground">All-time record</span>
          </div>

          {/* 8. Avg / Active Day */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Avg / Active Day</span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatIndianNumber(activeDayAvg)}
            </p>
            <span className="text-[11px] text-muted-foreground">When you chant</span>
          </div>

          {/* 9. Avg / Calendar Day */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Avg / Calendar Day</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatIndianNumber(calendarDayAvg)}
            </p>
            <span className="text-[11px] text-muted-foreground">Across all days</span>
          </div>

          {/* 10. Estimated Days Remaining */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Days Remaining</span>
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {remainingJap === 0
                ? "Done"
                : estCompletion
                ? `${formatIndianNumber(estCompletion.days)}`
                : "—"}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {remainingJap === 0 ? "Target Achieved!" : "At current daily pace"}
            </span>
          </div>

          {/* 11. Estimated Target Completion Date */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Est. Completion</span>
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
              {remainingJap === 0
                ? "Completed"
                : estCompletion
                ? formatDate(estCompletion.date, "dd MMM yyyy")
                : "Need more data"}
            </p>
            <span className="text-[11px] text-muted-foreground">Projected finish</span>
          </div>

          {/* 12. Total Active Days */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Active Days</span>
              <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-600">
                <Hash className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {activeDaysCount} Days
            </p>
            <span className="text-[11px] text-muted-foreground">Total days with chanting</span>
          </div>
        </div>
      </div>

      {/* 3. QUICK ADD JAP BAR */}
      <div className="rounded-2xl border border-devotional-gold/40 bg-gradient-to-r from-devotional-gold/10 via-background to-devotional-indigo/10 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-devotional-gold" />
              <span>Quick Add Today's Jap</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add directly to today's count ({formatIndianNumber(todayJapCount)} recorded today)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_ADD_VALUES.map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                disabled={quickAddLoading !== null}
                onClick={() => handleQuickAdd(val)}
                className="font-bold hover:border-devotional-gold hover:bg-devotional-gold/10 hover:text-devotional-gold"
              >
                +{formatIndianNumber(val)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. LIFETIME MILESTONES PROGRESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-devotional-gold" />
              <span>Lifetime Milestone Progression</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Progressive lifetime targets (cumulative, never reset)
            </p>
          </div>
          <Link to="/progress">
            <Button variant="ghost" size="sm" className="text-xs text-devotional-indigo dark:text-devotional-lavender">
              View All Milestones →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MILESTONES.map((m) => {
            const prog = calculateMilestoneProgress(analytics.allTimeTotalJapCount, m.count)
            const isCompleted = prog.completed >= m.count

            return (
              <div
                key={m.name}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-foreground">
                      {m.name}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-devotional-indigo dark:text-devotional-lavender">
                    {formatPercentage(prog.percentage, 1)}
                  </span>
                </div>

                <Progress value={prog.percentage} className="h-2" />

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>
                    Chanted: <strong>{formatIndianNumber(prog.completed)}</strong>
                  </span>
                  <span>
                    Target: <strong>{formatIndianNumber(m.count)}</strong>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
