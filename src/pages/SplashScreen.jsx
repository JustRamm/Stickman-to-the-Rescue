import React from 'react';
import Scenery from '../components/Scenery';

const SplashScreen = ({ loadingProgress }) => {
    return (
        <div className="game-container min-h-screen w-full bg-slate-900 text-white overflow-hidden relative flex flex-col items-center justify-center p-6">
            <div className="absolute inset-0 z-0">
                <Scenery theme="park" trust={50} />
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            </div>

            <div className="relative z-20 flex flex-col items-center text-center max-w-sm w-full animate-fade-in p-4">
                <div className="mb-8 md:mb-12 relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 animate-float">
                        <img src="/logo.svg" alt="Stickman Logo" className="w-16 h-16 md:w-20 md:h-20" />
                    </div>
                    <div className="absolute inset-0 bg-teal-500/30 blur-2xl rounded-full animate-pulse-slow" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">STICKMAN</h1>
                <p className="text-teal-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-8 md:mb-12">To The Rescue</p>

                <div className="w-full h-16 flex items-center justify-center">
                    <div className="w-full px-4">
                        <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">
                            <span>{loadingProgress >= 100 ? 'Ready to Start' : 'Loading Experience'}</span>
                            <span>{Math.round(loadingProgress)}%</span>
                        </div>
                        <div className="h-1 md:h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <p className="mt-8 md:mt-12 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">
                    Connecting to Empathy...
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
