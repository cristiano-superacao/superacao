// Local Storage Management System
class StorageManager {
    constructor() {
        this.storageKeys = {
            USER: 'superacao-user',
            TASKS: 'superacao-tasks',
            RANKING: 'superacao-ranking',
            CHAT: 'superacao-chat',
            SETTINGS: 'superacao-settings',
            ACHIEVEMENTS: 'superacao-achievements',
            STATISTICS: 'superacao-statistics',
            LAST_SYNC: 'superacao-last-sync'
        };
        
        this.initializeStorage();
    }

    initializeStorage() {
        // Check if storage is available
        if (!this.isStorageAvailable()) {
            console.warn('LocalStorage is not available. Using memory storage.');
            this.useMemoryStorage = true;
            this.memoryStorage = {};
        }

        // Initialize default data if needed
        this.initializeDefaultData();
    }

    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    initializeDefaultData() {
        // Initialize user data if not exists
        if (!this.get(this.storageKeys.USER)) {
            this.set(this.storageKeys.USER, {
                name: 'Usuário',
                points: 0,
                rank: 0,
                level: 'Iniciante',
                streak: 0,
                completedTasks: 0,
                totalHours: 0,
                achievements: [],
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString()
            });
        }

        // Initialize settings if not exists
        if (!this.get(this.storageKeys.SETTINGS)) {
            this.set(this.storageKeys.SETTINGS, {
                notifications: true,
                soundEnabled: true,
                theme: 'light',
                language: 'pt-BR',
                autoSync: true,
                reminderMinutes: 5,
                dailyGoal: 3
            });
        }

        // Initialize statistics if not exists
        if (!this.get(this.storageKeys.STATISTICS)) {
            this.set(this.storageKeys.STATISTICS, {
                totalTasksCreated: 0,
                totalTasksCompleted: 0,
                totalTimeSpent: 0,
                averageCompletionRate: 0,
                bestStreak: 0,
                categoriesStats: {},
                weeklyStats: [],
                monthlyStats: []
            });
        }
    }

