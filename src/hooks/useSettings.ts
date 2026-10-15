/**
 * Radha Radha — Naam Jap Tracker
 * useSettings — Hook for managing user settings, audio preferences, and reminder configurations
 */

import { useState, useEffect, useCallback } from 'react'
import type { UserSettings } from '@/lib/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DEFAULT_SETTINGS } from '@/lib/constants'

export interface UseSettingsReturn {
  settings: UserSettings | null
  loading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSettings: (
    updates: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>
  ) => Promise<{ data: UserSettings | null; error: Error | null }>
}

export function useSettings(): UseSettingsReturn {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Helper to construct fallback default settings
   */
  const getDefaultSettings = useCallback(
    (userId?: string): UserSettings => ({
      user_id: userId || 'demo-user',
      audio_enabled: DEFAULT_SETTINGS.audio_enabled,
      audio_volume: DEFAULT_SETTINGS.audio_volume,
      audio_repeat: DEFAULT_SETTINGS.audio_repeat,
      daily_reminder_time: DEFAULT_SETTINGS.daily_reminder_time,
      preferred_theme: DEFAULT_SETTINGS.preferred_theme,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    []
  )

  /**
   * Fetch settings from user_settings table
   */
  const fetchSettings = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured() || !user?.id) {
      setSettings(getDefaultSettings(user?.id))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchErr } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchErr) {
        setError(fetchErr.message)
        setSettings(getDefaultSettings(user.id))
      } else if (data) {
        setSettings(data as UserSettings)
      } else {
        // No record exists yet, create default settings record
        const initial = {
          user_id: user.id,
          audio_enabled: DEFAULT_SETTINGS.audio_enabled,
          audio_volume: DEFAULT_SETTINGS.audio_volume,
          audio_repeat: DEFAULT_SETTINGS.audio_repeat,
          daily_reminder_time: DEFAULT_SETTINGS.daily_reminder_time,
          preferred_theme: DEFAULT_SETTINGS.preferred_theme,
        }

        const { data: created, error: insertErr } = await supabase
          .from('user_settings')
          .upsert(initial)
          .select()
          .single()

        if (!insertErr && created) {
          setSettings(created as UserSettings)
        } else {
          setSettings(getDefaultSettings(user.id))
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings')
      setSettings(getDefaultSettings(user?.id))
    } finally {
      setLoading(false)
    }
  }, [user?.id, getDefaultSettings])

  /**
   * Auto-fetch settings on mount
   */
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  /**
   * Update user settings
   */
  const updateSettings = useCallback(
    async (
      updates: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>
    ): Promise<{ data: UserSettings | null; error: Error | null }> => {
      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        const next = {
          ...(settings || getDefaultSettings()),
          ...updates,
          updated_at: new Date().toISOString(),
        }
        setSettings(next)
        return { data: next, error: null }
      }

      try {
        const payload = {
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }

        const { data, error: updateErr } = await supabase
          .from('user_settings')
          .upsert(payload)
          .select()
          .single()

        if (updateErr) {
          setError(updateErr.message)
          return { data: null, error: updateErr }
        }

        const updated = data as UserSettings
        setSettings(updated)
        return { data: updated, error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to update settings')
        return { data: null, error: err }
      }
    },
    [settings, user?.id, getDefaultSettings]
  )

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  }
}
