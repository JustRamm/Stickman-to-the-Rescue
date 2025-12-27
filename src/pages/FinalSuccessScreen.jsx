import React from 'react';
import Scenery from '../components/Scenery';

const FinalSuccessScreen = ({ onRestart }) => {
    return (
        <div className="game-container min-h-screen w-full bg-slate-900 text-white overflow-hidden relative flex flex-col items-center justify-center p-8">
            <div className="absolute inset-0 z-0">
                <Scenery theme="rainy_street" trust={100} />
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-5xl shadow-2xl mb-8 animate-bounce block">
                    🌟
                </div>

                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 bg-gradient-to-r from-teal-200 to-teal-500 bg-clip-text text-transparent">
                    Journey Complete
                </h1>

                <div className="space-y-6 text-lg md:text-xl font-medium text-slate-200 leading-relaxed max-w-xl">
                    <p>
                        Congratulations, Gatekeeper. You have walked through the rain and the storm.
                    </p>
                    <p className="opacity-90 italic">
                        "In the beginning, it's easy to judge or offer empty clichés. But through this journey, you learned the most powerful skill of all:
                        <span className="text-teal-400 font-bold not-italic"> Deep Listening.</span>"
                    </p>
                    <p>
                        You saved lives today—not by fixing problems, but by making others feel seen. You proved that empathy is a resource that never runs dry.
                    </p>
                </div>

                <div className="mt-12 p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md w-full">
                    <h3 className="text-xs font-black uppercase tracking-widest text-teal-400 mb-4">Your Impact</h3>
                    <div className="flex justify-center gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">5/5</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-70">Missions</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">100%</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-70">Empathy</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">Guarded</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-70">Lives</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onRestart}
                    className="mt-12 px-12 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-full font-black text-lg uppercase tracking-widest shadow-2xl hover:shadow-teal-500/50 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    Become a Gatekeeper
                </button>
            </div>
        </div>
    );
};

export default FinalSuccessScreen;
