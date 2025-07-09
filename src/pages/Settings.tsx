import React, { useState } from 'react';
import { Settings as SettingsIcon, Volume2, Globe, Palette, Shield, User, Save, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings: React.FC = () => {
  const { settings, updateSettings, user, isAuthenticated } = useApp();
  const [tempSettings, setTempSettings] = useState(settings);
  const [newPhrase, setNewPhrase] = useState('');
  const [newCommand, setNewCommand] = useState('');

  const handleSaveSettings = async () => {
    await updateSettings(tempSettings);
    alert('Settings saved successfully!');
  };

  const handleAddPhrase = () => {
    if (newPhrase.trim()) {
      const newSavedPhrase = {
        id: Date.now().toString(),
        text: newPhrase.trim(),
        category: 'personal' as const,
        frequency: 0,
        createdAt: new Date().toISOString(),
      };
      
      setTempSettings({
        ...tempSettings,
        savedPhrases: [...tempSettings.savedPhrases, newSavedPhrase]
      });
      setNewPhrase('');
    }
  };

  const handleRemovePhrase = (phraseId: string) => {
    setTempSettings({
      ...tempSettings,
      savedPhrases: tempSettings.savedPhrases.filter(p => p.id !== phraseId)
    });
  };

  const handleAddQuickCommand = () => {
    if (newCommand.trim() && !tempSettings.preferredQuickCommands.includes(newCommand.trim())) {
      setTempSettings({
        ...tempSettings,
        preferredQuickCommands: [...tempSettings.preferredQuickCommands, newCommand.trim()]
      });
      setNewCommand('');
    }
  };

  const handleRemoveQuickCommand = (command: string) => {
    setTempSettings({
      ...tempSettings,
      preferredQuickCommands: tempSettings.preferredQuickCommands.filter(c => c !== command)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Customize your HearMeOut experience
          </p>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2" />
              Account
            </h2>
          </div>
          
          {isAuthenticated ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium">
                    Signed in as {user?.name}
                  </p>
                  <p className="text-green-600 text-sm">{user?.email}</p>
                  <p className="text-green-600 text-sm mt-1">
                    Your preferences are automatically saved
                  </p>
                </div>
                <div className="text-right text-sm text-green-600">
                  <p>Saved phrases: {tempSettings.savedPhrases.length}</p>
                  <p>Quick commands: {tempSettings.preferredQuickCommands.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                You're using HearMeOut as a guest. Sign in to save your preferences and phrases across devices.
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Settings will be saved locally but won't sync between devices.
              </p>
            </div>
          )}
        </div>

        {/* Voice Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Volume2 className="w-6 h-6 mr-2" />
            Voice Settings
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speech Speed: {tempSettings.voiceSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={tempSettings.voiceSpeed}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  voiceSpeed: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume: {Math.round(tempSettings.voiceVolume * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={tempSettings.voiceVolume}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  voiceVolume: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10% (Quiet)</span>
                <span>50% (Normal)</span>
                <span>100% (Loud)</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance('This is a test of your voice settings. How does this sound?');
                  utterance.rate = tempSettings.voiceSpeed;
                  utterance.volume = tempSettings.voiceVolume;
                  utterance.lang = tempSettings.language;
                  window.speechSynthesis.speak(utterance);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Test Voice Settings
              </button>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-6 h-6 mr-2" />
            Language Settings
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              value={tempSettings.language}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                language: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
          </div>
        </div>

        {/* Saved Phrases */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Saved Phrases
          </h2>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                placeholder="Add a new phrase..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddPhrase()}
              />
              <button
                onClick={handleAddPhrase}
                disabled={!newPhrase.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tempSettings.savedPhrases.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No saved phrases yet</p>
            ) : (
              tempSettings.savedPhrases.map((phrase) => (
                <div key={phrase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-gray-800">{phrase.text}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {phrase.category} • Used {phrase.frequency} times
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePhrase(phrase.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Commands
          </h2>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                placeholder="Add a new quick command..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddQuickCommand()}
              />
              <button
                onClick={handleAddQuickCommand}
                disabled={!newCommand.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tempSettings.preferredQuickCommands.map((command, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="flex-1 text-sm text-gray-800">{command}</span>
                <button
                  onClick={() => handleRemoveQuickCommand(command)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Accessibility Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={tempSettings.theme}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  theme: e.target.value as 'light' | 'dark' | 'high-contrast'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="high-contrast">High Contrast</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="accessibilityMode"
                checked={tempSettings.accessibilityMode}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  accessibilityMode: e.target.checked
                })}
                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="accessibilityMode" className="text-sm text-gray-700">
                Enable enhanced accessibility features (larger buttons, high contrast)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="offlineMode"
                checked={tempSettings.offlineMode}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  offlineMode: e.target.checked
                })}
                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="offlineMode" className="text-sm text-gray-700">
                Prioritize offline functionality (preload essential phrases)
              </label>
            </div>
          </div>
        </div>

        {/* Save Settings */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>

        {!isAuthenticated && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-800 mb-2">
              Want to save your settings across devices?
            </p>
            <p className="text-blue-600 text-sm">
              Sign in to sync your preferences, saved phrases, and quick commands.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;