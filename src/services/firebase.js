import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue
} from 'firebase/database';

const STORAGE_KEY = 'flyus_firebase_config';
const LOCAL_USER_KEY = 'flyus_local_user';
const LOCAL_DATA_KEY = 'flyus_local_flight_data';

// Default planes requested by user
export const DEFAULT_PLANES = [
  '1. Cucuruznic',
  'Avionul 2',
  'Avionul 3',
  '4. Cel mare'
];

// Default initial state for a pilot
export const defaultFlightData = {
  currentFlights: 0,
  targetFlights: 50,
  payPerFlight: 5000,
  selectedPlane: '1. Cucuruznic',
  selectedRoute: 'Cursa 1 - Standard',
  shiftStartTime: Date.now(),
  totalLifetimeFlights: 0,
  totalLifetimeEarnings: 0,
  history: []
};

// Hardcoded Firebase configuration provided by the user
export const USER_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCX1b5zbZDOfPxG3AaT00_1oeBngLvYUmM",
  authDomain: "aircraft-9cb9b.firebaseapp.com",
  projectId: "aircraft-9cb9b",
  storageBucket: "aircraft-9cb9b.firebasestorage.app",
  messagingSenderId: "595188441358",
  appId: "1:595188441358:web:b253d04c8e55af1ddd375f",
  measurementId: "G-DPF11M12VM",
  databaseURL: "https://aircraft-9cb9b-default-rtdb.europe-west1.firebasedatabase.app"
};

export const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.databaseURL || parsed.databaseURL.includes('default-rtdb.firebaseio.com')) {
        parsed.databaseURL = USER_FIREBASE_CONFIG.databaseURL;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading saved firebase config:', e);
  }
  return USER_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Error saving firebase config:', e);
  }
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

// Initialize Firebase App & Realtime Database
let app = null;
let rtdb = null;
let isFirebaseConfigured = false;

const activeConfig = getSavedFirebaseConfig();

try {
  app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
  const rtdbUrl = activeConfig.databaseURL || USER_FIREBASE_CONFIG.databaseURL;
  rtdb = getDatabase(app, rtdbUrl);
  isFirebaseConfigured = true;
} catch (err) {
  console.warn('Firebase initialization error:', err.message);
  isFirebaseConfigured = false;
}

export { rtdb, isFirebaseConfigured };

// Helper to sanitize database keys (Realtime Database does not allow '.', '#', '$', '[', or ']')
export const sanitizeKey = (str) => {
  if (!str) return 'pilot_' + Date.now();
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
};

// Authentication via Realtime Database (Instant, reliable, supports short login and short password)
export const registerPilot = async (shortLogin, shortPassword, pilotName) => {
  const username = (shortLogin || '').trim();
  const rawPass = (shortPassword || '').trim();

  if (!username) {
    throw new Error('Te rugăm să introduci un nume de utilizator / login!');
  }
  if (!rawPass) {
    throw new Error('Te rugăm să introduci o parolă!');
  }

  const safeUid = sanitizeKey(username);
  const displayName = pilotName?.trim() || username;

  const userObj = {
    uid: safeUid,
    username: username,
    displayName: displayName,
    createdAt: Date.now()
  };

  // 1. Save user account & credentials to Realtime Database
  if (rtdb) {
    try {
      const userCredRef = ref(rtdb, 'users/' + safeUid);
      
      // Check if user already exists
      const snap = await Promise.race([
        get(userCredRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
      ]).catch(() => null);

      if (snap && snap.exists()) {
        const existing = snap.val();
        if (existing.password && existing.password !== rawPass) {
          throw new Error('Utilizatorul există deja cu altă parolă! Folosește "Conectare" sau alege alt nume.');
        }
      }

      // Save user record in RTDB
      await set(userCredRef, {
        username: username,
        password: rawPass,
        displayName: displayName,
        updatedAt: Date.now()
      });

      // Initialize pilot flight document in RTDB if it doesn't exist
      const pilotRef = ref(rtdb, 'pilots/' + safeUid);
      const pilotSnap = await get(pilotRef).catch(() => null);
      if (!pilotSnap || !pilotSnap.exists()) {
        await set(pilotRef, {
          username: username,
          displayName: displayName,
          ...defaultFlightData,
          shiftStartTime: Date.now()
        });
      }
    } catch (dbErr) {
      console.warn('Realtime Database signup notice:', dbErr.message);
      if (dbErr.message.includes('Utilizatorul există deja')) {
        throw dbErr;
      }
    }
  }

  // 2. Persist in localStorage for instant login
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObj));
  return userObj;
};

