import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  RotateCcw, 
  Undo2, 
  DollarSign, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  TrendingUp,
  History,
  Layers,
  AlertCircle,
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { soundFX } from '../utils/audio';

export default function FlightTrackerCard({
  flightData,
  onRecordFlight,
  onUndoFlight,
  onOpenSettings,
  onOpenHistory,
  soundEnabled
}) {
  const current = flightData?.currentFlights || 0;
  const target = flightData?.targetFlights || 50;
  const payPerFlight = flightData?.payPerFlight || 5000;
  const plane = flightData?.selectedPlane || '1. Cucuruznic';
  const route = flightData?.selectedRoute || 'Cursa 1 - Standard';
  const shiftStartTime = flightData?.shiftStartTime || Date.now();

  const progressPercent = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);
  const totalEarnedShift = current * payPerFlight;

  // Confirmation state (default to true to prevent accidental clicks)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [askConfirmation, setAskConfirmation] = useState(() => {
    try {
      const saved = localStorage.getItem('flyus_ask_confirmation');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleAskConfirmation = (val) => {
    setAskConfirmation(val);
    try {
      localStorage.setItem('flyus_ask_confirmation', JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  // Live Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((Date.now() - shiftStartTime) / 1000));
      setElapsedSeconds(diff);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shiftStartTime]);

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Triggered when user taps the big button
  const handleMainButtonClick = () => {
    if (askConfirmation) {
      if (soundEnabled) {
        soundFX.playClick();
        soundFX.vibrate([25]);
      }
      setShowConfirmModal(true);
    } else {
      executeFlightIncrement();
    }
  };

  // Executes the flight increment
  const executeFlightIncrement = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 200);

    if (soundEnabled) {
      soundFX.playFlightBeep();
      soundFX.vibrate([60, 40, 60]);
    }

    onRecordFlight();
    setShowConfirmModal(false);
  };

  const handleUndoClick = () => {
    if (current > 0) {
      if (soundEnabled) {
        soundFX.playClick();
        soundFX.vibrate([30]);
      }
      onUndoFlight();
    }
  };

  // Average time per flight calculation
  const avgSeconds = current > 0 ? Math.round(elapsedSeconds / current) : 0;
  const avgStr = avgSeconds > 0 ? `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s` : '--';

  return (
    <div className="w-full max-w-md mx-auto space-y-4 px-4 pb-12 pt-2 animate-in fade-in duration-300">
      
      {/* Route & Aircraft Badge Bar */}
      <div 
        onClick={onOpenSettings}
        className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 cursor-pointer transition shadow-lg backdrop-blur-sm flex items-center justify-between group"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4 transform -rotate-45" />
          </div>
          <div className="truncate">
            <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 truncate">
              <span>{plane}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono">${payPerFlight.toLocaleString()} / cursă</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{route}</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition shrink-0 ml-2" />
      </div>

      {/* Main Cockpit Telemetry Counter Display */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden text-center">
        
        {/* Glow backdrop based on progress */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-700"
          style={{
            backgroundColor: progressPercent >= 100 ? '#10b981' : progressPercent > 50 ? '#06b6d4' : '#3b82f6'
          }}
        />

        {/* Counter Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800/80 text-cyan-300 border border-slate-700/60 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Progres Tură Zbor</span>
        </div>

        {/* The Big Number: 0 / 50 */}
        <div className="my-2 flex items-baseline justify-center gap-2">
          <span className="text-6xl sm:text-7xl font-black tracking-tight text-white font-mono drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {current}
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-slate-500 font-mono">
            / {target}
          </span>
        </div>

        {/* Progress Bar & Badges */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs px-1 font-semibold">
            <span className="text-slate-400 font-mono">
              {remaining > 0 ? `${remaining} rămase` : 'Obiectiv atins! 🎉'}
            </span>
            <span className={`font-mono px-2 py-0.5 rounded-md text-xs ${
              progressPercent >= 100 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
            }`}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar track */}
          <div className="w-full h-3.5 bg-slate-950 rounded-full p-0.5 border border-slate-800 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Live Quick Stats Grid */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          
          {/* Earnings */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-0.5">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Încasat
            </div>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono mt-0.5 truncate">
              ${totalEarnedShift.toLocaleString()}
            </div>
          </div>

          {/* Stopwatch */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-0.5">
              <Clock className="w-3 h-3 text-cyan-400" /> Timp Tură
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono mt-0.5">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          {/* Average Speed */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-400" /> Medie
            </div>
            <div className="text-xs sm:text-sm font-bold text-amber-300 font-mono mt-0.5">
              {avgStr}
            </div>
          </div>

        </div>

      </div>

      {/* THE GIANT BUTTON: "AM DAT CURSA" */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleMainButtonClick}
          className={`w-full relative py-6 px-4 rounded-3xl font-black text-xl tracking-tight transition-all duration-150 transform active:scale-95 shadow-2xl flex flex-col items-center justify-center gap-1.5 overflow-hidden ${
            isPressing 
              ? 'scale-95 bg-cyan-400 text-slate-950 ring-4 ring-cyan-300' 
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-slate-950 text-white shadow-cyan-500/25 border-2 border-cyan-400/40 glow-cyan'
          }`}
        >
          {/* Subtle reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3">
            <Plane className="w-8 h-8 text-white transform -rotate-45 drop-shadow-md animate-pulse-subtle" />
            <span className="text-2xl font-black tracking-wider text-white drop-shadow-md uppercase">
              AM DAT CURSA
            </span>
          </div>
          
          <span className="text-xs font-semibold text-cyan-100/90 tracking-normal">
            Apasă după fiecare aterizare (+1 cursă)
          </span>
        </button>

        {/* Undo and Confirmation toggle */}
        <div className="mt-2.5 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handleUndoClick}
            disabled={current <= 0}
            className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 transition active:scale-95"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Anulează (-1 cursă)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleAskConfirmation(!askConfirmation)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
              askConfirmation
                ? 'bg-cyan-950/40 border-cyan-700/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Activează/dezactivează confirmarea la apăsare"
          >
            <CheckCircle2 className={`w-3 h-3 ${askConfirmation ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span>{askConfirmation ? 'Confirmare activă' : 'Fără confirmare'}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Grid for Mobile */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button
          type="button"
          onClick={onOpenHistory}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <History className="w-4 h-4 text-cyan-400" />
          <span>Jurnal Zboruri ({flightData?.history?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Setează Ținta ({target})</span>
        </button>
      </div>

      {/* Target Progress Banner */}
      {current >= target && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Obiectivul de {target} curse a fost atins!</span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] underline font-bold text-white shrink-0 ml-2"
          >
            Nouă tură
          </button>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl w-full max-w-sm p-6 text-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Icon */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20 mb-2">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">
                Confirmi Cursa?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verificare pentru a preveni apăsarea accidentală
              </p>
            </div>

            {/* Flight Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 mb-5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Număr Cursă:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {current} ➔ <span className="text-cyan-400">{current + 1}</span> / {target}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Avion:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[170px]">{plane}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Traseu:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[170px]">{route}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Plată adăugată:</span>
                <span className="font-mono font-bold text-emerald-400">+${payPerFlight.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={executeFlightIncrement}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>DA, AM DAT CURSA (+1)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Nu, am apăsat din greșeală</span>
              </button>
            </div>

            {/* Remember toggle */}
            <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="askConfirmationCheck"
                checked={askConfirmation}
                onChange={(e) => toggleAskConfirmation(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="askConfirmationCheck" className="text-[11px] text-slate-400 cursor-pointer select-none">
                Cere confirmare de fiecare dată
              </label>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
