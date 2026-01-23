-- =====================================================
-- SUPABASE DATABASE SCHEMA FOR STICKMAN TO THE RESCUE
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- 1. USER PROFILES TABLE
-- Stores user preferences and profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    username TEXT,
    player_gender TEXT CHECK (player_gender IN ('guy', 'girl')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GAME PROGRESS TABLE
-- Stores completed levels/missions for each user
CREATE TABLE IF NOT EXISTS public.game_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    mission_id TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trust_score INTEGER,
    UNIQUE(user_id, mission_id)
);

-- 3. MINIGAME SCORES TABLE
-- Stores scores and stats for all minigames
CREATE TABLE IF NOT EXISTS public.minigame_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('quiz', 'signal_scout', 'resource_relay', 'words_of_hope')),
    score INTEGER NOT NULL,
    total_questions INTEGER,
    correct_answers INTEGER,
    time_taken INTEGER, -- in seconds
    best_streak INTEGER,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER SETTINGS TABLE
-- Stores user preferences for audio, TTS, etc.
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    audio_volume DECIMAL(3,2) DEFAULT 0.5 CHECK (audio_volume >= 0 AND audio_volume <= 1),
    tts_enabled BOOLEAN DEFAULT true,
    text_speed INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- GAME PROGRESS POLICIES
-- Users can view their own progress
CREATE POLICY "Users can view own progress"
    ON public.game_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
    ON public.game_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
    ON public.game_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- MINIGAME SCORES POLICIES
-- Users can view their own scores
CREATE POLICY "Users can view own scores"
    ON public.minigame_scores FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores"
    ON public.minigame_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- USER SETTINGS POLICIES
-- Users can view their own settings
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_settings table
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON public.game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_minigame_scores_user_id ON public.minigame_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_minigame_scores_game_type ON public.minigame_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =====================================================
-- INITIAL DATA / SEED (Optional)
-- =====================================================
-- You can add any initial data here if needed

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the tables were created successfully:
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.game_progress;
-- SELECT * FROM public.minigame_scores;
-- SELECT * FROM public.user_settings;
