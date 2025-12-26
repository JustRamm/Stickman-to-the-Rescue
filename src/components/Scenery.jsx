import React from 'react';

const Scenery = ({ theme = 'park', trust = 50 }) => {
    const isHighTrust = trust >= 70;
    const isLowTrust = trust < 30;

    // Calculate dynamic styles based on trust
    const saturation = isLowTrust ? Math.max(0, trust / 30) : 1;
    const brightness = isLowTrust ? 0.8 : 1 + ((trust - 50) / 200);
    const worldFilter = `saturate(${saturation}) brightness(${brightness})`;

    // Dynamic Sky Colors
    const skyTop = isHighTrust ? '#bfdbfe' : (isLowTrust ? '#475569' : '#e0f2fe'); // Blue sky vs Grey
    const skyBottom = isHighTrust ? '#eff6ff' : (isLowTrust ? '#1e293b' : '#f0f9ff');

    if (theme === 'office') {
        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-slate-900 border-b-[20vh] border-slate-800 transition-all duration-1000"
                style={{ filter: worldFilter }}
            >
                {/* Ceiling Lights - Flicker if low trust */}
                <div className="absolute top-0 inset-x-0 flex justify-around px-20">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-32 h-2 bg-white/50 shadow-[0_0_50px_rgba(255,255,255,0.2)] ${isLowTrust ? 'animate-pulse' : ''}`} />
                    ))}
                </div>

                {/* Background Cubicles */}
                <div className="absolute bottom-[30%] inset-x-0 flex justify-around items-end opacity-40">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-40 h-24 bg-slate-700 border-t border-slate-600 rounded-t-lg relative">
                                {/* Computer Monitor */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-10 bg-slate-800 border border-slate-600 rounded-sm flex items-center justify-center">
                                    <div className={`w-full h-full bg-blue-400/10 ${i % 2 === 0 ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800" />
                            </div>
                            <div className="w-1 h-32 bg-slate-400/20" /> {/* Desk leg */}
                        </div>
                    ))}
                </div>

                {/* Server Rack with Blinking Lights */}
                <div className="absolute top-20 left-[10%] w-24 h-64 bg-slate-950 border border-slate-700 shadow-2xl flex flex-col p-2 gap-1 overflow-hidden">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                            style={{ animationDuration: `${Math.random() * 2 + 0.5}s`, alignSelf: Math.random() > 0.5 ? 'flex-start' : 'flex-end' }}
                        />
                    ))}
                </div>

                {/* Water Cooler */}
                <div className="absolute bottom-[30%] right-[15%] flex flex-col items-center opacity-80">
                    <div className="w-8 h-10 bg-blue-300/50 rounded-t-xl backdrop-blur-sm shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-[bounce_4s_infinite]" />
                    <div className="w-10 h-24 bg-slate-200 rounded-b-lg border-l-4 border-slate-300" />
                </div>

                {/* Floor Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-b from-slate-800 to-slate-900 opacity-90" />
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
                <div className="absolute bottom-[30%] inset-x-0 h-1 bg-amber-900/20" /> {/* Ground line */}

                {/* University Buildings (Brick Style) */}
                <div className="absolute bottom-[30%] left-0 right-0 flex justify-center items-end gap-0 opacity-80">
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
            </div>
        );
    }

    if (theme === 'rainy_street') {
        const trustFactor = trust / 100;
        const skyColorTop = trust < 30 ? '#0f172a' : (trust > 70 ? '#64748b' : '#334155');
        const skyColorBottom = trust < 30 ? '#1e293b' : (trust > 70 ? '#94a3b8' : '#475569');

        return (
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000"
                style={{ filter: worldFilter, background: `linear-gradient(to b, ${skyColorTop}, ${skyColorBottom})` }}
            >
                {/* City Skyline Silhouette */}
                <div className="absolute bottom-[30%] left-0 right-0 flex items-end opacity-60">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-slate-800 flex flex-wrap content-end justify-center p-1 gap-1"
                            style={{
                                width: `${5 + Math.random() * 10}%`,
                                height: `${10 + Math.random() * 40}vh`,
                                marginRight: '2px'
                            }}
                        >
                            {/* Lit Windows */}
                            {[...Array(Math.floor(Math.random() * 6))].map((__, j) => (
                                <div key={j} className={`w-1 h-2 ${Math.random() > 0.7 ? 'bg-yellow-200 shadow-[0_0_5px_yellow]' : 'bg-slate-900'} opacity-70`} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Street Lamp */}
                <div className="absolute bottom-[30%] right-[10%] w-2 h-64 bg-slate-900 flex flex-col items-center">
                    <div className="w-16 h-4 bg-slate-900 absolute top-0 rounded-t-xl" />
                    <div className="w-12 h-8 bg-yellow-100/20 absolute top-4 blur-md animate-pulse shadow-[0_0_40px_rgba(253,224,71,0.2)]" />
                    <div className="w-1.5 h-full bg-slate-800" />
                </div>

                {/* Wet Pavement Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-slate-900 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]" />
                </div>

                {/* Horizon Line */}
                <div className="absolute bottom-[30%] left-0 right-0 h-1 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />

                {/* Rain Particles */}
                {!isHighTrust && (
                    <div className="absolute inset-0">
                        {[...Array(trust < 30 ? 100 : 50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-px h-12 bg-white/20 animate-rain-drop"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-${Math.random() * 20}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${(trust < 30 ? 0.3 : 0.6) + Math.random() * 0.4}s`
                                }}
                            />
                        ))}
                    </div>
                )}
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
            <div className="absolute bottom-[25%] left-0 right-0 h-32 bg-emerald-700 rounded-[50%] blur-xl translate-y-12 scale-150 opacity-60" />

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

            {/* City Skyline Far Away */}
            <div className="absolute bottom-[30%] left-0 right-0 flex justify-around items-end px-12 opacity-10 blur-sm">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2 items-end">
                        <div className="w-10 h-32 bg-slate-900 rounded-t-sm" />
                        <div className="w-12 h-20 bg-slate-900 rounded-t-sm" />
                    </div>
                ))}
            </div>
            <div className="absolute bottom-[30%] left-0 right-0 h-1 bg-emerald-200" />

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
            <div className="absolute inset-x-0 bottom-[30%] flex justify-between px-20">
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
                                <div className="w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_5px_pink]" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_5px_purple]" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Sun with Glow */}
            <div
                className="absolute top-10 right-20 transition-all duration-1000 rounded-full border shadow-2xl animate-pulse"
                style={{
                    width: isHighTrust ? '100px' : '60px',
                    height: isHighTrust ? '100px' : '60px',
                    backgroundColor: isHighTrust ? '#fdba74' : '#fff7ed',
                    boxShadow: isHighTrust ? '0 0 60px orange' : '0 0 20px white',
                    opacity: isLowTrust ? 0.2 : 1
                }}
            />

            {/* Grass Foreground */}
            <div className="absolute bottom-0 inset-x-0 h-[30%] bg-gradient-to-b from-emerald-600 to-emerald-800" />
        </div>
    );
};

export default Scenery;
