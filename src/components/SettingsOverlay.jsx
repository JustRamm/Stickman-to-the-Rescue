import React, { useState } from 'react';

const SettingsOverlay = ({
    settings,
    setSettings,
    audioManager,
    onResetGame,
    onLogout,
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

                {/* Profile Button */}
                {gameState === 'LEVEL_SELECT' && (
                    <button
                        onClick={() => { audioManager.init(); onNavigate('PROFILE'); }}
                        className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 shadow-xl transition-all border border-white/50 group"
                        title="Your Profile"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                )}
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

        </>
    );
};

export default SettingsOverlay;
