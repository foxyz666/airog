import React, { useState } from 'react';
import { 
  Plane, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Database,
  CheckCircle,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onOpenFirebaseConfig }) {
  const { signup, login, loginDemo, isFirebaseConfigured } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Te rugăm să introduci un login / nume utilizator!');
      return;
    }
    if (!cleanPass) {
      setError('Te rugăm să introduci o parolă!');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await signup(cleanUser, cleanPass, pilotName.trim() || cleanUser);
      } else {
        await login(cleanUser, cleanPass);
      }
    } catch (err) {
      console.error(err);
      let msg = err.message || 'A apărut o eroare la autentificare.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Login sau parolă incorectă!';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginDemo();
    } catch (e) {
      setError('Nu s-a putut inițializa modul rapid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Logo / Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 mb-3 animate-pulse-subtle">
            <Plane className="w-9 h-9 transform -rotate-45" />
          </div>
          <div className="inline-block px-3 py-1 mb-2 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            GTA 5 Roleplay • FlyUS Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curse Avioane LSIA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Urmărește 0/50, apasă „Am dat cursa” și salvează direct pe Firebase
          </p>
        </div>

        {/* Database Status indicator */}
        <div className="flex items-center justify-between mb-4 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Firebase aircraft-9cb9b Activ
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenFirebaseConfig}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 text-[11px] underline"
          >
            <Database className="w-3 h-3" /> Config
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 mb-4 bg-slate-950/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister 
                ? 'bg-slate-800 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conectare (Login)
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister 
                ? 'bg-slate-800 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cont Nou (Înregistrare)
          </button>
        </div>

        {/* Short credentials tip badge */}
        <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-[11px] text-cyan-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Poți folosi <strong>login scurt</strong> (ex: <i>alex</i>, <i>ion</i>) și <strong>parolă scurtă</strong> (ex: <i>123</i>)!</span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Login / Nume Utilizator
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: alex, ion, pilot1"
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full text-sm bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Parolă (poate fi scurtă)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ex: 123 sau 1234"
                required
                className="w-full text-sm bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nume Pilot GTA RP (Opțional)
              </label>
              <div className="relative">
                <Plane className="w-4 h-4 absolute left-3 top-3 text-slate-500 transform -rotate-45" />
                <input
                  type="text"
                  value={pilotName}
                  onChange={(e) => setPilotName(e.target.value)}
                  placeholder="ex: Căpitan Alex #22"
                  className="w-full text-sm bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition disabled:opacity-50 mt-1"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : (
              <>
                {isRegister ? 'Înregistrează-te & Deschide' : 'Intră în Dispecerat'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Entry */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Sau intră rapid ca Oaspete (Fără Cont)
          </button>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
            <Compass className="w-3 h-3" /> Structurat și aranjat pentru telefon mobil
          </span>
        </div>

      </div>
    </div>
  );
}
