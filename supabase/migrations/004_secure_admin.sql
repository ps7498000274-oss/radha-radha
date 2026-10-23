-- =============================================================================
-- Migration: 004_secure_admin.sql
-- Description: Replace passkey-based admin RPC with auth.uid()-based authorization.
--              The admin passkey was exposed in client bundles and Git history
--              and must be considered COMPROMISED. This migration eliminates it.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREATE ADMIN_USERS TABLE
-- Only users listed here can access admin operations.
-- Populate via Supabase SQL Editor: INSERT INTO admin_users (user_id) VALUES ('your-uuid');
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.admin_users IS 'Authorized admin user IDs. Managed via SQL editor only.';

-- RLS: No policies for regular users. Only SECURITY DEFINER functions and
-- service_role can read this table. This prevents users from discovering
-- who the admins are or adding themselves.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users FORCE ROW LEVEL SECURITY;

-- Explicitly deny all roles except service_role from directly querying the table
REVOKE ALL ON public.admin_users FROM PUBLIC;
REVOKE ALL ON public.admin_users FROM anon;
REVOKE ALL ON public.admin_users FROM authenticated;
GRANT ALL ON public.admin_users TO service_role;

-- -----------------------------------------------------------------------------
-- 2. CREATE ADMIN CHECK HELPER FUNCTION
-- Returns true if the currently authenticated user is an admin.
-- Runs as SECURITY DEFINER to bypass RLS on admin_users table.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    );
END;
$$;

-- Only authenticated users should be able to call this check
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. DROP THE OLD PASSKEY-BASED RPC AND CREATE SECURE REPLACEMENT
-- The old function accepted a TEXT passkey that was embedded in client JS.
-- The new function takes NO parameters and checks auth.uid() against admin_users.
-- -----------------------------------------------------------------------------

-- Drop the compromised passkey-based function
DROP FUNCTION IF EXISTS public.get_admin_user_stats(TEXT);

-- Create the secure replacement (no parameters, uses auth.uid())
CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    timezone TEXT,
    daily_goal BIGINT,
    created_at TIMESTAMPTZ,
    total_jap_count BIGINT,
    days_active BIGINT,
    last_active_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Server-side authorization: caller must be in admin_users table
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: You do not have admin privileges.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.display_name,
        p.timezone,
        p.daily_goal,
        p.created_at,
        COALESCE(SUM(d.jap_count), 0)::BIGINT AS total_jap_count,
        COUNT(d.id)::BIGINT AS days_active,
        MAX(d.entry_date) AS last_active_date
    FROM public.profiles p
    LEFT JOIN public.daily_jap_entries d ON d.user_id = p.id
    GROUP BY p.id, p.display_name, p.timezone, p.daily_goal, p.created_at
    ORDER BY p.created_at DESC;
END;
$$;

-- Only authenticated users can call this RPC (but the function itself
-- verifies admin status server-side before returning data)
REVOKE EXECUTE ON FUNCTION public.get_admin_user_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_user_stats() TO authenticated;
