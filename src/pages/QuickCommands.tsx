import React, { useState, useEffect } from 'react';
import { Zap, Volume2, Plus, Heart, AlertTriangle, Home, Coffee, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loadOfflinePhrases } from '../utils/storage';

const QuickCommands: React.FC = () => {
  const { speakText, settings, isEmergencyMode } = useApp();
  const [customPhrases, setCustomPhrases] = useState<string[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [isAddingPhrase, setIsAddingPhrase] = useState(false);
  const [offlinePhrases, setOfflinePhrases] = useState<string[]>([]);

  useEffect(() => {
    const phrases = loadOfflinePhrases();
    setOfflinePhrases(phrases);
    setCustomPhrases(settings.savedPhrases.map(p => p.text));
  }, [settings.savedPhrases]);

  const defaultCommands = [
    { text: 'Help me', icon: AlertTriangle, color: 'bg-red-600 hover:bg-red-700', urgent: true },
    { text: 'Thank you', icon: Heart, color: 'bg-green-600 hover:bg-green-700' },
    { text: 'Water please', icon: Coffee, color: 'bg-blue-600 hover:bg-blue-700' },
    { text: 'Where is the bathroom?', icon: Home, color: 'bg-purple-600 hover:bg-purple-700' },
    { text: 'I need assistance', icon: Zap, color: 'bg-orange-600 hover:bg-orange-700' },
    { text: 'Emergency', icon: AlertTriangle, color: 'bg-red-700 hover:bg-red-800', urgent: true },
    { text: 'I cannot speak', icon: Volume2, color: 'bg-gray-600 hover:bg-gray-700' },
    { text: 'Please call someone', icon: Car, color: 'bg-indigo-600 hover:bg-indigo-700' },
  ];

  const handleSpeak = async (text: string, urgent: boolean = false) => {
    await speakText(text, { urgent });
  };

  const handleAddPhrase = () => {
    if (newPhrase.trim()) {
      setCustomPhrases([...customPhrases, newPhrase.trim()]);
      setNewPhrase('');
      setIsAddingPhrase(false);
      // In a real app, you'd save this to user preferences
    }
  };

  const CommandButton: React.FC<{ 
    text: string; 
    icon: React.ElementType; 
    color: string; 
    urgent?: boolean;
    size?: 'normal' | 'large';
  }> = ({ text, icon: Icon, color, urgent = false, size = 'normal' }) => (
    <button
      onClick={() => handleSpeak(text, urgent)}
      className={`${color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 ${
        size === 'large' ? 'p-6 text-lg' : 'p-4'
      } ${urgent ? 'ring-2 ring-red-300 animate-pulse' : ''}`}
    >
      <div className="flex flex-col items-center space-y-2">
        <Icon className={`${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'}`} />
        <span className="font-medium text-center">{text}</span>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Quick Commands
          </h1>
          <p className="text-lg text-gray-600">
            Tap any button to speak instantly
          </p>
        </div>

        {/* Emergency Commands */}
        {isEmergencyMode && (
          <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Emergency Commands
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {defaultCommands.filter(cmd => cmd.urgent).map((command, index) => (
                <CommandButton
                  key={index}
                  text={command.text}
                  icon={command.icon}
                  color={command.color}
                  urgent={command.urgent}
                  size="large"
                />
              ))}
            </div>
          </div>
        )}

        {/* Default Commands */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Essential Phrases
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {defaultCommands.map((command, index) => (
              <CommandButton
                key={index}
                text={command.text}
                icon={command.icon}
                color={command.color}
                urgent={command.urgent}
              />
            ))}
          </div>
        </div>

        {/* Custom Phrases */}
        {customPhrases.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your Custom Phrases
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {customPhrases.map((phrase, index) => (
                <CommandButton
                  key={index}
                  text={phrase}
                  icon={Volume2}
                  color="bg-gray-600 hover:bg-gray-700"
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Phrase */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Add Custom Phrase
          </h2>
          {isAddingPhrase ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                placeholder="Enter your phrase..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleAddPhrase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingPhrase(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingPhrase(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Phrase</span>
            </button>
          )}
        </div>

        {/* Offline Phrases */}
        {navigator.onLine === false && (
          <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">
              Offline Mode - Essential Phrases
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {offlinePhrases.slice(0, 12).map((phrase, index) => (
                <CommandButton
                  key={index}
                  text={phrase}
                  icon={Volume2}
                  color="bg-yellow-600 hover:bg-yellow-700"
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How to Use Quick Commands
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Tap any button to speak the phrase immediately</li>
            <li>• Emergency commands are highlighted in red and speak with urgency</li>
            <li>• Add your own custom phrases for personalized communication</li>
            <li>• Essential phrases work offline for reliable access</li>
            <li>• Voice speed and volume can be adjusted in Settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuickCommands;