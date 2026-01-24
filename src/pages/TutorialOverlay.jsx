import React, { useEffect, useState } from 'react';

const TutorialOverlay = ({ gameState, playerPos, foundClues }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Hooks must be called unconditionally
    useEffect(() => {
        // Reset tutorial step when entering tutorial
        setStep(0);
        setIsVisible(true);
    }, []);

    // Step Logic
    useEffect(() => {
        if (step === 0 && playerPos.x > 15) setStep(1); // Moved right
        if (step === 1 && playerPos.x < 15) setStep(2); // Moved back
        if (step === 2 && foundClues.length > 0) setStep(3); // Found clue
        if (step === 3 && playerPos.x > 60) setIsVisible(false); // Almost at NPC
    }, [playerPos, foundClues, step]);

    if (!isVisible || gameState !== 'APPROACH') return null;

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-lg px-4 tutorial-overlay-container">
            <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border-2 border-teal-400 animate-bounce-subtle tutorial-overlay-card">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center p-2 shrink-0 text-white font-bold tutorial-overlay-icon">
                        {step === 0 && <img src="/stickman_assets/pointing_stickman.svg" className="w-full h-full filter brightness-0 invert" alt="" />}
                        {step === 1 && <img src="/stickman_assets/pointing_stickman.svg" className="w-full h-full filter brightness-0 invert -scale-x-100" alt="" />}
                        {step === 2 && <img src="/stickman_assets/thinking_stickman.svg" className="w-full h-full filter brightness-0 invert" alt="" />}
                        {step === 3 && <img src="/stickman_assets/hope_stickman.svg" className="w-full h-full filter brightness-0 invert" alt="" />}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs mb-1 tutorial-overlay-title">Training Mission</h4>
                        <p className="text-slate-600 font-medium text-sm leading-tight tutorial-overlay-text">
                            {step === 0 && "Use D or RIGHT ARROW to move towards the person."}
                            {step === 1 && "Use A or LEFT ARROW to step back. Give them space."}
                            {step === 2 && "Press 'Z' (or tap paper) near the floating note to inspect clues."}
                            {step === 3 && "Walk close to Alex to start your training conversation."}
                        </p>
                    </div>
                    {/* Key Hint */}
                    <div className="ml-auto flex gap-1">
                        {step === 0 && (
                            <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-black font-mono flex items-center gap-1">
                                D / <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </span>
                        )}
                        {step === 1 && (
                            <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-black font-mono flex items-center gap-1">
                                A / <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </span>
                        )}
                        {step === 2 && <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-black font-mono">Z</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
