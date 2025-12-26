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

const REAL_RESOURCES = {
  helplines: [
    { name: "Maithri Kochi", phone: "0484 2540530", hours: "10 AM - 7 PM", desc: "Confidential emotional support for those in distress." },
    { name: "Sanjeevani", phone: "0471 2533900", hours: "24/7", desc: "Suicide prevention and unconditional emotional support." },
    { name: "Disha Helpline", phone: "1056", hours: "24/7", desc: "Kerala Govt health awareness and intervention." },
    { name: "Tele-MANAS", phone: "14416", hours: "24/7", desc: "National tele-mental health assistance." }
  ],
  hospitals: [
    { name: "Amrita Hospital", location: "Edappally, Kochi", dept: "Psychiatry & Behavior Medicine", contact: "0484 2851234" },
    { name: "Cochin Brain & Behavioral Health", location: "Kochi", type: "Specialized Psychiatric Care", contact: "0484 2301030" },
    { name: "Nair's Hospital", location: "Vytila, Kochi", type: "Holistic Psychiatric Care", contact: "0484 2302666" }
  ],
  selfcare: [
    { title: "Breathe First", tip: "Practice deep breathing (4-7-8) after a stressful intervention." },
    { title: "Set Your Limits", tip: "Understand you are a gatekeeper, not a doctor. Connect them to pros." },
    { title: "Talk it Out", tip: "Debrief with a trusted peer or mentor after helping someone." },
    { title: "Physical Health", tip: "Ensure you sleep and hydrate. Compassion fatigue is real." }
  ]
};

const BACKGROUND_NPCS = [
  { id: 'bg1', pos: { x: 85, y: 70 }, emotion: 'neutral', scale: 0.8, opacity: 0.2 },
  { id: 'bg2', pos: { x: 25, y: 70 }, emotion: 'listening', scale: 0.7, opacity: 0.15 },
  { id: 'bg3', pos: { x: 92, y: 70 }, emotion: 'neutral', scale: 0.85, opacity: 0.1 }
];

const MISSIONS = [
  { id: 'tutorial', name: 'Interactive Intro', desc: 'Learn basic life-saving skills.', difficulty: 'Training', theme: 'park', npc: { name: 'Alex', gender: 'guy', voice: { pitch: 1.0, rate: 0.95 } } },
  { id: 'park', name: 'The Sunset Park', desc: 'An elderly resident is sitting alone.', difficulty: 'Easy', theme: 'park', npc: { name: 'Grace', gender: 'girl', voice: { pitch: 1.15, rate: 0.65 } } },
  { id: 'office', name: 'Midnight Office', desc: 'A manager is working late in a stark, cold office.', difficulty: 'Medium', theme: 'office', npc: { name: 'David', gender: 'guy', voice: { pitch: 0.65, rate: 0.7 } } },
  { id: 'campus', name: 'Alumni Square', desc: 'A student athlete is sitting in the quad.', difficulty: 'Hard', theme: 'campus', npc: { name: 'Maya', gender: 'girl', voice: { pitch: 1.35, rate: 1.05 } } },
  { id: 'rainy', name: 'Rainy Sidewalk', desc: 'A young man is standing near the street.', difficulty: 'Expert', theme: 'rainy_street', npc: { name: 'Raj', gender: 'guy', voice: { pitch: 0.75, rate: 0.8 } } }
];

