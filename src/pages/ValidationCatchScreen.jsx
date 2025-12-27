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

    // Refs for game loop
    const gameContainerRef = useRef(null);
    const requestRef = useRef();
    const lastItemTimeRef = useRef(0);
    const scoreRef = useRef(0);
    const healthRef = useRef(3);

    const WIN_SCORE = 100;

    // Movement Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (gameState !== 'PLAYING' || !gameContainerRef.current) return;
            const rect = gameContainerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            setPlayerX(Math.max(5, Math.min(95, x)));
        };

        const handleTouchMove = (e) => {
            if (gameState !== 'PLAYING' || !gameContainerRef.current) return;
            const rect = gameContainerRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const x = ((touch.clientX - rect.left) / rect.width) * 100;
            setPlayerX(Math.max(5, Math.min(95, x)));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [gameState]);

    // Game Loop
    const update = useCallback((time) => {
        if (gameState !== 'PLAYING') return;

        // Spawn items
        if (time - lastItemTimeRef.current > 1200) {
            const randomPhrase = VALIDATION_PHRASES[Math.floor(Math.random() * VALIDATION_PHRASES.length)];
            const newItem = {
                id: Date.now(),
                ...randomPhrase,
                x: Math.random() * 80 + 10, // 10% to 90%
                y: -10,
                speed: 0.3 + Math.random() * 0.4
            };
            setFallingItems(prev => [...prev, newItem]);
            lastItemTimeRef.current = time;
        }

        // Move items
        setFallingItems(prev => {
            const nextItems = [];
            for (const item of prev) {
                const newY = item.y + item.speed;

                // Collision check
                const isColliding = newY > 75 && newY < 85 && Math.abs(item.x - playerX) < 12;

                if (isColliding) {
                    if (item.type === 'validating') {
                        scoreRef.current += 10;
                        setScore(scoreRef.current);
                        if (audioManager) audioManager.playDing();
                        // Vibration for catch
                        if (navigator.vibrate) navigator.vibrate(20);
                    } else {
                        healthRef.current -= 1;
                        setHealth(healthRef.current);
                        if (audioManager) audioManager.playSad();
                        if (navigator.vibrate) navigator.vibrate([50, 50]);
                    }
                    continue; // Remove item
                }

                if (newY > 100) {
                    // Missed validating item penalty?
                    if (item.type === 'validating') {
                        // Maybe reduce score slightly or just lose health if missed enough?
                        // Let's keep it simple: hit toxic = lose health
                    }
                    continue; // Remove item
                }

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
    }, [gameState, playerX, audioManager]);

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
        setFallingItems([]);
        setGameState('PLAYING');
        lastItemTimeRef.current = performance.now();
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-indigo-900 via-slate-900 to-black flex flex-col font-sans overflow-hidden select-none">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[150px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-20 px-6 py-4 flex justify-between items-center bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="px-4 py-2 bg-red-500/20 hover:bg-red-500 border border-red-500/30 rounded-xl text-[10px] font-black text-red-100 transition-all uppercase tracking-widest">
                        Exit
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skill Module</span>
                        <span className="text-white font-bold text-sm">Validation Catch</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
                        <div className="text-2xl font-black text-teal-400 tabular-nums">{score}<span className="text-xs text-slate-500 ml-1">/ {WIN_SCORE}</span></div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health</span>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < health ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-700 opacity-30'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div ref={gameContainerRef} className="flex-1 relative overflow-hidden cursor-none">
                {gameState === 'INTRO' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
                        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl animate-scale-in">
                            <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">🤲</div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Validation Catch</h2>
                            <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                                Catch the <span className="text-teal-600 font-bold underline">Validating</span> phrases to build empathy. Avoid the <span className="text-red-500 font-bold underline">Toxic</span> ones that shut people down.
                            </p>
                            <button onClick={startGame} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-teal-700 transition-all active:scale-95">
                                Start Training
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'PLAYING' && (
                    <>
                        {/* Falling Items */}
                        {fallingItems.map(item => (
                            <div
                                key={item.id}
                                className={`absolute px-4 py-2 rounded-2xl border-2 whitespace-nowrap shadow-lg transition-transform pointer-events-none ${item.type === 'validating'
                                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                    }`}
                                style={{
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: `translateX(-50%)`
                                }}
                            >
                                <span className="font-bold text-xs md:text-sm">{item.text}</span>
                            </div>
                        ))}

                        {/* Player / Stickman */}
                        <div
                            className="absolute bottom-10 transition-transform duration-75 ease-out"
                            style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="relative">
                                {/* The Basket */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/20 border-2 border-white/40 rounded-b-full backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="w-20 h-0.5 bg-white/30"></div>
                                </div>
                                <Stickman scale={1.2} emotion="happy" noWrapper />
                            </div>
                        </div>

                        {/* Instruction Hint */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Move mouse or slide to catch
                        </div>
                    </>
                )}

                {gameState === 'WIN' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-fade-in">
                        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl border-b-8 border-teal-500">
                            <div className="w-24 h-24 bg-teal-100 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner animate-bounce-subtle">🌟</div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Empathy Master!</h2>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                You have a sharp ear for validation! Recognizing these phrases is the first step in making someone feel truly heard.
                            </p>
                            <button onClick={onComplete} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all">
                                Return to Hub
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'LOSE' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-fade-in">
                        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl border-b-8 border-red-500">
                            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">💪</div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Keep Practicing!</h2>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                Don't worry, distinguishing between help and "toxic positivity" takes time. Every mistake is a step towards becoming a better Gatekeeper!
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={startGame} className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-teal-700 transition-all">
                                    Try Again
                                </button>
                                <button onClick={onExit} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                                    Exit to Hub
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
