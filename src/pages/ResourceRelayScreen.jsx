import React, { useState, useEffect, useRef } from 'react';
import { OBSTACLES, PLAYER_CARDS } from '../data/resourceRelayData';
import Stickman from '../components/Stickman';
import Scenery from '../components/Scenery';

const ResourceRelayScreen = ({ audioManager, onComplete, onExit, isPaused = false }) => {
    // Game State
    const [level, setLevel] = useState(0);
    const [currentObstacle, setCurrentObstacle] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, RESOLVING, WIN, LOSE
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'failure', msg: string }
    const [samEmotion, setSamEmotion] = useState('anxious');
    const [inspectedCard, setInspectedCard] = useState(null);

    // Animation States
    const [isSamAttacking, setIsSamAttacking] = useState(false);

    // Refs
    const resistanceMax = 5;
    const shuffledObstaclesRef = useRef([]);

    useEffect(() => {
        // Init Game: Shuffle obstacles once per session
        const shuffled = [...OBSTACLES].sort(() => Math.random() - 0.5);
        shuffledObstaclesRef.current = shuffled;

        startLevel(0, shuffled);
    }, []);

    const startLevel = (lvlIdx, obstaclesPool = shuffledObstaclesRef.current) => {
        if (lvlIdx >= resistanceMax) {
            setGameState('WIN');
            if (audioManager) audioManager.playVictory();
            return;
        }

        // Use the shuffled pool to avoid repetition
        const obs = obstaclesPool[lvlIdx % obstaclesPool.length];
        setCurrentObstacle(obs);
        setSamEmotion(obs.stickman_emotion);

        // Deal hand (ensure valid winning cards + random distractors)
        const possibleWinners = obs.weaknesses.map(id => PLAYER_CARDS.find(c => c.id === id)).filter(Boolean);

        if (possibleWinners.length === 0) {
            console.error(`Obstacle ${obs.id} has no valid winners in PLAYER_CARDS!`);
        }

        // To fix the "missing card" feel, let's include as many winners as fit in a variety of slots
        // but prioritize at least one.
        let hand = [];
        const shuffledWinners = [...possibleWinners].sort(() => Math.random() - 0.5);

        // Add up to 2 winners to make it fair but not too obvious
        const winnersToAdd = shuffledWinners.slice(0, 2);
        hand.push(...winnersToAdd);

        // Fill remaining slots with distractors
        const winnerIds = hand.map(w => w.id);
        const distractors = PLAYER_CARDS.filter(c => !winnerIds.includes(c.id));
        const shuffledDistractors = [...distractors].sort(() => Math.random() - 0.5);

        while (hand.length < 4 && shuffledDistractors.length > 0) {
            hand.push(shuffledDistractors.shift());
        }

        // Final shuffle of the 4-card hand
        hand = hand.sort(() => Math.random() - 0.5);
        setPlayerHand(hand);

        setGameState('PLAYING');
        setIsSamAttacking(true);
        setTimeout(() => setIsSamAttacking(false), 800);
    };

    const handleCardPlay = (card) => {
        if (gameState !== 'PLAYING' || isPaused) return;
        setInspectedCard(null);
        setGameState('RESOLVING');

        // Check match
        const isMatch = currentObstacle.weaknesses.includes(card.id);

        if (isMatch) {
            // Success
            setFeedback({ type: 'success', msg: "Linked to Help!" });
            setSamEmotion('relief');
            if (navigator.vibrate) navigator.vibrate(50);
            if (audioManager) audioManager.playDing();

            setTimeout(() => {
                setScore(s => s + 1);
                setFeedback(null);
                const nextLevel = level + 1;
                setLevel(nextLevel);
                startLevel(nextLevel);
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
        <div className="fixed inset-0 bg-sky-50 flex flex-col font-sans overflow-hidden resource-relay-container">
            {/* Unique Backwaters Scenery Background */}
            <Scenery theme="backwaters" trust={80} />
            <div className="absolute inset-0 bg-white/5" style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }}></div>

            {/* Header / HUD */}
            <div className="relative z-10 px-6 py-4 flex justify-between items-center bg-[#0d2d3a]/80 backdrop-blur-xl border-b border-teal-500/20 resource-relay-header">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onExit}
                        className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 uppercase tracking-widest"
                    >
                        Exit Game
                    </button>
                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/60">Referral Battle</span>
                        <span className="text-white font-black text-base tracking-tight">KERALA EDITION</span>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em]">
                        Stage {level + 1} of {resistanceMax}
                    </span>
                    <div className="flex gap-1.5">
                        {[...Array(resistanceMax)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i < level ? 'w-4 md:w-8 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]' :
                                    i === level ? 'w-6 md:w-10 bg-white border border-teal-400 animate-pulse' : 'w-2 md:w-6 bg-slate-700'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Battle Arena */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4 resource-relay-arena">

                {/* Sam / Opponent Area */}
                <div className="relative flex flex-col items-center mb-10 w-full max-w-2xl resource-relay-sam-zone">
                    <div className={`transition-all duration-500 transform ${isSamAttacking ? 'scale-110 translate-y-4' : 'scale-100'}`}>
                        <Stickman
                            position={{ x: 0, y: 0 }}
                            emotion={samEmotion}
                            gender={currentObstacle?.gender || 'guy'}
                            theme="backwaters"
                            noWrapper
                            scale={1.5}
                        />
                    </div>

                    {/* Crisis Warning Bubble */}
                    {gameState !== 'WIN' && (
                        <div className={`mt-4 bg-[#082f49]/10 backdrop-blur-xl border border-[#082f49]/10 p-6 rounded-[2rem] rounded-tl-none shadow-2xl relative animate-float-slow max-w-lg transition-all duration-300 ${feedback?.type === 'success' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-lg shadow-lg animate-pulse">⚠️</div>
                            <h3 className="text-[#0d9488] font-black uppercase text-[10px] tracking-[0.3em] mb-1">Crisis Warning</h3>
                            <p className="text-xl md:text-2xl font-black text-[#01161d] leading-tight">"{currentObstacle?.text}"</p>
                        </div>
                    )}

                    {/* Feedback Popup */}
                    {feedback && (
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-10 py-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-4 animate-pop-in flex flex-col items-center gap-2 ${feedback.type === 'success' ? 'bg-teal-600 border-teal-300 text-white' : 'bg-red-600 border-red-300 text-white'}`}
                            style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                            <div className="text-4xl">{feedback.type === 'success' ? '✨' : '💥'}</div>
                            <span className="text-3xl font-black uppercase tracking-[0.2em] drop-shadow-lg">{feedback.msg}</span>
                            {feedback.type === 'success' && <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Barrier Resolved</span>}
                        </div>
                    )}
                </div>

                {/* Info Modal Overlay */}
                {inspectedCard && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="max-w-sm w-full bg-white/95 rounded-[3rem] p-10 text-center shadow-4xl border border-white animate-pop-in relative resource-relay-info-card"
                            style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
                            <button onClick={() => setInspectedCard(null)} className="absolute top-8 right-8 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90">✕</button>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150" />
                                <div className="relative w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-slate-50">
                                    <img src={inspectedCard.icon} alt={inspectedCard.title} className="w-14 h-14 object-contain" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-1 mb-6">
                                <span className="bg-indigo-500/10 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Resource Insight</span>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{inspectedCard.title}</h2>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50 mb-8">
                                <p className="text-slate-700 text-sm font-bold leading-relaxed italic">
                                    "{inspectedCard.learn_info}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => handleCardPlay(inspectedCard)}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                                >
                                    Deploy Resource
                                </button>
                                <button
                                    onClick={() => setInspectedCard(null)}
                                    className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-colors"
                                >
                                    Keep Browsing
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Player Hand Area */}
                {gameState === 'WIN' ? (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-fade-in">
                        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl border-b-8 border-teal-500 relative overflow-hidden resource-relay-win-card">
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
                    <div className={`w-full max-w-4xl flex justify-center items-end gap-2 md:gap-4 h-[220px] pb-4 transition-all duration-500 resource-relay-hand-area ${gameState === 'RESOLVING' ? 'translate-y-full opacity-50' : 'translate-y-0 opacity-100'}`}>
                        {playerHand.map((card, i) => (
                            <div
                                key={card.id + i}
                                className="group relative w-24 h-36 md:w-40 md:h-56 translate-y-0 select-none flex-shrink"
                                style={{
                                    transform: `rotate(${(i - (playerHand.length - 1) / 2) * 5}deg) translateY(${Math.abs((i - (playerHand.length - 1) / 2) * 10)}px)`,
                                    zIndex: 10 + i,
                                    maxWidth: '22vw'
                                }}
                            >
                                {/* Eye Icon for Details */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setInspectedCard(card); }}
                                    className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-emerald-100 text-emerald-600 hover:text-emerald-400 hover:scale-110 active:scale-90 transition-all z-50 pointer-events-auto"
                                    title="View Support Details"
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => handleCardPlay(card)}
                                    className="w-full h-full bg-[#f0f9ff]/90 rounded-2xl p-3 flex flex-col items-center text-center shadow-2xl hover:-translate-y-6 hover:scale-110 hover:shadow-[0_30px_60px_rgba(13,45,58,0.4)] transition-all duration-300 ease-out border-4 border-emerald-50 hover:border-emerald-400 active:scale-95 resource-relay-card-btn"
                                >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                                        <img src={card.icon} alt={card.type} className="w-6 h-6 object-contain brightness-0 invert" />
                                    </div>
                                    <div className="mt-6 flex-1 flex flex-col items-center justify-center">
                                        <h4 className="font-black text-[#064e3b] text-xs md:text-sm leading-tight mb-2 tracking-tight uppercase">{card.title}</h4>
                                        <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] mb-2">{card.type}</span>
                                        <p className="text-[9px] md:text-[10px] text-emerald-900/60 leading-snug font-bold line-clamp-3 md:line-clamp-4">{card.desc}</p>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResourceRelayScreen;
