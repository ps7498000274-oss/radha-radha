/**
 * Radha Radha — Naam Jap Tracker
 * Core TypeScript definitions and database schemas
 */

export type ThemePreference = 'light' | 'dark' | 'system'
export type TargetType = 'milestone' | 'custom'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

// ==========================================
// Database Models (Supabase)
// ==========================================

/**
 * User Profile record
 */
export interface Profile {
  id: string
  display_name: string | null
  avatar_url?: string | null
  timezone: string
  preferred_theme: ThemePreference
  daily_goal: number
  created_at: string
  updated_at: string
}

/**
 * Single day Jap entry recorded by user
 */
export interface DailyJapEntry {
  id: string
  user_id: string
  entry_date: string // YYYY-MM-DD
  jap_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Spiritual targets or milestones chosen/created by user
 */
export interface UserTarget {
  id: string
  user_id: string
  title: string
  target_count: number
  target_type: TargetType
  is_active: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Application & audio preferences for the user
 */
export interface UserSettings {
  user_id: string
  audio_enabled: boolean
  audio_volume: number // 0 to 1
  audio_repeat: boolean
  daily_reminder_time: string | null // e.g. "06:00"
  preferred_theme: ThemePreference
  created_at: string
  updated_at: string
}

// ==========================================
// Business Logic & Analytics Types
// ==========================================

/**
 * Summary statistics for user dashboard
 */
export interface Stats {
  totalJapCount: number
  todayJapCount: number
  currentTarget: UserTarget | null
  remainingJap: number
  completionPercentage: number
  currentStreak: number
  bestStreak: number
  avgPerActiveDay: number
  avgPerCalendarDay: number
  estimatedDaysRemaining: number | null
  estimatedCompletionDate: Date | null
  totalActiveDays: number
}

/**
 * Spiritual milestone definition and progress
 */
export interface Milestone {
  name: string
  targetCount: number
  completed: boolean
  remaining: number
  percentage: number
  estimatedDays: number | null
  estimatedDate: Date | null
}

/**
 * Aggregated stats for an individual day
 */
export interface DailyStats {
  date: string // YYYY-MM-DD
  count: number
  dayOfWeek: string // e.g., 'Mon', 'Tue'
  notes?: string | null
}

/**
 * Weekly analytics aggregation
 */
export interface WeeklyStats {
  weekLabel: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  totalCount: number
  dailyAverage: number
  daysActive: number
  daysInWeek: number
  days: DailyStats[]
}

/**
 * Monthly analytics aggregation
 */
export interface MonthlyStats {
  month: string // YYYY-MM
  year: number
  monthLabel: string // e.g. "October 2026"
  totalCount: number
  dailyAverage: number
  daysActive: number
  totalDays: number
  bestDay: {
    date: string
    count: number
  } | null
}

/**
 * Time-based greeting information
 */
export interface TimeGreeting {
  greeting: string
  emoji: string
  timeOfDay: TimeOfDay
}

/**
 * Goal forecasting projection
 */
export interface ForecastResult {
  label: string
  dailyRate: number
  daysRemaining: number | null
  estimatedDate: Date | null
  description: string
}

/**
 * Streak calculation result
 */
export interface StreakInfo {
  current: number
  best: number
}

/**
 * Date range filter for charts and analytics
 */
export type DateRangeKey = '7d' | '30d' | '90d' | '1y' | 'all'

export interface DateRangeOption {
  key: DateRangeKey
  label: string
  days: number | null
}

/**
 * Heatmap calendar cell data
 */
export interface HeatmapDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

// ==========================================
// Database Schema Types for Supabase Client
// ==========================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> & {
          id: string
          updated_at?: string
        }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      daily_jap_entries: {
        Row: DailyJapEntry
        Insert: Omit<DailyJapEntry, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<DailyJapEntry, 'id' | 'user_id' | 'created_at'>>
      }
      user_targets: {
        Row: UserTarget
        Insert: Omit<UserTarget, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<UserTarget, 'id' | 'user_id' | 'created_at'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      theme_preference: ThemePreference
      target_type: TargetType
    }
  }
}
