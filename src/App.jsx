import React, { useState, useEffect, useRef } from 'react';
import Stickman from './components/Stickman';
import DialogueBox from './components/DialogueBox';
import ResourceWallet from './components/ResourceWallet';
import Scenery from './components/Scenery';
import HeartbeatMonitor from './components/HeartbeatMonitor';
import SettingsOverlay from './components/SettingsOverlay';

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

// Data
import dialogueData from './dialogue.json';
import { MISSIONS } from './data/missions';
import { INNER_THOUGHTS, CLUE_POSITIONS, CLUE_DETAILS, BACKGROUND_NPCS } from './data/gameData';
import { audioManager } from './utils/audio';

const App = () => {
  // Game State
  const [gameState, setGameState] = useState('SPLASH'); // SPLASH, START, NAMING, GENDER_SELECT, LEVEL_SELECT, APPROACH, DIALOGUE, RESOLUTION, HANDOFF, FINAL_SUCCESS, QUIZ_MODE, RESOURCES

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('qpr_settings');
      return saved ? JSON.parse(saved) : { audioVolume: 0.5, ttsEnabled: true, textSpeed: 50 };
    } catch (e) {
      return { audioVolume: 0.5, ttsEnabled: true, textSpeed: 50 };
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Player State
  const [playerName, setPlayerName] = useState('You');
  const [playerGender, setPlayerGender] = useState('guy');
  const [selectedLevel, setSelectedLevel] = useState(MISSIONS[0]);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qpr_completed_missions')) || [];
    } catch { return []; }
  });

  // Gameplay State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [trust, setTrust] = useState(25);
  const [currentNodeId, setCurrentNodeId] = useState('beginning');
  const [history, setHistory] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 10, y: 70 });
  const [samPos, setSamPos] = useState({ x: 75, y: 70 });

  // Interaction State
  const [foundClues, setFoundClues] = useState([]);
  const [viewedClue, setViewedClue] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [playerLastSaid, setPlayerLastSaid] = useState(null);
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [resolutionPhase, setResolutionPhase] = useState(0);
  const [camera, setCamera] = useState({ scale: 1, x: 0, y: 0 });
  const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);
  const [showDiscoveryPopup, setShowDiscoveryPopup] = useState(false);

  // Movement State
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [moveDir, setMoveDir] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // NPC Behavior
  const [npcAction, setNpcAction] = useState('idle');

  // Misc
  const [activeThought, setActiveThought] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isFeedbackFocused, setIsFeedbackFocused] = useState(false);

  // Derived
  const currentScenario = dialogueData[selectedLevel.id] || dialogueData[selectedLevel.theme] || dialogueData['park'];
  const resetCardGame = () => setGameState('LEVEL_SELECT'); // Used in some callbacks

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
    localStorage.setItem('qpr_completed_missions', JSON.stringify(completedLevels));
  }, [completedLevels]);

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
    if (isMenu) audioManager.playMenuMusic();
    else if (['APPROACH', 'DIALOGUE'].includes(gameState)) {
      audioManager.init();
      audioManager.startAmbient(trust, selectedLevel.theme);
    } else if (gameState !== 'HANDOFF' && gameState !== 'RESOLUTION' && gameState !== 'FINAL_SUCCESS') {
      audioManager.stopMusic();
    }
  }, [gameState, selectedLevel, trust]);

  // Camera Logic
  useEffect(() => {
    if (gameState === 'DIALOGUE') setCamera({ scale: 1.15, x: -10, y: -5 });
    else if (gameState === 'APPROACH') setCamera({ scale: 1, x: 0, y: 0 });
  }, [gameState]);

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
      if (e.key === 'ArrowRight' && playerPos.x < 65) {
        setPlayerPos(p => ({ ...p, x: p.x + 1.5 })); setIsWalking(true);
      } else if (e.key === 'ArrowLeft' && playerPos.x > 5) {
        setPlayerPos(p => ({ ...p, x: p.x - 1.5 })); setIsWalking(true);
      } else if (e.key === 'ArrowUp') {
        setIsJumping(true); setTimeout(() => setIsJumping(false), 500);
      } else if (e.key === 'ArrowDown') setIsCrouching(true);
      else if (e.key.toLowerCase() === 'z') handleInvestigate();
    };
    const handleKeyUp = (e) => {
      if (['ArrowRight', 'ArrowLeft'].includes(e.key)) setIsWalking(false);
      if (e.key === 'ArrowDown') setIsCrouching(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [gameState, playerPos]);

  // Proximity Check
  useEffect(() => {
    if (gameState !== 'APPROACH') return;
    if (Math.abs(playerPos.x - samPos.x) < 10) {
      setGameState('DIALOGUE');
      audioManager.playDing();
    }
  }, [gameState, playerPos.x, samPos.x]);

  // Inner Thoughts
  useEffect(() => {
    if (gameState === 'DIALOGUE') {
      const interval = setInterval(() => {
        if (Math.random() > 0.6) {
          setActiveThought(INNER_THOUGHTS[Math.floor(Math.random() * INNER_THOUGHTS.length)]);
          setTimeout(() => setActiveThought(null), 4000);
        }
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Resolution Cutscene
  useEffect(() => {
    if (gameState !== 'RESOLUTION') return;
    audioManager.stopMusic();
    const t1 = setTimeout(() => setResolutionPhase(1), 2000);
    const t2 = setTimeout(() => { setResolutionPhase(2); audioManager.playPop(); }, 4500);
    const t3 = setTimeout(() => {
      setResolutionPhase(3);
      audioManager.speak("Thank you for being the bridge. We'll take care of Sam now.", false, 'girl');
    }, 6500);
    const t4 = setTimeout(() => {
      setCurrentNodeId('success_hotline');
      setGameState('DIALOGUE');
    }, 30000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [gameState]);

  // Dialogue & Trust Logic
  const handleSelectOption = (selectedOption) => {
    const nextNodeId = selectedOption.next;
    const trustImpact = selectedOption.trust_impact;

    // Feedback
    if (trustImpact > 0) audioManager.playDing();
    else if (trustImpact < 0) audioManager.playSad();

    // Check Resource
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

    audioManager.speak(selectedOption.text, false, playerGender, null, () => {
      setTimeout(() => {
        setPlayerLastSaid(null);
        setCurrentNodeId(nextNodeId);
      }, 1000);
    });
  };

  const handleInvestigate = () => {
    const clue = CLUE_POSITIONS[selectedLevel.theme];
    if (clue && !foundClues.includes(clue.id)) {
      setViewedClue(clue);
      audioManager.playInvestigate();
    }
  };

  const handleEndGameContinue = () => {
    audioManager.stopMusic();
    if (currentNode.result === 'success' && !completedLevels.includes(selectedLevel.id)) {
      setCompletedLevels(prev => [...prev, selectedLevel.id]);
    }
    setTrust(25);
    setPlayerPos({ x: 10, y: 70 });
    setHistory([]);
    setResolutionPhase(0);
    if (selectedLevel.id === 'rainy' && currentNode.result === 'success') setGameState('FINAL_SUCCESS');
    else setGameState('LEVEL_SELECT');
  };

  // Node Logic
  let currentNode = currentScenario.nodes[currentNodeId];
  if (!currentNode) {
    if (currentNodeId === 'success_hotline') currentNode = { isEnd: true, result: 'success', message: "You successfully connected Sam to the 14416 Mental Health Helpline.", npc_emotion: 'relief' };
    else if (currentNodeId === 'leave_failure') currentNode = { isEnd: true, result: 'failure', message: "You walked away. Sam remains alone.", npc_emotion: 'distressed' };
    else currentNode = currentScenario.nodes['beginning'] || { text: "Error...", options: [] };
  }

  // Wallet Toggle
  useEffect(() => {
    if (currentNode?.required_resource) setIsWalletOpen(true);
    else setIsWalletOpen(false);
  }, [currentNode]);


  const launchMission = (mission) => {
    setSelectedLevel(mission);
    setCurrentNodeId(dialogueData[mission.id]?.startNode || 'beginning');
    setFoundClues([]);
    setTrust(25);
    setPlayerPos({ x: 10, y: 70 });
    setCamera({ scale: 1.2, x: 100, y: 0 });
    setGameState('APPROACH');
    audioManager.startAmbient(mission.theme);
    setTimeout(() => setCamera({ scale: 1, x: 0, y: 0 }), 50);
  };

  // --- RENDER ---

  if (isPortrait) return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center p-8 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon */}
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

        <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-200">
          Mobile View
        </h2>
        <p className="text-slate-300 font-medium text-sm max-w-[260px] leading-relaxed">
          For the best experience, please rotate your device to <span className="text-white font-bold">Landscape Mode</span>.
        </p>

        <div className="mt-12 flex items-center gap-4 opacity-50">
          <div className="w-12 h-8 border-2 border-white/30 rounded flex items-center justify-center">
            <span className="text-[10px] font-bold">Portrait</span>
          </div>
          <span className="text-xl">→</span>
          <div className="w-16 h-8 border-2 border-white rounded bg-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <span className="text-[10px] font-bold text-teal-200">Landscape</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Page Routing
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

  // Main Game View (APPROACH / DIALOGUE)
  return (
    <div className="game-container min-h-screen w-full bg-slate-100 overflow-hidden relative" onTouchStart={() => { if (!audioManager.initialized) audioManager.init(); }}>

      {/* Settings Overlay */}
      <SettingsOverlay
        settings={settings} setSettings={setSettings}
        audioManager={audioManager} onResetGame={() => setGameState('LEVEL_SELECT')}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} onNavigate={setGameState}
      />

      {/* 3D-ish Camera Container */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out origin-center"
        style={{ transform: `scale(${camera.scale}) translate(${camera.x}%, ${camera.y}%)` }}
      >
        <Scenery theme={selectedLevel.theme} trust={trust} />

        {/* Props & Clues */}
        {CLUE_POSITIONS[selectedLevel.theme] && !foundClues.includes(CLUE_POSITIONS[selectedLevel.theme].id) && (
          <div
            className="absolute bottom-[20%] z-20 w-8 h-8 md:w-12 md:h-12 bg-white/80 rounded animate-bounce shadow-lg cursor-pointer flex items-center justify-center border-2 border-teal-400 group"
            style={{ left: `${CLUE_POSITIONS[selectedLevel.theme].x}%` }}
            onClick={handleInvestigate}
          >
            <span className="text-xl">📄</span>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Inspect Clue
            </div>
          </div>
        )}

        {/* Interaction Prompt */}
        {gameState === 'APPROACH' && Math.abs(playerPos.x - samPos.x) < 20 && (
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-xl animate-bounce z-40">
            <p className="text-xs font-bold text-slate-900">Approach & Listen</p>
          </div>
        )}

        {/* Characters */}
        <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} isWalking={isWalking} />
        <Stickman
          speaker={selectedLevel.npc.name} position={samPos}
          gender={selectedLevel.npc.gender} emotion={currentNode.npc_emotion}
          theme={selectedLevel.theme} action={npcAction}
        />
      </div>

      {/* HUD Layers */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-4">
        <HeartbeatMonitor trust={trust} />
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase text-white drop-shadow-md tracking-widest">{selectedLevel.name}</span>
          <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">{gameState === 'APPROACH' ? 'Explore Mode' : 'Conversation Mode'}</span>
        </div>
      </div>

      {/* Inner Thoughts */}
      {activeThought && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full">
            <p className="text-white font-medium italic text-sm text-shadow-sm">{activeThought}</p>
          </div>
        </div>
      )}

      {/* Discovery Popup */}
      {showDiscoveryPopup && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-teal-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span className="font-bold uppercase tracking-widest text-xs">Clue Added to Journal</span>
        </div>
      )}

      {/* Clue Modal */}
      {viewedClue && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={() => { setViewedClue(null); setFoundClues(p => [...p, viewedClue.id]); setShowDiscoveryPopup(true); setTimeout(() => setShowDiscoveryPopup(false), 2000); }}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-pop-in relative border-4 border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-teal-500 rounded-2xl rotate-12 flex items-center justify-center text-3xl shadow-lg">🧐</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">{CLUE_DETAILS[viewedClue.id]?.title}</h3>
            <p className="text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">"{CLUE_DETAILS[viewedClue.id]?.description}"</p>
            <button onClick={() => { setViewedClue(null); setFoundClues(p => [...p, viewedClue.id]); setShowDiscoveryPopup(true); setTimeout(() => setShowDiscoveryPopup(false), 2000); }} className="w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Collect Evidence</button>
          </div>
        </div>
      )}

      {/* Dialogue Interface */}
      {gameState === 'DIALOGUE' && (
        <DialogueBox
          node={currentNode}
          onSelectOption={handleSelectOption}
          trust={trust}
          playerLastSaid={playerLastSaid}
          coachFeedback={coachFeedback}
          history={history}
          isNpcSpeaking={isNpcSpeaking}
        />
      )}

      {/* End Game Modal */}
      {currentNode?.isEnd && (
        <div className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-2xl border-4 border-teal-500 relative overflow-hidden">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl shadow-xl ${currentNode.result === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {currentNode.result === 'success' ? '🌟' : '💔'}
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-slate-800 mb-4">{currentNode.result === 'success' ? 'Mission Complete' : 'Mission Failed'}</h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-8">{currentNode.message}</p>
            {currentNode.result === 'failure' && (
              <p className="text-xs text-orange-500 font-bold uppercase tracking-widest bg-orange-50 p-3 rounded-lg border border-orange-100 mb-8">Tip: Try Validation First. Listen more.</p>
            )}
            <button onClick={() => { if (isFeedbackFocused) return; handleEndGameContinue(); }} className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">Continue</button>
          </div>
        </div>
      )}

      {/* Resource Wallet */}
      <ResourceWallet
        isOpen={isWalletOpen}
        setIsOpen={setIsWalletOpen}
        selectedResource={selectedResource}
        setSelectedResource={setSelectedResource}
        trust={trust}
      />

    </div>
  );
};

export default App;
