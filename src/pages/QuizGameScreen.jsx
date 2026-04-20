import React, { useState, useEffect, useRef } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';

const QuizGameScreen = ({ audioManager, onExit, isPaused = false, playerGender = 'guy' }) => {
    const [quizTimer, setQuizTimer] = useState(60);
    const [quizCards, setQuizCards] = useState({ deck: [], myth: [], fact: [] });
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const dragPositionRef = useRef({ x: 0, y: 0 }); // Ref for synchronous access
    const [isDragging, setIsDragging] = useState(false);
    const [isThrowing, setIsThrowing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activeDragCard, setActiveDragCard] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const dragStartTime = useRef(0);
    const lastHapticTarget = useRef(null);

    useEffect(() => {
        // Shuffle the deck on mount to avoid repetition
        const shuffledDeck = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
        setQuizCards({
            deck: shuffledDeck,
            myth: [],
            fact: []
        });
    }, []);

    useEffect(() => {
        if (showResults || isPaused) return;

        const timer = setInterval(() => {
            setQuizTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowResults(true);
                    return 0;
                }
                // Play tick sound every second
                if (audioManager && typeof audioManager.playTick === 'function') {
                    audioManager.playTick();
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showResults, audioManager, isPaused]);

    const handleCardDragStart = (e, card, source) => {
        if (isPaused) return;
        e.stopPropagation();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
        setDragPosition({ x: 0, y: 0 });
        dragPositionRef.current = { x: 0, y: 0 }; // Reset ref
        setActiveDragCard({ card, source });
        dragStartTime.current = Date.now();
    };

    const handleCardDragMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const currentMoveX = clientX - dragStart.x;
        const currentMoveY = clientY - dragStart.y;

        const newPos = {
            x: currentMoveX,
            y: currentMoveY
        };

        setDragPosition(newPos);
        dragPositionRef.current = newPos; // Update ref synchronously

        // Zone Entry Haptics
        let currentTarget = null;
        if (activeDragCard?.source === 'deck') {
            if (currentMoveX < -100) currentTarget = 'myth';
            else if (currentMoveX > 100) currentTarget = 'fact';
        }

        if (currentTarget && currentTarget !== lastHapticTarget.current) {
            if (navigator.vibrate) navigator.vibrate(10); // Light tick on entry
            lastHapticTarget.current = currentTarget;
        } else if (!currentTarget) {
            lastHapticTarget.current = null;
        }
    };

    const handleCardDragEnd = () => {
        if ((!isDragging && !isThrowing) || !activeDragCard) return;

        const timeElapsed = Date.now() - dragStartTime.current;
        const moveX = dragPositionRef.current.x; // Read from Ref
        const velocity = Math.abs(moveX) / (timeElapsed || 1); // px/ms

        let target = activeDragCard.source;
        let isFlick = false;

        // Logic for deck source (throwing cards from deck)
        if (activeDragCard.source === 'deck') {
            // Flick threshold: >0.5 px/ms velocity AND moved at least 20px
            if (velocity > 0.5 && Math.abs(moveX) > 20) {
                isFlick = true;
                if (moveX < 0) target = 'myth';
                else target = 'fact';
            } else {
                // Classic distance threshold
                if (moveX < -80) target = 'myth'; // Reduced threshold from 100 to 80
                if (moveX > 80) target = 'fact';
            }
        } else if (activeDragCard.source === 'myth') {
            if (moveX > 300) target = 'fact';
            else if (moveX > 100) target = 'deck';
            else target = 'myth';
        } else if (activeDragCard.source === 'fact') {
            if (moveX < -300) target = 'myth';
            else if (moveX < -100) target = 'deck';
            else target = 'fact';
        }

        // Handle Flick/Throw Animation
        if (isFlick && target !== activeDragCard.source) {
            setIsDragging(false);
            setIsThrowing(true);
            const throwDistance = window.innerWidth;
            const throwX = moveX > 0 ? throwDistance : -throwDistance;
            // Add a slight Y arc or continuation based on trajectory
            const throwY = dragPositionRef.current.y * 2;

            setDragPosition({ x: throwX, y: throwY });

            // Wait for transition to complete before updating state
            setTimeout(() => {
                finalizeMove(activeDragCard.card, activeDragCard.source, target);
                setIsThrowing(false);
                setDragPosition({ x: 0, y: 0 });
                dragPositionRef.current = { x: 0, y: 0 };
                setActiveDragCard(null);
            }, 300); // Matches CSS transition duration
            return;
        }

        // Standard drop (no flick or piledrop)
        finalizeMove(activeDragCard.card, activeDragCard.source, target);
        setIsDragging(false);
        if (!isFlick) {
            setDragPosition({ x: 0, y: 0 });
            dragPositionRef.current = { x: 0, y: 0 };
            setActiveDragCard(null);
        }
    };

    const finalizeMove = (card, from, to) => {
        if (to !== from) {
            moveCard(card, from, to);

            // Result Haptics
            if (to === 'myth' || to === 'fact') {
                const isCorrect = (to === 'myth' && card.answer === 'Myth') || (to === 'fact' && card.answer === 'Fact');
                if (navigator.vibrate) {
                    if (isCorrect) navigator.vibrate(50); // Crisp success
                    else navigator.vibrate([50, 50, 50]); // Heavy failure buzz
                }
            }

            // Haptic feedback for drops (generic)
            if (navigator.vibrate) navigator.vibrate(10);

            if (audioManager && typeof audioManager.playDing === 'function') {
                audioManager.playDing();
            }
        }
    };

    const moveCard = (card, from, to) => {
        setQuizCards(prev => {
            const newSource = prev[from].filter(c => c.id !== card.id);
            const newDest = [...prev[to], card];
            return {
                ...prev,
                [from]: newSource,
                [to]: newDest
            };
        });
    };

    const restartQuiz = () => {
        setQuizTimer(60);
        setQuizCards({
            deck: [...QUIZ_QUESTIONS],
            myth: [],
            fact: []
        });
        setShowResults(false);
    };

    const finishQuiz = () => {
        setShowResults(true);
    };

    const topDeckCard = quizCards.deck[0];
    const nextDeckCard = quizCards.deck[1];
    const correctMyth = quizCards.myth.filter(c => c.answer === 'Myth');
    const correctFact = quizCards.fact.filter(c => c.answer === 'Fact');
    const totalCorrect = correctMyth.length + correctFact.length;
    const isDeckEmpty = quizCards.deck.length === 0;

    return (
        <div className="game-container min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 flex flex-col relative overflow-hidden font-sans">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-20 opacity-10 animate-float-slow">
                    <img src="/stickman_assets/cloud.svg" alt="" className="w-full h-full" />
                </div>
                <div className="absolute top-40 right-20 w-48 h-28 opacity-10 animate-float-medium delay-1000">
                    <img src="/stickman_assets/cloud.svg" alt="" className="w-full h-full" />
                </div>
                <div className="absolute bottom-20 left-1/3 w-64 h-32 opacity-5 animate-float-fast delay-2000">
                    <img src="/stickman_assets/cloud.svg" alt="" className="w-full h-full" />
                </div>
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-20"></div>
            </div>

            {/* Top Bar */}
            <div className="relative z-50 px-6 py-4 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg">
                <button
                    onClick={onExit}
                    className="group flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-red-500 hover:bg-red-600 transition-all border border-red-400 shadow-md transform hover:scale-105 active:scale-95"
                >
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Exit</span>
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold mb-1 shadow-black/50 drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Time Remaining</span>
                    <div className="relative px-6 py-2 bg-black/40 rounded-xl border border-white/10 backdrop-blur-md flex items-center gap-3">
                        <img src="/stickman_assets/clock_stickman.svg" className={`w-8 h-8 filter invert opacity-80 ${quizTimer < 10 ? 'animate-bounce-subtle' : ''}`} alt="Timer" />
                        <span className={`text-3xl font-black font-mono tracking-wider ${quizTimer < 10 ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)] animate-pulse' : 'text-white drop-shadow-md'}`}>
                            00:{quizTimer.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="text-right w-[100px] flex justify-end">
                    {isDeckEmpty && !showResults && (
                        <button
                            onClick={finishQuiz}
                            className="bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-6 py-3 min-h-[44px] rounded-full text-xs font-bold uppercase tracking-wider hover:from-teal-300 hover:to-emerald-400 shadow-lg shadow-teal-500/30 transform hover:scale-105 active:scale-95 transition-all outline-none border border-white/20"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>

            {!showResults ? (
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">

                    {/* Left Zone: MYTH */}
                    <div className="absolute bottom-4 left-4 w-[42%] h-40 md:inset-y-4 md:w-1/3 md:h-auto bg-white/5 backdrop-blur-sm border-2 border-orange-400/30 rounded-3xl flex flex-col items-center justify-start md:pt-20 p-2 md:p-4 z-10 overflow-visible transition-colors hover:bg-orange-500/10 hover:border-orange-400/50">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none mix-blend-overlay">
                            <img src={`/stickman_assets/${playerGender}_distressed.svg`} alt="Myth" className="w-24 h-24 md:w-64 md:h-64 filter invert" />
                        </div>
                        <div className="absolute md:top-6 top-2 left-0 w-full text-center">
                            <h2 className="text-xl md:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-500 tracking-[0.2em] drop-shadow-sm">MYTH</h2>
                        </div>

                        {/* Myth Pile - Cascading */}
                        <div className="relative w-full max-w-[220px] flex flex-col items-center mt-8 md:mt-8 h-full justify-center md:justify-start">
                            {quizCards.myth.length === 0 && (
                                <div className="absolute top-0 w-full h-full md:h-[240px] border-2 md:border-3 border-dashed border-orange-400/30 rounded-2xl flex flex-col items-center justify-center opacity-70 group">
                                    <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                                        <img src="/stickman_assets/pointing_stickman.svg" className="w-6 h-6 md:w-12 md:h-12 opacity-60" alt="Drop Here" />
                                    </div>
                                    <span className="text-orange-200 font-bold uppercase text-[8px] md:text-xs tracking-widest text-center">Drop<br className="md:hidden" /> Myths</span>
                                </div>
                            )}
                            {quizCards.myth.map((card, i) => (
                                <div
                                    key={card.id}
                                    className="absolute w-full h-[120px] md:h-[220px] bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl md:rounded-2xl shadow-xl border-2 border-orange-200 flex flex-col items-center p-2 md:p-4 text-center cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-all duration-300 transform scale-75 md:scale-100 origin-bottom"
                                    style={{
                                        zIndex: i,
                                        top: `${i * 10}px`, // Tighter stack on mobile
                                        opacity: (activeDragCard?.card.id === card.id) ? 0 : 1
                                    }}
                                    onMouseDown={(e) => handleCardDragStart(e, card, 'myth')}
                                    onTouchStart={(e) => handleCardDragStart(e, card, 'myth')}
                                >
                                    <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                        <img src="/stickman_assets/sad_stickman.svg" className="w-4 h-4 md:w-5 md:h-5 filter invert" alt="Wrong" />
                                    </div>
                                    <p className="mt-2 md:mt-4 text-[8px] md:text-sm font-bold text-slate-800 leading-snug pointer-events-none line-clamp-3 md:line-clamp-4">{card.question}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Zone: FACT */}
                    <div className="absolute bottom-4 right-4 w-[42%] h-40 md:inset-y-4 md:w-1/3 md:h-auto bg-white/5 backdrop-blur-sm border-2 border-teal-400/30 rounded-3xl flex flex-col items-center justify-start md:pt-20 p-2 md:p-4 z-10 overflow-visible transition-colors hover:bg-teal-500/10 hover:border-teal-400/50">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none mix-blend-overlay">
                            <img src="/stickman_assets/scholar_stickman.svg" alt="Fact" className="w-24 h-24 md:w-64 md:h-64 filter invert" />
                        </div>
                        <div className="absolute md:top-6 top-2 left-0 w-full text-center">
                            <h2 className="text-xl md:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-teal-300 to-teal-500 tracking-[0.2em] drop-shadow-sm">FACT</h2>
                        </div>

                        {/* Fact Pile - Cascading */}
                        <div className="relative w-full max-w-[220px] flex flex-col items-center mt-8 md:mt-8 h-full justify-center md:justify-start">
                            {quizCards.fact.length === 0 && (
                                <div className="absolute top-0 w-full h-full md:h-[240px] border-2 md:border-3 border-dashed border-teal-400/30 rounded-2xl flex flex-col items-center justify-center opacity-70 group">
                                    <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-teal-500/20 flex items-center justify-center mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                                        <img src="/stickman_assets/pointing_stickman.svg" className="w-6 h-6 md:w-12 md:h-12 opacity-60" alt="Drop Here" />
                                    </div>
                                    <span className="text-teal-200 font-bold uppercase text-[8px] md:text-xs tracking-widest text-center">Drop<br className="md:hidden" /> Facts</span>
                                </div>
                            )}
                            {quizCards.fact.map((card, i) => (
                                <div
                                    key={card.id}
                                    className="absolute w-full h-[120px] md:h-[220px] bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl md:rounded-2xl shadow-xl border-2 border-teal-200 flex flex-col items-center p-2 md:p-4 text-center cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-all duration-300 transform scale-75 md:scale-100 origin-bottom"
                                    style={{
                                        zIndex: i,
                                        top: `${i * 10}px`, // Tighter stack on mobile
                                        opacity: (activeDragCard?.card.id === card.id) ? 0 : 1
                                    }}
                                    onMouseDown={(e) => handleCardDragStart(e, card, 'fact')}
                                    onTouchStart={(e) => handleCardDragStart(e, card, 'fact')}
                                >
                                    <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                        <img src="/stickman_assets/happy_stickman.svg" className="w-4 h-4 md:w-5 md:h-5 filter invert" alt="Correct" />
                                    </div>
                                    <p className="mt-2 md:mt-4 text-[8px] md:text-sm font-bold text-slate-800 leading-snug pointer-events-none line-clamp-3 md:line-clamp-4">{card.question}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center Deck Area */}
                    <div className="relative z-20 pointer-events-auto flex flex-col items-center justify-center h-full">

                        {/* Next Card Preview (Underneath) */}
                        {nextDeckCard && (
                            <div
                                className="absolute w-[280px] h-[380px] bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center justify-center p-8 text-center transform scale-90 translate-y-4 opacity-60 transition-all duration-500"
                                style={{ zIndex: -1 }}
                            >
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner blur-sm"></div>
                                <div className="h-4 w-3/4 bg-white/20 rounded mb-4 blur-sm"></div>
                                <div className="h-4 w-1/2 bg-white/20 rounded blur-sm"></div>
                            </div>
                        )}

                        {/* Active Deck Card (Top) */}
                        {topDeckCard && (
                            <div
                                className={`w-[300px] h-[420px] bg-white rounded-3xl shadow-2xl border-[6px] border-white flex flex-col items-center justify-center p-8 text-center cursor-grab active:cursor-grabbing transition-all duration-200 relative z-20 overflow-hidden group quiz-card-container
                                ${((isDragging || isThrowing) && activeDragCard?.card.id === topDeckCard.id) ? 'scale-105 opacity-0 pointer-events-none' : 'scale-100 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]'}
                                `}
                                onMouseDown={(e) => handleCardDragStart(e, topDeckCard, 'deck')}
                                onTouchStart={(e) => handleCardDragStart(e, topDeckCard, 'deck')}
                            >
                                {/* Card Decorations */}
                                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />
                                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-purple-50 to-transparent pointer-events-none" />

                                <div className="relative z-10 w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-100 group-hover:bg-indigo-100 transition-colors quiz-card-icon">
                                    <img src="/stickman_assets/thinking_stickman.svg" className="w-24 h-24 drop-shadow-sm" alt="Thinking" />
                                </div>
                                <h3 className="relative z-10 text-xl md:text-2xl font-black text-slate-800 leading-tight pointer-events-none select-none px-2 quiz-card-text">
                                    {topDeckCard.question}
                                </h3>

                                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 pointer-events-none opacity-50">
                                    <span className="text-[10px] uppercase font-bold text-orange-400 flex items-center">← Myth</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-[10px] uppercase font-bold text-teal-400 flex items-center">Fact →</span>
                                </div>
                            </div>
                        )}

                        {quizCards.deck.length === 0 && (
                            <div className="flex flex-col items-center justify-center animate-fade-in scale-110">
                                <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-white/50 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 p-4 border-2 border-slate-200 animate-pulse-slow">
                                        <img src="/stickman_assets/empty_stickman.svg" className="w-16 h-16 opacity-80" alt="Empty" />
                                    </div>
                                    <span className="text-xl uppercase font-black tracking-[0.2em] mb-2 text-slate-900 drop-shadow-none">Deck Empty</span>
                                    <p className="text-sm max-w-[220px] text-slate-600 font-bold leading-relaxed">
                                        Review your choices in the piles or click <span className="text-teal-600">Finish</span>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dragging Ghost/Cursor Follower */}
                    {(isDragging || isThrowing) && activeDragCard && (
                        <div
                            className={`fixed z-[9999] pointer-events-none w-[200px] h-[40px] md:h-auto bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-2xl border-4 border-indigo-400 flex items-center justify-center p-4 md:p-6 text-center transform -translate-x-1/2 -translate-y-1/2 rotate-3 ${isThrowing ? 'transition-all duration-300 ease-out' : ''}`}
                            style={{
                                left: dragStart.x + dragPosition.x,
                                top: dragStart.y + dragPosition.y,
                            }}
                        >
                            <p className="text-xs md:text-sm font-black text-slate-800 leading-snug line-clamp-2">{activeDragCard.card.question}</p>
                        </div>
                    )}

                    {/* Global Drag Overlay */}
                    {isDragging && (
                        <div
                            className="fixed inset-0 z-[100] cursor-grabbing"
                            onMouseMove={handleCardDragMove}
                            onTouchMove={handleCardDragMove}
                            onMouseUp={handleCardDragEnd}
                            onTouchEnd={handleCardDragEnd}
                        />
                    )}
                </div>
            ) : (
                // Results Screen
                <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans animate-fade-in text-slate-800 quiz-end-screen">
                    {/* Header */}
                    <div className="shrink-0 py-4 px-6 md:px-8 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between border-b border-slate-200 z-10 gap-4 md:gap-0 quiz-end-header">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 quiz-end-title">
                                {totalCorrect === QUIZ_QUESTIONS.length ? "Perfect Score!" : "Time's Up!"}
                            </h2>
                            <p className="text-slate-600 font-medium text-sm md:text-base quiz-end-stats">
                                You sorted <span className="text-indigo-600 font-black text-lg">{totalCorrect}</span> / <span className="font-bold">{QUIZ_QUESTIONS.length}</span> correctly.
                            </p>
                        </div>
                        <div className="flex gap-3 quiz-end-actions">
                            <button
                                onClick={restartQuiz}
                                className="px-5 py-3 min-h-[44px] bg-white text-indigo-600 border-2 border-indigo-100 rounded-full font-bold uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-2 text-[10px] md:text-xs shadow-sm"
                            >
                                <span className="text-base">↺</span> Restart
                            </button>
                            <button
                                onClick={onExit}
                                className="px-6 py-3 min-h-[44px] bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 text-[10px] md:text-xs shadow-md hover:shadow-lg"
                            >
                                Menu <span className="text-base">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Columns */}
                    <div className="flex-1 overflow-hidden p-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-7xl mx-auto quiz-end-content">
                        {/* Myth Column */}
                        <div className="flex flex-col bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden h-full">
                            <div className="shrink-0 p-3 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-sm border border-orange-100">
                                    <img src="/stickman_assets/sad_stickman.svg" className="w-5 h-5" alt="Myth" />
                                </div>
                                <h3 className="font-black uppercase text-orange-600 tracking-widest text-xs md:text-sm">Myth Pile</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                                {quizCards.myth.length === 0 && <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No cards in this pile</div>}
                                {quizCards.myth.map((c, i) => (
                                    <div key={i} className={`p-3 rounded-xl border-l-4 bg-slate-50 transition-all hover:bg-white hover:shadow-sm ${c.answer === 'Myth' ? 'border-teal-400 bg-teal-50/20' : 'border-red-400 bg-red-50/20'}`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs md:text-sm font-bold text-slate-700 leading-snug">{c.question}</span>
                                            {c.answer === 'Myth' ?
                                                <span className="shrink-0 bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">OK <img src="/stickman_assets/happy_stickman.svg" className="w-3 h-3" alt="" /></span>
                                                :
                                                <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">NO <img src="/stickman_assets/sad_stickman.svg" className="w-3 h-3" alt="" /></span>
                                            }
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 pl-2 border-l border-slate-200 leading-relaxed">{c.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fact Column */}
                        <div className="flex flex-col bg-white rounded-2xl border border-teal-200 shadow-sm overflow-hidden h-full">
                            <div className="shrink-0 p-3 bg-teal-50 border-b border-teal-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white text-teal-600 flex items-center justify-center shadow-sm border border-teal-100">
                                    <img src="/stickman_assets/happy_stickman.svg" className="w-5 h-5" alt="Fact" />
                                </div>
                                <h3 className="font-black uppercase text-teal-600 tracking-widest text-xs md:text-sm">Fact Pile</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent">
                                {quizCards.fact.length === 0 && <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No cards in this pile</div>}
                                {quizCards.fact.map((c, i) => (
                                    <div key={i} className={`p-3 rounded-xl border-l-4 bg-slate-50 transition-all hover:bg-white hover:shadow-sm ${c.answer === 'Fact' ? 'border-teal-400 bg-teal-50/20' : 'border-red-400 bg-red-50/20'}`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs md:text-sm font-bold text-slate-700 leading-snug">{c.question}</span>
                                            {c.answer === 'Fact' ?
                                                <span className="shrink-0 bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">OK <img src="/stickman_assets/happy_stickman.svg" className="w-3 h-3" alt="" /></span>
                                                :
                                                <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">NO <img src="/stickman_assets/sad_stickman.svg" className="w-3 h-3" alt="" /></span>
                                            }
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 pl-2 border-l border-slate-200 leading-relaxed">{c.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Missed Questions (If any, displayed as a small scrollable vertical list if we have too many, or just appended? Let's hide missed questions for now to ensure perfect layout as user moved the cards themselves) */}
                        {quizCards.deck.length > 0 && (
                            <div className="md:col-span-2 bg-slate-100 rounded-xl p-4 border border-slate-200 h-[100px] overflow-y-auto">
                                <h3 className="font-black uppercase text-slate-400 text-[10px] tracking-widest mb-2 sticky top-0 bg-slate-100">Missed Questions ({quizCards.deck.length})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {quizCards.deck.map((c, i) => (
                                        <div key={i} className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-500 truncate flex justify-between">
                                            <span className="truncate mr-2">{c.question}</span>
                                            <span className="font-bold text-slate-300">{c.answer}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizGameScreen;
