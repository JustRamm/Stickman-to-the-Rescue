import React, { useState, useEffect, useRef } from 'react';
import Stickman from './components/Stickman';
import DialogueBox from './components/DialogueBox';
import ResourceWallet from './components/ResourceWallet';
import Scenery from './components/Scenery';
import HeartbeatMonitor from './components/HeartbeatMonitor';
import SettingsOverlay from './components/SettingsOverlay';
import ClueOverlay from './components/ClueOverlay';

// Pages
import SplashScreen from './pages/SplashScreen';
import StartScreen from './pages/StartScreen';
import NamingScreen from './pages/NamingScreen';
import GenderSelectScreen from './pages/GenderSelectScreen';
import LevelSelectScreen from './pages/LevelSelectScreen';
import QuizGameScreen from './pages/QuizGameScreen';
import ResourcesScreen from './pages/ResourcesScreen';
import FinalSuccessScreen from './pages/FinalSuccessScreen';
import ResolutionScreen from './pages/ResolutionScreen';
import HandoffScreen from './pages/HandoffScreen';
import ResourceRelayScreen from './pages/ResourceRelayScreen';

import SignalScoutScreen from './pages/SignalScoutScreen'; // New Game
import WordsOfHopeScreen from './pages/WordsOfHopeScreen'; // New Game
import TutorialOverlay from './pages/TutorialOverlay';

// Data
import dialogueData from './dialogue.json';
import { MISSIONS } from './data/missions';
import { INNER_THOUGHTS, CLUE_POSITIONS, CLUE_DETAILS, BACKGROUND_NPCS } from './data/gameData';
import { audioManager } from './utils/audio';
import { REAL_RESOURCES } from './data/resources';
import { PLAYER_CARDS } from './data/resourceRelayData';

