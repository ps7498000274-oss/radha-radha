/**
 * Radha Radha — Naam Jap Tracker
 * Formatting utilities for Indian numbers, dates, durations, and greetings
 */

import {
  format,
  parseISO,
  isValid,
  isToday,
  isYesterday,
  differenceInCalendarDays,
} from 'date-fns'
import { TIME_GREETINGS, MALA_SIZE } from './constants'
import type { TimeGreeting, TimeOfDay } from './types'

/**
 * Safely normalizes an input date to a Date object.
 * Avoids UTC date-shifting on 'YYYY-MM-DD' strings.
 */
function toDate(input: Date | string | null | undefined): Date | null {
  if (!input) return null
  if (input instanceof Date) {
    return isValid(input) ? input : null
  }

  // Handle standard date string (YYYY-MM-DD)
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-')
      const year = Number(parts[0])
      const month = Number(parts[1]) - 1
      const day = Number(parts[2])
      const d = new Date(year, month, day)
      return isValid(d) ? d : null
    }

    try {
      const parsed = parseISO(trimmed)
      return isValid(parsed) ? parsed : null
    } catch {
      const d = new Date(trimmed)
      return isValid(d) ? d : null
    }
  }

  return null
}

/**
 * Format number according to the Indian numbering system
 * (e.g., 1,00,00,000 for 1 crore; 1,00,000 for 1 lakh; 10,000 for 10 thousand)
 */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
    return '0'
  }

  // Use Intl.NumberFormat with Indian locale
  try {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    // Fallback if Intl fails
    const parts = num.toString().split('.')
    const integerPart = parts[0] ?? '0'
    const decimalPart = parts[1] ? `.${parts[1]}` : ''

    const isNegative = integerPart.startsWith('-')
    const cleanInteger = isNegative ? integerPart.slice(1) : integerPart

    if (cleanInteger.length <= 3) {
      return (isNegative ? '-' : '') + cleanInteger + decimalPart
    }

    const lastThree = cleanInteger.slice(-3)
    const otherNumbers = cleanInteger.slice(0, -3)
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',')

    return (isNegative ? '-' : '') + formattedOthers + ',' + lastThree + decimalPart
  }
}

/**
 * Format numbers compactly using Indian units:
 * - >= 1 Crore (10,000,000): '1 Cr', '3 Cr', '12 Cr', '1.5 Cr'
 * - >= 1 Lakh (100,000): '1L', '2.5L', '50L'
 * - >= 1 Thousand (1,000): '10K', '1K'
 * - < 1,000: '108', '500'
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
    return '0'
  }

  const sign = num < 0 ? '-' : ''
  const abs = Math.abs(num)

  // 1 Crore = 10,000,000
  if (abs >= 10_000_000) {
    const val = abs / 10_000_000
    const formatted = val >= 100 ? Math.round(val).toString() : val.toFixed(val >= 10 ? 1 : 2)
    return `${sign}${formatted.replace(/\.?0+$/, '')} Cr`
  }

  // 1 Lakh = 100,000
  if (abs >= 100_000) {
    const val = abs / 100_000
    const formatted = val >= 100 ? Math.round(val).toString() : val.toFixed(val >= 10 ? 1 : 2)
    return `${sign}${formatted.replace(/\.?0+$/, '')}L`
  }

  // 1 Thousand = 1,000
  if (abs >= 1_000) {
    const val = abs / 1_000
    const formatted = val >= 100 ? Math.round(val).toString() : val.toFixed(val >= 10 ? 1 : 1)
    return `${sign}${formatted.replace(/\.?0+$/, '')}K`
  }

  return `${sign}${formatIndianNumber(abs)}`
}

/**
 * Format a percentage value with customizable decimal places
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0%'
  }

  const clampedDecimals = Math.max(0, Math.min(4, decimals))
  return `${value.toFixed(clampedDecimals)}%`
}

/**
 * Format date using date-fns
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = 'dd MMM yyyy'
): string {
  const d = toDate(date)
  if (!d) return '-'

  try {
    return format(d, formatStr)
  } catch {
    return '-'
  }
}

/**
 * Format date relative to current time (e.g. 'Today', 'Yesterday', '3 days ago')
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  const d = toDate(date)
  if (!d) return '-'

  if (isToday(d)) {
    return 'Today'
  }

  if (isYesterday(d)) {
    return 'Yesterday'
  }

  const diffDays = differenceInCalendarDays(new Date(), d)

  if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} days ago`
  }

  if (diffDays === -1) {
    return 'Tomorrow'
  }

  return formatDate(d, 'dd MMM yyyy')
}

/**
 * Determine time-based greeting for the current hour
 */
