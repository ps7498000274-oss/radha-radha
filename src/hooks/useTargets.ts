/**
 * Radha Radha — Naam Jap Tracker
 * useTargets — Hook for managing spiritual milestones and custom Jap targets
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { UserTarget } from '@/lib/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MILESTONES } from '@/lib/constants'

export interface UseTargetsReturn {
  targets: UserTarget[]
  loading: boolean
  error: string | null
  activeTarget: UserTarget | null
  milestoneTargets: UserTarget[]
  customTargets: UserTarget[]
  fetchTargets: () => Promise<void>
  setActiveTarget: (targetId: string) => Promise<{ error: Error | null }>
  createCustomTarget: (
    title: string,
    count: number
  ) => Promise<{ data: UserTarget | null; error: Error | null }>
  deleteTarget: (id: string) => Promise<{ error: Error | null }>
  markCompleted: (id: string) => Promise<{ error: Error | null }>
}

export function useTargets(): UseTargetsReturn {
  const { user } = useAuth()
  const [targets, setTargets] = useState<UserTarget[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generates default milestone targets for unauthenticated or first-time users
   */
  const defaultMilestones = useMemo<UserTarget[]>(() => {
    return MILESTONES.map((m, idx) => ({
      id: `milestone-${m.count}`,
      user_id: user?.id || 'demo-user',
      title: m.name,
      target_count: m.count,
      target_type: 'milestone',
      is_active: idx === 0, // First milestone (1 Crore) is active by default
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  }, [user?.id])

  /**
   * Fetch user targets from Supabase
   */
  const fetchTargets = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured() || !user?.id) {
      setTargets(defaultMilestones)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchErr } = await supabase
        .from('user_targets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (fetchErr) {
        setError(fetchErr.message)
        setTargets(defaultMilestones)
      } else if (data && data.length > 0) {
        setTargets(data as UserTarget[])
      } else {
        // First-time user: seed default milestone targets
        const toSeed = MILESTONES.map((m, idx) => ({
          user_id: user.id,
          title: m.name,
          target_count: m.count,
          target_type: 'milestone' as const,
          is_active: idx === 0,
          completed_at: null,
        }))

        const { data: seeded, error: seedErr } = await supabase
          .from('user_targets')
          .insert(toSeed)
          .select()

        if (!seedErr && seeded) {
          setTargets(seeded as UserTarget[])
        } else {
          setTargets(defaultMilestones)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch targets')
      setTargets(defaultMilestones)
    } finally {
      setLoading(false)
    }
  }, [user?.id, defaultMilestones])

  /**
   * Auto-fetch targets on mount and user change
   */
  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  /**
   * Set one target as active and deactivate all other targets
   */
  const setActiveTarget = useCallback(
    async (targetId: string): Promise<{ error: Error | null }> => {
      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        setTargets((prev) =>
          prev.map((t) => ({
            ...t,
            is_active: t.id === targetId,
          }))
        )
        return { error: null }
      }

      try {
        // Deactivate all targets for this user first
        await supabase
          .from('user_targets')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        // Activate the selected target
        const { error: activateErr } = await supabase
          .from('user_targets')
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId)
          .eq('user_id', user.id)

        if (activateErr) {
          setError(activateErr.message)
          return { error: activateErr }
        }

        setTargets((prev) =>
          prev.map((t) => ({
            ...t,
            is_active: t.id === targetId,
          }))
        )
        return { error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to activate target')
        return { error: err }
      }
    },
    [user?.id]
  )

  /**
   * Create a new custom target
   */
  const createCustomTarget = useCallback(
    async (
      title: string,
      count: number
    ): Promise<{ data: UserTarget | null; error: Error | null }> => {
      const cleanTitle = title.trim()
      const validCount = Math.max(1, count)

      if (!cleanTitle) {
        return {
          data: null,
          error: new Error('Target title is required'),
        }
      }

      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        const newTarget: UserTarget = {
          id: `custom-${Date.now()}`,
          user_id: user?.id || 'demo-user',
          title: cleanTitle,
          target_count: validCount,
          target_type: 'custom',
          is_active: false,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTargets((prev) => [...prev, newTarget])
        return { data: newTarget, error: null }
      }

      try {
        const payload = {
          user_id: user.id,
          title: cleanTitle,
          target_count: validCount,
          target_type: 'custom' as const,
          is_active: false,
          completed_at: null,
        }

        const { data, error: insertErr } = await supabase
          .from('user_targets')
          .insert(payload)
          .select()
          .single()

        if (insertErr) {
          setError(insertErr.message)
          return { data: null, error: insertErr }
        }

        const createdTarget = data as UserTarget
        setTargets((prev) => [...prev, createdTarget])
        return { data: createdTarget, error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to create target')
        return { data: null, error: err }
      }
    },
    [user?.id]
  )

  /**
   * Delete a custom target (prevents deletion of milestone targets)
   */
  const deleteTarget = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      const target = targets.find((t) => t.id === id)
      if (!target) {
        return { error: new Error('Target not found') }
      }

      if (target.target_type !== 'custom') {
        return {
          error: new Error(
            'Cannot delete core spiritual milestones. Only custom targets can be deleted.'
          ),
        }
      }

      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        setTargets((prev) => prev.filter((t) => t.id !== id))
        return { error: null }
      }

      try {
        const { error: delErr } = await supabase
          .from('user_targets')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .eq('target_type', 'custom')

        if (delErr) {
          setError(delErr.message)
          return { error: delErr }
        }

        setTargets((prev) => prev.filter((t) => t.id !== id))
        return { error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to delete custom target')
        return { error: err }
      }
    },
    [targets, user?.id]
  )

  /**
   * Mark a target as completed with current timestamp
   */
  const markCompleted = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      const timestamp = new Date().toISOString()

      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        setTargets((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, completed_at: timestamp, updated_at: timestamp }
              : t
          )
        )
        return { error: null }
      }

      try {
        const { error: updateErr } = await supabase
          .from('user_targets')
          .update({
            completed_at: timestamp,
            updated_at: timestamp,
          })
          .eq('id', id)
          .eq('user_id', user.id)

        if (updateErr) {
          setError(updateErr.message)
          return { error: updateErr }
        }

        setTargets((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, completed_at: timestamp, updated_at: timestamp }
              : t
          )
        )
        return { error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to mark target completed')
        return { error: err }
      }
    },
    [user?.id]
  )

  // Computed: currently active target
  const activeTarget = useMemo<UserTarget | null>(() => {
    return targets.find((t) => t.is_active) ?? targets[0] ?? null
  }, [targets])

  // Computed: milestone targets
  const milestoneTargets = useMemo<UserTarget[]>(() => {
    return targets.filter((t) => t.target_type === 'milestone')
  }, [targets])

  // Computed: custom user targets
  const customTargets = useMemo<UserTarget[]>(() => {
    return targets.filter((t) => t.target_type === 'custom')
  }, [targets])

  return {
    targets,
    loading,
    error,
    activeTarget,
    milestoneTargets,
    customTargets,
    fetchTargets,
    setActiveTarget,
    createCustomTarget,
    deleteTarget,
    markCompleted,
  }
}
