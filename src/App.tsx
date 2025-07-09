import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import ASLCamera from './pages/ASLCamera';
import TextToSpeech from './pages/TextToSpeech';
import QuickCommands from './pages/QuickCommands';
import KioskMode from './pages/KioskMode';
import EmergencyMode from './pages/EmergencyMode';
import Settings from './pages/Settings';
import Training from './pages/Training';
import { AppProvider } from './context/AppContext';
import { initializeOfflineData } from './utils/offline';
import './styles/accessibility.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize offline data and app
    const initApp = async () => {
      await initializeOfflineData();
      setIsLoading(false);
    };
    
    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading HearMeOut...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/asl" element={<ASLCamera />} />
              <Route path="/text" element={<TextToSpeech />} />
              <Route path="/quick" element={<QuickCommands />} />
              <Route path="/kiosk" element={<KioskMode />} />
              <Route path="/emergency" element={<EmergencyMode />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/training" element={<Training />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;