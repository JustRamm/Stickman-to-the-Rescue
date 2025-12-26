import React, { useState, useEffect, useRef } from 'react';
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

const OBSERVATION_DATA = {
  park: [
    { id: 'posture', x: 0, y: -5, w: 10, h: 25, label: 'Slumped Posture', type: 'Behavioral', desc: 'Shoulders hunched, head down. Indicates hopelessness.' },
    { id: 'isolation', x: 20, y: 0, w: 15, h: 10, label: 'Secluded Spot', type: 'Situational', desc: 'Chose a hidden bench away from the main path.' },
    { id: 'hands', x: 0, y: 10, w: 8, h: 8, label: 'Clenched Fists', type: 'Behavioral', desc: 'Sign of repressed anger or anxiety.' }
  ],
  office: [
    { id: 'fatigue', x: 0, y: -8, w: 10, h: 10, label: 'Dark Circles', type: 'Physical', desc: 'Signs of sleep deprivation and exhaustion.' },
    { id: 'desk', x: 15, y: 5, w: 12, h: 12, label: 'Messy Desk', type: 'Situational', desc: 'Loss of organizational control or apathy.' },
    { id: 'pacing', x: 0, y: 15, w: 10, h: 20, label: 'Restlessness', type: 'Behavioral', desc: 'Inability to sit still, high agitation.' }
  ],
  // Fallbacks for other themes
  campus: [
    { id: 'posture', x: 0, y: -5, w: 10, h: 25, label: 'Defeated Stance', type: 'Behavioral', desc: 'Looking at ground, avoiding eye contact.' },
    { id: 'bag', x: 10, y: 10, w: 10, h: 10, label: 'Heavy Bag', type: 'Situational', desc: 'Carrying a physical or metaphorical burden.' }
  ],
  rainy_street: [
    { id: 'shiver', x: 0, y: 0, w: 10, h: 30, label: 'Shivering', type: 'Physical', desc: 'Ignoring the cold/rain. Self-neglect.' },
    { id: 'shadow', x: -10, y: 20, w: 30, h: 5, label: 'Standing in Shadow', type: 'Situational', desc: 'Seeking invisibility or hiding.' }
  ]
};

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
  const [coachFeedback, setCoachFeedback] = useState(null);

  const [playerPos, setPlayerPos] = useState({ x: 10, y: 70 });
  const [samPos, setSamPos] = useState({ x: 75, y: 70 });

  // Movement States
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  // Optional: Walking direction for sprite flipping (-1 left, 1 right, 0 idle)
  const [moveDir, setMoveDir] = useState(0);

  /* New State for Clue Inspection */
  const [viewedClue, setViewedClue] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [scanTimer, setScanTimer] = useState(15);
  const [resolutionPhase, setResolutionPhase] = useState(0); // 0: Call, 1: Arrive, 2: Hug, 3: Speech

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

  // Universal Nodes Fallback
  let currentNode = currentScenario.nodes[currentNodeId];

  if (!currentNode) {
    if (currentNodeId === 'success_hotline') {
      currentNode = {
        isEnd: true,
        result: 'success',
        message: "You successfully connected Sam to the 14416 Mental Health Helpline. Your patience and empathy saved a life today. Sam is now speaking with a counselor.",
        npc_emotion: 'relief'
      };
    } else if (currentNodeId === 'leave_failure') {
      currentNode = {
        isEnd: true,
        result: 'failure',
        message: "You walked away. Sam remains alone with their heavy thoughts. Sometimes, just staying present is the most important intervention.",
        npc_emotion: 'distressed'
      };
    } else {
      currentNode = currentScenario.nodes['beginning'] || { text: "Error loading node...", options: [] };
    }
  }

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
    window.removeEventListener('keyup', handleKeyUp);
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
    if (gameState === 'APPROACH' || gameState === 'DIALOGUE' || gameState === 'SCAN') {
      audioManager.init();
      audioManager.startAmbient(trust, selectedLevel.theme);
    } else {
      audioManager.stopMusic();
    }
  }, [gameState, selectedLevel.theme, trust]);

  // Correct useEffect for Distance Check Triggering Scan
  useEffect(() => {
    if (gameState !== 'APPROACH') return;

    const interval = setInterval(() => {
      const dist = Math.abs(playerPos.x - samPos.x);
      if (dist < 15) {
        setGameState('DIALOGUE');
        // setScanTimer(15); // Not needed
        // setScannedItems([]); // Not needed
        // audioManager.playPop(); // Maybe keep sound?
        setIsWalking(false);
        setMoveDir(0);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [gameState, playerPos, isWalking, moveDir, isTouchDevice, selectedLevel]);

  // Resolution Cutscene Logic
  useEffect(() => {
    if (gameState !== 'RESOLUTION') return;

    // Phase 0: Start (0s)

    // Phase 1: Help Arrives (2s)
    const t1 = setTimeout(() => {
      setResolutionPhase(1);
    }, 2000);

    // Phase 2: Hug (4s)
    const t2 = setTimeout(() => {
      setResolutionPhase(2);
      audioManager.playPop(); // Heart pop sound
    }, 4500);

    // Phase 3: Speech (6s)
    const t3 = setTimeout(() => {
      setResolutionPhase(3);
      audioManager.speak("Thank you for being the bridge. We'll take care of Sam now.", false, 'girl'); // Helper voice
    }, 6500);

    // Phase 4: End Game (11s)
    const t4 = setTimeout(() => {
      setCurrentNodeId('success_hotline'); // Trigger end screen
      setGameState('DIALOGUE'); // Let the end screen logic take over
    }, 11000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'APPROACH' && Math.abs(playerPos.x - samPos.x) < 18) {
      // This block is now superseded by the SCAN state trigger
      // setGameState('DIALOGUE');
      // setIsWalking(false);
      // setIsCrouching(false);
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

    if (currentNode?.required_resource) {
      setIsWalletOpen(true);
    } else {
      setIsWalletOpen(false);
    }
  }, [trust, currentNodeId, currentNode?.required_resource]);

  // Auto-Redirect to Menu after 10s on End Screen
  useEffect(() => {
    if (currentNode?.isEnd) {
      // Play Victory Audio if Successful
      if (currentNode.result === 'success') {
        audioManager.playVictory();
      }

      const timer = setTimeout(() => {
        handleEndGameContinue();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentNode?.isEnd]);

  /* Game Logic */
  const handleSelectOption = (selectedOption) => {
    const nextNodeId = selectedOption.next;
    const trustImpact = selectedOption.trust_impact;

    // Calculate best option for analysis (still need to find in current set)
    const bestOption = currentNode.options.reduce((prev, current) =>
      (prev.trust_impact > current.trust_impact) ? prev : current
    );

    // Coach Feedback Logic
    const feedback = getCoachFeedback(trustImpact, selectedOption.text);
    setCoachFeedback(feedback);

    // Auto-dismiss coach feedback after 5 seconds
    setTimeout(() => setCoachFeedback(null), 5000);

    setPlayerLastSaid(selectedOption.text);

    // Check if this action triggers the Handoff immediately
    const isHandoffSuccess = currentNode?.required_resource && selectedResource === currentNode.required_resource;

    // Only speak if NOT transitioning to Handoff immediately (user request)
    if (!isHandoffSuccess) {
      audioManager.speak(selectedOption.text, false, playerGender);
    }

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
          setGameState('HANDOFF'); // TRIGGER HANDOFF
        } else {
          setTrust(prev => Math.max(0, prev - 10)); // Less penalty
          setCoachFeedback({
            msg: "Not quite. Check your Resource Toolkit on the right side context menu →",
            type: 'negative'
          });
          audioManager.playSad();
          // Keep wallet open!
          setIsWalletOpen(true);
        }
        return;
      }

      setTrust(prev => Math.min(100, Math.max(0, prev + (trustImpact || 0))));
      setCurrentNodeId(nextNodeId);
    }, 3500); // Increased from 1800ms to allow full reading
  };

  const getCoachFeedback = (impact, text) => {
    if (impact > 0) {
      const positives = [
        "Great! Validation builds safety.",
        "Acknowledging the pain helps them open up.",
        "Good use of open-ended listening.",
        "You're making them feel heard."
      ];
      return { msg: positives[Math.floor(Math.random() * positives.length)], type: 'positive' };
    } else if (impact < 0) {
      const negatives = [
        "Dismissive language shuts them down.",
        "Avoid trying to 'fix' it instantly. Just listen.",
        "That sounded judgmental. Try being curious.",
        "Minimizing their struggle reduces trust."
      ];
      return { msg: negatives[Math.floor(Math.random() * negatives.length)], type: 'negative' };
    }
    return { msg: "A neutral response. Try to dig deeper.", type: 'neutral' };
  };

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

  const handleScanClick = (clue) => {
    if (scannedItems.find(i => i.id === clue.id)) return;
    audioManager.playInvestigate();
    setScannedItems(prev => [...prev, clue]);
    setTrust(t => t + 5);
  };

  const completeScan = () => {
    setGameState('DIALOGUE');
    audioManager.playDing();
  };

  const CLUE_DETAILS = {
    family_photo: { title: "A Crumpled Photograph", description: "A slightly water-damaged photo of Sam smiling with two children at a birthday party. 'Happy 40th Dad!' is written on the back." },
    termination_letter: { title: "Official Letterhead", description: "TERMINATION OF EMPLOYMENT. 'Effective Immediately due to restructuring.' The paper has been folded and unfolded many times." },
    failing_grade: { title: "Academic Notice", description: "Academic Probation Warning. 'Grade: F'. Red ink circles the phrase 'Loss of Scholarship Eligibility'." },
    wet_envelope: { title: "Eviction Notice", description: "FINAL NOTICE TO VACATE. 'Failure to pay rent will result in immediate legal action.' It's stained with mud." }
  };

  const resetGame = () => {
    audioManager.stopMusic(); // Force stop all audio immediately
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
    setScannedItems([]);
    setScanTimer(15);
    setResolutionPhase(0);
  };

  const handleEndGameContinue = () => {
    audioManager.stopMusic();

    // Reset Session State (Keep Name/Gender unless Hard mode finished)
    setTrust(25);
    setPlayerPos({ x: 10, y: 70 });
    setSelectedResource(null);
    setHistory([]);
    setPlayerLastSaid(null);
    setIsJumping(false);
    setIsCrouching(false);
    setViewedClue(null);
    setScannedItems([]);
    setScanTimer(15);
    setResolutionPhase(0);

    if (selectedLevel.difficulty === 'Hard') {
      setGameState('START');
      setPlayerName('You'); // Full Reset
    } else {
      setGameState('LEVEL_SELECT');
    }
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

  if (gameState === 'SCAN') {
    const activeClues = OBSERVATION_DATA[selectedLevel.theme] || OBSERVATION_DATA['park'];
    return (
      <div className="game-container min-h-screen w-full bg-slate-900 text-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Background Frozen/Dimmed */}
        <div className="absolute inset-0 opacity-40 grayscale">
          <Scenery theme={selectedLevel.theme} trust={trust} />
        </div>

        {/* HUD Overlay - Behind Actions but in front of scene */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
          {/* Top HUD */}
          <div className="flex justify-between items-start">
            <div className="animate-fade-in md:ml-12 pointer-events-auto">
              <h3 className="text-2xl font-black uppercase text-teal-400 tracking-widest drop-shadow-md">Observation Mode</h3>
              <p className="text-slate-300 text-sm md:text-base max-w-md">
                Identify warning signs. <span className="text-teal-200 font-bold">Tap the red markers.</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-4 pointer-events-auto">
              <button
                onClick={resetGame}
                className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/50 transition-all"
              >
                Exit Mission
              </button>
              <div className="flex flex-col items-end">
                <div className="text-4xl font-mono font-bold text-teal-400">{scanTimer < 10 ? `0${scanTimer}` : scanTimer}s</div>
                <div className="text-[10px] uppercase h-1 w-32 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-teal-400 transition-all duration-1000 ease-linear" style={{ width: `${(scanTimer / 15) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Center Reticle Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] md:w-[600px] md:h-[600px] border-2 border-dashed border-teal-500/30 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500 -mt-2 -ml-2" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-500 -mt-2 -mr-2" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-500 -mb-2 -ml-2" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-500 -mb-2 -mr-2" />
            <div className="absolute inset-0 bg-teal-500/5 animate-pulse" />
          </div>

          {/* Bottom Action */}
          <div className="flex justify-center pointer-events-auto pb-8">
            <button
              onClick={completeScan}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              {scannedItems.length > 0 ? 'Analysis Complete' : 'Skip & Approach'} <span className="text-xl">➔</span>
            </button>
          </div>
        </div>

        {/* Stickman Container - Centered for Analysis */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="relative animate-slide-up" style={{ transform: 'scale(2.5) translateY(10%)' }}>
            <Stickman gender="guy" isNPC={true} emotion="distressed" position={{ x: 50, y: 50 }} theme={selectedLevel.theme} />

            {/* HITBOXES RENDERED HERE, RELATIVE TO STICKMAN */}
            {activeClues.map(clue => {
              const isFound = scannedItems.find(i => i.id === clue.id);
              return (
                <div
                  key={clue.id}
                  onClick={(e) => { e.stopPropagation(); handleScanClick(clue); }}
                  className={`absolute cursor-pointer transition-all duration-300 z-50
                  ${isFound
                      ? 'border-2 border-teal-400 bg-teal-400/20'
                      : 'border-2 border-dotted border-red-400/50 hover:border-red-400 hover:bg-red-400/10 animate-pulse'
                    }
                `}
                  style={{
                    /* Positioning relative to the 0,0 center of the stickman container */
                    left: `${clue.x}px`,
                    top: `${clue.y - 100}px`, /* Offset to account for stickman height anchor */
                    width: `${clue.w * 3}px`,
                    height: `${clue.h * 3}px`,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%'
                  }}
                >
                  {!isFound && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold px-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                      SCAN
                    </div>
                  )}
                  {isFound && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900/95 border border-teal-500 p-2 rounded-lg w-32 shadow-xl animate-bounce">
                      <div className="text-[8px] uppercase font-bold text-teal-400 mb-0.5">{clue.type}</div>
                      <div className="text-[10px] font-bold text-white leading-tight">{clue.label}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'RESOLUTION') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 overflow-hidden relative animate-fade-in flex flex-col justify-end">

        {/* Camera/Zoom Container */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-[3000ms] ease-in-out origin-center"
          style={{
            transform: resolutionPhase >= 2 ? 'scale(1.5) translateY(10%)' : 'scale(1) translateY(0)'
          }}
        >
          <Scenery theme={selectedLevel.theme} trust={100} />

          {/* Helper Character (Medic/Pro) */}
          <div
            className="absolute z-20 transition-all duration-[2000ms] ease-out bottom-[25%]"
            style={{
              left: resolutionPhase >= 1 ? '70%' : '110%',
            }}
          >
            <Stickman gender="girl" emotion="happy" theme={selectedLevel.theme} />

            {/* Speech Bubble */}
            {resolutionPhase >= 3 && (
              <div className="absolute -top-40 right-0 bg-white/90 backdrop-blur border-2 border-teal-500 text-slate-800 p-6 rounded-2xl rounded-br-none shadow-2xl w-64 animate-pop-in z-50">
                <p className="text-sm font-bold leading-relaxed">"Thank you for reaching out. We've got it from here."</p>
              </div>
            )}
          </div>

          {/* Main Characters */}
          <div className="absolute inset-0 z-10">
            {resolutionPhase < 2 ? (
              <>
                <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} />
                <Stickman speaker="Sam" position={samPos} gender="guy" emotion="relief" theme={selectedLevel.theme} />
              </>
            ) : (
              <div className="absolute left-[45%] bottom-[25%] -translate-x-1/2 flex flex-col items-center animate-fade-in">
                <img src="/stickman_assets/group_hug.svg" alt="Hug" className="w-[300px] h-[300px] drop-shadow-2xl filter brightness-110" />
                <div className="absolute -top-10 text-6xl animate-bounce">❤️</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'HANDOFF') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-900 overflow-hidden relative flex flex-col items-center justify-center p-4">
        {/* Blurred Background to focus on the task */}
        <div className="absolute inset-0 z-0 opacity-20 blur-xl scale-110">
          <Scenery theme={selectedLevel.theme} trust={trust} />
        </div>

        <div className="relative z-20 w-full max-w-sm bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden h-[80vh] flex flex-col animate-slide-up">
          {/* Phone Top Bar */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center text-xs px-6 pt-5">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-3 bg-white rounded-sm" />
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>

          {/* Phone Screen Content - Enhanced UI */}
          <div className="flex-1 bg-white flex flex-col pt-8 pb-8 px-6 relative font-sans">

            {/* Status Bar */}
            <div className="absolute top-3 right-6 flex gap-1.5 opacity-50">
              <div className="w-[3px] h-2.5 bg-black rounded-[1px]" />
              <div className="w-[3px] h-2.5 bg-black rounded-[1px]" />
              <div className="w-[3px] h-2.5 bg-black rounded-[1px]" />
              <div className="w-5 h-2.5 border border-black rounded-[2px] relative ml-1">
                <div className="absolute inset-0 bg-black m-[1px] w-[60%]" />
              </div>
            </div>

            <div className="flex flex-col items-center mt-2 mb-auto">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-2xl shadow-inner">
                🆘
              </div>
              <h2 className="text-lg font-bold text-slate-800">Emergency SOS</h2>

              {/* Input Display */}
              <div className="mt-4 mb-4 h-12 flex items-center justify-center border-b-2 border-slate-100 w-full">
                <span className="text-3xl font-light tracking-widest text-slate-900">
                  {scannedItems.length > 0 ? scannedItems.join('') : <span className="text-slate-200">...</span>}
                </span>
              </div>

              <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider mb-2">
                Helpline: 14416 / 112
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-y-3 gap-x-4 w-full max-w-[240px] mx-auto mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    if (scannedItems.length < 10) {
                      setScannedItems([...scannedItems, num]);
                      audioManager.playDing();
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-xl font-medium text-slate-800 flex items-center justify-center transition-all active:scale-95 active:bg-slate-200"
                >
                  {num}
                </button>
              ))}
              <div /> {/* Spacer */}
              <button
                onClick={() => {
                  if (scannedItems.length < 10) {
                    setScannedItems([...scannedItems, 0]);
                    audioManager.playDing();
                  }
                }}
                className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-xl font-medium text-slate-800 flex items-center justify-center transition-all active:scale-95"
              >
                0
              </button>
              <button onClick={() => setScannedItems(prev => prev.slice(0, -1))} className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
              </button>
            </div>

            {/* Call Button */}
            <button
              onClick={() => {
                const number = scannedItems.join('');
                if (number === '14416' || number === '112' || number === '988') {
                  audioManager.playPop();
                  setGameState('RESOLUTION');
                  setResolutionPhase(0);
                } else {
                  audioManager.playSad();
                  alert("Incorrect Number. Try the Mental Health Helpline: 14416");
                  setScannedItems([]);
                }
              }}
              className="w-16 h-16 mx-auto rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-green-500/30 shadow-lg transition-transform active:scale-90 animate-pulse border-4 border-green-100"
            >
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
            </button>

            {/* Emergency Override */}
            <button
              onClick={() => {
                setScannedItems([1, 4, 4, 1, 6]);
                setTimeout(() => {
                  setGameState('RESOLUTION');
                  setResolutionPhase(0);
                }, 500);
              }}
              className="mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest border-b border-transparent hover:border-slate-300 transition-all text-center w-full"
            >
              Auto-Dial 14416
            </button>

          </div>

          {/* Phone Home Bar */}
          <div className="h-1 w-32 bg-slate-200 rounded-full mx-auto my-4" />
        </div>
      </div>
    );
  }

  if (currentNode?.isEnd) {
    const isSuccess = currentNode.result === 'success';

    // Rank Logic
    let rankMessage = "You're a small gatekeeper now.";
    if (selectedLevel.difficulty === 'Medium') rankMessage = "You are growing into a Guardian.";
    if (selectedLevel.difficulty === 'Hard') rankMessage = "You're the Best! A Master Gatekeeper.";

    return (
      <div className="game-container h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center p-4 animate-fade-in">

        {/* Persistent Exit Button (End Screen) */}
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-4">
          <button
            onClick={() => { if (confirm("Exit the simulation?")) resetGame(); }}
            className="px-4 py-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg hover:bg-slate-700 transition-all border border-white/20"
          >
            Exit Game
          </button>
        </div>

        <Scenery theme={selectedLevel.theme} trust={isSuccess ? 100 : 0} />

        {/* Result Card - Compact View */}
        <div className="relative z-20 w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 flex flex-col max-h-[90vh] overflow-hidden">

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {/* Visual Header */}
            <div className="mb-4 flex justify-center shrink-0">
              {isSuccess ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-400/20 blur-3xl rounded-full animate-pulse" />
                  <img src="/stickman_assets/group_hug.svg" alt="Supportive Hug" className="relative z-10 w-32 h-24 md:w-40 md:h-32 drop-shadow-lg" />
                </div>
              ) : (
                <div className="relative grayscale opacity-80">
                  <Stickman emotion="distressed" gender="guy" isNPC={true} position={{ x: 50, y: 50 }} />
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <h2 className={`text-2xl md:text-3xl font-black uppercase mb-1 tracking-tight ${isSuccess ? 'text-teal-600' : 'text-orange-600'}`}>
                {isSuccess ? 'Connection Made' : 'Session Ended'}
              </h2>
              <p className={`text-sm font-black ${isSuccess ? 'text-purple-600' : 'text-slate-400'}`}>
                {isSuccess ? rankMessage : "Don't give up."}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> DEBRIEFING
              </h3>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3 items-start bg-slate-50/80 rounded-lg p-3">
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">0{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 font-semibold mb-1 leading-tight">"{h.choiceText}"</p>
                      <div className="flex gap-2">
                        {h.wasOptimal ? (
                          <span className="text-[8px] uppercase font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Proactive</span>
                        ) : (
                          <span className="text-[8px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Reactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200/50 mb-2">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Feedback</h4>
              <textarea
                className="w-full text-xs p-3 rounded-lg border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 outline-none mb-3 bg-white/50 focus:bg-white transition-all resize-none"
                placeholder="Reflect on your choices..."
                rows="2"
              ></textarea>
              <button
                onClick={(e) => {
                  e.target.innerHTML = "<span>Sent &hearts;</span>";
                  e.target.className = "text-[10px] font-bold text-white bg-green-500 px-4 py-1.5 rounded-lg shadow transition-all w-full";
                  e.target.disabled = true;
                }}
                className="text-[10px] font-bold text-teal-700 bg-white border border-teal-200 px-4 py-1.5 rounded-lg hover:bg-teal-50 transition-all shadow-sm w-full"
              >
                Send Feedback
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-100">
            {isSuccess && (
              <p className="text-center text-[10px] text-slate-400 font-medium mb-3">
                Redirecting in 10s...
              </p>
            )}
            <button
              onClick={handleEndGameContinue}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/30 active:scale-95"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container min-h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Persistent Branding */}
      {/* Persistent Branding & Controls */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none mix-blend-multiply opacity-90 flex flex-col gap-4">
        <img src="/ME.gif" alt="Mind Empowered" className="w-[80px] h-[80px] rounded-full border-4 border-white shadow-xl object-cover" />

        <button
          onClick={() => { if (confirm("Exit the simulation?")) resetGame(); }}
          className="pointer-events-auto w-[80px] py-1 bg-slate-900 border-2 border-white/50 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg hover:bg-slate-700 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 md:opacity-50"
        >
          Exit Game
        </button>
      </div>

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
              theme={selectedLevel.theme}
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
          theme={selectedLevel.theme}
        />

        <Stickman
          speaker="Sam"
          emotion={currentNode.npc_emotion}
          position={samPos}
          currentMessage={(gameState === 'DIALOGUE' && !playerLastSaid) ? currentNode.npc_text : null}
          textEffect={currentNode.text_effect}
          gender="guy"
          theme={selectedLevel.theme}
        />

        {/* Ambient NPC walking in distant background */}
        <div className="animate-[slide_20s_linear_infinite]" style={{ position: 'absolute', width: '100%', top: '65%', opacity: 0.1 }}>
          <Stickman speaker="" emotion="neutral" position={{ x: -10, y: 0 }} isWalking={true} gender="guy" theme={selectedLevel.theme} />
        </div>

        {/* Dog Walker (Park Exclusive) */}
        {selectedLevel.theme === 'park' && (
          <div className="animate-[slide_45s_linear_infinite]" style={{ position: 'absolute', width: '100%', top: '68%', opacity: 0.2, animationDelay: '5s' }}>
            <img
              src="/stickman_assets/dog_walker.svg"
              alt="Dog Walker"
              className="w-24 h-16"
              style={{ transform: 'scaleX(-1)' }} // Face right if sliding left-to-right? Wait, slide anim usually goes left to right.
            />
          </div>
        )}

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

      {/* Inner Coach / Instant Feedback Bubble */}
      {coachFeedback && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 max-w-sm w-11/12 z-[150] animate-fade-in-up">
          <div className={`p-4 rounded-xl border-l-4 shadow-xl backdrop-blur-md flex items-start gap-4 
                ${coachFeedback.type === 'positive' ? 'bg-teal-900/90 border-teal-400 text-teal-100' :
              coachFeedback.type === 'negative' ? 'bg-red-900/90 border-red-500 text-red-100' :
                'bg-slate-800/90 border-slate-400 text-slate-100'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner
                    ${coachFeedback.type === 'positive' ? 'bg-teal-800 text-teal-200' :
                coachFeedback.type === 'negative' ? 'bg-red-800 text-red-200' :
                  'bg-slate-700 text-slate-300'}`}
            >
              {coachFeedback.type === 'positive' ? '💡' : coachFeedback.type === 'negative' ? '⚠️' : 'ℹ️'}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-75 mb-1">Inner Coach</h4>
              <p className="text-sm font-medium leading-relaxed">{coachFeedback.msg}</p>
            </div>
          </div>
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
