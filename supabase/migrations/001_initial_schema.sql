-- =============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Radha Radha — Naam Jap Tracker
-- Tables: profiles, daily_jap_entries, user_targets, user_settings
-- Features: Row Level Security (RLS), auto-profile provisioning, milestone seeding,
--           and automated updated_at timestamp triggers.
-- =============================================================================

-- Enable pgcrypto for UUID generation functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Profiles Table
-- Stores user profile data linked 1:1 with auth.users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT DEFAULT '',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark', 'system')),
    daily_goal BIGINT DEFAULT 10000 CHECK (daily_goal > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile information and daily spiritual goals';
COMMENT ON COLUMN public.profiles.id IS 'References the auth.users UUID';
COMMENT ON COLUMN public.profiles.daily_goal IS 'Target number of Naam Jap repetitions per day';

-- -----------------------------------------------------------------------------
-- Daily Jap Entries Table
-- Daily count of Naam Jap per user (one entry per user per day)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_jap_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    jap_count BIGINT NOT NULL CHECK (jap_count >= 0 AND jap_count <= 10000000),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT daily_jap_entries_user_date_key UNIQUE (user_id, entry_date)
);

COMMENT ON TABLE public.daily_jap_entries IS 'Daily Naam Jap log entries';
COMMENT ON COLUMN public.daily_jap_entries.jap_count IS 'Total Naam Jap repetitions completed on entry_date (max 10,000,000)';

-- -----------------------------------------------------------------------------
-- User Targets Table
-- Tracks milestones (e.g., 1 Crore, 3 Crore, 5 Crore, 12 Crore) and custom goals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_count BIGINT NOT NULL CHECK (target_count > 0),
    target_type TEXT NOT NULL DEFAULT 'milestone' CHECK (target_type IN ('milestone', 'custom')),
    is_active BOOLEAN DEFAULT true,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_targets IS 'Spiritual milestone and custom long-term target goals';

-- -----------------------------------------------------------------------------
-- User Settings Table
-- Audio playback preferences, notification reminders, and UI preferences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_enabled BOOLEAN DEFAULT true,
    audio_volume REAL DEFAULT 0.5 CHECK (audio_volume >= 0 AND audio_volume <= 1),
    audio_repeat BOOLEAN DEFAULT true,
    daily_reminder_time TIME,
    preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_settings IS 'User application settings and background audio preferences';

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_daily_jap_entries_user_date 
    ON public.daily_jap_entries(user_id, entry_date);

CREATE INDEX IF NOT EXISTS idx_daily_jap_entries_user_id 
    ON public.daily_jap_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_user_targets_user_id 
    ON public.user_targets(user_id);

CREATE INDEX IF NOT EXISTS idx_user_targets_active
    ON public.user_targets(user_id, is_active);

-- =============================================================================
-- 3. TIMESTAMP UPDATE FUNCTION & TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_daily_jap_entries_updated_at ON public.daily_jap_entries;
CREATE TRIGGER trg_daily_jap_entries_updated_at
    BEFORE UPDATE ON public.daily_jap_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_targets_updated_at ON public.user_targets;
CREATE TRIGGER trg_user_targets_updated_at
    BEFORE UPDATE ON public.user_targets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_jap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS Policies: profiles
-- Users can view, insert, and update only their own profile
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- RLS Policies: daily_jap_entries
-- Users can view, insert, update, and delete only their own jap entries
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own jap entries" ON public.daily_jap_entries;
CREATE POLICY "Users can view own jap entries"
    ON public.daily_jap_entries FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own jap entries" ON public.daily_jap_entries;
CREATE POLICY "Users can insert own jap entries"
    ON public.daily_jap_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own jap entries" ON public.daily_jap_entries;
CREATE POLICY "Users can update own jap entries"
    ON public.daily_jap_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own jap entries" ON public.daily_jap_entries;
CREATE POLICY "Users can delete own jap entries"
    ON public.daily_jap_entries FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: user_targets
-- Users can view, insert, update, and delete only their own targets
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own targets" ON public.user_targets;
CREATE POLICY "Users can view own targets"
    ON public.user_targets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own targets" ON public.user_targets;
CREATE POLICY "Users can insert own targets"
    ON public.user_targets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own targets" ON public.user_targets;
CREATE POLICY "Users can update own targets"
    ON public.user_targets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own targets" ON public.user_targets;
CREATE POLICY "Users can delete own targets"
    ON public.user_targets FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RLS Policies: user_settings
-- Users can view, insert, and update only their own settings
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. DEFAULT MILESTONES SEEDING FUNCTION & TRIGGER
-- =============================================================================

-- Standalone helper function to seed default milestone targets for a user
CREATE OR REPLACE FUNCTION public.seed_default_milestones_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_targets (user_id, title, target_count, target_type, is_active)
    VALUES
        (target_user_id, '1 Crore', 10000000, 'milestone', true),
        (target_user_id, '3 Crore', 30000000, 'milestone', true),
        (target_user_id, '5 Crore', 50000000, 'milestone', true),
        (target_user_id, '12 Crore', 120000000, 'milestone', true)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function executed when a new profile row is created
CREATE OR REPLACE FUNCTION public.seed_default_milestones()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.seed_default_milestones_for_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_seed_default_milestones ON public.profiles;
CREATE TRIGGER trg_seed_default_milestones
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_default_milestones();

-- =============================================================================
-- 6. AUTO-CREATE PROFILE & SETTINGS ON NEW USER SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_display_name TEXT;
BEGIN
    -- Extract display name from metadata (e.g., OAuth providers or email sign-up metadata)
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );

    -- Automatically create the user profile
    INSERT INTO public.profiles (
        id,
        display_name,
        timezone,
        preferred_theme,
        daily_goal
    ) VALUES (
        NEW.id,
        v_display_name,
        'Asia/Kolkata',
        'light',
        10000
    )
    ON CONFLICT (id) DO NOTHING;

    -- Automatically create the default user settings
    INSERT INTO public.user_settings (
        user_id,
        audio_enabled,
        audio_volume,
        audio_repeat,
        daily_reminder_time,
        preferred_theme
    ) VALUES (
        NEW.id,
        true,
        0.5,
        true,
        NULL,
        'light'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
