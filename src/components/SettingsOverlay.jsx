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
            {/* Settings Button (Top Right) */}
            <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[400] pointer-events-auto flex flex-col gap-3 items-end">
                <button
                    onClick={() => { audioManager.init(); setIsSettingsOpen(true); }}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 hover:shadow-lg transition-all border border-white/50 shadow-sm"
                >
                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                <button
                    onClick={() => { onResetGame && onResetGame(); onNavigate('QUIZ_MODE'); setIsSettingsOpen(false); }}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 hover:shadow-lg transition-all border border-white/50 shadow-sm p-1"
                    title="Play Myth vs Fact"
                >
                    <img src="/stickman_assets/scholar_stickman.svg" alt="Quiz" className="w-full h-full object-contain" />
                </button>
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
