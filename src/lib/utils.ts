/**
 * Radha Radha — Naam Jap Tracker
 * Core utility functions including class merging, safe number handling, and helpers
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines Tailwind and conditional class names with collision resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts database BIGINT values (which may arrive from Supabase as
 * strings or numbers) into a standard JavaScript number without crashing.
 */
export function safeBigInt(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 0
    return Math.floor(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return 0
    const parsed = parseInt(trimmed, 10)
    if (isNaN(parsed) || !isFinite(parsed)) return 0
    return parsed
  }

  return 0
}

/**
 * Debounces a function call by the specified millisecond duration.
 * Includes a .cancel() method to clear any pending execution.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, ms)
  }

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

/**
 * Async delay / sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Clamps a number between min and max inclusive
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generates a standard RFC4122 v4 UUID or fallback string
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
