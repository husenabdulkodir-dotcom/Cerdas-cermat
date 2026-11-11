import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../lib/socket';
import { GameState, Question, Group } from '../types';
import { 
  Play, 
  Square, 
  Settings, 
  RefreshCcw, 
  Bell, 
  CheckCircle, 
  XCircle, 
  SkipForward, 
  Edit2, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Volume2,
  Award,
  Sparkles,
  HelpCircle,
  Send,
  Coins,
  Music,
  Mail,
  Users,
  Check,
  RotateCcw,
  EyeOff,
  Eye,
  Search,
  Filter,
  Layers,
  ListFilter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn, compressImage, formatImageUrl } from '../lib/utils';
import SpinWheel from '../components/SpinWheel';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

export default function Admin() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'control' | 'questions' | 'groups'>('control');
  const [autoStartTimer, setAutoStartTimer] = useState(true);
  const [timerDuration, setTimerDuration] = useState<number>(30);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [packetFilter, setPacketFilter] = useState<string>('All');
  const [searchControlQuery, setSearchControlQuery] = useState<string>('');
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>({});
  const [hideUsedQuestions, setHideUsedQuestions] = useState<boolean>(false);

  useEffect(() => {
    if (gameState?.spinWheelResult) {
      setCategoryFilter(gameState.spinWheelResult);
    }
  }, [gameState?.spinWheelResult]);

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
    });

    socket.on('timerUpdate', (time: number) => {
       setGameState(prev => prev ? { ...prev, timer: time } : prev);
    });

    socket.emit('requestGameState', roomId);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut only applies if we aren't typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Escape') {
        socket.emit('admin:resetBuzzer');
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(current => {
          if (current) {
            if (current.isTimerRunning) {
              socket.emit('admin:pauseTimer');
            } else if (current.timer > 0) {
              socket.emit('admin:startTimer');
            }
          }
          return current;
        });
        return;
      }

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        setGameState(current => {
          if (current && !current.buzzedGroupId && current.groups.length >= num) {
            socket.emit('admin:forceBuzz', current.groups[num - 1].id);
          }
          return current;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      socket.off('connect', onConnect);
      socket.off('gameState');
      socket.off('timerUpdate');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [roomId]);

  if (!gameState) return <div className="p-8 text-slate-500">Menyambungkan ke server...</div>;

  const { groups, questions, activeQuestion, timer, isTimerRunning, buzzerEnabled, buzzedGroupId, spinWheelResult, customCategories, usedQuestionIds = [] } = gameState;

  const displayedQuestions = questions
    .filter(q => categoryFilter === 'All' || q.category === categoryFilter)
    .filter(q => typeFilter === 'All' || q.type === typeFilter)
    .filter(q => packetFilter === 'All' || q.packet === packetFilter)
    .filter(q => !hideUsedQuestions || !usedQuestionIds.includes(q.id))
    .filter(q => {
      if (!searchControlQuery.trim()) return true;
      const term = searchControlQuery.toLowerCase();
      return (
        q.text.toLowerCase().includes(term) ||
        q.answer.toLowerCase().includes(term) ||
        (q.category && q.category.toLowerCase().includes(term)) ||
        (q.packet && q.packet.toLowerCase().includes(term)) ||
        q.id.toLowerCase().includes(term)
      );
    });

  const availablePackets = Array.from(new Set(questions.filter(q => q.packet).map(q => q.packet as string)));

  // --- Actions ---
  const handleToggleQuestionUsed = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    socket.emit('admin:toggleQuestionUsed', questionId);
  };

  const handleResetUsedQuestions = () => {
    if (confirm('Yakin ingin mereset tanda "Sudah Digunakan" pada semua soal? Semua soal akan kembali ditandai sebagai belum digunakan.')) {
      socket.emit('admin:resetUsedQuestions');
    }
  };
  const handleSetQuestion = (q: Question | null) => {
    if (q) {
      socket.emit('admin:setActiveQuestion', {
        question: q,
        duration: Number(timerDuration) > 0 ? Number(timerDuration) : 30,
        autoStart: autoStartTimer
      });
    } else {
      socket.emit('admin:setActiveQuestion', null);
    }
  };

  const handleAddCustomCategory = () => {
    if (newCustomCategory.trim()) {
      const updated = [...(gameState?.customCategories || []), newCustomCategory.trim()];
      socket.emit('admin:updateCustomCategories', updated);
      setNewCustomCategory('');
    }
  };

  const handleTimerAction = () => {
    if (isTimerRunning) {
      socket.emit('admin:pauseTimer');
    } else {
      socket.emit('admin:startTimer');
    }
  };

  const handleSetTimerValue = (seconds: number) => {
    socket.emit('admin:setTimer', seconds);
  };

  const handleBuzzerToggle = () => {
    if (buzzedGroupId) {
       socket.emit('admin:resetBuzzer');
    } else {
       socket.emit('admin:enableBuzzer', !buzzerEnabled);
    }
  };

  const handleUpdateScore = (groupId: string, delta: number) => {
    socket.emit('admin:updateScore', { groupId, delta });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="text-blue-500" size={24} />
            <span>Admin Panel</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('control')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
              activeTab === 'control' ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Play size={20} /> <span>Kontrol Utama</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
              activeTab === 'questions' ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Edit2 size={20} /> <span>Bank Soal</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
              activeTab === 'groups' ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <UsersIcon size={20} /> <span>Kelompok</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {activeTab === 'control' && (
          <div className="max-w-5xl mx-auto space-y-8">
            
            
            {/* Phase Control & Quick Rules Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <div>
                 <div className="flex items-center gap-2">
                   <h3 className="text-lg font-bold text-slate-900">Babak & Sesi Perlombaan</h3>
                   <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                     Mode Non-Gadget (Panggung)
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 mt-0.5">
                   Kendali penuh dipegang oleh Operator / Dewan Juri. Layar proyektor langsung menyesuaikan tampilan babak.
                 </p>
               </div>
               <div className="flex items-center gap-2">
                 <select 
                   value={gameState?.gamePhase || 'Persiapan'} 
                   onChange={(e) => socket.emit('admin:setGamePhase', e.target.value)}
                   className="border-2 border-blue-500 rounded-xl px-4 py-2.5 text-slate-800 font-bold text-sm bg-blue-50/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
                 >
                   <option value="Persiapan">1. Persiapan / Standby</option>
                   <option value="Soal Wajib">2. Babak Soal Wajib (Pilih Amplop)</option>
                   <option value="Soal Lemparan">3. Babak Soal Lemparan</option>
                   <option value="Soal Rebutan">4. Babak Soal Rebutan (Bel Cepat)</option>
                   <option value="Taruhan Poin">5. Babak Taruhan Poin</option>
                   <option value="Pengumuman">6. Pengumuman Juara (Podium)</option>
                 </select>
               </div>
            </div>

            {/* Soundboard Remote Control (Audio ke Sound System Proyektor) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-700 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="text-emerald-400" size={20} />
                  <span className="font-bold text-sm">Soundboard Panggung (Sound System)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Realtime WebAudio
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'buzzer')}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Bell size={14} /> <span>Bel Panggung</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'correct')}
                  className="px-2.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle size={14} /> <span>Suara Benar</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'wrong')}
                  className="px-2.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <XCircle size={14} /> <span>Suara Salah</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'applause')}
                  className="px-2.5 py-2 bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-600/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Sorak tepuk tangan penonton"
                >
                  <span>👏</span> <span>Tepuk Tangan</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'drumroll')}
                  className="px-2.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-600/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Suara drum ketegangan sebelum jawaban diumumkan"
                >
                  <span>🥁</span> <span>Drum Roll</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'envelope')}
                  className="px-2.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Mail size={14} /> <span>Buka Amplop</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'clue')}
                  className="px-2.5 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-600/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles size={14} /> <span>Clue Terbuka</span>
                </button>
                <button
                  onClick={() => socket.emit('admin:triggerSound', 'fanfare')}
                  className="px-2.5 py-2 bg-yellow-950/80 hover:bg-yellow-900 text-yellow-300 border border-yellow-500/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Award size={14} /> <span>Fanfare Juara</span>
                </button>
              </div>
            </div>

            {/* Special Phase Sub-Bar: Envelope Controls if Babak Soal Wajib */}
            {gameState.gamePhase === 'Soal Wajib' && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-amber-200/60">
                  <div>
                    <h4 className="font-bold text-amber-900 text-base flex items-center gap-2">
                      <Mail size={18} className="text-amber-600" />
                      <span>Sesi Amplop Soal Wajib</span>
                    </h4>
                    <p className="text-xs text-amber-700">
                      Tentukan giliran kelompok santri di panggung, lalu buka amplop yang mereka pilih.
                    </p>
                  </div>
                  {gameState.openedEnvelope && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
                        Amplop Terbuka: {gameState.openedEnvelope}
                      </span>
                      <button
                        onClick={() => socket.emit('admin:openEnvelope', null)}
                        className="text-xs text-amber-800 hover:text-amber-950 font-bold underline"
                      >
                        Tutup Amplop
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Giliran Kelompok */}
                  <div>
                    <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                      Pilih Giliran Kelompok di Panggung:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {groups.map(g => (
                        <button
                          key={g.id}
                          onClick={() => socket.emit('admin:setActiveTurnGroup', g.id === gameState.activeTurnGroupId ? null : g.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                            gameState.activeTurnGroupId === g.id
                              ? "bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300"
                              : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                          )}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buka Amplop Virtual */}
                  <div>
                    <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                      Buka Amplop di Layar Proyektor:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Amplop A', 'Amplop B', 'Amplop C', 'Amplop D'].map(pkt => (
                        <button
                          key={pkt}
                          onClick={() => socket.emit('admin:openEnvelope', pkt)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                            gameState.openedEnvelope === pkt
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                              : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                          )}
                        >
                          <Mail size={14} />
                          <span>{pkt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Special Phase Sub-Bar: Taruhan Poin */}
            {gameState.gamePhase === 'Taruhan Poin' && (
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Coins size={20} className="text-yellow-600" />
                  <div>
                    <h4 className="font-bold text-yellow-900 text-base">Manajemen Taruhan Poin Kelompok</h4>
                    <p className="text-xs text-yellow-700">
                      Sebelum soal dibuka, setiap regu menentukan berapa poin yang dipertaruhkan.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {groups.map(g => (
                    <div key={g.id} className="bg-white p-3 rounded-xl border border-yellow-200 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{g.name}</span>
                        <span className="text-[11px] font-mono font-bold text-slate-400">Total: {g.score}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="Taruhan"
                          defaultValue={gameState.groupBets?.[g.id] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setBetAmounts(prev => ({ ...prev, [g.id]: val }));
                          }}
                          className="w-full text-xs font-mono font-bold border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-yellow-500"
                        />
                        <button
                          onClick={() => {
                            const val = betAmounts[g.id] !== undefined ? betAmounts[g.id] : (gameState.groupBets?.[g.id] || 0);
                            socket.emit('admin:setGroupBet', { groupId: g.id, bet: val });
                          }}
                          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold rounded shrink-0 shadow-sm"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timer Control */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hitung Mundur</h3>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", isTimerRunning ? "bg-emerald-100 text-emerald-700 animate-pulse" : "bg-slate-100 text-slate-500")}>
                    {isTimerRunning ? "Berjalan" : "Berhenti"}
                  </span>
                </div>
                <div className="text-6xl font-bold font-mono tracking-tighter text-slate-900 my-2 tabular-nums">{timer}s</div>
                
                {/* Duration Pre-set & Quick Change */}
                <div className="w-full mt-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                    <span>Atur Waktu:</span>
                    <span className="font-bold text-slate-700 font-mono">{timerDuration} Detik</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {[10, 15, 30, 60].map(s => (
                      <button 
                        key={s} 
                        onClick={() => {
                          setTimerDuration(s);
                          handleSetTimerValue(s);
                        }} 
                        className={cn(
                          "flex-1 py-1 text-xs font-semibold rounded-lg transition-colors border",
                          timerDuration === s 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        )}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleTimerAction}
                  className={cn(
                    "mt-4 w-full py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors text-sm",
                    isTimerRunning ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}
                >
                  {isTimerRunning ? <><Square size={16}/> <span>Jeda Waktu</span></> : <><Play size={16}/> <span>Mulai Waktu</span></>}
                </button>
              </div>

              {/* Manual Buzzer Control */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">Indikator Menjawab</h3>
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  {buzzedGroupId ? (
                    <div className="text-emerald-500 flex flex-col items-center mb-4">
                      <Bell size={48} className="animate-bounce mb-2" />
                      <span className="font-bold text-xl text-balance">{groups.find(g => g.id === buzzedGroupId)?.name}</span>
                      <span className="text-sm font-medium mt-1">sedang menjawab!</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center mb-4">
                      <Bell size={40} className="mb-2 opacity-50" />
                      <span className="font-medium text-sm">Pilih kelompok manual saat bel fisik ditekan</span>
                    </div>
                  )}
                  
                  {!buzzedGroupId && groups.length > 0 && (
                    <div className="w-full grid grid-cols-2 gap-2 mt-2">
                      {groups.map((g, idx) => (
                        <button
                          key={g.id}
                          onClick={() => socket.emit('admin:forceBuzz', g.id)}
                          className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          {g.name}
                          <span className="block text-[9px] font-normal opacity-70">Tekan/Shortcut {idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {buzzedGroupId && (
                  <button
                    onClick={() => socket.emit('admin:resetBuzzer')}
                    className="mt-4 w-full py-3 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <RefreshCcw size={20} />
                    <span>Reset Indikator</span>
                  </button>
                )}
              </div>

              {/* Score Quick Manage */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skor Berjalan</h3>
                   {groups.length > 0 && (
                     <button
                       onClick={() => {
                         if (confirm('Setel ulang skor SEMUA kelompok menjadi 0? Tindakan ini biasanya dilakukan saat memulai babak baru.')) {
                           socket.emit('admin:updateGroups', groups.map(g => ({ ...g, score: 0 })));
                         }
                       }}
                       className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                       title="Reset skor semua kelompok ke 0"
                     >
                       Reset 0
                     </button>
                   )}
                 </div>
                 <div className="flex-1 space-y-3 overflow-y-auto">
                   {groups.map(g => (
                     <div key={g.id} className={cn(
                       "flex items-center justify-between p-3 rounded-lg border",
                       buzzedGroupId === g.id ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"
                     )}>
                       <span className="font-semibold text-slate-700 truncate max-w-[110px]">{g.name}</span>
                       <div className="flex items-center space-x-2.5">
                         <button
                           onClick={() => {
                             const input = prompt(`Masukkan nilai skor baru untuk ${g.name}:`, g.score.toString());
                             if (input !== null) {
                               const parsed = parseInt(input);
                               if (!isNaN(parsed)) {
                                 socket.emit('admin:updateScore', { groupId: g.id, delta: parsed - g.score });
                               }
                             }
                           }}
                           className="font-mono font-bold text-lg hover:text-blue-600 hover:underline cursor-pointer"
                           title="Klik untuk ubah angka skor secara manual"
                         >
                           {g.score}
                         </button>
                         <div className="flex flex-col space-y-1">
                           <button onClick={() => handleUpdateScore(g.id, 10)} className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold hover:bg-emerald-200" title="+10 Poin">+</button>
                           <button onClick={() => handleUpdateScore(g.id, -10)} className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold hover:bg-red-200" title="-10 Poin">-</button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Active Question & Picker */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-900">Soal Saat Ini</h3>
                 {activeQuestion && (
                   <button onClick={() => handleSetQuestion(null)} className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-red-500">
                     <XCircle size={16} /> <span>Tutup Soal</span>
                   </button>
                 )}
               </div>

               {activeQuestion ? (
                 <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                   <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                     <div className="flex items-center space-x-2 flex-wrap">
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md">
                         {activeQuestion.type === 'pilihan_ganda' ? 'Pilihan Ganda' : activeQuestion.type}
                       </span>
                       {activeQuestion.packet && (
                         <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                           ✉️ {activeQuestion.packet}
                         </span>
                       )}
                       <span className="px-3 py-1 bg-white text-slate-500 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-md">
                         {activeQuestion.category}
                       </span>
                     </div>

                     <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-md font-mono">
                       {activeQuestion.type === 'clue' 
                         ? `${Math.max(25, activeQuestion.points - ((gameState.activeClueIndex || 0) * 25))} Poin (Clue ${(gameState.activeClueIndex || 0) + 1})`
                         : `${activeQuestion.points} Poin`}
                     </span>
                   </div>
                   
                   {activeQuestion.questionImage && (
                      <img src={activeQuestion.questionImage} alt="Soal" className="h-36 object-contain mb-4 rounded-lg border border-blue-200 bg-white" />
                   )}
                   <h2 className="text-2xl font-bold text-slate-900 mb-3">{activeQuestion.text}</h2>

                   {/* Multiple Choice Preview if Pilihan Ganda */}
                   {activeQuestion.type === 'pilihan_ganda' && activeQuestion.options && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                       {activeQuestion.options.map((opt, oIdx) => (
                         <div key={oIdx} className="bg-white px-3 py-2 rounded-lg border text-xs font-semibold text-slate-700">
                           {opt}
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Clue Navigation Bar if Clue Question */}
                   {activeQuestion.type === 'clue' && activeQuestion.clues && (
                     <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl mb-4">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-purple-900 uppercase">
                           💡 Status Clue Bertahap: Clue {(gameState.activeClueIndex || 0) + 1} dari {activeQuestion.clues.length}
                         </span>
                         <span className="text-xs font-bold text-purple-700">
                           Nilai: {Math.max(25, 100 - ((gameState.activeClueIndex || 0) * 25))} pt
                         </span>
                       </div>
                       <div className="space-y-1 text-xs mb-3">
                         {activeQuestion.clues.map((c, idx) => (
                           <p key={idx} className={idx <= (gameState.activeClueIndex || 0) ? "font-bold text-purple-950" : "text-slate-400"}>
                             #{idx + 1}: {c}
                           </p>
                         ))}
                       </div>
                       {(gameState.activeClueIndex || 0) < activeQuestion.clues.length - 1 && (
                         <button
                           onClick={() => socket.emit('admin:nextClue')}
                           className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow transition-all"
                         >
                           Buka Petunjuk #{ (gameState.activeClueIndex || 0) + 2 } di Layar Proyektor
                         </button>
                       )}
                     </div>
                   )}

                   {/* Audio Play Trigger if Audio Question */}
                   {activeQuestion.type === 'audio' && (
                     <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl mb-4 flex items-center justify-between">
                       <div>
                         <span className="text-xs font-bold text-cyan-900 uppercase flex items-center gap-1.5">
                           <Music size={14} /> <span>Audio Klip Soal (Lantunan Ayat)</span>
                         </span>
                         <p className="text-[11px] text-cyan-700 mt-0.5">
                           {activeQuestion.audioUrl ? 'File audio kustom terpasang' : 'Lantunan sintetis offline siap dibunyikan'}
                         </p>
                       </div>
                       <button
                         onClick={() => socket.emit('admin:triggerSound', 'chant')}
                         className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                       >
                         <Play size={14} /> <span>Putar di Proyektor</span>
                       </button>
                     </div>
                   )}

                   {/* Kunci Jawaban Card */}
                   <div className="pt-4 border-t border-blue-200">
                     <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Kunci Jawaban:</span>
                     <p className="text-xl font-bold text-emerald-700 mt-1">{activeQuestion.answer}</p>
                     {activeQuestion.answerImage && (
                       <img src={activeQuestion.answerImage} alt="Jawaban" className="h-32 object-contain mt-3 rounded-lg border border-blue-200 bg-white" />
                     )}
                     
                     <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-4 flex-wrap gap-2">
                       <button
                         onClick={() => socket.emit('admin:revealAnswer', !gameState?.revealAnswer)}
                         className={cn(
                           "px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm",
                           gameState?.revealAnswer 
                             ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                             : "bg-emerald-600 text-white hover:bg-emerald-700"
                         )}
                       >
                         {gameState?.revealAnswer ? "Sembunyikan Jawaban" : "Tampilkan Jawaban di Layar Utama"}
                       </button>

                       {/* Status Dilempar Info */}
                       {gameState.passedGroupIds && gameState.passedGroupIds.length > 0 && (
                         <span className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
                           Soal telah dilempar dari regu sebelumnya
                         </span>
                       )}
                     </div>
                   </div>

                   {/* FAST ONE-CLICK JUDGING BAR (Untuk Lomba On-Site) */}
                   <div className="mt-6 pt-5 border-t-2 border-blue-200 bg-white/70 -mx-6 -mb-6 p-6 rounded-b-xl">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <Award className="text-blue-600" size={18} />
                         <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                           Panel Keputusan Juri (Satu-Klik)
                         </span>
                       </div>
                       {buzzedGroupId ? (
                         <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full animate-pulse">
                           🔔 Bel Ditekan: {groups.find(g => g.id === buzzedGroupId)?.name}
                         </span>
                       ) : gameState.activeTurnGroupId ? (
                         <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                           🎯 Giliran: {groups.find(g => g.id === gameState.activeTurnGroupId)?.name}
                         </span>
                       ) : (
                         <span className="text-xs font-medium text-slate-400">
                           Pilih regu penekan bel fisik di atas untuk menilai
                         </span>
                       )}
                     </div>

                     {/* Calculating current points to award */}
                     {(() => {
                       const respondentId = buzzedGroupId || gameState.activeTurnGroupId;
                       const respondent = groups.find(g => g.id === respondentId);
                       const currentPoints = activeQuestion.type === 'clue'
                         ? Math.max(25, activeQuestion.points - ((gameState.activeClueIndex || 0) * 25))
                         : (gameState.groupBets && respondentId && gameState.groupBets[respondentId])
                         ? gameState.groupBets[respondentId]
                         : activeQuestion.points;

                       return (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                           <button
                             disabled={!respondentId}
                             onClick={() => {
                               if (respondentId) {
                                 socket.emit('admin:judgeAnswer', {
                                   groupId: respondentId,
                                   isCorrect: true,
                                   points: currentPoints
                                 });
                               }
                             }}
                             className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                           >
                             <CheckCircle size={18} />
                             <span>BENAR (+{currentPoints} pt{(respondent?.streak || 0) >= 2 ? " +25 STREAK🔥" : ""})</span>
                           </button>

                           <button
                             disabled={!respondentId}
                             onClick={() => {
                               if (respondentId) {
                                 socket.emit('admin:judgeAnswer', {
                                   groupId: respondentId,
                                   isCorrect: false,
                                   deductPoints: 0
                                 });
                               }
                             }}
                             className="py-3 px-3 rounded-xl bg-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all"
                           >
                             <XCircle size={18} />
                             <span>SALAH (0 pt)</span>
                           </button>

                           <button
                             disabled={!respondentId}
                             onClick={() => {
                               if (respondentId) {
                                 socket.emit('admin:judgeAnswer', {
                                   groupId: respondentId,
                                   isCorrect: false,
                                   deductPoints: 25
                                 });
                               }
                             }}
                             className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all"
                           >
                             <XCircle size={18} />
                             <span>SALAH & MINUS (-25 pt)</span>
                           </button>

                           <button
                             onClick={() => {
                               socket.emit('admin:passQuestion', { timer: 10 });
                             }}
                             className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all"
                           >
                             <Send size={18} />
                             <span>LEMPAR SOAL (10s)</span>
                           </button>
                         </div>
                       );
                     })()}
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                   <p className="text-slate-500 font-medium">Belum ada soal yang dipilih.</p>
                 </div>
               )}

               <div className="mt-8">
                 <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-slate-100">
                   <div className="flex flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-3 flex-wrap">
                       <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                         <span>Pilih Soal dari Bank</span>
                         <span className="text-xs font-normal text-slate-400">({displayedQuestions.length} Soal)</span>
                       </h4>

                       {/* Used count badge */}
                       <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
                         <Check size={12} />
                         <span>{usedQuestionIds.length} / {questions.length} telah digunakan</span>
                       </span>

                       {usedQuestionIds.length > 0 && (
                         <button
                           onClick={handleResetUsedQuestions}
                           className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 underline transition-colors"
                           title="Reset tanda 'Sudah Digunakan' pada semua soal"
                         >
                           <RotateCcw size={12} />
                           <span>Reset Tanda</span>
                         </button>
                       )}
                     </div>

                     <div className="flex items-center space-x-3 flex-wrap">
                       {/* Filter Hide Used */}
                       <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                         <input
                           type="checkbox"
                           checked={hideUsedQuestions}
                           onChange={(e) => setHideUsedQuestions(e.target.checked)}
                           className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                         />
                         <span>Sembunyikan yang sudah digunakan</span>
                       </label>
                     </div>
                   </div>

                   {/* Quick Search & Filter Controls */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                     {/* Search */}
                     <div className="relative">
                       <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input
                         type="text"
                         placeholder="Cari kata kunci soal / jawaban..."
                         value={searchControlQuery}
                         onChange={(e) => setSearchControlQuery(e.target.value)}
                         className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 font-medium"
                       />
                       {searchControlQuery && (
                         <button
                           onClick={() => setSearchControlQuery('')}
                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                         >
                           <X size={13} />
                         </button>
                       )}
                     </div>

                     {/* Tipe Soal */}
                     <div>
                       <select
                         value={typeFilter}
                         onChange={(e) => setTypeFilter(e.target.value)}
                         className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                       >
                         <option value="All">Semua Tipe Soal</option>
                         <option value="wajib">Wajib</option>
                         <option value="lempar">Lempar</option>
                         <option value="rebutan">Rebutan</option>
                         <option value="pilihan_ganda">Pilihan Ganda</option>
                         <option value="clue">Tebak Clue</option>
                         <option value="audio">Audio / Sambung Ayat</option>
                       </select>
                     </div>

                     {/* Paket Amplop */}
                     <div>
                       <select
                         value={packetFilter}
                         onChange={(e) => setPacketFilter(e.target.value)}
                         className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                       >
                         <option value="All">Semua Paket / Amplop</option>
                         {availablePackets.map(pkt => (
                           <option key={pkt} value={pkt}>✉️ {pkt}</option>
                         ))}
                       </select>
                     </div>

                     {/* Kategori */}
                     <div>
                       <select 
                         value={categoryFilter}
                         onChange={(e) => setCategoryFilter(e.target.value)}
                         className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                       >
                         <option value="All">Semua Kategori</option>
                         {Array.from(new Set([...questions.map(q => q.category || 'Umum'), ...(customCategories || [])])).map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                       </select>
                     </div>
                   </div>

                   {/* Pre-launch Timer Settings Bar */}
                   <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                     <div className="flex items-center flex-wrap gap-2">
                       <span className="text-xs font-bold text-slate-700">⏱️ Durasi Hitung Mundur:</span>
                       <div className="flex items-center space-x-1">
                         {[10, 15, 20, 30, 45, 60].map(sec => (
                           <button
                             key={sec}
                             onClick={() => {
                               setTimerDuration(sec);
                               handleSetTimerValue(sec);
                             }}
                             className={cn(
                               "px-2 py-1 text-xs font-bold rounded-md transition-all",
                               timerDuration === sec
                                 ? "bg-blue-600 text-white shadow-sm"
                                 : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                             )}
                           >
                             {sec}s
                           </button>
                         ))}
                       </div>

                       <div className="flex items-center space-x-1 ml-1">
                         <input
                           type="number"
                           min="1"
                           max="300"
                           value={timerDuration}
                           onChange={(e) => {
                             const val = Math.max(1, parseInt(e.target.value) || 1);
                             setTimerDuration(val);
                             handleSetTimerValue(val);
                           }}
                           className="w-14 px-2 py-1 text-xs border border-slate-300 rounded-md font-mono text-center font-bold bg-white"
                         />
                         <span className="text-xs text-slate-500">detik</span>
                       </div>
                     </div>

                     <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300">
                       <input 
                         type="checkbox" 
                         checked={autoStartTimer}
                         onChange={(e) => setAutoStartTimer(e.target.checked)}
                         className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                       />
                       <span>⚡ Langsung hitung mundur saat diklik</span>
                     </label>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-2">
                   {displayedQuestions.map(q => {
                     const isUsed = usedQuestionIds.includes(q.id);
                     return (
                       <button
                         key={q.id}
                         onClick={() => handleSetQuestion(q)}
                         className={cn(
                           "text-left p-4 rounded-xl border flex flex-col hover:border-blue-300 transition-all relative group",
                           activeQuestion?.id === q.id 
                             ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-xs" 
                             : isUsed 
                               ? "bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100" 
                               : "bg-white border-slate-200"
                         )}
                       >
                         <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                           <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                             {q.type === 'pilihan_ganda' ? 'Pilihan Ganda' : q.type}
                           </span>
                           {q.packet && (
                             <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                               ✉️ {q.packet}
                             </span>
                           )}
                           <span className="text-xs font-medium text-slate-400">{q.category}</span>

                           {/* Badge Status Sudah Digunakan */}
                           {isUsed && (
                             <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                               <Check size={11} className="stroke-[3]" />
                               <span>Sudah Digunakan</span>
                             </span>
                           )}

                           <span className="ml-auto font-mono text-emerald-600 font-bold">{q.points} pt</span>

                           {/* Manual Toggle Button */}
                           <span
                             role="button"
                             onClick={(e) => handleToggleQuestionUsed(e, q.id)}
                             title={isUsed ? "Klik untuk tandai belum digunakan" : "Tandai sudah digunakan"}
                             className={cn(
                               "text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ml-1",
                               isUsed
                                 ? "bg-white text-slate-500 hover:text-rose-600 border-slate-200"
                                 : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200 opacity-0 group-hover:opacity-100"
                             )}
                           >
                             {isUsed ? "Batalkan tanda" : "Tandai sudah"}
                           </span>
                         </div>
                         <p className={cn(
                           "font-semibold text-slate-800 line-clamp-2",
                           isUsed && "text-slate-600"
                         )}>
                           {q.text}
                         </p>
                       </button>
                     );
                   })}
                   {displayedQuestions.length === 0 && (
                     <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                       <p className="text-sm font-semibold text-slate-600">Tidak ada soal yang cocok dengan filter atau kata kunci pencarian.</p>
                       <p className="text-xs text-slate-400 mt-1">Coba ganti filter tipe, paket, kategori, atau reset kata kunci pencarian.</p>
                       <button
                         onClick={() => {
                           setSearchControlQuery('');
                           setTypeFilter('All');
                           setPacketFilter('All');
                           setCategoryFilter('All');
                           setHideUsedQuestions(false);
                         }}
                         className="mt-3 px-3 py-1.5 bg-white border border-slate-300 text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                       >
                         Reset Semua Filter
                       </button>
                     </div>
                   )}
                 </div>
               </div>
            </div>

            {/* Spin Wheel Control */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Spin Wheel (Acak Kategori)</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1 w-full">
                  <SpinWheel 
                    items={Array.from(new Set([...questions.map(q => q.category || 'Umum'), ...(customCategories || [])]))} 
                    onSpinEnd={(res) => socket.emit('admin:spinWheel', res)}
                    isSpinning={false}
                  />
                </div>
                <div className="w-full md:w-1/3 space-y-4">
                  <p className="text-sm text-slate-500">
                    Gunakan fitur ini untuk mengacak kategori soal sebelum peserta memilih atau menjawab. 
                    Hasil spin akan langsung muncul di layar Dashboard Utama.
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Hasil Saat Ini</span>
                    <span className="text-2xl font-bold text-emerald-600">{spinWheelResult || "-"}</span>
                  </div>
                  <button
                    onClick={() => socket.emit('admin:spinWheel', null)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium text-sm transition-colors"
                  >
                    Reset Tampilan Spin
                  </button>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tambah Kategori Manual</p>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={newCustomCategory}
                        onChange={e => setNewCustomCategory(e.target.value)}
                        placeholder="Nama Kategori..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory()}
                      />
                      <button 
                        onClick={handleAddCustomCategory}
                        disabled={!newCustomCategory.trim()}
                        className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
        
        {activeTab === 'questions' && (
           <QuestionBankManager questions={questions} usedQuestionIds={usedQuestionIds} />
        )}
        
        {activeTab === 'groups' && (
           <GroupManager groups={groups} />
        )}
      </main>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function QuestionBankManager({ questions, usedQuestionIds = [] }: { questions: Question[]; usedQuestionIds?: string[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [searchBankQuery, setSearchBankQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterPacket, setFilterPacket] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'used' | 'unused'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const availableBankPackets = Array.from(new Set(questions.filter(q => q.packet).map(q => q.packet as string)));
  const availableBankCategories = Array.from(new Set(questions.filter(q => q.category).map(q => q.category as string)));

  const filteredBankQuestions = questions.filter(q => {
    if (filterType !== 'All' && q.type !== filterType) return false;
    if (filterPacket !== 'All' && q.packet !== filterPacket) return false;
    if (filterCategory !== 'All' && q.category !== filterCategory) return false;
    const isUsed = usedQuestionIds.includes(q.id);
    if (filterStatus === 'used' && !isUsed) return false;
    if (filterStatus === 'unused' && isUsed) return false;
    if (searchBankQuery.trim()) {
      const s = searchBankQuery.toLowerCase();
      const match = q.text.toLowerCase().includes(s) ||
                    q.answer.toLowerCase().includes(s) ||
                    (q.category && q.category.toLowerCase().includes(s)) ||
                    (q.packet && q.packet.toLowerCase().includes(s)) ||
                    q.id.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredBankQuestions.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = pageSize === 0 
    ? filteredBankQuestions 
    : filteredBankQuestions.slice((activePage - 1) * pageSize, activePage * pageSize);

  const handleClearAllQuestions = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA SOAL di bank soal? Tindakan ini tidak dapat dibatalkan.')) {
      if (confirm('Konfirmasi sekali lagi: Hapus seluruh soal sekarang?')) {
        socket.emit('admin:updateQuestions', []);
      }
    }
  };

  const handleLoadDefaultQuestions = () => {
    if (confirm('Muat bank soal standar lengkap (20 soal: 2 soal untuk setiap tipe, amplop, dan kategori)?')) {
      socket.emit('admin:updateQuestions', DEFAULT_QUESTIONS);
      socket.emit('admin:resetUsedQuestions');
    }
  };

  const handleResetUsedStatus = () => {
    if (confirm('Reset semua status tanda digunakan agar semua soal bisa dimainkan kembali dari awal?')) {
      socket.emit('admin:resetUsedQuestions');
    }
  };

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const types = ['wajib', 'lempar', 'rebutan', 'pilihan_ganda', 'clue', 'audio'];
    const sheetNames: Record<string, string> = {
      'wajib': 'Soal Wajib',
      'lempar': 'Soal Lempar',
      'rebutan': 'Soal Rebutan',
      'pilihan_ganda': 'Pilihan Ganda',
      'clue': 'Tebak Clue',
      'audio': 'Soal Audio'
    };
    
    types.forEach(type => {
      const filtered = questions.filter(q => q.type.toLowerCase() === type);
      const data = filtered.map((q, index) => ({
        No: index + 1,
        ID: q.id,
        Tipe: q.type,
        Paket: q.packet || '',
        Kategori: q.category,
        Soal: q.text,
        Jawaban: q.answer,
        Poin: q.points,
        GambarSoal: q.questionImage || '',
        GambarJawaban: q.answerImage || ''
      }));

      // If empty, create a template
      if (data.length === 0) {
        data.push({
          No: 1,
          ID: `q_template_${type}`,
          Tipe: type as any,
          Paket: type === 'wajib' ? 'Amplop A' : '',
          Kategori: 'Umum',
          Soal: `Contoh soal ${type}...`,
          Jawaban: 'Jawaban contoh',
          Poin: 100,
          GambarSoal: '',
          GambarJawaban: ''
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[type]);
    });

    XLSX.writeFile(workbook, "Bank_Soal_Cerdas_Cermat.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let allNewQuestions: Question[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
          
          let defaultType = 'wajib';
          const sName = sheetName.toLowerCase();
          if (sName.includes('rebutan')) defaultType = 'rebutan';
          else if (sName.includes('lempar')) defaultType = 'lempar';
          else if (sName.includes('pilihan') || sName.includes('ganda')) defaultType = 'pilihan_ganda';
          else if (sName.includes('clue')) defaultType = 'clue';
          else if (sName.includes('audio') || sName.includes('ayat')) defaultType = 'audio';

          const newQuestions: Question[] = jsonData.map((row: any, i: number) => ({
            id: row.ID && String(row.ID).trim() !== '' ? String(row.ID) : `q${Date.now()}_${sheetName.replace(/\s+/g, '')}_${i}`,
            type: (row.Tipe ? String(row.Tipe).toLowerCase().trim() : defaultType) as any,
            packet: (row.Paket || row.Amplop) ? String(row.Paket || row.Amplop).trim() : undefined,
            category: String(row.Kategori || 'Umum'),
            text: String(row.Soal || ''),
            answer: String(row.Jawaban || ''),
            points: Number(row.Poin || 100),
            questionImage: row.GambarSoal ? formatImageUrl(String(row.GambarSoal)) : undefined,
            answerImage: row.GambarJawaban ? formatImageUrl(String(row.GambarJawaban)) : undefined
          })).filter((q: Question) => q.text.trim() !== '' && !q.id.includes('q_template'));

          allNewQuestions = [...allNewQuestions, ...newQuestions];
        });

        if (allNewQuestions.length > 0) {
          if (confirm(`Ditemukan ${allNewQuestions.length} soal dari file Excel. Apakah Anda ingin menggabungkannya dengan soal saat ini? (Batal = Timpa semua)`)) {
             socket.emit('admin:updateQuestions', [...questions, ...allNewQuestions]);
             alert('Bank soal berhasil ditambahkan!');
          } else {
             socket.emit('admin:updateQuestions', allNewQuestions);
             alert('Bank soal berhasil diganti!');
          }
        } else {
          alert('Tidak ditemukan data soal yang valid dalam file Excel.');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel. Pastikan formatnya benar.');
      }
      
      // Reset input
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDelete = (id: string) => {
    if(confirm('Yakin ingin menghapus soal ini?')) {
      socket.emit('admin:updateQuestions', questions.filter(q => q.id !== id));
    }
  };

  const handleSaveQuestion = () => {
    if(!editingQuestion?.text || !editingQuestion?.answer) {
       alert("Soal dan Jawaban wajib diisi!");
       return;
    }
    
    if(editingQuestion.id) {
       // update
       socket.emit('admin:updateQuestions', questions.map(q => q.id === editingQuestion.id ? editingQuestion as Question : q));
    } else {
       // add new
       const newQ = { ...editingQuestion, id: `q${Date.now()}` } as Question;
       socket.emit('admin:updateQuestions', [...questions, newQ]);
    }
    setEditingQuestion(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'questionImage' | 'answerImage') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file, 800);
        setEditingQuestion(prev => prev ? { ...prev, [field]: base64 } : null);
      } catch (err) {
        alert("Gagal memproses gambar");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative">
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">{editingQuestion.id ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                   <input type="text" value={editingQuestion.category || ''} onChange={e => setEditingQuestion({...editingQuestion, category: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="Cth: Fiqih / Sejarah Islam" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Soal</label>
                   <select 
                     value={editingQuestion.type || 'wajib'} 
                     onChange={e => {
                       const t = e.target.value as any;
                       setEditingQuestion({
                         ...editingQuestion, 
                         type: t,
                         options: t === 'pilihan_ganda' ? (editingQuestion.options || ['A. ', 'B. ', 'C. ', 'D. ']) : editingQuestion.options,
                         clues: t === 'clue' ? (editingQuestion.clues || ['', '', '', '']) : editingQuestion.clues
                       });
                     }} 
                     className="w-full border rounded-lg p-2 text-sm font-semibold text-slate-800"
                   >
                     <option value="wajib">Wajib (Amplop)</option>
                     <option value="lempar">Lempar</option>
                     <option value="rebutan">Rebutan (Bel Cepat)</option>
                     <option value="pilihan_ganda">Pilihan Ganda (A, B, C, D)</option>
                     <option value="clue">Tebak Clue Bertahap</option>
                     <option value="audio">Tebak Audio / Sambung Ayat</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Poin Soal</label>
                   <input 
                     type="number" 
                     min={0}
                     step={10}
                     value={editingQuestion.points ?? 100} 
                     onChange={e => setEditingQuestion({...editingQuestion, points: Number(e.target.value) || 0})} 
                     className="w-full border rounded-lg p-2 text-sm font-mono font-bold text-emerald-700" 
                     placeholder="100" 
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paket Amplop (Opsional)</label>
                   <select
                     value={editingQuestion.packet || ''}
                     onChange={e => setEditingQuestion({...editingQuestion, packet: e.target.value || undefined})}
                     className="w-full border rounded-lg p-2 text-sm"
                   >
                     <option value="">(Tanpa Amplop)</option>
                     <option value="Amplop A">Amplop A</option>
                     <option value="Amplop B">Amplop B</option>
                     <option value="Amplop C">Amplop C</option>
                     <option value="Amplop D">Amplop D</option>
                   </select>
                 </div>
               </div>

               {editingQuestion.type === 'audio' && (
                 <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200 space-y-2">
                   <label className="block text-xs font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
                     <Music size={14} /> <span>Link File Audio (Opsional)</span>
                   </label>
                   <input
                     type="text"
                     placeholder="https://... link file audio MP3/WAV online (opsional)"
                     value={editingQuestion.audioUrl || ''}
                     onChange={e => setEditingQuestion({...editingQuestion, audioUrl: e.target.value || undefined})}
                     className="w-full border border-cyan-300 rounded-lg p-2 text-xs bg-white text-slate-800"
                   />
                   <p className="text-[11px] text-cyan-700">
                     💡 Jika dikosongkan, sistem cerdas cermat otomatis membunyikan lantunan ayat sintetis offline tanpa butuh koneksi internet.
                   </p>
                 </div>
               )}

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teks Pertanyaan / Deskripsi</label>
                 <textarea value={editingQuestion.text || ''} onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})} className="w-full border rounded-lg p-2.5 min-h-[80px] text-sm" placeholder="Masukkan butir soal..."></textarea>
               </div>

               {/* Pilihan Ganda Form Fields */}
               {editingQuestion.type === 'pilihan_ganda' && (
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                     Opsi Jawaban (A, B, C, D)
                   </label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {['A', 'B', 'C', 'D'].map((letter, idx) => {
                       const currentVal = editingQuestion.options?.[idx] || '';
                       return (
                         <div key={letter} className="flex items-center gap-2">
                           <span className="w-6 font-bold text-xs text-slate-500">{letter}.</span>
                           <input
                             type="text"
                             placeholder={`Pilihan ${letter}...`}
                             value={currentVal.replace(/^[A-D]\.\s*/, '')}
                             onChange={(e) => {
                               const newOpts = [...(editingQuestion.options || ['', '', '', ''])];
                               newOpts[idx] = `${letter}. ${e.target.value}`;
                               setEditingQuestion({ ...editingQuestion, options: newOpts });
                             }}
                             className="flex-1 border rounded-lg p-2 text-xs bg-white"
                           />
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}

               {/* Clues Form Fields */}
               {editingQuestion.type === 'clue' && (
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-2">
                   <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                     4 Petunjuk Bertahap (Tebak Siapakah Aku):
                   </label>
                   <div className="space-y-2">
                     {[100, 75, 50, 25].map((pts, idx) => {
                       const cVal = editingQuestion.clues?.[idx] || '';
                       return (
                         <div key={idx} className="flex items-center gap-2">
                           <span className="text-xs font-bold font-mono text-purple-700 w-16">
                             #{idx + 1} ({pts}pt):
                           </span>
                           <input
                             type="text"
                             placeholder={`Petunjuk #${idx + 1}...`}
                             value={cVal}
                             onChange={(e) => {
                               const newClues = [...(editingQuestion.clues || ['', '', '', ''])];
                               newClues[idx] = e.target.value;
                               setEditingQuestion({ ...editingQuestion, clues: newClues });
                             }}
                             className="flex-1 border rounded-lg p-2 text-xs bg-white"
                           />
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}

               <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                   <span>🖼️ Gambar Soal (Opsional)</span>
                   {editingQuestion.questionImage && (
                     <button 
                       type="button"
                       onClick={() => setEditingQuestion({...editingQuestion, questionImage: undefined})} 
                       className="text-xs text-rose-600 hover:underline font-semibold"
                     >
                       Hapus Gambar
                     </button>
                   )}
                 </label>
                 {editingQuestion.questionImage && (
                   <div className="mb-2">
                     <img src={editingQuestion.questionImage} alt="Preview Soal" className="h-32 object-contain rounded-lg bg-white border border-slate-200" />
                   </div>
                 )}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                   <div>
                     <span className="text-[11px] text-slate-500 font-medium block mb-1">Opsi A: Upload File (JPG/PNG)</span>
                     <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'questionImage')} className="text-xs text-slate-600 w-full" />
                   </div>
                   <div>
                     <span className="text-[11px] text-slate-500 font-medium block mb-1">Opsi B: Link / URL (Google Drive, Imgur, dll)</span>
                     <input 
                       type="text" 
                       placeholder="https://drive.google.com/... atau https://..." 
                       value={editingQuestion.questionImage?.startsWith('data:') ? '' : (editingQuestion.questionImage || '')}
                       onChange={e => {
                         const formatted = formatImageUrl(e.target.value);
                         setEditingQuestion({...editingQuestion, questionImage: formatted});
                       }}
                       className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                   </div>
                 </div>
               </div>
               <hr/>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kunci Jawaban Benar</label>
                 <input type="text" value={editingQuestion.answer || ''} onChange={e => setEditingQuestion({...editingQuestion, answer: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="Jawaban yang benar..." />
               </div>
               <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                   <span>🖼️ Gambar Jawaban / Pembahasan (Opsional)</span>
                   {editingQuestion.answerImage && (
                     <button 
                       type="button"
                       onClick={() => setEditingQuestion({...editingQuestion, answerImage: undefined})} 
                       className="text-xs text-rose-600 hover:underline font-semibold"
                     >
                       Hapus Gambar
                     </button>
                   )}
                 </label>
                 {editingQuestion.answerImage && (
                   <div className="mb-2">
                     <img src={editingQuestion.answerImage} alt="Preview Jawaban" className="h-32 object-contain rounded-lg bg-white border border-slate-200" />
                   </div>
                 )}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                   <div>
                     <span className="text-[11px] text-slate-500 font-medium block mb-1">Opsi A: Upload File (JPG/PNG)</span>
                     <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'answerImage')} className="text-xs text-slate-600 w-full" />
                   </div>
                   <div>
                     <span className="text-[11px] text-slate-500 font-medium block mb-1">Opsi B: Link / URL (Google Drive, Imgur, dll)</span>
                     <input 
                       type="text" 
                       placeholder="https://drive.google.com/... atau https://..." 
                       value={editingQuestion.answerImage?.startsWith('data:') ? '' : (editingQuestion.answerImage || '')}
                       onChange={e => {
                         const formatted = formatImageUrl(e.target.value);
                         setEditingQuestion({...editingQuestion, answerImage: formatted});
                       }}
                       className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                   </div>
                 </div>
               </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
               <button onClick={() => setEditingQuestion(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">Batal</button>
               <button onClick={handleSaveQuestion} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Simpan Soal</button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Soal</p>
          <p className="text-xl font-black text-slate-800">{questions.length}</p>
        </div>
        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Wajib</p>
          <p className="text-xl font-black text-blue-700">{questions.filter(q => q.type === 'wajib').length}</p>
        </div>
        <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Lempar</p>
          <p className="text-xl font-black text-amber-700">{questions.filter(q => q.type === 'lempar').length}</p>
        </div>
        <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Rebutan</p>
          <p className="text-xl font-black text-rose-700">{questions.filter(q => q.type === 'rebutan').length}</p>
        </div>
        <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Pil. Ganda</p>
          <p className="text-xl font-black text-purple-700">{questions.filter(q => q.type === 'pilihan_ganda').length}</p>
        </div>
        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Clue / Audio</p>
          <p className="text-xl font-black text-indigo-700">{questions.filter(q => q.type === 'clue' || q.type === 'audio').length}</p>
        </div>
        <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Terpakai</p>
          <p className="text-xl font-black text-emerald-700">{usedQuestionIds.length}</p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tersedia</p>
          <p className="text-xl font-black text-slate-700">{Math.max(0, questions.length - usedQuestionIds.filter(id => questions.some(q => q.id === id)).length)}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Bank Soal</h2>
          <p className="text-sm text-slate-500">
            {filteredBankQuestions.length === questions.length 
              ? `Total ${questions.length} soal tersedia dalam bank soal`
              : `Menampilkan ${filteredBankQuestions.length} dari ${questions.length} soal`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button onClick={() => setEditingQuestion({ type: 'wajib', points: 100 })} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 shadow-xs cursor-pointer">
            <Plus size={16} /> <span>Tambah Manual</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 cursor-pointer">
            <Upload size={16} /> <span>Import</span>
          </button>
          <button onClick={handleExport} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 cursor-pointer">
            <Download size={16} /> <span>Export</span>
          </button>
          <button 
            type="button" 
            onClick={() => setShowGuide(!showGuide)} 
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Lihat petunjuk format Excel dan upload gambar"
          >
            <span>💡 Panduan Format & Gambar</span>
          </button>

          <button
            type="button"
            onClick={handleLoadDefaultQuestions}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Muat 20 soal standar lengkap (2 soal untuk setiap tipe, amplop, dan kategori)"
          >
            <Sparkles size={13} className="text-blue-600" />
            <span>Muat Paket 20 Soal Lengkap</span>
          </button>

          {/* Batch operations */}
          {usedQuestionIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetUsedStatus}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-3 py-2 rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Reset status tanda digunakan pada seluruh soal"
            >
              <RotateCcw size={13} />
              <span>Reset Tanda</span>
            </button>
          )}

          {questions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllQuestions}
              className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3 py-2 rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Hapus semua soal dari bank soal"
            >
              <Trash2 size={13} />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {showGuide && (
        <div className="mb-6 p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <span>📋 Panduan Upload Soal Bergambar & Format Excel</span>
            </h4>
            <button onClick={() => setShowGuide(false)} className="text-amber-800 hover:text-amber-950 font-bold cursor-pointer">✕ Tutup</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="font-bold text-slate-900 block mb-1 text-xs">Cara 1: Upload File Gambar Langsung (Paling Praktis)</span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 leading-relaxed">
                <li>Klik tombol <b>Tambah Manual</b> atau klik ikon <b>Edit (✏️)</b> pada salah satu soal di bawah.</li>
                <li>Pada bagian <i>Gambar Soal</i>, pilih file foto/screenshot dari komputer (format JPG/PNG).</li>
                <li>Sistem otomatis mengompres foto dan menyimpannya langsung ke soal tanpa perlu upload ke hosting luar.</li>
              </ol>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="font-bold text-slate-900 block mb-1 text-xs">Cara 2: Tulis Link / URL Gambar di Excel</span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 leading-relaxed">
                <li>Download template dengan klik tombol <b>Export</b>.</li>
                <li>Di kolom <b>GambarSoal</b> atau <b>GambarJawaban</b>, paste link URL gambar publik (misal link Google Drive atau Imgur).</li>
                <li>Jika menggunakan <b>Google Drive</b>, pastikan akses link diatur ke <i>"Siapa saja yang memiliki link (Public)"</i>. Sistem akan mengonversinya secara otomatis.</li>
                <li>Klik <b>Import</b> untuk mengunggah file Excel Anda.</li>
              </ol>
            </div>
          </div>

          <div className="bg-amber-100/60 p-2.5 rounded-lg text-[11px] text-amber-900 font-medium">
            💡 <b>Urutan Kolom File Excel:</b> No | ID | Tipe (wajib/lempar/rebutan/pilihan_ganda/clue/audio) | Kategori | Soal | Jawaban | Poin | GambarSoal | GambarJawaban
          </div>
        </div>
      )}

      {/* Search, Filter & Pagination Bar */}
      <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari soal, jawaban, atau kata kunci..."
              value={searchBankQuery}
              onChange={(e) => {
                setSearchBankQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-7 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400"
            />
            {searchBankQuery && (
              <button
                onClick={() => {
                  setSearchBankQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Tipe Soal */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">Semua Tipe</option>
              <option value="wajib">Wajib</option>
              <option value="lempar">Lempar</option>
              <option value="rebutan">Rebutan</option>
              <option value="pilihan_ganda">Pilihan Ganda</option>
              <option value="clue">Tebak Clue</option>
              <option value="audio">Audio / Sambung Ayat</option>
            </select>
          </div>

          {/* Paket Amplop */}
          <div>
            <select
              value={filterPacket}
              onChange={(e) => {
                setFilterPacket(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">Semua Paket</option>
              {availableBankPackets.map(pkt => (
                <option key={pkt} value={pkt}>✉️ {pkt}</option>
              ))}
            </select>
          </div>

          {/* Status Digunakan */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="unused">Belum Digunakan</option>
              <option value="used">Sudah Digunakan</option>
            </select>
          </div>

          {/* Page Size */}
          <div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value={25}>25 soal / hal</option>
              <option value={50}>50 soal / hal</option>
              <option value={100}>100 soal / hal</option>
              <option value={0}>Tampilkan Semua</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-2">
        {questions.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            Belum ada soal. Silakan tambah manual atau import file Excel.
          </div>
        )}

        {questions.length > 0 && filteredBankQuestions.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-600">Tidak ada soal yang cocok dengan filter atau kata kunci.</p>
            <button
              onClick={() => {
                setSearchBankQuery('');
                setFilterType('All');
                setFilterPacket('All');
                setFilterCategory('All');
                setFilterStatus('All');
                setCurrentPage(1);
              }}
              className="mt-2 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}

        {paginatedQuestions.map((q, i) => {
          const itemNumber = pageSize === 0 ? i + 1 : (activePage - 1) * pageSize + i + 1;
          const isUsed = usedQuestionIds.includes(q.id);
          return (
            <div key={q.id} className={cn(
              "p-4 border rounded-xl flex items-start justify-between group transition-all",
              isUsed ? "bg-slate-50/70 border-slate-200" : "bg-white border-slate-200 hover:border-blue-200 shadow-2xs"
            )}>
              <div className="flex-1 pr-4">
                <div className="flex flex-wrap items-center space-x-2 mb-2 gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                    {q.type === 'pilihan_ganda' ? 'Pilihan Ganda' : q.type}
                  </span>
                  {q.packet && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">✉️ {q.packet}</span>}
                  <span className="text-[10px] font-medium text-slate-400">{q.category}</span>
                  {(q.questionImage || q.answerImage) && <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase font-semibold">Ada Gambar</span>}
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{q.points} pt</span>
                  {isUsed && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check size={10} className="stroke-[3]" /> Sudah Digunakan
                    </span>
                  )}
                </div>
                <p className={cn("font-medium text-slate-900", isUsed && "text-slate-600")}>
                  {itemNumber}. {q.text}
                </p>
                <p className="text-sm text-emerald-600 mt-1 font-medium">Jawab: {q.answer}</p>
              </div>
              <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                <button 
                  onClick={() => socket.emit('admin:toggleQuestionUsed', q.id)} 
                  title={isUsed ? "Tandai belum digunakan" : "Tandai sudah digunakan"}
                  className={cn(
                    "p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                    isUsed ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200" : "text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingQuestion(q)} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit2 size={15}/></button>
                <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={15}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-700">{(activePage - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-700">{Math.min(activePage * pageSize, filteredBankQuestions.length)}</span> dari <span className="font-bold text-slate-700">{filteredBankQuestions.length}</span> soal
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={activePage === 1}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={13} />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">
              {activePage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={activePage >= totalPages}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Berikutnya</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function GroupManager({ groups }: { groups: Group[] }) {
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    if (groups.length >= 15) return alert('Maksimal 15 kelompok!');
    
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      score: 0
    };
    
    socket.emit('admin:updateGroups', [...groups, newGroup]);
    setNewGroupName('');
  };

  const handleRenameGroup = (id: string, currentName: string) => {
    const newName = prompt('Ubah nama kelompok:', currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      socket.emit('admin:updateGroups', groups.map(g => g.id === id ? { ...g, name: newName.trim() } : g));
    }
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Yakin ingin menghapus kelompok ini?')) {
      socket.emit('admin:updateGroups', groups.filter(g => g.id !== id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Kelompok Peserta</h2>
          <p className="text-sm text-slate-500">Maksimal 15 Kelompok ({groups.length}/15)</p>
        </div>
        {groups.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Setel ulang skor SEMUA kelompok menjadi 0?')) {
                socket.emit('admin:updateGroups', groups.map(g => ({ ...g, score: 0 })));
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
          >
            Reset Semua Skor ke 0
          </button>
        )}
      </div>

      <div className="flex space-x-3 mb-8">
        <input 
          type="text" 
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          placeholder="Nama Kelompok Baru..." 
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={groups.length >= 15}
        />
        <button 
          onClick={handleAddGroup}
          disabled={!newGroupName.trim() || groups.length >= 15}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 shrink-0"
        >
          <Plus size={16} /> <span>Tambah</span>
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
               <p className="font-bold text-slate-900 text-lg">{g.name}</p>
               <p className="text-sm font-medium text-slate-500 font-mono mt-1">ID: {g.id}</p>
            </div>
            <div className="flex items-center space-x-6">
               <div className="text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Skor</p>
                 <p className="text-2xl font-mono font-bold text-emerald-600">{g.score}</p>
               </div>
               <div className="flex space-x-2">
                  <button 
                    onClick={() => handleRenameGroup(g.id, g.name)} 
                    className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ubah nama kelompok"
                  >
                     <Edit2 size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(g.id)} 
                    className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus kelompok"
                  >
                     <Trash2 size={16}/>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