    // Basic storage operations
    set(key, value) {
        try {
            if (this.useMemoryStorage) {
                this.memoryStorage[key] = JSON.stringify(value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }

    get(key) {
        try {
            let data;
            if (this.useMemoryStorage) {
                data = this.memoryStorage[key];
            } else {
                data = localStorage.getItem(key);
            }
            
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }

    remove(key) {
        try {
            if (this.useMemoryStorage) {
                delete this.memoryStorage[key];
            } else {
                localStorage.removeItem(key);
            }
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }

    clear() {
        try {
            if (this.useMemoryStorage) {
                this.memoryStorage = {};
            } else {
                // Only clear Superacao-related data
                Object.values(this.storageKeys).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            this.initializeDefaultData();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Specialized data operations
    saveUserData(userData) {
        const currentUser = this.get(this.storageKeys.USER) || {};
        const updatedUser = { ...currentUser, ...userData, lastActive: new Date().toISOString() };
        return this.set(this.storageKeys.USER, updatedUser);
    }

    getUser() {
        return this.get(this.storageKeys.USER);
    }

    saveTasks(tasks) {
        return this.set(this.storageKeys.TASKS, tasks);
    }

    getTasks() {
        return this.get(this.storageKeys.TASKS) || [];
    }

    saveRanking(ranking) {
        return this.set(this.storageKeys.RANKING, ranking);
    }

    getRanking() {
        return this.get(this.storageKeys.RANKING) || [];
    }

    saveChatHistory(chatHistory) {
        return this.set(this.storageKeys.CHAT, chatHistory);
    }

    getChatHistory() {
        return this.get(this.storageKeys.CHAT) || [];
    }

    saveSettings(settings) {
        const currentSettings = this.get(this.storageKeys.SETTINGS) || {};
        const updatedSettings = { ...currentSettings, ...settings };
        return this.set(this.storageKeys.SETTINGS, updatedSettings);
    }

    getSettings() {
        return this.get(this.storageKeys.SETTINGS);
    }

    // Statistics management
    updateStatistics(stats) {
        const currentStats = this.get(this.storageKeys.STATISTICS) || {};
        const updatedStats = { ...currentStats, ...stats };
        return this.set(this.storageKeys.STATISTICS, updatedStats);
    }

    getStatistics() {
        return this.get(this.storageKeys.STATISTICS);
    }

    // Data export/import
    exportData() {
        const data = {};
        Object.values(this.storageKeys).forEach(key => {
            data[key] = this.get(key);
        });
        
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: data
        };
    }

    importData(importData) {
        try {
            if (!importData.data || !importData.version) {
                throw new Error('Invalid import data format');
            }

            // Backup current data
            const backup = this.exportData();
            this.set('superacao-backup-' + Date.now(), backup);

            // Import new data
            Object.entries(importData.data).forEach(([key, value]) => {
                if (Object.values(this.storageKeys).includes(key)) {
                    this.set(key, value);
                }
            });

            return { success: true, message: 'Dados importados com sucesso!' };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, message: 'Erro ao importar dados: ' + error.message };
        }
    }

    // Data cleanup and optimization
    cleanupOldData() {
        try {
            // Remove old chat messages (keep last 100)
            const chatHistory = this.getChatHistory();
            if (chatHistory.length > 100) {
                const recentChat = chatHistory.slice(-100);
                this.saveChatHistory(recentChat);
            }

            // Remove old backup files
            if (!this.useMemoryStorage) {
                const keys = Object.keys(localStorage);
                const backupKeys = keys.filter(key => key.startsWith('superacao-backup-'));
                
                // Keep only last 3 backups
                if (backupKeys.length > 3) {
                    backupKeys.slice(0, -3).forEach(key => {
                        localStorage.removeItem(key);
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Error cleaning up data:', error);
            return false;
        }
    }

    // Storage usage information
    getStorageInfo() {
        if (this.useMemoryStorage) {
            const memorySize = JSON.stringify(this.memoryStorage).length;
            return {
                type: 'memory',
                used: memorySize,
                available: 'unlimited',
                percentage: 0
            };
        }

        try {
            let totalSize = 0;
            let superacaoSize = 0;

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage[key].length;
                    totalSize += size;
                    
                    if (key.startsWith('superacao-')) {
                        superacaoSize += size;
                    }
                }
            }

            // Rough estimate of localStorage limit (5MB for most browsers)
            const limit = 5 * 1024 * 1024;
            const percentage = (totalSize / limit) * 100;

            return {
                type: 'localStorage',
                used: totalSize,
                superacaoUsed: superacaoSize,
                available: limit - totalSize,
                limit: limit,
                percentage: Math.round(percentage * 100) / 100
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }

    // Data validation
    validateData(key, data) {
        switch (key) {
            case this.storageKeys.USER:
                return this.validateUserData(data);
            case this.storageKeys.TASKS:
                return this.validateTasksData(data);
            case this.storageKeys.SETTINGS:
                return this.validateSettingsData(data);
            default:
                return { valid: true };
        }
    }

    validateUserData(data) {
        const required = ['name', 'points', 'streak', 'completedTasks'];
        const missing = required.filter(field => !(field in data));
        
        if (missing.length > 0) {
            return {
                valid: false,
                errors: [`Missing required fields: ${missing.join(', ')}`]
            };
        }

        const errors = [];
        if (typeof data.points !== 'number' || data.points < 0) {
            errors.push('Points must be a non-negative number');
        }
        if (typeof data.streak !== 'number' || data.streak < 0) {
            errors.push('Streak must be a non-negative number');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    validateTasksData(data) {
        if (!Array.isArray(data)) {
            return {
                valid: false,
                errors: ['Tasks data must be an array']
            };
        }

        const errors = [];
        data.forEach((task, index) => {
            if (!task.id || !task.title || !task.startTime || !task.endTime) {
                errors.push(`Task ${index}: Missing required fields`);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    validateSettingsData(data) {
        const validSettings = [
            'notifications', 'soundEnabled', 'theme', 'language', 
            'autoSync', 'reminderMinutes', 'dailyGoal'
        ];
        
        const invalidKeys = Object.keys(data).filter(key => !validSettings.includes(key));
        
        return {
            valid: invalidKeys.length === 0,
            errors: invalidKeys.length > 0 ? [`Invalid settings: ${invalidKeys.join(', ')}`] : []
        };
    }

    // Sync functionality (for future cloud integration)
    markForSync(key) {
        const syncQueue = this.get('superacao-sync-queue') || [];
        if (!syncQueue.includes(key)) {
            syncQueue.push(key);
            this.set('superacao-sync-queue', syncQueue);
        }
    }

    getSyncQueue() {
        return this.get('superacao-sync-queue') || [];
    }

    clearSyncQueue() {
        return this.remove('superacao-sync-queue');
    }

    setLastSyncTime() {
        return this.set(this.storageKeys.LAST_SYNC, new Date().toISOString());
    }

    getLastSyncTime() {
        return this.get(this.storageKeys.LAST_SYNC);
    }
}

// Extend main app with storage functionality
SuperacaoApp.prototype.initializeStorage = function() {
    this.storage = new StorageManager();
    
    // Load user data from storage
    const userData = this.storage.getUser();
    if (userData) {
        this.currentUser = { ...this.currentUser, ...userData };
    }
};

SuperacaoApp.prototype.saveUserData = function() {
    if (this.storage) {
        return this.storage.saveUser(this.currentUser);
    }
    // Fallback to localStorage
    localStorage.setItem('superacao-user', JSON.stringify(this.currentUser));
};

SuperacaoApp.prototype.loadAchievements = function() {
    const achievements = this.currentUser.achievements || [];
    const container = document.getElementById('achievementsList');
    
    if (!container) return;
    
    if (achievements.length === 0) {
        container.innerHTML = `
            <div class="empty-achievements">
                <i class="fas fa-trophy"></i>
                <p>Suas conquistas aparecerão aqui!</p>
                <small>Complete tarefas para desbloquear achievements</small>
            </div>
        `;
        return;
    }

    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-item">
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <small>+${achievement.points} pontos</small>
            </div>
        </div>
    `).join('');
};