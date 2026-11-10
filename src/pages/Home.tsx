import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, Settings, Users, LogOut, Bell } from 'lucide-react';
import { socket } from '../lib/socket';
import { GameState } from '../types';

export default function Home() {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    socket.on('gameState', (state: GameState) => {
      setGameState(state);
    });

    socket.emit('requestGameState');

    return () => {
      socket.off('gameState');
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto relative">
        
        <Link to="/" className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Keluar Ruangan">
          <LogOut size={20} />
        </Link>

        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cerdas Cermat Santri</h1>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ruangan:</span>
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold">{roomId?.toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <Link
            to={`/${roomId}/dashboard`}
            className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
          >
            <div className="p-3 bg-slate-100 group-hover:bg-emerald-100 rounded-lg text-slate-600 group-hover:text-emerald-600 transition-colors">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">Dashboard Utama</h3>
              <p className="text-sm text-slate-500">Tampilan untuk penonton (Proyektor)</p>
            </div>
          </Link>

          <Link
            to={`/${roomId}/admin`}
            className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-3 bg-slate-100 group-hover:bg-blue-100 rounded-lg text-slate-600 group-hover:text-blue-600 transition-colors">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">Admin Panel</h3>
              <p className="text-sm text-slate-500">Kelola soal, skor, dan jalannya lomba</p>
            </div>
          </Link>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                <h4 className="text-sm font-bold text-slate-800">
                  Bel Peserta (Opsional)
                </h4>
              </div>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Fitur Tambahan
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Jika lomba menggunakan bel digital di meja masing-masing kelompok, setiap kelompok dapat membuka link bel di bawah:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(gameState?.groups || []).map((group, idx) => {
                const groupUrl = `${window.location.origin}/${roomId}/group/${group.id}`;
                return (
                  <div
                    key={group.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
                        Regu #{idx + 1}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm truncate">{group.name}</h5>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigator.clipboard.writeText(groupUrl);
                          alert(`Link Bel ${group.name} berhasil disalin:\n${groupUrl}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-xs font-semibold cursor-pointer"
                        title="Salin Link Bel"
                      >
                        Salin
                      </button>
                      <Link
                        to={`/${roomId}/group/${group.id}`}
                        target="_blank"
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <Bell size={12} />
                        <span>Buka</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 leading-normal">
              💡 <em>Catatan:</em> Bila lomba memakai bel fisik panggung, lewati menu ini. Operator cukup mengontrol lomba dari <strong>Admin Panel</strong> dan <strong>Dashboard Utama</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
