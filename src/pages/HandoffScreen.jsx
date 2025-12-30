import React, { useState } from 'react';
import Scenery from '../components/Scenery';

const HandoffScreen = ({
    selectedLevel,
    trust,
    audioManager,
    setGameState,
    setResolutionPhase
}) => {
    const [dialedNumber, setDialedNumber] = useState([]);

    return (
        <div className="game-container min-h-screen w-full bg-slate-900 overflow-hidden relative flex flex-col items-center justify-center p-4 handoff-container">
            {/* Persistent Branding & Controls */}
            <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-100 flex flex-col gap-2 md:gap-4">
                <img src="/ME.gif" alt="Mind Empowered" className="w-[50px] h-[50px] md:w-[80px] md:h-[80px] rounded-full border-2 md:border-4 border-white shadow-xl object-cover bg-slate-900" />

                <button
                    onClick={() => {
                        if (confirm("Abandon current mission and return to menu?")) {
                            audioManager.stopMusic();
                            setGameState('LEVEL_SELECT');
                        }
                    }}
                    className="pointer-events-auto px-4 py-1.5 bg-slate-900 border-2 border-white text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-slate-800 transition-all opacity-100"
                >
                    Exit
                </button>
            </div>

            {/* Blurred Background to focus on the task */}
            <div className="absolute inset-0 z-0 opacity-20 blur-xl scale-110">
                <Scenery theme={selectedLevel.theme} trust={trust} />
            </div>

            <div className="relative z-20 w-full max-w-[280px] md:max-w-sm bg-black rounded-[2.5rem] md:rounded-[3rem] border-[6px] md:border-[8px] border-slate-800 shadow-2xl overflow-hidden h-[75vh] md:h-[80vh] flex flex-col animate-slide-up handoff-phone-frame">
                {/* Phone Top Bar */}
                <div className="bg-slate-900 text-white p-3 md:p-4 flex justify-between items-center text-[10px] md:text-xs px-6 pt-5">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <div className="w-3.5 h-2.5 bg-white rounded-sm" />
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                </div>

                {/* Phone Screen Content - Enhanced UI */}
                <div className="flex-1 bg-white flex flex-col pt-8 pb-8 px-6 relative font-sans handoff-screen-content">

                    {/* Status Bar */}
                    <div className="absolute top-3 right-6 flex gap-1.5 opacity-50">
                        <div className="w-[3px] h-2.5 bg-black rounded-[1px]" />
                        <div className="w-[3px] h-2.5 bg-black rounded-[1px]" />
                        <div className="w-[3px] h-2.5 bg-black rounded-[1px]" />
                        <div className="w-5 h-2.5 border border-black rounded-[2px] relative ml-1">
                            <div className="absolute inset-0 bg-black m-[1px] w-[60%]" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center mt-1 mb-auto handoff-content-area">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-1 text-2xl shadow-inner">
                            🆘
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Emergency SOS</h2>

                        {/* Input Display */}
                        <div className="mt-2 mb-2 h-12 flex items-center justify-center border-b-2 border-slate-100 w-full handoff-input-display">
                            <span className="text-3xl font-light tracking-widest text-slate-900">
                                {dialedNumber.length > 0 ? dialedNumber.join('') : <span className="text-slate-200">...</span>}
                            </span>
                        </div>

                        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider mb-2 handoff-helpline">
                            Helpline: 14416 / 112
                        </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-y-2 gap-x-4 w-full max-w-[240px] mx-auto mb-2 handoff-keypad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => {
                                    if (dialedNumber.length < 10) {
                                        setDialedNumber([...dialedNumber, num]);
                                        audioManager.playDing();
                                    }
                                }}
                                className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-xl font-medium text-slate-800 flex items-center justify-center transition-all active:scale-95 active:bg-slate-200"
                            >
                                {num}
                            </button>
                        ))}
                        <div /> {/* Spacer */}
                        <button
                            onClick={() => {
                                if (dialedNumber.length < 10) {
                                    setDialedNumber([...dialedNumber, 0]);
                                    audioManager.playDing();
                                }
                            }}
                            className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-xl font-medium text-slate-800 flex items-center justify-center transition-all active:scale-95"
                        >
                            0
                        </button>
                        <button onClick={() => setDialedNumber(prev => prev.slice(0, -1))} className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
                        </button>
                    </div>

                    {/* Call Button */}
                    <button
                        onClick={() => {
                            const number = dialedNumber.join('');
                            if (number === '14416' || number === '112' || number === '988') {
                                audioManager.playPop();
                                setGameState('RESOLUTION');
                                setResolutionPhase(0);
                            } else {
                                audioManager.playSad();
                                alert("Incorrect Number. Try the Mental Health Helpline: 14416");
                                setDialedNumber([]);
                            }
                        }}
                        className="handoff-call-btn w-16 h-16 mx-auto rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-green-500/30 shadow-lg transition-transform active:scale-90 animate-pulse border-4 border-green-100"
                    >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                    </button>

                    {/* Emergency Override */}
                    <button
                        onClick={() => {
                            setDialedNumber([1, 4, 4, 1, 6]);
                        }}
                        className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-red-500 transition-colors handoff-autodial-btn"
                    >
                        Emergency Auto-Dial
                    </button>

                </div>
            </div>
        </div>
    );
};

export default HandoffScreen;
