import React, { useState } from 'react';
import { authService } from '../utils/authService';

const SignInScreen = ({ onSignInSuccess, onSwitchToSignUp, onBack }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        const { user, session, error } = await authService.signInWithEmail(
            formData.email,
            formData.password
        );

        setIsLoading(false);

        if (error) {
            if (error.includes('Email not confirmed')) {
                setErrors({ email: 'Please verify your email before signing in. Check your inbox for the verification link.' });
            } else if (error.includes('Invalid login credentials')) {
                setErrors({ email: 'Invalid email or password. Please try again.' });
            } else {
                setErrors({ email: error });
            }
            return;
        }

        const userData = {
            id: user.id,
            email: user.email,
            createdAt: user.created_at
        };
        onSignInSuccess(userData);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setErrors({});

        const { error } = await authService.signInWithGoogle();

        if (error) {
            setIsLoading(false);
            setErrors({ email: error });
        }
    };

    const handleResetPassword = async () => {
        if (!resetEmail) {
            setResetMessage('Please enter your email address');
            return;
        }

        setIsLoading(true);
        const { error } = await authService.resetPassword(resetEmail);
        setIsLoading(false);

        if (error) {
            setResetMessage(error);
        } else {
            setResetMessage('Password reset email sent! Check your inbox.');
            setTimeout(() => {
                setShowResetPassword(false);
                setResetMessage('');
                setResetEmail('');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 flex justify-center items-start sm:items-center py-6 sm:py-10 p-4 overflow-y-auto relative">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-[60] w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl active:scale-90"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Realistic Corporate Office Environment Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none select-none bg-slate-900 backdrop-blur-[4px]">
                {/* Office Ceiling with Lighting System */}
                <div className="absolute top-0 inset-x-0 h-[12%] bg-slate-300 border-b-2 border-slate-400/50 z-20">
                    <div className="absolute inset-0 grid grid-cols-4 gap-12 px-20 py-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-full bg-white rounded-sm shadow-[0_0_40px_rgba(255,255,255,0.7),inset_0_2px_5px_rgba(0,0,0,0.05)] border border-white/40 flex items-center justify-center">
                                <div className="w-[85%] h-[1px] bg-slate-100"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Office Walls with Professional Paneling */}
                <div className="absolute inset-x-0 top-[12%] bottom-[20%] bg-[#0f172a] flex opacity-80">
                    <div className="w-1/2 h-full border-r border-slate-200/40"></div>
                    <div className="w-1/2 h-full"></div>
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/5 to-transparent"></div>
                </div>

                {/* Wall Mounted AC Unit */}
                <div className="absolute top-[15%] right-[10%] w-48 h-12 bg-white rounded-sm border-2 border-slate-100 shadow-md z-30 opacity-60">
                    <div className="absolute top-1 left-2 text-[4px] font-bold text-slate-300 uppercase">SYSTEM-COOL V3</div>
                    <div className="absolute bottom-2 inset-x-3 h-3 border-t border-slate-50 flex flex-col gap-0.5 pt-0.5">
                        <div className="w-full h-[1px] bg-slate-50"></div>
                        <div className="w-full h-[1px] bg-slate-50"></div>
                    </div>
                </div>

                {/* Tiled Office Floor with Reflection */}
                <div className="absolute bottom-0 inset-x-0 h-[20%] bg-slate-400 overflow-hidden border-t-2 border-slate-500/10">
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-3 opacity-5">
                        {[...Array(36)].map((_, i) => (
                            <div key={i} className="border border-white/40"></div>
                        ))}
                    </div>
                    <div className="absolute left-[5%] inset-y-0 w-[40%] bg-gradient-to-r from-white/10 via-white/5 to-transparent skew-x-[25deg]"></div>
                </div>

                {/* Office Window - City Skyline View */}
                <div className="absolute top-[22%] left-[5%] w-[40%] h-[40%] rounded-xl border-[8px] border-slate-800 shadow-2xl overflow-hidden bg-black z-10 opacity-70">
                    <div className="absolute inset-0 bg-[#020617]"></div>
                    <div className="absolute bottom-0 inset-x-0 h-full flex items-end justify-between px-8 gap-3">
                        {[
                            { h: '85%', w: '18%', c: 'bg-slate-900', win: 14 },
                            { h: '95%', w: '15%', c: 'bg-slate-950', win: 18 },
                            { h: '70%', w: '22%', c: 'bg-[#0f172a]', win: 10 },
                            { h: '80%', w: '14%', c: 'bg-slate-900', win: 12 }
                        ].map((b, i) => (
                            <div key={i} className={`${b.w} ${b.c} relative border-x border-white/5`} style={{ height: b.h }}>
                                <div className="absolute top-4 inset-x-2 bottom-0 grid grid-cols-2 gap-1 opacity-50">
                                    {[...Array(b.win)].map((_, j) => (
                                        <div key={j} className={`h-1.5 rounded-[0.5px] ${Math.random() > 0.7 ? 'bg-yellow-100/60 shadow-[0_0_3px_rgba(254,240,138,0.3)]' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                                <div className="absolute -top-1 w-1 h-1 bg-red-500 animate-pulse rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Focus Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-[40]"></div>
            </div>

            {/* Main Interactive Login Form UI */}
            <div className="relative z-[50] w-full max-w-lg lg:max-w-xl animate-scale-in">
                {/* Official Paper Sheet Aesthetic */}
                <div className="bg-[#fcfcfa] rounded-sm shadow-[0_25px_60px_-5px_rgba(0,0,0,0.5),_0_0_20px_rgba(0,0,0,0.1)] border border-slate-200 px-8 py-6 md:px-12 md:py-8 relative overflow-hidden group rotate-[0.1deg]">
                    {/* Printed Form Header Decoration */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600"></div>
                    <div className="absolute top-4 right-6 text-[8px] font-mono text-slate-400 tracking-tighter uppercase font-bold">
                        Form: QPR-ACCESS-v4.2
                    </div>

                    {/* Official Letterhead */}
                    <div className="text-center mb-4 relative">
                        <div className="flex justify-between items-start mb-4 border-b-2 border-slate-100 pb-3">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm ring-4 ring-slate-50 rotate-[1deg] shrink-0">
                                <img
                                    src="/logo.svg"
                                    alt="Welcome Back"
                                    className="w-10 h-10 filter grayscale opacity-60"
                                />
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                                    Personnel Authentication
                                </h1>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">
                                    Strategic Access Portal
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 border-l-4 border-indigo-500 rounded-r-sm text-left">
                            <p className="text-slate-600 font-bold text-xs italic leading-relaxed">
                                "Verify identity to resume the life-saving mission protocols."
                            </p>
                        </div>
                    </div>

                    {/* Form Fields Styled as Paper Blanks */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Registered Email Identity
                                </label>
                                <span className="text-[7px] font-mono text-slate-300">AUTH-001</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 border-b-2 border-slate-200 rounded-t-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder-slate-300 text-sm ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && (
                                <p className="mt-0.5 text-[9px] font-black text-red-500 uppercase tracking-tight">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Security Credentials
                                </label>
                                <span className="text-[7px] font-mono text-slate-300">AUTH-002</span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 border-b-2 border-slate-200 rounded-t-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder-slate-300 text-sm ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-0.5 text-[9px] font-black text-red-500 uppercase tracking-tight">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowResetPassword(true)}
                                className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                            >
                                Request Reset
                            </button>
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.25em] text-[10px] shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 overflow-hidden"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>AUTHENTICATING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>AUTHORIZE ACCESS</span>
                                        <span className="text-xl">⤑</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Google Sign In */}
                    <div className="mt-4">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-[1px] flex-1 bg-slate-200"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
                            <div className="h-[1px] flex-1 bg-slate-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-[10px] rounded-sm transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Operative?</p>
                        <button
                            onClick={onSwitchToSignUp}
                            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-[9px] rounded-sm transition-all"
                        >
                            Enroll Now
                        </button>
                    </div>

                    <div className="mt-4 p-2 bg-teal-50 rounded-sm border border-teal-100">
                        <p className="text-center text-[9px] text-teal-700 font-black uppercase tracking-widest leading-relaxed">
                            Mission progress is active
                        </p>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-4 opacity-20">
                        <div className="h-[1px] flex-1 bg-slate-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        <div className="h-[1px] flex-1 bg-slate-400"></div>
                    </div>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showResetPassword && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Reset Password</h2>
                            <button
                                onClick={() => {
                                    setShowResetPassword(false);
                                    setResetMessage('');
                                    setResetEmail('');
                                }}
                                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {resetMessage && (
                            <div className={`mb-4 p-3 rounded-lg ${resetMessage.includes('sent') ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
                                <p className="text-sm font-medium">{resetMessage}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all"
                            />

                            <button
                                onClick={handleResetPassword}
                                disabled={isLoading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignInScreen;
