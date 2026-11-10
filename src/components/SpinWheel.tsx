import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { cn } from '../lib/utils';
import { Play } from 'lucide-react';

interface SpinWheelProps {
  items: string[];
  onSpinEnd: (result: string) => void;
  isSpinning?: boolean;
}

export default function SpinWheel({ items, onSpinEnd, isSpinning: externalIsSpinning }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();
  
  // ensure we have at least 2 items, otherwise repeat them
  const wheelItems = items.length > 0 ? (items.length < 4 ? [...items, ...items, ...items, ...items].slice(0, 8) : items) : ["Kosong", "Kosong", "Kosong", "Kosong"];
  
  const numItems = wheelItems.length;
  const anglePerItem = 360 / numItems;

  const handleSpin = async () => {
    if (isSpinning || externalIsSpinning) return;
    
    setIsSpinning(true);
    
    // Calculate random rotations (at least 5 full spins + random offset)
    const extraSpins = 5;
    const randomIndex = Math.floor(Math.random() * numItems);
    
    // We want the chosen index to end up at the top (0 degrees or 360 degrees).
    // The pointer is at the top. 
    // The slice for index i is centered at (i * anglePerItem + anglePerItem/2)
    // To bring index i to the top, we need to rotate it back by that amount, plus full spins.
    
    const targetRotation = rotation + (extraSpins * 360) + (360 - (randomIndex * anglePerItem)) - (rotation % 360);
    
    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 5,
        ease: [0.2, 0.8, 0.1, 1], // Custom cubic-bezier for a realistic slow down
      }
    });

    setRotation(targetRotation);
    setIsSpinning(false);
    onSpinEnd(wheelItems[randomIndex]);
  };

  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer */}
      <div className="absolute -top-4 z-10 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent border-t-slate-800 drop-shadow-md" />
      
      {/* Wheel Container */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-slate-800 overflow-hidden shadow-xl bg-white">
        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="w-full h-full relative"
          style={{ originX: 0.5, originY: 0.5 }}
        >
          {/* Wheel background using CSS conic gradient for slices */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
               background: `conic-gradient(${wheelItems.map((_, i) => {
                 const c = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'][i % 8];
                 const start = i * anglePerItem;
                 const end = (i + 1) * anglePerItem;
                 return `${c} ${start}deg ${end}deg`;
               }).join(', ')})`
            }}
          />
          
          {wheelItems.map((item, index) => {
            const rotationAngle = (index * anglePerItem) + (anglePerItem / 2);
            return (
              <div 
                key={index}
                className="absolute inset-0 flex items-start justify-center text-white font-bold text-sm md:text-base pt-4 drop-shadow-md origin-center pointer-events-none"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                 <span className="w-1/2 text-center break-words px-2">{item}</span>
              </div>
            )
          })}
          
        </motion.div>
        
        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-slate-800 z-10 shadow-inner" />
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || externalIsSpinning}
        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center space-x-2 uppercase tracking-widest text-sm"
      >
        <Play size={18} />
        <span>Putar Spin Wheel</span>
      </button>
    </div>
  );
}
