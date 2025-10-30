const activityManager = {
    activities: [],
    
    async loadActivities() {
        const userType = localStorage.getItem('superacao_user_type');
        const currentGroup = localStorage.getItem('superacao_current_group');
        
        if (userType === 'student' && currentGroup) {
            // Load group activities for student
            this.activities = await this.fetchGroupActivities(JSON.parse(currentGroup).id);
        } else {
            // Load personal activities
            this.activities = this.getPersonalActivities();
        }
        
        return this.activities;
    },
    
    async fetchGroupActivities(groupId) {
        // Mock API call - replace with real implementation
        return [
            {
                id: 'group_activity_1',
                title: 'Exercícios de Matemática - Equações',
                description: 'Resolva os exercícios propostos sobre equações do 2º grau',
                type: 'group',
                category: 'study',
                groupId: groupId,
                createdBy: 'Prof. Silva',
                startTime: '08:00',
                endTime: '10:00',
                points: 200,
                difficulty: 'medium',
                youtubeLink: 'https://youtube.com/watch?v=example1',
                image: null,
                status: 'pending',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                isGroupActivity: true
            },
            {
                id: 'group_activity_2',
                title: 'Leitura - Capítulo 5',
                description: 'Leia o capítulo 5 do livro e responda as questões',
                type: 'group',
                category: 'reading',
                groupId: groupId,
                createdBy: 'Prof. Silva',
                startTime: '19:00',
                endTime: '20:30',
                points: 150,
                difficulty: 'easy',
                youtubeLink: null,
                image: null,
                status: 'pending',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                isGroupActivity: true
            }
        ];
    },
    
    getPersonalActivities() {
        // Return saved personal activities
        const saved = localStorage.getItem('superacao-tasks');
        return saved ? JSON.parse(saved) : [];
    },
    
    addActivity(activity) {
        this.activities.push(activity);
        this.savePersonalActivities();
    },
    
    savePersonalActivities() {
        const personalActivities = this.activities.filter(a => !a.isGroupActivity);
        localStorage.setItem('superacao-tasks', JSON.stringify(personalActivities));
    }
};

// App Main JavaScript
class SuperacaoApp {
    constructor() {
        this.currentTab = 'tasks';
        this.userType = null;
        this.currentGroup = null;
        this.currentUser = {
            name: 'Usuário',
            points: 0,
            rank: 0,
            level: 'Iniciante',
            streak: 0,
            completedTasks: 0,
            totalHours: 0,
            achievements: []
        };
        this.tasks = [];
        this.ranking = [];
        
        this.init();
    }

    init() {
        // Check authentication first
        this.checkAuthentication();
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize app after 2 seconds
        setTimeout(() => {
            this.hideLoadingScreen();
            this.initializeApp();
        }, 2000);
    }

    checkAuthentication() {
        const savedUser = localStorage.getItem('superacao_user');
        const userType = localStorage.getItem('superacao_user_type');
        const currentGroup = localStorage.getItem('superacao_current_group');
        
        if (!savedUser) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        // Load authenticated user data
        this.currentUser = { ...this.currentUser, ...JSON.parse(savedUser) };
        this.userType = userType;
        
        if (currentGroup) {
            this.currentGroup = JSON.parse(currentGroup);
        }
        
        // Redirect teachers to their dashboard
        if (userType === 'teacher') {
            window.location.href = 'teacher-dashboard.html';
            return;
        }
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }

    initializeApp() {
        // Initialize storage manager
        this.storage = new StorageManager(this);
        
        this.loadUserData();
        this.updateCurrentTime();
        this.updateGreeting();
        this.updateUserStats();
        this.setupEventListeners();
        this.loadTasks();
        this.loadRanking();
        this.loadAchievements();
        this.updateProfileDisplay();
        
        // Load group activities if student is in a group
        if (this.userType === 'student' && this.currentGroup) {
            this.loadGroupActivities();
            this.showGroupInfo();
        }
        
        // Profile tab is already available in the main navigation
        
        // Initialize notifications
        this.initNotifications();
        
        // Check for URL parameters to open specific tab
        this.checkUrlParameters();
        
        // Update time every minute
        setInterval(() => this.updateCurrentTime(), 60000);
        
        // Update greeting every hour
        setInterval(() => this.updateGreeting(), 3600000);
    }

