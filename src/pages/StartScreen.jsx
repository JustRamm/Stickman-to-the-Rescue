import React from 'react';
import Scenery from '../components/Scenery';

const StartScreen = ({ trust, onStart, onResources }) => {
    return (
        <div className="game-container min-h-screen w-full bg-slate-900 text-white overflow-hidden relative flex flex-col items-center justify-center p-6">

            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Scenery trust={trust} />
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60 backdrop-blur-[2px]" />
            </div>

            {/* Floating Content */}
            <div className="relative z-20 flex flex-col items-center text-center max-w-4xl animate-slide-up px-4">

                {/* Top Badge: Mind Empowered Logo */}
                <div className="start-screen-logo mb-6 md:mb-8 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    <div className="relative group w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-2xl border-4 border-slate-700 ring-4 ring-teal-500/30 transition-transform duration-500 hover:scale-110">
                        <img src="/ME.jpeg" alt="Mind Empowered" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/60 drop-shadow-md bg-black/30 px-3 py-1 rounded backdrop-blur-sm">Mind Empowered</span>
                </div>

                {/* Main Title Group */}
                <div className="mb-4 md:mb-10 relative">
                    <div className="absolute -inset-10 bg-teal-500/20 blur-3xl rounded-full animate-pulse-slow pointer-events-none" />

                    <h1 className="relative text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-1 leading-none">
                        STICKMAN
                    </h1>
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-teal-300 animate-shimmer">
                        TO THE RESCUE
                    </h2>

                    {/* Decorative Elements */}
                    <div className="absolute -right-8 md:-right-16 -top-8 md:-top-12 animate-float delay-700 opacity-90 rotate-12 pointer-events-none">
                        <img src="/stickman_assets/guy_idle.svg" alt="Stickman" className="w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div className="absolute -left-8 md:-left-16 -bottom-6 md:-bottom-8 animate-float delay-1000 opacity-90 -rotate-12 pointer-events-none hug-stickman">
                        <img src="/stickman_assets/group_hug.svg" alt="Support" className="w-20 h-16 md:w-32 md:h-24 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={onStart}
                    className="group relative px-6 md:px-10 py-3 md:py-5 bg-white text-slate-900 rounded-full font-black text-sm md:text-xl tracking-widest uppercase shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(20,184,166,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2 md:gap-3">
                        Start Simulation <span className="text-teal-600 transition-transform group-hover:translate-x-1">➔</span>
                    </span>
                    {/* Button Glint */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-teal-200/50 opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
                </button>

                <button
                    onClick={onResources}
                    className="mt-3 md:mt-6 resource-btn text-teal-400 hover:text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-all hover:scale-105"
                >
                    <span>Mental Health Resources</span>
                    <span className="w-3 md:w-4 h-px bg-teal-500/50" />
                    <span className="text-xs md:text-sm">✚</span>
                </button>

                <p className="mt-2 md:mt-4 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest max-w-sm opacity-60">
                    A QPR Suicide Prevention Training
                </p>

            </div>
        </div>
    );
};

export default StartScreen;
