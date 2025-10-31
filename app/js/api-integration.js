// API Integration Helper - Connects frontend to Netlify Functions + Neon DB
class SuperacaoAPI {
    constructor() {
        this.baseURL = window.location.origin + '/.netlify/functions';
        this.authToken = localStorage.getItem('authToken');
    }

    // Set auth token
    setAuthToken(token) {
        this.authToken = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Helper for API calls
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.authToken) {
            config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // Authentication
    async login(userData) {
        const response = await this.apiCall('/auth', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success) {
            this.setAuthToken(response.sessionToken);
        }

        return response;
    }

    async validateSession() {
        if (!this.authToken) return null;

        try {
            return await this.apiCall('/auth');
        } catch (error) {
            // Token is invalid, clear it
            this.setAuthToken(null);
            return null;
        }
    }

    async logout() {
        this.setAuthToken(null);
        return { success: true };
    }

    // Tasks Management
    async getTasks() {
        return await this.apiCall('/tasks');
    }

    async createTask(taskData) {
        return await this.apiCall('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async completeTask(taskId) {
        return await this.apiCall(`/tasks?id=${taskId}`, {
            method: 'PUT'
        });
    }

    // Ranking
    async getRanking(limit = 10) {
        return await this.apiCall(`/ranking?limit=${limit}`);
    }
}

// Initialize API
const api = new SuperacaoAPI();

// Integration with existing code
// Replace localStorage operations with API calls

// Example: Update login function to use real API
async function loginWithDatabase(userData) {
    try {
        showNotification('Conectando...', 'info');
        
        const response = await api.login(userData);
        
        if (response.success) {
            showNotification(`Bem-vindo, ${response.user.name}!`, 'success');
            updateUIForUser(response.user);
            return response.user;
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Erro no login: ' + error.message, 'error');
        throw error;
    }
}

// Example: Update task creation to use real API
async function createTaskInDatabase(title, description, points = 10, dueDate = null) {
    try {
        const response = await api.createTask({
            title,
            description,
            points,
            dueDate
        });
        
        if (response.success) {
            showNotification('Tarefa criada com sucesso!', 'success');
            return response.task;
        }
    } catch (error) {
        console.error('Create task error:', error);
        showNotification('Erro ao criar tarefa: ' + error.message, 'error');
        throw error;
    }
}

// Example: Update ranking to use real API
async function loadRankingFromDatabase() {
    try {
        const response = await api.getRanking();
        
        if (response.success) {
            return response.ranking;
        }
    } catch (error) {
        console.error('Ranking error:', error);
        // Fallback to mock data if API fails
        return getMockRanking();
    }
}

// Auto-validate session on page load
document.addEventListener('DOMContentLoaded', async () => {
    const session = await api.validateSession();
    if (session && session.success) {
        updateUIForUser(session.user);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SuperacaoAPI, api };
}

// Make available globally
window.SuperacaoAPI = SuperacaoAPI;
window.api = api;