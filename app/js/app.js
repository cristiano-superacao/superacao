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
        this.loadUserData();
        this.updateCurrentTime();
        this.updateGreeting();
        this.updateUserStats();
        this.setupEventListeners();
        this.loadTasks();
        this.loadRanking();
        this.loadAchievements();
        
        // Load group activities if student is in a group
        if (this.userType === 'student' && this.currentGroup) {
            this.loadGroupActivities();
            this.showGroupInfo();
        }
        
        // Show profile access
        this.showProfileAccess();
        
        // Initialize notifications
        this.initNotifications();
        
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

    showProfileAccess() {
        // Add profile button to navigation
        const navigation = document.querySelector('.tab-navigation');
        if (navigation) {
            const profileBtn = document.createElement('button');
            profileBtn.className = 'tab-btn profile-btn';
            profileBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Meu Perfil</span>
            `;
            profileBtn.addEventListener('click', () => this.openMyProfile());
            navigation.appendChild(profileBtn);
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
        // Open profile modal or redirect to profile page
        alert(`Perfil de ${this.currentUser.name}\nTipo: ${this.userType === 'student' ? 'Aluno' : 'Professor'}\nGrupo: ${this.currentGroup ? this.currentGroup.name : 'Nenhum'}`);
    }

    initNotifications() {
        // Initialize notification system if available
        if (typeof initNotificationSystem === 'function') {
            this.notificationSystem = initNotificationSystem();
        }
    }

    loadUserData() {
        const savedUser = localStorage.getItem('superacao-user');
        if (savedUser) {
            this.currentUser = { ...this.currentUser, ...JSON.parse(savedUser) };
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
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

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
                this.loadAchievements();
                break;
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
        document.querySelectorAll('.modal').forEach(modal => {
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

    // Initialize the app when DOM is loaded
    static initialize() {
        return new SuperacaoApp();
    }
}

// Global functions for modal interactions
function showAddTaskModal() {
    window.app.showAddTaskModal();
}

function closeAddTaskModal() {
    window.app.closeAddTaskModal();
}

function showTaskDetailModal(taskId) {
    window.app.showTaskDetailModal(taskId);
}

function closeTaskDetailModal() {
    window.app.closeTaskDetailModal();
}

function completeTask() {
    const modal = document.getElementById('taskDetailModal');
    const taskId = modal.dataset.taskId;
    if (taskId) {
        window.app.completeTaskById(taskId);
    }
}

function startTask() {
    const modal = document.getElementById('taskDetailModal');
    const taskId = modal.dataset.taskId;
    if (taskId) {
        window.app.startTaskById(taskId);
    }
}

function deleteTask() {
    const modal = document.getElementById('taskDetailModal');
    const taskId = modal.dataset.taskId;
    if (taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            window.app.deleteTaskById(taskId);
        }
    }
}

function openDemoModal() {
    window.app.showNotification('Demo em breve! Continue usando o app.', 'warning');
}

function openMyProfile() {
    window.app.openMyProfile();
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('superacao_user');
        localStorage.removeItem('superacao_user_type');
        localStorage.removeItem('superacao_current_group');
        window.location.href = 'login.html';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = SuperacaoApp.initialize();
});