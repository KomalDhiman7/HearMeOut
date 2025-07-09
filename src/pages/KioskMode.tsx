import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, RotateCcw, Users, MessageSquare, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KioskMessage } from '../types';

const KioskMode: React.FC = () => {
  const { speakText, isEmergencyMode } = useApp();
  const [messages, setMessages] = useState<KioskMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [staffInput, setStaffInput] = useState('');
  const [isStaffMode, setIsStaffMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (sender: 'user' | 'staff', text: string) => {
    if (!text.trim()) return;

    const message: KioskMessage = {
      id: Date.now().toString(),
      sender,
      text: text.trim(),
      timestamp: Date.now(),
      spoken: false,
      urgent: isEmergencyMode,
    };

    setMessages(prev => [...prev, message]);
    
    // Auto-speak the message
    speakText(text, { urgent: isEmergencyMode });
    
    // Clear input
    if (sender === 'user') {
      setUserInput('');
    } else {
      setStaffInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, sender: 'user' | 'staff') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = sender === 'user' ? userInput : staffInput;
      sendMessage(sender, text);
    }
  };

  const speakMessage = (message: KioskMessage) => {
    speakText(message.text, { urgent: message.urgent });
    setMessages(prev => 
      prev.map(msg => 
        msg.id === message.id ? { ...msg, spoken: true } : msg
      )
    );
  };

  const clearConversation = () => {
    setMessages([]);
    setUserInput('');
    setStaffInput('');
  };

  const quickUserPhrases = [
    'Hello, I need help',
    'Can you assist me?',
    'I am deaf/hard of hearing',
    'Please write your response',
    'Thank you',
    'I don\'t understand',
    'Please repeat',
    'Where is...?',
    'How much does this cost?',
    'I need to return this',
  ];

  const quickStaffPhrases = [
    'How can I help you?',
    'Please wait a moment',
    'I understand',
    'Follow me',
    'Here is what you need',
    'The cost is...',
    'Would you like...?',
    'Thank you for your patience',
    'Is there anything else?',
    'Have a great day',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kiosk Mode
          </h1>
          <p className="text-lg text-gray-600">
            Two-way communication between customer and staff
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setIsStaffMode(false)}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                !isStaffMode 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Customer Side
            </button>
            <button
              onClick={() => setIsStaffMode(true)}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                isStaffMode 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Staff Side
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Customer Side */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4 bg-blue-600 text-white rounded-t-xl">
              <h2 className="text-xl font-semibold flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                Customer
              </h2>
            </div>
            
            <div className="p-4">
              <div className="h-64 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-3">
                {messages.filter(msg => msg.sender === 'user').map(message => (
                  <div key={message.id} className="mb-3 p-3 bg-blue-100 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => speakMessage(message)}
                        className="p-1 hover:bg-blue-200 rounded"
                      >
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                    <p className="text-gray-800">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'user')}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isStaffMode}
                />
                <button
                  onClick={() => sendMessage('user', userInput)}
                  disabled={!userInput.trim() || isStaffMode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickUserPhrases.slice(0, 6).map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage('user', phrase)}
                    disabled={isStaffMode}
                    className="p-2 text-xs bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 text-blue-800 rounded transition-colors duration-200"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Staff Side */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4 bg-green-600 text-white rounded-t-xl">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Staff
              </h2>
            </div>
            
            <div className="p-4">
              <div className="h-64 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-3">
                {messages.filter(msg => msg.sender === 'staff').map(message => (
                  <div key={message.id} className="mb-3 p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => speakMessage(message)}
                        className="p-1 hover:bg-green-200 rounded"
                      >
                        <Volume2 className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                    <p className="text-gray-800">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'staff')}
                  placeholder="Type your response..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!isStaffMode}
                />
                <button
                  onClick={() => sendMessage('staff', staffInput)}
                  disabled={!staffInput.trim() || !isStaffMode}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickStaffPhrases.slice(0, 6).map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage('staff', phrase)}
                    disabled={!isStaffMode}
                    className="p-2 text-xs bg-green-50 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 text-green-800 rounded transition-colors duration-200"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation History */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Full Conversation
            </h2>
            <button
              onClick={clearConversation}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className="mb-3">
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-100 ml-8' 
                      : 'bg-green-100 mr-8'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {message.sender === 'user' ? 'Customer' : 'Staff'} • {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => speakMessage(message)}
                        className="p-1 hover:bg-white rounded"
                      >
                        <Volume2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-gray-800">{message.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How to Use Kiosk Mode
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">For Customers</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Select "Customer Side" to send messages</li>
                <li>• Type your message or use quick phrases</li>
                <li>• Messages are automatically spoken aloud</li>
                <li>• Use clear, simple language</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">For Staff</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Select "Staff Side" to respond</li>
                <li>• Type responses or use quick phrases</li>
                <li>• Be patient and clear in communication</li>
                <li>• Use the replay button if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskMode;