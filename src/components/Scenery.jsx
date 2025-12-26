import React from 'react';

const Scenery = ({ theme = 'park', trust = 50 }) => {
    const isHighTrust = trust >= 70;
    const isLowTrust = trust < 30;

    // Calculate dynamic styles based on trust
    const saturation = isLowTrust ? Math.max(0, trust / 30) : 1;
    const brightness = isLowTrust ? 0.8 : 1 + ((trust - 50) / 200);
    const worldFilter = `saturate(${saturation}) brightness(${brightness})`;

    // Dynamic Sky Colors
    const skyTop = isHighTrust ? '#ffb347' : (isLowTrust ? '#475569' : '#f1f5f9');
    const skyBottom = isHighTrust ? '#ffcc33' : (isLowTrust ? '#1e293b' : '#f8fafc');

    if (theme === 'office') {
        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-slate-900 border-b-[20vh] border-slate-800 transition-all duration-1000"
                style={{ filter: worldFilter }}
            >
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-slate-950 border-4 border-slate-700 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-1 h-1 bg-yellow-100/30" style={{ left: `${Math.random() * 100}%`, top: `${60 + Math.random() * 30}%` }} />
                    ))}
                </div>
                <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-[90%] h-4 bg-slate-700 rounded-full shadow-2xl" />
                <div className={`absolute bottom-[35%] right-[25%] w-40 h-32 blur-3xl transition-colors duration-1000 ${isHighTrust ? 'bg-orange-400/20' : 'bg-teal-500/10'}`} />
                <div className={`absolute bottom-[40%] right-[30%] w-24 h-16 border rounded-lg shadow-2xl transition-all duration-1000 ${isHighTrust ? 'bg-orange-400/20 border-orange-400/30 shadow-orange-500/20' : 'bg-teal-400/20 border-teal-400/30 shadow-teal-500/20'}`} />
            </div>
        );
    }

    if (theme === 'campus') {
        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
                style={{ filter: worldFilter, backgroundColor: isHighTrust ? '#fff7ed' : (isLowTrust ? '#f1f5f9' : '#fffafb') }}
            >
                <div className="absolute bottom-[30%] left-0 right-0 h-1 bg-slate-200" />
                <div className="absolute inset-x-0 bottom-[30%] flex justify-around px-20">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="relative w-4 h-64 bg-slate-200 opacity-40">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-100 rounded-full border border-slate-200" />
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-[30%] left-0 right-0 flex justify-center gap-20">
                    <div className={`w-40 h-20 rounded-full blur-2xl -translate-y-10 transition-colors duration-1000 ${isHighTrust ? 'bg-orange-400/20' : 'bg-teal-600/10'}`} />
                    <div className={`w-40 h-20 rounded-full blur-2xl -translate-y-8 transition-colors duration-1000 ${isHighTrust ? 'bg-orange-400/20' : 'bg-teal-600/10'}`} />
                </div>
            </div>
        );
    }

    if (theme === 'rainy_street') {
        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
                style={{ filter: worldFilter, backgroundColor: isLowTrust ? '#0f172a' : '#cbd5e1' }}
            >
                <div className="absolute inset-0 bg-slate-900/20" />
                <div className="absolute bottom-[30%] left-0 right-0 h-2 bg-slate-400" />
                {!isHighTrust && (
                    <div className="absolute inset-0">
                        {[...Array(isLowTrust ? 60 : 30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 h-10 bg-white/20 animate-rain-drop"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-${Math.random() * 20}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${(isLowTrust ? 0.3 : 0.5) + Math.random() * 0.5}s`
                                }}
                            />
                        ))}
                    </div>
                )}
                <div className={`absolute bottom-[28%] left-[20%] w-32 h-2 rounded-full blur-sm transition-colors duration-1000 ${isHighTrust ? 'bg-teal-400/40' : 'bg-teal-400/20'}`} />
            </div>
        );
    }

    // Default Park Theme
    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
            style={{ filter: worldFilter, background: `linear-gradient(to b, ${skyTop}, ${skyBottom})` }}
        >
            <div className="absolute bottom-[30%] left-0 right-0 flex justify-around items-end px-12 opacity-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2 items-end">
                        <div className="w-10 h-32 bg-slate-900 rounded-t-sm" />
                        <div className="w-12 h-20 bg-slate-900 rounded-t-sm" />
                    </div>
                ))}
            </div>
            <div className="absolute bottom-[30%] left-0 right-0 h-1 bg-slate-200" />

            {/* Animated Birds - Stop flying if low trust */}
            {!isLowTrust && (
                <div className="absolute top-20 left-0 w-full h-40">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`absolute animate-bird-fly-${i}`} style={{ top: `${i * 15}%`, left: '-10%' }}>
                            <div className="flex gap-1 animate-pulse">
                                <div className="w-3 h-1 border-t-2 border-slate-400 -rotate-[30deg] origin-right" />
                                <div className="w-3 h-1 border-t-2 border-slate-400 rotate-[30deg] origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Trees */}
            <div className="absolute inset-x-0 bottom-[30%] flex justify-between px-20">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className={`relative flex flex-col items-center transition-all duration-1000 ${i % 2 === 0 ? 'scale-75 opacity-20' : 'translate-y-4 opacity-30'}`}>
                        <div className={`w-1 h-48 rounded-full transition-colors duration-1000 ${isLowTrust ? 'bg-slate-300' : 'bg-slate-400'}`} />
                        <div className={`absolute top-0 w-32 h-32 border-2 rounded-full transition-colors duration-1000 ${isLowTrust ? 'border-slate-300' : 'border-slate-400'}`} />

                        {/* Flowers blooming at base when trust is high */}
                        {isHighTrust && (
                            <div className="absolute -bottom-2 flex gap-2 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                                <div className="w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_10px_orange]" />
                                <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_teal]" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Sun with Glow - Reacts to trust */}
            <div
                className="absolute top-16 right-32 transition-all duration-1000 rounded-full border shadow-2xl animate-pulse"
                style={{
                    width: isHighTrust ? '120px' : '80px',
                    height: isHighTrust ? '120px' : '80px',
                    backgroundColor: isHighTrust ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.05)',
                    borderColor: isHighTrust ? 'rgba(251, 146, 0, 0.4)' : 'rgba(251, 146, 60, 0.1)',
                    boxShadow: isHighTrust ? '0 0 100px orange' : '0 0 40px rgba(251, 146, 60, 0.1)'
                }}
            />
        </div>
    );
};

export default Scenery;
