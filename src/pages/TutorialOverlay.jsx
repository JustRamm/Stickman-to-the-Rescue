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
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-lg px-4">
            <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border-2 border-teal-400 animate-bounce-subtle">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-xl shrink-0 text-white font-bold">
                        {step === 0 && '👉'}
                        {step === 1 && '👈'}
                        {step === 2 && '🧐'}
                        {step === 3 && '💬'}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs mb-1">Training Mission</h4>
                        <p className="text-slate-600 font-medium text-sm leading-tight">
                            {step === 0 && "Use D or RIGHT ARROW to move towards the person."}
                            {step === 1 && "Use A or LEFT ARROW to step back. Give them space."}
                            {step === 2 && "Press 'Z' (or tap paper) near the floating note to inspect clues."}
                            {step === 3 && "Walk close to Alex to start your training conversation."}
                        </p>
                    </div>
                    {/* Key Hint */}
                    <div className="ml-auto flex gap-1">
                        {step === 0 && <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-black font-mono">D / ⮕</span>}
                        {step === 1 && <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-black font-mono">A / ⬅</span>}
                        {step === 2 && <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-black font-mono">Z</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
