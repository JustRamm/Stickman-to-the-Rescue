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

        // Keyboard Movement logic
        const keySpeed = 1.2; // Speed of movement via keys
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) {
            targetXRef.current = Math.max(5, targetXRef.current - keySpeed);
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) {
            targetXRef.current = Math.min(95, targetXRef.current + keySpeed);
        }

        // Smooth Movement (Lerp)
        const lerpFactor = 0.12;
        currentXRef.current += (targetXRef.current - currentXRef.current) * lerpFactor;
        setPlayerX(currentXRef.current);

        // Spawn items (Much slower spawn rate for better spacing)
        if (time - lastItemTimeRef.current > 2000) {
            const pool = VALIDATION_PHRASES;
            const randomPhrase = pool[Math.floor(Math.random() * pool.length)];
            const newItem = {
                id: Date.now(),
                ...randomPhrase,
                x: Math.random() * 80 + 10,
                y: -15,
                // Significantly slower speed for readability
                speed: 0.12 + Math.random() * 0.1,
                scale: 0.9 + Math.random() * 0.3
            };
            setFallingItems(prev => [...prev, newItem]);
            lastItemTimeRef.current = time;
        }

        // Move items
        setFallingItems(prev => {
            const nextItems = [];
            for (const item of prev) {
                const newY = item.y + item.speed;

                // Collision check (Basket area)
                const isColliding = newY > 75 && newY < 85 && Math.abs(item.x - currentXRef.current) < 12;

                if (isColliding) {
                    if (item.type === 'validating') {
                        scoreRef.current += 10;
                        setScore(scoreRef.current);
                        if (audioManager) audioManager.playDing();
                        if (navigator.vibrate) navigator.vibrate(20);
                    } else {
                        healthRef.current -= 1;
                        setHealth(healthRef.current);
                        if (audioManager) audioManager.playSad();
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    }
                    continue; // Caught item, don't add to nextItems
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
    }, [gameState, audioManager]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(update);
        } else {
            cancelAnimationFrame(requestRef.current);
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
        lastItemTimeRef.current = performance.now();
    };

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col font-sans overflow-hidden select-none">
            {/* Liquid Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-teal-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Header / HUD */}
            <div className="relative z-20 px-6 py-5 flex justify-between items-center bg-slate-900/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
                <div className="flex items-center gap-6">
                    <button onClick={onExit} className="group relative px-6 py-2.5 overflow-hidden rounded-xl transition-all active:scale-95">
                        <div className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500 transition-colors"></div>
                        <span className="relative text-[11px] font-black text-red-400 group-hover:text-white uppercase tracking-[0.2em]">Exit Training</span>
                    </button>
                    <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex flex-col hidden sm:flex">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/70">Skill Lab</span>
                        <span className="text-white font-black text-base tracking-tight uppercase">Validation Catch</span>
                    </div>
                </div>

                <div className="flex items-center gap-10 bg-black/30 px-8 py-3 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact score</span>
                        <div className="text-3xl font-black text-teal-400 tabular-nums">
                            {score}<span className="text-sm text-slate-600 ml-1">/{WIN_SCORE}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Empathy Health</span>
                        <div className="flex gap-2.5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all duration-700 ${i < health ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)]' : 'bg-slate-800 scale-75 opacity-20'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Canvas Overlay */}
            <div ref={gameContainerRef} className="flex-1 relative overflow-hidden cursor-none">

                {gameState === 'INTRO' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                        <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/20 animate-scale-in">
                            <div className="w-28 h-28 bg-teal-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce-subtle">
                                <span className="text-6xl drop-shadow-md">🤲</span>
                            </div>
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tighter uppercase leading-none">The Active Listener</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg italic px-4">
                                "Being heard is so close to being loved that for the average person, they are almost indistinguishable."
                            </p>
                            <div className="space-y-4 mb-10 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                                    <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Catch validation</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Avoid toxicity</span>
                                </div>
                            </div>
                            <button onClick={startGame} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 hover:-translate-y-1">
                                Begin Lab Session
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'PLAYING' && (
                    <>
                        {/* Falling Phrases */}
                        {fallingItems.map(item => (
                            <div
                                key={item.id}
                                className={`absolute px-8 py-4 rounded-full border-2 whitespace-nowrap shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-4 ${item.type === 'validating'
                                    ? 'bg-teal-500 text-white border-teal-300'
                                    : 'bg-red-600 text-white border-red-400'
                                    }`}
                                style={{
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: `translateX(-50%) scale(${item.scale})`,
                                    boxShadow: item.type === 'validating' ? '0 15px 40px rgba(20, 184, 166, 0.5)' : '0 15px 40px rgba(220, 38, 38, 0.5)'
                                }}
                            >
                                <span className="text-2xl font-bold">{item.type === 'validating' ? '✓' : '⚠'}</span>
                                <span className="font-black text-sm uppercase tracking-widest leading-loose">{item.text}</span>
                            </div>
                        ))}

                        {/* Player / Character */}
                        <div
                            className="absolute bottom-16 transition-all duration-75"
                            style={{ left: `${playerX}%`, transform: `translateX(-50%)` }}
                        >
                            <div className="relative group">
                                {/* Enhanced Catch Zone (Glassmorphism) */}
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-12 flex flex-col items-center">
                                    <div className="w-full h-full bg-white/5 backdrop-blur-xl border-2 border-white/20 rounded-b-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-teal-400/20 to-transparent"></div>
                                        <div className="w-32 h-0.5 bg-white/40 rounded-full relative z-10"></div>
                                    </div>
                                    <div className="w-1.5 h-6 bg-white/10 rounded-full mt-1"></div>
                                </div>
                                <div className="animate-float-slow">
                                    <Stickman scale={1.6} emotion="happy" noWrapper />
                                </div>
                            </div>
                        </div>

                        {/* Visual Instruction Overlay */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-xl px-10 py-3 rounded-full border border-white/10 shadow-2xl">
                            <span className="text-white/40 text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Use Keys [← →] or Mouse to Catch</span>
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
