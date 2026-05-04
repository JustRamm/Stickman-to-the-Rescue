import React from 'react';

const SettingsOverlay = ({
    settings,
    setSettings,
    audioManager,
    onResetGame,
    onNavigate,
    isPaused,
    setIsPaused,
    isSettingsOpen,
    setIsSettingsOpen,
    gameState
}) => {

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (key === 'audioVolume') audioManager.setVolume(value);
        if (key === 'ttsEnabled') audioManager.toggleTTS(value);
    };

    return (
        <>
            {/* Top Left Action Bar - Back Button */}
            <div className="fixed top-4 md:top-6 left-4 md:left-6 z-[400] pointer-events-auto flex gap-3 items-center">
                {gameState === 'LEVEL_SELECT' && (
                    <button
                        onClick={() => onNavigate('START')}
                        className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20 shadow-lg transition-all border border-white/20 active:scale-90"
                        title="Back to Start"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Top Right Action Bar - Settings */}
            <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[400] pointer-events-auto flex gap-3 items-center">
                {/* Settings Button */}
                <button
                    onClick={() => { audioManager.init(); setIsSettingsOpen(true); }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-900/80 backdrop-blur-md rounded-xl flex items-center justify-center text-teal-400 hover:text-teal-300 shadow-xl transition-all border border-teal-500/30 group relative active:scale-90"
                    title="Settings"
                >
                    <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={() => setIsSettingsOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border-4 border-white/20">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Settings</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjust your experience</p>
                            </div>
                            <button onClick={() => setIsSettingsOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Volume Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Audio Volume</label>
                                    <span className="text-sm font-black text-teal-600">{Math.round(settings.audioVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={settings.audioVolume}
                                    onChange={(e) => handleSettingChange('audioVolume', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                            </div>

                            {/* Text Speed Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Text Speed</label>
                                    <span className="text-sm font-black text-teal-600">
                                        {settings.textSpeed === 0 ? 'Instant' : settings.textSpeed < 30 ? 'Fast' : settings.textSpeed < 70 ? 'Normal' : 'Slow'}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={settings.textSpeed}
                                    onChange={(e) => handleSettingChange('textSpeed', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                            </div>

                            {/* TTS Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-700 block">Voice Synthesis (TTS)</span>
                                    <span className="text-[10px] text-slate-400 font-medium italic">Narrate dialogue automatically</span>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('ttsEnabled', !settings.ttsEnabled)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${settings.ttsEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.ttsEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    onClick={onResetGame}
                                    className="w-full py-4 px-6 border-2 border-red-100 text-red-500 hover:bg-red-50 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Reset All Progress
                                </button>
                            </div>
                        </div>

                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stickman to the Rescue • v1.0</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsOverlay;
