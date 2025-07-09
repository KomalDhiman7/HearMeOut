export interface User {
  id: string;
  name: string;
  email?: string;
  preferences: UserPreferences;
  savedPhrases: SavedPhrase[];
  gestureShortcuts: GestureShortcut[];
  createdAt: string;
}

export interface UserPreferences {
  language: string;
  voiceSpeed: number;
  voiceVolume: number;
  emergencyContacts: EmergencyContact[];
  accessibilityMode: boolean;
}

export interface SavedPhrase {
  id: string;
  text: string;
  category: 'common' | 'emergency' | 'personal' | 'medical';
  frequency: number;
  createdAt: string;
}

export interface GestureShortcut {
  id: string;
  gesture: string;
  phrase: string;
  confidence: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

export interface AppSettings {
  language: string;
  voiceSpeed: number;
  voiceVolume: number;
  emergencyContacts: EmergencyContact[];
  savedPhrases: SavedPhrase[];
  preferredQuickCommands: string[];
  theme: 'light' | 'dark' | 'high-contrast';
  accessibilityMode: boolean;
  offlineMode: boolean;
}

export interface ASLDetection {
  gesture: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: number;
}

export interface EmotionAnalysis {
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  keywords: string[];
}

export interface KioskMessage {
  id: string;
  sender: 'user' | 'staff';
  text: string;
  timestamp: number;
  spoken: boolean;
  urgent?: boolean;
}