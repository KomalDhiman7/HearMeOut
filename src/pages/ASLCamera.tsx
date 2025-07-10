import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Volume2, Settings, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const ASLCamera: React.FC = () => {
  const { speakText, isEmergencyMode } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [detectionHistory, setDetectionHistory] = useState<Array<{text: string, confidence: number, timestamp: number}>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    // Check backend connection
    const checkBackend = async () => {
      const response = await apiService.healthCheck();
      setBackendStatus(response.error ? 'disconnected' : 'connected');
    };
    
    checkBackend();
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setCameraStatus('requesting');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setCameraStatus('granted');
          setIsRecording(true);
          if (backendStatus === 'connected') {
            startRealTimeDetection();
          } else {
            console.warn('Backend not connected, gesture recognition disabled');
          }
        };
        
        // Handle video errors
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setError('Camera feed error. Please refresh and try again.');
          setCameraStatus('denied');
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraStatus('denied');
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application. Please close other apps and try again.');
      } else {
        setError('Camera access failed. Please check your camera settings and try again.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setDetectedText('');
    setConfidence(0);
    setIsProcessing(false);
    setCameraStatus('idle');
  };

  const startRealTimeDetection = () => {
    // Clear any existing interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    // Real-time gesture detection every 2 seconds
    detectionIntervalRef.current = setInterval(() => {
      if (!isRecording || !videoRef.current || !canvasRef.current) {
        return;
      }

      setIsProcessing(true);
      
      // Capture frame from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to backend for gesture recognition
        processGesture(imageData);
      }
    }, 2000);
  };

  const processGesture = async (imageData: string) => {
    try {
      const response = await apiService.recognizeGesture(imageData);
      
      if (response.data && response.data.gestures && response.data.gestures.length > 0) {
        const bestGesture = response.data.gestures[0]; // Get highest confidence gesture
        
        setDetectedText(bestGesture.text);
        setConfidence(Math.round(bestGesture.confidence * 100));
        setIsProcessing(false);
        
        // Add to history
        setDetectionHistory(prev => [
          { 
            text: bestGesture.text, 
            confidence: Math.round(bestGesture.confidence * 100), 
            timestamp: Date.now() 
          },
          ...prev.slice(0, 4) // Keep last 5 detections
        ]);
        
        // Auto-speak detected text
        speakText(bestGesture.text, { 
          urgent: bestGesture.text.includes('Help') || bestGesture.text.includes('Emergency') 
        });
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Gesture recognition error:', error);
      setIsProcessing(false);
    }
  };

  const handleSpeak = () => {
    if (detectedText) {
      speakText(detectedText, { urgent: detectedText.includes('Help') || detectedText.includes('Emergency') });
    }
  };

  const retryCamera = () => {
    setError('');
    setCameraStatus('idle');
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ASL Camera
          </h1>
          <p className="text-lg text-gray-600">
            Sign language to speech in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Feed */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Camera Feed</h2>
                <div className="flex items-center space-x-2">
                  {backendStatus === 'disconnected' && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Backend offline</span>
                    </div>
                  )}
                  {backendStatus === 'connected' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Backend connected</span>
                    </div>
                  )}
                  {cameraStatus === 'requesting' && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Requesting camera...</span>
                    </div>
                  )}
                  {cameraStatus === 'granted' && isRecording && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Recording</span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {cameraStatus === 'granted' && isRecording ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ display: 'none' }}
                    />
                    
                    {/* Detection overlay */}
                    {detectedText && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-3">
                        <div className="flex items-center justify-between text-white">
                          <div>
                            <span className="font-medium text-lg">{detectedText}</span>
                            <div className="text-xs text-gray-300 mt-1">
                              Confidence: {confidence}%
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSpeak}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Processing indicator */}
                    {isProcessing && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      {cameraStatus === 'requesting' ? (
                        <>
                          <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin" />
                          <p className="text-lg mb-2">Requesting Camera Access</p>
                          <p className="text-sm">Please allow camera permission</p>
                        </>
                      ) : cameraStatus === 'denied' ? (
                        <>
                          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                          <p className="text-lg mb-2 text-red-400">Camera Access Denied</p>
                          <p className="text-sm">Camera permission is required for ASL detection</p>
                        </>
                      ) : (
                        <>
                          <Camera className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-lg mb-2">Camera Not Active</p>
                          <p className="text-sm">Click "Start Camera" to begin ASL detection</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                  {cameraStatus === 'denied' && (
                    <button
                      onClick={retryCamera}
                      className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
                    >
                      Retry Camera Access
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startCamera}
                    disabled={cameraStatus === 'requesting'}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{cameraStatus === 'requesting' ? 'Starting...' : 'Start Camera'}</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <CameraOff className="w-5 h-5" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Detection Results */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detection Results
              </h2>

              {detectedText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-green-800">Current Detection</h3>
                      <span className="text-sm text-green-600">{confidence}% confident</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mb-3">{detectedText}</p>
                    <button
                      onClick={handleSpeak}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Volume2 className="w-5 h-5" />
                      <span>Speak Again</span>
                    </button>
                  </div>

                  {detectionHistory.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-3">Recent Detections</h4>
                      <div className="space-y-2">
                        {detectionHistory.map((detection, index) => (
                          <div key={detection.timestamp} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{detection.text}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">{detection.confidence}%</span>
                              <button
                                onClick={() => speakText(detection.text)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Volume2 className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No signs detected yet</p>
                  <p className="text-sm mt-1">
                    {isRecording ? 'Make signs in front of the camera' : 'Start the camera to begin detection'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Camera Status Info */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            System Status & Troubleshooting
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Camera Status</h4>
              <div className="flex items-center space-x-2 mb-2">
                {cameraStatus === 'granted' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : cameraStatus === 'denied' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : cameraStatus === 'requesting' ? (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">
                  {cameraStatus === 'granted' ? 'Camera Active' :
                   cameraStatus === 'denied' ? 'Camera Denied' :
                   cameraStatus === 'requesting' ? 'Requesting Access' : 'Camera Inactive'}
                </span>
              </div>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Camera permission: {cameraStatus === 'granted' ? 'Granted' : 'Required'}</li>
                <li>• Video feed: {isRecording ? 'Active' : 'Inactive'}</li>
                <li>• Detection: {isRecording && backendStatus === 'connected' ? 'Running' : 'Stopped'}</li>
                <li>• Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Troubleshooting</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Ensure camera is connected and working</li>
                <li>• Allow camera permission when prompted</li>
                <li>• Close other apps using the camera</li>
                <li>• Refresh the page if camera fails</li>
                <li>• Check browser camera settings</li>
                <li>• Ensure Flask backend is running on port 5000</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How to Use ASL Camera
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Getting Started</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Click "Start Camera" and allow permission</li>
                <li>• Wait for the video feed to appear</li>
                <li>• Position yourself clearly in the frame</li>
                <li>• Sign at a comfortable, steady pace</li>
                <li>• Wait for detection results to appear</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Tips for Best Results</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Ensure good, even lighting</li>
                <li>• Use a plain, contrasting background</li>
                <li>• Keep hands within the camera frame</li>
                <li>• Make clear, distinct gestures</li>
                <li>• Hold gestures for 2-3 seconds</li>
                <li>• Try: thumbs up, thumbs down, peace sign, OK sign</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASLCamera;