import React, { useState, useEffect } from 'react';
import { Volume2, Play, Square, Music } from 'lucide-react';
import { playChantSample, stopChantSample } from '../lib/audio';

interface AudioVisualizerProps {
  audioUrl?: string;
  autoPlay?: boolean;
}

export default function AudioVisualizer({ audioUrl }: AudioVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopChantSample();
      if (audioObj) {
        audioObj.pause();
      }
    };
  }, [audioObj]);

  const togglePlayback = () => {
    if (isPlaying) {
      if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
      } else {
        stopChantSample();
      }
      setIsPlaying(false);
    } else {
      if (audioUrl) {
        const a = new Audio(audioUrl);
        a.onended = () => setIsPlaying(false);
        a.play().catch(e => console.error("Audio play error", e));
        setAudioObj(a);
        setIsPlaying(true);
      } else {
        // Play high-quality synthesized chant sample for Quranic/audio quiz questions
        setIsPlaying(true);
        playChantSample(() => setIsPlaying(false));
      }
    }
  };

  return (
    <div className="w-full max-w-lg bg-slate-950/80 border-2 border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col items-center my-3 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 pointer-events-none" />

      <div className="flex items-center justify-between w-full mb-3 text-cyan-400">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Music size={15} />
          <span>Klip Audio Soal (Tebak / Sambung Ayat)</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
          {isPlaying ? 'MEMUTAR AUDIO...' : 'STANDBY'}
        </span>
      </div>

      {/* Animated Equalizer Wave Bars */}
      <div className="flex items-end justify-center gap-1.5 h-16 w-full px-4 mb-4">
        {[45, 80, 60, 95, 30, 70, 85, 40, 90, 65, 100, 75, 55, 85, 45, 90].map((h, i) => (
          <div
            key={i}
            className="w-2.5 rounded-t-full bg-gradient-to-t from-cyan-600 via-blue-400 to-teal-300 transition-all duration-150"
            style={{
              height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '15%',
              animation: isPlaying ? `bounce 0.8s ease-in-out infinite ${i * 0.05}s` : 'none',
              opacity: isPlaying ? 1 : 0.4
            }}
          />
        ))}
      </div>

      <button
        onClick={togglePlayback}
        className={`px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
          isPlaying
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/50 animate-pulse'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-900/40'
        }`}
      >
        {isPlaying ? (
          <>
            <Square size={16} className="fill-current" />
            <span>Hentikan Audio</span>
          </>
        ) : (
          <>
            <Play size={16} className="fill-current" />
            <span>Putar Audio di Sound System</span>
          </>
        )}
      </button>

      <p className="text-[11px] text-slate-400 mt-2 text-center">
        {audioUrl ? 'Memutar file audio yang diunggah oleh panitia' : 'Audio lantunan tersintesis otomatis tanpa perlu koneksi internet'}
      </p>
    </div>
  );
}
