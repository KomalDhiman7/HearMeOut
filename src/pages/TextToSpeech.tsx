import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, AlertTriangle, Heart, Zap, Save, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeEmotion, shouldTriggerEmergency } from '../utils/emotion';

const TextToSpeech: React.FC = () => {
  const { speakText, settings, activateEmergencyMode, isEmergencyMode } = useApp();
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<any>(null);
  const [savedTexts, setSavedTexts] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-analyze emotion as user types
    if (text.length > 10) {
      const analysis = analyzeEmotion(text);
      setEmotion(analysis);
      
      // Check if emergency mode should be triggered
      if (shouldTriggerEmergency(analysis) && !isEmergencyMode) {
        activateEmergencyMode();
      }
    } else {
      setEmotion(null);
    }
  }, [text, isEmergencyMode, activateEmergencyMode]);

  const handleSpeak = async () => {
    if (!text.trim()) return;

    setIsSpeaking(true);
    const urgent = emotion?.urgency === 'critical' || emotion?.urgency === 'high';
    
    await speakText(text, { urgent });
    
    // Speech synthesis doesn't have a direct way to know when it's done
    // So we'll simulate it based on text length
    const estimatedDuration = Math.max(text.length * 50, 2000);
    setTimeout(() => {
      setIsSpeaking(false);
    }, estimatedDuration);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSave = () => {
    if (text.trim() && !savedTexts.includes(text.trim())) {
      setSavedTexts([...savedTexts, text.trim()]);
    }
  };

  const handleLoadSaved = (savedText: string) => {
    setText(savedText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDeleteSaved = (index: number) => {
    setSavedTexts(savedTexts.filter((_, i) => i !== index));
  };

  const getEmotionColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getEmotionIcon = (emotionType: string) => {
    switch (emotionType) {
      case 'angry': return '😠';
      case 'fearful': return '😰';
      case 'sad': return '😢';
      case 'happy': return '😊';
      case 'surprised': return '😮';
      case 'disgusted': return '🤢';
      default: return '😐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Text to Speech
          </h1>
          <p className="text-lg text-gray-600">
            Type and speak with emotion detection
          </p>
        </div>

        {/* Main Input Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="text-input" className="block text-lg font-medium text-gray-900 mb-2">
              Enter your message
            </label>
            <textarea
              ref={textareaRef}
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type what you want to say..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
              autoFocus
            />
          </div>

          {/* Emotion Analysis */}
          {emotion && (
            <div className={`mb-4 p-4 rounded-lg border ${getEmotionColor(emotion.urgency)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getEmotionIcon(emotion.emotion)}</span>
                  <span className="font-medium">
                    {emotion.emotion} ({emotion.urgency} urgency)
                  </span>
                </div>
                <span className="text-sm">{emotion.confidence}% confident</span>
              </div>
              {emotion.keywords.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Keywords detected: </span>
                  {emotion.keywords.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSpeak}
              disabled={!text.trim() || isSpeaking}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                !text.trim() || isSpeaking
                  ? 'bg-gray-300 cursor-not-allowed'
                  : emotion?.urgency === 'critical'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : emotion?.urgency === 'high'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Speak</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <VolumeX className="w-5 h-5" />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                !text.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>Save</span>
            </button>

            <button
              onClick={() => setText('')}
              disabled={!text.trim()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                !text.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Phrases */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Phrases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Thank you',
              'Please help me',
              'I need assistance',
              'Water please',
              'Where is the bathroom?',
              'I understand',
              'Please repeat',
              'I am deaf',
              'Can you write it down?',
              'Call someone',
              'I am in pain',
              'Emergency',
            ].map((phrase, index) => (
              <button
                key={index}
                onClick={() => setText(phrase)}
                className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Messages */}
        {savedTexts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Messages</h2>
            <div className="space-y-3">
              {savedTexts.map((savedText, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm text-gray-700 truncate mr-4">
                    {savedText}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleLoadSaved(savedText)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors duration-200"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(index)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How Emotion Detection Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Urgency Levels</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• <span className="text-red-600">Critical:</span> Emergency situations</li>
                <li>• <span className="text-orange-600">High:</span> Important needs</li>
                <li>• <span className="text-yellow-600">Medium:</span> Preferences</li>
                <li>• <span className="text-green-600">Low:</span> Casual communication</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Features</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Real-time emotion analysis</li>
                <li>• Automatic emergency mode trigger</li>
                <li>• Adjustable voice speed and volume</li>
                <li>• Save frequently used phrases</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;