
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Volume2, AlertTriangle, Heart, Zap } from 'lucide-react';

interface TextToSpeechProps {
  onBack: () => void;
}

const TextToSpeech = ({ onBack }: TextToSpeechProps) => {
  const [text, setText] = useState('');
  const [isEmotionDetected, setIsEmotionDetected] = useState(false);
  const [emotionType, setEmotionType] = useState<'urgent' | 'distress' | 'pain' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Simple emotion/urgency detection
  useEffect(() => {
    const urgentWords = ['help', 'emergency', 'urgent', 'pain', 'hurt', 'can\'t breathe', 'dizzy', 'chest pain', 'please', 'now', 'immediately'];
    const distressWords = ['scared', 'afraid', 'panic', 'anxious', 'worried', 'frightened'];
    const painWords = ['pain', 'hurt', 'ache', 'burning', 'sharp', 'throbbing', 'severe'];

    const lowerText = text.toLowerCase();
    
    let detected = false;
    let type: 'urgent' | 'distress' | 'pain' | null = null;

    if (urgentWords.some(word => lowerText.includes(word))) {
      detected = true;
      type = 'urgent';
    } else if (painWords.some(word => lowerText.includes(word))) {
      detected = true;
      type = 'pain';
    } else if (distressWords.some(word => lowerText.includes(word))) {
      detected = true;
      type = 'distress';
    }

    setIsEmotionDetected(detected);
    setEmotionType(type);
  }, [text]);

  const speakText = () => {
    if (!text.trim()) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Adjust speech based on emotion detection
      if (isEmotionDetected) {
        utterance.rate = 1.1;
        utterance.volume = 1.0;
        utterance.pitch = emotionType === 'urgent' ? 1.2 : 0.9;
      } else {
        utterance.rate = 1.0;
        utterance.volume = 0.8;
        utterance.pitch = 1.0;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const getEmotionIcon = () => {
    switch (emotionType) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pain':
        return <Heart className="h-5 w-5 text-orange-600" />;
      case 'distress':
        return <Zap className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getEmotionMessage = () => {
    switch (emotionType) {
      case 'urgent':
        return 'Urgent message detected - prioritizing speech';
      case 'pain':
        return 'Pain/discomfort detected - adjusting tone';
      case 'distress':
        return 'Emotional distress detected - speaking calmly';
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Type to Speak</h2>
        <div className="w-20"></div>
      </div>

      {isEmotionDetected && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-3">
          {getEmotionIcon()}
          <div>
            <p className="font-medium text-gray-800">Emotion Detected</p>
            <p className="text-sm text-gray-600">{getEmotionMessage()}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here... I'll speak it out loud for you."
          className={`min-h-32 text-lg resize-none ${
            isEmotionDetected ? 'border-yellow-300 focus:border-yellow-500' : ''
          }`}
          autoFocus
        />

        <div className="flex space-x-4">
          <Button
            onClick={speakText}
            disabled={!text.trim() || isSpeaking}
            className={`flex-1 h-14 text-lg font-semibold flex items-center justify-center space-x-3 ${
              isEmotionDetected 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg shadow-md transition-all duration-200`}
          >
            <Volume2 className={`h-6 w-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span>{isSpeaking ? 'Speaking...' : 'Speak'}</span>
          </Button>

          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              className="h-14 px-6 border-2 border-gray-300 hover:border-gray-400"
            >
              Stop
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isEmotionDetected 
              ? 'Priority message - will speak with emphasis' 
              : 'Type and tap Speak to convert text to speech'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
