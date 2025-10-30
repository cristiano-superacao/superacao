// Tasks Management System
class TaskManager {
    constructor(app) {
        this.app = app;
        this.tasks = [];
        this.loadTasks();
    }

    async loadTasks() {
        const userType = localStorage.getItem('superacao_user_type');
        const currentGroup = localStorage.getItem('superacao_current_group');
        
        // Load personal tasks
        const savedTasks = localStorage.getItem('superacao-tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        } else {
            // Create sample tasks for demo
            this.createSampleTasks();
        }
        
        // If student and in a group, load group activities
        if (userType === 'student' && currentGroup) {
            const groupActivities = await this.loadGroupActivities(JSON.parse(currentGroup).id);
            this.tasks = [...this.tasks, ...groupActivities];
        }
        
        this.app.tasks = this.tasks;
        this.renderTasks();
        this.updateTaskStatuses();
    }

    async loadGroupActivities(groupId) {
        // Mock API call for group activities
        return [
            {
                id: 'group_activity_1',
                title: 'Atividade: Matemática - Equações',
                description: 'Resolva os exercícios propostos sobre equações do 2º grau enviados pelo professor',
                category: 'study',
                startTime: '08:00',
                endTime: '10:00',
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                points: 200,
                createdAt: new Date().toISOString(),
                isGroupActivity: true,
                groupId: groupId,
                createdBy: 'Prof. Silva',
                youtubeLink: 'https://youtube.com/watch?v=example1',
                image: null,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'group_activity_2',
                title: 'Atividade: Leitura - Capítulo 5',
                description: 'Leia o capítulo 5 do livro de Literatura e responda as questões propostas',
                category: 'reading',
                startTime: '19:00',
                endTime: '20:30',
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                points: 150,
                createdAt: new Date().toISOString(),
                isGroupActivity: true,
                groupId: groupId,
                createdBy: 'Prof. Silva',
                youtubeLink: null,
                image: null,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    saveTasks() {
        // Only save personal tasks, not group activities
        const personalTasks = this.tasks.filter(task => !task.isGroupActivity);
        localStorage.setItem('superacao-tasks', JSON.stringify(personalTasks));
    }

    createSampleTasks() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        this.tasks = [
            {
                id: this.generateId(),
                title: 'Exercício Matinal',
                description: 'Corrida no parque por 30 minutos',
                category: 'exercise',
                startTime: '08:00',
                endTime: '08:30',
                date: today,
                status: 'completed',
                points: 50,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: 'Leitura - Desenvolvimento Pessoal',
                description: 'Ler capítulo 3 do livro "Hábitos Atômicos"',
                category: 'reading',
                startTime: '09:00',
                endTime: '09:45',
                date: today,
                status: 'in-progress',
                points: 40,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: 'Meditação',
                description: 'Sessão de mindfulness focada na respiração',
                category: 'meditation',
                startTime: '20:00',
                endTime: '20:15',
                date: today,
                status: 'pending',
                points: 30,
                createdAt: new Date().toISOString()
            }
        ];
        this.saveTasks();
    }

    addTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            category: taskData.category,
            startTime: taskData.startTime,
            endTime: taskData.endTime,
            date: taskData.date || new Date().toISOString().split('T')[0],
            status: 'pending',
            points: this.calculatePoints(taskData),
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        
        this.app.trackEvent('task_created', {
            category: task.category,
            points: task.points
        });

        this.app.showNotification(`Tarefa "${task.title}" criada com sucesso!`);
        return task;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;

        this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
        this.saveTasks();
        this.renderTasks();
        return true;
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;

        const task = this.tasks[taskIndex];
        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        this.renderTasks();

        this.app.showNotification(`Tarefa "${task.title}" excluída!`, 'warning');
        this.app.closeTaskDetailModal();
        return true;
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.status === 'completed') return false;

        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        
        // Add points to user
        this.app.currentUser.points += task.points;
        this.app.currentUser.completedTasks += 1;
        
        // Calculate hours
        const duration = this.calculateTaskDuration(task);
        this.app.currentUser.totalHours += duration;
        
        // Update streak
        this.updateStreak();
        
        this.app.saveUserData();
        this.saveTasks();
        this.renderTasks();
        this.app.updateUserStats();

        // Show completion animation
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('task-complete-animation');
        }

