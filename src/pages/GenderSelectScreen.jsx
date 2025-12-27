import React from 'react';
import Scenery from '../components/Scenery';

const GenderSelectScreen = ({ trust, playerGender, setPlayerGender, audioManager, onNext, onBack }) => {
    return (
        <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-y-auto relative flex flex-col items-center justify-center p-4">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-lg transition-all"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <Scenery trust={trust} />
            <div className="relative z-20 max-w-xl w-[95%] md:w-full p-4 md:p-10 naming-card bg-white/80 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-white/50 text-center animate-fade-in my-auto">
                <h2 className="text-lg md:text-2xl font-black uppercase text-teal-800 mb-4 md:mb-6">Character Voice</h2>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <button
                        onClick={() => { setPlayerGender('guy'); audioManager.speak("Testing, testing. This is the guy voice.", false, 'guy'); }}
                        className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 md:gap-3 h-32 md:h-auto ${playerGender === 'guy' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105 ring-2 ring-teal-500/50' : 'border-slate-100 bg-white/50 hover:bg-slate-50'}`}
                    >
                        <img src="/stickman_assets/guy_idle.svg" alt="Guy Character" className="w-12 h-12 md:w-20 md:h-20" />
                        <span className="font-bold uppercase text-[10px] md:text-sm tracking-widest text-slate-700">Guy Voice</span>
                    </button>
                    <button
                        onClick={() => { setPlayerGender('girl'); audioManager.speak("Testing, testing. This is the girl voice.", false, 'girl'); }}
                        className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 md:gap-3 h-32 md:h-auto ${playerGender === 'girl' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105 ring-2 ring-teal-500/50' : 'border-slate-100 bg-white/50 hover:bg-slate-50'}`}
                    >
                        <img src="/stickman_assets/girl_idle.svg" alt="Girl Character" className="w-12 h-12 md:w-20 md:h-20" />
                        <span className="font-bold uppercase text-[10px] md:text-sm tracking-widest text-slate-700">Girl Voice</span>
                    </button>
                </div>

                <button
                    onClick={() => {
                        audioManager.stopSpeaking();
                        onNext();
                    }}
                    className="w-full py-2 md:py-3 bg-teal-600 text-white rounded-lg md:rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                    Confirm & Continue
                </button>
            </div>
        </div>
    );
};

export default GenderSelectScreen;
