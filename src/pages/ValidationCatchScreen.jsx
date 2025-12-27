import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VALIDATION_PHRASES } from '../data/validationCatchData';
import Stickman from '../components/Stickman';

const ValidationCatchScreen = ({ audioManager, onComplete, onExit }) => {
    // Game State
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(3);
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, WIN, LOSE
    const [playerX, setPlayerX] = useState(50); // Percentage 0-100
    const [fallingItems, setFallingItems] = useState([]);

    // Refs for game loop logic
    const gameContainerRef = useRef(null);
    const requestRef = useRef();
    const lastItemTimeRef = useRef(0);
    const scoreRef = useRef(0);
    const healthRef = useRef(3);
    const targetXRef = useRef(50); // Where the mouse/touch/key wants to be
    const currentXRef = useRef(50); // Where the basket actually is
    const keysPressed = useRef({}); // Track held keys

    const WIN_SCORE = 100;

    // Input Listeners
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (gameState !== 'PLAYING' || !gameContainerRef.current) return;
            const rect = gameContainerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            targetXRef.current = Math.max(5, Math.min(95, x));
        };

        const handleTouchMove = (e) => {
            if (gameState !== 'PLAYING' || !gameContainerRef.current) return;
            const rect = gameContainerRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const x = ((touch.clientX - rect.left) / rect.width) * 100;
            targetXRef.current = Math.max(5, Math.min(95, x));
        };

        const handleKeyDown = (e) => {
            keysPressed.current[e.key] = true;
        };
        const handleKeyUp = (e) => {
            keysPressed.current[e.key] = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    // Game Loop
    const update = useCallback((time) => {
        if (gameState !== 'PLAYING') return;

        // Init time check
        if (!lastItemTimeRef.current) {
            lastItemTimeRef.current = time;
        }

        // Keyboard Movement logic
        const keySpeed = 1.5;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) {
            targetXRef.current = Math.max(5, targetXRef.current - keySpeed);
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) {
            targetXRef.current = Math.min(95, targetXRef.current + keySpeed);
        }

        // Smooth Movement (Lerp)
        const lerpFactor = 0.15;
        currentXRef.current += (targetXRef.current - currentXRef.current) * lerpFactor;
        setPlayerX(currentXRef.current);

        // Difficulty Scaling
        const difficultyMultiplier = 1 + (scoreRef.current / 500); // Speed up as score increases
        const spawnDelay = Math.max(800, 2000 - (scoreRef.current * 2));

        // Spawn items check - fallback to force spawn if empty list also
        const shouldSpawn = (time - lastItemTimeRef.current > spawnDelay) || (fallingItems.length === 0 && (time - lastItemTimeRef.current > 500));

        if (shouldSpawn) {
            // Ensure valid pool with text
            let pool = (VALIDATION_PHRASES && VALIDATION_PHRASES.length > 0) ? VALIDATION_PHRASES : [];

            // Fallback if empty or invalid
            if (pool.length === 0) {
                pool = [
                    { text: "I hear you", type: 'validating' },
                    { text: "That sounds hard", type: 'validating' },
                    { text: "Stop crying", type: 'toxic' }
                ];
            }

            const randomPhrase = pool[Math.floor(Math.random() * pool.length)];

            // Double check it has text
            if (randomPhrase && randomPhrase.text) {
                const newItem = {
                    id: Date.now() + Math.random(),
                    ...randomPhrase,
                    x: Math.random() * 80 + 10,
                    y: -15, // Start above the screen to fall in naturally
                    speed: (0.2 + Math.random() * 0.1) * difficultyMultiplier,
                    scale: 1
                };
                setFallingItems(prev => [...prev, newItem]);
                lastItemTimeRef.current = time;
            }
        }

        // Move items
        setFallingItems(prev => {
            const nextItems = [];
            for (const item of prev) {
                const newY = item.y + item.speed;

                // Collision check (Basket area)
                // Expanded hitbox slightly for better feel
                const isColliding = newY > 65 && newY < 95 && Math.abs(item.x - currentXRef.current) < 15;

                if (isColliding) {
                    if (item.type === 'validating') {
                        scoreRef.current += 10;
                        setScore(scoreRef.current);
                        if (audioManager) audioManager.playDing();
                        // Haptics
                        if (navigator.vibrate) navigator.vibrate(20);
                    } else {
                        healthRef.current -= 1;
                        setHealth(healthRef.current);
                        if (audioManager) audioManager.playSad();
                        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    }
                    continue; // Caught
                }

                if (newY > 105) continue; // Off screen
                nextItems.push({ ...item, y: newY });
            }
            return nextItems;
        });

        // Win/Loss Condition
        if (scoreRef.current >= WIN_SCORE) {
            setGameState('WIN');
            if (audioManager) audioManager.playVictory();
        } else if (healthRef.current <= 0) {
            setGameState('LOSE');
            if (audioManager) audioManager.playSad();
        } else {
            requestRef.current = requestAnimationFrame(update);
        }
    }, [gameState, audioManager, fallingItems.length]);

    // Cleanup Loop on Unmount/State Change
    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, update]);

    const startGame = () => {
        setScore(0);
        setHealth(3);
        scoreRef.current = 0;
        healthRef.current = 3;
        targetXRef.current = 50;
        currentXRef.current = 50;
        setFallingItems([]);
        setGameState('PLAYING');
        lastItemTimeRef.current = null; // Let the loop initialize this
    };

    return (
        <div className="fixed inset-0 flex flex-col font-sans overflow-hidden select-none bg-slate-50">
            {/* Bright Patterned Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#14b8a61a,transparent)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_300px,#6366f11a,transparent)] pointer-events-none"></div>

            {/* Header / HUD */}
            <div className="relative z-20 px-6 py-5 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={onExit} className="group relative px-6 py-2.5 overflow-hidden rounded-xl bg-slate-100 hover:bg-red-50 transition-all active:scale-95 border border-slate-200 hover:border-red-200">
                        <span className="relative text-[11px] font-black text-slate-500 group-hover:text-red-500 uppercase tracking-[0.2em] transition-colors">Exit Lab</span>
                    </button>
                    <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex flex-col hidden sm:flex">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Active Listening</span>
                        <span className="text-slate-900 font-black text-base tracking-tight uppercase">Validation Training</span>
                    </div>
                </div>

                <div className="flex items-center gap-8 bg-white px-8 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
                        <div className="text-3xl font-black text-slate-800 tabular-nums">
                            {score}<span className="text-sm text-slate-400 ml-1">/{WIN_SCORE}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resilience</span>
                        <div className="flex gap-2.5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${i < health ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-slate-200'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Canvas Overlay */}
            <div ref={gameContainerRef} className="flex-1 relative w-full h-full overflow-hidden cursor-none z-10">

                {gameState === 'INTRO' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/60 backdrop-blur-md">
                        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 animate-scale-in">
                            <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce-subtle">
                                <span className="text-5xl">👂</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight uppercase">Catch The Good</h2>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm px-4">
                                "Validation is the art of hearing the person, not just the problem."
                            </p>
                            <div className="space-y-3 mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold border border-teal-200">✓</div>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Catch Validating Phrases</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold border border-red-200">✕</div>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Avoid Toxic Positivity</span>
                                </div>
                            </div>
                            <button onClick={startGame} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95">
                                Start Session
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'PLAYING' && (
                    <>
                        {/* Falling Phrases - High Contrast */}
                        {fallingItems.map(item => (
                            <div
                                key={item.id}
                                className={`absolute px-5 py-3 rounded-xl border-b-4 shadow-xl transition-all duration-300 flex items-center gap-3 whitespace-nowrap 
                                ${item.type === 'validating'
                                        ? 'bg-teal-500 border-teal-700 text-white shadow-teal-500/30'
                                        : item.type === 'toxic'
                                            ? 'bg-red-500 border-red-700 text-white shadow-red-500/30 opacity-100'
                                            : 'bg-white border-slate-200 text-slate-400 opacity-60'
                                    }
                                `}
                                style={{
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: `translateX(-50%) scale(${item.scale})`,
                                    zIndex: 30
                                }}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-white/20`}>
                                    {item.type === 'validating' ? '✓' : '!'}
                                </span>
                                <span className="font-bold text-xs uppercase tracking-wider">{item.text}</span>
                            </div>
                        ))}

                        {/* Player / Character */}
                        <div
                            className="absolute bottom-12 transition-all duration-75 z-40"
                            style={{ left: `${playerX}%`, transform: `translateX(-50%)` }}
                        >
                            <div className="relative group">
                                {/* Catch Basket Visual */}
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-10 bg-slate-900/5 backdrop-blur-sm border-2 border-slate-900/10 rounded-full flex items-center justify-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Catch Zone</span>
                                </div>

                                <Stickman scale={1.5} emotion="happy" noWrapper theme="neutral" />
                            </div>
                        </div>

                        {/* Visual Instruction Overlay */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 shadow-lg">
                            <div className="flex gap-1">
                                <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded border border-slate-200 text-[10px] font-bold text-slate-500">←</span>
                                <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded border border-slate-200 text-[10px] font-bold text-slate-500">→</span>
                            </div>
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Move to Catch</span>
                        </div>
                    </>
                )}

                {gameState === 'WIN' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl animate-fade-in">
                        <div className="max-w-md w-full bg-white rounded-[4rem] p-12 text-center shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-b-[16px] border-teal-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-teal-400 via-indigo-600 to-teal-400 animate-shimmer"></div>
                            <div className="w-32 h-32 bg-teal-50 rounded-[3rem] flex items-center justify-center text-7xl mx-auto mb-10 shadow-inner animate-bounce-subtle">🌟</div>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none italic">Lab Mastered!</h2>
                            <p className="text-slate-500 font-medium mb-12 leading-relaxed text-xl px-2">
                                You’ve developed a keen ear for validation. Hearing what's NOT being said is your new superpower.
                            </p>
                            <button onClick={onComplete} className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-all hover:-translate-y-2 active:scale-95">
                                Enter the Field ➔
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'LOSE' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl animate-fade-in">
                        <div className="max-w-md w-full bg-white rounded-[4rem] p-12 text-center shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-b-[16px] border-red-500">
                            <div className="w-32 h-32 bg-red-50 rounded-[3rem] flex items-center justify-center text-7xl mx-auto mb-10 shadow-inner">💪</div>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none italic">Recalibrating...</h2>
                            <p className="text-slate-500 font-medium mb-12 leading-relaxed text-xl px-2">
                                Stigma and toxic positivity are loud, but your empathy can be louder. Take a moment, then try again.
                            </p>
                            <div className="flex flex-col gap-4">
                                <button onClick={startGame} className="w-full py-6 bg-teal-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-teal-700 transition-all active:scale-95 hover:-translate-y-1">
                                    Restore Lab Session ➔
                                </button>
                                <button onClick={onExit} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors py-3">
                                    Exit Research Center
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValidationCatchScreen;
