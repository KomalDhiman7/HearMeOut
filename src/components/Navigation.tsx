import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Camera, 
  MessageSquare, 
  Zap, 
  Users, 
  AlertTriangle, 
  Settings,
  GraduationCap,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuthModal from './AuthModal';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isEmergencyMode, user, isAuthenticated, login, signup, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/asl', icon: Camera, label: 'ASL Camera' },
    { path: '/text', icon: MessageSquare, label: 'Text to Speech' },
    { path: '/quick', icon: Zap, label: 'Quick Commands' },
    { path: '/kiosk', icon: Users, label: 'Kiosk Mode' },
    { path: '/training', icon: GraduationCap, label: 'Training' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center font-bold z-50 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            EMERGENCY MODE ACTIVE
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 bg-white shadow-lg z-40 ${isEmergencyMode ? 'mt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HearMeOut</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Auth & Emergency */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              )}
              
              <Link
                to="/emergency"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Emergency</span>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 px-3 py-3 text-gray-700">
                      <User className="w-5 h-5" />
                      <span className="font-medium">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 w-full text-left"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
              
              <Link
                to="/emergency"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-red-600 text-white font-medium"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onSignup={signup}
      />
    </>
  );
};

export default Navigation;