export const loginPilot = async (shortLogin, shortPassword) => {
  const username = (shortLogin || '').trim();
  const rawPass = (shortPassword || '').trim();

  if (!username) {
    throw new Error('Te rugăm să introduci login-ul!');
  }
  if (!rawPass) {
    throw new Error('Te rugăm să introduci parola!');
  }

  const safeUid = sanitizeKey(username);

  let displayName = username;

  if (rtdb) {
    try {
      const userCredRef = ref(rtdb, 'users/' + safeUid);
      const snap = await Promise.race([
        get(userCredRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
      ]).catch(() => null);

      if (snap && snap.exists()) {
        const val = snap.val();
        if (val.password && val.password !== rawPass) {
          throw new Error('Parolă incorectă pentru utilizatorul ' + username + '!');
        }
        if (val.displayName) {
          displayName = val.displayName;
        }
      } else {
        // If account doesn't exist yet, auto-create it seamlessly!
        await set(userCredRef, {
          username: username,
          password: rawPass,
          displayName: username,
          createdAt: Date.now()
        });
      }
    } catch (e) {
      if (e.message.includes('Parolă incorectă')) {
        throw e;
      }
      console.warn('Login check notice:', e.message);
    }
  }

  const userObj = {
    uid: safeUid,
    username: username,
    displayName: displayName,
    lastLogin: Date.now()
  };

  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObj));
  return userObj;
};

export const logoutPilot = async () => {
  localStorage.removeItem(LOCAL_USER_KEY);
};

export const resetPilotPassword = async (email) => {
  console.log('Password reset requested for:', email);
};

// Realtime sync for flight data
export const subscribeToFlightData = (uid, onData, onError) => {
  if (!uid) return;
  const safeUid = sanitizeKey(uid);

  if (rtdb) {
    try {
      const userRef = ref(rtdb, 'pilots/' + safeUid);
      const unsubscribeRTDB = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          onData(val);
          localStorage.setItem(LOCAL_DATA_KEY + '_' + safeUid, JSON.stringify(val));
        } else {
          // Initialize flight document
          const initData = { ...defaultFlightData, uid: safeUid };
          set(userRef, initData);
          onData(initData);
        }
      }, (error) => {
        console.warn('RTDB onValue error:', error);
        loadLocal();
        if (onError) onError(error);
      });

      return () => unsubscribeRTDB();
    } catch (err) {
      console.warn('RTDB subscribe error:', err);
      loadLocal();
    }
  } else {
    loadLocal();
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_DATA_KEY + '_' + safeUid);
      if (raw) {
        onData(JSON.parse(raw));
      } else {
        localStorage.setItem(LOCAL_DATA_KEY + '_' + safeUid, JSON.stringify(defaultFlightData));
        onData(defaultFlightData);
      }
    } catch (e) {
      onData(defaultFlightData);
    }
  }
};

// Update flight data
export const updatePilotData = async (uid, dataToUpdate) => {
  if (!uid) return;
  const safeUid = sanitizeKey(uid);

  // 1. Realtime Database update
  if (rtdb) {
    try {
      const userRef = ref(rtdb, 'pilots/' + safeUid);
      await update(userRef, {
        ...dataToUpdate,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('RTDB update error:', e);
    }
  }

  // 2. LocalStorage backup
  try {
    const raw = localStorage.getItem(LOCAL_DATA_KEY + '_' + safeUid);
    const existing = raw ? JSON.parse(raw) : defaultFlightData;
    const updated = { ...existing, ...dataToUpdate };
    localStorage.setItem(LOCAL_DATA_KEY + '_' + safeUid, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('LocalStorage update error:', e);
  }
};

// Increment flight (+1 "Am dat cursa")
export const recordFlightCompleted = async (uid, currentData) => {
  const nextCount = (currentData.currentFlights || 0) + 1;
  const pay = currentData.payPerFlight || 5000;
  
  const newFlightRecord = {
    id: 'fl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    flightNumber: nextCount,
    timestamp: Date.now(),
    plane: currentData.selectedPlane || '1. Cucuruznic',
    route: currentData.selectedRoute || 'Cursa 1 - Standard',
    pay: pay
  };

  const updatedHistory = [newFlightRecord, ...(currentData.history || [])].slice(0, 500);
  const updatedData = {
    currentFlights: nextCount,
    totalLifetimeFlights: (currentData.totalLifetimeFlights || 0) + 1,
    totalLifetimeEarnings: (currentData.totalLifetimeEarnings || 0) + pay,
    history: updatedHistory,
    selectedPlane: currentData.selectedPlane || '1. Cucuruznic',
    selectedRoute: currentData.selectedRoute || 'Cursa 1 - Standard',
    payPerFlight: pay,
    targetFlights: currentData.targetFlights || 50
  };

  await updatePilotData(uid, updatedData);
  return { nextCount, newFlightRecord };
};

// Undo last flight (-1)
export const undoLastFlightRecord = async (uid, currentData) => {
  if (!currentData || currentData.currentFlights <= 0) return;
  const nextCount = Math.max(0, currentData.currentFlights - 1);
  const pay = currentData.payPerFlight || 5000;
  
  const updatedHistory = (currentData.history || []).slice(1);
  const updatedData = {
    currentFlights: nextCount,
    totalLifetimeFlights: Math.max(0, (currentData.totalLifetimeFlights || 0) - 1),
    totalLifetimeEarnings: Math.max(0, (currentData.totalLifetimeEarnings || 0) - pay),
    history: updatedHistory
  };

  await updatePilotData(uid, updatedData);
};

// Reset current shift to 0
export const resetCurrentShift = async (uid, currentData) => {
  const updatedData = {
    currentFlights: 0,
    shiftStartTime: Date.now(),
    history: []
  };

  await updatePilotData(uid, updatedData);
};
