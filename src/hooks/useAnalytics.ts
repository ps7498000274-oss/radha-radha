/**
 * Radha Radha — Naam Jap Tracker
 * useAnalytics — Custom hook computing spiritual stats, streaks, trends, heatmaps, and forecasts
 */

import { useMemo } from 'react'
import { subDays } from 'date-fns'
import type {
  DailyJapEntry,
  DateRangeKey,
  WeeklyStats,
  MonthlyStats,
  StreakInfo,
  ForecastResult,
} from '@/lib/types'
import {
  calculateTotalJap,
  calculateStreak,
  calculateAveragePerActiveDay,
  calculateAveragePerCalendarDay,
  calculateMilestoneProgress,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateHeatmapData,
  getMostProductiveDay,
  getMostProductiveWeekday,
  calculateGoalForecasts,
} from '@/lib/calculations'
import { CRORE } from '@/lib/constants'

export interface UseAnalyticsOptions {
  dateRange?: DateRangeKey
  targetCount?: number
  dailyGoal?: number
  timezone?: string
}

export interface UseAnalyticsReturn {
  // Filtered & computed entries
  filteredEntries: readonly DailyJapEntry[]
  totalJapCount: number
  allTimeTotalJapCount: number

  // Core stats
  weeklyStats: WeeklyStats
  monthlyStats: MonthlyStats
  streakData: StreakInfo
  heatmapData: Map<string, number>
  forecasts: ForecastResult[]

  // Productivity
  mostProductiveDay: { date: string; count: number } | null
  mostProductiveWeekday: { day: string; avgCount: number } | null
  avgPerActiveDay: number
  avgPerCalendarDay: number

  // Target progress
  milestoneProgress: {
    completed: number
    remaining: number
    percentage: number
  }
}

/**
 * Computes memoized sadhana statistics and projections from DailyJapEntry array
 */
export function useAnalytics(
  entries: readonly DailyJapEntry[] = [],
  filterOrOptions?: DateRangeKey | UseAnalyticsOptions
): UseAnalyticsReturn {
  // Normalize options
  const options: UseAnalyticsOptions = useMemo(() => {
    if (!filterOrOptions) return {}
    if (typeof filterOrOptions === 'string') {
      return { dateRange: filterOrOptions }
    }
    return filterOrOptions
  }, [filterOrOptions])

  const dateRange = options.dateRange ?? 'all'
  const targetCount = options.targetCount ?? CRORE // Default 1 Crore
  const dailyGoal = options.dailyGoal
  const timezone = options.timezone

  /**
   * Filter entries according to dateRange ('7d', '30d', '90d', '1y', 'all')
   */
  const filteredEntries = useMemo(() => {
    if (!entries || entries.length === 0) return []
    if (!dateRange || dateRange === 'all') return entries

    const today = new Date()
    let days: number | null = null

    switch (dateRange) {
      case '7d':
        days = 7
        break
      case '30d':
        days = 30
        break
      case '90d':
        days = 90
        break
      case '1y':
        days = 365
        break
      default:
        days = null
    }

    if (!days) return entries

    const cutoff = subDays(today, days)
    const cutoffStr = cutoff.toISOString().split('T')[0]!

    return entries.filter((e) => {
      const entryDateStr = e.entry_date.split('T')[0]!
      return entryDateStr >= cutoffStr
    })
  }, [entries, dateRange])

  // Total Jap for filtered interval
  const totalJapCount = useMemo(
    () => calculateTotalJap(filteredEntries),
    [filteredEntries]
  )

  // All-time total Jap
  const allTimeTotalJapCount = useMemo(
    () => calculateTotalJap(entries),
    [entries]
  )

  // Current and best streak (evaluated across complete history)
  const streakData = useMemo<StreakInfo>(
    () => calculateStreak(entries, timezone),
    [entries, timezone]
  )

  // Current week breakdown
  const weeklyStats = useMemo<WeeklyStats>(
    () => calculateWeeklyStats(entries),
    [entries]
  )

  // Current month breakdown
  const monthlyStats = useMemo<MonthlyStats>(
    () => calculateMonthlyStats(entries),
    [entries]
  )

  // Heatmap dictionary of { date -> count }
  const heatmapData = useMemo<Map<string, number>>(
    () => calculateHeatmapData(entries),
    [entries]
  )

  // Most productive single day within active date range
  const mostProductiveDay = useMemo(
    () => getMostProductiveDay(filteredEntries),
    [filteredEntries]
  )

  // Most productive weekday within active date range
  const mostProductiveWeekday = useMemo(
    () => getMostProductiveWeekday(filteredEntries),
    [filteredEntries]
  )

  // Average per active sadhana day
  const avgPerActiveDay = useMemo(
    () => calculateAveragePerActiveDay(filteredEntries),
    [filteredEntries]
  )

  // Average per calendar day
  const avgPerCalendarDay = useMemo(
    () => calculateAveragePerCalendarDay(filteredEntries, timezone),
    [filteredEntries, timezone]
  )

  // Milestone completion & remaining progress
  const milestoneProgress = useMemo(
    () => calculateMilestoneProgress(allTimeTotalJapCount, targetCount),
    [allTimeTotalJapCount, targetCount]
  )

  // Future milestone completion projections
  const forecasts = useMemo<ForecastResult[]>(
    () =>
      calculateGoalForecasts(
        milestoneProgress.remaining,
        entries,
        dailyGoal
      ),
    [milestoneProgress.remaining, entries, dailyGoal]
  )

  return {
    filteredEntries,
    totalJapCount,
    allTimeTotalJapCount,
    weeklyStats,
    monthlyStats,
    streakData,
    heatmapData,
    forecasts,
    mostProductiveDay,
    mostProductiveWeekday,
    avgPerActiveDay,
    avgPerCalendarDay,
    milestoneProgress,
  }
}
