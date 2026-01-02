import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../data/signalScoutData';
import Scenery from '../components/Scenery';

const SignalScoutScreen = ({ audioManager, onExit, isPaused = false }) => {
    // Game State
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, END
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // Increased time
    const [people, setPeople] = useState([]);
    const [feedback, setFeedback] = useState(null); // { text, type: 'good' | 'bad' | 'miss' }
    const [foundSignals, setFoundSignals] = useState([]); // Track unique IDs found

    // Refs
    const usedScenarioIdsRef = useRef(new Set());
    const spawnTimerRef = useRef(null);
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
        if (gameState !== 'PLAYING' || isPaused) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameState('END');
                    if (audioManager) audioManager.playVictory(); // Or simple finish sound
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, isPaused]);

    // Spawning System
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const spawnPerson = () => {
            // MAX LIMIT CHECK: 10 people active max for higher density
            setPeople(currentPeople => {
                if (currentPeople.length >= 10) return currentPeople;

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

                // Prevent vertical overlap by checking existing lanes
                const occupiedLanes = currentPeople.map(p => Math.floor(p.y / 15));
                let potentialLane = Math.floor(Math.random() * 5); // 5 lanes (15, 30, 45, 60, 75)
                let attempts = 0;
                while (occupiedLanes.includes(potentialLane) && attempts < 5) {
                    potentialLane = (potentialLane + 1) % 5;
                    attempts++;
                }

                const newPerson = {
                    uid: Date.now() + Math.random(),
                    data: scenario,
                    x: isLeftStart ? -15 : 115, // Start further out
                    y: 15 + (potentialLane * 15),
                    direction: isLeftStart ? 1 : -1,
                    // Base Reading Speed (Slow in middle)
                    baseSpeed: scenario.type === 'risk' ? (0.03 + Math.random() * 0.02) : (0.05 + Math.random() * 0.02),
                    asset: getStickmanAsset(scenario.category),
                    isClicked: false
                };

                return [...currentPeople, newPerson];
            });
        };

        // Spawn multiple immediately on start to fill screen
        for (let i = 0; i < 3; i++) spawnPerson();

        // Spawn interval - Much faster spawn rate (1s)
        spawnTimerRef.current = setInterval(spawnPerson, 1000);

        return () => clearInterval(spawnTimerRef.current);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'PLAYING' || isPaused) return;

        const interval = setInterval(() => {
            setPeople(prev => prev.map(p => {
                // Dynamic Speed Curve: Fast at edges, Slow in Center [35% - 65%]
                const distFromCenter = Math.abs(p.x - 50);
                // Multiplier: 1x at center, scales up to 8x at edges
                // If dist < 15 (within center 30%), multiplier is 1.
                const speedMult = 1 + Math.max(0, (distFromCenter - 15) / 4);

                return {
                    ...p,
                    x: p.x + (p.baseSpeed * speedMult * p.direction)
                };
            }).filter(p => p.x > -20 && p.x < 120));
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [gameState, isPaused]);


    // Handle Click logic
    const handlePersonClick = (person) => {
        if (person.isClicked || gameState !== 'PLAYING' || isPaused) return;

        // Mark as clicked locally to prevent double taps
        setPeople(prev => prev.map(p => p.uid === person.uid ? { ...p, isClicked: true } : p));

        if (person.data.type === 'risk') {
            // Correct Identification
            if (audioManager) audioManager.playDing();
            setScore(prev => prev + 100);
            setFoundSignals(prev => [...prev, person.data.id]);
            setFeedback({
                text: `Signal Found: ${person.data.clue}`,
                desc: "This is a cry for help. Identifying these early is key to saving a life.",
                type: 'good',
                x: person.x,
                y: person.y,
                score: '+100'
            });
        } else {
            // False Alarm
            if (audioManager) audioManager.playSad();
            setScore(prev => Math.max(0, prev - 50));
            setFeedback({
                text: "Normal Stress",
                desc: "This person is expressing regular daily challenges, not a crisis.",
                type: 'bad',
                x: person.x,
                y: person.y,
                score: '-50'
            });
        }

        // Clear feedback after delay
        setTimeout(() => setFeedback(null), 2000);
    };


    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col overflow-hidden font-sans select-none">

            {/* Binocular Vignette Effect - Aspect Ratio Robust */}
            <div className="absolute inset-0 z-40 pointer-events-none opacity-50 mix-blend-multiply"
                style={{ background: 'radial-gradient(circle at center, transparent min(30vw, 30vh), #000 min(80vw, 80vh))' }}>
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
            <div className="flex-1 relative overflow-hidden cursor-crosshair">
                <Scenery theme="night_patrol" />

                {/* Environment Layers - Tech Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                </div>

                {/* Render People */}
                {people.map(person => (
                    <div
                        key={person.uid}
                        className="absolute group signal-scout-person"
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
                                    transition-colors duration-200 signal-scout-bubble
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
                                    alt="Person"
                                    className="w-full h-full drop-shadow-md brightness-0 invert opacity-30 group-hover:opacity-100 transition-opacity"
                                    draggable="false"
                                />
                            </div>

                        </div>
                    </div>
                ))}

                {/* Feedback Popup & Score Indicator */}
                {feedback && (
                    <div
                        className={`absolute z-[200] w-[240px] text-left px-5 py-4 rounded-2xl font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-pop-in pointer-events-none border-2 backdrop-blur-xl
                            ${feedback.type === 'good' ? 'bg-teal-900/40 text-white border-teal-500/50' : 'bg-red-900/40 text-white border-red-500/50'}
                        `}
                        style={{ left: `${feedback.x}%`, top: `${feedback.y - 20}%`, transform: 'translateX(-50%)' }}
                    >
                        {/* Score Float */}
                        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-2xl font-black animate-float-up ${feedback.type === 'good' ? 'text-teal-400' : 'text-red-400'}`}>
                            {feedback.score}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${feedback.type === 'good' ? 'bg-teal-500' : 'bg-red-500'}`}>
                                {feedback.type === 'good' ? '✓' : '⚠️'}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Analysis</span>
                        </div>
                        <h4 className="text-sm font-black mb-1 leading-tight">{feedback.text}</h4>
                        <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">{feedback.desc}</p>
                    </div>
                )}
            </div>

            {/* Intro Modal */}
            {gameState === 'INTRO' && (
                <div className="absolute inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 signal-scout-intro-container">
                    <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center shadow-2xl animate-scale-in relative overflow-hidden signal-scout-intro-card">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-indigo-500"></div>

                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border-4 border-white signal-scout-intro-icon">
                            🔭
                        </div>

                        <h2 className="text-3xl font-black uppercase text-slate-800 mb-2 tracking-tight signal-scout-intro-title">Signal Scout</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed px-4 signal-scout-intro-desc">
                            Identify people showing <strong className="text-red-500 bg-red-50 px-1 rounded">Suicide Warning Signs</strong>.
                            <br />Tap their speech bubbles to intervene.
                        </p>

                        <div className="space-y-3 mb-8 text-left signal-scout-intro-examples">
                            <div className="flex items-center gap-4 bg-teal-50 p-3 rounded-xl border border-teal-100">
                                <span className="text-2xl">🎁</span>
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
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 signal-scout-start-btn"
                        >
                            <span>Start Patrol</span> ➔
                        </button>
                    </div>
                </div>
            )}

            {/* End Modal */}
            {gameState === 'END' && (
                <div className="absolute inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 signal-scout-end-container">
                    <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center shadow-2xl animate-scale-in border-4 border-slate-100 signal-scout-end-card">
                        <h2 className="text-2xl font-black uppercase text-slate-400 mb-6 tracking-widest signal-scout-end-title">Patrol Ended</h2>

                        <div className="relative py-8 mb-8 signal-scout-end-score-area">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <div className="w-32 h-32 bg-teal-500 rounded-full blur-2xl"></div>
                            </div>
                            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full mb-2 inline-block">Final Score</span>
                            <div className="text-7xl font-black text-slate-800 tracking-tighter">{score}</div>
                        </div>

                        <div className="flex flex-col gap-3 signal-scout-end-buttons">
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