        this.app.trackEvent('task_completed', {
            category: task.category,
            points: task.points,
            duration: duration,
            isGroupActivity: task.isGroupActivity || false
        });

        // Update ranking if this is a group activity
        if (task.isGroupActivity && this.app.rankingManager) {
            this.app.rankingManager.updateUserRank();
        }

        this.app.showNotification(`+${task.points} pontos! Tarefa concluída! 🎉`);
        this.app.closeTaskDetailModal();
        
        // Check for achievements
        this.checkAchievements();
        
        return true;
    }

    startTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.status !== 'pending') return false;

        task.status = 'in-progress';
        task.startedAt = new Date().toISOString();
        
        this.saveTasks();
        this.renderTasks();

        this.app.showNotification(`Tarefa "${task.title}" iniciada! Foco total! 💪`);
        this.app.closeTaskDetailModal();
        
        // Set reminder for task end
        this.setTaskReminder(task);
        
        return true;
    }

    calculatePoints(taskData) {
        const basePoints = {
            'exercise': 50,
            'study': 40,
            'work': 35,
            'meditation': 30,
            'reading': 40,
            'other': 25
        };

        let points = basePoints[taskData.category] || 25;
        
        // Bonus for longer tasks
        const duration = this.getTaskDurationFromTimes(taskData.startTime, taskData.endTime);
        if (duration > 60) points += 10; // 1+ hour bonus
        if (duration > 120) points += 20; // 2+ hour bonus
        
        return points;
    }

    calculateTaskDuration(task) {
        const start = new Date(`${task.date}T${task.startTime}:00`);
        const end = new Date(`${task.date}T${task.endTime}:00`);
        return Math.round((end - start) / (1000 * 60 * 60 * 100)) / 100; // Hours with 2 decimals
    }

    getTaskDurationFromTimes(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        return (end - start) / (1000 * 60); // Minutes
    }

    updateTaskStatuses() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const today = now.toISOString().split('T')[0];

        let updated = false;

        this.tasks.forEach(task => {
            if (task.date !== today) return;
            
            const taskStart = this.timeToMinutes(task.startTime);
            const taskEnd = this.timeToMinutes(task.endTime);

            if (task.status === 'pending' && currentTime > taskEnd) {
                task.status = 'overdue';
                updated = true;
            } else if (task.status === 'in-progress' && currentTime > taskEnd) {
                // Auto-complete if user forgot to mark as done
                this.completeTask(task.id);
                updated = true;
            }
        });

        if (updated) {
            this.saveTasks();
            this.renderTasks();
        }

        // Update again in 1 minute
        setTimeout(() => this.updateTaskStatuses(), 60000);
    }

    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(t => t.date === today);
        const completedToday = todayTasks.filter(t => t.status === 'completed');
        
        if (completedToday.length > 0) {
            const lastStreakDate = localStorage.getItem('superacao-last-streak-date');
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            
            if (lastStreakDate === yesterdayString || !lastStreakDate) {
                this.app.currentUser.streak += 1;
                localStorage.setItem('superacao-last-streak-date', today);
            } else if (lastStreakDate !== today) {
                this.app.currentUser.streak = 1;
                localStorage.setItem('superacao-last-streak-date', today);
            }
        }
    }

    setTaskReminder(task) {
        const now = new Date();
        const taskEnd = new Date(`${task.date}T${task.endTime}:00`);
        const timeUntilEnd = taskEnd - now;

        if (timeUntilEnd > 0 && timeUntilEnd <= 24 * 60 * 60 * 1000) { // Within 24 hours
            setTimeout(() => {
                this.app.showNotification(`Hora de finalizar: ${task.title}!`, 'warning');
            }, timeUntilEnd);
        }
    }

    checkAchievements() {
        const achievements = [];
        const user = this.app.currentUser;

        // First task achievement
        if (user.completedTasks === 1) {
            achievements.push({
                id: 'first_task',
                title: 'Primeira Conquista',
                description: 'Concluiu sua primeira tarefa!',
                icon: 'fas fa-trophy',
                points: 50
            });
        }

        // Streak achievements
        if (user.streak === 7) {
            achievements.push({
                id: 'week_streak',
                title: 'Semana Consistente',
                description: '7 dias em sequência!',
                icon: 'fas fa-fire',
                points: 100
            });
        }

        // Task count achievements
        if (user.completedTasks === 10) {
            achievements.push({
                id: 'ten_tasks',
                title: 'Batedor de Metas',
                description: '10 tarefas concluídas!',
                icon: 'fas fa-target',
                points: 75
            });
        }

        // Add new achievements
        achievements.forEach(achievement => {
            if (!user.achievements.find(a => a.id === achievement.id)) {
                user.achievements.push(achievement);
                user.points += achievement.points;
                this.app.showNotification(`🏆 Nova conquista: ${achievement.title}!`);
            }
        });

        if (achievements.length > 0) {
            this.app.saveUserData();
            this.app.updateUserStats();
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Sort tasks by time
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.date !== b.date) {
                return new Date(a.date) - new Date(b.date);
            }
            return a.startTime.localeCompare(b.startTime);
        });

        container.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.status} ${task.isGroupActivity ? 'group-activity' : ''}" data-task-id="${task.id}" onclick="showTaskDetailModal('${task.id}')">
                <div class="task-header">
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        ${task.isGroupActivity ? `<div class="task-creator"><i class="fas fa-user-tie"></i> ${task.createdBy}</div>` : ''}
                        <div class="task-time">
                            <i class="fas fa-clock"></i>
                            ${task.startTime} - ${task.endTime}
                        </div>
                        ${task.dueDate ? `<div class="task-due"><i class="fas fa-calendar-alt"></i> Prazo: ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
                    </div>
                    <div class="task-status ${task.status}">
                        <i class="${this.getStatusIcon(task.status)}"></i>
                        <span>${this.getStatusText(task.status)}</span>
                    </div>
                </div>
                <div class="task-footer">
                    <div class="task-category">
                        ${this.getCategoryName(task.category)}
                        ${task.isGroupActivity ? ' <span class="group-badge">Grupo</span>' : ''}
                    </div>
                    <div class="task-points">
                        <i class="fas fa-coins"></i>
                        +${task.points} pts
                    </div>
                </div>
                ${task.youtubeLink ? `
                    <div class="task-media">
                        <a href="${task.youtubeLink}" target="_blank" class="media-link">
                            <i class="fab fa-youtube"></i>
                            Vídeo Explicativo
                        </a>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

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
}

