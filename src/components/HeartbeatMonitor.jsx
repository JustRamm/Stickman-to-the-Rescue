import React, { useEffect, useState } from 'react';
import { audioManager } from '../utils/audio';

const HeartbeatMonitor = ({ trust, isActive }) => {
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
                audioManager.playHeartbeat();
            }
            setTimeout(() => setBeat(false), 200); // Visual pulse duration
        }, intervalMs);

        return () => clearInterval(interval);
    }, [bpm, isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[60] flex items-end gap-3 pointer-events-none opacity-80 mix-blend-multiply">
            {/* EKG Visualizer */}
            <div className="relative w-32 h-12 overflow-hidden bg-slate-50/50 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm flex items-center">
                <div className={`absolute w-full h-full bg-slate-100/30 ${beat ? 'opacity-20' : 'opacity-0'} transition-opacity`} />

                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    {/* The Line */}
                    <path
                        d="M0 20 L20 20 L25 10 L30 30 L35 5 L40 35 L45 20 L100 20"
                        fill="none"
                        stroke={trust < 40 ? '#ef4444' : '#0d9488'}
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

            <div className="flex flex-col mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${trust < 40 ? 'text-red-500 animate-pulse' : 'text-teal-600'}`}>
                    HR Monitor
                </span>
                <span className={`text-xl font-bold font-mono leading-none ${trust < 40 ? 'text-red-600' : 'text-slate-700'}`}>
                    {Math.round(bpm)} <span className="text-[10px] text-slate-400 font-normal">BPM</span>
                </span>
            </div>
        </div>
    );
};

export default HeartbeatMonitor;
