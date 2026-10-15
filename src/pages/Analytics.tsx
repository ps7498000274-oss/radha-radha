import React, { useState, useMemo } from "react"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Flame,
  Award,
  Sparkles,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useJapEntries } from "@/hooks/useJapEntries"
import { useAuth } from "@/contexts/AuthContext"
import { useAnalytics } from "@/hooks/useAnalytics"
import { MILESTONES } from "@/lib/constants"
import {
  formatIndianNumber,
  formatCompactNumber,
  formatPercentage,
  formatDate,
} from "@/lib/formatters"
import { type DateRangeKey } from "@/lib/types"

export default function Analytics() {
  const { entries } = useJapEntries()
  const { profile } = useAuth()
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("30d")
  const [customGoalPace, setCustomGoalPace] = useState<number>(10000)

  const analytics = useAnalytics(entries, {
    dateRange: selectedRange,
    dailyGoal: profile?.daily_goal,
    timezone: profile?.timezone,
  })

  // Format daily entries for trend chart (chronological order)
  const trendData = useMemo(() => {
    return [...analytics.filteredEntries]
      .reverse()
      .map((entry) => ({
        date: formatDate(entry.entry_date, "dd MMM"),
        count: entry.jap_count,
        fullDate: entry.entry_date,
      }))
  }, [analytics.filteredEntries])

  // Weekly breakdown chart data
  const weeklyData = useMemo(() => {
    return (analytics.weeklyStats?.days || []).map((d) => ({
      day: d.dayOfWeek,
      count: d.count,
      fullDate: d.date,
    }))
  }, [analytics.weeklyStats])

  // Heatmap: 52-week calendar grid
  const heatmapGrid = useMemo(() => {
    const days: { dateStr: string; count: number; level: number }[] = []
    const today = new Date()
    const maxVal = Math.max(...Array.from(analytics.heatmapData.values()), 10000)

    for (let i = 364; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split("T")[0] || ""
      const count = analytics.heatmapData.get(dateStr) || 0
      let level = 0
      if (count > 0) {
        const ratio = count / maxVal
        if (ratio > 0.75) level = 4
        else if (ratio > 0.5) level = 3
        else if (ratio > 0.25) level = 2
        else level = 1
      }
      days.push({ dateStr, count, level })
    }
    return days
  }, [analytics.heatmapData])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Sadhana Analytics</span>
        </div>
        <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          साधना विश्लेषण एवं अंतर्दृष्टि
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deep trends, consistency patterns, habit momentum, and milestone projections.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-2xl bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="trends" className="text-xs">Daily Trends</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
          <TabsTrigger value="habits" className="text-xs">Habits & Heatmap</TabsTrigger>
          <TabsTrigger value="forecast" className="text-xs">Forecasting</TabsTrigger>
        </TabsList>

        {/* 1. DAILY TRENDS TAB */}
        <TabsContent value="trends" className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Chanting Trajectory</h3>
                <p className="text-xs text-muted-foreground">
                  Showing daily counts across your chosen time window
                </p>
              </div>

              {/* Range Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/50">
                {(["7d", "30d", "90d", "1y", "all"] as DateRangeKey[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRange(r)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      selectedRange === r
                        ? "bg-devotional-indigo text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {trendData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
                No entries recorded in this range. Add your sadhana logs to see the chart!
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => formatCompactNumber(val)}
                    />
                    <RechartsTooltip
                      formatter={(val: any) => [formatIndianNumber(Number(val)), "Naam Jap"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#indigoGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </TabsContent>

        {/* 2. WEEKLY TAB */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">This Week Total</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {formatIndianNumber(analytics.weeklyStats?.totalCount || 0)}
              </p>
              <span className="text-[11px] text-muted-foreground">
                {analytics.weeklyStats?.daysActive || 0} active chanting days
              </span>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Daily Average</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {formatIndianNumber(analytics.weeklyStats?.dailyAverage || 0)}
              </p>
              <span className="text-[11px] text-muted-foreground">Average per calendar day</span>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Week Window</span>
              <p className="text-lg font-bold text-foreground mt-1">
                {analytics.weeklyStats?.weekLabel || "Current Week"}
              </p>
              <span className="text-[11px] text-muted-foreground">7 Days Tracked</span>
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold">Current Week Daily Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [formatIndianNumber(Number(val)), "Naam Jap"]}
                  />
                  <Bar dataKey="count" fill="#4338ca" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* 3. MONTHLY TAB */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Current Month Total</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {formatIndianNumber(analytics.monthlyStats?.totalCount || 0)}
              </p>
              <span className="text-[11px] text-muted-foreground">
                {analytics.monthlyStats?.monthLabel}
              </span>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Days Active</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {analytics.monthlyStats?.daysActive || 0} / {analytics.monthlyStats?.totalDays || 30}
              </p>
              <span className="text-[11px] text-muted-foreground">Chanting activity</span>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Avg Daily Count</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {formatIndianNumber(analytics.monthlyStats?.dailyAverage || 0)}
              </p>
              <span className="text-[11px] text-muted-foreground">Across the month</span>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Top Single Day</span>
              <p className="text-xl font-bold text-foreground mt-1">
                {analytics.monthlyStats?.bestDay
                  ? formatIndianNumber(analytics.monthlyStats.bestDay.count)
                  : "—"}
              </p>
              <span className="text-[11px] text-muted-foreground">
                {analytics.monthlyStats?.bestDay?.date || "No entries yet"}
              </span>
            </div>
          </div>
        </TabsContent>

        {/* 4. HABITS & HEATMAP TAB */}
        <TabsContent value="habits" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Current Streak</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {analytics.streakData?.current || 0} Days
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Best Streak</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {analytics.streakData?.best || 0} Days
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Most Productive Day</span>
              <p className="text-lg font-bold text-foreground mt-1 truncate">
                {analytics.mostProductiveDay
                  ? `${formatIndianNumber(analytics.mostProductiveDay.count)}`
                  : "—"}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {analytics.mostProductiveDay?.date}
              </span>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Top Weekday</span>
              <p className="text-lg font-bold text-foreground mt-1">
                {analytics.mostProductiveWeekday?.day || "—"}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Avg: {formatIndianNumber(analytics.mostProductiveWeekday?.avgCount || 0)}
              </span>
            </div>
          </div>

          {/* GitHub-style 52-Week Heatmap */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">52-Week Sadhana Consistency Heatmap</h3>
                <p className="text-xs text-muted-foreground">
                  Visual record of chanting density over the past 365 days
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>Less</span>
                <span className="h-3 w-3 rounded-xs bg-muted" />
                <span className="h-3 w-3 rounded-xs bg-indigo-300 dark:bg-indigo-950" />
                <span className="h-3 w-3 rounded-xs bg-indigo-400 dark:bg-indigo-800" />
                <span className="h-3 w-3 rounded-xs bg-indigo-500" />
                <span className="h-3 w-3 rounded-xs bg-indigo-600 shadow-xs" />
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
                {heatmapGrid.map((day) => {
                  const bgClass =
                    day.level === 0
                      ? "bg-muted/40 hover:ring-1 hover:ring-border"
                      : day.level === 1
                      ? "bg-indigo-300 dark:bg-indigo-950"
                      : day.level === 2
                      ? "bg-indigo-400 dark:bg-indigo-800"
                      : day.level === 3
                      ? "bg-indigo-500 dark:bg-indigo-600"
                      : "bg-indigo-600 dark:bg-indigo-400 shadow-xs"

                  return (
                    <div
                      key={day.dateStr}
                      title={`${day.dateStr}: ${formatIndianNumber(day.count)} Radha Naam`}
                      className={`h-3 w-3 rounded-xs cursor-pointer transition-transform hover:scale-125 ${bgClass}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 5. FORECASTING TAB */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Milestone Completion Forecasts</h3>
                <p className="text-xs text-muted-foreground">
                  Projections derived from 7-day, 30-day, overall pace, and custom targets
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="customPace" className="text-xs text-muted-foreground">
                  Custom Daily Target:
                </Label>
                <Input
                  id="customPace"
                  type="number"
                  min="108"
                  value={customGoalPace}
                  onChange={(e) => setCustomGoalPace(Number(e.target.value))}
                  className="w-28 h-8 text-xs font-bold"
                />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-devotional-indigo dark:text-devotional-lavender" />
              <span>
                Note: Forecasts are mathematical pacing estimates based on past consistency. They are not spiritual guarantees.
              </span>
            </div>

            {/* Forecast Cards per Milestone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MILESTONES.map((m) => {
                const rem = Math.max(0, m.count - analytics.allTimeTotalJapCount)
                const isCompleted = rem === 0

                const calcPace = (pace: number) => {
                  if (pace <= 0) return null
                  const days = Math.ceil(rem / pace)
                  const targetDate = new Date()
                  targetDate.setDate(targetDate.getDate() + days)
                  return { days, date: targetDate }
                }

                const pace7 = analytics.weeklyStats?.dailyAverage || 0
                const pace30 = analytics.monthlyStats?.dailyAverage || 0
                const paceAll = analytics.avgPerActiveDay
                const paceCustom = customGoalPace

                const est7 = calcPace(pace7)
                const est30 = calcPace(pace30)
                const estAll = calcPace(paceAll)
                const estCustom = calcPace(paceCustom)

                return (
                  <div
                    key={m.name}
                    className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h4 className="font-serif font-bold text-lg text-foreground">
                          {m.name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          Remaining: {formatIndianNumber(rem)} Naam
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted">
                        Target: {formatIndianNumber(m.count)}
                      </span>
                    </div>

                    {isCompleted ? (
                      <p className="text-emerald-600 font-bold text-sm py-4 text-center">
                        ✅ Milestone Achieved!
                      </p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-border/30">
                          <span className="text-muted-foreground">7-Day Pace ({formatIndianNumber(pace7)}/day):</span>
                          <strong>
                            {est7 ? `${formatIndianNumber(est7.days)} Days (${formatDate(est7.date, "dd MMM yyyy")})` : "Need more data"}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-border/30">
                          <span className="text-muted-foreground">30-Day Pace ({formatIndianNumber(pace30)}/day):</span>
                          <strong>
                            {est30 ? `${formatIndianNumber(est30.days)} Days (${formatDate(est30.date, "dd MMM yyyy")})` : "Need more data"}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-border/30">
                          <span className="text-muted-foreground">Historical Pace ({formatIndianNumber(paceAll)}/day):</span>
                          <strong>
                            {estAll ? `${formatIndianNumber(estAll.days)} Days (${formatDate(estAll.date, "dd MMM yyyy")})` : "Need more data"}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Custom Pace ({formatIndianNumber(paceCustom)}/day):</span>
                          <strong className="text-devotional-indigo dark:text-devotional-lavender">
                            {estCustom ? `${formatIndianNumber(estCustom.days)} Days (${formatDate(estCustom.date, "dd MMM yyyy")})` : "—"}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
