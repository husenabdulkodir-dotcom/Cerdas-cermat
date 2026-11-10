import React from 'react';
import { Mail, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Question, Group } from '../types';

interface EnvelopeSelectorProps {
  questions: Question[];
  groups: Group[];
  activeTurnGroupId?: string | null;
  openedEnvelope?: string | null;
  onSelectEnvelope?: (packet: string) => void;
  isAdmin?: boolean;
}

export default function EnvelopeSelector({
  questions,
  groups,
  activeTurnGroupId,
  openedEnvelope,
  onSelectEnvelope,
  isAdmin = false
}: EnvelopeSelectorProps) {
  // Extract all packets available in questions, e.g. 'Amplop A', 'Amplop B', etc.
  const packets = Array.from(new Set(
    questions
      .filter(q => q.packet)
      .map(q => q.packet as string)
  ));

  // If no explicit packets found in questions, generate defaults: Amplop A, B, C, D
  const displayPackets = packets.length > 0 ? packets : ['Amplop A', 'Amplop B', 'Amplop C', 'Amplop D'];
  const activeTurnGroup = groups.find(g => g.id === activeTurnGroupId);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-6 px-4 select-none">
      {/* Turn Indicator */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-6 text-center"
      >
        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-4 py-1 rounded-full mb-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
            SESI SOAL WAJIB - PILIHAN AMPLOP
          </span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-white">
          {activeTurnGroup ? (
            <span>Giliran: <span className="text-emerald-400 underline decoration-emerald-500">{activeTurnGroup.name}</span></span>
          ) : (
            <span>Silakan Kelompok Memilih Amplop Soal</span>
          )}
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-md">
          Peserta di panggung memilih amplop secara lisan kepada MC/Dewan Juri.
        </p>
      </motion.div>

      {/* Grid of 3D-styled Virtual Envelopes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl px-4">
        {displayPackets.map((pkt, idx) => {
          const isOpened = openedEnvelope === pkt;
          const qCount = questions.filter(q => q.packet === pkt).length;

          return (
            <motion.div
              key={pkt}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectEnvelope && onSelectEnvelope(pkt)}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all relative overflow-hidden shadow-2xl ${
                isOpened
                  ? 'bg-gradient-to-br from-emerald-900/90 to-teal-950/90 border-emerald-400 ring-2 ring-emerald-400/40'
                  : 'bg-gradient-to-br from-slate-900 to-slate-800/90 border-slate-700 hover:border-amber-400 hover:shadow-amber-500/10'
              }`}
            >
              {/* Top Status Badge */}
              <div className="absolute top-2 right-2">
                {isOpened ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <Lock size={14} className="text-slate-500" />
                )}
              </div>

              {/* Envelope Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
                isOpened 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-400/30'
              }`}>
                <Mail size={32} />
              </div>

              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
                {pkt}
              </h3>
              
              <span className="text-[11px] font-bold text-slate-400 mt-1">
                {qCount > 0 ? `${qCount} Butir Soal` : `Paket Soal #${idx + 1}`}
              </span>

              <div className="mt-4 w-full pt-2 border-t border-slate-700/60 flex items-center justify-center">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isOpened ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isOpened ? 'AMPLOP TERBUKA' : 'PILIH AMPLOP INI'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
