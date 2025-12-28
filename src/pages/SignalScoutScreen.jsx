import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../data/signalScoutData';

const SignalScoutScreen = ({ audioManager, onExit }) => {
    // Game State
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, END
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // Increased time
    const [people, setPeople] = useState([]);
    const [feedback, setFeedback] = useState(null); // { text, type: 'good' | 'bad' | 'miss' }
    const [foundSignals, setFoundSignals] = useState([]); // Track unique IDs found
    // --- Enhanced Asset Mapping ---
    const getStickmanAsset = (category) => {
        const assets = {
            'Youth': ['/stickman_assets/stickman_laptop.svg', '/stickman_assets/stickman_phone.svg', '/stickman_assets/thinking_stickman.svg', '/stickman_assets/girl_idle.svg'],
            'Elderly': ['/stickman_assets/sad_stickman.svg', '/stickman_assets/empty_stickman.svg', '/stickman_assets/stickman_group.svg'],
            'Men': ['/stickman_assets/guy_distressed.svg', '/stickman_assets/guy_idle.svg', '/stickman_assets/guy_walk_right.svg', '/stickman_assets/stickman_phone.svg'],
            'Women': ['/stickman_assets/girl_walk_right.svg', '/stickman_assets/girl_idle.svg', '/stickman_assets/thinking_stickman.svg', '/stickman_assets/dog_walker.svg']
        };

        const categoryAssets = assets[category] || assets['Youth'];
        return categoryAssets[Math.floor(Math.random() * categoryAssets.length)];
    };

    // --- Game Logic ---

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setTimeLeft(60);
        setPeople([]);
        setFoundSignals([]);
        usedScenarioIdsRef.current = new Set(); // Reset used scenarios
        if (audioManager) audioManager.startAmbient('park');
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('END');
                    if (audioManager) audioManager.playVictory(); // Or simple finish sound
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    // Spawning System
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const spawnPerson = () => {
            // MAX LIMIT CHECK: 8 people active max
            setPeople(currentPeople => {
                if (currentPeople.length >= 8) return currentPeople;

                // CRITICAL: We need to know what IDs are currently on screen + what have been used previously
                const availableScenarios = SCENARIOS.filter(s => !usedScenarioIdsRef.current.has(s.id));

                if (availableScenarios.length === 0) {
                    // Optional: Reset if all used? Or just stop spawning?
                    // For now, let's reset to keep game going if needed, or just stop
                    if (usedScenarioIdsRef.current.size >= SCENARIOS.length) {
                        // Reset if we ran out, to allow infinite play until time is up
                        usedScenarioIdsRef.current = new Set();
                        return currentPeople;
                    }
                    return currentPeople;
                }

                const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];

                // Mark as used
                usedScenarioIdsRef.current.add(scenario.id);

                const isLeftStart = Math.random() > 0.5;

                const newPerson = {
                    uid: Date.now() + Math.random(), // Unique ID for key
                    data: scenario,
                    x: isLeftStart ? -15 : 115, // Start further off-screen
                    y: 15 + Math.random() * 60, // Conserve vertical lanes better
                    direction: isLeftStart ? 1 : -1,
                    speed: 0.15 + Math.random() * 0.1, // FASTER MOVEMENT SPEEDS (was 0.03)
                    asset: getStickmanAsset(scenario.category),
                    isClicked: false
                };

                return [...currentPeople, newPerson];
            });
        };

        // Spawn immediately on start
        spawnPerson();

        // Spawn interval
        spawnTimerRef.current = setInterval(spawnPerson, 2000);

        return () => clearInterval(spawnTimerRef.current);
    }, [gameState]);

    // Movement Loop using RequestAnimationFrame via Interval for React simplicity
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const interval = setInterval(() => {
            setPeople(prev => prev.map(p => ({
                ...p,
                x: p.x + (p.speed * p.direction)
            })).filter(p => p.x > -20 && p.x < 120)); // Remove when off-screen
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [gameState]);


    // Handle Click logic
    const handlePersonClick = (person) => {
        if (person.isClicked || gameState !== 'PLAYING') return;

        // Mark as clicked locally to prevent double taps
        setPeople(prev => prev.map(p => p.uid === person.uid ? { ...p, isClicked: true } : p));

        if (person.data.type === 'risk') {
            // Correct Identification
            if (audioManager) audioManager.playDing();
            setScore(prev => prev + 100);
            setFoundSignals(prev => [...prev, person.data.id]);
            setFeedback({ text: `Correct! ${person.data.clue}`, type: 'good', x: person.x, y: person.y });
        } else {
            // False Alarm
            if (audioManager) audioManager.playSad();
            setScore(prev => Math.max(0, prev - 50));
            setFeedback({ text: "Just normal stress.", type: 'bad', x: person.x, y: person.y });
        }

        // Clear feedback after delay
        setTimeout(() => setFeedback(null), 2000);
    };


    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col overflow-hidden font-sans select-none">

            {/* Binocular Vignette Effect */}
            <div className="absolute inset-0 z-40 pointer-events-none opacity-40 mix-blend-multiply"
                style={{ background: 'radial-gradient(circle at center, transparent 40%, #000 90%)' }}>
            </div>

            {/* Header / HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onExit}
                        className="pointer-events-auto w-10 h-10 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-all border border-white/10"
                    >
                        ✕
                    </button>
                    <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border-l-4 border-teal-500 shadow-lg">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Score</span>
                        <span className="text-2xl font-black text-white leading-none">{score}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center bg-black/30 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                    <span className={`text-2xl font-black tabular-nums ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                    <span className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Time Left</span>
                </div>
            </div>

            {/* Game World */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-700 to-slate-900 overflow-hidden cursor-crosshair">

                {/* Environment Layers */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* Render People */}
                {people.map(person => (
                    <div
                        key={person.uid}
                        className="absolute transition-all duration-300 ease-out group"
                        style={{
                            left: `${person.x}%`,
                            top: `${person.y}%`,
                            zIndex: Math.floor(person.y), // Depth sorting
                            width: 'clamp(80px, 15vw, 120px)', // Responsive width
                        }}
                    >
                        {/* Wrapper for Click Handling & Scaling */}
                        <div
                            className={`relative transition-all duration-300 ${person.isClicked ? 'scale-95 opacity-50 grayscale' : 'hover:scale-105'}`}
                            onClick={() => handlePersonClick(person)}
                        >

                            {/* Speech Bubble Cue - EMOJI REMOVED */}
                            <div
                                className={`
                                    relative bg-white text-slate-900 p-3 rounded-2xl shadow-xl border-2 mb-2 cursor-pointer
                                    ${person.data.type === 'risk' ? 'border-red-100 hover:border-red-300' : 'border-blue-50 hover:border-blue-200'}
                                    transition-colors duration-200
                                `}
                            >
                                <p className="text-[10px] md:text-xs font-bold leading-snug">{person.data.text}</p>
                                {/* Tail */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-inherit transform rotate-45"></div>
                            </div>

                            {/* Stickman Asset */}
                            <div className={`h-24 md:h-32 w-full flex justify-center ${person.direction === -1 ? '-scale-x-100' : ''}`}>
                                <img
                                    src={person.asset}
                                    className="h-full object-contain drop-shadow-2xl filter brightness-90 group-hover:brightness-110"
                                    draggable="false"
                                />
                            </div>

                        </div>
                    </div>
                ))}

                {/* Feedback Popup */}
                {feedback && (
                    <div
                        className={`absolute z-[200] max-w-[200px] text-center px-4 py-3 rounded-xl font-bold text-xs shadow-2xl animate-bounce-subtle pointer-events-none border-2 backdrop-blur-md
                            ${feedback.type === 'good' ? 'bg-teal-500/90 text-white border-teal-300' : 'bg-slate-800/90 text-red-300 border-red-500/50'}
                        `}
                        style={{ left: `${feedback.x}%`, top: `${feedback.y - 15}%`, transform: 'translateX(-50%)' }}
                    >
                        <span className="block text-lg mb-1">{feedback.type === 'good' ? '✅' : '⚠️'}</span>
                        {feedback.text}
                    </div>
                )}
            </div>

            {/* Intro Modal */}
            {gameState === 'INTRO' && (
                <div className="absolute inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center shadow-2xl animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-indigo-500"></div>

                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border-4 border-white">
                            🔭
                        </div>

                        <h2 className="text-3xl font-black uppercase text-slate-800 mb-2 tracking-tight">Signal Scout</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed px-4">
                            Identify people showing <strong className="text-red-500 bg-red-50 px-1 rounded">Suicide Warning Signs</strong>.
                            <br />Tap their speech bubbles to intervene.
                        </p>

                        <div className="space-y-3 mb-8 text-left">
                            <div className="flex items-center gap-4 bg-teal-50 p-3 rounded-xl border border-teal-100">
                                <span className="text-2xl">�</span>
                                <div>
                                    <p className="text-xs font-bold text-teal-800 uppercase">Warning Sign</p>
                                    <p className="text-[10px] text-teal-600">"Giving away prized possessions"</p>
                                </div>
                                <span className="ml-auto font-black text-teal-400">TAP ✅</span>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 opacity-60">
                                <span className="text-2xl">😤</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Normal Stress</p>
                                    <p className="text-[10px] text-slate-400">"Traffic is terrible today"</p>
                                </div>
                                <span className="ml-auto font-black text-slate-300">IGNORE ❌</span>
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span>Start Patrol</span> ➔
                        </button>
                    </div>
                </div>
            )}

            {/* End Modal */}
            {gameState === 'END' && (
                <div className="absolute inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center shadow-2xl animate-scale-in border-4 border-slate-100">
                        <h2 className="text-2xl font-black uppercase text-slate-400 mb-6 tracking-widest">Patrol Ended</h2>

                        <div className="relative py-8 mb-8">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <div className="w-32 h-32 bg-teal-500 rounded-full blur-2xl"></div>
                            </div>
                            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full mb-2 inline-block">Final Score</span>
                            <div className="text-7xl font-black text-slate-800 tracking-tighter">{score}</div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            >
                                Play Again ↺
                            </button>
                            <button
                                onClick={onExit}
                                className="w-full py-4 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest rounded-xl transition-all"
                            >
                                Return to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SignalScoutScreen;
