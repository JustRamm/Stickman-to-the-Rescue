import React from 'react';
import { REAL_RESOURCES } from '../data/resources';

const ResourcesScreen = ({ onBack }) => {
    return (
        <div className="fixed inset-0 z-[600] bg-slate-900 overflow-hidden animate-fade-in flex flex-col items-center justify-center p-4">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Main Content Container - Fits Screen */}
            <div className="w-full max-w-7xl h-full flex flex-col relative z-10">

                {/* Header - Compact */}
                <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-white/10 pb-4 shrink-0">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none mb-1">Mental Health Resources</h2>
                        <p className="text-teal-400 font-bold uppercase tracking-widest text-[9px] md:text-xs">Kochi, Kerala & Beyond</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20 text-xs md:text-sm uppercase tracking-wider"
                    >
                        ← Back
                    </button>
                </div>

                {/* 3-Column Grid Layout for Maximum Space Efficiency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-0">

                    {/* Col 1: Immediate Support (Helplines) */}
                    <div className="flex flex-col gap-3 overflow-y-auto md:overflow-hidden pr-1">
                        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Immediate Support</h3>
                        <div className="flex flex-col gap-3">
                            {REAL_RESOURCES.helplines.map((item, i) => (
                                <div key={i} className="group p-3 md:p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-teal-500/50 transition-all">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm md:text-base font-bold text-white group-hover:text-teal-400 truncate">{item.name}</h4>
                                        <span className="text-[7px] font-black bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full uppercase shrink-0">{item.hours}</span>
                                    </div>
                                    <p className="text-slate-400 text-[10px] mb-2 line-clamp-2 leading-tight">{item.desc}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-teal-500 rounded-md">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                        </div>
                                        <span className="text-sm md:text-base font-black text-teal-500">{item.phone}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Col 2: Hospital Care - Compact List */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Professional Care (Kochi)</h3>
                        <div className="flex flex-col gap-2 h-full">
                            {REAL_RESOURCES.hospitals.map((hosp, i) => (
                                <div key={i} className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex flex-col justify-center flex-1 min-h-0">
                                    <h5 className="font-bold text-white text-xs md:text-sm truncate">{hosp.name}</h5>
                                    <p className="text-[9px] text-slate-500 font-medium mb-1 truncate">{hosp.location} • {hosp.dept || hosp.type}</p>
                                    <p className="text-xs font-black text-teal-500">{hosp.contact}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Col 3: Self Care - Compact Grid */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Self-Care Toolkit</h3>
                        <div className="p-4 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-3xl border border-teal-500/20 h-full flex flex-col justify-center gap-4">
                            {REAL_RESOURCES.selfcare.map((sc, i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="w-1 h-1 mt-1.5 bg-teal-400 rounded-full flex-shrink-0 shadow-[0_0_5px_rgba(45,212,191,0.8)]" />
                                    <div>
                                        <h6 className="font-bold text-teal-300 text-xs mb-0.5">{sc.title}</h6>
                                        <p className="text-slate-300 text-[9px] leading-tight opacity-80">{sc.tip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Compact Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 text-center shrink-0">
                    <p className="text-slate-600 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em]">
                        You are never alone • Help is available 24/7
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ResourcesScreen;
