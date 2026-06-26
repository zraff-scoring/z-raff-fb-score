import { useEffect, useState } from 'react';
import ControlPanel from './components/ControlPanel.js';
import GraphicsOutput from './components/GraphicsOutput.js';
import Login from './components/Login.js';
import ProfileSetup from './components/ProfileSetup.js';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user, userProfile, loading, profileLoading } = useAuth();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // OBS Overlay output is publicly accessible without login requirements
  if (currentPath.includes('/output')) {
    return <GraphicsOutput />;
  }

  // Show a premium, seamless spinner when loading the user session or profile
  if (loading || (user && profileLoading && !userProfile)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-mono tracking-wider uppercase animate-pulse">
          Loading Operator Console...
        </p>
      </div>
    );
  }

  // Require Google Sign-In for operator console
  if (!user) {
    return <Login />;
  }

  // Force Profile Setup if not completed yet
  if (!userProfile || !userProfile.setupCompleted) {
    return <ProfileSetup />;
  }

  return <ControlPanel />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
