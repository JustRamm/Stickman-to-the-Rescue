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
            <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[400] pointer-events-auto flex flex-col gap-3 items-end">
                {/* Main Settings Button */}
                <button
                    onClick={() => { audioManager.init(); setIsSettingsOpen(true); }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 shadow-xl transition-all border border-white/50 group"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                {/* Minimal Training Icons Row */}
                <div className="flex gap-2.5">
                    {/* Quiz Game */}
                    <button
                        onClick={() => { onResetGame && onResetGame(); onNavigate('QUIZ_MODE'); setIsSettingsOpen(false); }}
                        className="w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-teal-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg p-2.5 group relative"
                    >
                        <img src="/stickman_assets/scholar_stickman.svg" alt="Quiz" className="w-full h-full object-contain" />
                        <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest shadow-xl">Myth vs Fact</span>
                    </button>

                    {/* Referral Battle */}
                    <button
                        onClick={() => { onResetGame && onResetGame(); onNavigate('RESOURCE_RELAY'); setIsSettingsOpen(false); }}
                        className="w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-indigo-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg p-2.5 group relative"
                    >
                        <img src="/stickman_assets/shield_stickman.svg" alt="Referral" className="w-full h-full object-contain" />
                        <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest shadow-xl">Referral Battle</span>
                    </button>

                    {/* Catch Game */}
                    <button
                        onClick={() => { onResetGame && onResetGame(); onNavigate('VALIDATION_CATCH'); setIsSettingsOpen(false); }}
                        className="w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-teal-50 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg p-2.5 group relative"
                    >
                        <img src="/stickman_assets/catch_stickman.svg" alt="Validation Catch" className="w-full h-full object-contain" />
                        <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest shadow-xl">Validation Catch</span>
                    </button>
                </div>
            </div>

            {/* Enhanced Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSettingsOpen(false)} />

                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-white/20">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight">Settings</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferences & System</span>
                            </div>
                            <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* Section: Audio & Narration */}
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <span className="w-4 h-px bg-slate-300"></span> Audio & Narration
                                </h4>

                                {/* Volume */}
                                <div className="space-y-3 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Master Volume</label>
                                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{Math.round(settings.audioVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={settings.audioVolume}
                                        onChange={(e) => setSettings(s => ({ ...s, audioVolume: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                                    />
                                </div>

                                {/* TTS Toggle */}
                                <div className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-teal-200 transition-colors">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-teal-700 transition-colors">Narrator (TTS)</label>
                                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">Read dialogue out loud</span>
                                    </div>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}
                                        className={`w-11 h-6 rounded-full transition-all relative ${settings.ttsEnabled ? 'bg-teal-500 shadow-inner' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.ttsEnabled ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Section: Gameplay Flow */}
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <span className="w-4 h-px bg-slate-300"></span> Gameplay Flow
                                </h4>

                                <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Text Speed</label>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {settings.textSpeed === 0 ? 'Instant' : settings.textSpeed > 75 ? 'Relaxed' : settings.textSpeed > 30 ? 'Normal' : 'Rapid'}
                                        </span>
                                    </div>
                                    <div className="relative py-1">
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={100 - settings.textSpeed}
                                            onChange={(e) => setSettings(s => ({ ...s, textSpeed: 100 - parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                        />
                                        <div className="flex justify-between mt-2 px-1">
                                            <span className="text-[8px] font-bold text-slate-300 uppercase">Slow</span>
                                            <span className="text-[8px] font-bold text-slate-300 uppercase">Fast</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: System */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <span className="w-4 h-px bg-slate-300"></span> System & Data
                                </h4>

                                <div className="space-y-3">
                                    {/* Developer Mode */}
                                    <div className={`flex justify-between items-center p-4 rounded-xl border transition-all ${settings.devMode ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                                        <div>
                                            <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${settings.devMode ? 'text-indigo-700' : 'text-slate-500'}`}>Dev Mode</label>
                                            <p className="text-[8px] text-slate-400 font-medium mt-0.5">Unlock all scenarios</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (settings.devMode) {
                                                    setSettings(s => ({ ...s, devMode: false }));
                                                } else {
                                                    const password = prompt("Enter Developer Credentials:");
                                                    if (password === "lillyasdaisy") {
                                                        setSettings(s => ({ ...s, devMode: true }));
                                                        if (audioManager) audioManager.playDing();
                                                    } else if (password !== null) {
                                                        if (audioManager) audioManager.playSad();
                                                        alert("Access Denied");
                                                    }
                                                }
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all relative ${settings.devMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.devMode ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Reset Progress */}
                                    <button
                                        onClick={() => { onResetGame && onResetGame(); setIsSettingsOpen(false); }}
                                        className="w-full py-3 border-2 border-red-100 text-red-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Reset Mission Progress
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full py-4 bg-teal-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 active:scale-[0.98] transform"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default SettingsOverlay;
