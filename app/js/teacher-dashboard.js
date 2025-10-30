// Teacher Dashboard Main Controller
class TeacherDashboard {
    constructor() {
        this.currentUser = null;
        this.groups = [];
        this.activities = [];
        this.analytics = {};
        this.init();
    }

    async init() {
        // Check authentication
        await this.checkAuth();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Show dashboard
        document.getElementById('teacherApp').style.display = 'flex';
    }

    checkAuth() {
        const savedUser = localStorage.getItem('superacao_user');
        const userType = localStorage.getItem('superacao_user_type');
        
        if (!savedUser || userType !== 'teacher') {
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = JSON.parse(savedUser);
        this.updateUserInfo();
    }

    updateUserInfo() {
        document.getElementById('teacherName').textContent = this.currentUser.name;
        document.getElementById('teacherSubject').textContent = this.currentUser.subject || 'Professor';
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Create Group Form
        document.getElementById('createGroupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateGroup();
        });

        // Create Activity Form
        document.getElementById('createActivityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateActivity();
        });

        // Activity Filter
        document.getElementById('activityFilter').addEventListener('change', (e) => {
            this.filterActivities(e.target.value);
        });

        // Ranking Group Filter
        document.getElementById('rankingGroupFilter').addEventListener('change', (e) => {
            this.loadGroupRanking(e.target.value);
        });

        // Analytics Time Range
        document.getElementById('analyticsTimeRange').addEventListener('change', (e) => {
            this.loadAnalytics(e.target.value);
        });

