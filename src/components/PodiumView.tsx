import React from 'react';
import { Trophy, Award, Medal, Crown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Group } from '../types';

interface PodiumViewProps {
  groups: Group[];
}

export default function PodiumView({ groups }: PodiumViewProps) {
  // Sort descending by score
  const sorted = [...groups].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const others = sorted.slice(3);

  return (
    <div className="flex flex-col items-center justify-between h-full w-full py-4 px-6 text-center select-none overflow-y-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-6"
      >
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/50 px-5 py-1.5 rounded-full mb-2">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="text-xs font-black text-amber-300 uppercase tracking-widest">PENGUMUMAN JUARA MUSABAQAH</span>
          <Sparkles size={16} className="text-yellow-400" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          PODIUM KEMENANGAN
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Selamat kepada seluruh kafilah & kelompok santri atas prestasi terbaik!
        </p>
      </motion.div>

      {/* Main 3-Column Podium */}
      <div className="flex items-end justify-center gap-4 md:gap-8 w-full max-w-4xl px-2 my-auto">
        {/* 2nd Place (Silver) */}
        {second && (
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex flex-col items-center max-w-[220px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-slate-300 shadow-xl mb-3 relative">
              <Medal size={32} className="text-slate-300" />
              <span className="absolute -top-2 bg-slate-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                JUARA 2
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base md:text-lg truncate w-full mb-1">
              {second.name}
            </h3>
            <div className="text-xl md:text-2xl font-black text-slate-300 font-mono mb-3">
              {second.score} <span className="text-xs font-normal">pt</span>
            </div>
            <div className="w-full h-40 md:h-52 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700/80 rounded-t-2xl border-t-4 border-slate-400 shadow-2xl flex flex-col items-center justify-center p-4">
              <span className="text-4xl md:text-6xl font-black text-slate-400/40">2</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">PERAK</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Gold) - Grand Winner */}
        {first && (
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col items-center max-w-[260px] z-10"
          >
            <div className="relative mb-3 flex flex-col items-center">
              <Crown size={32} className="text-yellow-400 animate-bounce mb-1" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-4 border-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-yellow-500/40">
                <Trophy size={40} className="text-slate-950" />
              </div>
              <span className="absolute -bottom-2 bg-yellow-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                JUARA 1
              </span>
            </div>
            <h3 className="font-black text-yellow-300 text-lg md:text-2xl truncate w-full mb-1">
              {first.name}
            </h3>
            <div className="text-2xl md:text-4xl font-black text-white font-mono mb-3 text-glow">
              {first.score} <span className="text-sm font-normal text-yellow-400">pt</span>
            </div>
            <div className="w-full h-52 md:h-64 bg-gradient-to-t from-amber-950/90 via-amber-900/80 to-yellow-600/90 rounded-t-3xl border-t-4 border-yellow-300 shadow-2xl shadow-yellow-600/30 flex flex-col items-center justify-center p-4">
              <span className="text-6xl md:text-8xl font-black text-yellow-200/40">1</span>
              <span className="text-sm font-black text-yellow-200 uppercase tracking-widest mt-2">JUARA UTAMA</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-1 flex flex-col items-center max-w-[220px]"
          >
            <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-600 flex items-center justify-center text-amber-500 shadow-xl mb-3 relative">
              <Award size={32} className="text-amber-500" />
              <span className="absolute -top-2 bg-amber-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                JUARA 3
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base md:text-lg truncate w-full mb-1">
              {third.name}
            </h3>
            <div className="text-xl md:text-2xl font-black text-amber-400 font-mono mb-3">
              {third.score} <span className="text-xs font-normal">pt</span>
            </div>
            <div className="w-full h-32 md:h-44 bg-gradient-to-t from-slate-900 via-stone-900 to-amber-950/80 rounded-t-2xl border-t-4 border-amber-600 shadow-2xl flex flex-col items-center justify-center p-4">
              <span className="text-4xl md:text-6xl font-black text-amber-600/40">3</span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-2">PERUNGGU</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Other Participants Honor Roll */}
      {others.length > 0 && (
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-3 mt-4 flex items-center justify-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apresiasi Peserta:</span>
          {others.map((g, idx) => (
            <div key={g.id} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-lg">
              <span className="text-slate-500 font-bold">#{idx + 4}</span>
              <span className="font-medium">{g.name}</span>
              <span className="font-mono text-emerald-400 font-bold">({g.score} pt)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
