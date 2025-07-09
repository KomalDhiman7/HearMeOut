// API client for HearMeOut backend
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Socket.IO client
let socket: Socket | null = null;

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication token management
class AuthManager {
  private static TOKEN_KEY = 'hearmeout_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Base API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...AuthManager.getAuthHeaders(),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const api = new ApiClient();

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.success && (response.data as any)?.session_token) {
      AuthManager.setToken((response.data as any).session_token);
    }
    return response;
  },

  async register(email: string, password: string, name: string) {
    const response = await api.post('/api/auth/register', { email, password, name });
    if (response.success && (response.data as any)?.session_token) {
      AuthManager.setToken((response.data as any).session_token);
    }
    return response;
  },

  async logout() {
    const response = await api.post('/api/auth/logout');
    AuthManager.removeToken();
    return response;
  },

  async getProfile() {
    return api.get('/api/auth/profile');
  },

  async updateProfile(data: any) {
    return api.put('/api/auth/profile', data);
  },

  async validateSession() {
    return api.get('/api/auth/validate');
  },
};

// ASL Recognition API
export const aslAPI = {
  async detectFromImage(imageData: string) {
    return api.post('/api/asl/detect', { image: imageData });
  },

  async detectFromStream(frameData: string, options?: any) {
    return api.post('/api/asl/detect/stream', { frame: frameData, options });
  },

  async getHistory() {
    return api.get('/api/asl/history');
  },

  async resetDetection() {
    return api.post('/api/asl/reset');
  },

  async getStatus() {
    return api.get('/api/asl/status');
  },

  async getSupportedSigns() {
    return api.get('/api/asl/signs');
  },
};

// Emotion Analysis API
export const emotionAPI = {
  async analyzeText(text: string) {
    return api.post('/api/emotion/analyze', { text });
  },

  async batchAnalyze(texts: string[]) {
    return api.post('/api/emotion/batch', { texts });
  },

  async checkUrgency(text: string) {
    return api.post('/api/emotion/urgency', { text });
  },

  async getStatus() {
    return api.get('/api/emotion/status');
  },

  async testDetection() {
    return api.post('/api/emotion/test');
  },
};

// Speech API
export const speechAPI = {
  async textToSpeech(text: string, options?: any) {
    return api.post('/api/speech/tts', { text, ...options });
  },

  async textToSpeechOffline(text: string, options?: any) {
    return api.post('/api/speech/tts/pyttsx', { text, ...options });
  },

  async speechToTextWhisper(audioData: string) {
    return api.post('/api/speech/stt/whisper', { audio: audioData });
  },

  async speechToTextGoogle(audioData: string, language?: string) {
    return api.post('/api/speech/stt/google', { audio: audioData, language });
  },

  async getVoices() {
    return api.get('/api/speech/voices');
  },

  async getStatus() {
    return api.get('/api/speech/status');
  },

  async emergencySpeak(text: string, urgent = true) {
    return api.post('/api/speech/emergency/speak', { text, urgent });
  },
};

// Translation API
export const translationAPI = {
  async getSupportedLanguages() {
    return api.get('/api/translate/languages');
  },

  async getCommonPhrases(language: string) {
    return api.get(`/api/translate/phrases?language=${language}`);
  },

  async translatePhrase(phrase: string, targetLanguage: string) {
    return api.post('/api/translate/phrase', { phrase, target_language: targetLanguage });
  },

  async getEmergencyPhrases(language: string) {
    return api.get(`/api/translate/emergency?language=${language}`);
  },

  async getQuickCommands(language: string) {
    return api.get(`/api/translate/quick-commands?language=${language}`);
  },

  async batchTranslate(phrases: string[], targetLanguage: string) {
    return api.post('/api/translate/batch', { phrases, target_language: targetLanguage });
  },

  async detectLanguage(text: string) {
    return api.post('/api/translate/detect', { text });
  },
};

// Emergency API
export const emergencyAPI = {
  async triggerEmergency(data: {
    type?: string;
    message?: string;
    location?: string;
    severity?: string;
    user_id?: string;
  }) {
    return api.post('/api/emergency/trigger', data);
  },

  async getEmergencyStatus(alertId: string) {
    return api.get(`/api/emergency/status/${alertId}`);
  },

  async resolveEmergency(alertId: string, notes?: string, resolvedBy?: string) {
    return api.post(`/api/emergency/resolve/${alertId}`, { notes, resolved_by: resolvedBy });
  },

  async getActiveEmergencies() {
    return api.get('/api/emergency/active');
  },

  async getEmergencyHistory(limit?: number, userId?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (userId) params.append('user_id', userId);
    
    return api.get(`/api/emergency/history?${params.toString()}`);
  },

  async getEmergencyContacts() {
    return api.get('/api/emergency/contacts');
  },

  async getEmergencyStats() {
    return api.get('/api/emergency/stats');
  },

  async testEmergencySystem() {
    return api.post('/api/emergency/test');
  },
};

// System API
export const systemAPI = {
  async getHealth() {
    return api.get('/api/health');
  },

  async getStatus() {
    return api.get('/api/status');
  },
};

// Socket.IO utilities
export const socketUtils = {
  connect() {
    if (!socket) {
      socket = io(API_BASE_URL);
      
      socket.on('connect', () => {
        console.log('Connected to HearMeOut backend');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from HearMeOut backend');
      });

      socket.on('emergency_alert', (data: any) => {
        console.log('Emergency alert received:', data);
        // Dispatch custom event for emergency alerts
        window.dispatchEvent(new CustomEvent('emergency_alert', { detail: data }));
      });

      socket.on('asl_detection', (data: any) => {
        // Dispatch custom event for ASL detections
        window.dispatchEvent(new CustomEvent('asl_detection', { detail: data }));
      });
    }
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  emit(event: string, data: any) {
    if (socket) {
      socket.emit(event, data);
    }
  },

  on(event: string, callback: (data: any) => void) {
    if (socket) {
      socket.on(event, callback);
    }
  },

  off(event: string, callback?: (data: any) => void) {
    if (socket) {
      socket.off(event, callback);
    }
  },
};

// Utility functions
export const apiUtils = {
  // Convert file to base64 for API calls
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Convert canvas to base64
  canvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/jpeg', 0.8);
  },

  // Check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await systemAPI.getHealth();
      return response.success;
    } catch {
      return false;
    }
  },

  // Format error messages
  formatError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  },
};

// Export auth manager for external use
export { AuthManager };

// Export the main API instance
export default api;