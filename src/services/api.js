let API_BASE_URL = import.meta.env.VITE_API_URL || localStorage.getItem('apiBaseUrl') || '';

async function detectApiBaseUrl() {
  if (API_BASE_URL) return API_BASE_URL;
  const candidatePorts = [5000, 5001, 5002, 5003, 5004, 5005];
  for (const port of candidatePorts) {
    try {
      const originHost = window.location.hostname; // supports LAN IP when opened via Network URL
      const res = await fetch(`http://${originHost}:${port}/health`, { method: 'GET' });
      if (res.ok) {
        API_BASE_URL = `http://${originHost}:${port}/api`;
        localStorage.setItem('apiBaseUrl', API_BASE_URL);
        return API_BASE_URL;
      }
    } catch (_) {}
  }
  // Fallback to default
  API_BASE_URL = 'https://taskmanager-d48w.onrender.com/api';
  localStorage.setItem('apiBaseUrl', API_BASE_URL);
  return API_BASE_URL;
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Initialize base URL by detecting backend if needed
  async init() {
    if (!this.baseURL || this.baseURL.includes('https://taskmanager-d48w.onrender.com/api') && !(import.meta.env.VITE_API_URL)) {
      this.baseURL = await detectApiBaseUrl();
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    if (!this.baseURL) {
      await this.init();
    }
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
        
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  async updateUser(userId, updates) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Profile endpoints
  async updateProfile(updates) {
    return this.request(`/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(payload) {
    return this.request(`/users/password`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, updates) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(projectId = null) {
    const endpoint = projectId ? `/tasks?project=${projectId}` : '/tasks';
    return this.request(endpoint);
  }

  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request(endpoint);
  }

  async updateAdminUser(userId, updates) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAdminUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/projects?${queryString}` : '/admin/projects';
    return this.request(endpoint);
  }

  async deleteAdminProject(projectId) {
    return this.request(`/admin/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async updateAdminProject(projectId, updates) {
    return this.request(`/admin/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getAdminTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/tasks?${queryString}` : '/admin/tasks';
    return this.request(endpoint);
  }

  async deleteAdminTask(taskId) {
    return this.request(`/admin/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async updateAdminTask(taskId, updates) {
    return this.request(`/admin/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Utility methods
  async uploadFile(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (onProgress && event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}/upload`);
      
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      
      xhr.send(formData);
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export { apiService };
export default apiService;
