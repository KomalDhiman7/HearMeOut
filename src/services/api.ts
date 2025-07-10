const API_BASE_URL = 'http://localhost:5000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async signup(email: string, password: string, name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Signup failed' };
      }

      // Store token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return { data };
    } catch (error) {
      return { error: 'Network error during signup' };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Login failed' };
      }

      // Store token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return { data };
    } catch (error) {
      return { error: 'Network error during login' };
    }
  }

  async getUserHistory(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Failed to fetch history' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error fetching history' };
    }
  }

  async recognizeGesture(imageData: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/gesture/recognize`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Gesture recognition failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error during gesture recognition' };
    }
  }

  async savePhrase(phrase: string, category: string = 'personal'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/save-phrase`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phrase, category }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Failed to save phrase' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error saving phrase' };
    }
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: 'Backend health check failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Backend server is not running' };
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();