import React from 'react';
import Scenery from '../components/Scenery';

const NamingScreen = ({ trust, playerName, setPlayerName, onNext, onNavigate }) => {
    return (
        <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
            {/* Back Button */}
            <button
                onClick={() => onNavigate('START')}
                className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-lg transition-all"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <Scenery trust={trust} />
            <div className="relative z-20 max-w-lg w-[95%] md:w-full p-4 md:p-10 naming-card bg-white/80 backdrop-blur-md rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-white/50 text-center animate-fade-in my-auto flex flex-col md:block">

                <div className="mb-2 md:mb-6 w-12 h-12 md:w-16 md:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase text-teal-800 mb-1">Identify Yourself</h2>
                <p className="text-slate-500 text-[10px] md:text-sm mb-4 md:mb-6 font-medium italic">What is your Name, Gatekeeper?</p>

                <input
                    type="text"
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 md:py-3 bg-slate-100 border-2 border-slate-200 rounded-lg md:rounded-xl mb-4 text-center text-lg font-bold text-slate-800 focus:border-teal-500 focus:outline-none transition-colors"
                    value={playerName === 'You' ? '' : playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && onNext()}
                />

                <button
                    disabled={!playerName.trim()}
                    onClick={onNext}
                    className="w-full py-2 md:py-3 bg-teal-600 text-white rounded-lg md:rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                    Choose Gender
                </button>
            </div>
        </div>
    );
};

export default NamingScreen;
