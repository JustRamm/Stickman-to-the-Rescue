import React, { useMemo } from 'react';

const Scenery = ({ theme = 'park', trust = 50 }) => {
    const isHighTrust = trust >= 70;
    const isLowTrust = trust < 30;

    // Calculate dynamic styles based on trust
    const saturation = isLowTrust ? Math.max(0, trust / 30) : (1 + (trust > 80 ? 0.3 : 0));
    const brightness = isLowTrust ? 0.6 + (trust / 150) : 1 + ((trust - 50) / 200);
    const contrast = isLowTrust ? 1.2 : 1;
    const worldFilter = `saturate(${saturation}) brightness(${brightness}) contrast(${contrast})`;

    // Dynamic Sky Colors
    const skyTop = isHighTrust ? '#bfdbfe' : (isLowTrust ? '#1e293b' : '#e0f2fe'); // Blue sky vs Dark Grey
    const skyBottom = isHighTrust ? '#eff6ff' : (isLowTrust ? '#0f172a' : '#f0f9ff');

    const rainIntensity = isLowTrust ? '0.2s' : '0.5s'; // Faster rain when low trust
    const windSpeed = isLowTrust ? '1s' : '3s';

    // God Rays for High Trust
    const GodRays = () => (
        isHighTrust && (
            <div className="absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay">
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0)_0deg,rgba(255,255,255,0.8)_20deg,rgba(255,255,255,0)_40deg)] animate-[spin_60s_linear_infinite]" />
            </div>
        )
    );

    // Dark Vignette for Low Trust
    const LowTrustVignette = () => (
        <div
            className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-1000"
            style={{
                background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
                opacity: isLowTrust ? 0.8 : 0
            }}
        />
    );

    if (theme === 'office') {
        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#0f172a] border-b-[20vh] border-slate-900 transition-all duration-1000"
                style={{ filter: worldFilter }}
            >
                {/* Midnight City Window Views */}
                <div className="absolute top-10 inset-x-0 flex justify-between px-10 h-64">
                    {[1, 2].map(windowId => (
                        <div key={windowId} className="w-[45%] md:w-[40%] h-full bg-slate-950 border-[6px] border-slate-800 rounded-sm relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
                            {/* Sky inside window */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-[#1e1b4b] opacity-80" />

                            {/* Distant City Skyline */}
                            <div className="absolute bottom-0 left-0 right-0 flex items-end opacity-40">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-black flex flex-wrap content-end justify-center p-[1px] gap-[1px]"
                                        style={{
                                            width: `${10 + Math.random() * 20}px`,
                                            height: `${30 + Math.random() * 100}px`,
                                            marginRight: '2px'
                                        }}
                                    >
                                        {[...Array(Math.floor(Math.random() * 12))].map((__, j) => (
                                            <div key={j} className={`w-[2px] h-[2px] ${Math.random() > 0.8 ? 'bg-yellow-200/60 shadow-[0_0_2px_yellow]' : 'bg-transparent'}`} />
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Faint rain on window if low trust */}
                            {isLowTrust && (
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] mix-blend-screen" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Ceiling Lights - Flicker if low trust */}
                <div className="absolute top-0 inset-x-0 flex justify-around px-20">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-32 h-1.5 bg-white/40 shadow-[0_0_60px_rgba(255,255,255,0.15)] ${isLowTrust ? 'animate-pulse' : ''}`} />
                    ))}
                </div>

                {/* Background Cubicles & Equipment */}
                <div className="absolute bottom-[25%] inset-x-0 flex justify-around items-end opacity-60">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-48 h-24 bg-slate-800 border-t border-slate-700 rounded-t-lg relative shadow-2xl">
                                {/* Glowing Monitor */}
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-16 h-10 bg-slate-900 border border-slate-700 rounded-sm flex items-center justify-center overflow-hidden">
                                    <div className={`w-full h-full ${i % 2 === 0 ? 'bg-blue-400/20' : 'bg-teal-400/15'} animate-shimmer`} />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-3 bg-slate-900" />

                                {/* Faint Office Supplies */}
                                <div className="absolute top-2 left-4 w-6 h-1 bg-slate-700 rounded-full opacity-30" />
                                <div className="absolute top-2 right-4 w-4 h-4 bg-slate-700 rounded-sm opacity-20" />
                            </div>
                            <div className="w-1.5 h-32 bg-slate-400/5" />
                        </div>
                    ))}
                </div>

                {/* Server Rack with Blinking Lights */}
                <div className="absolute top-24 left-[5%] w-20 h-72 bg-slate-950 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col p-2 gap-1 overflow-hidden opacity-90">
                    <div className="flex justify-between px-1 mb-1 border-b border-slate-800 pb-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full" />
                        <div className="w-1 h-1 bg-green-500 rounded-full" />
                    </div>
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${Math.random() > 0.6 ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}
                            style={{ animationDuration: `${Math.random() * 2 + 0.5}s`, alignSelf: Math.random() > 0.5 ? 'flex-start' : 'flex-end', opacity: Math.random() * 0.5 + 0.5 }}
                        />
                    ))}
                </div>

                {/* Water Cooler with Glow */}
                <div className="absolute bottom-[25%] right-[10%] flex flex-col items-center opacity-70">
                    <div className="w-7 h-9 bg-blue-300/30 rounded-t-xl backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                    <div className="w-9 h-20 bg-slate-800 rounded-b-lg border-l-2 border-slate-700" />
                </div>

                {/* Floor Reflections */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-b from-slate-900 to-black opacity-100">
                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-20 translate-y-20" />
                </div>

                <LowTrustVignette />
            </div>
        );
    }

    if (theme === 'campus') {
        const brickColor = '#7f1d1d'; // Red brick
        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
                style={{ filter: worldFilter, background: `linear-gradient(to b, ${isHighTrust ? '#bae6fd' : '#cbd5e1'}, ${isHighTrust ? '#e0f2fe' : '#f1f5f9'})` }}
            >
                {/* Distant Trees reflecting season */}
                <div className="absolute bottom-[25%] inset-x-0 h-1 bg-amber-900/20" /> {/* Ground line */}

                {/* University Buildings (Brick Style) */}
                <div className="absolute bottom-[25%] left-0 right-0 flex justify-center items-end gap-0 opacity-80">
                    {/* Left Wing */}
                    <div className="w-64 h-48 bg-red-900/80 relative border-r border-red-950 flex flex-wrap content-start p-4 gap-2">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-8 h-12 bg-sky-200/30 border border-white/20" /> // Windows
                        ))}
                    </div>
                    {/* Clock Tower */}
                    <div className="w-32 h-80 bg-red-950 relative flex flex-col items-center">
                        <div className="w-full h-12 bg-slate-800 absolute -top-12 flex justify-center items-center">
                            {/* Clock Face */}
                            <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-lg relative -top-4">
                                <div className="absolute w-0.5 h-6 bg-slate-900 bottom-1/2 left-1/2 origin-bottom rotate-[45deg]" />
                                <div className="absolute w-0.5 h-4 bg-slate-900 bottom-1/2 left-1/2 origin-bottom -rotate-[90deg]" />
                            </div>
                        </div>
                        <div className="mt-16 w-16 h-48 border-l border-r border-white/10" />
                    </div>
                    {/* Right Wing */}
                    <div className="w-64 h-48 bg-red-900/80 relative border-l border-red-950 flex flex-wrap content-start p-4 gap-2">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-8 h-12 bg-sky-200/30 border border-white/20" /> // Windows
                        ))}
                    </div>
                </div>

                {/* Falling Leaves (Autumn Vibe) */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-orange-500 rounded-tr-lg opacity-80 animate-rain-drop"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}%`,
                                animationDuration: `${5 + Math.random() * 5}s`,
                                animationDelay: `${Math.random() * 5}s`,
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        />
                    ))}
                </div>

                {/* Grass/Lawn */}
                <div className="absolute bottom-0 inset-x-0 h-[30%] bg-gradient-to-b from-green-800 to-green-900" />
                <GodRays />
                <LowTrustVignette />
            </div>
        );
    }

    if (theme === 'rainy_street') {
        const trustFactor = trust / 100;
        const skyColorTop = trust < 30 ? '#0f172a' : (trust > 70 ? '#64748b' : '#334155');
        const skyColorBottom = trust < 30 ? '#1e293b' : (trust > 70 ? '#94a3b8' : '#475569');

        // MEMOIZE BUILDINGS to stop them from changing on every re-render (which caused the "fast moving" glitch)
        const buildings = useMemo(() => {
            return [...Array(10)].map(() => ({
                width: 5 + Math.random() * 10,
                height: 10 + Math.random() * 40,
                windows: [...Array(Math.floor(Math.random() * 6))].map(() => Math.random() > 0.7)
            }));
        }, []);

        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
                style={{ filter: worldFilter, background: `linear-gradient(to b, ${skyColorTop}, ${skyColorBottom})` }}
            >
                {/* City Skyline Silhouette */}
                <div className="absolute bottom-[25%] left-0 right-0 flex items-end opacity-60">
                    {buildings.map((building, i) => (
                        <div
                            key={i}
                            className="bg-slate-800 flex flex-wrap content-end justify-center p-1 gap-1"
                            style={{
                                width: `${building.width}%`,
                                height: `${building.height}vh`,
                                marginRight: '2px'
                            }}
                        >
                            {/* Lit Windows */}
                            {building.windows.map((isLit, j) => (
                                <div key={j} className={`w-1 h-2 ${isLit ? 'bg-yellow-200 shadow-[0_0_5px_yellow]' : 'bg-slate-900'} opacity-70`} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Street Lamp */}
                <div className="absolute bottom-[25%] right-[10%] w-2 h-64 bg-slate-900 flex flex-col items-center">
                    <div className="w-16 h-4 bg-slate-900 absolute top-0 rounded-t-xl" />
                    <div className="w-12 h-8 bg-yellow-100/20 absolute top-4 blur-md animate-pulse shadow-[0_0_40px_rgba(253,224,71,0.2)]" />
                    <div className="w-1.5 h-full bg-slate-800" />
                </div>

                {/* Wet Pavement Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-slate-900 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]" />
                </div>

                {/* Horizon Line */}
                <div className="absolute bottom-[25%] left-0 right-0 h-1 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />

                {/* Rain Particles - Always visible in Rainy theme or low trust */}
                {(theme === 'rainy_street' || !isHighTrust) && (
                    <div className="absolute inset-0">
                        {[...Array(trust < 30 ? 150 : 60)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-px h-12 bg-gray-400/30 animate-rain-drop"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-${Math.random() * 20}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${(isLowTrust ? 0.3 : 0.6) + Math.random() * 0.4}s`,
                                    opacity: isLowTrust ? 0.8 : 0.4
                                }}
                            />
                        ))}
                    </div>
                )}
                <GodRays />
                <LowTrustVignette />
            </div>
        );
    }

    // Default Park Theme (Enhanced)
    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
            style={{ filter: worldFilter, background: `linear-gradient(to b, ${skyTop}, ${skyBottom})` }}
        >
            {/* Rolling Hills Background */}
            <div className="absolute bottom-[25%] left-0 right-0 h-32 bg-emerald-700/80 rounded-[50%] blur-xl translate-y-12 scale-150 opacity-60" />

            {/* Clouds */}
            {!isLowTrust && (
                <div className="absolute top-10 inset-x-0 h-64 opacity-60">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white/60 rounded-full blur-xl animate-[stickman-walk_20s_linear_infinite]"
                            style={{
                                width: '150px',
                                height: '60px',
                                top: `${Math.random() * 50}%`,
                                left: `${i * 25}%`,
                                animationDuration: `${30 + Math.random() * 20}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Storm Clouds for Low Trust */}
            {isLowTrust && (
                <div className="absolute top-0 inset-x-0 h-full bg-slate-900/30">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-slate-800/80 rounded-full blur-2xl"
                            style={{
                                width: '250px',
                                height: '100px',
                                top: `${Math.random() * 20}%`,
                                left: `${i * 20}%`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* City Skyline Far Away */}
            <div className="absolute bottom-[25%] left-0 right-0 flex justify-around items-end px-12 opacity-10 blur-sm">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2 items-end">
                        <div className="w-10 h-32 bg-slate-900 rounded-t-sm" />
                        <div className="w-12 h-20 bg-slate-900 rounded-t-sm" />
                    </div>
                ))}
            </div>
            <div className="absolute bottom-[25%] left-0 right-0 h-1 bg-emerald-200" />

            {/* Animated Birds */}
            {!isLowTrust && (
                <div className="absolute top-20 left-0 w-full h-40">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`absolute animate-bird-fly-${i}`} style={{ top: `${i * 15}%`, left: '-10%' }}>
                            <div className="flex gap-1 animate-pulse">
                                <div className="w-3 h-1 border-t-2 border-slate-700 -rotate-[30deg] origin-right" />
                                <div className="w-3 h-1 border-t-2 border-slate-700 rotate-[30deg] origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Trees with realistic colors */}
            <div className="absolute inset-x-0 bottom-[25%] flex justify-between px-20">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className={`relative flex flex-col items-center transition-all duration-1000 ${i % 2 === 0 ? 'scale-90 opacity-80' : 'translate-y-2 opacity-90'}`}>
                        {/* Trunk */}
                        <div className="w-3 h-32 bg-amber-900 rounded-sm" />
                        {/* Foliage */}
                        <div className={`absolute -top-10 w-24 h-24 rounded-full shadow-lg transition-colors duration-1000 ${isLowTrust ? 'bg-emerald-900' : 'bg-emerald-500'}`} />
                        <div className={`absolute -top-16 left-4 w-20 h-20 rounded-full shadow-md transition-colors duration-1000 ${isLowTrust ? 'bg-emerald-800' : 'bg-emerald-400'}`} />

                        {/* Flowers blooming at base when trust is high */}
                        {isHighTrust && (
                            <div className="absolute bottom-0 flex gap-4 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                                <div className="w-2 h-2 rounded-full bg-pink-400" />
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Ground Grass */}
            <div className="absolute bottom-0 inset-x-0 h-[30%] bg-gradient-to-b from-emerald-800 to-emerald-900" />

            <GodRays />
            <LowTrustVignette />
        </div>
    );
};

export default Scenery;