        // File upload preview
        document.getElementById('activityImage').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });
    }

    async loadInitialData() {
        try {
            // Load user's groups
            this.groups = await this.loadGroups();
            
            // Load activities
            this.activities = await this.loadActivities();
            
            // Update UI
            this.updateDashboardStats();
            this.renderOverview();
            this.renderGroups();
            this.renderActivities();
            this.updateFilters();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Erro ao carregar dados', 'error');
        }
    }

    async loadGroups() {
        // Load groups from localStorage - no mock data
        const savedGroups = JSON.parse(localStorage.getItem('teacher_groups') || '[]');
        return savedGroups;
    }

    async loadActivities() {
        // Load activities from localStorage - no mock data
        const savedActivities = JSON.parse(localStorage.getItem('teacher_activities') || '[]');
        return savedActivities;
    }

    updateDashboardStats() {
        const totalStudents = this.groups.reduce((sum, group) => sum + group.members, 0);
        const totalActivities = this.activities.length;
        const avgCompletion = this.groups.length > 0 ? 
            Math.round(this.groups.reduce((sum, group) => sum + group.avgCompletion, 0) / this.groups.length) : 0;

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('totalActivities').textContent = totalActivities;
        document.getElementById('avgCompletion').textContent = avgCompletion + '%';

        // Update navigation counts
        document.getElementById('groupsCount').textContent = this.groups.length;
        document.getElementById('activitiesCount').textContent = totalActivities;
    }

    renderOverview() {
        this.renderRecentGroups();
        this.renderRecentActivities();
        this.renderPerformanceChart();
    }

    renderRecentGroups() {
        const container = document.getElementById('recentGroups');
        const recentGroups = this.groups.slice(0, 3);

        if (recentGroups.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">Nenhum grupo criado ainda</p>';
            return;
        }

        container.innerHTML = recentGroups.map(group => `
            <div class="recent-item" onclick="viewGroup('${group.id}')">
                <div class="recent-item-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="recent-item-info">
                    <h4>${group.name}</h4>
                    <p>${group.members} membros • ${group.activities} atividades</p>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivities() {
        const container = document.getElementById('recentActivities');
        const recentActivities = this.activities.slice(0, 3);

        if (recentActivities.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">Nenhuma atividade criada ainda</p>';
            return;
        }

        container.innerHTML = recentActivities.map(activity => `
            <div class="recent-item" onclick="viewActivity('${activity.id}')">
                <div class="recent-item-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="recent-item-info">
                    <h4>${activity.title}</h4>
                    <p>${activity.groupName} • ${activity.completions}/${activity.totalStudents} concluídas</p>
                </div>
            </div>
        `).join('');
    }

    renderPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        // Mock data for the week
        const data = {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Atividades Concluídas',
                data: [12, 19, 15, 25, 22, 8, 5],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    renderGroups() {
        const container = document.getElementById('groupsList');
        const emptyState = document.getElementById('groupsEmptyState');

        if (this.groups.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = this.groups.map(group => `
            <div class="group-card" onclick="viewGroup('${group.id}')">
                <div class="group-header">
                    <div class="group-info">
                        <h3>${group.name}</h3>
                        <p>${group.description}</p>
                    </div>
                    <div class="group-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); editGroup('${group.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); shareGroup('${group.id}')" title="Compartilhar">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); deleteGroup('${group.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="group-stats">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${group.members} membros</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-tasks"></i>
                        <span>${group.activities} atividades</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        <span>${group.avgCompletion}% conclusão</span>
                    </div>
                </div>
                
                <div class="group-code">
                    <div class="group-code-label">Código do Grupo</div>
                    <div class="group-code-value">${group.code}</div>
                </div>
            </div>
        `).join('');
    }

    renderActivities() {
        const container = document.getElementById('activitiesList');
        const emptyState = document.getElementById('activitiesEmptyState');

        if (this.activities.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = this.activities.map(activity => {
            const completionRate = Math.round((activity.completions / activity.totalStudents) * 100);
            const isActive = activity.status === 'active';
            const startDate = new Date(activity.startDate);
            const endDate = new Date(activity.endDate);
            
            return `
                <div class="activity-card" onclick="viewActivity('${activity.id}')">
                    <div class="activity-header">
                        <div class="activity-info">
                            <h3>${activity.title}</h3>
                            <p>${activity.description.substring(0, 100)}...</p>
                        </div>
                        <div class="activity-actions">
                            <button class="action-btn" onclick="event.stopPropagation(); editActivity('${activity.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn" onclick="event.stopPropagation(); duplicateActivity('${activity.id}')" title="Duplicar">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="action-btn" onclick="event.stopPropagation(); deleteActivity('${activity.id}')" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="activity-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${activity.groupName}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${activity.completions}/${activity.totalStudents} concluídas</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-coins"></i>
                            <span>${activity.points} pontos</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calendar"></i>
                            <span>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="activity-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionRate}%"></div>
                        </div>
                        <span class="progress-text">${completionRate}% concluída</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateFilters() {
        // Update activity group filter
        const activityGroupSelect = document.getElementById('activityGroup');
        activityGroupSelect.innerHTML = '<option value="">Selecione um grupo</option>' +
            this.groups.map(group => `<option value="${group.id}">${group.name}</option>`).join('');

        // Update ranking group filter
        const rankingGroupSelect = document.getElementById('rankingGroupFilter');
        rankingGroupSelect.innerHTML = '<option value="">Selecione um grupo</option>' +
            this.groups.map(group => `<option value="${group.id}">${group.name}</option>`).join('');
    }

    // Modal Methods
    showCreateGroupModal() {
        document.getElementById('createGroupModal').classList.add('show');
        document.getElementById('groupName').focus();
    }

    closeCreateGroupModal() {
        document.getElementById('createGroupModal').classList.remove('show');
        document.getElementById('createGroupForm').reset();
    }

    showCreateActivityModal() {
        document.getElementById('createActivityModal').classList.add('show');
        this.updateFilters(); // Ensure group options are up to date
        document.getElementById('activityTitle').focus();
    }

    closeCreateActivityModal() {
        document.getElementById('createActivityModal').classList.remove('show');
        document.getElementById('createActivityForm').reset();
    }

    // Form Handlers
    async handleCreateGroup() {
        const formData = {
            name: document.getElementById('groupName').value,
            description: document.getElementById('groupDescription').value,
            grade: document.getElementById('groupGrade').value,
            subject: document.getElementById('groupSubject').value,
            isPublic: document.getElementById('groupPublic').checked
        };

        try {
            const newGroup = await this.createGroup(formData);
            this.groups.push(newGroup);
            this.updateDashboardStats();
            this.renderGroups();
            this.updateFilters();
            this.closeCreateGroupModal();
            this.showNotification('Grupo criado com sucesso!', 'success');
        } catch (error) {
            this.showNotification('Erro ao criar grupo', 'error');
        }
    }

    async handleCreateActivity() {
        const formData = {
            title: document.getElementById('activityTitle').value,
            description: document.getElementById('activityDescription').value,
            groupId: document.getElementById('activityGroup').value,
            startDate: document.getElementById('activityStartDate').value,
            endDate: document.getElementById('activityEndDate').value,
            points: parseInt(document.getElementById('activityPoints').value),
            difficulty: document.getElementById('activityDifficulty').value,
            youtubeLink: document.getElementById('activityYoutubeLink').value,
            tags: document.getElementById('activityTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        try {
            const newActivity = await this.createActivity(formData);
            this.activities.push(newActivity);
            this.updateDashboardStats();
            this.renderActivities();
            this.closeCreateActivityModal();
            this.showNotification('Atividade criada com sucesso!', 'success');
        } catch (error) {
            this.showNotification('Erro ao criar atividade', 'error');
        }
    }

    handleImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const display = document.querySelector('.file-upload-display');
            display.innerHTML = `
                <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                <p style="margin-top: 8px; font-size: 0.9rem; color: #666;">${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    }

    // API Methods (Mock implementations)
    async createGroup(groupData) {
        // Mock API call
        const newGroup = {
            id: 'group_' + Date.now(),
            ...groupData,
            code: this.generateGroupCode(),
            members: 0,
            activities: 0,
            avgCompletion: 0,
            createdAt: new Date().toISOString()
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return newGroup;
    }

    async createActivity(activityData) {
        const group = this.groups.find(g => g.id === activityData.groupId);
        
        const newActivity = {
            id: 'activity_' + Date.now(),
            ...activityData,
            groupName: group ? group.name : 'Grupo não encontrado',
            status: 'active',
            completions: 0,
            totalStudents: group ? group.members : 0,
            image: null, // Would be handled by file upload
            createdAt: new Date().toISOString()
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return newActivity;
    }

    generateGroupCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Navigation
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.teacher-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Load section-specific data
        if (sectionName === 'analytics') {
            this.loadAnalytics();
        }
    }

    async loadAnalytics(timeRange = '7days') {
        // This would load analytics data from API
        console.log('Loading analytics for:', timeRange);
    }

    // Utility Methods
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global Functions
let teacherDashboard;

document.addEventListener('DOMContentLoaded', () => {
    teacherDashboard = new TeacherDashboard();
});

// Global functions called from HTML
function switchSection(section) {
    teacherDashboard.switchSection(section);
}

function showCreateGroupModal() {
    teacherDashboard.showCreateGroupModal();
}

function closeCreateGroupModal() {
    teacherDashboard.closeCreateGroupModal();
}

function showCreateActivityModal() {
    teacherDashboard.showCreateActivityModal();
}

function closeCreateActivityModal() {
    teacherDashboard.closeCreateActivityModal();
}

function viewGroup(groupId) {
    console.log('View group:', groupId);
    // Implement group details view
}

function editGroup(groupId) {
    const group = teacherDashboard.groups.find(g => g.id === groupId);
    if (!group) return;

    const newName = prompt('Novo nome do grupo:', group.name);
    if (newName && newName.trim()) {
        group.name = newName.trim();
        teacherDashboard.saveData();
        teacherDashboard.loadGroups();
        teacherDashboard.showNotification('Grupo atualizado com sucesso!', 'success');
    }
}

function shareGroup(groupId) {
    const group = teacherDashboard.groups.find(g => g.id === groupId);
    if (group) {
        navigator.clipboard.writeText(group.code);
        teacherDashboard.showNotification(`Código ${group.code} copiado!`, 'success');
    }
}

function deleteGroup(groupId) {
    if (confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
        const groupIndex = teacherDashboard.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
            const groupName = teacherDashboard.groups[groupIndex].name;
            teacherDashboard.groups.splice(groupIndex, 1);
            teacherDashboard.saveData();
            teacherDashboard.loadGroups();
            teacherDashboard.showNotification(`Grupo "${groupName}" excluído com sucesso!`, 'success');
        }
    }
}

function viewActivity(activityId) {
    console.log('View activity:', activityId);
    // Implement activity details view
}

function editActivity(activityId) {
    console.log('Edit activity:', activityId);
    // Implement activity editing
}

function duplicateActivity(activityId) {
    const activity = teacherDashboard.activities.find(a => a.id === activityId);
    if (!activity) return;

    const duplicatedActivity = {
        ...activity,
        id: Date.now().toString(),
        title: `${activity.title} (Cópia)`,
        createdAt: new Date().toISOString(),
        status: 'draft'
    };

    teacherDashboard.activities.push(duplicatedActivity);
    teacherDashboard.saveData();
    teacherDashboard.loadActivities();
    teacherDashboard.showNotification('Atividade duplicada com sucesso!', 'success');
}

function deleteActivity(activityId) {
    if (confirm('Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.')) {
        const activityIndex = teacherDashboard.activities.findIndex(a => a.id === activityId);
        if (activityIndex !== -1) {
            const activityTitle = teacherDashboard.activities[activityIndex].title;
            teacherDashboard.activities.splice(activityIndex, 1);
            teacherDashboard.saveData();
            teacherDashboard.loadActivities();
            teacherDashboard.showNotification(`Atividade "${activityTitle}" excluída com sucesso!`, 'success');
        }
    }
}

function saveActivityDraft() {
    console.log('Save activity draft');
    // Implement draft saving
}

function showNotifications() {
    console.log('Show notifications');
    // Implement notifications panel
}

function showSettings() {
    const html = `
        <div class="modal-overlay" id="teacherSettingsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ Configurações do Professor</h3>
                    <button class="close-modal" onclick="closeTeacherSettingsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h4><i class="fas fa-user"></i> Perfil</h4>
                        <div class="form-group">
                            <label>Nome</label>
                            <input type="text" id="teacherName" value="${localStorage.getItem('superacao_user') || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="teacherEmail" placeholder="professor@escola.com">
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4><i class="fas fa-bell"></i> Notificações</h4>
                        <div class="setting-item toggle-item">
                            <label>
                                <span>Notificar novas atividades dos estudantes</span>
                                <input type="checkbox" id="notifyNewActivities" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-item toggle-item">
                            <label>
                                <span>Relatórios semanais automáticos</span>
                                <input type="checkbox" id="weeklyReports" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4><i class="fas fa-graduation-cap"></i> Ensino</h4>
                        <div class="form-group">
                            <label>Disciplina Principal</label>
                            <select id="mainSubject">
                                <option value="">Selecionar...</option>
                                <option value="matematica">Matemática</option>
                                <option value="portugues">Português</option>
                                <option value="ciencias">Ciências</option>
                                <option value="historia">História</option>
                                <option value="geografia">Geografia</option>
                                <option value="ingles">Inglês</option>
                                <option value="educacao-fisica">Educação Física</option>
                                <option value="artes">Artes</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div class="setting-item toggle-item">
                            <label>
                                <span>Permitir estudantes criarem atividades</span>
                                <input type="checkbox" id="allowStudentActivities">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4><i class="fas fa-shield-alt"></i> Privacidade & Dados</h4>
                        <div class="setting-item">
                            <button class="btn-secondary btn-full" onclick="exportTeacherData()">
                                <i class="fas fa-download"></i> Exportar meus dados
                            </button>
                        </div>
                        <div class="setting-item">
                            <button class="btn-danger btn-full" onclick="clearTeacherData()">
                                <i class="fas fa-trash"></i> Limpar todos os dados
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeTeacherSettingsModal()">Cancelar</button>
                    <button class="btn-primary" onclick="saveTeacherSettings()">Salvar Configurações</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function closeTeacherSettingsModal() {
    const modal = document.getElementById('teacherSettingsModal');
    if (modal) {
        modal.remove();
    }
}

function saveTeacherSettings() {
    const settings = {
        name: document.getElementById('teacherName').value,
        email: document.getElementById('teacherEmail').value,
        mainSubject: document.getElementById('mainSubject').value,
        notifyNewActivities: document.getElementById('notifyNewActivities').checked,
        weeklyReports: document.getElementById('weeklyReports').checked,
        allowStudentActivities: document.getElementById('allowStudentActivities').checked
    };
    
    localStorage.setItem('superacao_teacher_settings', JSON.stringify(settings));
    localStorage.setItem('superacao_user', settings.name);
    
    closeTeacherSettingsModal();
    teacherDashboard.showNotification('Configurações salvas com sucesso!', 'success');
}

function exportTeacherData() {
    exportReports(); // Use existing export function
}

function clearTeacherData() {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os seus dados (grupos, atividades, configurações). Esta ação não pode ser desfeita. Tem certeza?')) {
        const keysToRemove = [
            'superacao_teacher_groups',
            'superacao_teacher_activities', 
            'superacao_teacher_settings',
            'superacao_user',
            'superacao_user_type'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        teacherDashboard.showNotification('Todos os dados foram apagados', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('superacao_user');
        localStorage.removeItem('superacao_user_type');
        window.location.href = 'login.html';
    }
}

function showInviteStudents() {
    if (teacherDashboard.groups.length === 0) {
        teacherDashboard.showNotification('Crie um grupo primeiro para convidar estudantes', 'warning');
        return;
    }

    const groupOptions = teacherDashboard.groups.map(group => 
        `<option value="${group.id}">${group.name} (${group.code})</option>`
    ).join('');

    const html = `
        <div class="modal-overlay" id="inviteStudentsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👥 Convidar Estudantes</h3>
                    <button class="close-modal" onclick="closeInviteModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Selecionar Grupo</label>
                        <select id="inviteGroupSelect">
                            ${groupOptions}
                        </select>
                    </div>
                    <div class="invite-methods">
                        <div class="invite-method">
                            <h4><i class="fas fa-qrcode"></i> Código do Grupo</h4>
                            <div class="group-code-display">
                                <span id="displayGroupCode">${teacherDashboard.groups[0]?.code}</span>
                                <button onclick="copyGroupCode()" class="btn-secondary">
                                    <i class="fas fa-copy"></i> Copiar
                                </button>
                            </div>
                            <p class="help-text">Compartilhe este código com os estudantes</p>
                        </div>
                        <div class="invite-method">
                            <h4><i class="fas fa-link"></i> Link de Convite</h4>
                            <div class="invite-link-display">
                                <span id="displayInviteLink"></span>
                                <button onclick="copyInviteLink()" class="btn-secondary">
                                    <i class="fas fa-copy"></i> Copiar Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeInviteModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    
    // Update group code when selection changes
    document.getElementById('inviteGroupSelect').addEventListener('change', updateInviteInfo);
    updateInviteInfo();
}

function updateInviteInfo() {
    const groupSelect = document.getElementById('inviteGroupSelect');
    const selectedGroup = teacherDashboard.groups.find(g => g.id === groupSelect.value);
    
    if (selectedGroup) {
        document.getElementById('displayGroupCode').textContent = selectedGroup.code;
        const baseUrl = window.location.origin + window.location.pathname.replace('teacher-dashboard.html', '');
        const inviteLink = `${baseUrl}login.html?join=group&code=${selectedGroup.code}`;
        document.getElementById('displayInviteLink').textContent = inviteLink;
    }
}

function copyGroupCode() {
    const groupCode = document.getElementById('displayGroupCode').textContent;
    navigator.clipboard.writeText(groupCode).then(() => {
        teacherDashboard.showNotification('Código copiado!', 'success');
    });
}

function copyInviteLink() {
    const inviteLink = document.getElementById('displayInviteLink').textContent;
    navigator.clipboard.writeText(inviteLink).then(() => {
        teacherDashboard.showNotification('Link copiado!', 'success');
    });
}

function closeInviteModal() {
    const modal = document.getElementById('inviteStudentsModal');
    if (modal) {
        modal.remove();
    }
}

function exportReports() {
    try {
        const reportData = {
            teacher: {
                name: localStorage.getItem('superacao_user') || 'Professor',
                exportDate: new Date().toISOString()
            },
            groups: teacherDashboard.groups.map(group => ({
                ...group,
                studentsCount: group.students?.length || 0
            })),
            activities: teacherDashboard.activities,
            analytics: {
                totalGroups: teacherDashboard.groups.length,
                totalActivities: teacherDashboard.activities.length,
                totalStudents: teacherDashboard.groups.reduce((total, group) => 
                    total + (group.students?.length || 0), 0
                ),
                activitiesThisMonth: teacherDashboard.activities.filter(activity => {
                    const activityDate = new Date(activity.createdAt);
                    const thisMonth = new Date();
                    return activityDate.getMonth() === thisMonth.getMonth() && 
                           activityDate.getFullYear() === thisMonth.getFullYear();
                }).length
            }
        };

        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `superacao-relatorio-professor-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        teacherDashboard.showNotification('Relatório exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar relatório:', error);
        teacherDashboard.showNotification('Erro ao exportar relatório', 'error');
    }
}

function exportAnalytics() {
    console.log('Export analytics');
    // Implement analytics export
}

// Add notification styles
const notificationStyles = `
    <style>
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2000;
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        max-width: 400px;
    }
    
    .notification.success {
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
    }
    
    .notification.error {
        background: linear-gradient(135deg, #f44336, #d32f2f);
    }
    
    .notification.info {
        background: linear-gradient(135deg, #2196F3, #1976D2);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .progress-bar {
        width: 100%;
        height: 4px;
        background: #e9ecef;
        border-radius: 2px;
        margin-top: 12px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        transition: width 0.3s ease;
    }
    
    .progress-text {
        font-size: 0.8rem;
        color: #666;
        margin-top: 4px;
        display: block;
    }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);