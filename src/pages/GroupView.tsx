import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { socket } from '../lib/socket';
import { GameState, Group } from '../types';
import { Bell, Trophy, Flame, Volume2, VolumeX, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { playBuzzerSound, playCorrectSound, playWrongSound } from '../lib/audio';

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'Semangat' },
  { emoji: '👏', label: 'Keren' },
  { emoji: '⚡', label: 'Cepat' },
  { emoji: '🤲', label: 'Bismillah' },
  { emoji: '💪', label: 'Yakin' },
  { emoji: '🎯', label: 'Fokus' }
];

export default function GroupView() {
  const { roomId, groupId } = useParams<{ roomId: string, groupId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentReaction, setRecentReaction] = useState<string | null>(null);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('gameState', (state: GameState) => {
      setGameState(state);
    });

    socket.on('buzzed', (buzzedId: string) => {
      if (soundEnabled) playBuzzerSound();
      if (buzzedId === groupId && navigator.vibrate) {
        navigator.vibrate([120, 60, 120]);
      }
    });

    socket.on('sound', (soundName: string) => {
      if (!soundEnabled) return;
      if (soundName === 'correct') playCorrectSound();
      else if (soundName === 'wrong') playWrongSound();
    });

    socket.emit('requestGameState');

    return () => {
      socket.off('gameState');
      socket.off('buzzed');
      socket.off('sound');
    };
  }, [roomId, groupId, soundEnabled]);

  const handleBuzz = () => {
    socket.emit('participant:buzz', groupId);
  };

  const handleSendReaction = (emoji: string) => {
    setRecentReaction(emoji);
    socket.emit('participant:reaction', { groupId, emoji });
    setTimeout(() => setRecentReaction(null), 1200);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-xl text-slate-500 font-medium">Menyambungkan...</div>
      </div>
    );
  }

  const group = gameState.groups.find(g => g.id === groupId);
  
  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-red-500 font-medium">Kelompok tidak ditemukan</div>
      </div>
    );
  }

  const canBuzz = gameState.buzzerEnabled && !gameState.buzzedGroupId;
  const hasBuzzed = gameState.buzzedGroupId === groupId;
  const otherBuzzed = gameState.buzzedGroupId && gameState.buzzedGroupId !== groupId;
  const streak = group.streak || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${roomId}`)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kembali ke Menu"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{group.name}</h1>
              {streak >= 2 && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                  <Flame size={12} className="fill-white" />
                  <span>{streak}x STREAK!</span>
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {gameState.gamePhase ? `Babak: ${gameState.gamePhase}` : 'Cerdas Cermat'} • Ruang {roomId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1",
              soundEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-400"
            )}
            title={soundEnabled ? "Audio Bel Aktif" : "Audio Bel Mute"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <div className="flex flex-col items-end">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Skor</div>
            <div className="text-3xl md:text-4xl font-mono font-black text-emerald-600 tracking-tight tabular-nums">
              {group.score}
            </div>
          </div>
        </div>
      </header>

      {/* Main Buzzer Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.button
          onClick={handleBuzz}
          disabled={!canBuzz}
          whileTap={canBuzz ? { scale: 0.95 } : {}}
          className={cn(
            "relative w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center space-y-4 shadow-2xl transition-all duration-300 outline-none select-none",
            hasBuzzed 
              ? "bg-emerald-500 text-white shadow-emerald-500/50 border-4 border-emerald-400 ring-8 ring-emerald-500/20" 
              : otherBuzzed
                ? "bg-slate-200 text-slate-400 shadow-none border-4 border-slate-300"
                : canBuzz
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 hover:shadow-rose-500/60 active:shadow-inner"
                  : "bg-slate-200 text-slate-400 shadow-none border-4 border-slate-300"
          )}
        >
          {hasBuzzed && (
             <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
          )}
          
          <Bell size={80} className={cn(
             "transition-transform duration-300",
             canBuzz ? "animate-bounce" : ""
          )} />
          
          <span className="text-2xl font-bold tracking-widest uppercase">
            {hasBuzzed ? "Berhasil!" : otherBuzzed ? "Terkunci" : canBuzz ? "Tekan!" : "Menunggu..."}
          </span>
        </motion.button>

        {/* Status Indicator */}
        <div className="mt-8 text-center min-h-[4rem]">
           <AnimatePresence mode="wait">
             {gameState.activeQuestion ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-200 inline-block max-w-xl mx-auto"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                      Soal {gameState.activeQuestion.type}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      +{gameState.activeQuestion.points} pt
                    </span>
                  </div>
                  {gameState.activeQuestion.questionImage && (
                    <img src={gameState.activeQuestion.questionImage} alt="Soal" className="h-16 md:h-24 mx-auto object-contain mb-2 rounded border border-slate-200" />
                  )}
                  <p className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                    {gameState.activeQuestion.text}
                  </p>
                </motion.div>
             ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-slate-400 text-xs font-bold tracking-widest uppercase"
                >
                  Belum ada soal aktif dari Juri
                </motion.p>
             )}
           </AnimatePresence>
        </div>

        {/* Live Reaction Emojis Bar (Kirim Sorakan ke Layar Proyektor) */}
        <div className="mt-6 flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            <span>Kirim Sorakan & Reaksi ke Layar Proyektor:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-center bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
            {REACTION_EMOJIS.map(item => (
              <motion.button
                key={item.emoji}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSendReaction(item.emoji)}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 flex items-center justify-center text-xl transition-all cursor-pointer relative"
                title={item.label}
              >
                <span>{item.emoji}</span>
              </motion.button>
            ))}
          </div>
          {recentReaction && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
            >
              Terkirim ke Layar Panggung! {recentReaction}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
