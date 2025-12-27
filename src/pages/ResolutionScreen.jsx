import React, { useEffect, useState } from 'react';
import Scenery from '../components/Scenery';
import Stickman from '../components/Stickman';

const ResolutionScreen = ({
    resolutionPhase,
    setGameState,
    audioManager,
    playerGender,
    selectedLevel,
    playerName,
    playerPos,
    samPos
}) => {
    // Note: The logic for advancing 'resolutionPhase' is external (in App.jsx) or needs to be handled.
    // Assuming passed down for now. If static here, it won't animate.
    // For pure page extraction, we assume props drive the state.

    return (
        <div className="game-container min-h-screen w-full bg-slate-50 overflow-hidden relative animate-fade-in flex flex-col justify-end">
            {/* Persistent Branding & Controls */}
            <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-100 flex flex-col gap-2 md:gap-4">
                <img src="/ME.gif" alt="Mind Empowered" className="w-[50px] h-[50px] md:w-[80px] md:h-[80px] rounded-full border-2 md:border-4 border-white shadow-xl object-cover bg-slate-900" />

                <button
                    onClick={() => {
                        if (confirm("Abandon current mission and return to menu?")) {
                            audioManager.stopMusic();
                            setGameState('LEVEL_SELECT');
                        }
                    }}
                    className="pointer-events-auto px-4 py-1.5 bg-slate-900 border-2 border-white text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-slate-800 transition-all opacity-100"
                >
                    Exit
                </button>
            </div>

            {/* Camera/Zoom Container */}
            <div
                className="absolute inset-0 w-full h-full transition-transform duration-[3000ms] ease-in-out origin-center"
                style={{
                    transform: resolutionPhase >= 2 ? 'scale(1.5) translateY(10%)' : 'scale(1) translateY(0)'
                }}
            >
                <Scenery theme={selectedLevel.theme} trust={100} />

                {/* Helper Character (Medic/Pro) */}
                <div
                    className="absolute z-20 transition-all duration-[2000ms] ease-out bottom-[25%] md:bottom-[25%]"
                    style={{
                        left: resolutionPhase >= 1 ? (window.innerWidth < 768 ? '60%' : '70%') : '110%',
                    }}
                >
                    <Stickman gender="girl" emotion="happy" theme={selectedLevel.theme} />

                    {/* Speech Bubble */}
                    {resolutionPhase >= 3 && (
                        <div className="absolute -top-32 md:-top-40 right-0 bg-white/90 backdrop-blur border-2 border-teal-500 text-slate-800 p-4 md:p-6 rounded-2xl rounded-br-none shadow-2xl w-48 md:w-64 animate-pop-in z-50">
                            <p className="text-xs md:text-sm font-bold leading-relaxed">
                                {selectedLevel.id === 'tutorial'
                                    ? "Great job! You've mastered the basics. You're ready to help others now."
                                    : `"Thank you for being the bridge. We'll take care of ${selectedLevel.npc.name} now."`
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Characters */}
                <div className="absolute inset-0 z-10">
                    {resolutionPhase < 2 ? (
                        <>
                            <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} />
                            <Stickman speaker={selectedLevel.npc.name} position={samPos} gender={selectedLevel.npc.gender} emotion="relief" theme={selectedLevel.theme} />
                        </>
                    ) : (
                        <div className="absolute left-[45%] bottom-[25%] -translate-x-1/2 flex flex-col items-center animate-fade-in">
                            {/* Dynamic Hug Asset based on Player + NPC Gender */}
                            <img
                                src={`/stickman_assets/hug_${playerGender}_${selectedLevel.npc.gender}.svg`}
                                onError={(e) => { e.target.onerror = null; e.target.src = "/stickman_assets/group_hug.svg"; }}
                                alt="Hug"
                                className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] drop-shadow-2xl filter brightness-110"
                            />
                            <div className="absolute -top-6 md:-top-10 text-4xl md:text-6xl animate-bounce">❤️</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResolutionScreen;
