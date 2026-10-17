import React from 'react';
import { 
  X, 
  History, 
  Plane, 
  Clock, 
  DollarSign, 
  Award, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export default function FlightHistoryDrawer({ 
  isOpen, 
  onClose, 
  history = [], 
  totalLifetimeFlights = 0, 
  totalLifetimeEarnings = 0 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Jurnal Zboruri (Logbook)</h2>
              <p className="text-xs text-slate-400">Istoricul curselor efectuate în această tură</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Career Stats Highlight */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> Total Carieră
            </span>
            <div className="text-lg font-black text-white mt-0.5">
              {totalLifetimeFlights} <span className="text-xs font-normal text-slate-400">curse</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Total Încasat
            </span>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              ${Number(totalLifetimeEarnings).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Flight List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Plane className="w-10 h-10 mx-auto text-slate-600 opacity-40 transform -rotate-45" />
              <p className="text-xs">Nu ai înregistrat nicio cursă în această tură încă.</p>
              <p className="text-[11px] text-slate-600">Apasă pe butonul "AM DAT CURSA" pentru a adăuga!</p>
            </div>
          ) : (
            history.map((flight, index) => {
              const timeStr = flight.timestamp 
                ? new Date(flight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Recent';

              return (
                <div 
                  key={flight.id || index}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      #{flight.flightNumber || (history.length - index)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{flight.plane || 'Avion Standard'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-slate-500" /> {timeStr}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500/70 shrink-0" />
                        <span className="truncate max-w-[180px]">{flight.route || 'LSIA ➔ Sandy Shores'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +${Number(flight.pay || 5000).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 justify-end">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                      <span>validat</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Închide Jurnalul
          </button>
        </div>

      </div>
    </div>
  );
}
