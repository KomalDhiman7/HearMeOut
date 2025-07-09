import React, { useState } from 'react';
import { GraduationCap, Play, CheckCircle, Book, Users, Heart, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Training: React.FC = () => {
  const { speakText } = useApp();
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  const trainingModules = [
    {
      id: 'basics',
      title: 'Communication Basics',
      description: 'Learn how to effectively communicate with deaf and hard of hearing customers',
      duration: '10 min',
      icon: Book,
      color: 'bg-blue-600',
      content: {
        sections: [
          {
            title: 'Understanding Deafness',
            content: 'Deafness and hearing loss exist on a spectrum. Some people are completely deaf, while others have varying degrees of hearing loss. Always ask how they prefer to communicate.',
          },
          {
            title: 'Getting Attention',
            content: 'To get someone\'s attention, you can wave gently, tap their shoulder lightly, or make eye contact. Never shout or make sudden movements.',
          },
          {
            title: 'Communication Methods',
            content: 'People may use sign language, lip reading, writing, or assistive technology. Be patient and follow their lead on preferred communication method.',
          },
        ],
      },
    },
    {
      id: 'technology',
      title: 'Using HearMeOut',
      description: 'Learn how to use the HearMeOut app to assist customers',
      duration: '15 min',
      icon: Users,
      color: 'bg-green-600',
      content: {
        sections: [
          {
            title: 'Kiosk Mode',
            content: 'Use the Kiosk Mode for two-way communication. The customer types on one side, you respond on the other. All messages are spoken aloud.',
          },
          {
            title: 'Emergency Features',
            content: 'If the emergency mode is activated, take it seriously. The system will highlight urgent messages and provide clear instructions.',
          },
          {
            title: 'Quick Commands',
            content: 'The customer can use quick command buttons for common needs. Listen for these automated announcements and respond appropriately.',
          },
        ],
      },
    },
    {
      id: 'etiquette',
      title: 'Proper Etiquette',
      description: 'Best practices for respectful and effective communication',
      duration: '12 min',
      icon: Heart,
      color: 'bg-purple-600',
      content: {
        sections: [
          {
            title: 'Do\'s',
            content: 'Face the person when speaking, speak clearly and at normal pace, use gestures and visual cues, be patient, and maintain eye contact.',
          },
          {
            title: 'Don\'ts',
            content: 'Don\'t shout, don\'t cover your mouth, don\'t turn away while speaking, don\'t be impatient, and don\'t assume someone can\'t understand.',
          },
          {
            title: 'Writing Communication',
            content: 'Keep messages clear and simple. Use plain language, avoid jargon, and confirm understanding by having them nod or write back.',
          },
        ],
      },
    },
    {
      id: 'emergency',
      title: 'Emergency Situations',
      description: 'How to handle emergency situations involving deaf or hard of hearing individuals',
      duration: '20 min',
      icon: AlertTriangle,
      color: 'bg-red-600',
      content: {
        sections: [
          {
            title: 'Recognizing Emergencies',
            content: 'Watch for emergency mode activation in the app, distressed body language, or urgent gestures. Take all emergency indicators seriously.',
          },
          {
            title: 'Immediate Response',
            content: 'Stay calm, get their attention gently, use clear visual signals, and call for help if needed. The app will provide emergency messages.',
          },
          {
            title: 'Involving Emergency Services',
            content: 'When calling 911, inform them that a deaf or hard of hearing person is involved. They may need special communication assistance.',
          },
        ],
      },
    },
  ];

  const basicSigns = [
    { sign: 'Hello', description: 'Wave with open palm', gesture: '👋' },
    { sign: 'Thank You', description: 'Touch chin and move hand forward', gesture: '🙏' },
    { sign: 'Please', description: 'Flat hand on chest in circular motion', gesture: '🤲' },
    { sign: 'Help', description: 'One hand supports the other', gesture: '🆘' },
    { sign: 'Water', description: 'W handshape at mouth', gesture: '💧' },
    { sign: 'Bathroom', description: 'Shake T handshape', gesture: '🚻' },
    { sign: 'Yes', description: 'Nod fist up and down', gesture: '✅' },
    { sign: 'No', description: 'Close fingers with thumb', gesture: '❌' },
  ];

  const completeModule = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
      speakText(`Module ${moduleId} completed successfully`);
    }
  };

  const startModule = (moduleId: string) => {
    setCurrentModule(moduleId);
  };

  const ModuleContent: React.FC<{ module: any }> = ({ module }) => (
    <div className="space-y-6">
      {module.content.sections.map((section: any, index: number) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
          <p className="text-gray-700">{section.content}</p>
        </div>
      ))}
      <div className="text-center">
        <button
          onClick={() => completeModule(module.id)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Complete Module
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Staff Training
          </h1>
          <p className="text-lg text-gray-600">
            Learn how to effectively assist deaf and hard of hearing customers
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Training Progress</h2>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>{completedModules.length} / {trainingModules.length} completed</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedModules.length / trainingModules.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Module */}
        {currentModule && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {trainingModules.find(m => m.id === currentModule)?.title}
              </h2>
              <button
                onClick={() => setCurrentModule(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <ModuleContent module={trainingModules.find(m => m.id === currentModule)} />
          </div>
        )}

        {/* Training Modules */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {trainingModules.map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`${module.color} p-4`}>
                <div className="flex items-center text-white">
                  <module.icon className="w-8 h-8 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <p className="text-sm opacity-90">{module.duration}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">{module.description}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => startModule(module.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Module</span>
                  </button>
                  {completedModules.includes(module.id) && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Basic Signs Reference */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Sign Language Reference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {basicSigns.map((sign, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">{sign.gesture}</div>
                <h3 className="font-medium text-gray-900">{sign.sign}</h3>
                <p className="text-sm text-gray-600">{sign.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quick Reference Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Communication Tips</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Face the person when speaking</li>
                <li>• Speak clearly at normal pace</li>
                <li>• Use gestures and visual cues</li>
                <li>• Be patient and understanding</li>
                <li>• Ask how they prefer to communicate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">HearMeOut Features</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Kiosk Mode for two-way chat</li>
                <li>• Emergency mode alerts</li>
                <li>• Quick command buttons</li>
                <li>• Text-to-speech conversion</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;