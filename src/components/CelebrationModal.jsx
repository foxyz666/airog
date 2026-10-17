import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  DollarSign, 
  Clock, 
  RotateCcw, 
  Check, 
  X 
} from 'lucide-react';
import { soundFX } from '../utils/audio';

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  targetFlights, 
  totalEarned, 
  elapsedTimeStr, 
  onStartNewShift,
  soundEnabled 
}) {
  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) {
        soundFX.playGoalReachedFanfare();
        soundFX.vibrate([100, 50, 100, 50, 200]);
      }

      // Fireworks confetti burst
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-sm p-6 text-center text-slate-100 shadow-2xl relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="inline-block px-3 py-1 mb-2 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
          Obiectiv Îndeplinit!
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          Felicitări Căpitane!
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Ai finalizat cu succes toate cele <strong className="text-amber-400">{targetFlights} de curse</strong> programate în tură!
        </p>

        {/* Summary Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Câștig Total Tură:
            </span>
            <span className="text-base font-mono font-black text-emerald-400">
              ${Number(totalEarned).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Timp Petrecut în Tură:
            </span>
            <span className="font-mono font-bold text-slate-200">
              {elapsedTimeStr || 'N/A'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onStartNewShift}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Începe o Nouă Tură (0/{targetFlights})
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Continuă în Regim Suplimentar (Overtime)
          </button>
        </div>

      </div>
    </div>
  );
}
