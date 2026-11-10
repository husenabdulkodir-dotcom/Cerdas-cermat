import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, LogIn, Key, Sparkles, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Landing() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      const code = roomCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      navigate(`/${code}`);
    }
  };

  const generateRandomRoom = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    navigate(`/${code}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
        
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
          <Trophy size={40} className="text-white" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Cerdas Cermat</h1>
          <p className="text-sm font-medium text-slate-500">
            Sistem Lomba Multi-Sesi Real-Time
          </p>
        </div>

        <form onSubmit={handleJoin} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              Kode Ruangan / Sesi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="MISAL: FINAL-PUTRA"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono font-bold text-slate-800 placeholder:font-sans placeholder:font-medium placeholder:normal-case placeholder:text-slate-400 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            <span>Masuk ke Ruangan</span>
          </button>
        </form>

        <div className="w-full flex items-center justify-between gap-4 my-6">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATAU</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <button
          onClick={generateRandomRoom}
          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          <span>Buat Ruangan Baru (Acak)</span>
        </button>

      </div>
    </div>
  );
}
