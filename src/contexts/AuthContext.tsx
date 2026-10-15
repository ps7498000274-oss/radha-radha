/**
 * Radha Radha — Naam Jap Tracker
 * AuthContext — Comprehensive authentication, session management, and user profile state
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isConfigured: boolean
}

export interface AuthContextType extends AuthState {
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: Error | null; data?: any }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; data?: any }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isConfigured] = useState<boolean>(() => isSupabaseConfigured())

  /**
   * Fetch profile from the profiles table in Supabase.
   * If profile does not exist, creates a default one.
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      if (!isSupabaseConfigured()) return null

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (error) {
          console.warn('Error fetching profile:', error.message)
          return null
        }

        if (data) {
          const loadedProfile = data as Profile
          setProfile(loadedProfile)
          return loadedProfile
        }

        // Profile record does not exist yet; create fallback profile record
        const defaultProfile: Profile = {
          id: userId,
          display_name: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          preferred_theme: 'system',
          daily_goal: 1008,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .upsert(defaultProfile)
          .select()
          .single()

        if (!insertError && inserted) {
          const insertedProfile = inserted as Profile
          setProfile(insertedProfile)
          return insertedProfile
        }

        setProfile(defaultProfile)
        return defaultProfile
      } catch (err) {
        console.warn('Exception during profile fetch:', err)
        return null
      }
    },
    []
  )

  /**
   * Refreshes the currently authenticated user's profile
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user?.id || !isSupabaseConfigured()) return
    await fetchProfile(user.id)
  }, [user?.id, fetchProfile])

  /**
   * Sign up with email, password, and optional display name
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<{ error: Error | null; data?: any }> => {
      if (!isSupabaseConfigured()) {
        return {
          error: new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
          ),
        }
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName?.trim() || null,
            },
          },
        })

        if (error) {
          return { error }
        }

        if (data.user) {
          // Immediately upsert profile with provided display name
          const initialProfile: Profile = {
            id: data.user.id,
            display_name: displayName?.trim() || null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
            preferred_theme: 'system',
            daily_goal: 1008,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          try {
            await supabase.from('profiles').upsert(initialProfile)
            setProfile(initialProfile)
          } catch {
            // Background upsert failure is non-blocking
          }
        }

        return { error: null, data }
      } catch (err: any) {
        return { error: err }
      }
    },
    []
  )

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: Error | null; data?: any }> => {
      if (!isSupabaseConfigured()) {
        return {
          error: new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
          ),
        }
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { error }
        }

        if (data.user) {
          await fetchProfile(data.user.id)
        }

        return { error: null, data }
      } catch (err: any) {
        return { error: err }
      }
    },
    [fetchProfile]
  )

  /**
   * Sign out and clear all local state
   */
  const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
    setUser(null)
    setSession(null)
    setProfile(null)

    if (!isSupabaseConfigured()) {
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }, [])

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(
    async (email: string): Promise<{ error: Error | null }> => {
      if (!isSupabaseConfigured()) {
        return {
          error: new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
          ),
        }
      }

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        return { error }
      } catch (err: any) {
        return { error: err }
      }
    },
    []
  )

  /**
   * Update password for currently authenticated user
   */
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: Error | null }> => {
      if (!isSupabaseConfigured()) {
        return {
          error: new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
          ),
        }
      }

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        })
        return { error }
      } catch (err: any) {
        return { error: err }
      }
    },
    []
  )

  /**
   * Update user profile in profiles table and update local state
   */
  const updateProfile = useCallback(
    async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
      if (!isSupabaseConfigured()) {
        return {
          error: new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
          ),
        }
      }

      if (!user?.id) {
        return { error: new Error('User is not authenticated') }
      }

      try {
        const updatedRecord = {
          ...updates,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
          .from('profiles')
          .update(updatedRecord)
          .eq('id', user.id)

        if (error) {
          return { error }
        }

        setProfile((prev) => (prev ? { ...prev, ...updates } : null))
        return { error: null }
      } catch (err: any) {
        return { error: err }
      }
    },
    [user?.id]
  )

  /**
   * Initialize session and subscribe to auth state changes
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    let isMounted = true

    // Check existing session on mount
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error }) => {
        if (!isMounted) return

        if (error) {
          console.warn('Failed to retrieve initial session:', error.message)
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }

        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.warn('Session check exception:', err)
        setLoading(false)
      })

    // Listen for auth state transitions (sign in, sign out, token refresh, password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_OUT' || !newSession) {
          setUser(null)
          setSession(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (newSession?.user) {
          await fetchProfile(newSession.user.id)
        }

        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      loading,
      isConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      isConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshProfile,
    ]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {!isConfigured && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs md:text-sm text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2 z-50 sticky top-0 backdrop-blur-sm"
        >
          <span className="font-semibold">⚠️ Offline Demo Mode:</span>
          <span>
            Supabase is not configured. Add your credentials in{' '}
            <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">.env</code>{' '}
            to enable cloud sync &amp; multi-device backup.
          </span>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to consume the AuthContext.
 * Throws an error if used outside an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
