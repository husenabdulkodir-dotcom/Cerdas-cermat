import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../lib/socket';
import { GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  playBuzzerSound, 
  playTickSound, 
  playTimesUpSound, 
  playRevealSound,
  playCorrectSound,
  playWrongSound,
  playEnvelopeSound,
  playClueSound,
  playFanfareLongSound,
  playChantSample,
  playApplauseSound,
  playDrumrollSound
} from '../lib/audio';
import CelebrationEffects from '../components/CelebrationEffects';
import AudioVisualizer from '../components/AudioVisualizer';
import PodiumView from '../components/PodiumView';
import EnvelopeSelector from '../components/EnvelopeSelector';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
  LabelList,
  CartesianGrid
} from 'recharts';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Sparkles, 
  Trophy, 
  Clock, 
  HelpCircle, 
  Zap,
  Flame,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  Coins,
  Send
} from 'lucide-react';

// Preset dynamic gradient colors for each group
const GROUP_COLORS = [
  { main: '#10b981', light: '#34d399', dark: '#047857', bg: 'rgba(16, 185, 129, 0.15)', name: 'Emerald' },
  { main: '#f59e0b', light: '#fbbf24', dark: '#b45309', bg: 'rgba(245, 158, 11, 0.15)', name: 'Amber' },
  { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8', bg: 'rgba(59, 130, 246, 0.15)', name: 'Blue' },
  { main: '#ec4899', light: '#f472b6', dark: '#be185d', bg: 'rgba(236, 72, 153, 0.15)', name: 'Pink' },
  { main: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9', bg: 'rgba(139, 92, 246, 0.15)', name: 'Purple' },
  { main: '#06b6d4', light: '#22d3ee', dark: '#0e7490', bg: 'rgba(6, 182, 212, 0.15)', name: 'Cyan' },
];

export default function Dashboard() {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioEnabledRef = useRef(audioEnabled);
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; groupName: string }[]>([]);
  const prevRevealRef = useRef<boolean | undefined>(false);
  const prevTimerRef = useRef<number>(30);
  const prevBuzzedRef = useRef<string | null>(null);
  const prevScoresRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (roomId) {
      socket.emit('joinRoom', roomId);
    }

    const onConnect = () => {
      if (roomId) socket.emit('joinRoom', roomId);
    };

    socket.on('connect', onConnect);

    socket.on('gameState', (state: GameState) => {
      setGameState(state);

      // Trigger reveal fanfare
      if (state.revealAnswer && !prevRevealRef.current) {
        if (audioEnabledRef.current) playRevealSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
      prevRevealRef.current = state.revealAnswer;

      // Trigger confetti on score increase
      let scoreIncreased = false;
      state.groups.forEach(g => {
        if (prevScoresRef.current[g.id] !== undefined && g.score > prevScoresRef.current[g.id]) {
          scoreIncreased = true;
        }
        prevScoresRef.current[g.id] = g.score;
      });

      if (scoreIncreased) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }

      // Trigger buzzer sound if new group buzzed
      if (state.buzzedGroupId && state.buzzedGroupId !== prevBuzzedRef.current) {
        if (audioEnabled) playBuzzerSound();
      }
      prevBuzzedRef.current = state.buzzedGroupId;
    });

    socket.on('timerUpdate', (time: number) => {
      setGameState(prev => prev ? { ...prev, timer: time } : prev);

      // Play tick sound when countdown is critical (1 to 5 seconds)
      if (time > 0 && time <= 5 && time !== prevTimerRef.current) {
        if (audioEnabledRef.current) playTickSound();
      } else if (time === 0 && prevTimerRef.current > 0) {
        if (audioEnabledRef.current) playTimesUpSound();
      }
      prevTimerRef.current = time;
    });

    socket.on('buzzed', () => {
      if (audioEnabledRef.current) playBuzzerSound();
    });

    socket.on('participantReaction', (data: { groupId: string; groupName: string; emoji: string }) => {
      const reactionId = `react_${Date.now()}_${Math.random()}`;
      setFloatingReactions(prev => [...prev.slice(-6), { id: reactionId, emoji: data.emoji, groupName: data.groupName }]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== reactionId));
      }, 3000);
    });

    socket.on('sound', (soundName: string) => {
      if (!audioEnabledRef.current) return;
      if (soundName === 'correct') {
        playCorrectSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      } else if (soundName === 'wrong') {
        playWrongSound();
      } else if (soundName === 'envelope') {
        playEnvelopeSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else if (soundName === 'clue') {
        playClueSound();
      } else if (soundName === 'buzzer') {
        playBuzzerSound();
      } else if (soundName === 'fanfare') {
        playFanfareLongSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } else if (soundName === 'chant') {
        playChantSample();
      } else if (soundName === 'applause') {
        playApplauseSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else if (soundName === 'drumroll') {
        playDrumrollSound();
      }
    });

    socket.emit('requestGameState', roomId);

    return () => {
      socket.off('connect', onConnect);
      socket.off('gameState');
      socket.off('timerUpdate');
      socket.off('buzzed');
      socket.off('sound');
      socket.off('participantReaction');
    };
  }, [roomId]);

  // Unlock audio context on first interaction
  const enableAudio = () => {
    setAudioEnabled(true);
    playTickSound();
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Recharts chart data memoized
  const chartData = useMemo(() => {
    if (!gameState?.groups) return [];
    return gameState.groups.map((g, idx) => ({
      id: g.id,
      name: g.name,
      shortName: g.name.length > 12 ? `${g.name.slice(0, 10)}...` : g.name,
      score: g.score,
      color: GROUP_COLORS[idx % GROUP_COLORS.length].main,
      lightColor: GROUP_COLORS[idx % GROUP_COLORS.length].light,
      darkColor: GROUP_COLORS[idx % GROUP_COLORS.length].dark,
      isBuzzed: gameState.buzzedGroupId === g.id,
    }));
  }, [gameState?.groups, gameState?.buzzedGroupId]);

  if (!gameState) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-bold tracking-widest uppercase text-emerald-400">Menghubungkan ke Panggung...</p>
      </div>
    );
  }

  const { groups, activeQuestion, timer, buzzedGroupId, spinWheelResult, isTimerRunning, revealAnswer } = gameState;
  const activeBuzzedGroup = groups.find(g => g.id === buzzedGroupId);

  // Sorted leaderboard to identify ranking
  const sortedGroups = [...groups].sort((a, b) => b.score - a.score);
  const highestScore = sortedGroups[0]?.score || 0;
  const isCriticalTime = timer > 0 && timer <= 5;
  const isTimeUp = timer === 0 && activeQuestion !== null;

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden relative">
      <CelebrationEffects trigger={showConfetti} />

      {/* Ambient Stage Glow Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px]" />
        {/* Subtle stage grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Top Proyektor Bar (Compact 56px) */}
      <nav className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/20">
            CC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>CERDAS CERMAT SANTRI</span>
                
                <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 rounded-full bg-blue-950 border border-blue-500/30 uppercase tracking-widest">
                  BABAK: {gameState.gamePhase || 'PERSIAPAN'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30">
                  LIVE PANGGUNG
                </span>
                <span className="text-[10px] text-slate-300 font-bold px-2 py-0.2 rounded-full bg-slate-800 border border-slate-700 uppercase tracking-widest">
                  RUANG: {roomId}
                </span>
              </h1>
            </div>
          </div>
        </div>

      {/* Center Buzzer Banner if active */}
        <AnimatePresence>
          {activeBuzzedGroup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 px-4 py-1 rounded-full shadow-lg text-slate-950 font-black text-xs uppercase animate-pulse"
            >
              <Zap size={14} className="fill-current animate-bounce" />
              <span>{activeBuzzedGroup.name} Sedang Menjawab!</span>
            </motion.div>
          )}

          {/* Quick Judgment Alert Toast on Screen */}
          {gameState.lastJudgment && Date.now() - gameState.lastJudgment.timestamp < 3500 && (
            <motion.div
              key={gameState.lastJudgment.timestamp}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className={cn(
                "flex items-center gap-2 px-4 py-1 rounded-full shadow-2xl font-black text-xs uppercase border",
                gameState.lastJudgment.isCorrect
                  ? "bg-emerald-500 text-slate-950 border-emerald-300"
                  : "bg-rose-600 text-white border-rose-400"
              )}
            >
              <Sparkles size={14} />
              <span>
                {groups.find(g => g.id === gameState.lastJudgment?.groupId)?.name}: {gameState.lastJudgment.isCorrect ? `BENAR (+${gameState.lastJudgment.points} pt)` : `SALAH (${gameState.lastJudgment.points} pt)`}
              </span>
              {gameState.lastJudgment.streak && gameState.lastJudgment.streak >= 2 && (
                <span className="bg-amber-300 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] flex items-center gap-0.5">
                  <Flame size={10} className="fill-slate-950" /> {gameState.lastJudgment.streak}x STREAK
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Live Reactions (Cheering Bubbles from Groups) */}
        <div className="fixed bottom-6 right-8 pointer-events-none z-50 flex flex-col gap-2 items-end">
          <AnimatePresence>
            {floatingReactions.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 30, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.7 }}
                transition={{ duration: 0.35 }}
                className="bg-slate-900/90 border border-amber-400/50 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 text-white"
              >
                <span className="text-2xl animate-bounce">{r.emoji}</span>
                <span className="text-xs font-bold text-amber-300">{r.groupName}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!audioEnabled) enableAudio();
              else setAudioEnabled(false);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all",
              audioEnabled 
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                : "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
            )}
          >
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">{audioEnabled ? "Audio On" : "Nyalakan Audio"}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>

          <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-lg text-rose-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>ON AIR</span>
          </div>
        </div>
      </nav>

      {/* Main Single-Frame 2-Column Stage (Flex-1, Zero Scroll) */}
      <main className="flex-1 p-3 md:p-4 grid grid-cols-12 gap-3 md:gap-4 z-10 min-h-0 overflow-hidden">
        
        {/* Left Column (7 of 12 Cols): The Grand Stage */}
        <div className="col-span-12 lg:col-span-7 flex flex-col min-h-0 h-full">
          <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 md:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl backdrop-blur-sm min-h-0">
            
            <AnimatePresence mode="wait">
              {/* Podium View if Phase is Pengumuman */}
              {gameState.gamePhase === 'Pengumuman' ? (
                <motion.div
                  key="podium"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full w-full"
                >
                  <PodiumView groups={groups} />
                </motion.div>
              ) : gameState.gamePhase === 'Soal Wajib' && !activeQuestion ? (
                /* Envelope Virtual Selector if Soal Wajib and no active question */
                <motion.div
                  key="envelope-selector"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full w-full"
                >
                  <EnvelopeSelector
                    questions={gameState.questions}
                    groups={groups}
                    activeTurnGroupId={gameState.activeTurnGroupId}
                    openedEnvelope={gameState.openedEnvelope}
                  />
                </motion.div>
              ) : activeQuestion ? (
                <motion.div
                  key={activeQuestion.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col h-full justify-between min-h-0"
                >
                  {/* Category & Points Meta Top */}
                  <div className="flex flex-col gap-2 pb-3 border-b border-slate-800/80 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm",
                          activeQuestion.type === 'rebutan'
                            ? "bg-rose-500 text-white"
                            : activeQuestion.type === 'lempar'
                            ? "bg-blue-500 text-white"
                            : activeQuestion.type === 'clue'
                            ? "bg-purple-600 text-white"
                            : activeQuestion.type === 'audio'
                            ? "bg-cyan-500 text-slate-950"
                            : activeQuestion.type === 'pilihan_ganda'
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-amber-500 text-slate-950"
                        )}>
                          {activeQuestion.type === 'pilihan_ganda' 
                            ? 'Pilihan Ganda' 
                            : activeQuestion.type === 'clue'
                            ? 'Tebak Clue'
                            : activeQuestion.type === 'audio'
                            ? 'Tebak Audio'
                            : `Soal ${activeQuestion.type}`}
                        </span>

                        {activeQuestion.packet && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                            ✉️ {activeQuestion.packet}
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <Sparkles size={13} />
                          <span>Kategori: {activeQuestion.category || 'Umum'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/40 px-3.5 py-1 rounded-xl shadow-inner shrink-0">
                        <Trophy size={16} className="text-amber-400" />
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                            Poin
                          </span>
                          <span className="text-xl font-black text-emerald-400 font-mono">
                            +{activeQuestion.type === 'clue' 
                               ? Math.max(25, activeQuestion.points - ((gameState.activeClueIndex || 0) * 25))
                               : activeQuestion.points}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Turn and Lemparan Status Notification */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {gameState.activeTurnGroupId && (
                        <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/40 px-3 py-1 rounded-lg text-blue-300 font-bold">
                          <Send size={12} />
                          <span>Giliran: {groups.find(g => g.id === gameState.activeTurnGroupId)?.name}</span>
                        </div>
                      )}

                      {gameState.passedGroupIds && gameState.passedGroupIds.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 px-3 py-1 rounded-lg text-rose-300 font-bold animate-pulse">
                          <span>⚠️ Status: DILEMPAR</span>
                          <span className="text-[10px] opacity-75 font-normal">
                            (Sudah pas: {gameState.passedGroupIds.map(id => groups.find(g => g.id === id)?.name).filter(Boolean).join(', ')})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Center Content */}
                  <div className="my-auto py-2 text-center flex flex-col items-center justify-center min-h-0 overflow-y-auto px-2">
                    
                    {/* Audio Player if Question is Audio */}
                    {activeQuestion.type === 'audio' && (
                      <AudioVisualizer audioUrl={activeQuestion.audioUrl} />
                    )}

                    {/* Question Image if present */}
                    {activeQuestion.questionImage && !revealAnswer && (
                       <img 
                         src={activeQuestion.questionImage} 
                         alt="Soal" 
                         className="max-h-40 md:max-h-48 w-auto object-contain rounded-xl border-4 border-slate-700/50 shadow-2xl mb-3 bg-slate-800/80 mx-auto block" 
                       />
                    )}

                    {/* Question Text */}
                    <p className="text-2xl md:text-4xl lg:text-[2.6rem] font-black leading-tight text-white tracking-tight text-balance mb-4 drop-shadow-md">
                      "{activeQuestion.text}"
                    </p>

                    {/* Multiple Choice Options (A, B, C, D) */}
                    {activeQuestion.type === 'pilihan_ganda' && activeQuestion.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full max-w-xl my-2">
                        {activeQuestion.options.map((opt, oIdx) => {
                          const optLetter = opt.trim().charAt(0).toUpperCase();
                          const isCorrect = revealAnswer && (
                            activeQuestion.correctOption === optLetter || 
                            opt.toLowerCase().includes(activeQuestion.answer.toLowerCase())
                          );

                          return (
                            <div
                              key={oIdx}
                              className={cn(
                                "p-3 rounded-xl border-2 text-left font-bold text-sm md:text-base flex items-center justify-between transition-all",
                                isCorrect
                                  ? "bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-emerald-400 text-white shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-400"
                                  : revealAnswer
                                  ? "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60"
                                  : "bg-slate-800/80 border-slate-700/80 text-slate-100 hover:border-slate-500"
                              )}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 ml-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Stepped Clues (Tebak Siapakah Aku) */}
                    {activeQuestion.type === 'clue' && activeQuestion.clues && (
                      <div className="flex flex-col gap-2 w-full max-w-xl my-2 text-left">
                        {activeQuestion.clues.map((clueItem, cIdx) => {
                          const isUnlocked = cIdx <= (gameState.activeClueIndex || 0);
                          return (
                            <div
                              key={cIdx}
                              className={cn(
                                "p-3 rounded-xl border flex items-center justify-between text-sm transition-all",
                                isUnlocked
                                  ? "bg-purple-950/60 border-purple-500/50 text-purple-100 font-semibold shadow-md"
                                  : "bg-slate-950/40 border-slate-800/80 text-slate-500 font-medium"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {isUnlocked ? (
                                  <Sparkles size={16} className="text-purple-400 shrink-0" />
                                ) : (
                                  <Lock size={15} className="text-slate-600 shrink-0" />
                                )}
                                <span>{isUnlocked ? clueItem : `Petunjuk #${cIdx + 1} masih terkunci...`}</span>
                              </div>
                              <span className="text-[11px] font-mono font-bold text-purple-300 shrink-0 ml-2">
                                {100 - (cIdx * 25)} pt
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Dramatic Reveal Answer Box */}
                    <AnimatePresence>
                      {revealAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.92 }}
                          transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className="mt-3 w-full max-w-xl bg-gradient-to-br from-emerald-900/95 to-teal-950/95 border-2 border-emerald-400 text-emerald-100 p-4 rounded-2xl shadow-2xl shadow-emerald-900/50 backdrop-blur-md relative overflow-hidden"
                        >
                          <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-[11px] uppercase tracking-widest mb-1">
                            <Sparkles size={14} />
                            <span>KUNCI JAWABAN BENAR</span>
                            <Sparkles size={14} />
                          </div>
                          <p className="text-xl md:text-3xl font-black text-white text-balance">
                            {activeQuestion.answer}
                          </p>
                          {activeQuestion.answerImage && (
                            <img src={activeQuestion.answerImage} alt="Jawaban" className="max-h-48 md:max-h-56 w-auto object-contain rounded-xl border-2 border-emerald-500/50 shadow-xl mt-3 mx-auto block bg-emerald-950/50" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom Footer Tag */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 shrink-0">
                    <span>Musabaqah Cerdas Cermat Santri</span>
                    <span className="font-mono text-slate-400">ID: {activeQuestion.id}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full my-auto text-center py-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
                    <HelpCircle size={36} className="opacity-40 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-wider mb-1">
                    Siap Untuk Pertanyaan
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    Admin/Dewan Juri akan memilih soal dari Bank Soal untuk ditampilkan di layar panggung.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Column (5 of 12 Cols): Live Recharts Bar Chart & Widgets Hub */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 min-h-0 h-full">
          
          {/* Top Mini Widgets: Timer Gauge (Left) & Spin Wheel (Right) */}
          <div className="grid grid-cols-2 gap-3 shrink-0 h-36">
            
            {/* Countdown Timer Widget */}
            <div className={cn(
              "rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border shadow-xl backdrop-blur-md",
              isTimeUp
                ? "bg-rose-950/90 border-rose-500 ring-2 ring-rose-500/40"
                : isCriticalTime
                ? "bg-rose-950/70 border-rose-500 animate-pulse"
                : "bg-slate-900/90 border-slate-800/80"
            )}>
              <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock size={11} />
                  <span>WAKTU</span>
                </span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full font-black text-[9px]",
                  isTimerRunning ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                )}>
                  {isTimerRunning ? "RUN" : "PAUSE"}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-3">
                <span className={cn(
                  "text-5xl font-black font-mono tracking-tighter tabular-nums",
                  isTimeUp ? "text-rose-400" : isCriticalTime ? "text-rose-400" : timer <= 10 ? "text-amber-300" : "text-white"
                )}>
                  {timer.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">s</span>
              </div>

              {isTimeUp ? (
                <span className="text-[9px] font-black uppercase text-rose-300 tracking-wider animate-bounce mt-0.5">
                  Waktu Habis!
                </span>
              ) : (
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                  Hitung Mundur
                </span>
              )}
            </div>

            {/* Spin Wheel Category Result Widget */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-xl backdrop-blur-md">
              <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles size={11} />
                  <span>SPIN WHEEL</span>
                </span>
                <span className="text-[9px] text-slate-500">KATEGORI</span>
              </div>

              <div className="mt-2 text-center flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {spinWheelResult ? (
                    <motion.div
                      key="spin-res"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-1">
                        <Flame size={14} />
                      </div>
                      <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight truncate max-w-[140px]">
                        {spinWheelResult}
                      </h4>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="spin-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center text-slate-500 py-1"
                    >
                      <Sparkles size={16} className="opacity-40 mb-1" />
                      <span className="text-[10px] font-semibold">Menunggu Spin...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Real-time Animated Bar Chart (Recharts) */}
          <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 flex flex-col shadow-2xl backdrop-blur-md min-h-0 relative overflow-hidden">
            
            {/* Chart Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 shrink-0 mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>GRAFIK SKOR REAL-TIME</span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <TrendingUp size={12} />
                <span>Live Bar Chart</span>
              </div>
            </div>

            {/* Recharts Container (Animated Real-Time Bars) */}
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 22, right: 10, left: -20, bottom: 0 }}
                >
                  {/* SVG Gradients for Glowing Bars */}
                  <defs>
                    {GROUP_COLORS.map((c, i) => (
                      <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.light} stopOpacity={1} />
                        <stop offset="100%" stopColor={c.dark} stopOpacity={0.85} />
                      </linearGradient>
                    ))}
                    <linearGradient id="buzzedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  
                  <XAxis 
                    dataKey="shortName" 
                    stroke="#64748b" 
                    tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  
                  <YAxis 
                    stroke="#475569" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    domain={[0, (dataMax: number) => Math.max(dataMax + 50, 150)]}
                    allowDecimals={false}
                  />

                  <Bar 
                    dataKey="score" 
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    <LabelList 
                      dataKey="score" 
                      position="top" 
                      fill="#ffffff" 
                      fontSize={13} 
                      fontWeight={900} 
                      formatter={(val: number) => `${val} pt`}
                    />
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${entry.id}`} 
                        fill={entry.isBuzzed ? 'url(#buzzedGrad)' : `url(#barGrad-${index % GROUP_COLORS.length})`}
                        stroke={entry.isBuzzed ? '#fef08a' : entry.lightColor}
                        strokeWidth={entry.isBuzzed ? 2 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Group Ticker Cards Inside Hub */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 pt-2 border-t border-slate-800/80 shrink-0 mt-1">
              {groups.map((g, idx) => {
                const isLeader = g.score === highestScore && g.score > 0;
                const isBuzzed = buzzedGroupId === g.id;
                const color = GROUP_COLORS[idx % GROUP_COLORS.length];

                return (
                  <div
                    key={g.id}
                    className={cn(
                      "p-1.5 rounded-xl border text-center transition-all flex flex-col justify-between",
                      isBuzzed
                        ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105"
                        : isLeader
                        ? "bg-slate-800/90 border-amber-500/60"
                        : "bg-slate-950/60 border-slate-800"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      {isLeader && <Award size={10} className="text-amber-400 shrink-0" />}
                      <span className="text-[10px] font-bold text-slate-300 truncate">
                        {g.name}
                      </span>
                      {g.streak !== undefined && g.streak >= 2 && (
                        <span className="text-[9px] bg-rose-500/80 text-white font-black px-1 rounded-full flex items-center gap-0.5">
                          <Flame size={9} className="fill-white" />
                          <span>{g.streak}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span 
                        className="text-xs font-black font-mono"
                        style={{ color: isBuzzed ? '#fbbf24' : color.light }}
                      >
                        {g.score}
                      </span>
                      {g.reaction && Date.now() - g.reaction.timestamp < 4000 && (
                        <span className="text-xs animate-bounce" title="Reaksi Peserta">
                          {g.reaction.emoji}
                        </span>
                      )}
                      {gameState.groupBets && gameState.groupBets[g.id] !== undefined && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-1 rounded">
                          🎲{gameState.groupBets[g.id]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
