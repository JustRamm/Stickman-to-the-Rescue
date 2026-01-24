import React, { useRef } from 'react';
import Scenery from '../components/Scenery';
import SettingsOverlay from '../components/SettingsOverlay';
import { MISSIONS } from '../data/missions';

const LevelSelectScreen = ({
    completedLevels = [],
    selectedLevel,
    onSelectLevel,
    onLaunchMission,
    onNavigate,
    trust,
    settings,
    setSettings,
    audioManager,
    isSettingsOpen,
    setIsSettingsOpen,
    onResetGame,
    isPaused,
    setIsPaused
}) => {
    const sliderRef = useRef(null);

    const isMissionLocked = (missionId) => {
        if (settings?.devMode) return false; // Developer Mode Override

        // Strict: Nothing unlocks until tutorial is done (except the tutorial itself)
        const isTutorialComplete = completedLevels.includes('tutorial');
        if (missionId !== 'tutorial' && !isTutorialComplete) {
            return true;
        }

        const missionIndex = MISSIONS.findIndex(m => m.id === missionId);
        if (missionIndex === 0) return false; // First mission (Intro) is always unlocked
        if (missionIndex === -1) return true; // Secure default
        const previousMission = MISSIONS[missionIndex - 1];
        return !completedLevels.includes(previousMission.id);
    };

    const handleSliderScroll = () => {
        if (!sliderRef.current) return;
        const container = sliderRef.current;

        // Center calculation
        const center = container.scrollLeft + (container.offsetWidth / 2);
        const cards = Array.from(container.children);
        let closestMission = null;
        let minDiff = Infinity;

        cards.forEach((card, index) => {
            const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
            const diff = Math.abs(center - cardCenter);
            if (diff < minDiff) {
                minDiff = diff;
                closestMission = MISSIONS[index];
            }
        });

        if (closestMission && closestMission.id !== selectedLevel.id) {
            onSelectLevel(closestMission);
        }
    };

    return (
        <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col justify-center">

            {/* Settings Overlay */}
            <SettingsOverlay
                settings={settings} setSettings={setSettings}
                audioManager={audioManager}
                isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} onNavigate={onNavigate}
                onResetGame={onResetGame}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                gameState="LEVEL_SELECT"
            />


            <Scenery theme={selectedLevel.theme} trust={trust} />

            {/* Header */}
            <div className="relative z-20 text-center mb-6 mt-0 px-4 animate-fade-in">
                <h2 className="text-5xl font-black uppercase text-white drop-shadow-lg mb-1 tracking-tight">
                    Select Your Mission
                </h2>
                <p className="text-white/80 font-medium text-lg drop-shadow-md">
                    Choose a scenario to practice your QPR skills
                </p>
            </div>

            {/* Scrollable Container */}
            <div className="relative z-20 w-full max-w-[90rem] mx-auto px-8">
                <div
                    ref={sliderRef}
                    className="
                        grid grid-cols-3
                        gap-6 
                        pb-8
                    "
                >
                    {(MISSIONS || []).map((mission) => {
                        const isLocked = isMissionLocked(mission.id);
                        const isCompleted = completedLevels.includes(mission.id);

                        return (
                            <button
                                key={mission.id}
                                disabled={isLocked}
                                onClick={() => !isLocked && onLaunchMission(mission)}
                                onMouseEnter={() => !isLocked && onSelectLevel(mission)}
                                className={`
                                    w-auto
                                    group relative p-6 
                                    bg-white/80 backdrop-blur-xl rounded-[2rem] border-2 transition-all duration-300
                                    text-left flex flex-col justify-between h-56
                                    overflow-hidden
                                    level-select-card
                                    ${isLocked
                                        ? 'opacity-60 grayscale cursor-not-allowed border-slate-200'
                                        : selectedLevel.id === mission.id
                                            ? 'border-teal-500 shadow-2xl scale-100 z-10 bg-white'
                                            : 'border-white/40 hover:border-teal-200 opacity-80 hover:opacity-100 scale-100'
                                    }
                                `}
                            >
                                {/* Lock Overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
                                            <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white/80 px-3 py-1 rounded-full">Locked</span>
                                    </div>
                                )}

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${mission.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                                            mission.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                mission.difficulty === 'Hard' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-slate-900 text-white border-slate-900'
                                            }`}>
                                            {mission.difficulty}
                                        </span>

                                        {!isLocked && (
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLevel.id === mission.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'}`}>
                                                {selectedLevel.id === mission.id && <span className="text-xs font-bold">✓</span>}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">
                                        {mission.name}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-snug font-medium line-clamp-3">
                                        {mission.desc}
                                    </p>
                                </div>

                                {/* NPC character preview for all cards */}
                                {!isLocked && (
                                    <div className="absolute bottom-2 right-4 opacity-20 pointer-events-none">
                                        <img
                                            src={`/npc/${mission.npc.name.toLowerCase()}.svg`}
                                            alt={mission.npc.name}
                                            className="w-12 h-16 grayscale"
                                        />
                                    </div>
                                )}

                                <div className={`relative z-10 pt-4 mt-auto border-t border-slate-200/50 flex items-center justify-between transition-colors ${isLocked ? 'text-slate-300' : 'text-slate-400 group-hover:text-teal-600'}`}>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                        {isLocked ? 'Mission Locked' : isCompleted ? 'Replay Simulation' : 'Start Simulation'}
                                    </span>
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        {isLocked ? (
                                            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LevelSelectScreen;
