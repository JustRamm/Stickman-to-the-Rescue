import React, { useState } from 'react';

const SettingsOverlay = ({
    settings,
    setSettings,
    audioManager,
    onResetGame,
    onNavigate,
    showMiniGames = false,
    isPaused,
    setIsPaused,
    isSettingsOpen,
    setIsSettingsOpen,
    gameState
}) => {
    const [isMiniGamesOpen, setIsMiniGamesOpen] = useState(false);

    return (
        <>
            {/* Top Right Action Bar */}
            <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[400] pointer-events-auto flex gap-3 items-center">
                {/* Mini Games Toggle Button - Controller Icon */}
                {gameState === 'LEVEL_SELECT' && (
                    <button
                        onClick={() => { audioManager.init(); setIsMiniGamesOpen(true); }}
                        className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400 hover:text-pink-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all border border-indigo-500/40 group relative overflow-hidden active:scale-90"
                        title="Training Mini-Games"
                    >
                        {/* Retro Grid Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(99,102,241,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:4px_4px]" />

                        {/* Glowing Aura */}
                        <div className="absolute inset-0 rounded-xl bg-indigo-500/5 group-hover:bg-pink-500/10 transition-colors" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />

                        <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Base Plate */}
                            <rect x="3" y="15" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                            {/* Stick */}
                            <path d="M12 15V8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            {/* Ball Top */}
                            <circle cx="12" cy="6" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="11" cy="5" r="1" fill="white" fillOpacity="0.6" />
                            {/* Buttons */}
                            <circle cx="18" cy="17.5" r="1" fill="currentColor" />
                            <circle cx="6" cy="17.5" r="1" fill="currentColor" />
                        </svg>
                    </button>
                )}

                {/* Main Settings Button */}
                <button
                    onClick={() => { audioManager.init(); setIsSettingsOpen(true); }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 shadow-xl transition-all border border-white/50 group"
                    title="Settings"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {/* Mini Games Selection Modal */}
            {isMiniGamesOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMiniGamesOpen(false)} />
                    <div className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] shadow-[0_0_50px_rgba(99,102,241,0.3)] overflow-hidden animate-scale-in border-4 border-indigo-500/50">
                        {/* Scanline Effect Layer */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-50" />

                        <div className="px-8 py-6 border-b border-indigo-500/20 flex justify-between items-center bg-indigo-950/30 relative z-10">
                            <div>
                                <h3 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-400 tracking-tighter leading-none italic drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">
                                    Training Hub
                                </h3>
                                <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Insert Credit: Skills Training
                                </p>
                            </div>
                            <button onClick={() => setIsMiniGamesOpen(false)} className="w-10 h-10 flex items-center justify-center text-indigo-300/50 hover:text-pink-400 hover:bg-pink-500/10 rounded-full transition-all border border-indigo-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            {[
                                { id: 'SIGNAL_SCOUT', name: 'Signal Scout', icon: '/stickman_assets/scout_stickman.svg', color: 'from-emerald-500/20 to-emerald-900/40 border-emerald-500/40 text-emerald-400', desc: 'Identify warning signs' },
                                { id: 'QUIZ_MODE', name: 'Myth vs Fact', icon: '/stickman_assets/scholar_stickman.svg', color: 'from-amber-500/20 to-amber-900/40 border-amber-500/40 text-amber-400', desc: 'Test your knowledge' },
                                { id: 'RESOURCE_RELAY', name: 'Referral Battle', icon: '/stickman_assets/shield_stickman.svg', color: 'from-indigo-500/20 to-indigo-900/40 border-indigo-500/40 text-indigo-400', desc: 'Master support links' },
                                { id: 'WORDS_OF_HOPE', name: 'Words of Hope', icon: '/stickman_assets/hope_stickman.svg', color: 'from-teal-500/20 to-teal-900/40 border-teal-500/40 text-teal-400', desc: 'End stigma language' }
                            ].map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => { onNavigate(game.id); setIsMiniGamesOpen(false); }}
                                    className={`flex flex-col items-center p-6 rounded-3xl border-2 bg-gradient-to-br transition-all group relative overflow-hidden ${game.color} hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className={`w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center mb-4 shadow-inner border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                        <img src={game.icon} alt={game.name} className={`w-10 h-10 object-contain drop-shadow-[0_0_5px_currentColor] ${game.id === 'WORDS_OF_HOPE' ? 'brightness-0 invert opacity-80' : ''}`} />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-tight mb-1 group-hover:skew-x-[-5deg] transition-transform">{game.name}</span>
                                    <span className="text-[9px] font-bold opacity-60 uppercase text-center leading-tight">{game.desc}</span>

                                    {/* Action Label */}
                                    <div className="mt-4 px-3 py-1 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        <span className="text-[8px] font-black tracking-widest uppercase">Start Game ➔</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Footer Decoration */}
                        <div className="px-8 py-4 bg-indigo-950/50 border-t border-indigo-500/20 flex justify-center text-[8px] font-black text-indigo-400/40 uppercase tracking-[0.5em]">
                            © 2024 QPR ARCADE SYSTEMS
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Settings Modal - Compact No-Scroll Version */}
            {
                isSettingsOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSettingsOpen(false)} />

                        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-white/20 flex flex-col max-h-[90vh]">
                            {/* Compact Header */}
                            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight leading-none">Settings</h3>
                                </div>
                                <button onClick={() => setIsSettingsOpen(false)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">

                                {/* Section: Audio & Narration */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-px bg-slate-300"></span>
                                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Audio & Narration</h4>
                                    </div>

                                    <div className="flex gap-3">
                                        {/* Volume Compact */}
                                        <div className="flex-1 bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Volume</label>
                                                <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 rounded-full">{Math.round(settings.audioVolume * 100)}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="1" step="0.01"
                                                value={settings.audioVolume}
                                                onChange={(e) => setSettings(s => ({ ...s, audioVolume: parseFloat(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                                            />
                                        </div>

                                        {/* TTS Toggle Compact */}
                                        <div className="flex flex-col justify-between items-start w-28 p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm group hover:border-teal-200 transition-colors cursor-pointer" onClick={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-teal-700 transition-colors pointer-events-none">Narrator</label>
                                            <div className="flex justify-between items-center w-full mt-1">
                                                <span className="text-[8px] text-slate-400 font-medium pointer-events-none">{settings.ttsEnabled ? 'On' : 'Off'}</span>
                                                <div className={`w-8 h-4 rounded-full transition-all relative ${settings.ttsEnabled ? 'bg-teal-500' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.ttsEnabled ? 'translate-x-4' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Game Control */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-px bg-slate-300"></span>
                                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Game Control</h4>
                                    </div>


                                </div>

                                {/* Section: Gameplay Flow */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-px bg-slate-300"></span>
                                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Gameplay Speed</h4>
                                    </div>

                                    <div className="p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-end mb-1">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Text Flow</label>
                                            <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded-full">
                                                {settings.textSpeed === 0 ? 'Instant' : settings.textSpeed > 75 ? 'Relaxed' : settings.textSpeed > 30 ? 'Normal' : 'Rapid'}
                                            </span>
                                        </div>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={100 - settings.textSpeed}
                                            onChange={(e) => setSettings(s => ({ ...s, textSpeed: 100 - parseInt(e.target.value) }))}
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Section: System */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-px bg-slate-300"></span>
                                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">System</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Developer Mode */}
                                        <div
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
                                            className={`flex flex-col p-2.5 rounded-lg border transition-all cursor-pointer ${settings.devMode ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <label className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${settings.devMode ? 'text-indigo-700' : 'text-slate-500'}`}>Dev Mode</label>
                                                <div className={`w-6 h-3.5 rounded-full transition-all relative ${settings.devMode ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.devMode ? 'translate-x-2.5' : ''}`} />
                                                </div>
                                            </div>
                                            <p className="text-[7px] text-slate-400 font-medium leading-tight">Unlock all scenarios</p>
                                        </div>

                                        {/* Reset Progress */}
                                        <button
                                            onClick={() => { onResetGame && onResetGame(); setIsSettingsOpen(false); }}
                                            className="w-full p-2.5 border border-red-100 bg-red-50/50 text-red-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <div className="flex items-center gap-1">
                                                <svg className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                <span>Reset</span>
                                            </div>
                                            <span className="text-[7px] opacity-70 font-bold">Clear Progress</span>
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Compact Footer */}
                            <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0">
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-full py-2.5 bg-teal-600 text-white font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-teal-700 transition-colors shadow-md active:scale-[0.98]"
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    );
};

export default SettingsOverlay;
