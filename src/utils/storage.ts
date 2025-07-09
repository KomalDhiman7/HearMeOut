import { User, AppSettings } from '../types';

const STORAGE_KEYS = {
  USER_DATA: 'hearmeout_user_data',
  SETTINGS: 'hearmeout_settings',
  OFFLINE_PHRASES: 'hearmeout_offline_phrases',
  GESTURE_SHORTCUTS: 'hearmeout_gesture_shortcuts',
};

export const saveUserData = async (data: { user: User | null; settings: AppSettings }) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const loadUserData = async (): Promise<{ user: User | null; settings: AppSettings } | null> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

export const saveOfflinePhrases = (phrases: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PHRASES, JSON.stringify(phrases));
  } catch (error) {
    console.error('Error saving offline phrases:', error);
  }
};

export const loadOfflinePhrases = (): string[] => {
  try {
    const phrases = localStorage.getItem(STORAGE_KEYS.OFFLINE_PHRASES);
    return phrases ? JSON.parse(phrases) : [];
  } catch (error) {
    console.error('Error loading offline phrases:', error);
    return [];
  }
};

export const clearUserData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};