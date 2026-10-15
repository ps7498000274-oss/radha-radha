/**
 * Radha Radha — Naam Jap Tracker
 * useProfile — Hook for user profile management, daily goals, timezone, and display settings
 */

import { useState, useCallback } from 'react'
import type { Profile } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

export interface UseProfileReturn {
  profile: Profile | null
  loading: boolean
  error: string | null
  updateProfile: (
    updates: Partial<Omit<Profile, 'id' | 'created_at'>>
  ) => Promise<{ error: Error | null }>
  updateTimezone: (timezone: string) => Promise<{ error: Error | null }>
  updateDailyGoal: (dailyGoal: number) => Promise<{ error: Error | null }>
  updateDisplayName: (displayName: string) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const { profile, updateProfile: authUpdateProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Update profile fields, syncing to Supabase profiles table and AuthContext
   */
  const updateProfile = useCallback(
    async (
      updates: Partial<Omit<Profile, 'id' | 'created_at'>>
    ): Promise<{ error: Error | null }> => {
      setLoading(true)
      setError(null)

      try {
        const result = await authUpdateProfile(updates)
        if (result.error) {
          setError(result.error.message)
          return { error: result.error }
        }

        // Refresh profile in background to ensure consistency
        await refreshProfile()
        return { error: null }
      } catch (err: any) {
        const msg = err.message || 'Failed to update profile'
        setError(msg)
        return { error: err }
      } finally {
        setLoading(false)
      }
    },
    [authUpdateProfile, refreshProfile]
  )

  /**
   * Convenience method to update devotee's timezone
   */
  const updateTimezone = useCallback(
    async (timezone: string): Promise<{ error: Error | null }> => {
      return updateProfile({ timezone })
    },
    [updateProfile]
  )

  /**
   * Convenience method to update daily Jap goal
   */
  const updateDailyGoal = useCallback(
    async (dailyGoal: number): Promise<{ error: Error | null }> => {
      const sanitizedGoal = Math.max(1, Math.round(dailyGoal))
      return updateProfile({ daily_goal: sanitizedGoal })
    },
    [updateProfile]
  )

  /**
   * Convenience method to update display name
   */
  const updateDisplayName = useCallback(
    async (displayName: string): Promise<{ error: Error | null }> => {
      const cleanName = displayName.trim()
      return updateProfile({ display_name: cleanName ? cleanName : null })
    },
    [updateProfile]
  )

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateTimezone,
    updateDailyGoal,
    updateDisplayName,
    refreshProfile,
  }
}
