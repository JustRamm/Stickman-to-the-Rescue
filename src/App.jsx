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

  // Dynamic Dialogue Loading
  const currentScenario = dialogueData[selectedLevel.theme] || dialogueData['park']; // Fallback

  const [currentNodeId, setCurrentNodeId] = useState(currentScenario.startNode);
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
  // Optional: Walking direction for sprite flipping (-1 left, 1 right, 0 idle)
  const [moveDir, setMoveDir] = useState(0);

  const sliderRef = useRef(null);

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;

    // Only apply logic on mobile (if grid layout is active on desktop, offsets might differ, but our dual-design uses flex-row for mobile slider)
    // We can check if overflow-x is actually active or check window width, but simpler is to just run math.

    const center = container.scrollLeft + (container.offsetWidth / 2);

    // We assume direct children are the buttons
    const cards = Array.from(container.children);
    let closestMission = null;
    let minDiff = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const diff = Math.abs(center - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestMission = MISSIONS[index];
      }
    });

    if (closestMission && closestMission.id !== selectedLevel.id) {
      setSelectedLevel(closestMission);
    }
  };

  const currentNode = currentScenario.nodes[currentNodeId];

  // Removed the aggressive useEffect that reset game state on level change
  // Instead, we handle resets explicitly when launching a mission.

  const launchMission = (mission) => {
    setSelectedLevel(mission);
    // Reset Level Specific State
    setCurrentNodeId(dialogueData[mission.theme]?.startNode || 'beginning');
    setFoundClues([]);
    setTrust(25);
    setPlayerPos({ x: 10, y: 70 });
    // Start Game
    setGameState('APPROACH');
    audioManager.startAmbient(mission.theme);
  };

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
        audioManager.init();
      } else if (e.key === 'ArrowLeft' && playerPos.x > 5) {
        setPlayerPos(prev => ({ ...prev, x: prev.x - 1.5 }));
        setIsWalking(true);
        audioManager.init();
      } else if (e.key === 'ArrowUp' && !isJumping) {
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 500);
      } else if (e.key === 'ArrowDown') {
        setIsCrouching(true);
      } else if (e.key.toLowerCase() === 'z') {
        handleInvestigate();
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


  useEffect(() => {
    if (moveDir === 0 || gameState !== 'APPROACH') return;
    const interval = setInterval(() => {
      setPlayerPos(prev => {
        const nextX = prev.x + (moveDir * 1.5);
        if (nextX < 5 || nextX > 65) return prev;

        return { ...prev, x: nextX };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [moveDir, gameState]);

  useEffect(() => {
    if (!isWalking || gameState !== 'APPROACH') return;

    // Play a step immediately and then every 400ms
    audioManager.playStep();
    const interval = setInterval(() => {
      audioManager.playStep();
    }, 400);

    return () => clearInterval(interval);
  }, [isWalking, gameState]);

  useEffect(() => {
    if (gameState === 'APPROACH' || gameState === 'DIALOGUE') {
      audioManager.init();
      audioManager.startAmbient(trust, selectedLevel.theme);
    } else {
      audioManager.stopMusic();
    }
  }, [gameState, selectedLevel.theme, trust]);

  useEffect(() => {
    if (gameState === 'APPROACH' && Math.abs(playerPos.x - samPos.x) < 18) {
      setGameState('DIALOGUE');
      setIsWalking(false);
      setIsCrouching(false);
    }
  }, [playerPos, samPos, gameState]);

  useEffect(() => {
    audioManager.updateMusic(trust);
  }, [trust]);

  useEffect(() => {
    if (gameState === 'DIALOGUE') {
      audioManager.playPop();
      // Add a natural 500ms pause before Sam responds
      setTimeout(() => {
        audioManager.speak(currentNode.npc_text, true, 'guy');
      }, 500);
    }
  }, [currentNodeId, gameState]);

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
    }, 3500); // Increased from 1800ms to allow full reading
  };

  /* New State for Clue Inspection */
  const [viewedClue, setViewedClue] = useState(null);

  const handleInvestigate = () => {
    const clue = CLUE_POSITIONS[selectedLevel.theme];
    if (clue && !foundClues.includes(clue.id)) {
      // Direct click interaction - no distance check needed for mouse/touch
      setViewedClue(clue);
      audioManager.playInvestigate();
    }
  };

  const closeClueModal = () => {
    if (viewedClue) {
      setFoundClues(prev => [...prev, viewedClue.id]);
      setViewedClue(null);
    }
  };

  const CLUE_DETAILS = {
    family_photo: { title: "A Crumpled Photograph", description: "A slightly water-damaged photo of Sam smiling with two children at a birthday party. 'Happy 40th Dad!' is written on the back." },
    termination_letter: { title: "Official Letterhead", description: "TERMINATION OF EMPLOYMENT. 'Effective Immediately due to restructuring.' The paper has been folded and unfolded many times." },
    failing_grade: { title: "Academic Notice", description: "Academic Probation Warning. 'Grade: F'. Red ink circles the phrase 'Loss of Scholarship Eligibility'." },
    wet_envelope: { title: "Eviction Notice", description: "FINAL NOTICE TO VACATE. 'Failure to pay rent will result in immediate legal action.' It's stained with mud." }
  };

  const resetGame = () => {
    setGameState('START');
    setCurrentNodeId(dialogueData.startNode);
    setTrust(25);
    setPlayerName('You');
    setPlayerPos({ x: 10, y: 70 });
    setSelectedResource(null);
    setHistory([]);
    setPlayerLastSaid(null);
    setIsJumping(false);
    setIsCrouching(false);
    setViewedClue(null);
  };

  const vignetteOpacity = Math.max(0, ((100 - trust) / 100) * 0.4);

  if (gameState === 'START') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center p-6">
        {/* Dynamic Background with stronger blur for start screen */}
        <div className="absolute inset-0 z-0 opacity-60 contrast-125 blur-sm scale-110">
          <Scenery trust={trust} />
        </div>

        {/* Main Hero Card - Glassmorphism */}
        <div className="relative z-20 w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 p-8 md:p-12 text-center animate-fade-in flex flex-col items-center overflow-hidden">

          {/* Top Badge: Mind Empowered Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="relative group w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-2 ring-teal-100 transition-transform duration-300 hover:scale-110">
              <img src="/ME.jpeg" alt="Mind Empowered" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0" />
              <img src="/ME.gif" alt="Mind Empowered Animated" className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Presented By <span className="text-teal-700">Mind Empowered</span></span>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-8" />

          {/* Hero Section */}
          <div className="mb-8 relative hover:rotate-2 transition-transform duration-500 cursor-pointer" onClick={() => audioManager.playPop()}>
            <div className="absolute inset-0 bg-teal-300/30 blur-2xl rounded-full animate-pulse z-0" />
            <img src="/logo.svg" alt="Game Logo" className="relative z-10 w-32 h-32 md:w-36 md:h-36 drop-shadow-xl" />

            {/* Floating Elements */}
            <div className="absolute -right-4 top-0 animate-bounce delay-700 bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-xl rotate-12">❓</div>
            <div className="absolute -left-4 bottom-0 animate-bounce delay-1000 bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-xl -rotate-12">❤️</div>
          </div>

          {/* Title - Ultra Bold */}
          <div className="mb-8 space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-800 leading-none">
              STICKMAN <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-500">TO THE RESCUE</span>
            </h1>
          </div>

          {/* Start Button - High Contrast */}
          <button
            onClick={() => { audioManager.init(); setGameState('NAMING'); }}
            className="group relative w-full max-w-xs py-5 bg-slate-900 text-white rounded-2xl font-black text-lg tracking-widest uppercase shadow-2xl hover:bg-teal-600 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start Journey
            </span>
            {/* Hover shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
          </button>

          <p className="mt-6 text-slate-400 text-xs font-semibold max-w-sm leading-relaxed">
            A serious game simulation for QPR Suicide Prevention Training.
          </p>

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
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-y-auto relative flex flex-col items-center justify-center p-4">
        <Scenery trust={trust} />
        <div className="relative z-20 max-w-md w-full p-8 md:p-12 naming-card bg-white/80 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/50 text-center animate-fade-in my-auto">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-teal-800 mb-8">Character Voice</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => { setPlayerGender('guy'); audioManager.speak("Testing, testing. This is the guy voice.", false, 'guy'); }}
              className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${playerGender === 'guy' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105' : 'border-slate-100 bg-white/50 hover:bg-slate-50'}`}
            >
              <img src="/stickman_assets/guy_idle.svg" alt="Guy Character" className="w-16 h-16 md:w-20 md:h-20" />
              <span className="font-bold uppercase text-[10px] tracking-widest text-slate-600">Guy</span>
            </button>
            <button
              onClick={() => { setPlayerGender('girl'); audioManager.speak("Testing, testing. This is the girl voice.", false, 'girl'); }}
              className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${playerGender === 'girl' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105' : 'border-slate-100 bg-white/50 hover:bg-slate-50'}`}
            >
              <img src="/stickman_assets/girl_idle.svg" alt="Girl Character" className="w-16 h-16 md:w-20 md:h-20" />
              <span className="font-bold uppercase text-[10px] tracking-widest text-slate-600">Girl</span>
            </button>
          </div>

          <button
            onClick={() => setGameState('LEVEL_SELECT')}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'LEVEL_SELECT') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col justify-center">
        <Scenery theme={selectedLevel.theme} trust={trust} />

        {/* Header - Fixed at top for context */}
        <div className="relative z-20 text-center mb-4 md:mb-12 mt-12 md:mt-0 px-4 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white drop-shadow-lg mb-2 tracking-tight">
            Select Your Mission
          </h2>
          <p className="text-white/90 font-medium text-sm md:text-lg drop-shadow-md">
            Swipe to explore scenarios
            ```
          </p>
        </div>

        {/* Scrollable Container - Horizontal Slider on Mobile, Grid on Desktop */}
        <div className="relative z-20 w-full max-w-[90rem] mx-auto px-0 md:px-8">
          <div
            ref={sliderRef}
            onScroll={handleSliderScroll}
            className="
              flex flex-row md:grid md:grid-cols-2 
              gap-4 md:gap-8 
              overflow-x-auto md:overflow-visible 
              pb-12 md:pb-0 px-8 md:px-0
              snap-x snap-mandatory touch-pan-x
              scrollbar-hide
            ">
            {MISSIONS.map((mission) => (
              <button
                key={mission.id}
                onClick={() => launchMission(mission)}
                onMouseEnter={() => setSelectedLevel(mission)}
                // Update background immediately on touch interaction for mobile feel
                onTouchStart={() => setSelectedLevel(mission)}
                className={`
                    flex-shrink-0 w-[85vw] md:w-auto snap-center
                    group relative p-6 md:p-10 
                    bg-white/80 backdrop-blur-xl rounded-[2.5rem] border-2 transition-all duration-300
                    text-left flex flex-col justify-between h-[60vh] md:h-64
                    overflow-hidden
                    ${selectedLevel.id === mission.id
                    ? 'border-teal-500 shadow-2xl scale-100 z-10'
                    : 'border-white/40 hover:border-teal-200 opacity-80 hover:opacity-100 scale-95 md:scale-100'
                  }
                  `}
              >
                {/* Dynamic Background Tint for active card */}
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${selectedLevel.id === mission.id ? 'opacity-10 bg-gradient-to-br from-teal-400 to-transparent' : ''}`} />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border ${mission.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                      mission.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                      {mission.difficulty}
                    </span>

                    {/* Selection Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLevel.id === mission.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'}`}>
                      {selectedLevel.id === mission.id && <span className="text-xs font-bold">✓</span>}
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 leading-none">
                    {mission.name}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                    {mission.desc}
                  </p>
                </div>

                <div className="relative z-10 pt-6 mt-auto border-t border-slate-200/50 flex items-center justify-between text-slate-400 group-hover:text-teal-600 transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start Simulation</span>
                  <span className="text-xl">➔</span>
                </div>
              </button>
            ))}
          </div>
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

      {/* Clue Inspection Modal */}
      {viewedClue && CLUE_DETAILS[viewedClue.id] && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl transform scale-100 border-2 border-slate-100 relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full font-bold shadow-lg animate-bounce">
              CLUE FOUND
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{CLUE_DETAILS[viewedClue.id].title}</h3>
            <div className="w-full h-px bg-slate-200 mb-4" />
            <p className="text-slate-600 italic leading-relaxed mb-6">"{CLUE_DETAILS[viewedClue.id].description}"</p>
            <button
              onClick={closeClueModal}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
            >
              Note & Continue
            </button>
          </div>
        </div>
      )}

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
              gender="guy"
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
          gender={playerGender}
          moveDir={moveDir}
        />

        <Stickman
          speaker="Sam"
          emotion={currentNode.npc_emotion}
          position={samPos}
          currentMessage={(gameState === 'DIALOGUE' && !playerLastSaid) ? currentNode.npc_text : null}
          textEffect={currentNode.text_effect}
          gender="guy"
        />

        {/* Ambient NPC walking in distant background */}
        <div className="animate-[slide_20s_linear_infinite]" style={{ position: 'absolute', width: '100%', top: '65%', opacity: 0.1 }}>
          <Stickman speaker="" emotion="neutral" position={{ x: -10, y: 0 }} isWalking={true} gender="guy" />
        </div>

        {/* Environmental Clue (Artifact) */}
        {CLUE_POSITIONS[selectedLevel.theme] && !foundClues.includes(CLUE_POSITIONS[selectedLevel.theme].id) && (
          <div
            onClick={handleInvestigate}
            className="absolute bottom-[30%] animate-bounce cursor-pointer z-50 hover:scale-110 transition-transform"
            style={{ left: `${CLUE_POSITIONS[selectedLevel.theme].x}%`, transform: 'translateX(-50%) translateY(-100%)' }}
          >
            <div className="w-8 h-10 bg-white border-2 border-orange-200 rounded-sm shadow-lg rotate-12 flex items-center justify-center p-1">
              <div className="w-full h-0.5 bg-slate-100 mb-0.5" />
              <div className="w-full h-0.5 bg-slate-100 mb-0.5" />
              <div className="w-2/3 h-0.5 bg-slate-100" />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase text-orange-600 bg-white/90 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
              Tap to Investigate
            </div>
          </div>
        )}

        {/* Mobile Input HUD */}
        {isTouchDevice && gameState === 'APPROACH' && (
          <>
            <div className="mobile-controls">
              <button
                onMouseDown={() => { setMoveDir(-1); setIsWalking(true); }}
                onMouseUp={() => { setMoveDir(0); setIsWalking(false); }}
                onTouchStart={() => { setMoveDir(-1); setIsWalking(true); }}
                onTouchEnd={() => { setMoveDir(0); setIsWalking(false); }}
                className="control-btn"
              >
                ←
              </button>
              <button
                onMouseDown={() => { setMoveDir(1); setIsWalking(true); }}
                onMouseUp={() => { setMoveDir(0); setIsWalking(false); }}
                onTouchStart={() => { setMoveDir(1); setIsWalking(true); }}
                onTouchEnd={() => { setMoveDir(0); setIsWalking(false); }}
                className="control-btn"
              >
                →
              </button>
            </div>

            <div className="action-buttons flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onTouchStart={() => { setIsJumping(true); setTimeout(() => setIsJumping(false), 500); }}
                  className="control-btn bg-teal-50"
                >
                  JUMP
                </button>
                <button
                  onTouchStart={() => setIsCrouching(true)}
                  onTouchEnd={() => setIsCrouching(false)}
                  className="control-btn bg-orange-50"
                >
                  HIDE
                </button>
              </div>
              {CLUE_POSITIONS[selectedLevel.theme] &&
                !foundClues.includes(CLUE_POSITIONS[selectedLevel.theme].id) &&
                Math.abs(playerPos.x - CLUE_POSITIONS[selectedLevel.theme].x) < 12 && (
                  <button
                    onClick={handleInvestigate}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg animate-pulse"
                  >
                    🔎 INVESTIGATE
                  </button>
                )}
            </div>
          </>
        )}

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
