
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, Heart, X, Volume2 } from 'lucide-react';

interface EmergencyModeProps {
  onExit: () => void;
}

const EmergencyMode = ({ onExit }: EmergencyModeProps) => {
  const [countdown, setCountdown] = useState(10);
  const [autoCallActive, setAutoCallActive] = useState(false);

  useEffect(() => {
    // Speak emergency message immediately
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Emergency mode activated. Help is needed.');
      utterance.rate = 1.2;
      utterance.volume = 1.0;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }

    // Flash the screen
    document.body.style.backgroundColor = '#fee2e2';
    const interval = setInterval(() => {
      document.body.style.backgroundColor = document.body.style.backgroundColor === 'rgb(254, 226, 226)' ? '#fef2f2' : '#fee2e2';
    }, 500);

    return () => {
      clearInterval(interval);
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    if (autoCallActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoCallActive && countdown === 0) {
      // In a real app, this would trigger emergency services
      alert('Emergency services would be contacted now (simulation)');
      setAutoCallActive(false);
    }
  }, [countdown, autoCallActive]);

  const emergencyPhrases = [
    { text: "I need immediate help", icon: AlertTriangle, priority: 1 },
    { text: "Call 911 emergency", icon: Phone, priority: 1 },
    { text: "I'm having chest pain", icon: Heart, priority: 1 },
    { text: "I can't breathe properly", icon: Heart, priority: 1 },
    { text: "I'm lost and need directions", icon: MapPin, priority: 2 },
    { text: "Please get a manager", icon: AlertTriangle, priority: 2 },
  ];

  const speakPhrase = (text: string, priority: number) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = priority === 1 ? 1.3 : 1.1;
      utterance.volume = 1.0;
      utterance.pitch = priority === 1 ? 1.2 : 1.0;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const startAutoCall = () => {
    setAutoCallActive(true);
    setCountdown(10);
  };

  const cancelAutoCall = () => {
    setAutoCallActive(false);
    setCountdown(10);
  };

  return (
    <div className="min-h-screen bg-red-50 p-4 relative overflow-hidden">
      {/* Animated border */}
      <div className="absolute inset-0 border-8 border-red-500 animate-pulse"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600 animate-bounce" />
            <h1 className="text-3xl font-bold text-red-800">EMERGENCY MODE</h1>
          </div>
          <Button
            onClick={onExit}
            variant="ghost"
            className="text-red-600 hover:bg-red-100"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Auto-call section */}
        <div className="bg-white border-4 border-red-500 rounded-xl p-6 mb-6 shadow-2xl">
          <div className="text-center">
            {!autoCallActive ? (
              <div>
                <h2 className="text-2xl font-bold text-red-800 mb-4">Need Emergency Services?</h2>
                <Button
                  onClick={startAutoCall}
                  className="bg-red-600 hover:bg-red-700 text-white text-xl font-bold h-16 px-8 rounded-xl shadow-lg animate-pulse"
                >
                  <Phone className="h-6 w-6 mr-3" />
                  Auto-Call Emergency Services
                </Button>
                <p className="text-sm text-gray-600 mt-3">Will call 911 after 10 second countdown</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-red-800 mb-4">Calling Emergency Services In</h2>
                <div className="text-6xl font-bold text-red-600 mb-4 animate-pulse">
                  {countdown}
                </div>
                <Button
                  onClick={cancelAutoCall}
                  variant="outline"
                  className="border-2 border-red-500 text-red-600 hover:bg-red-50 text-lg font-semibold h-12 px-6"
                >
                  Cancel Call
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Emergency phrases */}
        <div className="bg-white border-4 border-orange-400 rounded-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Emergency Communication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyPhrases.map((phrase, index) => {
              const IconComponent = phrase.icon;
              return (
                <Button
                  key={index}
                  onClick={() => speakPhrase(phrase.text, phrase.priority)}
                  className={`h-20 font-semibold text-white flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 ${
                    phrase.priority === 1 
                      ? 'bg-red-600 hover:bg-red-700 border-4 border-red-300' 
                      : 'bg-orange-500 hover:bg-orange-600 border-2 border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5" />
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-center leading-tight">{phrase.text}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
          <p className="text-lg font-semibold text-yellow-800">
            🔊 Tap any button to speak immediately • Screen is flashing to get attention
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;
