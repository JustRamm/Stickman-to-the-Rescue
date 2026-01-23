import React, { useState } from 'react';

const SignUpScreen = ({ onSignUpSuccess, onSwitchToSignIn }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            // Store user data in localStorage (in production, this would be a backend call)
            const userData = {
                email: formData.email,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('qpr_user', JSON.stringify(userData));
            localStorage.setItem('qpr_auth_token', 'demo_token_' + Date.now());

            setIsLoading(false);
            onSignUpSuccess(userData);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* QPR Office Interior Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-slate-800/80 to-transparent"></div>

                {/* Back Wall */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800/60 to-slate-900/40"></div>

                {/* Window with City View */}
                <div className="absolute top-[10%] right-[5%] w-[35%] h-[40%] bg-gradient-to-br from-teal-900/30 to-indigo-900/30 rounded-lg border-4 border-slate-700/50 overflow-hidden">
                    {/* Window panes */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-2">
                        <div className="bg-teal-500/10 rounded"></div>
                        <div className="bg-teal-500/10 rounded"></div>
                        <div className="bg-indigo-500/10 rounded"></div>
                        <div className="bg-indigo-500/10 rounded"></div>
                    </div>
                    {/* City lights outside */}
                    <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-yellow-400/40 rounded-full blur-sm"></div>
                    <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-yellow-400/30 rounded-full blur-sm"></div>
                    <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-yellow-400/35 rounded-full blur-sm"></div>
                </div>

                {/* Desk on the left */}
                <div className="absolute bottom-[15%] left-[8%] w-[25%] h-[20%]">
                    {/* Desk surface */}
                    <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-b from-slate-600/40 to-slate-700/40 rounded-t-lg border-2 border-slate-600/30"></div>
                    {/* Desk legs */}
                    <div className="absolute bottom-0 left-[10%] w-[8%] h-[70%] bg-slate-700/40"></div>
                    <div className="absolute bottom-0 right-[10%] w-[8%] h-[70%] bg-slate-700/40"></div>
                    {/* Laptop on desk */}
                    <div className="absolute bottom-[30%] left-[30%] w-[40%] h-[25%] bg-slate-600/50 rounded-sm border border-slate-500/40">
                        <div className="w-full h-[60%] bg-teal-500/20 rounded-sm"></div>
                    </div>
                </div>

                {/* Bookshelf on the right */}
                <div className="absolute bottom-[15%] right-[8%] w-[20%] h-[35%] bg-slate-700/30 rounded border-2 border-slate-600/30">
                    {/* Shelves */}
                    <div className="absolute top-[25%] left-0 right-0 h-[2px] bg-slate-600/40"></div>
                    <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-slate-600/40"></div>
                    <div className="absolute top-[75%] left-0 right-0 h-[2px] bg-slate-600/40"></div>
                    {/* Books */}
                    <div className="absolute top-[10%] left-[10%] w-[15%] h-[12%] bg-teal-600/40 rounded-sm"></div>
                    <div className="absolute top-[10%] left-[30%] w-[12%] h-[12%] bg-indigo-600/40 rounded-sm"></div>
                    <div className="absolute top-[35%] left-[15%] w-[18%] h-[12%] bg-slate-500/40 rounded-sm"></div>
                    <div className="absolute top-[60%] left-[20%] w-[20%] h-[12%] bg-teal-500/40 rounded-sm"></div>
                </div>

                {/* Office Plant */}
                <div className="absolute bottom-[15%] left-[38%] w-[8%] h-[25%]">
                    {/* Pot */}
                    <div className="absolute bottom-0 left-[20%] w-[60%] h-[30%] bg-slate-600/40 rounded-b-lg border-2 border-slate-500/30"></div>
                    {/* Plant leaves */}
                    <div className="absolute bottom-[25%] left-[10%] w-[30%] h-[40%] bg-green-600/30 rounded-full blur-sm"></div>
                    <div className="absolute bottom-[30%] right-[10%] w-[35%] h-[45%] bg-green-500/30 rounded-full blur-sm"></div>
                    <div className="absolute bottom-[40%] left-[25%] w-[40%] h-[35%] bg-green-600/40 rounded-full blur-sm"></div>
                </div>

                {/* Ceiling Light */}
                <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[15%] h-[8%]">
                    <div className="w-full h-full bg-yellow-200/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[40%] bg-slate-600/40 rounded-full border-2 border-slate-500/30"></div>
                </div>

                {/* Wall Poster - QPR Method */}
                <div className="absolute top-[20%] left-[10%] w-[15%] h-[20%] bg-slate-700/40 rounded border-2 border-slate-600/40 p-2">
                    <div className="text-teal-400/40 text-[8px] font-black text-center">QPR</div>
                    <div className="mt-1 space-y-1">
                        <div className="h-1 bg-teal-500/20 rounded"></div>
                        <div className="h-1 bg-teal-500/20 rounded"></div>
                        <div className="h-1 bg-teal-500/20 rounded"></div>
                    </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md animate-scale-in">
                {/* QPR Badge */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full"></div>
                        <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-[2rem] p-6 shadow-2xl">
                            <img
                                src="/stickman_assets/shield_stickman.svg"
                                alt="QPR Training"
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
                            Join the Mission
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Start your QPR training journey today
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
                                        } focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-800`}
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
                                        } focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-800`}
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs font-bold text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.confirmPassword
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-slate-200 bg-white'
                                        } focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-800`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs font-bold text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <span>Start Training</span>
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
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Already Registered?</span>
                        </div>
                    </div>

                    {/* Switch to Sign In */}
                    <button
                        onClick={onSwitchToSignIn}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                        Sign In Instead
                    </button>

                    {/* Footer Note */}
                    <p className="mt-6 text-center text-xs text-slate-400 font-medium leading-relaxed">
                        By signing up, you agree to help save lives through QPR training
                    </p>
                </div>

                {/* Bottom Decoration */}
                <div className="mt-6 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-500/30"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-500/10"></div>
                </div>
            </div>
        </div>
    );
};

export default SignUpScreen;
