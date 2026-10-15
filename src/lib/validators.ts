/**
 * Radha Radha — Naam Jap Tracker
 * Zod validation schemas for forms and data integrity
 */

import { z } from 'zod'
import { MAX_DAILY_JAP, MIN_DAILY_JAP } from './constants'

export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or fewer'),
  daily_goal: z
    .number({ invalid_type_error: 'Daily goal must be a number' })
    .int('Daily goal must be a whole number')
    .min(1, 'Daily goal must be at least 1')
    .max(MAX_DAILY_JAP, `Daily goal cannot exceed ${MAX_DAILY_JAP.toLocaleString('en-IN')}`),
  timezone: z.string().min(1, 'Timezone is required'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const dailyEntrySchema = z.object({
  jap_count: z
    .number({ invalid_type_error: 'Jap count must be a number' })
    .int('Jap count must be a whole number')
    .min(MIN_DAILY_JAP, `Minimum Jap count is ${MIN_DAILY_JAP}`)
    .max(MAX_DAILY_JAP, `Maximum daily Jap count is ${MAX_DAILY_JAP.toLocaleString('en-IN')}`),
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .nullable()
    .optional(),
})

export type DailyEntryFormData = z.infer<typeof dailyEntrySchema>

export const settingsSchema = z.object({
  audio_enabled: z.boolean(),
  audio_volume: z.number().min(0).max(1),
  audio_repeat: z.boolean(),
  daily_reminder_time: z.string().nullable().optional(),
  preferred_theme: z.enum(['light', 'dark', 'system']),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    display_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const customTargetSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
  target_count: z
    .number({ invalid_type_error: 'Target count must be a number' })
    .int('Target count must be a whole number')
    .min(108, 'Target count must be at least 108'),
})

export type CustomTargetFormData = z.infer<typeof customTargetSchema>

