import React, { useState, useEffect } from 'react';
import Stickman from './components/Stickman';
import DialogueBox from './components/DialogueBox';
import ResourceWallet from './components/ResourceWallet';
import Scenery from './components/Scenery';
import dialogueData from './dialogue.json';
import { audioManager } from './utils/audio';

const RESOURCES = [
  { id: 1, name: 'Crisis Hotline', description: 'Immediate clinical support via phone or text.' },
  { id: 2, name: 'Professional Therapist', description: 'Long-term psychological treatment and support.' },
  { id: 3, name: 'A Trusted Friend', description: 'Immediate emotional support and social connection.' }
];

const BACKGROUND_NPCS = [
  { id: 'bg1', pos: { x: 85, y: 70 }, emotion: 'neutral', scale: 0.8, opacity: 0.2 },
  { id: 'bg2', pos: { x: 25, y: 70 }, emotion: 'listening', scale: 0.7, opacity: 0.15 },
  { id: 'bg3', pos: { x: 92, y: 70 }, emotion: 'neutral', scale: 0.85, opacity: 0.1 }
];

const MISSIONS = [
  { id: 'park', name: 'The Sunset Park', desc: 'A regular evening in the park. Sam is alone.', difficulty: 'Easy', theme: 'park' },
  { id: 'office', name: 'Midnight Office', desc: 'Sam is working late. The vibe is stark and cold.', difficulty: 'Medium', theme: 'office' },
  { id: 'campus', name: 'Alumni Square', desc: 'A high-pressure university campus environment.', difficulty: 'Hard', theme: 'campus' },
  { id: 'rainy', name: 'Rainy Sidewalk', desc: 'A moody street scene. Weather adds to the tension.', difficulty: 'Expert', theme: 'rainy_street' }
];