// Extend main app with task functionality
SuperacaoApp.prototype.loadTasks = function() {
    if (!this.taskManager) {
        this.taskManager = new TaskManager(this);
    } else {
        this.taskManager.loadTasks();
    }
};

SuperacaoApp.prototype.addTask = function() {
    const form = document.getElementById('addTaskForm');
    const formData = new FormData(form);
    
    const taskData = {
        title: formData.get('title') || document.getElementById('taskTitle').value,
        description: formData.get('description') || document.getElementById('taskDescription').value,
        startTime: formData.get('startTime') || document.getElementById('taskStartTime').value,
        endTime: formData.get('endTime') || document.getElementById('taskEndTime').value,
        category: formData.get('category') || document.getElementById('taskCategory').value
    };

    // Validation
    if (!taskData.title || !taskData.startTime || !taskData.endTime) {
        this.showNotification('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    if (taskData.startTime >= taskData.endTime) {
        this.showNotification('Horário de início deve ser anterior ao fim!', 'error');
        return;
    }

    this.taskManager.addTask(taskData);
    this.closeAddTaskModal();
};

SuperacaoApp.prototype.completeTaskById = function(taskId) {
    this.taskManager.completeTask(taskId);
};

SuperacaoApp.prototype.startTaskById = function(taskId) {
    this.taskManager.startTask(taskId);
};

SuperacaoApp.prototype.deleteTaskById = function(taskId) {
    this.taskManager.deleteTask(taskId);
};