import React, { useState } from 'react';

const SignInScreen = ({ onSignInSuccess, onSwitchToSignUp }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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

        // Simulate API call
        setTimeout(() => {
            // Check if user exists in localStorage
            const storedUser = localStorage.getItem('qpr_user');

            if (storedUser) {
                const userData = JSON.parse(storedUser);
                localStorage.setItem('qpr_auth_token', 'demo_token_' + Date.now());
                setIsLoading(false);
                onSignInSuccess(userData);
            } else {
                setIsLoading(false);
                setErrors({ email: 'Account not found. Please sign up first.' });
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[15%] left-[10%] w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

                {/* Floating Stickman Characters */}
                <img
                    src="/stickman_assets/thinking_stickman.svg"
                    alt=""
                    className="absolute top-[10%] left-[15%] w-16 h-16 opacity-10 animate-float-slow"
                />
                <img
                    src="/stickman_assets/stickman_hands.svg"
                    alt=""
                    className="absolute bottom-[25%] right-[12%] w-20 h-20 opacity-10 animate-float-slow"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md animate-scale-in">
                {/* Welcome Badge */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                        <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-[2rem] p-6 shadow-2xl">
                            <img
                                src="/stickman_assets/guy_idle.svg"
                                alt="Welcome Back"
                                className="w-20 h-20"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-2 border-white/50 p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-800 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Continue your QPR training journey
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-slate-200 bg-white'
                                        } focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800`}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs font-bold text-red-500">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-slate-200 bg-white'
                                        } focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800`}
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs font-bold text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <span>Continue Training</span>
                                    <span className="text-xl">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">New Here?</span>
                        </div>
                    </div>

                    {/* Switch to Sign Up */}
                    <button
                        onClick={onSwitchToSignUp}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                        Create Account
                    </button>

                    {/* Footer Note */}
                    <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
                        <p className="text-center text-xs text-teal-700 font-bold leading-relaxed">
                            Your progress is saved and ready to continue
                        </p>
                    </div>
                </div>

                {/* Bottom Decoration */}
                <div className="mt-6 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500/30"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500/10"></div>
                </div>
            </div>
        </div>
    );
};

export default SignInScreen;
