import React from 'react';
import { REAL_RESOURCES } from '../data/resources';

const ResourcesScreen = ({ onBack }) => {
    return (
        <div className="fixed inset-0 z-[600] bg-slate-900 overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

                {/* Header */}
                <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 relative z-10 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">Mental Health Resources</h2>
                        <p className="text-teal-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Kochi, Kerala & Beyond</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20 text-sm"
                    >
                        ← Back
                    </button>
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10 pb-20">
                    {/* Helplines Column */}
                    <div className="space-y-6">
                        <h3 className="text-lg md:text-xl font-black text-white/50 uppercase tracking-widest px-2">Immediate Support</h3>
                        {REAL_RESOURCES.helplines.map((item, i) => (
                            <div key={i} className="group p-5 md:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] hover:border-teal-500/50 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-teal-400 transition-colors">{item.name}</h4>
                                    <span className="text-[8px] md:text-[10px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full uppercase">{item.hours}</span>
                                </div>
                                <p className="text-slate-400 text-xs md:text-sm mb-4 leading-relaxed">{item.desc}</p>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-500 rounded-lg">
                                        <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                    </div>
                                    <span className="text-base md:text-lg font-black text-teal-500 group-hover:scale-110 transition-transform origin-left">{item.phone}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hospitals and Self Care Column */}
                    <div className="space-y-8 md:space-y-12">
                        <div className="space-y-4 md:space-y-6">
                            <h3 className="text-lg md:text-xl font-black text-white/50 uppercase tracking-widest px-2">Professional Care (Kochi)</h3>
                            <div className="space-y-4">
                                {REAL_RESOURCES.hospitals.map((hosp, i) => (
                                    <div key={i} className="p-4 md:p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl">
                                        <h5 className="font-bold text-white text-base md:text-lg">{hosp.name}</h5>
                                        <p className="text-[10px] text-slate-500 font-medium mb-2">{hosp.location} • {hosp.dept || hosp.type}</p>
                                        <p className="text-sm font-black text-teal-500">{hosp.contact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <h3 className="text-lg md:text-xl font-black text-white/50 uppercase tracking-widest px-2">Self-Care for You</h3>
                            <div className="p-6 md:p-8 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-[1.5rem] md:rounded-[2.5rem] border border-teal-500/30">
                                <div className="grid grid-cols-1 gap-4 md:gap-6">
                                    {REAL_RESOURCES.selfcare.map((sc, i) => (
                                        <div key={i} className="flex gap-3 md:gap-4">
                                            <div className="w-1.5 h-1.5 mt-2 bg-teal-400 rounded-full flex-shrink-0" />
                                            <div>
                                                <h6 className="font-bold text-teal-400 text-xs md:text-sm mb-1">{sc.title}</h6>
                                                <p className="text-slate-300 text-[10px] md:text-xs leading-relaxed">{sc.tip}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="w-full max-w-4xl border-t border-white/10 pt-8 text-center relative z-10">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
                        Saving a life starts with the first step. You are never alone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResourcesScreen;
