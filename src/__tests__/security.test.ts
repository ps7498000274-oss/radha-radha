import { describe, it, expect, beforeEach } from 'vitest'
import { sanitizeCsvCell } from '@/lib/formatters'
import {
  strongPasswordSchema,
  registerSchema,
  updatePasswordSchema,
  dailyEntrySchema,
  customTargetSchema,
  loginSchema,
} from '@/lib/validators'
import {
  calculateTotalJap,
  calculateStreak,
  calculateAveragePerActiveDay,
  calculateMilestoneProgress,
} from '@/lib/calculations'
import type { DailyJapEntry } from '@/lib/types'

describe('Z+++++ Security & Robustness Test Suite — Radha Radha', () => {
  // =========================================================================
  // 1. CSV Formula Injection Defense (CWE-1236)
  // =========================================================================
  describe('CSV Injection Sanitization (CWE-1236)', () => {
    it('prepends single quote to neutralize formula injection with =', () => {
      const malicious = '=cmd|"/C calc"!A0'
      const sanitized = sanitizeCsvCell(malicious)
      expect(sanitized).toBe("\"'=cmd|\"\"/C calc\"\"!A0\"")
      expect(sanitized.startsWith("\"'=")).toBe(true)
    })

    it('neutralizes formula injection with +, -, and @', () => {
      expect(sanitizeCsvCell('+1+2')).toBe("\"'+1+2\"")
      expect(sanitizeCsvCell('-5+10')).toBe("\"'-5+10\"")
      expect(sanitizeCsvCell('@SUM(A1:A10)')).toBe("\"'@SUM(A1:A10)\"")
    })

    it('neutralizes tab and carriage return leading characters', () => {
      expect(sanitizeCsvCell('\t=calc')).toBe("\"'\t=calc\"")
      expect(sanitizeCsvCell('\r=calc')).toBe("\"'\r=calc\"")
      expect(sanitizeCsvCell('%20=calc')).toBe("\"'%20=calc\"")
    })

    it('handles leading whitespace before dangerous formula characters', () => {
      const padded = '   =1+1'
      expect(sanitizeCsvCell(padded)).toBe("\"'   =1+1\"")
    })

    it('preserves legitimate text notes without modification except quoting', () => {
      const normalNote = 'Completed 16 malas in the morning'
      expect(sanitizeCsvCell(normalNote)).toBe('"Completed 16 malas in the morning"')
    })

    it('properly quotes and handles null and undefined safely', () => {
      expect(sanitizeCsvCell(null)).toBe('""')
      expect(sanitizeCsvCell(undefined)).toBe('""')
      expect(sanitizeCsvCell(108)).toBe('"108"')
    })
  })

  // =========================================================================
  // 2. Strong Password Policy & Validation (CWE-521)
  // =========================================================================
  describe('Password Complexity & Policy (CWE-521)', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const shortResult = strongPasswordSchema.safeParse('Aa1!sho')
      expect(shortResult.success).toBe(false)
      if (!shortResult.success) {
        expect(shortResult.error.errors[0]?.message).toContain('at least 8 characters')
      }
    })

    it('rejects passwords missing uppercase letters', () => {
      const result = strongPasswordSchema.safeParse('radha1234')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('uppercase letter')
      }
    })

    it('rejects passwords missing lowercase letters', () => {
      const result = strongPasswordSchema.safeParse('RADHA1234')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('lowercase letter')
      }
    })

    it('rejects passwords missing numbers', () => {
      const result = strongPasswordSchema.safeParse('RadhaRadha')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('number')
      }
    })

    it('accepts compliant passwords meeting complexity standards', () => {
      expect(strongPasswordSchema.safeParse('Radha108!').success).toBe(true)
      expect(strongPasswordSchema.safeParse('KrsnaPrema108#').success).toBe(true)
      expect(strongPasswordSchema.safeParse('Sadhana2026Secure').success).toBe(true)
    })

    it('validates loginSchema requirements', () => {
      expect(loginSchema.safeParse({ email: 'invalid-email', password: '123' }).success).toBe(false)
      expect(loginSchema.safeParse({ email: 'devotee@radha.org', password: '123' }).success).toBe(false)
      expect(loginSchema.safeParse({ email: 'devotee@radha.org', password: 'ValidPassword123' }).success).toBe(true)
    })

    it('enforces password confirmation match in registration', () => {
      const mismatch = registerSchema.safeParse({
        display_name: 'Bhakta',
        email: 'bhakta@radharadha.org',
        password: 'Password123',
        confirm_password: 'Password456',
      })
      expect(mismatch.success).toBe(false)

      const match = registerSchema.safeParse({
        display_name: 'Bhakta',
        email: 'bhakta@radharadha.org',
        password: 'Password123',
        confirm_password: 'Password123',
      })
      expect(match.success).toBe(true)
    })

    it('enforces password confirmation match in updatePasswordSchema', () => {
      const mismatch = updatePasswordSchema.safeParse({
        password: 'Password123',
        confirm_password: 'WrongPassword123',
      })
      expect(mismatch.success).toBe(false)

      const match = updatePasswordSchema.safeParse({
        password: 'Password123',
        confirm_password: 'Password123',
      })
      expect(match.success).toBe(true)
    })
  })

  // =========================================================================
  // 3. Daily Jap Entry Validation (CWE-20)
  // =========================================================================
  describe('Daily Jap Entry Validation (CWE-20)', () => {
    it('rejects negative jap counts', () => {
      const result = dailyEntrySchema.safeParse({
        jap_count: -100,
        entry_date: '2026-10-18',
        notes: null,
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer jap counts', () => {
      const result = dailyEntrySchema.safeParse({
        jap_count: 108.5,
        entry_date: '2026-10-18',
        notes: null,
      })
      expect(result.success).toBe(false)
    })

    it('rejects counts exceeding MAX_DAILY_JAP (10,000,000)', () => {
      const result = dailyEntrySchema.safeParse({
        jap_count: 10000001,
        entry_date: '2026-10-18',
        notes: null,
      })
      expect(result.success).toBe(false)
    })

    it('rejects malformed date strings', () => {
      const invalidDates = ['18-10-2026', '2026/10/18', 'invalid-date', '2026-1-1']
      for (const d of invalidDates) {
        const result = dailyEntrySchema.safeParse({
          jap_count: 108,
          entry_date: d,
          notes: null,
        })
        expect(result.success).toBe(false)
      }
    })

    it('rejects notes exceeding 500 characters', () => {
      const longNotes = 'a'.repeat(501)
      const result = dailyEntrySchema.safeParse({
        jap_count: 108,
        entry_date: '2026-10-18',
        notes: longNotes,
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid daily jap records', () => {
      const valid = dailyEntrySchema.safeParse({
        jap_count: 5000,
        entry_date: '2026-10-18',
        notes: 'Peaceful morning japa',
      })
      expect(valid.success).toBe(true)
    })
  })

  // =========================================================================
  // 4. Custom Target Validation (CWE-20)
  // =========================================================================
  describe('Custom Target Validation (CWE-20)', () => {
    it('rejects target title shorter than 2 characters', () => {
      const result = customTargetSchema.safeParse({
        title: 'A',
        target_count: 50000,
      })
      expect(result.success).toBe(false)
    })

    it('rejects target count below 108', () => {
      const result = customTargetSchema.safeParse({
        title: 'My Target',
        target_count: 50,
      })
      expect(result.success).toBe(false)
    })

    it('rejects target count exceeding upper bound 100 Crore', () => {
      const result = customTargetSchema.safeParse({
        title: 'Excessive Target',
        target_count: 1000000001,
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid custom targets', () => {
      const result = customTargetSchema.safeParse({
        title: 'Navratri Sankalp',
        target_count: 125000,
      })
      expect(result.success).toBe(true)
    })
  })

  // =========================================================================
  // 5. Multi-User Isolation & Invariants (CWE-285, CWE-639)
  // =========================================================================
  describe('Multi-User Data Isolation Invariants (CWE-285)', () => {
    const userA = '00000000-0000-0000-0000-000000000001'
    const userB = '00000000-0000-0000-0000-000000000002'

    function simulateRlsPolicyCheck(
      authenticatedUserId: string,
      recordUserId: string,
      _action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
    ): boolean {
      // Invariant: Authenticated user ID must match record user_id for all user-owned rows
      return authenticatedUserId === recordUserId
    }

    it('permits user to access their own records', () => {
      expect(simulateRlsPolicyCheck(userA, userA, 'SELECT')).toBe(true)
      expect(simulateRlsPolicyCheck(userA, userA, 'INSERT')).toBe(true)
      expect(simulateRlsPolicyCheck(userA, userA, 'UPDATE')).toBe(true)
      expect(simulateRlsPolicyCheck(userA, userA, 'DELETE')).toBe(true)
    })

    it('denies user from reading or modifying another users records', () => {
      expect(simulateRlsPolicyCheck(userA, userB, 'SELECT')).toBe(false)
      expect(simulateRlsPolicyCheck(userA, userB, 'INSERT')).toBe(false)
      expect(simulateRlsPolicyCheck(userA, userB, 'UPDATE')).toBe(false)
      expect(simulateRlsPolicyCheck(userA, userB, 'DELETE')).toBe(false)
    })

    it('verifies admin privilege check requires membership in admin_users', () => {
      const adminUsersList = new Set([userA])
      const checkIsAdmin = (callerId: string) => adminUsersList.has(callerId)

      expect(checkIsAdmin(userA)).toBe(true)
      expect(checkIsAdmin(userB)).toBe(false)
    })
  })

  // =========================================================================
  // 6. Jap Calculations & Business Logic Integrity
  // =========================================================================
  describe('Sadhana Calculations Integrity', () => {
    const mockEntries: DailyJapEntry[] = [
      {
        id: '1',
        user_id: 'user-1',
        entry_date: '2026-10-01',
        jap_count: 5000,
        notes: null,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-1',
        entry_date: '2026-10-02',
        jap_count: 10000,
        notes: null,
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      },
      {
        id: '3',
        user_id: 'user-1',
        entry_date: '2026-10-03',
        jap_count: 15000,
        notes: null,
        created_at: '2026-10-03T00:00:00Z',
        updated_at: '2026-10-03T00:00:00Z',
      },
    ]

    it('accurately sums total jap count', () => {
      expect(calculateTotalJap(mockEntries)).toBe(30000)
      expect(calculateTotalJap([])).toBe(0)
    })

    it('accurately calculates average per active day', () => {
      expect(calculateAveragePerActiveDay(mockEntries)).toBe(10000)
      expect(calculateAveragePerActiveDay([])).toBe(0)
    })

    it('accurately computes milestone progress percentage and remaining', () => {
      const progress = calculateMilestoneProgress(30000, 100000)
      expect(progress.completed).toBe(30000)
      expect(progress.remaining).toBe(70000)
      expect(progress.percentage).toBe(30)
    })

    it('caps milestone progress percentage at 100%', () => {
      const progress = calculateMilestoneProgress(150000, 100000)
      expect(progress.percentage).toBe(100)
      expect(progress.remaining).toBe(0)
    })

    it('calculates streaks correctly', () => {
      const streak = calculateStreak(mockEntries)
      expect(streak.best).toBeGreaterThanOrEqual(1)
    })
  })

  // =========================================================================
  // 7. Session and Sensitive Storage Cleanup (CWE-613)
  // =========================================================================
  describe('Session Storage Cleanup on SignOut (CWE-613)', () => {
    class MockStorage {
      private store: Record<string, string> = {}
      getItem(key: string) {
        return this.store[key] ?? null
      }
      setItem(key: string, value: string) {
        this.store[key] = value
      }
      removeItem(key: string) {
        delete this.store[key]
      }
      clear() {
        this.store = {}
      }
    }

    const mockSession = new MockStorage()
    const mockLocal = new MockStorage()

    beforeEach(() => {
      mockSession.clear()
      mockLocal.clear()
    })

    it('properly removes session data on simulated logout', () => {
      const testUserId = 'test-devotee-123'
      mockSession.setItem('radha_radha_admin_auth', 'true')
      mockLocal.setItem(`radha_avatar_${testUserId}`, 'data:image/png;base64,sample')

      // Emulate AuthContext.tsx signOut storage purging logic
      mockSession.removeItem('radha_radha_admin_auth')
      mockSession.clear()
      mockLocal.removeItem(`radha_avatar_${testUserId}`)

      expect(mockSession.getItem('radha_radha_admin_auth')).toBeNull()
      expect(mockLocal.getItem(`radha_avatar_${testUserId}`)).toBeNull()
    })
  })

  // =========================================================================
  // 8. Number Formatting & Devotional Display Integrity
  // =========================================================================
  describe('Indian Number & Devotional Formatting', () => {
    it('formats large numbers into traditional Indian comma grouping', async () => {
      const { formatIndianNumber } = await import('@/lib/formatters')
      expect(formatIndianNumber(10000000)).toBe('1,00,00,000') // 1 Crore
      expect(formatIndianNumber(30000000)).toBe('3,00,00,000') // 3 Crore
      expect(formatIndianNumber(120000000)).toBe('12,00,00,000') // 12 Crore
      expect(formatIndianNumber(1008)).toBe('1,008')
      expect(formatIndianNumber(108)).toBe('108')
      expect(formatIndianNumber(0)).toBe('0')
      expect(formatIndianNumber(null)).toBe('0')
    })

    it('formats compact representations correctly', async () => {
      const { formatCompactNumber } = await import('@/lib/formatters')
      expect(formatCompactNumber(10000000)).toBe('1 Cr')
      expect(formatCompactNumber(100000)).toBe('1L')
      expect(formatCompactNumber(5000)).toBe('5K')
      expect(formatCompactNumber(108)).toBe('108')
    })
  })

  // =========================================================================
  // 9. Cross-User Table RLS Policy Model Simulation (profiles, entries, targets, settings)
  // =========================================================================
  describe('Complete Row Level Security Model Simulation', () => {
    const userA = '11111111-1111-1111-1111-111111111111'
    const userB = '22222222-2222-2222-2222-222222222222'

    // Simulate PostgreSQL Row Level Security behavior:
    // Policy: auth.uid() = user_id (or id for profiles/settings)
    interface DbRow {
      user_id: string
      data: string
    }

    const testTable: DbRow[] = [
      { user_id: userA, data: 'User A Private Sadhana Entry' },
      { user_id: userB, data: 'User B Private Sadhana Entry' },
    ]

    function rlsSelect(callerUid: string | null): DbRow[] {
      if (!callerUid) return [] // Anon cannot see private user data
      return testTable.filter((row) => row.user_id === callerUid)
    }

    function rlsInsert(callerUid: string | null, newRow: DbRow): boolean {
      if (!callerUid) return false // Anon blocked
      return callerUid === newRow.user_id // Must match caller
    }

    function rlsUpdate(callerUid: string | null, targetRowUserId: string): boolean {
      if (!callerUid) return false
      return callerUid === targetRowUserId
    }

    function rlsDelete(callerUid: string | null, targetRowUserId: string): boolean {
      if (!callerUid) return false
      return callerUid === targetRowUserId
    }

    it('enforces total privacy on SELECT: User A sees only User A records', () => {
      const results = rlsSelect(userA)
      expect(results.length).toBe(1)
      expect(results[0]?.data).toBe('User A Private Sadhana Entry')
      expect(results.some((r) => r.user_id === userB)).toBe(false)
    })

    it('blocks unauthenticated (anon) SELECT on protected tables', () => {
      const results = rlsSelect(null)
      expect(results.length).toBe(0)
    })

    it('prevents User A from inserting records on behalf of User B (spoofing)', () => {
      const spoofAttempt: DbRow = { user_id: userB, data: 'Malicious entry attributed to B' }
      expect(rlsInsert(userA, spoofAttempt)).toBe(false)
      expect(rlsInsert(userB, spoofAttempt)).toBe(true)
    })

    it('prevents User A from updating or deleting User B records (IDOR protection)', () => {
      expect(rlsUpdate(userA, userB)).toBe(false)
      expect(rlsDelete(userA, userB)).toBe(false)
      expect(rlsUpdate(userA, userA)).toBe(true)
      expect(rlsDelete(userA, userA)).toBe(true)
    })
  })

  // =========================================================================
  // 10. Client Source Secret Leakage Prevention Guard
  // =========================================================================
  describe('Client Source Secret Leakage Prevention', () => {
    it('verifies that no hardcoded passkey or service_role secret exists in frontend source', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const adminPath = path.resolve(__dirname, '../pages/Admin.tsx')
      const adminSource = fs.readFileSync(adminPath, 'utf-8')

      // Ensure Admin.tsx contains no hardcoded credentials
      expect(adminSource.includes('VITE_ADMIN_PASSWORD')).toBe(false)
      expect(adminSource.includes('VITE_ADMIN_USERNAME')).toBe(false)
      expect(adminSource.includes('P74a98v')).toBe(false)

      // Ensure Supabase client does not expose service_role
      const supabaseClientPath = path.resolve(__dirname, '../lib/supabase.ts')
      const supabaseSource = fs.readFileSync(supabaseClientPath, 'utf-8')
      expect(supabaseSource.includes('service_role')).toBe(false)
      expect(supabaseSource.includes('SUPABASE_SERVICE_ROLE_KEY')).toBe(false)
    })
  })
})