const App = () => {
  // Game State
  const [gameState, setGameState] = useState('SPLASH'); // SPLASH, START, NAMING, GENDER_SELECT, LEVEL_SELECT, APPROACH, DIALOGUE, RESOLUTION, HANDOFF, FINAL_SUCCESS, QUIZ_MODE, RESOURCES, VALIDATION_CATCH, RESOURCE_RELAY, WORDS_OF_HOPE

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('qpr_settings');
      // Force devMode to false on logic load to prevent accidental persistent unlocks
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        audioVolume: 0.5,
        ttsEnabled: true,
        textSpeed: 50,
        ...parsed,
        devMode: false
      };
    } catch (e) {
      return { audioVolume: 0.5, ttsEnabled: true, textSpeed: 50, devMode: false };
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Player State
  const [playerName, setPlayerName] = useState('You');
  const [playerGender, setPlayerGender] = useState('guy');
  const [selectedLevel, setSelectedLevel] = useState(MISSIONS[0]);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qpr_completed_missions_v4')) || [];
    } catch { return []; }
  });

  // Gameplay State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [trust, setTrust] = useState(25);
  const [currentNodeId, setCurrentNodeId] = useState('beginning');
  const [history, setHistory] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 70 });
  const [samPos, setSamPos] = useState({ x: 75, y: 70 });

  // Interaction State
  const [foundClues, setFoundClues] = useState([]);
  const [viewedClue, setViewedClue] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [playerLastSaid, setPlayerLastSaid] = useState(null);
  const [npcLastSaid, setNpcLastSaid] = useState(null); // New state for NPC bubbles
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [resolutionPhase, setResolutionPhase] = useState(0);
  const [camera, setCamera] = useState({ scale: 1.1, x: 0, y: 0 });
  const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);
  const [showDiscoveryPopup, setShowDiscoveryPopup] = useState(false);

  // Movement State
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [moveDir, setMoveDir] = useState(0);

  // NPC Behavior
  const [npcAction, setNpcAction] = useState('idle');

  // Misc
  const [activeThought, setActiveThought] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isFeedbackFocused, setIsFeedbackFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Derived
  const currentScenario = dialogueData[selectedLevel.id] || dialogueData[selectedLevel.theme] || dialogueData['park'];
  const currentClue = CLUE_POSITIONS[selectedLevel.id] || CLUE_POSITIONS[selectedLevel.theme];
  const resetCardGame = () => setGameState('LEVEL_SELECT'); // Used in some callbacks

  const walletResources = [
    // Standard Cards Only (Generic)
    ...(PLAYER_CARDS || []).map(c => ({ id: c.id, name: c.title, description: c.desc }))
  ];

  // Clean bubbles on exit
  useEffect(() => {
    setPlayerLastSaid(null);
    setNpcLastSaid(null);
  }, [gameState, currentNodeId]);

  // --- Effects ---

  // Loading Progress
  useEffect(() => {
    if (gameState !== 'SPLASH') return;
    const timer = setInterval(() => {
      setLoadingProgress(prev => (prev >= 100 ? 100 : prev + Math.random() * 5));
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

  // Save Progress
  useEffect(() => {
    localStorage.setItem('qpr_completed_missions_v4', JSON.stringify(completedLevels));
  }, [completedLevels]);

  // Clean Legacy Data
  useEffect(() => {
    localStorage.removeItem('qpr_completed_missions');
    localStorage.removeItem('qpr_completed_missions_v2');
  }, []);

  // Audio & Settings
  useEffect(() => {
    localStorage.setItem('qpr_settings', JSON.stringify(settings));
    if (audioManager.initialized) {
      audioManager.setVolume(settings.audioVolume);
      audioManager.toggleTTS(settings.ttsEnabled);
    }
  }, [settings]);

  // Orientation Check
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check); };
  }, []);

  // Music Management
  useEffect(() => {
    const isMenu = ['START', 'NAMING', 'GENDER_SELECT', 'LEVEL_SELECT', 'SPLASH'].includes(gameState);
    const sceneNodes = dialogueData[selectedLevel?.id]?.nodes;
    const isAtEnd = sceneNodes && sceneNodes[currentNodeId]?.isEnd;

    if (isMenu) {
      audioManager.playMenuMusic();
    } else if (['APPROACH', 'DIALOGUE'].includes(gameState) && !isAtEnd) {
      audioManager.init();
      audioManager.startAmbient(trust, selectedLevel.theme);
    } else if (gameState === 'RESOLUTION' && resolutionPhase >= 2) {
      // Specifically stop at the "hug" screen as requested
      audioManager.stopMusic();
    } else if (gameState !== 'APPROACH' && gameState !== 'DIALOGUE' && gameState !== 'RESOLUTION') {
      audioManager.stopMusic();
    }
  }, [gameState, selectedLevel, trust, currentNodeId, resolutionPhase]);

  // Camera Logic
  useEffect(() => {
    if (isWalletOpen) setCamera({ scale: 1.15, x: -25, y: -5 });
    else if (gameState === 'DIALOGUE') setCamera({ scale: 1.15, x: -10, y: -5 });
    else if (gameState === 'APPROACH') setCamera({ scale: 1, x: 0, y: 0 });
  }, [gameState, isWalletOpen]);

  // --- Game Loop Logic (Approach/Movement) ---

  // NPC Behavior Pacing
  useEffect(() => {
    if (gameState !== 'APPROACH') { setNpcAction('idle'); return; }
    const interval = setInterval(() => {
      if (Math.abs(playerPos.x - samPos.x) < 20) return;
      const actions = ['idle', 'phone', 'pacing', 'sitting'];
      setNpcAction(actions[Math.floor(Math.random() * actions.length)]);
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [gameState, playerPos.x, samPos.x]);

  // Keyboard Controls
  useEffect(() => {
    if (gameState !== 'APPROACH') return;
    const handleKeyDown = (e) => {
      audioManager.init();
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') setMoveDir(1);
      else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') setMoveDir(-1);
      else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        setIsJumping(true); setTimeout(() => setIsJumping(false), 500);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setIsCrouching(true);
      else if (e.key.toLowerCase() === 'z') handleInvestigate();
    };
    const handleKeyUp = (e) => {
      if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && moveDir === 1) setMoveDir(0);
      if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && moveDir === -1) setMoveDir(0);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setIsCrouching(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [gameState, moveDir]);

  // Movement Engine (Loop)
  useEffect(() => {
    if (gameState !== 'APPROACH' || moveDir === 0) { setIsWalking(false); return; }
    setIsWalking(true);
    const interval = setInterval(() => {
      setPlayerPos(p => {
        let newX = p.x + (moveDir * 1.5);
        if (newX < 5) newX = 5;
        if (newX > 85) newX = 85;
        return { ...p, x: newX };
      });
    }, 30); // ~30fps
    return () => clearInterval(interval);
  }, [gameState, moveDir]);

  // NPC Movement Engine (Pacing)
  useEffect(() => {
    if (gameState !== 'APPROACH' || npcAction !== 'pacing') return;

    // NPC Pacing Range around initial spot
    const baseStopX = 75;
    const paceWidth = 10;

    const interval = setInterval(() => {
      setSamPos(p => {
        // Move towards target or pace around
        const distToPlayer = Math.abs(playerPos.x - p.x);
        if (distToPlayer < 20) return p; // Stop if player is close

        // Pacing logic
        let direction = Math.sin(Date.now() / 2000) > 0 ? 1 : -1;
        let newX = p.x + (direction * 0.3);

        // Boundaries
        if (newX < baseStopX - paceWidth) newX = baseStopX - paceWidth;
        if (newX > baseStopX + paceWidth) newX = baseStopX + paceWidth;

        return { ...p, x: newX };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [gameState, npcAction, playerPos.x]);

  // Proximity Check
  useEffect(() => {
    if (gameState !== 'APPROACH') return;

    if (Math.abs(playerPos.x - samPos.x) < 15) {
      // Force NPC to stop movement when triggered
      setNpcAction('idle');

      // Enforce clue collection
      if (currentClue && !foundClues.includes(currentClue.id)) return;

      setIsNpcSpeaking(true);
      setGameState('DIALOGUE');
      audioManager.playDing();
    }
  }, [gameState, playerPos.x, samPos.x, currentClue, foundClues]);

  // Inner Thoughts generation removed as requested

  // Resolution Cutscene
  useEffect(() => {
    if (gameState !== 'RESOLUTION') return;
    const t1 = setTimeout(() => setResolutionPhase(1), 2000);
    const t2 = setTimeout(() => { setResolutionPhase(2); audioManager.playPop(); }, 4500);
    const t3 = setTimeout(() => {
      setResolutionPhase(3);
      const msg = selectedLevel.id === 'tutorial'
        ? `Great job! You've mastered the basics. You're ready to help others now.`
        : `Thank you for being the bridge. We'll take care of ${selectedLevel.npc.name} now.`;
      audioManager.speak(msg, false, 'girl');
    }, 6500);
    const t4 = setTimeout(() => {
      setCurrentNodeId(selectedLevel.id === 'tutorial' ? 'success_tutorial' : 'success_end');
      setGameState('DIALOGUE');
    }, 15000); // Increased from 12s to 15s to allow speech to finish
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      // Removed audioManager.stopSpeaking() to prevent cutting off the closing line
    };
  }, [gameState]);

  // Dialogue & Trust Logic
  const handleSelectOption = (selectedOption) => {
    const nextNodeId = selectedOption.next;
    const trustImpact = selectedOption.trust_impact;

    if (trustImpact > 0) audioManager.playDing();
    else if (trustImpact < 0) audioManager.playSad();

    if (currentNode.required_resource) {
      if (selectedResource === currentNode.required_resource) {
        setTrust(100);
        setGameState('HANDOFF');
        setHistory(prev => [...prev, { nodeId: currentNodeId, choiceText: selectedOption.text, trustChange: trustImpact, npcEmotion: currentNode.npc_emotion }]);
        return;
      } else {
        setTrust(prev => Math.max(0, prev - 10));
        setCoachFeedback({ msg: "Incorrect resource. Check your toolkit.", type: 'negative' });
        audioManager.playSad();
        setIsWalletOpen(true);
        return;
      }
    }

    setTrust(prev => Math.min(100, Math.max(0, prev + (trustImpact || 0))));
    setHistory(prev => [...prev, { nodeId: currentNodeId, choiceText: selectedOption.text, trustChange: trustImpact, npcEmotion: currentNode.npc_emotion }]);
    setPlayerLastSaid(selectedOption.text);

    // Set Coach Feedback Tip
    if (selectedOption.inner_thought) {
      setCoachFeedback({
        msg: selectedOption.inner_thought,
        impact: trustImpact,
        type: trustImpact > 0 ? 'positive' : trustImpact < 0 ? 'negative' : 'neutral'
      });
      // Clear tip after a delay
      setTimeout(() => setCoachFeedback(null), 5000);
    }

    audioManager.speak(selectedOption.text, false, playerGender, null, () => {
      // Short pause after player speaks before NPC starts (Snappy response)
      setTimeout(() => {
        setPlayerLastSaid(null);
        // Pre-emptively set speaking state to prevent DialogueBox flicker
        setIsNpcSpeaking(true);
        setCurrentNodeId(nextNodeId);
      }, 300);
    });
  };

  const handleInvestigate = () => {
    if (currentClue && !foundClues.includes(currentClue.id)) {
      setViewedClue(currentClue);
      audioManager.playInvestigate();
    }
  };

  const handleEndGameContinue = () => {
    audioManager.stopMusic();
    audioManager.stopSpeaking();
    if (currentNode.result === 'success' && !completedLevels.includes(selectedLevel.id)) {
      setCompletedLevels(prev => [...prev, selectedLevel.id]);
    }
    setTrust(25);
    setPlayerPos({ x: 5, y: 70 });
    setHistory([]);
    setResolutionPhase(0);
    if (selectedLevel.id === 'bridge' && currentNode.result === 'success') setGameState('FINAL_SUCCESS');
    else setGameState('LEVEL_SELECT');
  };

  // Node Logic
  let currentNode = currentScenario.nodes[currentNodeId];
  if (!currentNode) {
    if (currentNodeId === 'success_end') {
      currentNode = { isEnd: true, result: 'success', message: `Mission Complete. ${selectedLevel.npc.name} is now connected to professional support.`, npc_emotion: 'relief' };
    }
    else if (currentNodeId === 'success_tutorial') {
      currentNode = { isEnd: true, result: 'success', message: "Training Complete! You've learned how to Listen, Persuade, and Refer. Alex is proud of your progress.", npc_emotion: 'relief' };
    }
    else if (currentNodeId === 'leave_failure') currentNode = { isEnd: true, result: 'failure', message: `You walked away. ${selectedLevel.npc.name} remains alone and in crisis.`, npc_emotion: 'distressed' };
    else currentNode = currentScenario.nodes['beginning'] || { text: "Error...", options: [] };
  }

  // NPC Speech Effect
  useEffect(() => {
    if (gameState === 'DIALOGUE' && currentNode && (currentNode.npc_text || currentNode.message)) {
      const text = currentNode.npc_text || currentNode.message;
      const isEnd = currentNode.isEnd;
      const npcGender = selectedLevel.npc.gender;
      const npcVoice = selectedLevel.npc.voice;

      setIsNpcSpeaking(true);
      setNpcLastSaid(text);

      const timer = setTimeout(() => {
        audioManager.speak(text, true, npcGender, npcVoice, () => {
          // Reduced buffer time for snappier responses
          const bufferTime = Math.max(500, text.length * 5);
          setTimeout(() => {
            setIsNpcSpeaking(false);
            if (!isEnd) setNpcLastSaid(null);
          }, bufferTime);
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        // Removed audioManager.stopSpeaking() to prevent cutting off transitions
      };
    }
  }, [currentNodeId, gameState]);

  // Wallet Toggle (Only pop up when it's the player's turn to respond)
  useEffect(() => {
    if (gameState === 'DIALOGUE' && !isNpcSpeaking && !playerLastSaid && currentNode?.required_resource) {
      setIsWalletOpen(true);
    } else if (isNpcSpeaking || playerLastSaid || !currentNode?.required_resource) {
      setIsWalletOpen(false);
    }
  }, [currentNode, isNpcSpeaking, gameState, playerLastSaid]);

  const launchMission = (mission) => {
    setIsTransitioning(true);
    audioManager.stopMusic();
    audioManager.stopSpeaking();

    setTimeout(() => {
      setSelectedLevel(mission);
      setCurrentNodeId(dialogueData[mission.id]?.startNode || 'beginning');
      setFoundClues([]);
      setSelectedResource(null);
      setTrust(25);
      setPlayerPos({ x: 5, y: 70 });
      setMoveDir(0); // Ensure FORCE RESET of movement to prevent auto-walk

      setCamera({ scale: 1, x: 0, y: 0 });
      setGameState('APPROACH');
      audioManager.startAmbient(mission.theme);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 500);
  };

  // --- RENDER ---

  if (isPortrait) return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center p-8 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500 rounded-full blur-[100px]"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
          <div className="relative w-full h-full bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <svg className="w-10 h-10 text-white animate-spin-slow-pause" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div className="absolute -right-2 -bottom-2">
            <img src="/stickman_assets/pointing_stickman.svg" className="w-12 h-12 filter invert drop-shadow-md animate-bounce" alt="" />
          </div>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-200">Mobile View</h2>
        <p className="text-slate-300 font-medium text-sm max-w-[260px] leading-relaxed">
          For the best experience, please rotate your device to <span className="text-white font-bold">Landscape Mode</span>.
        </p>
        <div className="mt-12 flex items-center gap-4 opacity-50">
          <div className="w-12 h-8 border-2 border-white/30 rounded flex items-center justify-center"><span className="text-[10px] font-bold">Portrait</span></div>
          <span className="text-xl">→</span>
          <div className="w-16 h-8 border-2 border-white rounded bg-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]"><span className="text-[10px] font-bold text-teal-200">Landscape</span></div>
        </div>
      </div>
    </div>
  );

  if (gameState === 'SPLASH') return <SplashScreen loadingProgress={loadingProgress} />;
  if (gameState === 'START') return <StartScreen trust={trust} onStart={() => { audioManager.init(); setGameState('NAMING'); }} onResources={() => { audioManager.init(); setGameState('RESOURCES'); }} />;
  if (gameState === 'NAMING') return <NamingScreen trust={trust} playerName={playerName} setPlayerName={setPlayerName} onNext={() => setGameState('GENDER_SELECT')} onNavigate={setGameState} />;
  if (gameState === 'GENDER_SELECT') return <GenderSelectScreen trust={trust} playerGender={playerGender} setPlayerGender={setPlayerGender} audioManager={audioManager} onNext={() => setGameState('LEVEL_SELECT')} onBack={() => setGameState('NAMING')} />;
  if (gameState === 'LEVEL_SELECT') return (
    <LevelSelectScreen
      completedLevels={completedLevels}
      selectedLevel={selectedLevel}
      onSelectLevel={setSelectedLevel}
      onLaunchMission={launchMission}
      onNavigate={setGameState}
      trust={trust}
      settings={settings}
      setSettings={setSettings}
      audioManager={audioManager}
      isSettingsOpen={isSettingsOpen}
      setIsSettingsOpen={setIsSettingsOpen}
    />
  );
  if (gameState === 'QUIZ_MODE') return <QuizGameScreen audioManager={audioManager} onExit={() => setGameState('LEVEL_SELECT')} />;
  if (gameState === 'RESOURCES') return <ResourcesScreen onBack={() => setGameState(prev => ['START', 'LEVEL_SELECT'].includes(prev) ? prev : 'START')} />;
  if (gameState === 'FINAL_SUCCESS') return <FinalSuccessScreen onRestart={() => { setGameState('START'); setCompletedLevels([]); audioManager.playVictory(); }} />;
  if (gameState === 'RESOLUTION') return <ResolutionScreen resolutionPhase={resolutionPhase} setGameState={setGameState} audioManager={audioManager} playerGender={playerGender} selectedLevel={selectedLevel} playerName={playerName} playerPos={playerPos} samPos={samPos} />;
  if (gameState === 'HANDOFF') return <HandoffScreen selectedLevel={selectedLevel} trust={trust} audioManager={audioManager} setGameState={setGameState} setResolutionPhase={setResolutionPhase} />;
  if (gameState === 'RESOURCE_RELAY') return <ResourceRelayScreen audioManager={audioManager} onComplete={() => setGameState('LEVEL_SELECT')} onExit={() => setGameState('LEVEL_SELECT')} />;

  if (gameState === 'SIGNAL_SCOUT') return <SignalScoutScreen audioManager={audioManager} onExit={() => setGameState('LEVEL_SELECT')} />;
  if (gameState === 'WORDS_OF_HOPE') return <WordsOfHopeScreen audioManager={audioManager} onExit={() => setGameState('LEVEL_SELECT')} />;

  return (
    <div className="game-container min-h-screen w-full bg-slate-100 overflow-hidden relative" onTouchStart={() => { if (!audioManager.initialized) audioManager.init(); }}>

      <SettingsOverlay
        settings={settings} setSettings={setSettings}
        audioManager={audioManager}
        onResetGame={() => {
          if (confirm('Are you sure? This will lock all scenarios except the Intro.')) {
            setCompletedLevels([]);
            setGameState('LEVEL_SELECT');
          }
        }}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} onNavigate={setGameState}
      />

      <div className={`fixed inset-0 z-[999] bg-black pointer-events-none transition-opacity duration-700 ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`} />

      {/* Stress Vignette (Tunnel Vision / Inside Voice) */}
      <div className={`fixed inset-0 z-[45] pointer-events-none tunnel-vision transition-opacity duration-1000 ${trust < 40 ? 'opacity-100' : 'opacity-0'}`} />

      <div className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out origin-center" style={{ transform: `scale(${camera.scale}) translate(${camera.x}%, ${camera.y}%)` }}>
        <div className="absolute inset-[-10%] w-[120%] h-[120%]">
          <Scenery theme={selectedLevel.theme} trust={trust} />
        </div>

        {currentClue && !foundClues.includes(currentClue.id) && (
          <div
            className={`absolute bottom-[20%] z-20 cursor-pointer group transition-all duration-500 ease-out`}
            style={{
              left: `${currentClue.x}%`,
              transform: `scale(${Math.abs(playerPos.x - currentClue.x) < 15 ? 1.2 : 0.9})`,
              filter: `drop-shadow(0 0 ${Math.abs(playerPos.x - currentClue.x) < 15 ? '15px' : '5px'} rgba(45, 212, 191, 0.6))`
            }}
            onClick={handleInvestigate}
          >
            {/* Folded Paper Visual */}
            <div className={`relative w-10 h-12 md:w-14 md:h-16 bg-white rounded-sm shadow-xl border border-teal-500/30 overflow-hidden ${Math.abs(playerPos.x - currentClue.x) < 20 ? 'animate-bounce' : 'animate-pulse'}`}>
              <div className="absolute top-0 right-0 w-4 h-4 bg-teal-100 border-l border-b border-teal-500/20 rounded-bl-lg" />
              <div className="p-2 md:p-3 space-y-1">
                <div className="w-full h-1 bg-slate-200 rounded-full" />
                <div className="w-4/5 h-1 bg-slate-200 rounded-full" />
                <div className="w-full h-1 bg-slate-200 rounded-full" />
                <div className="w-2/3 h-1 bg-teal-200 rounded-full" />
              </div>
              <div className="absolute bottom-1 right-1">
                <span className="text-xs"></span>
              </div>
            </div>

            {/* Proximity Prompt */}
            {Math.abs(playerPos.x - currentClue.x) < 15 && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-teal-600/90 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-xl border border-white/20 animate-slide-up">
                Examine [Z]
              </div>
            )}
          </div>
        )}

        {gameState === 'APPROACH' && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute bottom-8 left-8 w-36 h-36 pointer-events-auto touch-none select-none">
              <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20 relative flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-teal-500/80 rounded-full shadow-2xl transition-transform duration-75 border border-white/30" style={{ transform: `translateX(${moveDir * 35}px) translateY(${isJumping ? -35 : isCrouching ? 35 : 0}px)` }} />
                <div className="absolute inset-y-8 left-0 w-1/3 cursor-pointer active:bg-white/5 rounded-l-full z-10" onMouseDown={() => setMoveDir(-1)} onMouseUp={() => setMoveDir(0)} onMouseLeave={() => setMoveDir(0)} onTouchStart={(e) => { e.preventDefault(); setMoveDir(-1); }} onTouchEnd={(e) => { e.preventDefault(); setMoveDir(0); }} />
                <div className="absolute inset-y-8 right-0 w-1/3 cursor-pointer active:bg-white/5 rounded-r-full z-10" onMouseDown={() => setMoveDir(1)} onMouseUp={() => setMoveDir(0)} onMouseLeave={() => setMoveDir(0)} onTouchStart={(e) => { e.preventDefault(); setMoveDir(1); }} onTouchEnd={(e) => { e.preventDefault(); setMoveDir(0); }} />
                <div className="absolute inset-x-8 top-0 h-1/3 cursor-pointer active:bg-white/5 rounded-t-full z-10" onMouseDown={() => { setIsJumping(true); setTimeout(() => setIsJumping(false), 500); }} onTouchStart={(e) => { e.preventDefault(); setIsJumping(true); setTimeout(() => setIsJumping(false), 500); }} />
                <div className="absolute inset-x-8 bottom-0 h-1/3 cursor-pointer active:bg-white/5 rounded-b-full z-10" onMouseDown={() => setIsCrouching(true)} onMouseUp={() => setIsCrouching(false)} onMouseLeave={() => setIsCrouching(false)} onTouchStart={(e) => { e.preventDefault(); setIsCrouching(true); }} onTouchEnd={(e) => { e.preventDefault(); setIsCrouching(false); }} />
              </div>
              <div className="text-center mt-2"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Move / Jump / Crouch</span></div>
            </div>
          </div>
        )}

        {gameState === 'APPROACH' && Math.abs(playerPos.x - samPos.x) < 20 && (
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-xl animate-bounce z-40">
            <p className="text-xs font-bold text-slate-900">
              {currentClue && !foundClues.includes(currentClue.id) ? "Find Clue First 🔍" : "Approach & Listen"}
            </p>
          </div>
        )}

        <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} trust={trust} isWalking={isWalking} isJumping={isJumping} isCrouching={isCrouching} currentMessage={playerLastSaid} textSpeed={settings.textSpeed} />
        <Stickman speaker={selectedLevel.npc.name} position={samPos} gender={selectedLevel.npc.gender} emotion={currentNode.npc_emotion} theme={selectedLevel.theme} trust={trust} action={npcAction} currentMessage={npcLastSaid} textSpeed={settings.textSpeed / (selectedLevel.npc.voice?.rate || 1)} />
      </div>

      {selectedLevel.id === 'tutorial' && <TutorialOverlay gameState={gameState} playerPos={playerPos} foundClues={foundClues} />}

      <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
        <HeartbeatMonitor trust={trust} />
        <div className="flex flex-col bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-white/10 shadow-lg mt-2">
          <span className="text-xs font-black uppercase text-white drop-shadow-md tracking-widest">{selectedLevel.name}</span>
          <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">{gameState === 'APPROACH' ? 'Explore Mode' : 'Conversation Mode'}</span>
        </div>
        <div className="pointer-events-auto mt-2">
          <button onClick={() => { audioManager.stopMusic(); audioManager.stopSpeaking(); setGameState('LEVEL_SELECT'); }} className="px-3 py-1.5 bg-red-500/90 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-all border border-red-400/50 backdrop-blur-sm">Exit Mission</button>
        </div>

        {/* Silent Coach Tip (Left Side) */}
        {coachFeedback && (
          <div className="pointer-events-none mt-4 w-64 animate-slide-in-left">
            <div className={`p-4 rounded-2xl border-l-4 backdrop-blur-md shadow-2xl ${coachFeedback.type === 'positive' ? 'bg-teal-500/20 border-teal-400' :
              coachFeedback.type === 'negative' ? 'bg-red-500/20 border-red-400' : 'bg-slate-500/20 border-slate-400'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Coach Tip</span>
                <div className={`px-1.5 py-0.5 rounded text-[8px] font-black ${coachFeedback.type === 'positive' ? 'bg-teal-500 text-white' :
                  coachFeedback.type === 'negative' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                  {coachFeedback.impact > 0 ? `+${coachFeedback.impact}` : coachFeedback.impact} Empathy
                </div>
              </div>
              <p className="text-white text-xs font-semibold leading-relaxed drop-shadow-md">
                {coachFeedback.msg}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inner Thoughts UI removed */}

      {showDiscoveryPopup && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-teal-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span className="font-bold uppercase tracking-widest text-xs">Clue Added to Journal</span>
        </div>
      )}

      {viewedClue && (
        <ClueOverlay
          viewedClue={viewedClue}
          onClose={() => {
            setFoundClues(p => [...p, viewedClue.id]);
            setViewedClue(null);
            setShowDiscoveryPopup(true);
            setTimeout(() => setShowDiscoveryPopup(false), 2000);
          }}
        />
      )}

      {gameState === 'DIALOGUE' && currentNode && !isNpcSpeaking && !playerLastSaid && (
        <DialogueBox
          node={currentNode}
          onSelectOption={handleSelectOption}
          foundClues={foundClues}
          requiredResource={currentNode?.required_resource}
          requiredResourceName={walletResources.find(r => r.id === currentNode?.required_resource)?.name || currentNode?.required_resource}
          selectedResource={selectedResource}
          isWalletOpen={isWalletOpen}
        />
      )}

      {/* Toolkit Phase Instruction Overlay */}
      {gameState === 'DIALOGUE' && !isNpcSpeaking && !playerLastSaid && currentNode?.required_resource && (
        <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[100] animate-bounce-subtle pointer-events-none">
          <div className="bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] border-4 border-white flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 text-indigo-100">Critical Choice</span>
            <span className="text-xl font-black uppercase tracking-widest text-center">Open Toolkit & Select Resource</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl animate-pulse">👉</span>
              <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                {walletResources.find(r => r.id === currentNode.required_resource)?.name || currentNode.required_resource} Needed
              </span>
            </div>
          </div>
        </div>
      )}

      {currentNode?.isEnd && (
        <div className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-2xl border-4 border-teal-500 relative overflow-hidden">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl shadow-xl ${currentNode.result === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{currentNode.result === 'success' ? '🌟' : '💔'}</div>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-slate-800 mb-4">{selectedLevel.id === 'tutorial' && currentNode.result === 'success' ? 'Training Complete' : currentNode.result === 'success' ? 'Mission Complete' : 'Mission Failed'}</h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-8">{currentNode.message}</p>
            {currentNode.result === 'failure' && <p className="text-xs text-orange-500 font-bold uppercase tracking-widest bg-orange-50 p-3 rounded-lg border border-orange-100 mb-8">Tip: Try Validation First. Listen more.</p>}
            <button onClick={() => { if (isFeedbackFocused) return; handleEndGameContinue(); }} className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">Continue</button>
          </div>
        </div>
      )}

      <ResourceWallet isOpen={isWalletOpen} setIsOpen={setIsWalletOpen} selectedResource={selectedResource} onSelectResource={setSelectedResource} trust={trust} resources={walletResources} />

    </div>
  );
};

export default App;
