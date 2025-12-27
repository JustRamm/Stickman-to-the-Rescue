import React, { useState } from 'react';

const SettingsOverlay = ({
    settings,
    setSettings,
    audioManager,
    onResetGame,
    isSettingsOpen,
    setIsSettingsOpen,
    onNavigate
}) => {

    return (
        <>
            {/* Top Right Action Bar */}
            <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[400] pointer-events-auto flex flex-col gap-4 items-end">
                {/* Main Settings Button */}
                <button
                    onClick={() => { audioManager.init(); setIsSettingsOpen(true); }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all border border-white/50 shadow-xl group"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                {/* Training Hub Island */}
                <div className="bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-[2rem] border border-white/10 flex flex-col md:flex-row gap-2 shadow-2xl items-center animate-slide-in-right">
                    <div className="hidden md:block px-3 border-r border-white/10 mr-1">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] vertical-text">Training</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Quiz Game */}
                        <button
                            onClick={() => { onResetGame && onResetGame(); onNavigate('QUIZ_MODE'); setIsSettingsOpen(false); }}
                            className="w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-teal-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg p-2.5 group relative"
                        >
                            <img src="/stickman_assets/scholar_stickman.svg" alt="Quiz" className="w-full h-full object-contain" />
                            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">Myth vs Fact</span>
                        </button>

                        {/* Referral Battle */}
                        <button
                            onClick={() => { onResetGame && onResetGame(); onNavigate('RESOURCE_RELAY'); setIsSettingsOpen(false); }}
                            className="w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-indigo-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg p-2.5 group relative"
                        >
                            <img src="/stickman_assets/shield_stickman.svg" alt="Referral" className="w-full h-full object-contain" />
                            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">Referral Battle</span>
                        </button>

                        {/* Catch Game */}
                        <button
                            onClick={() => { onResetGame && onResetGame(); onNavigate('VALIDATION_CATCH'); setIsSettingsOpen(false); }}
                            className="w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-teal-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg p-2 group relative"
                        >
                            <img src="/stickman_assets/catch_stickman.svg" alt="Validation Catch" className="w-full h-full object-contain" />
                            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">Validation Catch</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
                    <div className="relative w-full max-w-[280px] md:max-w-sm bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg md:text-xl font-black uppercase text-slate-800 tracking-tight">Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">✕</button>
                        </div>

                        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                            {/* Volume */}
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Master Volume</label>
                                    <span className="text-xs md:text-sm font-bold text-teal-600">{Math.round(settings.audioVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={settings.audioVolume}
                                    onChange={(e) => setSettings(s => ({ ...s, audioVolume: parseFloat(e.target.value) }))}
                                    className="w-full h-1.5 md:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                            </div>

                            {/* TTS Toggle */}
                            <div className="flex justify-between items-center group">
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 block group-hover:text-teal-600 transition-colors">Narrator (TTS)</label>
                                    <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">Read dialogue out loud</p>
                                </div>
                                <button
                                    onClick={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}
                                    className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-all relative ${settings.ttsEnabled ? 'bg-teal-500 shadow-lg shadow-teal-500/30' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-0.5 md:top-1 left-0.5 md:left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.ttsEnabled ? 'translate-x-5 md:translate-x-6' : ''}`} />
                                </button>
                            </div>

                            {/* Text Speed */}
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Text Flow Speed</label>
                                    <span className="text-xs md:text-sm font-bold text-teal-600">
                                        {settings.textSpeed === 0 ? 'Instant' : settings.textSpeed > 75 ? 'Relaxed' : settings.textSpeed > 30 ? 'Normal' : 'Rapid'}
                                    </span>
                                </div>
                                <div className="relative py-1 md:py-2">
                                    <input
                                        type="range" min="0" max="100" step="5"
                                        value={100 - settings.textSpeed}
                                        onChange={(e) => setSettings(s => ({ ...s, textSpeed: 100 - parseInt(e.target.value) }))}
                                        className="w-full h-1.5 md:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                    <div className="flex justify-between mt-1 md:mt-2 px-1">
                                        <span className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase">Slow</span>
                                        <span className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase">Fast</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="w-full py-4 md:py-5 bg-teal-600 text-white font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-teal-700 transition-colors shadow-inner"
                        >
                            Apply Changes
                        </button>
                    </div>
                </div>
            )}

        </>
    );
};

export default SettingsOverlay;