export function getTimeGreeting(now: Date = new Date()): TimeGreeting {
  const hour = now.getHours()

  let timeOfDay: TimeOfDay = 'morning'
  if (hour >= 4 && hour < 12) {
    timeOfDay = 'morning'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon'
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening'
  } else {
    timeOfDay = 'night'
  }

  return TIME_GREETINGS[timeOfDay]
}

/**
 * Format days into human-friendly duration:
 * e.g., '2 years 3 months', '5 months 12 days', '14 days', '1 day'
 */
export function formatDuration(days: number | null | undefined): string {
  if (days === null || days === undefined || isNaN(days) || !isFinite(days) || days <= 0) {
    return '0 days'
  }

  const roundedDays = Math.round(days)

  if (roundedDays === 1) {
    return '1 day'
  }

  if (roundedDays < 30) {
    return `${roundedDays} days`
  }

  const years = Math.floor(roundedDays / 365)
  const remainingAfterYears = roundedDays % 365
  const months = Math.floor(remainingAfterYears / 30)
  const daysRemainder = remainingAfterYears % 30

  if (years > 0) {
    const yearStr = years === 1 ? '1 year' : `${years} years`
    if (months > 0) {
      const monthStr = months === 1 ? '1 month' : `${months} months`
      return `${yearStr} ${monthStr}`
    }
    return yearStr
  }

  if (months > 0) {
    const monthStr = months === 1 ? '1 month' : `${months} months`
    if (daysRemainder > 0 && months < 3) {
      const dayStr = daysRemainder === 1 ? '1 day' : `${daysRemainder} days`
      return `${monthStr} ${dayStr}`
    }
    return monthStr
  }

  return `${roundedDays} days`
}

/**
 * Format Jap count into traditional Mala units (108 beads per mala)
 * e.g. 108 -> "1 Mala", 250 -> "2 Malas 34 Beads"
 */
export function formatMalas(count: number | null | undefined): string {
  if (count === null || count === undefined || isNaN(count) || count <= 0) {
    return '0 Malas'
  }

  const malas = Math.floor(count / MALA_SIZE)
  const beads = count % MALA_SIZE

  if (malas === 0) {
    return `${beads} ${beads === 1 ? 'Bead' : 'Beads'}`
  }

  const malaStr = malas === 1 ? '1 Mala' : `${formatIndianNumber(malas)} Malas`

  if (beads === 0) {
    return malaStr
  }

  return `${malaStr} ${beads} ${beads === 1 ? 'Bead' : 'Beads'}`
}

/**
 * Format a 24-hour time string (e.g. "06:00" or "18:30") to 12-hour format ("6:00 AM" or "6:30 PM")
 */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '-'

  const trimmed = timeStr.trim()
  const match = /^(\d{1,2}):(\d{2})/.exec(trimmed)
  if (!match) return trimmed

  const hours = parseInt(match[1] ?? '0', 10)
  const minutes = match[2] ?? '00'

  if (isNaN(hours)) return trimmed

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 === 0 ? 12 : hours % 12

  return `${displayHour}:${minutes} ${period}`
}

/**
 * Sanitizes a cell value for safe CSV export to prevent Formula Injection (CWE-1236).
 * Prepends a single quote if string starts with formula trigger characters (=, +, -, @, \t, \r, %).
 * Properly escapes double quotes.
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '""'
  }
  const str = String(val)
  // Check if string begins with dangerous spreadsheet formula injection characters
  if (/^[\s]*[=+\-@\t\r%]/.test(str)) {
    // Prepend single quote to neutralize execution in Excel/Sheets
    return `"'${str.replace(/"/g, '""')}"`
  }
  return `"${str.replace(/"/g, '""')}"`
}
