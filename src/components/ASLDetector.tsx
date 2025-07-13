
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, CameraOff, Volume2, Eye } from 'lucide-react';

interface ASLDetectorProps {
  onBack: () => void;
}

const ASLDetector = ({ onBack }: ASLDetectorProps) => {
  const [isActive, setIsActive] = useState(false);
  const [detectedSign, setDetectedSign] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [translatedText, setTranslatedText] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock ASL detection (in real app, this would use MediaPipe/OpenCV)
  const mockSigns = [
    'Hello', 'Thank you', 'Help', 'Water', 'Bathroom', 'Please', 'Yes', 'No', 
    'Pain', 'Medicine', 'Doctor', 'Emergency', 'I need', 'Where is'
  ];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        
        // Mock detection loop
        const detectLoop = setInterval(() => {
          if (Math.random() > 0.7) { // 30% chance of detection
            const randomSign = mockSigns[Math.floor(Math.random() * mockSigns.length)];
            const randomConfidence = 0.7 + Math.random() * 0.3;
            
            setDetectedSign(randomSign);
            setConfidence(randomConfidence);
            
            // Build translated text
            setTranslatedText(prev => {
              const newText = prev ? `${prev} ${randomSign}` : randomSign;
              return newText.split(' ').slice(-10).join(' '); // Keep last 10 words
            });
          }
        }, 2000);
        
        // Clean up interval when component unmounts or camera stops
        return () => clearInterval(detectLoop);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setDetectedSign('');
    setConfidence(0);
  }, []);

  const speakTranslation = () => {
    if (!translatedText.trim()) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.rate = 1.0;
      utterance.volume = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const clearTranslation = () => {
    setTranslatedText('');
    setDetectedSign('');
    setConfidence(0);
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
        <h2 className="text-2xl font-bold text-gray-800">Sign Language</h2>
        <div className="w-20"></div>
      </div>

      <div className="space-y-6">
        {/* Camera Feed */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
          />
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Camera not active</p>
                <p className="text-sm opacity-75">Tap "Start Camera" to begin</p>
              </div>
            </div>
          )}

          {/* Detection Overlay */}
          {isActive && detectedSign && (
            <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{detectedSign}</span>
                <span className="text-sm opacity-90">({Math.round(confidence * 100)}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex space-x-4">
          {!isActive ? (
            <Button
              onClick={startCamera}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>Start Camera</span>
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              variant="outline"
              className="flex-1 h-12 border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold flex items-center justify-center space-x-2"
            >
              <CameraOff className="h-5 w-5" />
              <span>Stop Camera</span>
            </Button>
          )}
        </div>

        {/* Translation Output */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Translation</h3>
          <div className="min-h-16 bg-white rounded p-3 mb-4 border">
            {translatedText ? (
              <p className="text-lg text-gray-800">{translatedText}</p>
            ) : (
              <p className="text-gray-500 italic">Sign language will be translated here...</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={speakTranslation}
              disabled={!translatedText.trim()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Volume2 className="h-4 w-4" />
              <span>Speak</span>
            </Button>
            
            <Button
              onClick={clearTranslation}
              variant="outline"
              disabled={!translatedText.trim()}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isActive 
              ? 'Show ASL signs to the camera for real-time translation' 
              : 'Start the camera to begin sign language detection'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ASLDetector;
