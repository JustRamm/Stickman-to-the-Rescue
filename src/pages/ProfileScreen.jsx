import React, { useState, useEffect } from 'react';
import { dbService } from '../utils/dbService';
import { MISSIONS } from '../data/missions';
import { authService } from '../utils/authService';

// Custom Scenery Component for the Profile Header
const ProfileScenery = ({ playerGender, devMode = false }) => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#1e1b4b]">
            {/* Dawn Sky Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-1000 ${devMode ? 'from-indigo-950 via-purple-950 to-indigo-900 border-b-4 border-purple-500/30' : 'from-[#0f172a] via-[#1e1b4b] to-[#312e81]'}`} />

            {/* Distant Sun Glow */}
            <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] blur-[120px] rounded-full transition-colors duration-1000 ${devMode ? 'bg-purple-500/30' : 'bg-teal-500/20'}`} />

            {/* Mountain Range Layer 1 (Far) */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] opacity-30">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,200 L0,150 L150,80 L300,160 L500,40 L700,130 L850,70 L1000,150 L1000,200 Z" fill={devMode ? "#6b21a8" : "#4338ca"} />
                </svg>
            </div>

            {/* Mountain Range Layer 2 (Middle) */}
            <div className="absolute bottom-[-10px] left-0 right-0 h-[45%] opacity-50">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,200 L0,170 L200,100 L400,180 L600,60 L800,150 L1000,170 L1000,200 Z" fill={devMode ? "#581c87" : "#3730a3"} />
                </svg>
            </div>

            {/* HQ Architecture (The Balcony/Ledge) */}
            <div className={`absolute bottom-0 inset-x-0 h-4 bg-white/10 backdrop-blur-sm border-t ${devMode ? 'border-purple-500/40 shadow-[0_0_20px_purple]' : 'border-white/20'}`} />
            <div className={`absolute bottom-0 left-[10%] w-[15%] h-32 bg-white/5 border-x border-t rounded-t-3xl backdrop-blur-sm transition-colors ${devMode ? 'border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-white/10'}`} />
            <div className={`absolute bottom-0 right-[20%] w-[10%] h-48 bg-white/5 border-x border-t rounded-t-3xl backdrop-blur-sm transition-colors ${devMode ? 'border-purple-500/30' : 'border-white/10'}`} />

            {/* Floating "Digital" Particles */}
            {[...Array(devMode ? 24 : 12)].map((_, i) => (
                <div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full animate-pulse shadow-[0_0_8px_currentColor] transition-colors ${devMode ? 'bg-purple-400 text-purple-400' : 'bg-teal-400 text-teal-400'}`}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 80}%`,
                        animationDuration: `${2 + Math.random() * 4}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: 0.3 + Math.random() * 0.4
                    }}
                />
            ))}

            {/* Scanning Light Sweep */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_8s_infinite] skew-x-[-20deg] ${devMode ? 'opacity-20' : 'opacity-10'}`} />
        </div>
    );
};

const ProfileScreen = ({
    currentUser,
    playerName,
    playerGender,
    completedLevels,
    onNavigate,
    onLogout,
    audioManager,
    settings,
    setSettings,
    onResetGame,
    onAdminUnlockAll
}) => {
    const [stats, setStats] = useState(null);
    const [bestScores, setBestScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('progress'); // progress, settings, about, admin (if dev)
    const [forcedTrust, setForcedTrust] = useState(50);
    const [adminLogs, setAdminLogs] = useState([
        { time: 0.00, msg: "SYNC_START: CORE_INIT_OK", type: "dim" },
        { time: 0.05, msg: "AUTH_VERIFY: SESSION_VALID", type: "dim" }
    ]);

    const isDev = settings?.devMode;

    useEffect(() => {
        const loadData = async () => {
            if (currentUser?.id) {
                const { stats: userStats } = await dbService.getUserStats(currentUser.id);
                const { bestScores: scores } = await dbService.getBestScores(currentUser.id);
                setStats(userStats);
                setBestScores(scores);
            }
            setLoading(false);
        };
        loadData();
    }, [currentUser]);

    const addLog = (msg, type = "normal") => {
        const time = (performance.now() / 1000).toFixed(2);
        setAdminLogs(prev => [...prev.slice(-15), { time, msg, type }]);
    };

    const handleChangePassword = async () => {
        const email = currentUser?.email;
        if (email) {
            const { error } = await authService.resetPassword(email);
            if (error) {
                alert('Error sending reset email: ' + error);
            } else {
                alert('Password reset email sent to ' + email);
            }
        }
    };

    const handleSndTest = () => {
        audioManager.init();
        audioManager.playDing();
        addLog("AUDIO_HANDLER: TRIGGER_DING (SUCCESS)", "success");
    };

    const handleExportLogs = () => {
        const data = {
            user: currentUser,
            stats,
            scores: bestScores,
            completedLevels,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qpr_debug_${playerName}.json`;
        a.click();
        addLog("FS_BRIDGE: EXPORT_JSON_COMPLETE", "success");
    };

    const handleInstaWin = () => {
        onAdminUnlockAll();
        addLog("SYSTEM_OVERRIDE: INJECT_WIN_STATE", "warning");
        audioManager.playSuccess();
    };

    const miniGames = [
        { id: 'quiz', name: 'Myth vs Fact', icon: '/stickman_assets/scholar_stickman.svg' },
        { id: 'signal_scout', name: 'Signal Scout', icon: '/stickman_assets/scout_stickman.svg' },
        { id: 'resource_relay', name: 'Referral Battle', icon: '/stickman_assets/shield_stickman.svg' },
        { id: 'words_of_hope', name: 'Words of Hope', icon: '/stickman_assets/hope_stickman.svg' }
    ];

    const tabs = [
        { id: 'progress', label: 'My Progress', icon: '⭐️' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'about', label: 'About QPR', icon: 'ℹ️' }
    ];

    if (isDev) {
        tabs.push({ id: 'admin', label: 'Admin Console', icon: '📟' });
    }

    return (
        <div className="game-container min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden animate-fade-in relative z-[600]">
            {/* Header Section with Scenery */}
            <div className={`relative h-[25vh] flex items-center px-8 shrink-0 overflow-hidden transition-colors duration-1000 ${isDev ? 'bg-[#2e1065]' : 'bg-[#1e1b4b]'}`}>
                <ProfileScenery playerGender={playerGender} devMode={isDev} />

                <button
                    onClick={() => onNavigate('LEVEL_SELECT')}
                    className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors z-20"
                >
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-20 h-20 md:w-28 md:h-28 rounded-3xl p-1 shadow-xl rotate-3 hover:rotate-0 transition-all duration-300 ${isDev ? 'bg-purple-600 ring-4 ring-purple-400 animate-pulse' : 'bg-white'}`}>
                        <div className="w-full h-full rounded-[1.25rem] bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-50">
                            <img
                                src={`/stickman_assets/${playerGender === 'girl' ? 'girl_idle' : 'guy_idle'}.svg`}
                                alt="Avatar"
                                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className={`text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none ${isDev ? 'animate-pulse' : ''}`}>{playerName}</h2>
                            {isDev && (
                                <span className="px-2 py-0.5 bg-purple-500 text-[8px] font-black text-white rounded-md tracking-widest animate-bounce">ADMIN</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 backdrop-blur rounded-full text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest border ${isDev ? 'bg-purple-500/40 border-purple-400/50' : 'bg-white/20 border-white/20'}`}>
                                {isDev ? 'Core Developer' : 'Citizen Hero'}
                            </span>
                            <span className={`px-3 py-1 backdrop-blur rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${isDev ? 'bg-indigo-500/40 border-indigo-400/50 text-indigo-100' : 'bg-teal-400/30 border-teal-400/30 text-teal-100'}`}>
                                {isDev ? 'Superuser Access' : `Level ${completedLevels.length + 1}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="ml-auto flex flex-col items-end relative z-10">
                    <div className="text-right">
                        <p className="text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                            {isDev ? 'System Integrity' : 'Avg Trust Score'}
                        </p>
                        <div className={`text-4xl md:text-6xl font-black text-white tracking-tighter ${isDev ? 'text-purple-300' : ''}`}>
                            {isDev ? '99.9%' : `${stats?.averageTrustScore || 0}%`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex border-b px-8 shrink-0 h-[8vh] items-center transition-colors duration-500 ${isDev ? 'bg-slate-900 border-purple-500/30' : 'bg-white border-slate-200'}`}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { audioManager.init(); setActiveTab(tab.id); }}
                        className={`px-6 h-full text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id
                                ? (isDev && tab.id === 'admin' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-teal-500 text-teal-600 bg-teal-50/30')
                                : (isDev ? 'border-transparent text-slate-500 hover:text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200')
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}

                <button
                    onClick={onLogout}
                    className="ml-auto px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                    <span>🚪</span>
                    Terminate Session
                </button>
            </div>

            {/* Content Area - No Scroll */}
            <div className={`flex-1 overflow-hidden p-6 md:p-10 transition-colors duration-500 ${isDev ? 'bg-slate-950 text-white' : 'bg-white'}`}>
                {activeTab === 'progress' && (
                    <div className="h-full flex flex-col justify-between animate-fade-in-up">
                        {/* Missions Grid */}
                        <div className="flex-1 min-h-0 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isDev ? 'bg-purple-900/50 text-purple-400' : 'bg-teal-100/50 text-teal-600'}`}>🎮</div>
                                <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${isDev ? 'text-purple-400/60' : 'text-slate-400'}`}>Scenario Simulation History</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-[calc(100%-2rem)]">
                                {MISSIONS.map(mission => {
                                    const isCompleted = completedLevels.includes(mission.id);
                                    return (
                                        <div key={mission.id} className={`p-2 md:p-4 rounded-2xl border-2 flex items-center gap-3 md:gap-4 transition-all ${isCompleted
                                                ? (isDev ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-teal-200 bg-teal-50/40')
                                                : (isDev ? 'border-slate-800 bg-slate-900/50 opacity-40' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60')
                                            }`}>
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${isCompleted
                                                    ? (isDev ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30')
                                                    : (isDev ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400')
                                                }`}>
                                                {isCompleted ? '✓' : '🔒'}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className={`text-[10px] md:text-sm font-black uppercase tracking-tight truncate ${isDev ? 'text-purple-100' : 'text-slate-700'}`}>{mission.name}</h4>
                                                <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider ${isDev ? 'text-purple-400/60' : 'text-slate-400'}`}>{mission.difficulty}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mini Games Grid */}
                        <div className="shrink-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isDev ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100/50 text-indigo-600'}`}>🕹️</div>
                                <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${isDev ? 'text-indigo-400/60' : 'text-slate-400'}`}>Field Training Data</h3>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {miniGames.map(game => {
                                    const score = bestScores[game.id];
                                    return (
                                        <div key={game.id} className="p-3 md:p-4 rounded-3xl border-2 text-center group transition-all flex items-center gap-3 md:gap-4 text-left bg-slate-950 border-slate-900 hover:border-indigo-500">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform p-2 ${isDev ? 'bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5'}`}>
                                                <img src={game.icon} alt={game.name} className={`w-full h-full object-contain filter ${isDev ? 'drop-shadow-[0_0_8px_purple]' : 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'}`} />
                                            </div>
                                            <div>
                                                <h4 className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-1 leading-none ${isDev ? 'text-indigo-400' : 'text-slate-500'}`}>{game.name}</h4>
                                                <div className={`text-lg md:text-xl font-black italic tracking-tighter ${isDev ? 'text-white' : 'text-white'}`}>
                                                    {score ? score.score : '---'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="h-full flex items-center justify-center animate-fade-in-up">
                        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Left Side: Account Security */}
                            <div className="space-y-6">
                                <div className="text-left mb-4">
                                    <h3 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 ${isDev ? 'text-purple-400' : 'text-slate-800'}`}>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isDev ? 'bg-purple-900/50' : 'bg-slate-100'}`}>🔐</span>
                                        Encryption Keys & Access
                                    </h3>
                                </div>

                                <div className={`p-6 rounded-3xl border-2 space-y-4 backdrop-blur-sm ${isDev ? 'bg-slate-900/50 border-purple-500/20' : 'bg-white/50 border-slate-100'}`}>
                                    <div>
                                        <label className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-2 px-1 ${isDev ? 'text-purple-400/60' : 'text-slate-400'}`}>Entity Identity (UID)</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={currentUser?.email || ''}
                                            className={`w-full border-2 rounded-xl px-4 py-3 font-bold ${isDev ? 'bg-slate-950 border-purple-900 text-purple-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                        />
                                    </div>
                                    <button
                                        onClick={handleChangePassword}
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 ${isDev ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40' : 'bg-slate-900 hover:bg-slate-800 text-white'
                                            }`}
                                    >
                                        Synchronize Password
                                    </button>
                                </div>

                                <div className={`p-6 rounded-3xl border-2 flex items-center justify-between ${isDev ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                                    <div className="pr-4">
                                        <h4 className={`font-black uppercase tracking-tight text-sm ${isDev ? 'text-red-400' : 'text-red-900'}`}>Erase Profile History</h4>
                                        <p className={`text-[10px] font-medium italic ${isDev ? 'text-red-400/40' : 'text-red-700/60'}`}>Reset current entity state</p>
                                    </div>
                                    <button
                                        onClick={() => { if (confirm("Are you sure? This will wipe your progress.")) { audioManager.init(); onResetGame && onResetGame(); } }}
                                        className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-700 transition-colors"
                                    >
                                        Execute Reset
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: Game Configuration */}
                            <div className="space-y-6">
                                <div className="text-left mb-4">
                                    <h3 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 ${isDev ? 'text-indigo-400' : 'text-slate-800'}`}>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isDev ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>⚙️</span>
                                        Core System Params
                                    </h3>
                                </div>

                                <div className={`p-6 rounded-3xl border-2 space-y-6 backdrop-blur-sm ${isDev ? 'bg-slate-900/50 border-indigo-500/20' : 'bg-white/50 border-slate-100'}`}>
                                    {/* Audio Volume */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDev ? 'text-indigo-400/60' : 'text-slate-400'}`}>Audio Output Gain</label>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isDev ? 'text-indigo-300 bg-indigo-900/50' : 'text-indigo-600 bg-indigo-50'}`}>{Math.round(settings.audioVolume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            value={settings.audioVolume}
                                            onChange={(e) => setSettings(s => ({ ...s, audioVolume: parseFloat(e.target.value) }))}
                                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all shadow-inner ${isDev ? 'bg-slate-950 accent-purple-500' : 'bg-slate-100 accent-indigo-500'}`}
                                        />
                                    </div>

                                    {/* TTS Toggle */}
                                    <div className={`flex items-center justify-between p-3 rounded-2xl border group cursor-pointer transition-all ${isDev ? 'bg-slate-950/50 border-indigo-900 hover:border-purple-500' : 'bg-slate-50 border-slate-100 hover:border-teal-300'}`} onClick={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}>
                                        <div>
                                            <label className={`text-[11px] font-black uppercase tracking-tight block ${isDev ? 'text-indigo-200' : 'text-slate-700'}`}>Neural Narration</label>
                                            <p className={`text-[9px] font-bold uppercase ${isDev ? 'text-indigo-500/50' : 'text-slate-400'}`}>Synthetic Voice Module</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${settings.ttsEnabled ? (isDev ? 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]') : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.ttsEnabled ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Text Speed */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDev ? 'text-indigo-400/60' : 'text-slate-400'}`}>Buffer Flow Rate</label>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isDev ? 'text-indigo-300 bg-indigo-900/50' : 'text-indigo-600 bg-indigo-50'}`}>
                                                {settings.textSpeed === 0 ? 'INSTANT' : settings.textSpeed > 75 ? 'RELAXED' : settings.textSpeed > 30 ? 'NORMAL' : 'RAPID'}
                                            </span>
                                        </div>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={100 - settings.textSpeed}
                                            onChange={(e) => setSettings(s => ({ ...s, textSpeed: 100 - parseInt(e.target.value) }))}
                                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all shadow-inner ${isDev ? 'bg-slate-950 accent-purple-500' : 'bg-slate-100 accent-indigo-500'}`}
                                        />
                                    </div>

                                    {/* Developer Mode */}
                                    <button
                                        onClick={() => {
                                            if (settings.devMode) {
                                                setSettings(s => ({ ...s, devMode: false }));
                                                setActiveTab('settings');
                                            } else {
                                                const password = prompt("ADMIN AUTHORIZATION:");
                                                if (password === "lillyasdaisy") {
                                                    setSettings(s => ({ ...s, devMode: true }));
                                                    if (audioManager) audioManager.playDing();
                                                }
                                            }
                                        }}
                                        className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${settings.devMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/40 pulsate' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{isDev ? 'Admin Control Active' : 'Advanced Unlock (Dev)'}</span>
                                        <div className={`w-3 h-3 rounded-full ${settings.devMode ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-300'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'admin' && isDev && (
                    <div className="h-full animate-fade-in-up">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-6 border-b border-purple-500/20 pb-4">
                                <div className="w-12 h-12 bg-purple-900/50 rounded-2xl flex items-center justify-center text-2xl animate-pulse">📟</div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">System Override Console</h3>
                                    <p className="text-[10px] text-purple-400/60 font-black uppercase tracking-[0.3em] mt-1">Experimental Terminal v2.9.0-BETA</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                                {/* System Diagnostics */}
                                <div className="bg-slate-900/60 border-2 border-slate-800 rounded-[2rem] p-6 flex flex-col gap-4">
                                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 px-1">Diagnostics & Logs</h4>
                                    <div className="bg-black/60 rounded-xl p-4 font-mono text-[9px] text-green-400 space-y-1 flex-1 overflow-y-auto custom-scrollbar-slim border border-green-500/10">
                                        {adminLogs.map((log, i) => (
                                            <p key={i} className={`${log.type === 'dim' ? 'opacity-40' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-amber-400' : 'text-white'}`}>
                                                [{log.time}] {log.msg}
                                            </p>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => { audioManager.playDing(); addLog("SYS_DEBUG: CAPTURE_DUMP_SUCCESS", "success"); }}
                                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Export Debug Bundle
                                    </button>
                                </div>

                                {/* Script Overrides */}
                                <div className="bg-slate-900/60 border-2 border-slate-800 rounded-[2rem] p-6 flex flex-col gap-4">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Logic Overrides</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-indigo-950/20 rounded-2xl border border-indigo-500/20 flex flex-col gap-2">
                                            <label className="text-[9px] font-black text-indigo-300 uppercase">Forced Trust: {forcedTrust}%</label>
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={forcedTrust}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForcedTrust(val);
                                                    addLog(`VM_PARAM_SET: TRUST_OVERRIDE = ${val}`, "warning");
                                                }}
                                                className="w-full accent-indigo-500"
                                            />
                                            <p className="text-[8px] text-indigo-500/60 text-center italic font-bold">Override next scenario starting state</p>
                                        </div>
                                        <button
                                            onClick={() => { addLog("OVERRIDE_ENABLED: INFINITE_REPLAYS", "success"); }}
                                            className="w-full p-3 bg-indigo-600/20 border border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)] text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/40 transition-all"
                                        >
                                            Unlock Infinite Replays
                                        </button>
                                        <button
                                            onClick={() => { addLog("OVERRIDE_ENABLED: UI_HINTS_FORCE", "success"); }}
                                            className="w-full p-3 bg-purple-600/20 border border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)] text-purple-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600/40 transition-all"
                                        >
                                            Enable All UI Hints
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-slate-900/60 border-2 border-slate-800 rounded-[2rem] p-6 flex flex-col gap-4">
                                    <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2 px-1">Direct Manipulation</h4>
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleInstaWin}
                                            className="bg-slate-800 hover:bg-white hover:text-slate-900 p-2 rounded-xl text-[8px] font-black uppercase flex flex-col items-center justify-center transition-all border border-white/5 active:scale-95 group"
                                        >
                                            <span className="text-lg group-hover:scale-125 transition-transform">⚡</span>
                                            <span>Insta-Win</span>
                                        </button>
                                        <button
                                            onClick={handleSndTest}
                                            className="bg-slate-800 hover:bg-white hover:text-slate-900 p-2 rounded-xl text-[8px] font-black uppercase flex flex-col items-center justify-center transition-all border border-white/5 active:scale-95 group"
                                        >
                                            <span className="text-lg group-hover:rotate-12 transition-transform">🔊</span>
                                            <span>SND Test</span>
                                        </button>
                                        <button
                                            onClick={() => { addLog("NODE_RENDER: GFX_MODE_TOGGLE", "warning"); }}
                                            className="bg-slate-800 hover:bg-white hover:text-slate-900 p-2 rounded-xl text-[8px] font-black uppercase flex flex-col items-center justify-center transition-all border border-white/5 active:scale-95 group"
                                        >
                                            <span className="text-lg group-hover:animate-spin">🎨</span>
                                            <span>GFX Mode</span>
                                        </button>
                                        <button
                                            onClick={handleExportLogs}
                                            className="bg-slate-800 hover:bg-white hover:text-slate-900 p-2 rounded-xl text-[8px] font-black uppercase flex flex-col items-center justify-center transition-all border border-white/5 active:scale-95 group"
                                        >
                                            <span className="text-lg group-hover:-translate-y-1 transition-transform">📝</span>
                                            <span>Log Txt</span>
                                        </button>
                                    </div>
                                    <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Warning: Admin mode bypasses all game balance protocols.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="h-full flex items-center justify-center animate-fade-in-up">
                        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-left">
                                <img src="/logo.svg" className={`w-24 h-24 mb-6 mx-auto md:mx-0 ${isDev ? 'drop-shadow-[0_0_15px_purple] brightness-125' : ''}`} alt="QPR Logo" />
                                <h3 className={`text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-tight mb-4 ${isDev ? 'text-white' : 'text-slate-900'}`}>Stickman to the Rescue</h3>
                                <p className={`font-black uppercase tracking-[0.4em] text-xs ${isDev ? 'text-purple-400' : 'text-slate-500'}`}>Quest for Life & Hope Portal</p>
                                <div className={`mt-8 pt-8 border-t ${isDev ? 'border-purple-500/20' : 'border-slate-100'}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDev ? 'text-purple-900' : 'text-slate-300'}`}>System Version 2.0.4.ARCADE</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <section className={`p-6 rounded-3xl border-2 ${isDev ? 'bg-purple-950/20 border-purple-500/30' : 'bg-teal-50 border-teal-100'}`}>
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDev ? 'text-purple-400' : 'text-teal-600'}`}>
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${isDev ? 'bg-purple-500 shadow-[0_0_10px_purple]' : 'bg-teal-500'}`}></span>
                                        {isDev ? 'Operational Directive' : 'Protocol Objective'}
                                    </h4>
                                    <p className={`text-sm font-medium leading-relaxed italic ${isDev ? 'text-purple-100' : 'text-teal-900/80'}`}>
                                        "Our goal is to democratize mental health support skills. Through this gamified simulation, we build a world where everyone knows how to offer hope and bridge the gap to professional help."
                                    </p>
                                </section>

                                <section className={`p-6 rounded-3xl border-2 ${isDev ? 'bg-slate-900 border-indigo-500/20' : 'bg-slate-50 border-slate-100'}`}>
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDev ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${isDev ? 'bg-indigo-500 shadow-[0_0_10px_indigo]' : 'bg-indigo-500'}`}></span>
                                        What is QPR?
                                    </h4>
                                    <p className={`text-xs font-bold leading-relaxed px-1 ${isDev ? 'text-slate-300' : 'text-slate-600'}`}>
                                        QPR stands for <strong>Question, Persuade, and Refer</strong>. Just as people learn CPR to save hearts, people learn QPR to save lives by recognizing warning signs and offering a bridge to help.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileScreen;
