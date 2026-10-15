/**
 * Radha Radha — Naam Jap Tracker
 * useJapEntries — Hook for CRUD operations and querying daily Jap log entries
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { DailyJapEntry } from '@/lib/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { calculateTotalJap } from '@/lib/calculations'

export interface DateRangeFilter {
  from: Date
  to: Date
}

export interface UseJapEntriesReturn {
  entries: DailyJapEntry[]
  loading: boolean
  error: string | null
  totalJapCount: number
  fetchEntries: (dateRange?: DateRangeFilter) => Promise<void>
  addEntry: (
    date: string,
    count: number,
    notes?: string,
    overwrite?: boolean
  ) => Promise<{ data: DailyJapEntry | null; error: Error | null }>
  updateEntry: (
    id: string,
    updates: Partial<Pick<DailyJapEntry, 'jap_count' | 'notes' | 'entry_date'>>
  ) => Promise<{ data: DailyJapEntry | null; error: Error | null }>
  deleteEntry: (id: string) => Promise<{ error: Error | null }>
  getEntryByDate: (date: string) => DailyJapEntry | undefined
}

export function useJapEntries(): UseJapEntriesReturn {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DailyJapEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch daily Jap entries for the logged-in user, ordered by entry_date descending
   */
  const fetchEntries = useCallback(
    async (dateRange?: DateRangeFilter): Promise<void> => {
      if (!isSupabaseConfigured() || !user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('daily_jap_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false })

        if (dateRange?.from) {
          const fromStr = dateRange.from.toISOString().split('T')[0]!
          query = query.gte('entry_date', fromStr)
        }

        if (dateRange?.to) {
          const toStr = dateRange.to.toISOString().split('T')[0]!
          query = query.lte('entry_date', toStr)
        }

        const { data, error: fetchErr } = await query

        if (fetchErr) {
          setError(fetchErr.message)
        } else {
          setEntries((data as DailyJapEntry[]) || [])
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch Jap entries')
      } finally {
        setLoading(false)
      }
    },
    [user?.id]
  )

  /**
   * Auto-fetch on mount and whenever user ID changes
   */
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  /**
   * Insert or upsert Jap entry with conflict handling on (user_id, entry_date)
   * If overwrite is false (default), adds count to existing count.
   */
  const addEntry = useCallback(
    async (
      date: string,
      count: number,
      notes?: string,
      overwrite: boolean = false
    ): Promise<{ data: DailyJapEntry | null; error: Error | null }> => {
      const cleanDate = date.split('T')[0]!
      const validCount = Math.max(0, count)

      // Handle unconfigured Supabase / demo mode locally
      if (!isSupabaseConfigured() || !user?.id) {
        const existingIdx = entries.findIndex(
          (e) => e.entry_date.split('T')[0] === cleanDate
        )

        let resultEntry: DailyJapEntry

        if (existingIdx >= 0) {
          const existing = entries[existingIdx]!
          resultEntry = {
            ...existing,
            jap_count: overwrite ? validCount : existing.jap_count + validCount,
            notes: notes !== undefined ? notes : existing.notes,
            updated_at: new Date().toISOString(),
          }
          const updated = [...entries]
          updated[existingIdx] = resultEntry
          setEntries(updated)
        } else {
          resultEntry = {
            id: `demo-${Date.now()}`,
            user_id: user?.id || 'demo-user',
            entry_date: cleanDate,
            jap_count: validCount,
            notes: notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setEntries((prev) =>
            [resultEntry, ...prev].sort((a, b) =>
              b.entry_date.localeCompare(a.entry_date)
            )
          )
        }

        return { data: resultEntry, error: null }
      }

      try {
        // Check local state for existing entry on that date to compute increment
        const existing = entries.find(
          (e) => e.entry_date.split('T')[0] === cleanDate
        )

        const finalCount =
          existing && !overwrite
            ? existing.jap_count + validCount
            : validCount

        const finalNotes =
          notes !== undefined
            ? notes
            : existing?.notes ?? null

        const payload = {
          user_id: user.id,
          entry_date: cleanDate,
          jap_count: finalCount,
          notes: finalNotes,
          updated_at: new Date().toISOString(),
        }

        const { data, error: upsertErr } = await supabase
          .from('daily_jap_entries')
          .upsert(payload, { onConflict: 'user_id,entry_date' })
          .select()
          .single()

        if (upsertErr) {
          setError(upsertErr.message)
          return { data: null, error: upsertErr }
        }

        const savedEntry = data as DailyJapEntry

        // Update local state
        setEntries((prev) => {
          const idx = prev.findIndex(
            (e) => e.entry_date.split('T')[0] === cleanDate
          )
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = savedEntry
            return next
          }
          return [savedEntry, ...prev].sort((a, b) =>
            b.entry_date.localeCompare(a.entry_date)
          )
        })

        return { data: savedEntry, error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to add Jap entry')
        return { data: null, error: err }
      }
    },
    [entries, user?.id]
  )

  /**
   * Update an existing Jap entry by ID
   */
  const updateEntry = useCallback(
    async (
      id: string,
      updates: Partial<Pick<DailyJapEntry, 'jap_count' | 'notes' | 'entry_date'>>
    ): Promise<{ data: DailyJapEntry | null; error: Error | null }> => {
      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        let updatedEntry: DailyJapEntry | null = null
        setEntries((prev) =>
          prev.map((e) => {
            if (e.id === id) {
              updatedEntry = {
                ...e,
                ...updates,
                updated_at: new Date().toISOString(),
              }
              return updatedEntry
            }
            return e
          })
        )
        return { data: updatedEntry, error: null }
      }

      try {
        const { data, error: updateErr } = await supabase
          .from('daily_jap_entries')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateErr) {
          setError(updateErr.message)
          return { data: null, error: updateErr }
        }

        const updated = data as DailyJapEntry
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
        return { data: updated, error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to update Jap entry')
        return { data: null, error: err }
      }
    },
    [user?.id]
  )

  /**
   * Delete a Jap entry by ID
   */
  const deleteEntry = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      // Local demo mode handling
      if (!isSupabaseConfigured() || !user?.id) {
        setEntries((prev) => prev.filter((e) => e.id !== id))
        return { error: null }
      }

      try {
        const { error: delErr } = await supabase
          .from('daily_jap_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (delErr) {
          setError(delErr.message)
          return { error: delErr }
        }

        setEntries((prev) => prev.filter((e) => e.id !== id))
        return { error: null }
      } catch (err: any) {
        setError(err.message || 'Failed to delete Jap entry')
        return { error: err }
      }
    },
    [user?.id]
  )

  /**
   * Find entry for a specific date (YYYY-MM-DD)
   */
  const getEntryByDate = useCallback(
    (date: string): DailyJapEntry | undefined => {
      const cleanDate = date.split('T')[0]!
      return entries.find((e) => e.entry_date.split('T')[0] === cleanDate)
    },
    [entries]
  )

  /**
   * Computed total Jap count across all entries
   */
  const totalJapCount = useMemo(() => calculateTotalJap(entries), [entries])

  return {
    entries,
    loading,
    error,
    totalJapCount,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryByDate,
  }
}
