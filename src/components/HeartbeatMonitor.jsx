import React, { useEffect, useState } from 'react';
import { audioManager } from '../utils/audio';

const HeartbeatMonitor = ({ trust, isActive = true }) => {
    const [beat, setBeat] = useState(false);

    // Calculate BPM: Trust 100 -> 60 BPM, Trust 0 -> 140 BPM
    // Higher stress/low trust = faster heart
    const bpm = Math.max(60, 140 - (trust * 0.8));
    const intervalMs = (60 / bpm) * 1000;

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setBeat(true);
            // Only play audio if initialized (browser requires interaction first)
            if (audioManager.initialized) {
                // audioManager.playHeartbeat(); // Optional: Muted by default to not annoy
            }
            setTimeout(() => setBeat(false), 200); // Visual pulse duration
        }, intervalMs);

        return () => clearInterval(interval);
    }, [bpm, isActive]);

    return (
        <div className="flex flex-col gap-1 p-3 bg-white/90 backdrop-blur-md rounded-xl border-2 border-slate-200 shadow-xl select-none transition-all">
            <div className="flex items-center gap-3">
                {/* EKG Visualizer */}
                <div className="relative w-28 h-10 overflow-hidden bg-slate-900 rounded-lg border border-slate-700 shadow-inner flex items-center">
                    <div className={`absolute w-full h-full bg-teal-500/20 ${beat ? 'opacity-30' : 'opacity-0'} transition-opacity`} />
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                        <path
                            d="M0 20 L20 20 L25 10 L30 30 L35 5 L40 35 L45 20 L100 20"
                            fill="none"
                            stroke={trust < 40 ? '#ef4444' : '#2dd4bf'}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={`transition-all duration-100`}
                            style={{
                                transform: beat ? 'scaleY(1.2)' : 'scaleY(1)',
                                transformOrigin: 'center',
                                filter: `drop-shadow(0 0 ${beat ? '4px' : '0px'} ${trust < 40 ? '#fca5a5' : '#5eead4'})`
                            }}
                        >
                            <animate
                                attributeName="stroke-dasharray"
                                from="0, 200"
                                to="200, 0"
                                dur={`${60 / bpm}s`}
                                repeatCount="indefinite"
                            />
                        </path>
                    </svg>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Heart Rate</span>
                    <span className={`text-lg font-bold font-mono leading-none ${trust < 40 ? 'text-red-500' : 'text-slate-700'}`}>
                        {Math.round(bpm)} <span className="text-[9px] text-slate-400 font-normal">BPM</span>
                    </span>
                </div>
            </div>

            {/* Explicit Empathy Bar */}
            <div className="w-full space-y-1">
                <div className="flex justify-between items-end px-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-teal-600">Empathy Level</span>
                    <span className="text-[8px] font-bold text-slate-400">{Math.round(trust)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${trust < 30 ? 'bg-red-500' : trust < 60 ? 'bg-orange-400' : 'bg-teal-500'}`}
                        style={{ width: `${trust}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HeartbeatMonitor;
