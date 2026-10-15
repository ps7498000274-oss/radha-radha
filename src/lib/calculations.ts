/**
 * Radha Radha — Naam Jap Tracker
 * Core business logic, calculations, statistics, streak algorithms, and forecasting
 */

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInCalendarDays,
  addDays,
  subDays,
  format,
  parseISO,
  isValid,
  getDay,
} from 'date-fns'
import type {
  DailyJapEntry,
  WeeklyStats,
  MonthlyStats,
  DailyStats,
  ForecastResult,
  StreakInfo,
} from './types'

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Safely parses a date string in YYYY-MM-DD format without UTC shifts
 */
function parseLocalDate(dateStr: string): Date {
  const cleanStr = dateStr.split('T')[0] ?? dateStr
  const parts = cleanStr.split('-')
  const year = Number(parts[0])
  const month = Number(parts[1]) - 1
  const day = Number(parts[2])

  if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
    return new Date(year, month, day)
  }

  try {
    const parsed = parseISO(dateStr)
    if (isValid(parsed)) return parsed
  } catch {
    // ignore
  }

  return new Date(dateStr)
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
function toDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get current date string in specific timezone (defaults to local)
 */
function getTodayString(timezone?: string): string {
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      return formatter.format(new Date())
    } catch {
      // Fallback if timezone string is invalid
    }
  }
  return toDateString(new Date())
}

/**
 * Aggregate multiple daily entries by date (YYYY-MM-DD)
 */
export function aggregateEntriesByDate(
  entries: readonly DailyJapEntry[]
): Map<string, { count: number; notes: string | null; id: string }> {
  const map = new Map<string, { count: number; notes: string | null; id: string }>()

  if (!entries || !Array.isArray(entries)) {
    return map
  }

  for (const entry of entries) {
    if (!entry || !entry.entry_date) continue

    const dateKey = entry.entry_date.split('T')[0] ?? entry.entry_date
    const rawCount = Number(entry.jap_count)
    const validCount = !isNaN(rawCount) && isFinite(rawCount) ? Math.max(0, rawCount) : 0

    const existing = map.get(dateKey)
    if (existing) {
      existing.count += validCount
      if (entry.notes) {
        existing.notes = existing.notes ? `${existing.notes}; ${entry.notes}` : entry.notes
      }
    } else {
      map.set(dateKey, {
        count: validCount,
        notes: entry.notes ?? null,
        id: entry.id ?? dateKey,
      })
    }
  }

  return map
}

/**
 * Calculate the total Jap count across all entries
 */
export function calculateTotalJap(entries: readonly DailyJapEntry[]): number {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return 0
  }

  return entries.reduce((total, entry) => {
    const count = Number(entry.jap_count)
    if (isNaN(count) || !isFinite(count) || count <= 0) return total
    return total + count
  }, 0)
}

/**
 * Calculate current and best streak.
 *
 * Rules:
 * - A streak requires consecutive calendar days with jap_count > 0.
 * - Current streak is active if user chanted today OR yesterday.
 *   If user hasn't chanted today yet, the streak is maintained from yesterday.
 *   If user missed yesterday, current streak is 0.
 * - Best streak is the longest consecutive run in history.
 */
export function calculateStreak(
  entries: readonly DailyJapEntry[],
  timezone?: string
): StreakInfo {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return { current: 0, best: 0 }
  }

  const aggregated = aggregateEntriesByDate(entries)

  // Collect and sort unique dates with count > 0 in ascending order
  const activeDates: string[] = []
  for (const [dateStr, data] of aggregated.entries()) {
    if (data.count > 0) {
      activeDates.push(dateStr)
    }
  }

  if (activeDates.length === 0) {
    return { current: 0, best: 0 }
  }

  // Lexicographical sort works for YYYY-MM-DD
  activeDates.sort()

  // 1. Calculate best streak across entire history
  let best = 1
  let currentRun = 1

  for (let i = 1; i < activeDates.length; i++) {
    const prevDate = parseLocalDate(activeDates[i - 1]!)
    const currDate = parseLocalDate(activeDates[i]!)
    const diff = differenceInCalendarDays(currDate, prevDate)

    if (diff === 1) {
      currentRun += 1
      if (currentRun > best) {
        best = currentRun
      }
    } else if (diff > 1) {
      currentRun = 1
    }
    // if diff === 0 (same day), ignore
  }

  if (currentRun > best) {
    best = currentRun
  }

  // 2. Calculate current streak
  const todayStr = getTodayString(timezone)
  const todayDate = parseLocalDate(todayStr)
  const yesterdayDate = subDays(todayDate, 1)
  const yesterdayStr = toDateString(yesterdayDate)

  const lastActiveDateStr = activeDates[activeDates.length - 1]!
  const lastActiveDate = parseLocalDate(lastActiveDateStr)

  const diffFromToday = differenceInCalendarDays(todayDate, lastActiveDate)

  // If the last active day was neither today (0) nor yesterday (1), streak is broken
  if (diffFromToday > 1) {
    return { current: 0, best }
  }

  // Count backwards from the last active date to see how many consecutive days it continues
  let current = 1
  for (let i = activeDates.length - 1; i > 0; i--) {
    const curr = parseLocalDate(activeDates[i]!)
    const prev = parseLocalDate(activeDates[i - 1]!)
    const diff = differenceInCalendarDays(curr, prev)

    if (diff === 1) {
      current += 1
    } else {
      break
    }
  }

  return {
    current,
    best: Math.max(best, current),
  }
}

