import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, Settings, Users, LogOut, Download } from 'lucide-react';
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

          <div className="pt-4 border-t border-slate-100">
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 mb-3 text-xs text-amber-800">
              <span className="font-bold block mb-0.5">ℹ️ Mode Lomba Panggung Offline:</span>
              Peserta menjawab langsung di panggung dengan bel fisik. Operator/Juri cukup membuka <strong>Dashboard Utama</strong> di Proyektor dan <strong>Admin Panel</strong> di Laptop.
            </div>

            <details className="text-xs text-slate-500 cursor-pointer">
              <summary className="font-semibold text-slate-600 hover:text-slate-900 py-1 flex items-center justify-between">
                <span>Bel Virtual Tambahan (Opsional)</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{gameState?.groups.length || 0} Regu</span>
              </summary>
              <p className="text-[11px] text-slate-400 mt-1 mb-2">
                Hanya digunakan jika lomba tidak memiliki bel fisik di panggung.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {(gameState?.groups || []).map((group) => (
                  <Link
                    key={group.id}
                    to={`/${roomId}/group/${group.id}`}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors text-center text-xs font-bold"
                  >
                    <Users size={16} className="mb-1" />
                    <span className="truncate w-full">{group.name}</span>
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
