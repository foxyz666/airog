import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  Save, 
  KeyRound,
  Sparkles
} from 'lucide-react';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  isFirebaseConfigured 
} from '../services/firebase';

export default function FirebaseModal({ isOpen, onClose }) {
  const currentConfig = getSavedFirebaseConfig() || {};
  
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [databaseURL, setDatabaseURL] = useState(currentConfig.databaseURL || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [jsonPaste, setJsonPaste] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJsonPaste = (e) => {
    const val = e.target.value;
    setJsonPaste(val);
    try {
      // Try to parse full firebaseConfig object if user copies directly from Firebase Console
      let clean = val;
      if (clean.includes('const firebaseConfig =')) {
        clean = clean.split('const firebaseConfig =')[1];
      }
      if (clean.includes(';')) {
        clean = clean.split(';')[0];
      }
      // Replace single quotes and property names
      clean = clean.replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"');
      const parsed = JSON.parse(clean);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.databaseURL) setDatabaseURL(parsed.databaseURL);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setError('');
    } catch (err) {
      // User might still be typing
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      setError('Te rugăm să completezi cel puțin apiKey și projectId!');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      databaseURL: databaseURL.trim() || "https://aircraft-9cb9b-default-rtdb.europe-west1.firebasedatabase.app",
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveFirebaseConfig(config);
  };

  const handleClear = () => {
    if (confirm('Sigur vrei să ștergi configurația Firebase salvată și să revii la modul Local/Demo?')) {
      clearFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Conectare Firebase
                {isFirebaseConfigured ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Activ
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Mod Local Demo
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Salvare date în Cloud pentru GTA 5 Roleplay</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Instructions Banner */}
        <div className="my-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 space-y-1.5 leading-relaxed">
          <div className="font-semibold text-cyan-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Cum configurezi Firebase gratuit în 2 minute:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Intră pe <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5 font-medium">console.firebase.google.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li>Apasă <b>Add project</b> (numește-l ex: <i>gta-curse</i>).</li>
            <li>În meniu mergi la <b>Build ➔ Authentication</b> și activează <b>Email/Password</b>.</li>
            <li>Mergi la <b>Build ➔ Firestore Database</b> ➔ <i>Create database</i> (mod test).</li>
            <li>Mergi la <b>Project Settings (rotiță)</b> ➔ <i>General</i> ➔ <b>Your apps (Web &lt;/&gt;)</b> și copiază codul de configurare.</li>
          </ol>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* JSON Fast Paste toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowJsonInput(!showJsonInput)}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
          >
            {showJsonInput ? 'Ascunde introducerea automată JSON' : 'Ai copiat tot obiectul firebaseConfig? Lipește-l direct aici'}
          </button>
          
          {showJsonInput && (
            <div className="mt-2">
              <textarea
                value={jsonPaste}
                onChange={handleJsonPaste}
                placeholder="const firebaseConfig = { apiKey: '...', projectId: '...' };"
                rows={3}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Câmpurile de mai jos se vor completa automat.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              API Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              required
              className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="gta5-rp-curse"
              required
              className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Realtime Database URL
            </label>
            <input
              type="text"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              placeholder="https://aircraft-9cb9b-default-rtdb.europe-west1.firebasedatabase.app"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="gta5-rp-curse.firebaseapp.com"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:1234567890:web:abcdef"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="gta5-rp-curse.firebasestorage.app"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Messaging Sender ID
              </label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="1029384756"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
            {isFirebaseConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Șterge Config
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
              >
                Închide
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/25"
              >
                <Save className="w-4 h-4" /> Salvează & Reîncarcă
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
