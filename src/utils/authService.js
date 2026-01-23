import { supabase } from '../config/supabase';

/**
 * Authentication service for handling Supabase auth operations
 */
export const authService = {
    /**
     * Sign up a new user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<{user, session, error}>}
     */
    async signUpWithEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) throw error;

            return {
                user: data.user,
                session: data.session,
                error: null,
                needsEmailVerification: !data.session // If no session, email verification is required
            };
        } catch (error) {
            console.error('Sign up error:', error);
            return {
                user: null,
                session: null,
                error: error.message || 'Failed to sign up'
            };
        }
    },

    /**
     * Sign in with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<{user, session, error}>}
     */
    async signInWithEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return {
                user: data.user,
                session: data.session,
                error: null
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                user: null,
                session: null,
                error: error.message || 'Failed to sign in'
            };
        }
    },

    /**
     * Sign in with Google OAuth
     * @returns {Promise<{error}>}
     */
    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            console.error('Google sign in error:', error);
            return {
                error: error.message || 'Failed to sign in with Google'
            };
        }
    },

    /**
     * Sign out the current user
     * @returns {Promise<{error}>}
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return {
                error: error.message || 'Failed to sign out'
            };
        }
    },

    /**
     * Get the current user session
     * @returns {Promise<{session, error}>}
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return {
                session: data.session,
                error: null
            };
        } catch (error) {
            console.error('Get session error:', error);
            return {
                session: null,
                error: error.message || 'Failed to get session'
            };
        }
    },

    /**
     * Get the current user
     * @returns {Promise<{user, error}>}
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return {
                user,
                error: null
            };
        } catch (error) {
            console.error('Get user error:', error);
            return {
                user: null,
                error: error.message || 'Failed to get user'
            };
        }
    },

    /**
     * Resend email verification
     * @param {string} email - User's email
     * @returns {Promise<{error}>}
     */
    async resendVerificationEmail(email) {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Resend verification error:', error);
            return {
                error: error.message || 'Failed to resend verification email'
            };
        }
    },

    /**
     * Reset password - send reset email
     * @param {string} email - User's email
     * @returns {Promise<{error}>}
     */
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Reset password error:', error);
            return {
                error: error.message || 'Failed to send reset password email'
            };
        }
    },

    /**
     * Subscribe to auth state changes
     * @param {Function} callback - Callback function to handle auth state changes
     * @returns {Object} Subscription object with unsubscribe method
     */
    onAuthStateChange(callback) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });

        return subscription;
    }
};
