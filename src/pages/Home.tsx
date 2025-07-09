import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  MessageSquare, 
  Zap, 
  Users, 
  Accessibility,
  Heart,
  Shield,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Home: React.FC = () => {
  const { user, speakText } = useApp();

  const quickActions = [
    {
      to: '/asl',
      icon: Camera,
      title: 'ASL Camera',
      description: 'Convert sign language to speech in real-time',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      to: '/text',
      icon: MessageSquare,
      title: 'Text to Speech',
      description: 'Type and speak with emotion detection',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      to: '/quick',
      icon: Zap,
      title: 'Quick Commands',
      description: 'Instant access to common phrases',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      to: '/kiosk',
      icon: Users,
      title: 'Kiosk Mode',
      description: 'Two-way communication with staff',
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  const features = [
    {
      icon: Accessibility,
      title: 'Fully Accessible',
      description: 'Designed with accessibility as a priority, supporting various needs and abilities',
    },
    {
      icon: Heart,
      title: 'Emotion Aware',
      description: 'Detects urgency and emotion to provide appropriate responses',
    },
    {
      icon: Shield,
      title: 'Emergency Ready',
      description: 'Instant emergency mode with alerts and priority communication',
    },
    {
      icon: Smartphone,
      title: 'Works Offline',
      description: 'Essential phrases available even without internet connection',
    },
  ];

  const handleWelcomeSpeak = () => {
    speakText('Welcome to HearMeOut. Your voice matters, and we are here to help you communicate.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              HearMeOut
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your voice matters. Communicate instantly, confidently, and clearly in any situation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleWelcomeSpeak}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                🔊 Hear Welcome Message
              </button>
              
              <Link
                to="/training"
                className="px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg border border-blue-200"
              >
                👥 Staff Training
              </Link>
            </div>

            {user && (
              <div className="bg-white rounded-lg p-4 shadow-md max-w-md mx-auto">
                <p className="text-gray-700">
                  Welcome back, <span className="font-medium">{user.name}</span>! 
                  Your preferences are saved and ready.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Started Instantly
            </h2>
            <p className="text-xl text-gray-600">
              Choose how you want to communicate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 transition-colors duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {action.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  <span className="mr-2">Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Real-World Communication
            </h2>
            <p className="text-xl text-gray-600">
              Features designed for every situation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Communicating?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            No signup required. Start using HearMeOut right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quick"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              🚀 Quick Start
            </Link>
            <Link
              to="/emergency"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              🚨 Emergency Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;