/**
 * Calculate average Jap count per active day (days where jap_count > 0)
 */
export function calculateAveragePerActiveDay(entries: readonly DailyJapEntry[]): number {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return 0
  }

  const aggregated = aggregateEntriesByDate(entries)
  let totalJap = 0
  let activeDays = 0

  for (const data of aggregated.values()) {
    if (data.count > 0) {
      totalJap += data.count
      activeDays += 1
    }
  }

  if (activeDays === 0) return 0
  return Math.round(totalJap / activeDays)
}

/**
 * Calculate average Jap count per calendar day since the first active entry
 */
export function calculateAveragePerCalendarDay(
  entries: readonly DailyJapEntry[],
  timezone?: string
): number {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return 0
  }

  const aggregated = aggregateEntriesByDate(entries)
  let totalJap = 0
  let earliestDate: Date | null = null

  for (const [dateStr, data] of aggregated.entries()) {
    if (data.count > 0) {
      totalJap += data.count
      const d = parseLocalDate(dateStr)
      if (!earliestDate || d < earliestDate) {
        earliestDate = d
      }
    }
  }

  if (!earliestDate || totalJap === 0) {
    return 0
  }

  const todayStr = getTodayString(timezone)
  const today = parseLocalDate(todayStr)

  const totalCalendarDays = Math.max(1, differenceInCalendarDays(today, earliestDate) + 1)
  return Math.round(totalJap / totalCalendarDays)
}

/**
 * Calculate progress against a target or milestone
 */
export function calculateMilestoneProgress(
  totalJap: number,
  milestoneTarget: number
): { completed: number; remaining: number; percentage: number } {
  if (milestoneTarget <= 0) {
    return {
      completed: Math.max(0, totalJap),
      remaining: 0,
      percentage: 100,
    }
  }

  const safeTotal = Math.max(0, totalJap)
  const completed = Math.min(safeTotal, milestoneTarget)
  const remaining = Math.max(0, milestoneTarget - safeTotal)
  const rawPercentage = (safeTotal / milestoneTarget) * 100
  const percentage = Math.min(100, Math.round(rawPercentage * 100) / 100)

  return { completed, remaining, percentage }
}

/**
 * Calculate estimated days and completion date based on daily average
 */
export function calculateEstimatedCompletion(
  remaining: number,
  dailyAverage: number
): { days: number; date: Date } | null {
  if (remaining <= 0) {
    return { days: 0, date: new Date() }
  }

  if (dailyAverage <= 0 || !isFinite(dailyAverage)) {
    return null
  }

  const days = Math.ceil(remaining / dailyAverage)
  const date = addDays(new Date(), days)

  return { days, date }
}

/**
 * Calculate weekly stats for a specified week (defaults to current week starting Monday)
 */
