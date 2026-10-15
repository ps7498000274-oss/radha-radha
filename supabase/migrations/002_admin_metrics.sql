-- =============================================================================
-- Migration: 002_admin_metrics.sql
-- Description: RPC function for authorized Admin to view platform accounts and jap metrics
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_admin_user_stats(passkey TEXT)
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
    -- Verify the admin password
    IF passkey != 'P74a98v00a02n74@' THEN
        RAISE EXCEPTION 'Unauthorized: Invalid Admin Credentials';
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
