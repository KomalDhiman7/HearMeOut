import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Volume2, MapPin, Clock, User, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

const EmergencyMode: React.FC = () => {
  const { speakText, activateEmergencyMode, deactivateEmergencyMode, isEmergencyMode } = useApp();
  const [emergencyType, setEmergencyType] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [location, setLocation] = useState<string>('Locating...');

  useEffect(() => {
    activateEmergencyMode();
    return () => deactivateEmergencyMode();
  }, [activateEmergencyMode, deactivateEmergencyMode]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocation('Location unavailable');
        }
      );
    }
  }, []);

  const emergencyTypes = [
    { 
      id: 'medical', 
      label: 'Medical Emergency', 
      color: 'bg-red-600 hover:bg-red-700',
      message: 'Medical emergency. I need immediate help. Call 911.',
      icon: Heart
    },
    { 
      id: 'fire', 
      label: 'Fire Emergency', 
      color: 'bg-orange-600 hover:bg-orange-700',
      message: 'Fire emergency. Evacuate immediately. Call fire department.',
      icon: AlertTriangle
    },
    { 
      id: 'security', 
      label: 'Security Emergency', 
      color: 'bg-purple-600 hover:bg-purple-700',
      message: 'Security emergency. I need help immediately. Call security.',
      icon: AlertTriangle
    },
    { 
      id: 'general', 
      label: 'General Emergency', 
      color: 'bg-gray-600 hover:bg-gray-700',
      message: 'Emergency situation. I need immediate assistance.',
      icon: AlertTriangle
    },
  ];

  const handleEmergencyActivation = (type: string) => {
    setEmergencyType(type);
    setIsActive(true);
    setCountdown(3);
    
    const emergency = emergencyTypes.find(e => e.id === type);
    if (emergency) {
      speakText(emergency.message, { urgent: true });
    }
    
    // Countdown before activation
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Here you would typically send emergency notifications
          console.log('Emergency activated:', type);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = () => {
    setIsActive(false);
    setEmergencyType('');
    setCountdown(0);
    speakText('Emergency canceled');
  };

  const quickEmergencyPhrases = [
    'Help me immediately',
    'Call 911',
    'I cannot speak',
    'I am deaf',
    'Medical emergency',
    'I need a doctor',
    'I am in pain',
    'Fire emergency',
    'Security help needed',
    'I am lost',
    'Call my family',
    'I need assistance',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-red-800 mb-4">
            Emergency Mode
          </h1>
          <p className="text-lg text-red-600">
            Get immediate help in emergency situations
          </p>
        </div>

        {/* Active Emergency */}
        {isActive && (
          <div className="bg-red-600 text-white rounded-xl shadow-lg p-6 mb-6 animate-pulse">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Emergency Activated</h2>
              {countdown > 0 ? (
                <div className="text-4xl font-bold mb-4">{countdown}</div>
              ) : (
                <div className="text-lg mb-4">Help is being contacted...</div>
              )}
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel Emergency
              </button>
            </div>
          </div>
        )}

        {/* Emergency Types */}
        {!isActive && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Emergency Type
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {emergencyTypes.map((emergency) => (
                <button
                  key={emergency.id}
                  onClick={() => handleEmergencyActivation(emergency.id)}
                  className={`${emergency.color} text-white rounded-lg p-6 font-medium transition-colors duration-200 hover:shadow-lg`}
                >
                  <div className="flex items-center space-x-3">
                    <emergency.icon className="w-8 h-8" />
                    <div className="text-left">
                      <div className="text-lg font-bold">{emergency.label}</div>
                      <div className="text-sm opacity-90">Tap for immediate help</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Emergency Phrases */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Emergency Phrases
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickEmergencyPhrases.map((phrase, index) => (
              <button
                key={index}
                onClick={() => speakText(phrase, { urgent: true })}
                className="p-3 text-left bg-red-50 hover:bg-red-100 text-red-800 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Emergency Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Location
              </h3>
              <p className="text-gray-600">{location}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-red-600" />
                Time
              </h3>
              <p className="text-gray-600">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-red-600" />
                Communication
              </h3>
              <p className="text-gray-600">I am deaf/hard of hearing</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-red-600" />
                Emergency Numbers
              </h3>
              <p className="text-gray-600">911 (Emergency)</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How Emergency Mode Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">What Happens</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Immediate voice announcement</li>
                <li>• Visual emergency alerts</li>
                <li>• Location sharing (if enabled)</li>
                <li>• Emergency contact notification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Important Notes</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• This is for real emergencies only</li>
                <li>• Help staff understand you're deaf/hard of hearing</li>
                <li>• Have emergency contacts ready</li>
                <li>• Stay calm and use clear gestures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;