export function calculateWeeklyStats(
  entries: readonly DailyJapEntry[],
  weekStart?: Date
): WeeklyStats {
  const refDate = weekStart ?? new Date()
  const start = startOfWeek(refDate, { weekStartsOn: 1 })
  const end = endOfWeek(refDate, { weekStartsOn: 1 })

  const aggregated = aggregateEntriesByDate(entries)
  const intervalDays = eachDayOfInterval({ start, end })

  const days: DailyStats[] = []
  let totalCount = 0
  let daysActive = 0

  for (const day of intervalDays) {
    const dateStr = toDateString(day)
    const data = aggregated.get(dateStr)
    const count = data?.count ?? 0

    if (count > 0) {
      daysActive += 1
      totalCount += count
    }

    days.push({
      date: dateStr,
      count,
      dayOfWeek: format(day, 'EEE'),
      notes: data?.notes ?? null,
    })
  }

  const startDate = toDateString(start)
  const endDate = toDateString(end)
  const weekLabel = `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`
  const dailyAverage = Math.round(totalCount / 7)

  return {
    weekLabel,
    startDate,
    endDate,
    totalCount,
    dailyAverage,
    daysActive,
    daysInWeek: 7,
    days,
  }
}

/**
 * Calculate monthly stats for a specified month (defaults to current month)
 */
export function calculateMonthlyStats(
  entries: readonly DailyJapEntry[],
  month?: Date
): MonthlyStats {
  const refDate = month ?? new Date()
  const start = startOfMonth(refDate)
  const end = endOfMonth(refDate)

  const aggregated = aggregateEntriesByDate(entries)
  const intervalDays = eachDayOfInterval({ start, end })

  let totalCount = 0
  let daysActive = 0
  let bestDay: { date: string; count: number } | null = null

  for (const day of intervalDays) {
    const dateStr = toDateString(day)
    const count = aggregated.get(dateStr)?.count ?? 0

    if (count > 0) {
      daysActive += 1
      totalCount += count

      if (!bestDay || count > bestDay.count) {
        bestDay = { date: dateStr, count }
      }
    }
  }

  const totalDays = intervalDays.length
  const dailyAverage = totalDays > 0 ? Math.round(totalCount / totalDays) : 0

  return {
    month: format(start, 'yyyy-MM'),
    year: start.getFullYear(),
    monthLabel: format(start, 'MMMM yyyy'),
    totalCount,
    dailyAverage,
    daysActive,
    totalDays,
    bestDay,
  }
}

/**
 * Calculate heatmap data map of (date string -> total count)
 */
export function calculateHeatmapData(
  entries: readonly DailyJapEntry[]
): Map<string, number> {
  const heatmap = new Map<string, number>()
  const aggregated = aggregateEntriesByDate(entries)

  for (const [dateStr, data] of aggregated.entries()) {
    heatmap.set(dateStr, data.count)
  }

  return heatmap
}

/**
 * Find the single most productive day recorded in history
 */
export function getMostProductiveDay(
  entries: readonly DailyJapEntry[]
): { date: string; count: number } | null {
  if (!entries || entries.length === 0) return null

  const aggregated = aggregateEntriesByDate(entries)
  let best: { date: string; count: number } | null = null

  for (const [date, data] of aggregated.entries()) {
    if (data.count > 0 && (!best || data.count > best.count)) {
      best = { date, count: data.count }
    }
  }

  return best
}

/**
 * Find the day of the week (e.g. Monday, Sunday) with the highest average Jap count
 */
export function getMostProductiveWeekday(
  entries: readonly DailyJapEntry[]
): { day: string; avgCount: number } | null {
  if (!entries || entries.length === 0) return null

  const aggregated = aggregateEntriesByDate(entries)
  const totalsByDay = new Array(7).fill(0)
  const occurrencesByDay = new Array(7).fill(0)

  let hasData = false

  for (const [dateStr, data] of aggregated.entries()) {
    if (data.count > 0) {
      hasData = true
      const date = parseLocalDate(dateStr)
      const dayIndex = getDay(date) // 0 = Sunday, 6 = Saturday

      totalsByDay[dayIndex] = (totalsByDay[dayIndex] ?? 0) + data.count
      occurrencesByDay[dayIndex] = (occurrencesByDay[dayIndex] ?? 0) + 1
    }
  }

  if (!hasData) return null

  let bestDayIndex = 0
  let bestAverage = 0

  for (let i = 0; i < 7; i++) {
    const occurrences = occurrencesByDay[i] ?? 0
    if (occurrences > 0) {
      const avg = (totalsByDay[i] ?? 0) / occurrences
      if (avg > bestAverage) {
        bestAverage = avg
        bestDayIndex = i
      }
    }
  }

  return {
    day: WEEKDAY_NAMES[bestDayIndex] ?? 'Sunday',
    avgCount: Math.round(bestAverage),
  }
}

/**
 * Calculate multi-scenario goal forecasts based on different sadhana paces
 */
