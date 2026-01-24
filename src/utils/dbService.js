import { supabase } from '../config/supabaseClient';

/**
 * Database service for managing user profiles and game progress
 */
export const dbService = {
    /**
     * Get or create user profile
     * @param {string} userId - User's UUID
     * @returns {Promise<{profile, error}>}
     */
    async getOrCreateProfile(userId) {
        try {
            // First, try to get existing profile
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // If profile doesn't exist, it will be created by the trigger
            // But we can also create it manually if needed
            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, get user email
                const { data: { user } } = await supabase.auth.getUser();

                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ id: userId, email: user?.email }])
                    .select()
                    .single();

                if (insertError) throw insertError;
                profile = newProfile;
            } else if (error) {
                throw error;
            }

            return { profile, error: null };
        } catch (error) {
            console.error('Get/Create profile error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Update user profile
     * @param {string} userId - User's UUID
     * @param {Object} updates - Profile updates (username, player_gender)
     * @returns {Promise<{profile, error}>}
     */
    async updateProfile(userId, updates) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return { profile, error: null };
        } catch (error) {
            console.error('Update profile error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Get user's completed missions
     * @param {string} userId - User's UUID
     * @returns {Promise<{missions, error}>}
     */
    async getCompletedMissions(userId) {
        try {
            const { data: missions, error } = await supabase
                .from('game_progress')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false });

            if (error) throw error;

            return { missions, error: null };
        } catch (error) {
            console.error('Get completed missions error:', error);
            return { missions: [], error: error.message };
        }
    },

    /**
     * Save completed mission
     * @param {string} userId - User's UUID
     * @param {string} missionId - Mission ID
     * @param {number} trustScore - Final trust score
     * @returns {Promise<{success, error}>}
     */
    async saveCompletedMission(userId, missionId, trustScore) {
        try {
            const { error } = await supabase
                .from('game_progress')
                .upsert([
                    {
                        user_id: userId,
                        mission_id: missionId,
                        trust_score: trustScore,
                        completed_at: new Date().toISOString()
                    }
                ], {
                    onConflict: 'user_id,mission_id'
                });

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error('Save mission error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Save minigame score
     * @param {string} userId - User's UUID
     * @param {Object} scoreData - Score data
     * @returns {Promise<{success, error}>}
     */
    async saveMinigameScore(userId, scoreData) {
        try {
            const { error } = await supabase
                .from('minigame_scores')
                .insert([
                    {
                        user_id: userId,
                        game_type: scoreData.gameType,
                        score: scoreData.score,
                        total_questions: scoreData.totalQuestions,
                        correct_answers: scoreData.correctAnswers,
                        time_taken: scoreData.timeTaken,
                        best_streak: scoreData.bestStreak
                    }
                ]);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error('Save minigame score error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user's minigame scores
     * @param {string} userId - User's UUID
     * @param {string} gameType - Optional: filter by game type
     * @returns {Promise<{scores, error}>}
     */
    async getMinigameScores(userId, gameType = null) {
        try {
            let query = supabase
                .from('minigame_scores')
                .select('*')
                .eq('user_id', userId)
                .order('played_at', { ascending: false });

            if (gameType) {
                query = query.eq('game_type', gameType);
            }

            const { data: scores, error } = await query;

            if (error) throw error;

            return { scores, error: null };
        } catch (error) {
            console.error('Get minigame scores error:', error);
            return { scores: [], error: error.message };
        }
    },

    /**
     * Get user's best scores for each minigame
     * @param {string} userId - User's UUID
     * @returns {Promise<{bestScores, error}>}
     */
    async getBestScores(userId) {
        try {
            const gameTypes = ['quiz', 'signal_scout', 'resource_relay', 'words_of_hope'];
            const bestScores = {};

            for (const gameType of gameTypes) {
                const { data, error } = await supabase
                    .from('minigame_scores')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('game_type', gameType)
                    .order('score', { ascending: false })
                    .limit(1)
                    .single();

                if (!error && data) {
                    bestScores[gameType] = data;
                }
            }

            return { bestScores, error: null };
        } catch (error) {
            console.error('Get best scores error:', error);
            return { bestScores: {}, error: error.message };
        }
    },

    /**
     * Get or create user settings
     * @param {string} userId - User's UUID
     * @returns {Promise<{settings, error}>}
     */
    async getUserSettings(userId) {
        try {
            let { data: settings, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            // If settings don't exist, create default
            if (error && error.code === 'PGRST116') {
                const { data: newSettings, error: insertError } = await supabase
                    .from('user_settings')
                    .insert([{ user_id: userId }])
                    .select()
                    .single();

                if (insertError) throw insertError;
                settings = newSettings;
            } else if (error) {
                throw error;
            }

            return { settings, error: null };
        } catch (error) {
            console.error('Get user settings error:', error);
            return { settings: null, error: error.message };
        }
    },

    /**
     * Update user settings
     * @param {string} userId - User's UUID
     * @param {Object} updates - Settings updates
     * @returns {Promise<{settings, error}>}
     */
    async updateUserSettings(userId, updates) {
        try {
            const { data: settings, error } = await supabase
                .from('user_settings')
                .upsert([
                    {
                        user_id: userId,
                        ...updates
                    }
                ], {
                    onConflict: 'user_id'
                })
                .select()
                .single();

            if (error) throw error;

            return { settings, error: null };
        } catch (error) {
            console.error('Update user settings error:', error);
            return { settings: null, error: error.message };
        }
    },

    /**
     * Get user statistics
     * @param {string} userId - User's UUID
     * @returns {Promise<{stats, error}>}
     */
    async getUserStats(userId) {
        try {
            // Get total missions completed
            const { data: missions } = await supabase
                .from('game_progress')
                .select('*')
                .eq('user_id', userId);

            // Get total minigames played
            const { data: minigames } = await supabase
                .from('minigame_scores')
                .select('*')
                .eq('user_id', userId);

            // Get average trust score
            const { data: avgTrust } = await supabase
                .from('game_progress')
                .select('trust_score')
                .eq('user_id', userId);

            const averageTrust = avgTrust?.length > 0
                ? avgTrust.reduce((sum, m) => sum + (m.trust_score || 0), 0) / avgTrust.length
                : 0;

            const stats = {
                totalMissionsCompleted: missions?.length || 0,
                totalMinigamesPlayed: minigames?.length || 0,
                averageTrustScore: Math.round(averageTrust)
            };

            return { stats, error: null };
        } catch (error) {
            console.error('Get user stats error:', error);
            return { stats: null, error: error.message };
        }
    }
};
