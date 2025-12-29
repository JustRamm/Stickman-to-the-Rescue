import React from 'react';
import Scenery from '../components/Scenery';

const FinalSuccessScreen = ({ onRestart }) => {
    return (
        <div className="fixed inset-0 w-full h-full bg-slate-900 text-white overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 z-0">
                <Scenery theme="rainy_street" trust={100} />
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center animate-fade-in-up gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-500 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-2xl animate-bounce">
                    🌟
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight bg-gradient-to-r from-teal-200 to-teal-500 bg-clip-text text-transparent">
                    Journey Complete
                </h1>

                <div className="space-y-3 md:space-y-4 text-sm md:text-lg font-medium text-slate-200 leading-relaxed max-w-lg">
                    <p>
                        Congratulations, Gatekeeper. You have walked through the rain and the storm.
                    </p>
                    <p className="opacity-90 italic text-xs md:text-base">
                        "In the beginning, it's easy to judge or offer empty clichés. But through this journey, you learned the most powerful skill of all:
                        <span className="text-teal-400 font-bold not-italic"> Deep Listening.</span>"
                    </p>
                    <p className="text-xs md:text-base">
                        You saved lives today—not by fixing problems, but by making others feel seen.
                    </p>
                </div>

                <div className="p-4 md:p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md w-full max-w-md">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-teal-400 mb-3 md:mb-4">Your Impact</h3>
                    <div className="flex justify-center gap-6 md:gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-xl md:text-3xl font-bold">5/5</span>
                            <span className="text-[8px] md:text-[10px] uppercase tracking-wider opacity-70">Missions</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl md:text-3xl font-bold">100%</span>
                            <span className="text-[8px] md:text-[10px] uppercase tracking-wider opacity-70">Empathy</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl md:text-3xl font-bold">Guarded</span>
                            <span className="text-[8px] md:text-[10px] uppercase tracking-wider opacity-70">Lives</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onRestart}
                    className="mt-2 md:mt-4 px-8 md:px-12 py-3 md:py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-full font-black text-sm md:text-lg uppercase tracking-widest shadow-2xl hover:shadow-teal-500/50 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    Become a Gatekeeper
                </button>
            </div>
        </div>
    );
};

export default FinalSuccessScreen;
