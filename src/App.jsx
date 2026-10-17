import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { 
  subscribeToFlightData, 
  recordFlightCompleted, 
  undoLastFlightRecord, 
  updatePilotData, 
  resetCurrentShift,
  defaultFlightData 
} from './services/firebase';
import Navbar from './components/Navbar';
import FlightTrackerCard from './components/FlightTrackerCard';
import AuthModal from './components/AuthModal';
import FirebaseModal from './components/FirebaseModal';
import FlightSettingsModal from './components/FlightSettingsModal';
import FlightHistoryDrawer from './components/FlightHistoryDrawer';
import CelebrationModal from './components/CelebrationModal';
import { Plane, Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  
  const [flightData, setFlightData] = useState(defaultFlightData);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Subscribe to realtime flight data for the logged-in pilot
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToFlightData(user.uid, (data) => {
      if (data) {
        setFlightData(data);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

  // Handle +1 flight ("AM DAT CURSA")
  const handleRecordFlight = async () => {
    if (!user) return;
    try {
      const { nextCount } = await recordFlightCompleted(user.uid, flightData);
      // Check if user hit the target
      if (nextCount === (flightData.targetFlights || 50)) {
        setIsCelebrationOpen(true);
      }
    } catch (err) {
      console.error('Error recording flight:', err);
    }
  };

  // Handle -1 flight (undo)
  const handleUndoFlight = async () => {
    if (!user) return;
    try {
      await undoLastFlightRecord(user.uid, flightData);
    } catch (err) {
      console.error('Error undoing flight:', err);
    }
  };

  // Handle settings update
  const handleUpdateData = async (updatedFields) => {
    if (!user) return;
    try {
      await updatePilotData(user.uid, updatedFields);
    } catch (err) {
      console.error('Error updating flight settings:', err);
    }
  };

  // Handle shift reset
  const handleResetShift = async () => {
    if (!user) return;
    try {
      await resetCurrentShift(user.uid, flightData);
    } catch (err) {
      console.error('Error resetting shift:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 animate-pulse">
          <Plane className="w-10 h-10 transform -rotate-45" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Se inițializează dispeceratul FlyUS...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show Pilot Login / Register screen
  if (!user) {
    return (
      <>
        <AuthModal onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)} />
        <FirebaseModal 
          isOpen={isFirebaseModalOpen} 
          onClose={() => setIsFirebaseModalOpen(false)} 
        />
      </>
    );
  }

  // Calculate shift duration string
  const diffSecs = Math.max(0, Math.floor((Date.now() - (flightData.shiftStartTime || Date.now())) / 1000));
  const hrs = Math.floor(diffSecs / 3600);
  const mins = Math.floor((diffSecs % 3600) / 60);
  const elapsedStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        flightData={flightData}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        <FlightTrackerCard
          flightData={flightData}
          onRecordFlight={handleRecordFlight}
          onUndoFlight={handleUndoFlight}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          soundEnabled={soundEnabled}
        />
      </main>

      {/* Modals & Drawers */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      <FlightSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        flightData={flightData}
        onUpdateData={handleUpdateData}
        onResetShift={handleResetShift}
      />

      <FlightHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={flightData.history || []}
        totalLifetimeFlights={flightData.totalLifetimeFlights || 0}
        totalLifetimeEarnings={flightData.totalLifetimeEarnings || 0}
      />

      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        targetFlights={flightData.targetFlights || 50}
        totalEarned={(flightData.currentFlights || 0) * (flightData.payPerFlight || 5000)}
        elapsedTimeStr={elapsedStr}
        onStartNewShift={() => {
          handleResetShift();
          setIsCelebrationOpen(false);
        }}
        soundEnabled={soundEnabled}
      />

    </div>
  );
}
