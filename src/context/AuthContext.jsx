import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isFirebaseConfigured, 
  registerPilot, 
  loginPilot, 
  logoutPilot,
  resetPilotPassword 
} from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('flyus_local_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const signup = async (shortLogin, shortPassword, pilotName) => {
    const newUser = await registerPilot(shortLogin, shortPassword, pilotName);
    setUser(newUser);
    return newUser;
  };

  const login = async (shortLogin, shortPassword) => {
    const loggedUser = await loginPilot(shortLogin, shortPassword);
    setUser(loggedUser);
    return loggedUser;
  };

  const loginDemo = async () => {
    const demoUser = {
      uid: 'user_demo_' + Math.random().toString(36).substr(2, 6),
      username: 'pilot_demo',
      displayName: 'Pilot LSIA',
      isLocal: true
    };
    localStorage.setItem('flyus_local_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    await logoutPilot();
    setUser(null);
  };

  const resetPassword = async (email) => {
    return await resetPilotPassword(email);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isFirebaseConfigured,
      signup,
      login,
      loginDemo,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
