
import { useState } from 'react';
import { Mic, Camera, Type, Zap, Phone, Heart, Droplets, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import QuickPhrases from '@/components/QuickPhrases';
import TextToSpeech from '@/components/TextToSpeech';
import ASLDetector from '@/components/ASLDetector';
import EmergencyMode from '@/components/EmergencyMode';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'home' | 'text' | 'asl' | 'emergency'>('home');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const activateEmergency = () => {
    setIsEmergencyActive(true);
    setActiveMode('emergency');
  };

  if (activeMode === 'emergency') {
    return <EmergencyMode onExit={() => { setActiveMode('home'); setIsEmergencyActive(false); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Emergency Button - Always Visible */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={activateEmergency}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg animate-pulse"
          size="lg"
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            HearMeOut
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Your instant voice when you need it most. No signup required.
          </p>
        </div>

        {activeMode === 'home' && (
          <div className="space-y-8">
            {/* Quick Emergency Phrases */}
            <QuickPhrases />

            {/* Main Communication Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={() => setActiveMode('text')}
                className="h-32 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold flex flex-col items-center justify-center space-y-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Type className="h-8 w-8" />
                <span>Type to Speak</span>
              </Button>

              <Button
                onClick={() => setActiveMode('asl')}
                className="h-32 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold flex flex-col items-center justify-center space-y-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Camera className="h-8 w-8" />
                <span>Sign Language</span>
              </Button>
            </div>

          
              </div>
          
       
        )}

        {activeMode === 'text' && (
          <TextToSpeech onBack={() => setActiveMode('home')} />
        )}

        {activeMode === 'asl' && (
          <ASLDetector onBack={() => setActiveMode('home')} />
        )}
      </div>
    </div>
  );
};

export default Index;
