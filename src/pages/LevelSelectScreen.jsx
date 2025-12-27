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
    setIsSettingsOpen
}) => {
    const sliderRef = useRef(null);

    const isMissionLocked = (missionId) => {
        if (missionId === 'tutorial') return false;
        if (missionId === 'park' || missionId === 'office') {
            return !completedLevels.includes('tutorial');
        }
        if (missionId === 'campus') {
            return !(completedLevels.includes('park') && completedLevels.includes('office'));
        }
        if (missionId === 'rainy') {
            return !completedLevels.includes('campus');
        }
        return true;
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
            />

            {/* Back to Title */}
            <button
                onClick={() => onNavigate('START')}
                className="absolute top-6 left-6 z-50 px-4 py-2 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-white hover:shadow-lg transition-all"
            >
                ← Exit to Title
            </button>

            <Scenery theme={selectedLevel.theme} trust={trust} />


            {/* Header */}
            <div className="relative z-20 text-center mb-4 md:mb-12 mt-12 md:mt-0 px-4 animate-fade-in">
                <h2 className="text-3xl md:text-5xl font-black uppercase text-white drop-shadow-lg mb-2 tracking-tight">
                    Select Your Mission
                </h2>
                <p className="text-white/90 font-medium text-sm md:text-lg drop-shadow-md">
                    Swipe to explore scenarios
                </p>
            </div>

            {/* Scrollable Container */}
            <div className="relative z-20 w-full max-w-[90rem] mx-auto px-0 md:px-8">
                <div
                    ref={sliderRef}
                    onScroll={handleSliderScroll}
                    className="
            flex flex-row md:grid md:grid-cols-2 
            gap-6 md:gap-8 
            overflow-x-auto md:overflow-visible 
            pb-12 md:pb-8 px-6 md:px-0
            snap-x snap-mandatory touch-pan-x
            scrollbar-hide
          ">
                    {MISSIONS.map((mission) => {
                        const isLocked = isMissionLocked(mission.id);
                        const isCompleted = completedLevels.includes(mission.id);

                        return (
                            <button
                                key={mission.id}
                                disabled={isLocked}
                                onClick={() => !isLocked && onLaunchMission(mission)}
                                onMouseEnter={() => !isLocked && onSelectLevel(mission)}
                                onTouchStart={() => !isLocked && onSelectLevel(mission)}
                                className={`
                    flex-shrink-0 w-[85vw] md:w-auto snap-center
                    group relative p-6 md:p-8 
                    bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all duration-300
                    text-left flex flex-col justify-between h-[70vh] md:h-64
                    overflow-hidden
                    ${isLocked
                                        ? 'opacity-60 grayscale cursor-not-allowed border-slate-200'
                                        : selectedLevel.id === mission.id
                                            ? 'border-teal-500 shadow-2xl scale-100 z-10 bg-white'
                                            : 'border-white/40 hover:border-teal-200 opacity-80 hover:opacity-100 scale-95 md:scale-100'
                                    }
                  `}
                            >
                                {/* Lock Overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white/80 px-3 py-1 rounded-full">Locked</span>
                                    </div>
                                )}

                                {/* Dynamic Background Tint for active card */}
                                {!isLocked && (
                                    <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${selectedLevel.id === mission.id ? 'opacity-10 bg-gradient-to-br from-teal-400 to-transparent' : ''}`} />
                                )}

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest border ${mission.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                                            mission.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                mission.difficulty === 'Hard' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-slate-900 text-white border-slate-900'
                                            }`}>
                                            {mission.difficulty}
                                        </span>

                                        {/* Selection Indicator */}
                                        {!isLocked && (
                                            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLevel.id === mission.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'}`}>
                                                {selectedLevel.id === mission.id && <span className="text-[10px] md:text-xs font-bold">✓</span>}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg md:text-3xl font-black text-slate-800 mb-1 md:mb-3 leading-none">
                                        {mission.name}
                                    </h3>
                                    <p className="text-xs md:text-base text-slate-600 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                        {mission.desc}
                                    </p>
                                </div>

                                {/* NPC Character Preview - Mobile Only */}
                                {!isLocked && (
                                    <div className="absolute bottom-4 right-4 md:hidden z-20 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <img
                                            src={`/npc/${mission.npc.name.toLowerCase()}.svg`}
                                            alt={mission.npc.name}
                                            className="w-16 h-20 drop-shadow-lg"
                                        />
                                    </div>
                                )}

                                <div className={`relative z-10 pt-4 md:pt-6 mt-auto border-t border-slate-200/50 flex items-center justify-between transition-colors ${isLocked ? 'text-slate-300' : 'text-slate-400 group-hover:text-teal-600'}`}>
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                                        {isLocked ? 'Mission Locked' : isCompleted ? 'Replay Simulation' : 'Start Simulation'}
                                    </span>
                                    <span className="text-lg md:text-xl">{isLocked ? '🔒' : '➔'}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Resources Footer */}
            <div className="relative z-20 flex justify-center mt-4 mb-8 gap-4 px-4 flex-wrap">
                <button
                    onClick={() => onNavigate('QUIZ_MODE')}
                    className="px-6 py-3 bg-white/80 hover:bg-white text-teal-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 backdrop-blur-sm border border-teal-100 shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                    <div className="w-6 h-6">
                        <img src="/stickman_assets/scholar_stickman.svg" alt="Quiz" className="w-full h-full object-contain" />
                    </div>
                    <span>Myth vs Fact Game</span>
                </button>

                <button
                    onClick={() => onNavigate('RESOURCES')}
                    className="px-6 py-3 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900/60 hover:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 backdrop-blur-sm border border-slate-900/5 shadow-inner"
                >
                    <span>Resources</span>
                    <span className="text-teal-600 font-bold">✚</span>
                </button>
            </div>
        </div>
    );
};

export default LevelSelectScreen;
