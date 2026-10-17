import React, { useState } from 'react';
import { 
  Plane, 
  LogOut, 
  Settings, 
  Database, 
  Volume2, 
  VolumeX, 
  User, 
  Flame,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  onOpenSettings, 
  onOpenFirebase, 
  soundEnabled, 
  setSoundEnabled,
  flightData
}) {
  const { user, logout, isFirebaseConfigured } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
            <Plane className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">FlyUS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                LSIA
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>GTA 5 Roleplay Dispatch</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl transition ${
              soundEnabled 
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40' 
                : 'text-slate-500 bg-slate-800/50'
            }`}
            title={soundEnabled ? 'Sunet activ' : 'Sunet oprit'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Cloud Sync Status */}
          <button
            type="button"
            onClick={onOpenFirebase}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              isFirebaseConfigured
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-mono">
              {isFirebaseConfigured ? 'Cloud' : 'Demo'}
            </span>
          </button>

          {/* Shift Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            title="Setări Cursă"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 transition"
            title="Ieșire din cont"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Pilot Callsign Sub-bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 py-1.5 text-[11px] flex items-center justify-between max-w-md mx-auto text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">
            Pilot: <strong className="text-slate-200">{user?.displayName || user?.email?.split('@')[0] || 'Căpitan'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400">
            Aeronava: <span className="text-cyan-300 font-medium">{flightData?.selectedPlane || 'Velum'}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
