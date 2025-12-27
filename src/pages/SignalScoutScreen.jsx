import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../data/signalScoutData';

const SignalScoutScreen = ({ audioManager, onExit }) => {
    // Game State
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, END
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [people, setPeople] = useState([]);
    const [feedback, setFeedback] = useState(null); // { text, type: 'good' | 'bad' | 'miss' }
    const [foundSignals, setFoundSignals] = useState([]); // Track unique IDs found

    const game loopRef = useRef(null);
    const spawnTimerRef = useRef(null);

    // --- Asset Mapping based on Category ---
    const getStickmanAsset = (category) => {
        switch (category) {
            case 'Youth': return '/stickman_assets/thinking_stickman.svg';
            case 'Elderly': return '/stickman_assets/sad_stickman.svg'; // Reuse sad for elderly base
            case 'Men': return '/stickman_assets/guy_distressed.svg';
            case 'Women': return '/stickman_assets/thinking_stickman.svg';
            default: return '/stickman_assets/thinking_stickman.svg';
        }
    };

    // --- Game Logic ---

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setTimeLeft(45);
        setPeople([]);
        setFoundSignals([]);
        if (audioManager) audioManager.startAmbient('park'); // Reuse park ambient
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
            const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
            const isLeftStart = Math.random() > 0.5;

            const newPerson = {
                uid: Date.now() + Math.random(), // Unique ID for key
                data: scenario,
                x: isLeftStart ? -10 : 110, // Start off-screen
                y: 15 + Math.random() * 60, // Random vertical lane
                direction: isLeftStart ? 1 : -1,
                speed: 0.1 + Math.random() * 0.15, // Random speed
                asset: getStickmanAsset(scenario.category),
                isClicked: false
            };

            setPeople(prev => [...prev, newPerson]);
        };

        // Initial spawn
        spawnPerson();
        spawnPerson();

        // Interval spawn
        spawnTimerRef.current = setInterval(spawnPerson, 1800); // Spawn every 1.8s

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
        setTimeout(() => setFeedback(null), 1500);
    };


    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col overflow-hidden font-sans select-none">

            {/* Header / HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={onExit}
                        className="pointer-events-auto px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
                    >
                        <span>✕</span> Exit
                    </button>
                    <div className="mt-2 bg-slate-900/50 backdrop-blur px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Signal Scout</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">{score}</span>
                            <span className="text-[10px] text-teal-400 font-bold uppercase">PTS</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Seconds Left</span>
                </div>
            </div>

            {/* Game World */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden cursor-crosshair">

                {/* Grid / Perspective Lines */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Render People */}
                {people.map(person => (
                    <div
                        key={person.uid}
                        className={`absolute w-16 h-28 md:w-24 md:h-36 transition-transform duration-100 ease-linear hover:scale-105 active:scale-95 group`}
                        style={{
                            left: `${person.x}%`,
                            top: `${person.y}%`,
                            zIndex: Math.floor(person.y), // Depth sorting
                            opacity: person.isClicked ? (person.data.type === 'risk' ? 0 : 0.5) : 1,
                            transform: `scale(${person.isClicked && person.data.type === 'risk' ? 2 : 1})`,
                            transition: 'opacity 0.3s, transform 0.3s'
                        }}
                        onClick={() => handlePersonClick(person)}
                    >
                        {/* Stickman Asset */}
                        <div className={`w-full h-full relative ${person.direction === -1 ? '-scale-x-100' : ''}`}>
                            <img
                                src={person.asset}
                                className="w-full h-full object-contain drop-shadow-2xl filter brightness-90 group-hover:brightness-110"
                                draggable="false"
                            />
                        </div>

                        {/* Speech Bubble Cue */}
                        <div
                            className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-3 py-2 rounded-xl rounded-bl-none shadow-xl border-2 z-20 min-w-[120px] md:min-w-[160px] text-center
                                ${person.data.type === 'risk' ? 'border-red-100' : 'border-blue-50'}
                                ${person.direction === -1 ? 'rounded-br-none rounded-bl-xl origin-bottom-right' : 'origin-bottom-left'}
                                animate-pop-in
                            `}
                        >
                            <p className="text-[9px] md:text-[10px] font-bold leading-tight">{person.data.text}</p>
                            {/* Emoji Cue */}
                            <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow-md border border-white">
                                {person.data.emoji}
                            </div>
                        </div>

                    </div>
                ))}

                {/* Feedback Popup */}
                {feedback && (
                    <div
                        className={`absolute z-[200] px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl animate-bounce-subtle pointer-events-none border-2
                            ${feedback.type === 'good' ? 'bg-teal-500 text-white border-white' : 'bg-red-500 text-white border-red-200'}
                        `}
                        style={{ left: `${feedback.x}%`, top: `${feedback.y - 10}%`, transform: 'translateX(-50%)' }}
                    >
                        {feedback.text}
                    </div>
                )}
            </div>

            {/* Intro Modal */}
            {gameState === 'INTRO' && (
                <div className="absolute inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl animate-scale-in">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                            🔭
                        </div>
                        <h2 className="text-3xl font-black uppercase text-slate-800 mb-2">Signal Scout</h2>
                        <p className="text-slate-600 font-medium mb-6">
                            "You can't question if you don't see the signs." <br /><br />
                            Tap people showing <strong className="text-red-500">Warning Signs</strong> (Crisis, Isolation, Giving away items). <br />
                            Ignore normal stress distractions.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="block text-2xl mb-1">💸</span>
                                <span className="text-[10px] font-bold uppercase text-slate-500">Crisis (Tap)</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="block text-2xl mb-1">🧹</span>
                                <span className="text-[10px] font-bold uppercase text-slate-500">Chores (Ignore)</span>
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
                        >
                            Start Patrol
                        </button>
                    </div>
                </div>
            )}

            {/* End Modal */}
            {gameState === 'END' && (
                <div className="absolute inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl animate-scale-in border-4 border-teal-500">
                        <h2 className="text-4xl font-black uppercase text-slate-800 mb-2">Patrol Complete</h2>
                        <div className="my-6">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Score</span>
                            <div className="text-6xl font-black text-teal-600 drop-shadow-sm">{score}</div>
                        </div>
                        <p className="text-slate-600 font-medium mb-8">
                            {score > 500 ? "Excellent scouting! You have a sharp eye for hidden distress." : "Good effort. Remember, signs can be subtle—like giving away prized possessions."}
                        </p>
                        <button
                            onClick={onExit}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
                        >
                            Continue Training
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SignalScoutScreen;