    showGroupInfo() {
        if (!this.currentGroup) return;
        
        // Add group info to header
        const headerStats = document.querySelector('.header-stats');
        if (headerStats) {
            const groupInfo = document.createElement('div');
            groupInfo.className = 'group-info';
            groupInfo.innerHTML = `
                <div class="stat-item group-badge">
                    <i class="fas fa-users"></i>
                    <div class="stat-details">
                        <span class="stat-label">Grupo</span>
                        <span class="stat-value">${this.currentGroup.name}</span>
                    </div>
                </div>
            `;
            headerStats.appendChild(groupInfo);
        }
    }



    async loadGroupActivities() {
        if (!this.currentGroup) return;
        
        try {
            // Load activities from the group the student belongs to
            const groupActivities = await this.fetchGroupActivities(this.currentGroup.id);
            
            // Add group activities to tasks
            this.addGroupActivitiesToTasks(groupActivities);
            
        } catch (error) {
            console.error('Error loading group activities:', error);
        }
    }

    async fetchGroupActivities(groupId) {
        // Mock implementation - replace with actual API call
        return [
            {
                id: 'group_activity_1',
                title: 'Atividade do Professor: Matemática Básica',
                description: 'Complete os exercícios de matemática básica enviados pelo professor',
                category: 'study',
                startTime: '09:00',
                endTime: '10:30',
                points: 150,
                status: 'pending',
                type: 'group',
                groupId: groupId,
                isGroupActivity: true,
                youtubeLink: 'https://youtube.com/watch?v=example',
                createdBy: 'Professor Silva'
            }
        ];
    }

    addGroupActivitiesToTasks(groupActivities) {
        // Add group activities to tasks if they're not already there
        groupActivities.forEach(activity => {
            const existingTask = this.tasks.find(task => task.id === activity.id);
            if (!existingTask) {
                this.tasks.push(activity);
            }
        });
    }

    openMyProfile() {
        // If we're on the landing page, redirect to app with profile tab
        if (window.location.pathname.includes('index.html') && !window.location.pathname.includes('/app/')) {
            window.location.href = './app/?tab=profile';
            return;
        }
        
        // If we're already in the app, switch to profile tab
        this.switchTab('profile');
        
        // Update profile display with latest data
        this.updateProfileDisplay();
        
        // Show notification that profile was opened
        if (this.showNotification) {
            this.showNotification('Meu Perfil aberto!', 'success');
        }
    }

    initNotifications() {
        // Initialize notification system if available
        if (typeof initNotificationSystem === 'function') {
            this.notificationSystem = initNotificationSystem();
        }
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        // Handle URL parameters
        if (tabParam) {
            // Validate tab parameter
            const validTabs = ['tasks', 'ranking', 'ai-coach', 'profile'];
            const targetTab = validTabs.includes(tabParam) ? tabParam : 'tasks';
            
            // Small delay to ensure the app is fully initialized
            setTimeout(() => {
                this.switchTab(targetTab);
                
                // Specific handling for profile tab
                if (targetTab === 'profile') {
                    this.updateProfileDisplay();
                    this.loadProfileStats();
                    this.loadActivityHistory();
                }
                
                // Update URL without reloading page
                const newUrl = `${window.location.pathname}${targetTab !== 'tasks' ? '?tab=' + targetTab : ''}`;
                window.history.replaceState({ tab: targetTab }, '', newUrl);
                
            }, 150);
        } else {
            // Default to tasks tab if no parameter
            this.switchTab('tasks');
        }
    }

    loadUserData() {
        try {
            let savedUser = null;
            
            // Try to use StorageManager first
            if (this.storage && this.storage.loadUserData) {
                savedUser = this.storage.loadUserData();
            } else {
                // Fallback to localStorage
                const userJson = localStorage.getItem('superacao-user');
                if (userJson) {
                    savedUser = JSON.parse(userJson);
                }
            }
            
            if (savedUser) {
                this.currentUser = { ...this.currentUser, ...savedUser };
            }
        } catch (error) {
            console.warn('Error loading user data:', error);
        }
    }

    saveUserData() {
        localStorage.setItem('superacao-user', JSON.stringify(this.currentUser));
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('currentTime').textContent = timeString;
    }

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = '';
        let motivation = '';

        if (hour < 6) {
            greeting = 'Boa madrugada!';
            motivation = 'Que dedicação! Vamos em frente?';
        } else if (hour < 12) {
            greeting = 'Bom dia!';
            motivation = 'Vamos superar novos limites hoje?';
        } else if (hour < 18) {
            greeting = 'Boa tarde!';
            motivation = 'Continue firme nos seus objetivos!';
        } else {
            greeting = 'Boa noite!';
            motivation = 'Finalizando o dia com chave de ouro?';
        }