const App = () => {
  const [gameState, setGameState] = useState('START');
  const [playerName, setPlayerName] = useState('You');
  const [playerGender, setPlayerGender] = useState('guy'); // guy or girl
  const [selectedLevel, setSelectedLevel] = useState(MISSIONS[0]);
  const [foundClues, setFoundClues] = useState([]);

  const CLUE_POSITIONS = {
    park: { x: 40, label: 'Dropped Photo', id: 'family_photo' },
    office: { x: 30, label: 'Termination Letter', id: 'termination_letter' },
    campus: { x: 50, label: 'Failing Grade Paper', id: 'failing_grade' },
    rainy_street: { x: 45, label: 'Discarded Envelope', id: 'wet_envelope' }
  };

  const [currentNodeId, setCurrentNodeId] = useState(dialogueData.startNode);
  const [trust, setTrust] = useState(25);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [playerLastSaid, setPlayerLastSaid] = useState(null);

  const [playerPos, setPlayerPos] = useState({ x: 10, y: 70 });
  const [samPos, setSamPos] = useState({ x: 75, y: 70 });

  // Movement States
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const currentNode = dialogueData.nodes[currentNodeId];

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (gameState !== 'APPROACH') return;

    const handleKeyDown = (e) => {
      audioManager.init(); // Ensure context is resumed
      if (e.key === 'ArrowRight' && playerPos.x < 65) {
        setPlayerPos(prev => ({ ...prev, x: prev.x + 1.5 }));
        setIsWalking(true);
      } else if (e.key === 'ArrowLeft' && playerPos.x > 5) {
        setPlayerPos(prev => ({ ...prev, x: prev.x - 1.5 }));
        setIsWalking(true);
      } else if (e.key === 'ArrowUp' && !isJumping) {
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 500);
      } else if (e.key === 'ArrowDown') {
        setIsCrouching(true);
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowRight', 'ArrowLeft'].includes(e.key)) setIsWalking(false);
      if (e.key === 'ArrowDown') setIsCrouching(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, playerPos, isJumping]);

  // Touch Movement Loop
  useEffect(() => {
    if (!isWalking || (gameState !== 'APPROACH' && gameState !== 'DIALOGUE')) return;

    // We only need to handle automated walking here if using onMouseDown/TouchStart
    // But for simplicity, we'll manage it via a simple interval if isWalking is set by touch
    if (isWalking && gameState === 'APPROACH') {
      const interval = setInterval(() => {
        setPlayerPos(prev => {
          // This is a bit complex to handle "direction" here without another state
          // I'll add a moveDirection state for cleaner touch handling
          return prev;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isWalking, gameState]);

  const [moveDir, setMoveDir] = useState(0); // -1, 0, 1

  useEffect(() => {
    if (moveDir === 0 || gameState !== 'APPROACH') return;
    const interval = setInterval(() => {
      setPlayerPos(prev => {
        const nextX = prev.x + (moveDir * 1.5);
        if (nextX < 5 || nextX > 65) return prev;

        // Footstep rhythm (roughly every 5 ticks)
        if (Math.round(nextX * 10) % 5 === 0) audioManager.playStep();

        return { ...prev, x: nextX };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [moveDir, gameState]);

  useEffect(() => {
    if (gameState === 'APPROACH' && Math.abs(playerPos.x - samPos.x) < 18) {
      setGameState('DIALOGUE');
      setIsWalking(false);
      setIsCrouching(false);
    }
  }, [playerPos, samPos, gameState]);

  useEffect(() => {
    if (gameState === 'APPROACH' || gameState === 'DIALOGUE') {
      audioManager.init();
      audioManager.startMusic(trust);
    } else {
      audioManager.stopMusic();
    }
  }, [gameState === 'APPROACH']);

  useEffect(() => {
    audioManager.updateMusic(trust);
  }, [trust]);

  useEffect(() => {
    if (gameState === 'DIALOGUE') {
      audioManager.playPop();
      audioManager.speak(currentNode.npc_text, true, 'guy'); // Sam is always guy
    }
  }, [currentNodeId]);

  useEffect(() => {
    if (trust <= 0 && currentNodeId !== 'leave_failure') {
      setCurrentNodeId('leave_failure');
    }

    if (currentNode.required_resource) {
      setIsWalletOpen(true);
    } else {
      setIsWalletOpen(false);
    }
  }, [trust, currentNodeId, currentNode.required_resource]);

  const handleSelectOption = (nextNodeId, trustImpact) => {
    const selectedOption = currentNode.options.find(o => o.next === nextNodeId);
    const bestOption = currentNode.options.reduce((prev, current) =>
      (prev.trust_impact > current.trust_impact) ? prev : current
    );

    setPlayerLastSaid(selectedOption.text);
    audioManager.speak(selectedOption.text, false, playerGender); // Player speaks 

    // Play sound based on trust impact
    if (trustImpact > 0) audioManager.playDing();
    else if (trustImpact < 0) audioManager.playSad();

    setTimeout(() => {
      setPlayerLastSaid(null);

      const choiceData = {
        nodeId: currentNodeId,
        choiceText: selectedOption.text,
        wasOptimal: trustImpact === bestOption.trust_impact,
        trustChange: trustImpact || 0,
        npcEmotion: currentNode.npc_emotion
      };

      setHistory(prev => [...prev, choiceData]);

      if (currentNode.required_resource) {
        if (selectedResource === currentNode.required_resource) {
          setTrust(100);
          setCurrentNodeId(nextNodeId);
        } else {
          setTrust(prev => Math.max(0, prev - 20));
          alert(`Sam looks confused. '${selectedResource || 'Nothing'}' doesn't seem like what he needs right now. Try the Crisis Hotline.`);
        }
        return;
      }

      setTrust(prev => Math.min(100, Math.max(0, prev + (trustImpact || 0))));
      setCurrentNodeId(nextNodeId);
    }, 1800);
  };

  const resetGame = () => {
    setGameState('START');
    setCurrentNodeId(dialogueData.startNode);
    setTrust(25);
    setPlayerName('You'); // Reset player name
    setPlayerPos({ x: 10, y: 70 });
    setSelectedResource(null);
    setHistory([]);
    setPlayerLastSaid(null);
    setIsJumping(false);
    setIsCrouching(false);
  };

  const vignetteOpacity = Math.max(0, ((100 - trust) / 100) * 0.4);

  if (gameState === 'START') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
        <Scenery trust={trust} />

        {/* Animated Introductory Scene */}
        <div className="relative z-10 w-full max-w-4xl h-[400px] mb-12">
          <div className="absolute left-[20%] top-[70%] animate-pulse">
            <Stickman speaker="Guide" emotion="listening" position={{ x: 50, y: 0 }} />
          </div>
          <div className="absolute right-[20%] top-[70%] animate-[bounce_3s_infinite]">
            <Stickman speaker="Sam" emotion="sad" position={{ x: 50, y: 0 }} />
          </div>

          {/* Connection Line Decor */}
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-50" />
        </div>

        <div className="relative z-20 text-center px-8">
          <div className="flex flex-col items-center mb-8 gap-4">
            <div className="relative group">
              <img
                src="/ME.jpeg"
                alt="Organization Logo"
                className="w-16 h-16 rounded-2xl shadow-xl transition-opacity group-hover:opacity-0"
              />
              <img
                src="/ME.gif"
                alt="Organization Logo Animated"
                className="w-16 h-16 rounded-2xl shadow-xl absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute -bottom-2 -right-2 bg-teal-500 w-6 h-6 rounded-full border-4 border-slate-50 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Presented By</span>
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-teal-600">Mind Empowered</span>
            </div>
          </div>

          <div className="flex flex-col items-center mb-12">
            <img
              src="/logo.svg"
              alt="Stickman to the Rescue Logo"
              className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl animate-float"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase text-teal-800 drop-shadow-sm">
            Stickman <span className="text-orange-600">to the Rescue</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm md:text-lg text-slate-600 mb-12 leading-relaxed font-medium">
            A journey of connection and life-saving support. <br />
            Learn the <strong className="text-teal-700">QPR Method</strong> to provide hope in the darkness.
          </p>

          <button
            onClick={() => { audioManager.init(); setGameState('NAMING'); }}
            className="group relative px-16 py-5 bg-teal-600 text-white rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:bg-teal-700 shadow-2xl shadow-teal-600/40 transition-all duration-500 hover:scale-110"
          >
            <span className="relative z-10">Start Mission</span>
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <div className="mt-16 flex justify-center gap-12 opacity-30">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-teal-900">Question</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-teal-900">Persuade</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-teal-900">Refer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'NAMING') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
        <Scenery trust={trust} />
        <div className="relative z-20 max-w-md w-full p-12 naming-card bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl border border-white/50 text-center animate-fade-in">

          <div className="mb-8 w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black uppercase text-teal-800 mb-2">Identify Yourself</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium italic">What is your Name, Gatekeeper?</p>

          <input
            type="text"
            placeholder="Enter your name..."
            className="w-full px-6 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl mb-6 text-center text-lg font-bold text-slate-800 focus:border-teal-500 focus:outline-none transition-colors"
            value={playerName === 'You' ? '' : playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setGameState('GENDER_SELECT')}
          />

          <button
            disabled={!playerName.trim()}
            onClick={() => setGameState('GENDER_SELECT')}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            Choose Gender
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'GENDER_SELECT') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
        <Scenery trust={trust} />
        <div className="relative z-20 max-w-md w-full p-12 naming-card bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl border border-white/50 text-center animate-fade-in">
          <h2 className="text-3xl font-black uppercase text-teal-800 mb-8">Character Voice</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => { setPlayerGender('guy'); audioManager.speak("Testing, testing. This is the guy voice.", false, 'guy'); }}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${playerGender === 'guy' ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-white/50'}`}
            >
              <div className="text-3xl">👨</div>
              <span className="font-bold uppercase text-[10px] tracking-widest text-slate-600">Guy</span>
            </button>
            <button
              onClick={() => { setPlayerGender('girl'); audioManager.speak("Testing, testing. This is the girl voice.", false, 'girl'); }}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${playerGender === 'girl' ? 'border-teal-600 bg-teal-50' : 'border-slate-100 bg-white/50'}`}
            >
              <div className="text-3xl">👩</div>
              <span className="font-bold uppercase text-[10px] tracking-widest text-slate-600">Girl</span>
            </button>
          </div>

          <button
            onClick={() => setGameState('LEVEL_SELECT')}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all"
          >
            Mission Select
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'LEVEL_SELECT') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center p-8">
        <Scenery theme={selectedLevel.theme} trust={trust} />
        <div className="relative z-20 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {MISSIONS.map((mission) => (
            <button
              key={mission.id}
              onClick={() => { setSelectedLevel(mission); setGameState('APPROACH'); }}
              onMouseEnter={() => setSelectedLevel(mission)}
              className={`group p-6 bg-white/80 backdrop-blur-md rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-48 ${selectedLevel.id === mission.id ? 'border-teal-500 shadow-xl translate-y-[-4px]' : 'border-white/50 hover:border-teal-200'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">{mission.difficulty}</span>
                  <div className="w-4 h-4 rounded-full border border-teal-500 flex items-center justify-center">
                    {selectedLevel.id === mission.id && <div className="w-2 h-2 bg-teal-500 rounded-full" />}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{mission.name}</h3>
                <p className="text-xs text-slate-500">{mission.desc}</p>
              </div>
              <div className="text-[9px] font-black uppercase text-slate-400 group-hover:text-teal-500 transition-colors">Launch Mission →</div>
            </button>
          ))}
        </div>
        <div className="relative z-20 mt-12 text-center">
          <h2 className="text-2xl font-black uppercase text-teal-800 mb-2">Select Your Chapter</h2>
          <p className="text-slate-500 text-sm">Every story starts with a single approach.</p>
        </div>
      </div>
    );
  }


  if (currentNode.isEnd) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 text-slate-900 p-8 animate-fade-in overflow-y-auto">
        <div className={`mb-8 p-8 md:p-12 bg-white rounded-3xl border ${currentNode.result === 'success' ? 'border-teal-200' : 'border-orange-200'} shadow-2xl max-w-2xl w-full mx-auto`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold uppercase mb-4 ${currentNode.result === 'success' ? 'text-teal-600' : 'text-orange-600'}`}>
              {currentNode.result === 'success' ? 'Crisis Averted' : 'Session Terminated'}
            </h2>
            <p className="text-lg text-slate-600 mb-8">{currentNode.message}</p>
          </div>

          <div className="mt-12 border-t border-slate-100 pt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> DEBRIEFING REPORT
            </h3>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="flex gap-4 items-start bg-slate-50 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 mt-1">0{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-semibold mb-2">"{h.choiceText}"</p>
                    <div className="flex gap-3">
                      {h.wasOptimal ? (
                        <span className="text-[9px] uppercase font-bold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">Proactive Engagement</span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Reactive/Dismissive</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={resetGame}
            className="mt-12 w-full px-8 py-5 bg-teal-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-teal-700 transition-all"
          >
            Restart Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container min-h-screen w-full bg-slate-50 overflow-hidden relative">
      <Scenery theme={selectedLevel.theme} trust={trust} />
      <div className="tunnel-vision" style={{ opacity: vignetteOpacity }} />

      {/* Connection HUD */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 z-20">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Empathy Score</span>
          <span className={`text-[10px] font-mono font-bold ${trust < 30 ? 'text-orange-600' : 'text-teal-600'}`}>{trust}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full ${trust < 30 ? 'bg-orange-500' : 'bg-teal-500'}`}
            style={{ width: `${trust}%` }}
          />
        </div>
      </div>

      <ResourceWallet
        isOpen={isWalletOpen}
        resources={RESOURCES}
        selectedResource={selectedResource}
        onSelectResource={setSelectedResource}
      />

      {/* Gameplay Area */}
      <div className="flex-1 relative z-10 w-full h-full">
        {/* Background NPCs for life */}
        {BACKGROUND_NPCS.map(npc => (
          <div key={npc.id} style={{ opacity: npc.opacity, transform: `scale(${npc.scale})` }}>
            <Stickman
              speaker=""
              emotion={npc.emotion}
              position={npc.pos}
            />
          </div>
        ))}

        <Stickman
          speaker={playerName}
          emotion="listening"
          position={playerPos}
          isWalking={isWalking}
          isJumping={isJumping}
          isCrouching={isCrouching}
          currentMessage={playerLastSaid}
        />

        <Stickman
          speaker="Sam"
          emotion={currentNode.npc_emotion}
          position={samPos}
          currentMessage={!playerLastSaid ? currentNode.npc_text : null}
          textEffect={currentNode.text_effect}
        />

        {/* Ambient NPC walking in distant background */}
        <div className="animate-[slide_20s_linear_infinite]" style={{ position: 'absolute', width: '100%', top: '65%', opacity: 0.1 }}>
          <Stickman speaker="" emotion="neutral" position={{ x: -10, y: 0 }} isWalking={true} />
        </div>

        {/* Environmental Clue (Artifact) */}
        {CLUE_POSITIONS[selectedLevel.theme] && !foundClues.includes(CLUE_POSITIONS[selectedLevel.theme].id) && (
          <div
            className="absolute bottom-[30%] animate-bounce cursor-help"
            style={{ left: `${CLUE_POSITIONS[selectedLevel.theme].x}%`, transform: 'translateX(-50%) translateY(-100%)' }}
          >
            <div className="w-6 h-8 bg-white border-2 border-orange-200 rounded-sm shadow-lg rotate-12 flex items-center justify-center p-1">
              <div className="w-full h-0.5 bg-slate-100 mb-0.5" />
              <div className="w-full h-0.5 bg-slate-100 mb-0.5" />
              <div className="w-2/3 h-0.5 bg-slate-100" />
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase text-orange-600 bg-white/90 px-2 py-0.5 rounded-full border border-orange-100">
              Investigate
            </div>
          </div>
        )}

        {/* ... (Mobile Input HUD) ... */}

        {gameState === 'APPROACH' && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center animate-bounce px-4 w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-800 bg-white/80 px-4 py-2 rounded-full border border-teal-100 shadow-sm backdrop-blur-sm block mx-auto max-w-xs">
              {isTouchDevice ? 'Use buttons to approach Sam' : 'Search the area or approach Sam'}
            </span>
          </div>
        )}
      </div>

      {/* Discovery Notification */}
      {foundClues.length > 0 && (
        <div className="fixed top-24 right-8 flex flex-col gap-2 z-[100] animate-slide-up">
          {foundClues.map(clueId => (
            <div key={clueId} className="bg-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-orange-400 flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🔍</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Discovery Unlocked</p>
                <p className="text-xs font-bold font-mono">NEW DIALOGUE OPTION</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ... (Chapter Label) ... */}

      {gameState === 'DIALOGUE' && !playerLastSaid && (
        <DialogueBox
          options={currentNode.options}
          onSelect={handleSelectOption}
          foundClues={foundClues}
        />
      )}
    </div>
  );
};

export default App;
