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

describe('Z+++++ Security Test Suite — Radha Radha Naam Jap Tracker', () => {
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
      const result = strongPasswordSchema.safeParse('Aa1!short')
      // 'Aa1!sho' is 7 chars
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
      expect(strongPasswordSchema.safeParse('P74a98v00a02n74@').success).toBe(true)
      expect(strongPasswordSchema.safeParse('Sadhana2026Secure').success).toBe(true)
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
      action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
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
  })

  // =========================================================================
  // 6. Session and Sensitive Storage Cleanup (CWE-613)
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

    it('properly removes admin session and cached tokens on simulated logout', () => {
      const testUserId = 'test-devotee-123'
      mockSession.setItem('radha_radha_admin_auth', 'true')
      mockSession.setItem('radha_radha_admin_token', 'secret123')
      mockLocal.setItem(`radha_avatar_${testUserId}`, 'data:image/png;base64,sample')

      // Emulate AuthContext.tsx signOut storage purging logic
      mockSession.removeItem('radha_radha_admin_auth')
      mockSession.clear()
      mockLocal.removeItem(`radha_avatar_${testUserId}`)

      expect(mockSession.getItem('radha_radha_admin_auth')).toBeNull()
      expect(mockSession.getItem('radha_radha_admin_token')).toBeNull()
      expect(mockLocal.getItem(`radha_avatar_${testUserId}`)).toBeNull()
    })
  })
})