export function calculateGoalForecasts(
  remaining: number,
  entries: readonly DailyJapEntry[],
  customDailyTarget?: number
): ForecastResult[] {
  const forecasts: ForecastResult[] = []

  if (remaining <= 0) {
    forecasts.push({
      label: 'Target Completed',
      dailyRate: 0,
      daysRemaining: 0,
      estimatedDate: new Date(),
      description: 'You have attained your spiritual milestone! Radha Radha!',
    })
    return forecasts
  }

  const aggregated = aggregateEntriesByDate(entries)
  const today = new Date()

  // 1. Last 7 Days Average
  let last7Total = 0
  for (let i = 0; i < 7; i++) {
    const dStr = toDateString(subDays(today, i))
    last7Total += aggregated.get(dStr)?.count ?? 0
  }
  const last7DailyAvg = Math.round(last7Total / 7)

  if (last7DailyAvg > 0) {
    const est = calculateEstimatedCompletion(remaining, last7DailyAvg)
    forecasts.push({
      label: 'Recent 7-Day Pace',
      dailyRate: last7DailyAvg,
      daysRemaining: est?.days ?? null,
      estimatedDate: est?.date ?? null,
      description: `Based on your recent weekly pace of ${last7DailyAvg.toLocaleString('en-IN')} Jap/day`,
    })
  }

  // 2. Last 30 Days Average
  let last30Total = 0
  for (let i = 0; i < 30; i++) {
    const dStr = toDateString(subDays(today, i))
    last30Total += aggregated.get(dStr)?.count ?? 0
  }
  const last30DailyAvg = Math.round(last30Total / 30)

  if (last30DailyAvg > 0 && last30DailyAvg !== last7DailyAvg) {
    const est = calculateEstimatedCompletion(remaining, last30DailyAvg)
    forecasts.push({
      label: 'Monthly 30-Day Pace',
      dailyRate: last30DailyAvg,
      daysRemaining: est?.days ?? null,
      estimatedDate: est?.date ?? null,
      description: `Based on your last 30-day pace of ${last30DailyAvg.toLocaleString('en-IN')} Jap/day`,
    })
  }

  // 3. All-time Active Day Average
  const allTimeActiveAvg = calculateAveragePerActiveDay(entries)
  if (
    allTimeActiveAvg > 0 &&
    allTimeActiveAvg !== last7DailyAvg &&
    allTimeActiveAvg !== last30DailyAvg
  ) {
    const est = calculateEstimatedCompletion(remaining, allTimeActiveAvg)
    forecasts.push({
      label: 'All-Time Active Pace',
      dailyRate: allTimeActiveAvg,
      daysRemaining: est?.days ?? null,
      estimatedDate: est?.date ?? null,
      description: `Based on your overall historical average of ${allTimeActiveAvg.toLocaleString('en-IN')} Jap per active day`,
    })
  }

  // 4. Custom User Daily Goal
  if (customDailyTarget && customDailyTarget > 0) {
    const est = calculateEstimatedCompletion(remaining, customDailyTarget)
    forecasts.push({
      label: 'Your Daily Goal',
      dailyRate: customDailyTarget,
      daysRemaining: est?.days ?? null,
      estimatedDate: est?.date ?? null,
      description: `Targeting your set daily goal of ${customDailyTarget.toLocaleString('en-IN')} Jap/day`,
    })
  }

  // 5. Standard Sadhana Benchmarks
  const sadhanaBenchmarks = [
    {
      label: '16 Malas Daily (1,728 Jap)',
      rate: 16 * 108,
      description: 'Recommended daily minimum sadhana (16 rounds of 108 beads)',
    },
    {
      label: '64 Malas Daily (6,912 Jap)',
      rate: 64 * 108,
      description: 'Traditional deep sadhana benchmark (64 rounds of 108 beads)',
    },
    {
      label: '1 Lakh Jap Daily (100,000 Jap)',
      rate: 100_000,
      description: 'Intense determination (approx. 926 Malas daily)',
    },
  ]

  for (const benchmark of sadhanaBenchmarks) {
    const est = calculateEstimatedCompletion(remaining, benchmark.rate)
    forecasts.push({
      label: benchmark.label,
      dailyRate: benchmark.rate,
      daysRemaining: est?.days ?? null,
      estimatedDate: est?.date ?? null,
      description: benchmark.description,
    })
  }

  return forecasts
}