        document.getElementById('greetingText').textContent = greeting;
        document.getElementById('motivationalText').textContent = motivation;
    }

    updateUserStats() {
        document.getElementById('userPoints').textContent = this.formatNumber(this.currentUser.points);
        document.getElementById('userRank').textContent = this.currentUser.rank > 0 ? `#${this.currentUser.rank}` : '#--';
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userLevel').textContent = `Nível ${this.currentUser.level}`;
        document.getElementById('streakDays').textContent = this.currentUser.streak;
        document.getElementById('completedTasks').textContent = this.currentUser.completedTasks;
        document.getElementById('totalHours').textContent = `${this.currentUser.totalHours}h`;
        document.getElementById('achievementsCount').textContent = this.currentUser.achievements.length;
        
        // Update ranking display
        document.getElementById('currentPosition').textContent = this.currentUser.rank > 0 ? `#${this.currentUser.rank}` : '#--';
        document.getElementById('totalPoints').textContent = this.formatNumber(this.currentUser.points);
        
        // Calculate position change (mock)
        const change = Math.floor(Math.random() * 10) - 5;
        const changeText = change > 0 ? `+${change} posições hoje` : 
                          change < 0 ? `${change} posições hoje` : 'Posição mantida';
        document.getElementById('positionChange').textContent = changeText;
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddTaskModal();
        });

        // Add task form
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.filterRanking(e.currentTarget.dataset.filter);
            });
        });

        // Chat functionality
        document.getElementById('sendChatBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        // Settings and profile event listeners
        this.setupSettingsListeners();
        this.setupProfileListeners();
    }

    setupSettingsListeners() {
        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Color scheme selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // History filter buttons
        document.querySelectorAll('.history-filter .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.history-filter .filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.loadActivityHistory(e.currentTarget.dataset.period);
            });
        });
    }

    setupProfileListeners() {
        // Load activity history on profile tab switch
        document.querySelector('[data-tab="profile"]')?.addEventListener('click', () => {
            setTimeout(() => {
                this.loadActivityHistory('week');
                this.updateProfileDisplay();
                this.drawWeekProgressChart();
            }, 100);
        });
    }

    drawWeekProgressChart() {
        const canvas = document.getElementById('weekProgressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get last 7 days data
        const weekData = this.getWeekProgressData();
        const maxValue = Math.max(...weekData.values, 1);

        // Chart settings
        const barWidth = width / 7 - 10;
        const maxBarHeight = height - 40;

        // Draw bars
        weekData.values.forEach((value, index) => {
            const barHeight = (value / maxValue) * maxBarHeight;
            const x = index * (barWidth + 10) + 5;
            const y = height - barHeight - 20;

            // Draw bar
            ctx.fillStyle = value > 0 ? '#4CAF50' : '#e9ecef';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw day label
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(weekData.labels[index], x + barWidth/2, height - 5);

            // Draw value
            if (value > 0) {
                ctx.fillStyle = '#333';
                ctx.fillText(value.toString(), x + barWidth/2, y - 5);
            }
        });
    }

    getWeekProgressData() {
        const today = new Date();
        const weekData = {
            labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            values: [0, 0, 0, 0, 0, 0, 0]
        };

        // Count completed tasks for each day of the week
        this.tasks.forEach(task => {
            if (task.status === 'completed') {
                const taskDate = new Date(task.completedAt || task.createdAt);
                const daysDiff = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff >= 0 && daysDiff < 7) {
                    const dayOfWeek = taskDate.getDay();
                    weekData.values[dayOfWeek]++;
                }
            }
        });

        return weekData;
    }

    switchTab(tabName) {
        try {
            // Validate tab name
            const validTabs = ['tasks', 'ranking', 'ai-coach', 'profile'];
            if (!validTabs.includes(tabName)) {
                console.warn(`Invalid tab name: ${tabName}, defaulting to tasks`);
                tabName = 'tasks';
            }

            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const targetTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
            if (targetTabBtn) {
                targetTabBtn.classList.add('active');
            }

            // Update tab content with smooth transition
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            const targetPanel = document.getElementById(tabName);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            this.currentTab = tabName;

            // Update URL if needed
            const currentUrl = new URL(window.location);
            if (tabName === 'tasks') {
                currentUrl.searchParams.delete('tab');
            } else {
                currentUrl.searchParams.set('tab', tabName);
            }
            
            // Update browser history without reloading
            if (window.location.search !== currentUrl.search) {
                window.history.pushState({ tab: tabName }, '', currentUrl);
            }

            // Load specific data for tab
            switch(tabName) {
                case 'tasks':
                    this.loadTasks();
                    break;
                case 'ranking':
                    this.loadRanking();
                    break;
                case 'ai-coach':
                    this.loadAIInsights();
                    break;
                case 'profile':
                    this.updateProfileDisplay();
                    this.loadAchievements();
                    this.loadProfileStats();
                    break;
            }
            
            // Trigger analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tab_switch', {
                    'tab_name': tabName
                });
            }
            
        } catch (error) {
            console.error('Error switching tab:', error);
            // Fallback to tasks tab
            this.switchTab('tasks');
        }
    }

    // Modal functions
    showAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // Set default times
        const now = new Date();
        const startTime = new Date(now.getTime() + 60000); // 1 minute from now
        const endTime = new Date(startTime.getTime() + 1800000); // 30 minutes later
        
        document.getElementById('taskStartTime').value = startTime.toTimeString().slice(0, 5);
        document.getElementById('taskEndTime').value = endTime.toTimeString().slice(0, 5);
    }

    closeAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.clearAddTaskForm();
    }

    showTaskDetailModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('detailTaskTitle').textContent = task.title;
        document.getElementById('detailTaskTime').textContent = `${task.startTime} - ${task.endTime}`;
        document.getElementById('detailTaskCategory').textContent = this.getCategoryName(task.category);
        document.getElementById('detailTaskPoints').textContent = `+${task.points} pontos`;
        document.getElementById('detailTaskDescription').textContent = task.description || 'Sem descrição';

        const statusEl = document.getElementById('detailTaskStatus');
        statusEl.className = `task-status ${task.status}`;
        statusEl.innerHTML = `<i class="${this.getStatusIcon(task.status)}"></i><span>${this.getStatusText(task.status)}</span>`;

        const modal = document.getElementById('taskDetailModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
        modal.dataset.taskId = taskId;
    }

    closeTaskDetailModal() {
        const modal = document.getElementById('taskDetailModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        delete modal.dataset.taskId;
    }

    closeAllModals() {
        document.querySelectorAll('.modal, .modal-overlay').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
        });
        this.clearAddTaskForm();
    }

    clearAddTaskForm() {
        document.getElementById('addTaskForm').reset();
    }

    // Utility functions
    getCategoryName(category) {
        const categories = {
            'exercise': '🏃‍♂️ Exercício',
            'study': '📚 Estudos',
            'work': '💼 Trabalho',
            'meditation': '🧘‍♂️ Meditação',
            'reading': '📖 Leitura',
            'other': '🎯 Outros'
        };
        return categories[category] || '🎯 Outros';
    }

    getStatusIcon(status) {
        const icons = {
            'pending': 'fas fa-clock',
            'in-progress': 'fas fa-play',
            'completed': 'fas fa-check',
            'overdue': 'fas fa-exclamation-triangle'
        };
        return icons[status] || 'fas fa-clock';
    }

    getStatusText(status) {
        const texts = {
            'pending': 'Agendada',
            'in-progress': 'Em andamento',
            'completed': 'Concluída',
            'overdue': 'Atrasada'
        };
        return texts[status] || 'Agendada';
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Notification system
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-in-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Analytics tracking
    trackEvent(eventName, parameters = {}) {
        // Mock analytics tracking
        console.log('Event tracked:', eventName, parameters);
    }

    // Profile & Settings Management
    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            this.loadCurrentSettings();
            modal.style.display = 'flex';
        }
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            this.loadCurrentProfile();
            modal.style.display = 'flex';
        }
    }

    closeEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    loadCurrentSettings() {
        let settings = {};
        
        try {
            // Try to use StorageManager first
            if (this.storage && this.storage.getSettings) {
                settings = this.storage.getSettings() || {};
            } else {
                // Fallback to localStorage
                const savedSettings = localStorage.getItem('superacao-settings');
                settings = savedSettings ? JSON.parse(savedSettings) : {};
            }
        } catch (error) {
            console.warn('Error loading settings:', error);
            settings = {};
        }
        
        // Load profile settings
        const nameInput = document.getElementById('settingsUserName');
        const bioInput = document.getElementById('settingsUserBio');
        
        if (nameInput) nameInput.value = this.currentUser.name || '';
        if (bioInput) bioInput.value = this.currentUser.bio || '';
        
        // Load notification settings
        const pushNotif = document.getElementById('pushNotifications');
        const soundEffects = document.getElementById('soundEffects');
        const taskReminders = document.getElementById('taskReminders');
        
        if (pushNotif) pushNotif.checked = settings.notifications !== false;
        if (soundEffects) soundEffects.checked = settings.soundEffects !== false;
        if (taskReminders) taskReminders.checked = settings.taskReminders !== false;
        
        // Load appearance settings
        const themeSelect = document.getElementById('themeSelect');
        const languageSelect = document.getElementById('languageSelect');
        const weekStartSelect = document.getElementById('weekStartSelect');
        
        if (themeSelect) themeSelect.value = settings.theme || 'light';
        if (languageSelect) languageSelect.value = settings.language || 'pt-BR';
        if (weekStartSelect) weekStartSelect.value = settings.weekStartsOn || 'monday';
        
        // Load data settings
        const autoBackup = document.getElementById('autoBackup');
        if (autoBackup) autoBackup.checked = settings.autoBackup !== false;
        
        // Set avatar selection
        const currentAvatar = this.currentUser.avatar || 'fas fa-user-circle';
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.avatar === currentAvatar) {
                option.classList.add('active');
            }
        });
    }

    loadCurrentProfile() {
        document.getElementById('editProfileName').value = this.currentUser.name || '';
        document.getElementById('editProfileBio').value = this.currentUser.bio || '';
        document.getElementById('editProfileGoal').value = this.currentUser.goal || '';
        
        const avatarIcon = document.getElementById('editProfileAvatar').querySelector('i');
        if (avatarIcon) {
            avatarIcon.className = this.currentUser.avatar || 'fas fa-user-circle';
        }
    }

    saveSettings() {
        try {
            // Get form values
            const settings = {
                notifications: document.getElementById('pushNotifications').checked,
                soundEffects: document.getElementById('soundEffects').checked,
                taskReminders: document.getElementById('taskReminders').checked,
                theme: document.getElementById('themeSelect').value,
                language: document.getElementById('languageSelect').value,
                weekStartsOn: document.getElementById('weekStartSelect').value,
                autoBackup: document.getElementById('autoBackup').checked
            };

            // Update user profile info
            const newName = document.getElementById('settingsUserName').value.trim();
            const newBio = document.getElementById('settingsUserBio').value.trim();
            const selectedAvatar = document.querySelector('.avatar-option.active')?.dataset.avatar;

            if (newName) {
                this.currentUser.name = newName;
            }
            this.currentUser.bio = newBio;
            if (selectedAvatar) {
                this.currentUser.avatar = selectedAvatar;
            }

            // Save to storage
            if (this.storage) {
                this.storage.saveSettings(settings);
                this.storage.saveUserData(this.currentUser);
            } else {
                localStorage.setItem('superacao-settings', JSON.stringify(settings));
                localStorage.setItem('superacao-user', JSON.stringify(this.currentUser));
            }

            // Apply settings
            this.applySettings(settings);
            this.updateUserStats();
            this.updateProfileDisplay();

            // Close modal and show success
            this.closeSettingsModal();
            this.showNotification('Configurações salvas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações', 'error');
        }
    }

    saveProfileChanges() {
        try {
            const name = document.getElementById('editProfileName').value.trim();
            const bio = document.getElementById('editProfileBio').value.trim();
            const goal = document.getElementById('editProfileGoal').value.trim();

            if (!name) {
                this.showNotification('Nome é obrigatório', 'error');
                return;
            }

            this.currentUser.name = name;
            this.currentUser.bio = bio;
            this.currentUser.goal = goal;

            // Save to storage
            if (this.storage) {
                this.storage.saveUserData(this.currentUser);
            } else {
                localStorage.setItem('superacao-user', JSON.stringify(this.currentUser));
            }

            this.updateUserStats();
            this.updateProfileDisplay();
            this.closeEditProfileModal();
            this.showNotification('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            this.showNotification('Erro ao salvar perfil', 'error');
        }
    }

    applySettings(settings) {
        // Apply theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        // Store settings for other components
        this.userSettings = settings;
    }

    updateProfileDisplay() {
        // Update profile info display
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userBio').textContent = this.currentUser.bio || 'Definir biografia nas configurações';
        
        const goalElement = document.getElementById('userGoal');
        if (goalElement) {
            goalElement.innerHTML = `
                <i class="fas fa-target"></i>
                <span>${this.currentUser.goal || 'Definir meta principal'}</span>
            `;
        }
        
        // Update avatar
        if (this.currentUser.avatar) {
            const avatarElements = document.querySelectorAll('#profileAvatar i, .profile-avatar i');
            avatarElements.forEach(element => {
                element.className = this.currentUser.avatar;
            });
        }

        // Update joined date
        const joinedElement = document.getElementById('joinedDate');
        if (joinedElement && this.currentUser.createdAt) {
            const joinDate = new Date(this.currentUser.createdAt);
            const options = { year: 'numeric', month: 'long' };
            joinedElement.innerHTML = `
                <i class="fas fa-calendar"></i> 
                Membro desde ${joinDate.toLocaleDateString('pt-BR', options)}
            `;
        }
    }

    loadProfileStats() {
        try {
            // Calculate streak days
            const streakDays = this.calculateStreak();
            const streakElement = document.getElementById('streakDays');
            if (streakElement) {
                streakElement.textContent = streakDays;
            }

            // Calculate completed tasks
            const completedTasks = this.tasks.filter(task => task.completed).length;
            const completedElement = document.getElementById('completedTasks');
            if (completedElement) {
                completedElement.textContent = completedTasks;
            }

            // Calculate total focused hours
            const totalHours = this.calculateTotalHours();
            const hoursElement = document.getElementById('totalHours');
            if (hoursElement) {
                hoursElement.textContent = `${totalHours}h`;
            }

            // Count achievements
            const achievements = this.getAchievements();
            const achievementsElement = document.getElementById('achievementsCount');
            if (achievementsElement) {
                achievementsElement.textContent = achievements.length;
            }

            // Update user level
            const level = this.calculateUserLevel();
            const levelElement = document.getElementById('userLevel');
            if (levelElement) {
                levelElement.textContent = `Nível ${level.name}`;
            }

        } catch (error) {
            console.error('Error loading profile stats:', error);
        }
    }

    loadActivityHistory() {
        try {
            const historyList = document.getElementById('activityHistoryList');
            if (!historyList) return;

            const recentActivities = this.getRecentActivities();
            
            if (recentActivities.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <i class="fas fa-history"></i>
                        <p>Nenhuma atividade ainda</p>
                        <small>Complete algumas tarefas para ver seu histórico aqui</small>
                    </div>
                `;
                return;
            }

            historyList.innerHTML = recentActivities.map(activity => `
                <div class="history-item ${activity.type}">
                    <div class="history-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="history-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <span class="history-time">${activity.timeAgo}</span>
                    </div>
                    <div class="history-points">
                        +${activity.points}
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading activity history:', error);
        }
    }

    calculateStreak() {
        try {
            const completedTasks = this.tasks
                .filter(task => task.completed)
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

            if (completedTasks.length === 0) return 0;

            let streak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            for (let i = 0; i < completedTasks.length; i++) {
                const taskDate = new Date(completedTasks[i].completedAt);
                taskDate.setHours(0, 0, 0, 0);

                const daysDiff = Math.floor((currentDate - taskDate) / (1000 * 60 * 60 * 24));

                if (daysDiff === streak) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else if (daysDiff > streak) {
                    break;
                }
            }

            return streak;
        } catch (error) {
            console.error('Error calculating streak:', error);
            return 0;
        }
    }

    calculateTotalHours() {
        try {
            const completedTasks = this.tasks.filter(task => task.completed);
            let totalMinutes = 0;

            completedTasks.forEach(task => {
                if (task.startTime && task.endTime) {
                    const start = new Date(`2000-01-01 ${task.startTime}`);
                    const end = new Date(`2000-01-01 ${task.endTime}`);
                    const diff = (end - start) / (1000 * 60); // Minutes
                    totalMinutes += diff;
                }
            });

            return Math.round(totalMinutes / 60 * 10) / 10; // Hours with 1 decimal
        } catch (error) {
            console.error('Error calculating total hours:', error);
            return 0;
        }
    }

    calculateUserLevel() {
        const totalPoints = this.currentUser.points || 0;
        
        const levels = [
            { min: 0, max: 99, name: 'Iniciante', color: '#9E9E9E' },
            { min: 100, max: 299, name: 'Aprendiz', color: '#4CAF50' },
            { min: 300, max: 599, name: 'Dedicado', color: '#2196F3' },
            { min: 600, max: 999, name: 'Focado', color: '#FF9800' },
            { min: 1000, max: 1999, name: 'Expert', color: '#9C27B0' },
            { min: 2000, max: 4999, name: 'Mestre', color: '#F44336' },
            { min: 5000, max: Infinity, name: 'Lenda', color: '#FFD700' }
        ];

        return levels.find(level => totalPoints >= level.min && totalPoints <= level.max) || levels[0];
    }

    getRecentActivities() {
        try {
            const activities = [];
            
            // Add completed tasks
            this.tasks
                .filter(task => task.completed && task.completedAt)
                .slice(0, 10)
                .forEach(task => {
                    activities.push({
                        type: 'task',
                        title: task.title,
                        description: `Tarefa concluída`,
                        icon: 'fas fa-check-circle',
                        points: task.points || 50,
                        timeAgo: this.getTimeAgo(task.completedAt),
                        timestamp: new Date(task.completedAt)
                    });
                });

            // Add achievements
            const achievements = this.getAchievements();
            achievements.slice(0, 5).forEach(achievement => {
                activities.push({
                    type: 'achievement',
                    title: achievement.title,
                    description: achievement.description,
                    icon: 'fas fa-trophy',
                    points: achievement.points,
                    timeAgo: this.getTimeAgo(achievement.unlockedAt),
                    timestamp: new Date(achievement.unlockedAt)
                });
            });

            // Sort by timestamp and return recent ones
            return activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10);
                
        } catch (error) {
            console.error('Error getting recent activities:', error);
            return [];
        }
    }

    getTimeAgo(timestamp) {
        try {
            const now = new Date();
            const past = new Date(timestamp);
            const diffInSeconds = Math.floor((now - past) / 1000);

            if (diffInSeconds < 60) return 'agora';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
            if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
            
            return past.toLocaleDateString('pt-BR');
        } catch (error) {
            return 'há pouco tempo';
        }
    }

    exportUserData() {
        try {
            const userData = {
                profile: this.currentUser,
                tasks: this.tasks,
                settings: this.userSettings || {},
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(userData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `superacao-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.showNotification('Erro ao exportar dados', 'error');
        }
    }

    clearAllData() {
        if (confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os seus dados (perfil, tarefas, configurações). Esta ação não pode ser desfeita. Tem certeza?')) {
            try {
                // Clear localStorage
                const keysToRemove = [
                    'superacao-user',
                    'superacao-tasks', 
                    'superacao-settings',
                    'superacao-chat',
                    'superacao-achievements'
                ];
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                this.showNotification('Todos os dados foram apagados', 'success');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                console.error('Erro ao limpar dados:', error);
                this.showNotification('Erro ao limpar dados', 'error');
            }
        }
    }

    loadActivityHistory(period = 'week') {
        const historyList = document.getElementById('activityHistoryList');
        if (!historyList) return;

        // Filter tasks based on period
        const now = new Date();
        let filteredTasks = [];

        switch (period) {
            case 'week':
                filteredTasks = this.tasks.filter(task => {
                    const taskDate = new Date(task.createdAt || task.date);
                    const daysDiff = (now - taskDate) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 7 && task.status === 'completed';
                });
                break;
            case 'month':
                filteredTasks = this.tasks.filter(task => {
                    const taskDate = new Date(task.createdAt || task.date);
                    const daysDiff = (now - taskDate) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 30 && task.status === 'completed';
                });
                break;
            case 'all':
            default:
                filteredTasks = this.tasks.filter(task => task.status === 'completed');
                break;
        }

        // Sort by date (most recent first)
        filteredTasks.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

        if (filteredTasks.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>Nenhuma atividade encontrada para este período</p>
                </div>
            `;
            return;
        }

        const historyHTML = filteredTasks.slice(0, 10).map(task => {
            const taskDate = new Date(task.createdAt || task.date);
            const categoryIcon = this.getCategoryIcon(task.category);
            const timeAgo = this.getTimeAgo(taskDate);

            return `
                <div class="history-item">
                    <div class="history-icon" style="background: ${this.getCategoryColor(task.category)}20; color: ${this.getCategoryColor(task.category)};">
                        <i class="${categoryIcon}"></i>
                    </div>
                    <div class="history-content">
                        <div class="history-title">${task.title}</div>
                        <div class="history-details">
                            ${task.category} • ${timeAgo} • +${task.points || 10} pontos
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        historyList.innerHTML = historyHTML;
    }

    getCategoryColor(category) {
        const colors = {
            'Estudos': '#4CAF50',
            'Exercícios': '#FF9800',
            'Trabalho': '#2196F3',
            'Pessoal': '#9C27B0',
            'Saúde': '#F44336',
            'Lazer': '#00BCD4'
        };
        return colors[category] || '#6c757d';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays} dias atrás`;
        return date.toLocaleDateString('pt-BR');
    }

    // Initialize the app when DOM is loaded
    static initialize() {
        return new SuperacaoApp();
    }
}

// Global functions for modal interactions
function showAddTaskModal() {
    if (window.app && window.app.showAddTaskModal) {
        window.app.showAddTaskModal();
    } else {
        console.error('Aplicação não inicializada ou método showAddTaskModal não disponível');
    }
}

function closeAddTaskModal() {
    if (window.app && window.app.closeAddTaskModal) {
        window.app.closeAddTaskModal();
    } else {
        console.error('Aplicação não inicializada ou método closeAddTaskModal não disponível');
    }
}

function showTaskDetailModal(taskId) {
    if (window.app && window.app.showTaskDetailModal) {
        window.app.showTaskDetailModal(taskId);
    } else {
        console.error('Aplicação não inicializada ou método showTaskDetailModal não disponível');
    }
}

function closeTaskDetailModal() {
    if (window.app && window.app.closeTaskDetailModal) {
        window.app.closeTaskDetailModal();
    } else {
        console.error('Aplicação não inicializada ou método closeTaskDetailModal não disponível');
    }
}

function completeTask() {
    const modal = document.getElementById('taskDetailModal');
    const taskId = modal.dataset.taskId;
    if (taskId && window.app && window.app.completeTaskById) {
        window.app.completeTaskById(taskId);
    } else if (!window.app) {
        console.error('Aplicação não inicializada');
    }
}

function startTask() {
    const modal = document.getElementById('taskDetailModal');
    const taskId = modal.dataset.taskId;
    if (taskId && window.app && window.app.startTaskById) {
        window.app.startTaskById(taskId);
    } else if (!window.app) {
        console.error('Aplicação não inicializada');
    }
}

function deleteTask() {
    const modal = document.getElementById('taskDetailModal');
    const taskId = modal.dataset.taskId;
    if (taskId && window.app && window.app.deleteTaskById) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            window.app.deleteTaskById(taskId);
        }
    } else if (!window.app) {
        console.error('Aplicação não inicializada');
    }
}

function openDemoModal() {
    if (window.app && window.app.showNotification) {
        window.app.showNotification('Demo em breve! Continue usando o app.', 'warning');
    } else {
        console.error('Aplicação não inicializada ou método showNotification não disponível');
    }
}

function openMyProfile() {
    if (window.app && window.app.openMyProfile) {
        window.app.openMyProfile();
    } else {
        console.error('Aplicação não inicializada ou método openMyProfile não disponível');
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('superacao_user');
        localStorage.removeItem('superacao_user_type');
        localStorage.removeItem('superacao_current_group');
        window.location.href = 'login.html';
    }
}

// Settings Modal Functions
function showSettingsModal() {
    if (window.app && window.app.showSettingsModal) {
        window.app.showSettingsModal();
    } else {
        console.error('App não inicializado ou método não encontrado');
    }
}

function closeSettingsModal() {
    if (window.app && window.app.closeSettingsModal) {
        window.app.closeSettingsModal();
    } else {
        console.error('Aplicação não inicializada ou método closeSettingsModal não disponível');
    }
}

function saveSettings() {
    if (window.app && window.app.saveSettings) {
        window.app.saveSettings();
    } else {
        console.error('Aplicação não inicializada ou método saveSettings não disponível');
    }
}

// Profile Edit Modal Functions
function showEditProfileModal() {
    if (window.app && window.app.showEditProfileModal) {
        window.app.showEditProfileModal();
    } else {
        console.error('App não inicializado ou método não encontrado');
    }
}

function closeEditProfileModal() {
    if (window.app && window.app.closeEditProfileModal) {
        window.app.closeEditProfileModal();
    } else {
        console.error('Aplicação não inicializada ou método closeEditProfileModal não disponível');
    }
}

function saveProfileChanges() {
    if (window.app && window.app.saveProfileChanges) {
        window.app.saveProfileChanges();
    } else {
        console.error('Aplicação não inicializada ou método saveProfileChanges não disponível');
    }
}

// Data Management Functions
function exportUserData() {
    if (window.app && window.app.exportUserData) {
        window.app.exportUserData();
    } else {
        console.error('Aplicação não inicializada ou método exportUserData não disponível');
    }
}

function clearAllData() {
    if (window.app && window.app.clearAllData) {
        window.app.clearAllData();
    } else {
        console.error('Aplicação não inicializada ou método clearAllData não disponível');
    }
}

function showAvatarSelection() {
    // This function can show a larger avatar selection modal if needed
    console.log('Show avatar selection');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.app = SuperacaoApp.initialize();
        console.log('✅ Superação App inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar o app:', error);
        // Fallback initialization
        try {
            window.app = new SuperacaoApp();
        } catch (fallbackError) {
            console.error('❌ Erro no fallback de inicialização:', fallbackError);
        }
    }
});