/**
 * Radha Radha — Naam Jap Tracker
 * Global application constants, milestones, and configuration
 */

import type { DateRangeOption, TimeGreeting } from './types'

export const APP_NAME = 'Radha Radha'
export const APP_HINDI_NAME = 'राधा राधा'
export const APP_TAGLINE = 'Daily Naam Jap & Sadhana Tracker'
export const APP_SUBTITLE = 'Har Naam, Ek Kadam Apne Lakshya Ki Or'
export const APP_DESCRIPTION =
  'Track your daily Radha Naam Jap, build unbroken streaks, and attain divine milestones with devotion and discipline.'

/**
 * Standard bead count per Jap Mala
 */
export const MALA_SIZE = 108

/**
 * Indian numeric units
 */
export const CRORE = 10_000_000
export const LAKH = 100_000
export const THOUSAND = 1_000

/**
 * Spiritual milestones offered in the app
 */
export const MILESTONES = [
  { name: '1 Crore', count: 10_000_000, description: '10 Million Radha Naam Jap' },
  { name: '3 Crore', count: 30_000_000, description: '30 Million Radha Naam Jap' },
  { name: '5 Crore', count: 50_000_000, description: '50 Million Radha Naam Jap' },
  { name: '12 Crore', count: 120_000_000, description: '120 Million Radha Naam Jap (Supreme Devotion)' },
] as const

/**
 * Preset values for quick Jap entry buttons
 */
export const QUICK_ADD_VALUES = [108, 1008, 5000, 10000] as const

/**
 * Safety upper limit for single day Jap count (1 Million)
 */
export const MAX_DAILY_JAP = 1_000_000

/**
 * Minimum valid Jap count for logging
 */
export const MIN_DAILY_JAP = 1

/**
 * Date range options for analytics and charting
 */
export const DATE_RANGES: readonly DateRangeOption[] = [
  { key: '7d', label: 'Last 7 Days', days: 7 },
  { key: '30d', label: 'Last 30 Days', days: 30 },
  { key: '90d', label: 'Last 90 Days', days: 90 },
  { key: '1y', label: 'Last 1 Year', days: 365 },
  { key: 'all', label: 'All Time', days: null },
] as const

/**
 * Contextual greeting messages categorized by time of day
 */
export const GREETING_MESSAGES: Record<
  'morning' | 'afternoon' | 'evening' | 'night',
  readonly string[]
> = {
  morning: [
    'Shubhodaya! May your day be blessed with Radha Naam.',
    'Start your sacred morning with holy remembrance.',
    'Early morning sadhana fills the soul with divine nectar.',
    'Radha Radha! Wake up to the divine vibration.',
  ],
  afternoon: [
    'Radha Radha! Keep the divine flow alive through your day.',
    'Take a mindful pause to remember the Holy Name.',
    'May Radha Naam bring peace amidst your daily work.',
  ],
  evening: [
    'Shubh Sandhya! Time for peaceful evening sadhana.',
    'Immerse your heart in the calming rhythm of Radha Naam.',
    'As the day settles, let the mind rest in Vrindavan.',
  ],
  night: [
    'Radha Radha! End your day immersed in supreme peace.',
    'May your rest be protected by the holy vibration of Radha.',
    'Conclude your day with gratitude and devotion.',
  ],
} as const

/**
 * Default fallback greetings with emojis
 */
export const TIME_GREETINGS: Record<'morning' | 'afternoon' | 'evening' | 'night', TimeGreeting> = {
  morning: {
    greeting: 'Radha Radha! Good Morning',
    emoji: '🌅',
    timeOfDay: 'morning',
  },
  afternoon: {
    greeting: 'Radha Radha! Good Afternoon',
    emoji: '☀️',
    timeOfDay: 'afternoon',
  },
  evening: {
    greeting: 'Radha Radha! Good Evening',
    emoji: '🌇',
    timeOfDay: 'evening',
  },
  night: {
    greeting: 'Radha Radha! Peace & Serenity',
    emoji: '🌙',
    timeOfDay: 'night',
  },
}

/**
 * Sidebar and bottom navigation items
 */
export interface NavItem {
  title: string
  href: string
  iconName: string
  description?: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
    description: 'Overview of your sadhana progress and streak',
  },
  {
    title: 'Daily Log',
    href: '/log',
    iconName: 'CalendarDays',
    description: 'Record and manage daily Jap entries',
  },
  {
    title: 'Jap Counter',
    href: '/counter',
    iconName: 'Disc',
    description: 'Interactive counter with audio accompaniment',
  },
  {
    title: 'Milestones',
    href: '/milestones',
    iconName: 'Trophy',
    description: 'Track long-term Crore goals and targets',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    iconName: 'BarChart3',
    description: 'Deep dive into trends, streaks, and forecasts',
  },
  {
    title: 'Settings',
    href: '/settings',
    iconName: 'Settings',
    description: 'Manage audio, reminders, and profile preferences',
  },
] as const

/**
 * Default user profile settings
 */
export const DEFAULT_PROFILE = {
  display_name: '',
  timezone: 'Asia/Kolkata',
  preferred_theme: 'system' as const,
  daily_goal: 1008,
}

/**
 * Default user application & audio preferences
 */
export const DEFAULT_SETTINGS = {
  audio_enabled: true,
  audio_volume: 0.8,
  audio_repeat: true,
  daily_reminder_time: '06:00',
  preferred_theme: 'system' as const,
}

/**
 * Common Indian and global timezones for user selection
 */
export const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST - Asia/Kolkata)' },
  { value: 'Asia/Kathmandu', label: 'Nepal Time (NPT - Asia/Kathmandu)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST - Asia/Dubai)' },
  { value: 'Europe/London', label: 'British Time (GMT/BST - Europe/London)' },
  { value: 'America/New_York', label: 'Eastern Time (ET - America/New_York)' },
  { value: 'America/Chicago', label: 'Central Time (CT - America/Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (MT - America/Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT - America/Los_Angeles)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT - Asia/Singapore)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern (AEST - Australia/Sydney)' },
] as const
