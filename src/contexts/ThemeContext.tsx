/**
 * Radha Radha — Naam Jap Tracker
 * ThemeContext — Manages dark, light, and system theme preferences with persistence
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import type { ThemePreference } from '@/lib/types'
import { AuthContext } from './AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface ThemeContextType {
  theme: ThemePreference
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemePreference) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'radha_radha_theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemePreference
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const auth = useContext(AuthContext)
  const user = auth?.user ?? null
  const profile = auth?.profile ?? null

  // Initialize theme from localStorage or fallback
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return defaultTheme
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
    return defaultTheme
  })

  // Track system preference state
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sync with user's saved profile preference if available and not explicitly stored locally
  useEffect(() => {
    if (profile?.preferred_theme) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (!stored && (profile.preferred_theme === 'light' || profile.preferred_theme === 'dark' || profile.preferred_theme === 'system')) {
        setThemeState(profile.preferred_theme)
      }
    }
  }, [profile?.preferred_theme])

  // Listen to system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Compute the resolved active theme ('light' or 'dark')
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemIsDark])

  // Apply dark class to document.documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)

    // Also update meta theme-color for mobile address bars
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#0f172a' : '#4338ca'
      )
    }
  }, [resolvedTheme])

  // Set theme function that updates state, localStorage, and user_settings/profiles
  const setTheme = useCallback(
    (newTheme: ThemePreference) => {
      setThemeState(newTheme)

      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      } catch (err) {
        console.warn('Failed to save theme in localStorage:', err)
      }

      // Sync to Supabase user_settings and profile if authenticated
      if (user?.id && isSupabaseConfigured()) {
        const timestamp = new Date().toISOString()

        supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            preferred_theme: newTheme,
            updated_at: timestamp,
          })
          .then(({ error }) => {
            if (error) console.warn('Failed to sync theme to user_settings:', error.message)
          })

        supabase
          .from('profiles')
          .update({
            preferred_theme: newTheme,
            updated_at: timestamp,
          })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) console.warn('Failed to sync theme to profile:', error.message)
          })
      }
    },
    [user?.id]
  )

  // Convenience helper to toggle between light and dark
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }, [resolvedTheme, setTheme])

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to consume the ThemeContext.
 * Throws an error if used outside a ThemeProvider.
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
