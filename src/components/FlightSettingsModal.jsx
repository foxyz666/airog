import React, { useState } from 'react';
import { 
  X, 
  Target, 
  DollarSign, 
  Plane, 
  MapPin, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { DEFAULT_PLANES } from '../services/firebase';

const POPULAR_ROUTES = [
  'Cursa Standard',
  'Cursa Sandy Shores',
  'Cursa Grapeseed',
  'Cursa LSIA - Zancudo',
  'Cursa Paleto Bay',
  'Cursa Marfă Grea'
];

const PRESET_GOALS = [10, 25, 50, 75, 100];

export default function FlightSettingsModal({ 
  isOpen, 
  onClose, 
  flightData, 
  onUpdateData, 
  onResetShift 
}) {
  if (!isOpen) return null;

  const [targetFlights, setTargetFlights] = useState(flightData?.targetFlights || 50);
  const [payPerFlight, setPayPerFlight] = useState(flightData?.payPerFlight || 5000);
  const [selectedPlane, setSelectedPlane] = useState(flightData?.selectedPlane || '1. Cucuruznic');
  const [customPlaneText, setCustomPlaneText] = useState(
    DEFAULT_PLANES.includes(flightData?.selectedPlane) ? '' : (flightData?.selectedPlane || '')
  );
  const [selectedRoute, setSelectedRoute] = useState(flightData?.selectedRoute || 'Cursa Standard');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Determine plane name
    let finalPlane = selectedPlane;
    if (selectedPlane === 'custom') {
      finalPlane = customPlaneText.trim() || 'Avion Custom';
    }

    onUpdateData({
      targetFlights: Number(targetFlights) || 50,
      payPerFlight: Number(payPerFlight) || 5000,
      selectedPlane: finalPlane,
      selectedRoute: selectedRoute.trim() || 'Cursa Standard'
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleReset = () => {
    onResetShift();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Setări Curse & Avion</h2>
              <p className="text-xs text-slate-400">Configurează numărul de curse, avionul și numele cursei</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          
          {/* Target Flights Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Număr Curse Necesare (Țintă)</span>
              <span className="text-cyan-400 font-bold font-mono text-sm">{targetFlights} curse</span>
            </label>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {PRESET_GOALS.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetFlights(num)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition border ${
                    targetFlights === num 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20' 
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Custom Number Input */}
            <input
              type="number"
              min="1"
              max="2000"
              value={targetFlights}
              onChange={(e) => setTargetFlights(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              placeholder="ex: 50"
            />
          </div>

          {/* Custom Route Name (Numele la curse custom) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Nume Cursă (Scrie Custom)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                placeholder="Scrie numele cursei tale (ex: Cursa Sandy Shores)"
                className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium placeholder-slate-600"
              />
              <Edit3 className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Quick Route Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRoute(r)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                    selectedRoute === r 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' 
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Plane Selector requested by user */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alege Avionul</span>
            </label>
            
            {/* 4 Requested planes as quick buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {DEFAULT_PLANES.map((planeName) => {
                const isSelected = selectedPlane === planeName;
                return (
                  <button
                    key={planeName}
                    type="button"
                    onClick={() => {
                      setSelectedPlane(planeName);
                      setCustomPlaneText('');
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{planeName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom plane input toggle */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlane('custom');
                }}
                className={`w-full text-xs font-semibold py-1.5 px-3 rounded-lg border mb-1.5 transition text-left flex items-center justify-between ${
                  selectedPlane === 'custom'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Sau scrie alt avion custom...</span>
                {selectedPlane === 'custom' && <Check className="w-3 h-3 text-amber-400" />}
              </button>

              {selectedPlane === 'custom' && (
                <input
                  type="text"
                  value={customPlaneText}
                  onChange={(e) => setCustomPlaneText(e.target.value)}
                  placeholder="Introdu numele avionului dorit..."
                  autoFocus
                  className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 animate-in fade-in"
                />
              )}
            </div>
          </div>

          {/* Pay per flight */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Plată per Cursă ($)
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                ${Number(payPerFlight).toLocaleString()}
              </span>
            </label>
            <input
              type="number"
              step="500"
              min="0"
              value={payPerFlight}
              onChange={(e) => setPayPerFlight(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              placeholder="ex: 5000"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-[0.98]"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Salvat cu succes!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvează Setările
                </>
              )}
            </button>
          </div>
        </form>

        {/* Reset Shift to 0 */}
        <div className="mt-4 pt-3.5 border-t border-slate-800">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/30 text-rose-400 border border-rose-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetează Cursa Curentă la 0/{targetFlights}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                Sigur resetezi cursa la 0?
              </div>
              <p className="text-[11px] text-slate-300">
                Contorul turei curente va deveni 0/{targetFlights}.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Da, resetează la 0
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
