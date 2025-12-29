import React, { useState, useEffect, useRef } from 'react';
import { TERMINOLOGY_DATA } from '../data/terminologyData';

const WordsOfHopeScreen = ({ audioManager, onExit }) => {
    // Game Flow States
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, RESULTS, GAME_OVER, TRANSITIONING
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [harmony, setHarmony] = useState(50); // 0 (Gloomy) to 100 (Radiant)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [explanation, setExplanation] = useState(null); // Side panel data
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [stigmaAlert, setStigmaAlert] = useState(null); // Left side alert data
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    // Refs for Game Loop (Prevents stale closures)
    const scoreRef = useRef(0);
    const currentIndexRef = useRef(0);
    const mistakesRef = useRef(0);
    const sidebarTimerRef = useRef(null);
    const alertTimerRef = useRef(null);
    const spawnCooldownRef = useRef(0);
    const isProcessingSetRef = useRef(false);
    const hasInteractionRef = useRef(false); // Track if current set has been interacted with
    const requestRef = useRef();

    // Player Position Ref
    const playerRef = useRef(50);
    const [playerX, setPlayerX] = useState(50);
    const gameContainerRef = useRef(null);
    const [fallingItems, setFallingItems] = useState([]);

    // --- Core Game Logic ---

    const startGame = () => {
        setGameState('PLAYING');
        setHarmony(50);
        setScore(0);
        scoreRef.current = 0;
        setMistakes(0);
        mistakesRef.current = 0;
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setFallingItems([]);
        setExplanation(null);
        setIsSidebarVisible(false);
        setStigmaAlert(null);
        setIsAlertVisible(false);
        isProcessingSetRef.current = false;
        hasInteractionRef.current = false;
        spawnCooldownRef.current = 1000; // Initial delay
        audioManager.playPop();
        if (audioManager) audioManager.startAmbient('park');
    };

    // Sidebar auto-hide logic
    useEffect(() => {
        if (explanation) {
            setIsSidebarVisible(true);
            if (sidebarTimerRef.current) clearTimeout(sidebarTimerRef.current);
            sidebarTimerRef.current = setTimeout(() => {
                setIsSidebarVisible(false);
            }, 6000);
        }
        return () => { if (sidebarTimerRef.current) clearTimeout(sidebarTimerRef.current); };
    }, [explanation]);

    // Stigma Alert auto-hide logic
    useEffect(() => {
        if (stigmaAlert) {
            setIsAlertVisible(true);
            if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
            alertTimerRef.current = setTimeout(() => {
                setIsAlertVisible(false);
            }, 5000);
        }
        return () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current); };
    }, [stigmaAlert]);

    // Handle Mouse/Touch Movement
    const handlePointerMove = (e) => {
        if (gameState !== 'PLAYING' || !gameContainerRef.current) return;
        const rect = gameContainerRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (clientX === undefined) return;

        const x = ((clientX - rect.left) / rect.width) * 100;
        const clampedX = Math.max(5, Math.min(95, x));
        setPlayerX(clampedX);
        playerRef.current = clampedX;
    };

    // The Game Loop
    const update = () => {
        if (gameState !== 'PLAYING') {
            requestRef.current = requestAnimationFrame(update);
            return;
        }

        setFallingItems(currentItems => {
            const nextItems = currentItems.map(item => ({ ...item, y: item.y + item.speed }));
            const remainingItems = [];
            let collisionOccurredInFile = false;

            for (const item of nextItems) {
                const distanceX = Math.abs(item.x - playerRef.current);
                const distanceY = Math.abs(item.y - 85);

                // Collision Detection
                if (distanceY < 8 && distanceX < 10 && !collisionOccurredInFile && !hasInteractionRef.current) {
                    processCollision(item);
                    collisionOccurredInFile = true;
                    continue;
                }

                if (item.y < 110) {
                    remainingItems.push(item);
                }
            }

            // Logic to move to next set if nothing is on screen
            if (isProcessingSetRef.current && currentItems.length > 0 && remainingItems.length === 0) {
                // If set fell off without interaction (missed), count as mistake and advance
                if (!hasInteractionRef.current) {
                    applyMistake();
                    advanceToNextQuestion();
                }
            }

            return remainingItems;
        });

        // Spawning Logic
        if (!isProcessingSetRef.current && gameState === 'PLAYING') {
            spawnCooldownRef.current -= 16;
            if (spawnCooldownRef.current <= 0) {
                spawnSet();
            }
        }

        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);

    const spawnSet = () => {
        const qIndex = currentIndexRef.current;
        if (qIndex >= TERMINOLOGY_DATA.questions.length) return;

        const q = TERMINOLOGY_DATA.questions[qIndex];
        isProcessingSetRef.current = true;
        hasInteractionRef.current = false;

        const items = [
            { id: `correct-${q.id}`, x: 35, y: -15, speed: 0.12, text: q.correct, isCorrect: true, questionId: q.id },
            { id: `stigma-${q.id}`, x: 65, y: -15, speed: 0.12, text: q.stigma, isCorrect: false, questionId: q.id }
        ];

        if (Math.random() > 0.5) {
            items[0].x = 65;
            items[1].x = 35;
        }

        setFallingItems(items);
    };

    const processCollision = (item) => {
        if (hasInteractionRef.current) return;
        hasInteractionRef.current = true;

        const q = TERMINOLOGY_DATA.questions[currentIndexRef.current];
        if (!q) return;

        if (item.isCorrect) {
            setScore(s => s + 1);
            scoreRef.current += 1;
            setHarmony(h => Math.min(100, h + 15));
            audioManager.playDing();
            setExplanation({
                correct: q.correct,
                why: q.why,
                stigma: q.stigma
            });
        } else {
            setHarmony(h => Math.max(0, h - 25));
            audioManager.playSad();
            setStigmaAlert({
                stigma: q.stigma,
                correct: q.correct,
                why: q.why
            });
            applyMistake();
        }

        setFallingItems([]); // Clear visuals immediately

        // Immediate End Case: Win at 4
        if (scoreRef.current >= 4) {
            triggerEndGame('RESULTS');
            return;
        }

        // Advance only if game is still active
        advanceToNextQuestion();
    };

    const triggerEndGame = (finalState) => {
        setGameState('TRANSITIONING');
        setFallingItems([]);
        isProcessingSetRef.current = false;

        setTimeout(() => {
            setGameState(finalState);
            audioManager.stopMusic();
        }, 1500);
    };

    const applyMistake = () => {
        setMistakes(m => {
            const newM = m + 1;
            mistakesRef.current = newM;
            if (newM >= 3) {
                triggerEndGame('GAME_OVER');
            }
            return newM;
        });
    };

    const advanceToNextQuestion = () => {
        if (gameState !== 'PLAYING') return;

        isProcessingSetRef.current = false;
        currentIndexRef.current += 1;

        if (currentIndexRef.current >= TERMINOLOGY_DATA.questions.length) {
            setGameState('TRANSITIONING');
            setTimeout(() => {
                if (scoreRef.current >= 4) {
                    setGameState('RESULTS');
                } else {
                    setGameState('GAME_OVER');
                }
                audioManager.stopMusic();
            }, 2000);
        } else {
            setCurrentIndex(currentIndexRef.current);
            spawnCooldownRef.current = 2000;
        }
    };

    const bgStyle = {
        background: `linear-gradient(135deg, 
            hsl(${200 + (harmony * 0.4)}, ${20 + (harmony * 0.6)}%, ${10 + (harmony * 0.4)}%) 0%, 
            hsl(${220 + (harmony * 0.4)}, ${30 + (harmony * 0.5)}%, ${15 + (harmony * 0.4)}%) 100%)`,
        transition: 'all 2s ease-in-out'
    };

    return (
        <div
            ref={gameContainerRef}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none"
            style={bgStyle}
            onPointerMove={handlePointerMove}
            onTouchMove={handlePointerMove}
        >
            {/* ILLUSTRATIVE SCENERY BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                {/* Sun/Moon Glow */}
                <div
                    className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full blur-[100px] transition-all duration-1000"
                    style={{
                        background: harmony > 50 ? 'rgba(255, 230, 100, 0.2)' : 'rgba(150, 180, 255, 0.1)',
                        transform: `scale(${1 + harmony / 100})`
                    }}
                />

                {/* Animated Clouds */}
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/10 backdrop-blur-sm rounded-full animate-float-slow"
                        style={{
                            width: `${150 + i * 50}px`,
                            height: `${40 + i * 10}px`,
                            top: `${15 + i * 8}%`,
                            left: `${(i * 30 + 10) % 100}%`,
                            animationDelay: `${i * 2}s`,
                            opacity: 0.2 + (harmony / 200)
                        }}
                    />
                ))}

                {/* Distant Mountains */}
                <svg className="absolute bottom-0 w-full h-[40%] transition-all duration-1000" viewBox="0 0 1000 400" preserveAspectRatio="none">
                    <path
                        d="M0,400 L0,300 L150,150 L350,280 L550,100 L800,320 L1000,200 L1000,400 Z"
                        style={{ fill: `hsl(${220 + harmony * 0.2}, ${10 + harmony * 0.2}%, ${10 + harmony * 0.1}%)` }}
                    />
                    <path
                        d="M0,400 L0,350 L200,220 L450,340 L700,180 L1000,330 L1000,400 Z"
                        style={{ fill: `hsl(${220 + harmony * 0.2}, ${15 + harmony * 0.2}%, ${12 + harmony * 0.15}%)`, opacity: 0.8 }}
                    />
                </svg>

                {/* Stylized Trees (Mid-ground) */}
                <div className="absolute bottom-[10%] w-full flex justify-around items-end px-12 transition-all duration-1000" style={{ opacity: 0.3 + harmony / 200 }}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div
                                className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[40px] border-l-transparent border-r-transparent transition-colors duration-1000"
                                style={{ borderBottomColor: `hsl(${140 + harmony * 0.2}, ${20 + harmony * 0.2}%, ${15 + harmony * 0.1}%)` }}
                            />
                            <div
                                className="w-2 h-4 transition-colors duration-1000"
                                style={{ backgroundColor: `hsl(${20 + harmony * 0.1}, 20%, 10%)` }}
                            />
                        </div>
                    ))}
                </div>

                {/* Ground */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[15%] transition-all duration-1000"
                    style={{
                        background: `linear-gradient(to bottom, 
                            hsl(${130 + harmony * 0.2}, ${15 + harmony * 0.2}%, ${8 + harmony * 0.1}%) 0%,
                            hsl(${130 + harmony * 0.2}, ${15 + harmony * 0.2}%, ${5 + harmony * 0.1}%) 100%)`
                    }}
                />
            </div>

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-50">
                <div className="flex flex-col">
                    <h1 className="text-white font-black uppercase tracking-[0.3em] text-[10px] md:text-lg drop-shadow-lg">
                        {TERMINOLOGY_DATA.title}
                    </h1>
                    <div className="h-0.5 w-full bg-gradient-to-r from-teal-400 to-transparent rounded-full mt-1" />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-teal-400 uppercase tracking-widest leading-none mb-1">Target: 4 Seeds</span>
                        <span className="text-white font-black text-xl leading-none">{score}<span className="text-white/30 text-sm font-medium ml-1">/ 4</span></span>
                    </div>
                    <button
                        onClick={onExit}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                    >
                        Exit Path
                    </button>
                </div>
            </div>

            {gameState === 'INTRO' && (
                <div className="relative z-10 max-w-2xl w-full p-8 text-center animate-fade-in flex flex-col items-center">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[2.5rem] mb-12 flex items-center justify-center border border-white/20 shadow-2xl rotate-3">
                        <img src="/stickman_assets/hope_stickman.svg" alt="Hope" className="w-20 h-20 animate-pulse" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
                        Word <span className="text-teal-400">Wisdom.</span>
                    </h2>
                    <p className="text-slate-300 text-lg md:text-xl font-medium mb-12 text-balance leading-relaxed">
                        Identify the phrases of <span className="text-white font-bold underline decoration-teal-500 underline-offset-4">Hope</span> and let the <span className="text-slate-500 font-bold">Thorns of Stigma</span> fall.
                        <br /><span className="text-teal-400 font-black text-sm uppercase tracking-widest mt-4 block">Goal: Collect 4 Seeds of Wisdom</span>
                    </p>
                    <button onClick={startGame} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-lg shadow-2xl hover:bg-teal-50 transition-all hover:-translate-y-1">Begin The Path</button>
                </div>
            )}

            {gameState === 'PLAYING' && (
                <>
                    {/* Falling Items Area */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {fallingItems.map(item => (
                            <div
                                key={item.id}
                                className="absolute transition-transform duration-100 flex items-center justify-center p-4 rounded-3xl border-2 backdrop-blur-md shadow-2xl bg-white/10 border-white/20 text-white"
                                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%)`, maxWidth: '260px', textAlign: 'center' }}
                            >
                                <span className="text-[10px] md:text-xs font-black leading-tight uppercase tracking-wider">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Knowledge Sidebar */}
                    <div className={`absolute right-4 top-32 z-40 transition-all duration-700 ${isSidebarVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
                        <div className="max-w-[240px] md:max-w-[280px] bg-white/95 backdrop-blur-xl rounded-2xl border border-white p-4 md:p-5 shadow-4xl flex flex-col h-fit">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-lg">🌱</div>
                                <span className="text-slate-900 font-black uppercase text-[9px] tracking-widest">Growth Log</span>
                            </div>
                            {explanation && (
                                <div className="space-y-4 animate-fade-in" key={explanation.correct}>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-teal-600 uppercase tracking-widest">Better choice</span>
                                        <p className="text-slate-800 font-bold text-xs italic leading-tight">"{explanation.correct}"</p>
                                    </div>
                                    <div className="space-y-1 opacity-50">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avoid</span>
                                        <p className="text-slate-500 font-bold text-[9px] line-through leading-tight">"{explanation.stigma}"</p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-slate-600 text-[10px] md:text-xs font-medium leading-relaxed">{explanation.why}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stigma Alert (Left Side) */}
                    <div className={`absolute left-4 top-40 z-40 transition-all duration-700 ${isAlertVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-120%] opacity-0'}`}>
                        <div className="max-w-[240px] md:max-w-[280px] bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-red-500/30 p-4 md:p-5 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex flex-col h-fit">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-lg shadow-[inset_0_0_10px_rgba(239,68,68,0.3)]">⚠️</div>
                                <span className="text-red-400 font-black uppercase text-[9px] tracking-[0.2em]">Stigma Alert</span>
                            </div>

                            {stigmaAlert && (
                                <div className="space-y-4 animate-shake" key={stigmaAlert.stigma}>
                                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                        <span className="text-[7px] font-black text-red-400 uppercase tracking-widest block mb-2">Harmful Language</span>
                                        <p className="text-white font-bold text-[10px] leading-tight italic">"{stigmaAlert.stigma}"</p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">The Impact</span>
                                        <p className="text-slate-300 text-[9px] md:text-xs font-medium leading-relaxed">
                                            This terminology increases isolation. It's better to use people-first language like <span className="text-teal-400 font-bold">"{stigmaAlert.correct}"</span>.
                                        </p>
                                    </div>

                                    <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 animate-shrink-timer" style={{ animationDuration: '5s' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hearts Count */}
                    <div className="absolute top-28 left-8 flex gap-2 z-50">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl transition-all duration-500 ${i < (3 - mistakes) ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-900/40 text-slate-800 scale-75 opacity-20'}`}>
                                {i < (3 - mistakes) ? '❤️' : '🥀'}
                            </div>
                        ))}
                    </div>

                    {/* Player */}
                    <div className="absolute z-[100]" style={{ left: `${playerX}%`, bottom: '10%', transform: 'translateX(-50%)' }}>
                        <div className="relative">
                            <div className={`absolute inset-0 bg-teal-400/20 blur-3xl rounded-full transition-all duration-500 ${harmony > 60 ? 'scale-150' : 'scale-75'}`} />
                            <img src={harmony > 30 ? "/stickman_assets/hope_stickman.svg" : "/stickman_assets/guy_distressed.svg"} alt="Player" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" />
                        </div>
                    </div>
                </>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="relative z-10 max-w-xl w-full p-8 text-center animate-pop-in flex flex-col items-center">
                    <div className="w-32 h-32 bg-teal-500 rounded-[2.5rem] mb-8 flex items-center justify-center text-6xl shadow-2xl border-4 border-white">🌱</div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">Don't Give Up!</h2>
                    <p className="text-teal-200 text-lg md:text-xl font-bold mb-4 uppercase tracking-widest text-balance">Mistakes are part of learning. Try again to master the language of hope.</p>
                    <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-12">Progress: {score}/4 Seeds Collected</p>
                    <div className="flex flex-col gap-4 w-full">
                        <button onClick={startGame} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl hover:bg-slate-100 transition-all">Try Again</button>
                        <button onClick={onExit} className="w-full py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-xs transition-all opacity-50">Return</button>
                    </div>
                </div>
            )}

            {gameState === 'RESULTS' && (
                <div className="relative z-10 max-w-xl w-full p-8 text-center animate-pop-in flex flex-col items-center">
                    <div className="w-32 h-32 bg-teal-400 rounded-[2.5rem] mb-8 flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden">
                        <img src="/stickman_assets/hope_stickman.svg" alt="Success" className="w-20 h-20 drop-shadow-lg" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">Wisdom Path</h2>
                    <p className="text-teal-200 text-xl font-bold mb-4 uppercase tracking-widest">Final Score: {score}/4</p>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-12 italic">Seeds of Wisdom Rooted</p>
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-12 border border-white/20">
                        <p className="text-white text-lg font-medium leading-relaxed italic">"You have successfully navigated the language of stigma. Choosing the right words is the first step in saving a life."</p>
                    </div>
                    <button onClick={onExit} className="w-full py-5 bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-2xl hover:bg-teal-400 transition-all">Complete Module</button>
                </div>
            )}
        </div>
    );
};

export default WordsOfHopeScreen;
