import React, { useState } from 'react';

const SignUpScreen = ({ onSignUpSuccess, onSwitchToSignIn, onBack }) => {
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
        <div className="min-h-screen w-full bg-slate-900 flex justify-center items-start sm:items-center py-6 sm:py-10 p-4 overflow-y-auto relative">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-[60] w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl active:scale-90"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Realistic Corporate Office Room Environment */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none select-none bg-slate-200">
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

                {/* Office Walls with Professional Texture */}
                <div className="absolute inset-x-0 top-[12%] bottom-[20%] bg-[#f8fafc] flex">
                    <div className="w-1/3 h-full border-r border-slate-200/50"></div>
                    <div className="w-1/3 h-full border-r border-slate-200/50"></div>
                    <div className="w-1/3 h-full"></div>
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/5 to-transparent"></div>
                </div>

                {/* Wall Mounted AC Unit */}
                <div className="absolute top-[15%] left-[6%] w-48 h-12 bg-white rounded-sm border-2 border-slate-100 shadow-md z-30">
                    <div className="absolute top-1 left-2 text-[4px] font-bold text-slate-300 uppercase">OFFICE-CHILL 2.0</div>
                    <div className="absolute bottom-2 inset-x-3 h-3 border-t border-slate-50 flex flex-col gap-0.5 pt-0.5">
                        <div className="w-full h-[1px] bg-slate-50"></div>
                        <div className="w-full h-[1px] bg-slate-50"></div>
                    </div>
                    <div className="absolute bottom-2 right-3 flex items-center gap-1">
                        <div className="w-0.5 h-0.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    </div>
                </div>

                {/* Tiled Office Floor with Window Reflection */}
                <div className="absolute bottom-0 inset-x-0 h-[20%] bg-slate-400 overflow-hidden border-t-2 border-slate-500/10">
                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-2 opacity-5">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="border border-white/40"></div>
                        ))}
                    </div>
                    <div className="absolute right-[10%] inset-y-0 w-[40%] bg-gradient-to-l from-white/10 via-white/5 to-transparent skew-x-[-30deg]"></div>
                </div>

                {/* Panoramic Window with Night City View */}
                <div className="absolute top-[22%] right-[5%] w-[40%] h-[40%] rounded-xl border-[8px] border-slate-800 shadow-2xl overflow-hidden bg-black z-10">
                    <div className="absolute inset-0 bg-[#020617]"></div>
                    <div className="absolute bottom-0 inset-x-0 h-full flex items-end justify-between px-6 gap-2">
                        {[
                            { h: '90%', w: '16%', c: 'bg-slate-900', win: 12 },
                            { h: '75%', w: '20%', c: 'bg-[#0f172a]', win: 10 },
                            { h: '88%', w: '14%', c: 'bg-slate-950', win: 14 },
                            { h: '65%', w: '18%', c: 'bg-slate-900', win: 8 },
                            { h: '82%', w: '15%', c: 'bg-slate-950', win: 11 }
                        ].map((b, i) => (
                            <div key={i} className={`${b.w} ${b.c} relative border-x border-white/5`} style={{ height: b.h }}>
                                <div className="absolute top-4 inset-x-2 bottom-0 grid grid-cols-2 gap-1 opacity-50">
                                    {[...Array(b.win)].map((_, j) => (
                                        <div key={j} className={`h-1.5 rounded-[0.5px] ${Math.random() > 0.7 ? 'bg-yellow-100/60 shadow-[0_0_3px_rgba(254,240,138,0.3)]' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                                <div className="absolute -top-1 left-1.2 w-1 h-1 bg-red-500 animate-pulse rounded-full shadow-[0_0_4px_red]"></div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#020617] to-transparent"></div>
                </div>

                {/* Desk Corner Visual Anchor */}
                <div className="absolute bottom-[-8%] left-[4%] w-[35%] h-[20%] bg-[#211710] rounded-t-[2.5rem] shadow-[0_-15px_60px_rgba(0,0,0,0.7)] border-t border-white/5 z-30">
                    <div className="w-full h-full bg-gradient-to-b from-white/5 via-transparent to-black/70 rounded-t-[2.5rem]"></div>
                </div>
            </div>

            {/* Main Interactive Enrollment Form UI */}
            <div className="relative z-[50] w-full max-w-lg lg:max-w-xl animate-scale-in">
                {/* Official Paper Sheet Aesthetic */}
                <div className="bg-[#fcfcfa] rounded-sm shadow-[0_25px_60px_-5px_rgba(0,0,0,0.5),_0_0_20px_rgba(0,0,0,0.1)] border border-slate-200 p-8 md:p-12 relative overflow-hidden group rotate-[-0.1deg]">
                    {/* Printed Form Header Decoration */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-teal-600"></div>
                    <div className="absolute top-4 right-6 text-[8px] font-mono text-slate-400 tracking-tighter uppercase font-bold">
                        Form: QPR-ENROLL-v2.1
                    </div>

                    {/* Official Letterhead */}
                    <div className="text-center mb-6 relative">
                        <div className="flex justify-between items-start mb-6 border-b-2 border-slate-100 pb-4">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm ring-4 ring-slate-50 rotate-[-1deg] shrink-0">
                                <img
                                    src="/logo.svg"
                                    alt="QPR Logo"
                                    className="w-10 h-10 filter grayscale opacity-60"
                                />
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                                    Personnel<br />Registration
                                </h1>
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mt-2">
                                    Official Enrollment Center
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 border-l-4 border-teal-500 rounded-r-sm text-left">
                            <p className="text-slate-600 font-bold text-xs italic leading-relaxed">
                                "Saving a life begins with your signature. Please complete the following credentials to authorize your participation."
                            </p>
                        </div>
                    </div>

                    {/* Form Fields Styled as Paper Blanks */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Primary Email Identity
                                </label>
                                <span className="text-[7px] font-mono text-slate-300">REQ-001</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 rounded-t-sm focus:border-teal-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder-slate-300 text-sm ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                                placeholder="Enter professional email..."
                            />
                            {errors.email && (
                                <p className="mt-0.5 text-[9px] font-black text-red-500 uppercase tracking-tight">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Security Credentials
                                </label>
                                <span className="text-[7px] font-mono text-slate-300">REQ-002</span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 rounded-t-sm focus:border-teal-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder-slate-300 text-sm ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-0.5 text-[9px] font-black text-red-500 uppercase tracking-tight">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Verify Security Key
                                </label>
                                <span className="text-[7px] font-mono text-slate-300">REQ-003</span>
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 rounded-t-sm focus:border-teal-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder-slate-300 text-sm ${errors.confirmPassword ? 'border-red-500 bg-red-50' : ''}`}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-0.5 text-[9px] font-black text-red-500 uppercase tracking-tight">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-[0.25em] text-xs shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>PROCESSING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>AUTHORIZE REGISTRATION</span>
                                        <span className="text-xl">⤑</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Already an active operative?</p>
                        <button
                            onClick={onSwitchToSignIn}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-sm transition-all"
                        >
                            Log in to Operative Portal
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-4 opacity-20">
                        <div className="h-[1px] flex-1 bg-slate-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        <div className="h-[1px] flex-1 bg-slate-400"></div>
                    </div>
                    <p className="mt-4 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        © 2024 QPR GLOBAL • CONFIDENTIAL DOCUMENT
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpScreen;
