
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, Heart, Droplets, MapPin, Phone, HelpCircle, Utensils } from 'lucide-react';

const QuickPhrases = () => {
  const [lastSpoken, setLastSpoken] = useState<string>('');

  const phrases = [
    { text: "Help me please", icon: HelpCircle, color: "bg-red-500 hover:bg-red-600", urgent: true },
    { text: "I need water", icon: Droplets, color: "bg-blue-500 hover:bg-blue-600" },
    { text: "Where is the bathroom?", icon: MapPin, color: "bg-green-500 hover:bg-green-600" },
    { text: "Call someone", icon: Phone, color: "bg-purple-500 hover:bg-purple-600", urgent: true },
    { text: "I'm in pain", icon: Heart, color: "bg-orange-500 hover:bg-orange-600", urgent: true },
    { text: "I'm hungry", icon: Utensils, color: "bg-yellow-500 hover:bg-yellow-600" },
  ];

  const speakText = (text: string, urgent: boolean = false) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = urgent ? 1.2 : 1.0;
      utterance.volume = urgent ? 1.0 : 0.8;
      utterance.pitch = urgent ? 1.1 : 1.0;
      
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      
      setLastSpoken(text);
      
      // Clear the last spoken after 3 seconds
      setTimeout(() => setLastSpoken(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quick Phrases</h2>
        <Volume2 className="h-6 w-6 text-gray-600" />
      </div>
      
      {lastSpoken && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-medium">🔊 "{lastSpoken}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {phrases.map((phrase, index) => {
          const IconComponent = phrase.icon;
          return (
            <Button
              key={index}
              onClick={() => speakText(phrase.text, phrase.urgent)}
              className={`h-20 ${phrase.color} text-white font-semibold flex flex-col items-center justify-center space-y-2 rounded-lg shadow-md transition-all duration-200 hover:scale-105 ${
                phrase.urgent ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-sm text-center leading-tight">{phrase.text}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">Tap any button to speak instantly</p>
      </div>
    </div>
  );
};

export default QuickPhrases;
