import React, { useState, useEffect, useRef } from 'react';
import { OBSTACLES, PLAYER_CARDS } from '../data/resourceRelayData';
import Stickman from '../components/Stickman';

const ResourceRelayScreen = ({ audioManager, onComplete, onExit }) => {
    // Game State
    const [level, setLevel] = useState(0);
    const [currentObstacle, setCurrentObstacle] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, RESOLVING, WIN, LOSE
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'failure', msg: string }
    const [samEmotion, setSamEmotion] = useState('anxious');

    // Animation States
    const [isSamAttacking, setIsSamAttacking] = useState(false);

    // Refs
    const resistanceMax = 3;

    useEffect(() => {
        // Init Game
        startLevel(0);
    }, []);

    const startLevel = (lvlIdx) => {
        if (lvlIdx >= resistanceMax) {
            setGameState('WIN');
            if (audioManager) audioManager.playVictory();
            return;
        }

        // Pick random obstacle
        const obs = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        setCurrentObstacle(obs);
        setSamEmotion(obs.stickman_emotion);

        // Deal hand (ensure at least one winning card + random distractors)
        const possibleWinners = obs.weaknesses.map(id => PLAYER_CARDS.find(c => c.id === id)).filter(Boolean);
        const winningCard = possibleWinners.length > 0
            ? possibleWinners[Math.floor(Math.random() * possibleWinners.length)]
            : PLAYER_CARDS[0]; // Fallback

        let hand = [winningCard];
        while (hand.length < 4) {
            const randomCard = PLAYER_CARDS[Math.floor(Math.random() * PLAYER_CARDS.length)];
            if (randomCard && !hand.some(c => c?.id === randomCard.id)) {
                hand.push(randomCard);
            }
        }
        // Shuffle hand
        hand = hand.sort(() => Math.random() - 0.5);
        setPlayerHand(hand);

        setGameState('PLAYING');
        setIsSamAttacking(true);
        setTimeout(() => setIsSamAttacking(false), 800);
    };

    const handleCardPlay = (card) => {
        if (gameState !== 'PLAYING') return;

        setGameState('RESOLVING');

        // Check match
        const isMatch = currentObstacle.weaknesses.includes(card.id);

        if (isMatch) {
            // Success
            setFeedback({ type: 'success', msg: "Barrier Broken!" });
            setSamEmotion('relief');
            if (navigator.vibrate) navigator.vibrate(50);
            if (audioManager) audioManager.playDing();

            setTimeout(() => {
                setScore(s => s + 1);
                setFeedback(null);
                setLevel(l => l + 1);
                startLevel(level + 1);
            }, 1500);
        } else {
            // Failure
            setFeedback({ type: 'failure', msg: "That won't work..." });
            setSamEmotion('distressed');
            if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
            if (audioManager) audioManager.playSad();

            setTimeout(() => {
                setFeedback(null);
                setGameState('PLAYING'); // Retry same level
            }, 1500);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col font-sans overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black pointer-events-none"></div>

            {/* Header / HUD */}
            <div className="relative z-10 px-6 py-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Mission</span>
                        <span className="text-white font-bold">Remove Barriers</span>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2">
                    {[...Array(resistanceMax)].map((_, i) => (
                        <div key={i} className={`w-8 h-2 rounded-full transition-all ${i < level ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-slate-700'}`}></div>
                    ))}
                </div>

                <button onClick={onExit} className="px-4 py-2 bg-slate-700 rounded-full text-xs font-bold text-white hover:bg-slate-600 transition-all active:scale-95">
                    ABORT
                </button>
            </div>

            {/* Main Battle Arena */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4">

                {/* Sam / Opponent Area */}
                <div className="relative flex flex-col items-center mb-10 w-full max-w-2xl">
                    <div className={`transition-all duration-500 transform ${isSamAttacking ? 'scale-110 translate-y-4' : 'scale-100'}`}>
                        <Stickman
                            position={{ x: 0, y: 0 }}
                            emotion={samEmotion}
                            gender="guy"
                            theme="neutral"
                            noWrapper
                            scale={1.5}
                        />
                    </div>

                    {/* Threat/Obstacle Bubble */}
                    {gameState !== 'WIN' && (
                        <div className={`mt-4 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] rounded-tl-none shadow-2xl relative animate-float-slow max-w-lg transition-all duration-300 ${feedback?.type === 'success' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-lg shadow-lg animate-pulse">⚠️</div>
                            <h3 className="text-red-200 font-bold uppercase text-xs tracking-widest mb-1">Barrier Detected</h3>
                            <p className="text-xl md:text-2xl font-black text-white leading-tight">"{currentObstacle?.text}"</p>
                        </div>
                    )}

                    {/* Feedback Popup */}
                    {feedback && (
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl border-2 animate-bounce-subtle whitespace-nowrap ${feedback.type === 'success' ? 'bg-teal-500 border-teal-300 text-white' : 'bg-red-500 border-red-300 text-white'}`}>
                            <span className="text-2xl font-black uppercase tracking-widest">{feedback.msg}</span>
                        </div>
                    )}
                </div>

                {/* Player Hand Area */}
                {gameState === 'WIN' ? (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-fade-in">
                        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl border-b-8 border-teal-500 relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-50 rounded-full opacity-50"></div>

                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-teal-100 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner animate-bounce-subtle">
                                    🏆
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Master Referral!</h2>
                                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                    You've successfully matched barriers to the right support systems. You're becoming a vital lifeline.
                                </p>

                                <button
                                    onClick={onComplete}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    Continue Mission
                                </button>

                                <button
                                    onClick={onExit}
                                    className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Back to Level Select
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`w-full max-w-4xl flex justify-center items-end gap-2 md:gap-4 h-[220px] pb-4 transition-all duration-500 ${gameState === 'RESOLVING' ? 'translate-y-full opacity-50' : 'translate-y-0 opacity-100'}`}>
                        {playerHand.map((card, i) => (
                            <button
                                key={card.id + i}
                                onClick={() => handleCardPlay(card)}
                                className="group relative w-32 h-44 md:w-40 md:h-56 bg-white rounded-2xl p-3 flex flex-col items-center text-center shadow-2xl hover:-translate-y-6 hover:scale-110 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out border-4 border-slate-100 hover:border-indigo-400 hover:z-50 active:scale-95 translate-y-0"
                                style={{
                                    transform: `rotate(${(i - (playerHand.length - 1) / 2) * 5}deg) translateY(${Math.abs((i - (playerHand.length - 1) / 2) * 10)}px)`,
                                    zIndex: 10 + i
                                }}
                            >
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                                    <img src={card.icon} alt={card.type} className="w-6 h-6 object-contain" />
                                </div>
                                <div className="mt-6 flex-1 flex flex-col items-center justify-center">
                                    <h4 className="font-black text-slate-800 text-xs md:text-sm leading-tight mb-2 tracking-tight">{card.title}</h4>
                                    <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-2">{card.type}</span>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 leading-snug font-medium line-clamp-3 md:line-clamp-4">{card.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResourceRelayScreen;