const App = () => {
  const [gameState, setGameState] = useState('SPLASH');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [playerName, setPlayerName] = useState('You');
  const [playerGender, setPlayerGender] = useState('guy'); // guy or girl
  const [selectedLevel, setSelectedLevel] = useState(MISSIONS[0]); // Default to Tutorial
  const [foundClues, setFoundClues] = useState([]);

  const CLUE_POSITIONS = {
    tutorial: { x: 30, label: 'Tutorial Note', id: 'tutorial_note' },
    park: { x: 40, label: 'Dropped Photo', id: 'family_photo' },
    office: { x: 30, label: 'Termination Letter', id: 'termination_letter' },
    campus: { x: 50, label: 'Failing Grade Paper', id: 'failing_grade' },
    rainy_street: { x: 45, label: 'Discarded Envelope', id: 'wet_envelope' }
  };

  // Dynamic Dialogue Loading - Prioritize Mission ID, then Theme
  const currentScenario = dialogueData[selectedLevel.id] || dialogueData[selectedLevel.theme] || dialogueData['park'];

  const [currentNodeId, setCurrentNodeId] = useState(currentScenario.startNode || 'beginning');
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
  const [showDiscoveryPopup, setShowDiscoveryPopup] = useState(false);
  const [dialedNumber, setDialedNumber] = useState([]);
  const [resolutionPhase, setResolutionPhase] = useState(0); // 0: Call, 1: Arrive, 2: Hug, 3: Speech
  const [npcAction, setNpcAction] = useState('idle'); // idle, phone, sitting, pacing
  const [camera, setCamera] = useState({ scale: 1, x: 0, y: 0 });

  // Progression & Save System
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('qpr_completed_missions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (gameState !== 'SPLASH') return;

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Slower loading progress
        return prev + Math.random() * 5;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [gameState]);

  // Handle auto-transition from splash
  useEffect(() => {
    if (gameState === 'SPLASH' && loadingProgress >= 100) {
      const timer = setTimeout(() => {
        setGameState('START');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, gameState]);

  useEffect(() => {
    localStorage.setItem('qpr_completed_missions', JSON.stringify(completedLevels));
  }, [completedLevels]);

  const isMissionLocked = (missionId) => {
    // Tutorial is always unlocked
    if (missionId === 'tutorial') return false;

    // Park and Office require Tutorial completion
    if (missionId === 'park' || missionId === 'office') {
      return !completedLevels.includes('tutorial');
    }

    // Campus requires Park & Office
    if (missionId === 'campus') {
      return !(completedLevels.includes('park') && completedLevels.includes('office'));
    }

    // Rainy (Expert) requires Campus
    if (missionId === 'rainy') {
      return !completedLevels.includes('campus');
    }

    return false;
  };

  // Settings & Accessibility System
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('qpr_settings');
      return saved ? JSON.parse(saved) : { audioVolume: 0.5, ttsEnabled: true, textSpeed: 50 };
    } catch (e) {
      return { audioVolume: 0.5, ttsEnabled: true, textSpeed: 50 };
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const prevGameState = useRef('START');

  useEffect(() => {
    // Update prevGameState whenever it's not RESOURCES
    if (gameState !== 'RESOURCES') {
      prevGameState.current = gameState;
    }

    // Camera Logic
    if (gameState === 'DIALOGUE') {
      // Zoom in on interaction
      setCamera({ scale: 1.15, x: -10, y: -5 });
    } else if (gameState === 'APPROACH') {
      // Normal view
      setCamera({ scale: 1, x: 0, y: 0 });
    }
  }, [gameState]);
  useEffect(() => {
    localStorage.setItem('qpr_settings', JSON.stringify(settings));
    // Apply audio settings
    if (audioManager.initialized) {
      audioManager.setVolume(settings.audioVolume);
      audioManager.toggleTTS(settings.ttsEnabled);
    }
  }, [settings]);

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
    setCurrentNodeId(dialogueData[mission.id]?.startNode || 'beginning');
    setFoundClues([]);
    setTrust(25);
    setPlayerPos({ x: 10, y: 70 });
    // Cinematic Start: Pan in from further left
    setCamera({ scale: 1.2, x: 100, y: 0 });
    // Start Game
    setGameState('APPROACH');
    audioManager.startAmbient(mission.theme);

    // Smoothly pan to center after a tiny delay to trigger CSS transition
    setTimeout(() => {
      setCamera({ scale: 1, x: 0, y: 0 });
    }, 50);
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
    const isMenu = ['START', 'NAMING', 'GENDER_SELECT', 'LEVEL_SELECT'].includes(gameState);

    if (isMenu) {
      audioManager.playMenuMusic();
    } else if (gameState === 'APPROACH' || gameState === 'DIALOGUE' || gameState === 'SCAN') {
      audioManager.init(); // Ensure context is ready
      audioManager.startAmbient(trust, selectedLevel.theme);
    } else if (gameState === 'RESOLUTION') {
      // Handled by Victory or Phone logic
    } else if (gameState !== 'HANDOFF') {
      // Don't stop music during handoff or other transitional states unless needed
      audioManager.stopMusic();
    }
  }, [gameState, selectedLevel]);

  // Correct useEffect for Distance Check Triggering Scan
  useEffect(() => {
    if (gameState !== 'APPROACH') return;
    const dist = Math.abs(playerPos.x - samPos.x);

    if (dist < 10) {
      setGameState('DIALOGUE');
      audioManager.playDing();
    }
  }, [playerPos.x, samPos.x, gameState]);

  // NPC Dynamic Behavior Controller
  useEffect(() => {
    if (gameState !== 'APPROACH') {
      setNpcAction('idle');
      return;
    }

    const interval = setInterval(() => {
      // Don't change action if very close to player to avoid "glitching" during transition to SCAN
      const dist = Math.abs(playerPos.x - samPos.x);
      if (dist < 20) return;

      const actions = ['idle', 'phone', 'pacing', 'sitting'];
      setNpcAction(actions[Math.floor(Math.random() * actions.length)]);
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [gameState, playerPos.x, samPos.x]);

  // NPC Pacing Logic
  useEffect(() => {
    if (gameState !== 'APPROACH' || npcAction !== 'pacing') return;

    let dir = Math.random() > 0.5 ? 1 : -1;
    const interval = setInterval(() => {
      setSamPos(prev => {
        const nextX = prev.x + (dir * 0.05);
        if (nextX > 82) dir = -1;
        if (nextX < 68) dir = 1;
        return { ...prev, x: nextX };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [gameState, npcAction]);

  // Continuous Proximity Check (runs more frequently for mobile responsiveness)
  useEffect(() => {
    if (gameState !== 'APPROACH') return;

    const checkProximity = setInterval(() => {
      const dist = Math.abs(playerPos.x - samPos.x);
      if (dist < 10) {
        setGameState('DIALOGUE');
        audioManager.playDing();
      }
    }, 100); // Check every 100ms for responsive detection

    return () => clearInterval(checkProximity);
  }, [gameState, playerPos.x, samPos.x]);

  // Resolution Cutscene Logic
  useEffect(() => {
    if (gameState !== 'RESOLUTION') return;

    audioManager.stopMusic(); // Stop ambient mission music immediately
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
      // Stop any previous speech to ensure only current chapter's voice plays
      audioManager.stopSpeaking();
      // Add a natural 500ms pause before NPC responds
      setTimeout(() => {
        audioManager.speak(currentNode.npc_text, false, selectedLevel.npc.gender, selectedLevel.npc.voice);
      }, 500);
    }
  }, [currentNodeId, gameState, selectedLevel]);

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
      // Play Victory Audio if Successful, otherwise stop all music
      if (currentNode.result === 'success') {
        audioManager.playVictory();
      } else {
        audioManager.stopMusic();
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

      // Show discovery popup
      setShowDiscoveryPopup(true);

      // Auto-dismiss the discovery popup after 2 seconds
      setTimeout(() => {
        setShowDiscoveryPopup(false);
      }, 2000);
    }
  };


  const CLUE_DETAILS = {
    tutorial_note: { title: "Training Manual", description: "A guide on how to help others. Focus on Listen, Ask, and Refer." },
    family_photo: { title: "A Crumpled Photograph", description: "A slightly water-damaged photo of Sam smiling with two children at a birthday party. 'Happy 40th Dad!' is written on the back." },
    termination_letter: { title: "Official Letterhead", description: "TERMINATION OF EMPLOYMENT. 'Effective Immediately due to restructuring.' The paper has been folded and unfolded many times." },
    failing_grade: { title: "Academic Notice", description: "Academic Probation Warning. 'Grade: F'. Red ink circles the phrase 'Loss of Scholarship Eligibility'." },
    wet_envelope: { title: "Eviction Notice", description: "FINAL NOTICE TO VACATE. 'Failure to pay rent will result in immediate legal action.' It's stained with mud." }
  };

  const resetGame = () => {
    audioManager.stopMusic(); // Force stop all audio immediately
    setGameState('START');
    setCurrentNodeId(currentScenario.startNode || 'beginning');
    setTrust(25);
    setPlayerName('You');
    setPlayerPos({ x: 10, y: 70 });
    setSelectedResource(null);
    setHistory([]);
    setPlayerLastSaid(null);
    setIsJumping(false);
    setIsCrouching(false);
    setViewedClue(null);
    setDialedNumber([]);
    setResolutionPhase(0);
    setFoundClues([]);
    setNpcAction('idle');
  };

  const handleEndGameContinue = () => {
    audioManager.stopMusic();

    // Mark as completed if successful
    if (currentNode.result === 'success' && !completedLevels.includes(selectedLevel.id)) {
      setCompletedLevels(prev => [...prev, selectedLevel.id]);
    }

    // Reset Session State (Keep Name/Gender unless Hard mode finished)
    setTrust(25);
    setPlayerPos({ x: 10, y: 70 });
    setSelectedResource(null);
    setHistory([]);
    setPlayerLastSaid(null);
    setIsJumping(false);
    setIsCrouching(false);
    setViewedClue(null);
    setDialedNumber([]);
    setResolutionPhase(0);

    if (selectedLevel.difficulty === 'Hard') {
      setGameState('START');
      setPlayerName('You'); // Full Reset
    } else {
      setGameState('LEVEL_SELECT');
    }
  };

  const vignetteOpacity = Math.max(0, ((100 - trust) / 100) * 0.4);

  const renderSettingsUI = () => (
    <>
      {/* Settings Button (Top Right) */}
      <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[400] pointer-events-auto">
        <button
          onClick={() => { audioManager.init(); setIsSettingsOpen(true); }}
          className="w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 hover:shadow-lg transition-all border border-white/50 shadow-sm"
        >
          <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-[280px] md:max-w-sm bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg md:text-xl font-black uppercase text-slate-800 tracking-tight">Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">✕</button>
            </div>

            <div className="p-6 md:p-8 space-y-6 md:space-y-8">
              {/* Volume */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Master Volume</label>
                  <span className="text-xs md:text-sm font-bold text-teal-600">{Math.round(settings.audioVolume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={settings.audioVolume}
                  onChange={(e) => setSettings(s => ({ ...s, audioVolume: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 md:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* TTS Toggle */}
              <div className="flex justify-between items-center group">
                <div>
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 block group-hover:text-teal-600 transition-colors">Narrator (TTS)</label>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">Read dialogue out loud</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}
                  className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-all relative ${settings.ttsEnabled ? 'bg-teal-500 shadow-lg shadow-teal-500/30' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 md:top-1 left-0.5 md:left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.ttsEnabled ? 'translate-x-5 md:translate-x-6' : ''}`} />
                </button>
              </div>

              {/* Text Speed */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Text Flow Speed</label>
                  <span className="text-xs md:text-sm font-bold text-teal-600">
                    {settings.textSpeed === 0 ? 'Instant' : settings.textSpeed > 75 ? 'Relaxed' : settings.textSpeed > 30 ? 'Normal' : 'Rapid'}
                  </span>
                </div>
                <div className="relative py-1 md:py-2">
                  <input
                    type="range" min="0" max="100" step="5"
                    value={100 - settings.textSpeed}
                    onChange={(e) => setSettings(s => ({ ...s, textSpeed: 100 - parseInt(e.target.value) }))}
                    className="w-full h-1.5 md:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between mt-1 md:mt-2 px-1">
                    <span className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase">Slow</span>
                    <span className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase">Fast</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-4 md:py-5 bg-teal-600 text-white font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-teal-700 transition-colors shadow-inner"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}

    </>
  );

  const renderResourcesUI = () => (
    <div className="fixed inset-0 z-[600] bg-slate-900 overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

        {/* Header */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 relative z-10 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">Mental Health Resources</h2>
            <p className="text-teal-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Kochi, Kerala & Beyond</p>
          </div>
          <button
            onClick={() => setGameState(prevGameState.current)}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20 text-sm"
          >
            ← Back
          </button>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10 pb-20">
          {/* Helplines Column */}
          <div className="space-y-6">
            <h3 className="text-lg md:text-xl font-black text-white/50 uppercase tracking-widest px-2">Immediate Support</h3>
            {REAL_RESOURCES.helplines.map((item, i) => (
              <div key={i} className="group p-5 md:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] hover:border-teal-500/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-teal-400 transition-colors">{item.name}</h4>
                  <span className="text-[8px] md:text-[10px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full uppercase">{item.hours}</span>
                </div>
                <p className="text-slate-400 text-xs md:text-sm mb-4 leading-relaxed">{item.desc}</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500 rounded-lg">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                  </div>
                  <span className="text-base md:text-lg font-black text-teal-500 group-hover:scale-110 transition-transform origin-left">{item.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hospitals and Self Care Column */}
          <div className="space-y-8 md:space-y-12">
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg md:text-xl font-black text-white/50 uppercase tracking-widest px-2">Professional Care (Kochi)</h3>
              <div className="space-y-4">
                {REAL_RESOURCES.hospitals.map((hosp, i) => (
                  <div key={i} className="p-4 md:p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl">
                    <h5 className="font-bold text-white text-base md:text-lg">{hosp.name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium mb-2">{hosp.location} • {hosp.dept || hosp.type}</p>
                    <p className="text-sm font-black text-teal-500">{hosp.contact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg md:text-xl font-black text-white/50 uppercase tracking-widest px-2">Self-Care for You</h3>
              <div className="p-6 md:p-8 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-[1.5rem] md:rounded-[2.5rem] border border-teal-500/30">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {REAL_RESOURCES.selfcare.map((sc, i) => (
                    <div key={i} className="flex gap-3 md:gap-4">
                      <div className="w-1.5 h-1.5 mt-2 bg-teal-400 rounded-full flex-shrink-0" />
                      <div>
                        <h6 className="font-bold text-teal-400 text-xs md:text-sm mb-1">{sc.title}</h6>
                        <p className="text-slate-300 text-[10px] md:text-xs leading-relaxed">{sc.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full max-w-4xl border-t border-white/10 pt-8 text-center relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
            Saving a life starts with the first step. You are never alone.
          </p>
        </div>
      </div>
    </div>
  );

  if (gameState === 'RESOURCES') return renderResourcesUI();

  const renderSplashScreen = () => (
    <div className="game-container min-h-screen w-full bg-slate-900 text-white overflow-hidden relative flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 z-0">
        <Scenery theme="park" trust={50} />
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
      </div>

      <div className="relative z-20 flex flex-col items-center text-center max-w-sm w-full animate-fade-in p-4">
        <div className="mb-8 md:mb-12 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 animate-float">
            <img src="/logo.svg" alt="Stickman Logo" className="w-16 h-16 md:w-20 md:h-20" />
          </div>
          <div className="absolute inset-0 bg-teal-500/30 blur-2xl rounded-full animate-pulse-slow" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">STICKMAN</h1>
        <p className="text-teal-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-8 md:mb-12">To The Rescue</p>

        <div className="w-full h-16 flex items-center justify-center">
          <div className="w-full px-4">
            <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">
              <span>{loadingProgress >= 100 ? 'Ready to Start' : 'Loading Experience'}</span>
              <span>{Math.round(loadingProgress)}%</span>
            </div>
            <div className="h-1 md:h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-8 md:mt-12 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">
          Connecting to Empathy...
        </p>
      </div>
    </div>
  );

  if (gameState === 'SPLASH') return renderSplashScreen();

  if (gameState === 'START') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-900 text-white overflow-hidden relative flex flex-col items-center justify-center p-6">

        {/* Immersive Background */}
        <div className="absolute inset-0 z-0">
          <Scenery trust={trust} />
          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60 backdrop-blur-[2px]" />
        </div>

        {/* Floating Content */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl animate-slide-up px-4">

          {/* Top Badge: Mind Empowered Logo */}
          <div className="mb-6 md:mb-8 flex flex-col items-center gap-2 md:gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="relative group w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden shadow-2xl border-2 md:border-4 border-slate-800 ring-4 ring-teal-500/50 transition-transform duration-500 hover:scale-110 hover:rotate-3">
              <img src="/ME.jpeg" alt="Mind Empowered" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-colors" />
            </div>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-400/80 text-shadow-sm">Presented By Mind Empowered</span>
          </div>

          {/* Main Title Group */}
          <div className="mb-8 md:mb-12 relative">
            <div className="absolute -inset-10 bg-teal-500/20 blur-3xl rounded-full animate-pulse-slow pointer-events-none" />

            <h1 className="relative text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-2 leading-none">
              STICKMAN
            </h1>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-teal-300 animate-shimmer">
              TO THE RESCUE
            </h2>

            {/* Decorative Elements */}
            <div className="absolute -right-8 md:-right-16 -top-8 md:-top-12 animate-float delay-700 opacity-90 rotate-12 pointer-events-none">
              <img src="/stickman_assets/guy_idle.svg" alt="Stickman" className="w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>
            <div className="absolute -left-12 md:-left-16 -bottom-6 md:-bottom-8 animate-float delay-1000 opacity-90 -rotate-12 pointer-events-none">
              <img src="/stickman_assets/group_hug.svg" alt="Support" className="w-24 h-18 md:w-32 md:h-24 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => { audioManager.init(); setGameState('NAMING'); }}
            className="group relative px-8 md:px-12 py-4 md:py-6 bg-white text-slate-900 rounded-full font-black text-lg md:text-xl tracking-widest uppercase shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(20,184,166,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Simulation <span className="text-teal-600 transition-transform group-hover:translate-x-1">➔</span>
            </span>
            {/* Button Glint */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-teal-200/50 opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
          </button>

          <button
            onClick={() => { audioManager.init(); setGameState('RESOURCES'); }}
            className="mt-6 md:mt-8 text-teal-400 hover:text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Mental Health Resources</span>
            <span className="w-3 md:w-4 h-px bg-teal-500/50" />
            <span className="text-xs md:text-sm">✚</span>
          </button>

          <p className="mt-6 md:mt-8 text-slate-400 text-[10px] md:text-xs font-medium uppercase tracking-widest max-w-sm opacity-60">
            A QPR Suicide Prevention Training Module
          </p>

        </div>

        {renderSettingsUI()}
      </div>
    );
  }

  if (gameState === 'NAMING') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col items-center justify-center">
        {/* Back Button */}
        <button
          onClick={() => setGameState('START')}
          className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-lg transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <Scenery trust={trust} />
        <div className="relative z-20 max-w-md w-[85%] md:w-full p-8 md:p-12 naming-card bg-white/80 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white/50 text-center animate-fade-in">

          <div className="mb-6 md:mb-8 w-16 h-16 md:w-20 md:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-teal-800 mb-2">Identify Yourself</h2>
          <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 font-medium italic">What is your Name, Gatekeeper?</p>

          <input
            type="text"
            placeholder="Enter your name..."
            className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-100 border-2 border-slate-200 rounded-xl md:rounded-2xl mb-6 text-center text-base md:text-lg font-bold text-slate-800 focus:border-teal-500 focus:outline-none transition-colors"
            value={playerName === 'You' ? '' : playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setGameState('GENDER_SELECT')}
          />

          <button
            disabled={!playerName.trim()}
            onClick={() => setGameState('GENDER_SELECT')}
            className="w-full py-3 md:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-sm hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            Choose Gender
          </button>
        </div>

        {renderSettingsUI()}
      </div>
    );
  }

  if (gameState === 'GENDER_SELECT') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-y-auto relative flex flex-col items-center justify-center p-4">
        {/* Back Button */}
        <button
          onClick={() => { audioManager.stopSpeaking(); setGameState('NAMING'); }}
          className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-lg transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <Scenery trust={trust} />
        <div className="relative z-20 max-w-md w-[85%] md:w-full p-8 md:p-12 naming-card bg-white/80 backdrop-blur-md rounded-[2.5rem] md:rounded-[2rem] shadow-2xl border border-white/50 text-center animate-fade-in my-auto">
          <h2 className="text-xl md:text-3xl font-black uppercase text-teal-800 mb-6 md:mb-8">Character Voice</h2>

          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
            <button
              onClick={() => { setPlayerGender('guy'); audioManager.speak("Testing, testing. This is the guy voice.", false, 'guy'); }}
              className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 md:gap-3 ${playerGender === 'guy' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105' : 'border-slate-100 bg-white/50 hover:bg-slate-50'}`}
            >
              <img src="/stickman_assets/guy_idle.svg" alt="Guy Character" className="w-12 h-12 md:w-20 md:h-20" />
              <span className="font-bold uppercase text-[8px] md:text-[10px] tracking-widest text-slate-600">Guy</span>
            </button>
            <button
              onClick={() => { setPlayerGender('girl'); audioManager.speak("Testing, testing. This is the girl voice.", false, 'girl'); }}
              className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 md:gap-3 ${playerGender === 'girl' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105' : 'border-slate-100 bg-white/50 hover:bg-slate-50'}`}
            >
              <img src="/stickman_assets/girl_idle.svg" alt="Girl Character" className="w-12 h-12 md:w-20 md:h-20" />
              <span className="font-bold uppercase text-[8px] md:text-[10px] tracking-widest text-slate-600">Girl</span>
            </button>
          </div>

          <button
            onClick={() => {
              audioManager.stopSpeaking();
              setGameState('LEVEL_SELECT');
            }}
            className="w-full py-3 md:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-sm hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            Confirm & Continue
          </button>
        </div>

        {renderSettingsUI()}
      </div>
    );
  }

  if (gameState === 'LEVEL_SELECT') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col justify-center">
        {/* Back to Title */}
        <button
          onClick={() => setGameState('START')}
          className="absolute top-6 left-6 z-50 px-4 py-2 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-white hover:shadow-lg transition-all"
        >
          ← Exit to Title
        </button>

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
              gap-6 md:gap-8 
              overflow-x-auto md:overflow-visible 
              pb-12 md:pb-8 px-6 md:px-0
              snap-x snap-mandatory touch-pan-x
              scrollbar-hide
            ">
            {MISSIONS.map((mission) => {
              const isLocked = isMissionLocked(mission.id);
              const isCompleted = completedLevels.includes(mission.id);

              return (
                <button
                  key={mission.id}
                  disabled={isLocked}
                  onClick={() => !isLocked && launchMission(mission)}
                  onMouseEnter={() => !isLocked && setSelectedLevel(mission)}
                  onTouchStart={() => !isLocked && setSelectedLevel(mission)}
                  className={`
                      flex-shrink-0 w-[75vw] md:w-auto snap-center
                      group relative p-8 md:p-10 
                      bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all duration-300
                      text-left flex flex-col justify-between h-[50vh] md:h-64
                      overflow-hidden
                      ${isLocked
                      ? 'opacity-60 grayscale cursor-not-allowed border-slate-200'
                      : selectedLevel.id === mission.id
                        ? 'border-teal-500 shadow-2xl scale-100 z-10 bg-white'
                        : 'border-white/40 hover:border-teal-200 opacity-80 hover:opacity-100 scale-95 md:scale-100'
                    }
                    `}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white/80 px-3 py-1 rounded-full">Locked</span>
                    </div>
                  )}

                  {/* Dynamic Background Tint for active card */}
                  {!isLocked && (
                    <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${selectedLevel.id === mission.id ? 'opacity-10 bg-gradient-to-br from-teal-400 to-transparent' : ''}`} />
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest border ${mission.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                        mission.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          mission.difficulty === 'Hard' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-slate-900 text-white border-slate-900'
                        }`}>
                        {mission.difficulty}
                      </span>

                      {/* Selection Indicator */}
                      {!isLocked && (
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLevel.id === mission.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'}`}>
                          {selectedLevel.id === mission.id && <span className="text-[10px] md:text-xs font-bold">✓</span>}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl md:text-3xl font-black text-slate-800 mb-2 md:mb-3 leading-none">
                      {mission.name}
                    </h3>
                    <p className="text-xs md:text-base text-slate-600 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                      {mission.desc}
                    </p>
                  </div>

                  {/* NPC Character Preview - Mobile Only */}
                  {!isLocked && (
                    <div className="absolute bottom-4 right-4 md:hidden z-20 opacity-60 group-hover:opacity-100 transition-opacity">
                      <img
                        src={`/npc/${mission.npc.name.toLowerCase()}.svg`}
                        alt={mission.npc.name}
                        className="w-16 h-20 drop-shadow-lg"
                      />
                    </div>
                  )}

                  <div className={`relative z-10 pt-4 md:pt-6 mt-auto border-t border-slate-200/50 flex items-center justify-between transition-colors ${isLocked ? 'text-slate-300' : 'text-slate-400 group-hover:text-teal-600'}`}>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                      {isLocked ? 'Mission Locked' : isCompleted ? 'Replay Simulation' : 'Start Simulation'}
                    </span>
                    <span className="text-lg md:text-xl">{isLocked ? '🔒' : '➔'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Footer */}
        <div className="relative z-20 flex justify-center mt-4 mb-8">
          <button
            onClick={() => setGameState('RESOURCES')}
            className="px-8 py-3 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900/60 hover:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 backdrop-blur-sm border border-slate-900/5 shadow-inner"
          >
            <span>Kochi Help & Self-Care Resources</span>
            <span className="text-teal-600 font-bold">✚</span>
          </button>
        </div>

        {renderSettingsUI()}
      </div>
    );
  }


  if (gameState === 'RESOLUTION') {
    return (
      <div className="game-container min-h-screen w-full bg-slate-50 overflow-hidden relative animate-fade-in flex flex-col justify-end">
        {/* Persistent Branding & Controls */}
        <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-100 flex flex-col gap-2 md:gap-4">
          <img src="/ME.gif" alt="Mind Empowered" className="w-[50px] h-[50px] md:w-[80px] md:h-[80px] rounded-full border-2 md:border-4 border-white shadow-xl object-cover bg-slate-900" />

          <button
            onClick={() => {
              if (confirm("Abandon current mission and return to menu?")) {
                audioManager.stopMusic();
                setGameState('LEVEL_SELECT');
              }
            }}
            className="pointer-events-auto px-4 py-1.5 bg-slate-900 border-2 border-white text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-slate-800 transition-all opacity-100"
          >
            Exit
          </button>
        </div>

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
            className="absolute z-20 transition-all duration-[2000ms] ease-out bottom-[25%] md:bottom-[25%]"
            style={{
              left: resolutionPhase >= 1 ? (window.innerWidth < 768 ? '60%' : '70%') : '110%',
            }}
          >
            <Stickman gender="girl" emotion="happy" theme={selectedLevel.theme} />

            {/* Speech Bubble */}
            {resolutionPhase >= 3 && (
              <div className="absolute -top-32 md:-top-40 right-0 bg-white/90 backdrop-blur border-2 border-teal-500 text-slate-800 p-4 md:p-6 rounded-2xl rounded-br-none shadow-2xl w-48 md:w-64 animate-pop-in z-50">
                <p className="text-xs md:text-sm font-bold leading-relaxed">"Thank you for reaching out. We've got it from here."</p>
              </div>
            )}
          </div>

          {/* Main Characters */}
          <div className="absolute inset-0 z-10">
            {resolutionPhase < 2 ? (
              <>
                <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} />
                <Stickman speaker={selectedLevel.npc.name} position={samPos} gender={selectedLevel.npc.gender} emotion="relief" theme={selectedLevel.theme} />
              </>
            ) : (
              <div className="absolute left-[45%] bottom-[25%] -translate-x-1/2 flex flex-col items-center animate-fade-in">
                <img src="/stickman_assets/group_hug.svg" alt="Hug" className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] drop-shadow-2xl filter brightness-110" />
                <div className="absolute -top-6 md:-top-10 text-4xl md:text-6xl animate-bounce">❤️</div>
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
        {/* Persistent Branding & Controls */}
        <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-100 flex flex-col gap-2 md:gap-4">
          <img src="/ME.gif" alt="Mind Empowered" className="w-[50px] h-[50px] md:w-[80px] md:h-[80px] rounded-full border-2 md:border-4 border-white shadow-xl object-cover bg-slate-900" />

          <button
            onClick={() => {
              if (confirm("Abandon current mission and return to menu?")) {
                audioManager.stopMusic();
                setGameState('LEVEL_SELECT');
              }
            }}
            className="pointer-events-auto px-4 py-1.5 bg-slate-900 border-2 border-white text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-slate-800 transition-all opacity-100"
          >
            Exit
          </button>
        </div>

        {/* Blurred Background to focus on the task */}
        <div className="absolute inset-0 z-0 opacity-20 blur-xl scale-110">
          <Scenery theme={selectedLevel.theme} trust={trust} />
        </div>

        <div className="relative z-20 w-full max-w-[280px] md:max-w-sm bg-black rounded-[2.5rem] md:rounded-[3rem] border-[6px] md:border-[8px] border-slate-800 shadow-2xl overflow-hidden h-[75vh] md:h-[80vh] flex flex-col animate-slide-up">
          {/* Phone Top Bar */}
          <div className="bg-slate-900 text-white p-3 md:p-4 flex justify-between items-center text-[10px] md:text-xs px-6 pt-5">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-3.5 h-2.5 bg-white rounded-sm" />
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
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
                  {dialedNumber.length > 0 ? dialedNumber.join('') : <span className="text-slate-200">...</span>}
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
                    if (dialedNumber.length < 10) {
                      setDialedNumber([...dialedNumber, num]);
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
                  if (dialedNumber.length < 10) {
                    setDialedNumber([...dialedNumber, 0]);
                    audioManager.playDing();
                  }
                }}
                className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-xl font-medium text-slate-800 flex items-center justify-center transition-all active:scale-95"
              >
                0
              </button>
              <button onClick={() => setDialedNumber(prev => prev.slice(0, -1))} className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
              </button>
            </div>

            {/* Call Button */}
            <button
              onClick={() => {
                const number = dialedNumber.join('');
                if (number === '14416' || number === '112' || number === '988') {
                  audioManager.playPop();
                  setGameState('RESOLUTION');
                  setResolutionPhase(0);
                } else {
                  audioManager.playSad();
                  alert("Incorrect Number. Try the Mental Health Helpline: 14416");
                  setDialedNumber([]);
                }
              }}
              className="w-16 h-16 mx-auto rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-green-500/30 shadow-lg transition-transform active:scale-90 animate-pulse border-4 border-green-100"
            >
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
            </button>

            {/* Emergency Override */}
            <button
              onClick={() => {
                setDialedNumber([1, 4, 4, 1, 6]);
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

        {renderSettingsUI()}
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
            onClick={() => { if (confirm("Abandon current mission and return to menu?")) resetGame(); }}
            className="px-4 py-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg hover:bg-slate-700 transition-all border border-white/20"
          >
            Exit Game
          </button>
        </div>

        <Scenery theme={selectedLevel.theme} trust={isSuccess ? 100 : 0} />

        {/* Result Card - Compact View */}
        <div className="relative z-20 w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] md:rounded-3xl shadow-2xl border border-white/60 flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden">

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
            {/* Visual Header */}
            <div className="mb-4 flex justify-center shrink-0">
              {isSuccess ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-400/20 blur-3xl rounded-full animate-pulse" />
                  <img src="/stickman_assets/group_hug.svg" alt="Supportive Hug" className="relative z-10 w-28 h-20 md:w-40 md:h-32 drop-shadow-lg" />
                </div>
              ) : (
                <div className="relative grayscale opacity-80 scale-75 md:scale-100">
                  <Stickman emotion="distressed" gender={selectedLevel.npc.gender} isNPC={true} position={{ x: 50, y: 50 }} />
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <h2 className={`text-xl md:text-3xl font-black uppercase mb-1 tracking-tight ${isSuccess ? 'text-teal-600' : 'text-orange-600'}`}>
                {isSuccess ? 'Connection Made' : 'Session Ended'}
              </h2>
              <p className={`text-[10px] md:text-sm font-black ${isSuccess ? 'text-purple-600' : 'text-slate-400'}`}>
                {isSuccess ? rankMessage : "Don't give up."}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 md:pt-6 mb-6">
              <h3 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> DEBRIEFING
              </h3>
              <div className="space-y-2 md:space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-2 md:gap-3 items-start bg-slate-50/80 rounded-lg p-3">
                    <span className="text-[8px] md:text-[10px] font-mono text-slate-400 mt-0.5">0{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-[10px] md:text-xs text-slate-700 font-semibold mb-1 leading-tight">"{h.choiceText}"</p>
                      <div className="flex gap-2">
                        {h.wasOptimal ? (
                          <span className="text-[7px] md:text-[8px] uppercase font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Proactive</span>
                        ) : (
                          <span className="text-[7px] md:text-[8px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Reactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-slate-50 p-3 md:p-4 rounded-xl text-left border border-slate-200/50 mb-2">
              <h4 className="text-[8px] md:text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Feedback</h4>
              <textarea
                className="w-full text-[10px] md:text-xs p-3 rounded-lg border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 outline-none mb-3 bg-white/50 focus:bg-white transition-all resize-none"
                placeholder="Reflect on your choices..."
                rows="2"
              ></textarea>
              <button
                onClick={(e) => {
                  e.target.innerHTML = "<span>Sent &hearts;</span>";
                  e.target.className = "text-[9px] md:text-[10px] font-bold text-white bg-green-500 px-4 py-1.5 rounded-lg shadow transition-all w-full";
                  e.target.disabled = true;
                }}
                className="text-[9px] md:text-[10px] font-bold text-teal-700 bg-white border border-teal-200 px-4 py-1.5 rounded-lg hover:bg-teal-50 transition-all shadow-sm w-full"
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
              onClick={() => setGameState('RESOURCES')}
              className="w-full mb-3 py-3 bg-white border-2 border-slate-100 text-slate-800 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <span>✚ Kochi Resources & Self-Care</span>
            </button>
            <button
              onClick={handleEndGameContinue}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/30 active:scale-95"
            >
              Back to Menu
            </button>
          </div>
        </div>

        {renderSettingsUI()}
      </div>
    );
  }

  return (
    <div
      className="game-container min-h-screen w-full bg-slate-50 overflow-hidden relative"
      onClick={() => { if (!audioManager.initialized) audioManager.init(); }}
    >
      {/* Persistent Branding & Controls */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-100 flex flex-col gap-2 md:gap-4">
        <img src="/ME.gif" alt="Mind Empowered" className="w-[50px] h-[50px] md:w-[80px] md:h-[80px] rounded-full border-2 md:border-4 border-white shadow-xl object-cover bg-slate-900" />

        <button
          onClick={() => {
            if (confirm("Abandon current mission and return to menu?")) {
              audioManager.stopMusic();
              setGameState('LEVEL_SELECT');
            }
          }}
          className="pointer-events-auto px-2 py-1 md:px-4 md:py-1.5 bg-slate-900 border-2 border-white text-white text-[7px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-slate-800 transition-all opacity-100"
        >
          Exit
        </button>

        {/* Trust Bar - Mobile Only (Below Exit) */}
        <div className="md:hidden pointer-events-none w-[200px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[7px] uppercase tracking-widest font-black text-slate-400">Empathy</span>
            <span className={`text-[8px] font-mono font-bold ${trust < 30 ? 'text-orange-600' : 'text-teal-600'}`}>{trust}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)] ${trust < 30 ? 'bg-orange-500' : 'bg-teal-500'}`}
              style={{ width: `${trust}%` }}
            />
          </div>
        </div>
      </div>

      <div
        className="camera-viewport"
        style={{ transform: `scale(${camera.scale}) translate(${camera.x}px, ${camera.y}px)` }}
      >
        <Scenery theme={selectedLevel.theme} trust={trust} />
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
            textSpeed={settings.textSpeed}
          />

          <Stickman
            speaker={selectedLevel.npc.name}
            position={samPos}
            emotion={currentNode?.npc_emotion || 'neutral'}
            currentMessage={(gameState === 'DIALOGUE' && !playerLastSaid) ? currentNode.npc_text : null}
            textEffect={currentNode?.text_effect}
            isPhoneChecking={npcAction === 'phone'}
            isSitting={npcAction === 'sitting'}
            gender={selectedLevel.npc.gender}
            theme={selectedLevel.theme}
            textSpeed={settings.textSpeed}
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
                className="w-16 h-10 md:w-24 md:h-16"
                style={{ transform: 'scaleX(-1)' }}
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
              <div className="w-6 h-8 md:w-8 md:h-10 bg-white border-2 border-orange-200 rounded-sm shadow-lg rotate-12 flex items-center justify-center p-1">
                <div className="w-full h-px bg-slate-100 mb-0.5" />
                <div className="w-full h-px bg-slate-100 mb-0.5" />
                <div className="w-2/3 h-0.5 bg-slate-100" />
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[6px] md:text-[8px] font-black uppercase text-orange-600 bg-white/90 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                Tap to Investigate
              </div>
            </div>
          )}

          {/* Mobile Input HUD - Circular Joystick */}
          {isTouchDevice && gameState === 'APPROACH' && (
            <>
              {/* Circular Joystick */}
              <div className="absolute bottom-8 left-8 z-50">
                <div className="relative w-24 h-24 bg-slate-900/20 backdrop-blur-sm rounded-full border-2 border-white/30 shadow-2xl flex items-center justify-center">
                  {/* Center dot */}
                  <div className="absolute w-6 h-6 bg-white/40 rounded-full" />

                  {/* Left button */}
                  <button
                    onTouchStart={() => { setMoveDir(-1); setIsWalking(true); }}
                    onTouchEnd={() => { setMoveDir(0); setIsWalking(false); }}
                    onMouseDown={() => { setMoveDir(-1); setIsWalking(true); }}
                    onMouseUp={() => { setMoveDir(0); setIsWalking(false); }}
                    className="absolute left-0 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-slate-900 font-black text-xl active:bg-teal-500 active:text-white transition-all shadow-lg"
                  >
                    ←
                  </button>

                  {/* Right button */}
                  <button
                    onTouchStart={() => { setMoveDir(1); setIsWalking(true); }}
                    onTouchEnd={() => { setMoveDir(0); setIsWalking(false); }}
                    onMouseDown={() => { setMoveDir(1); setIsWalking(true); }}
                    onMouseUp={() => { setMoveDir(0); setIsWalking(false); }}
                    className="absolute right-0 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-slate-900 font-black text-xl active:bg-teal-500 active:text-white transition-all shadow-lg"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="action-buttons !bottom-8 !right-8 flex flex-col gap-4">
                <div className="flex gap-4">
                  <button
                    onTouchStart={() => { setIsJumping(true); setTimeout(() => setIsJumping(false), 500); }}
                    className="control-btn !w-16 !h-16 !rounded-2xl bg-teal-50"
                  >
                    <span className="text-[10px] font-black">JUMP</span>
                  </button>
                  <button
                    onTouchStart={() => setIsCrouching(true)}
                    onTouchEnd={() => setIsCrouching(false)}
                    className="control-btn !w-16 !h-16 !rounded-2xl bg-orange-50"
                  >
                    <span className="text-[10px] font-black">HIDE</span>
                  </button>
                </div>
                {CLUE_POSITIONS[selectedLevel.theme] &&
                  !foundClues.includes(CLUE_POSITIONS[selectedLevel.theme].id) &&
                  Math.abs(playerPos.x - CLUE_POSITIONS[selectedLevel.theme].x) < 12 && (
                    <button
                      onClick={handleInvestigate}
                      className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg animate-pulse"
                    >
                      🔎 INVESTIGATE
                    </button>
                  )}
              </div>
            </>
          )}

          {gameState === 'APPROACH' && (
            <div className="absolute bottom-40 md:bottom-32 left-1/2 -translate-x-1/2 text-center animate-bounce px-4 w-full">
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-teal-800 bg-white/80 px-4 py-2 rounded-full border border-teal-100 shadow-sm backdrop-blur-sm block mx-auto max-w-xs md:max-w-md">
                {isTouchDevice ? 'Use buttons to approach NPC' : 'Search the area or approach NPC'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="tunnel-vision" style={{ opacity: vignetteOpacity }} />

      {/* Connection HUD - Desktop Only (Top Center) */}
      <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-80 z-20">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Empathy Score</span>
          <span className={`text-[10px] font-mono font-bold ${trust < 30 ? 'text-orange-600' : 'text-teal-600'}`}>{trust}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)] ${trust < 30 ? 'bg-orange-500' : 'bg-teal-500'}`}
            style={{ width: `${trust}%` }}
          />
        </div>
      </div>

      {/* Tutorial Instructions */}
      {selectedLevel.id === 'tutorial' && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[40] w-full max-w-sm px-4 pointer-events-none">
          <div className="bg-teal-900/90 text-white p-4 rounded-xl border-l-4 border-teal-400 shadow-2xl backdrop-blur-md animate-fade-in-down">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">Training Tip</h5>
            <p className="text-xs font-medium leading-relaxed">
              {gameState === 'APPROACH' && (isTouchDevice ? 'Tap the arrows to walk towards the training NPC.' : 'Use Arrow Keys to move. Reach the NPC to start talking.')}
              {gameState === 'DIALOGUE' && !playerLastSaid && 'Choose a response. Good choices build trust (empathy score).'}
              {gameState === 'DIALOGUE' && playerLastSaid && 'Wait for the NPC to respond, or select your next action.'}
            </p>
          </div>
        </div>
      )}

      <ResourceWallet
        isOpen={isWalletOpen}
        resources={RESOURCES}
        selectedResource={selectedResource}
        onSelectResource={setSelectedResource}
      />

      {/* Discovery Notification - Subtle Top Banner */}
      {showDiscoveryPopup && foundClues.length > 0 && (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
          <div className="bg-orange-500/95 backdrop-blur-sm text-white px-6 py-2 rounded-full shadow-lg border-2 border-orange-400 flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
              🔍
            </div>
            <div>
              <p className="text-xs font-bold">New dialogue option unlocked</p>
            </div>
          </div>
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

      {gameState === 'DIALOGUE' && !playerLastSaid && (
        <DialogueBox
          options={currentNode.options}
          onSelect={handleSelectOption}
          foundClues={foundClues}
        />
      )}

      {/* Clue Discovery Modal */}
      {viewedClue && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={closeClueModal}>
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-orange-600">Clue Discovered!</h3>
                <p className="text-xs text-slate-500 font-medium">{CLUE_DETAILS[viewedClue.id]?.title || viewedClue.label}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-6">
              {CLUE_DETAILS[viewedClue.id]?.description || "You found something important."}
            </p>
            <button
              onClick={closeClueModal}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold uppercase text-sm hover:bg-orange-600 transition-all shadow-lg"
            >
              Continue Investigation
            </button>
          </div>
        </div>
      )}

      {renderSettingsUI()}
    </div >
  );
};

export default App;
