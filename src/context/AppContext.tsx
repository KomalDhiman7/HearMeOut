import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppSettings, EmergencyContact } from '../types';
import { loadUserData, saveUserData, clearUserData } from '../utils/storage';

interface AppContextType {
  user: User | null;
  settings: AppSettings;
  isEmergencyMode: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  activateEmergencyMode: () => void;
  deactivateEmergencyMode: () => void;
  speakText: (text: string, options?: { urgent?: boolean; language?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const defaultSettings: AppSettings = {
  language: 'en-US',
  voiceSpeed: 1.0,
  voiceVolume: 1.0,
  emergencyContacts: [],
  savedPhrases: [],
  preferredQuickCommands: ['Help', 'Water', 'Toilet', 'Emergency', 'Thank you'],
  theme: 'light',
  accessibilityMode: true,
  offlineMode: false,
};

// Mock user database for demo
const mockUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@hearmeout.com',
    password: 'demo123',
    preferences: {
      language: 'en-US',
      voiceSpeed: 1.2,
      voiceVolume: 0.8,
      emergencyContacts: [
        {
          id: '1',
          name: 'Emergency Contact',
          phone: '911',
          relationship: 'Emergency Services',
          priority: 1,
        }
      ],
      accessibilityMode: true,
    },
    savedPhrases: [
      {
        id: '1',
        text: 'I need help with my order',
        category: 'common' as const,
        frequency: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        text: 'Where is the nearest exit?',
        category: 'emergency' as const,
        frequency: 2,
        createdAt: new Date().toISOString(),
      }
    ],
    gestureShortcuts: [],
    createdAt: new Date().toISOString(),
  }
];

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    const loadData = async () => {
      const userData = await loadUserData();
      if (userData) {
        setUser(userData.user);
        setSettings({ ...defaultSettings, ...userData.settings });
      }
    };
    loadData();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveUserData({ user, settings: updatedSettings });
  };

  const activateEmergencyMode = () => {
    setIsEmergencyMode(true);
    speakText('Emergency mode activated', { urgent: true });
  };

  const deactivateEmergencyMode = () => {
    setIsEmergencyMode(false);
    speakText('Emergency mode deactivated');
  };

  const speakText = async (text: string, options: { urgent?: boolean; language?: string } = {}) => {
    if (!text.trim()) return;

    const { urgent = false, language = settings.language } = options;
    
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = urgent ? Math.min(settings.voiceSpeed * 1.2, 2.0) : settings.voiceSpeed;
        utterance.volume = urgent ? 1.0 : settings.voiceVolume;
        utterance.pitch = urgent ? 1.2 : 1.0;
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      preferences: mockUser.preferences,
      savedPhrases: mockUser.savedPhrases,
      gestureShortcuts: mockUser.gestureShortcuts,
      createdAt: mockUser.createdAt,
    };

    setUser(user);
    
    // Merge user preferences with default settings
    const userSettings: AppSettings = {
      ...defaultSettings,
      language: user.preferences.language,
      voiceSpeed: user.preferences.voiceSpeed,
      voiceVolume: user.preferences.voiceVolume,
      emergencyContacts: user.preferences.emergencyContacts,
      savedPhrases: user.savedPhrases,
      accessibilityMode: user.preferences.accessibilityMode,
    };
    
    setSettings(userSettings);
    await saveUserData({ user, settings: userSettings });
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      preferences: {
        language: defaultSettings.language,
        voiceSpeed: defaultSettings.voiceSpeed,
        voiceVolume: defaultSettings.voiceVolume,
        emergencyContacts: [],
        accessibilityMode: true,
      },
      savedPhrases: [],
      gestureShortcuts: [],
      createdAt: new Date().toISOString(),
    };

    // Add to mock database
    mockUsers.push({
      ...newUser,
      password,
    });

    setUser(newUser);
    setSettings(defaultSettings);
    await saveUserData({ user: newUser, settings: defaultSettings });
  };

  const logout = () => {
    setUser(null);
    setSettings(defaultSettings);
    clearUserData();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        isEmergencyMode,
        isAuthenticated,
        setUser,
        updateSettings,
        activateEmergencyMode,
        deactivateEmergencyMode,
        speakText,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};