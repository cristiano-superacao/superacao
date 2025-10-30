// Notification System - Shared between Students and Teachers
class NotificationSystem {
    constructor(userType, userId) {
        this.userType = userType;
        this.userId = userId;
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.startPeriodicCheck();
    }

    loadNotifications() {
        const saved = localStorage.getItem(`superacao_notifications_${this.userId}`);
        if (saved) {
            this.notifications = JSON.parse(saved);
        } else {
            this.createSampleNotifications();
        }
        
        this.updateUnreadCount();
        this.updateNotificationBadge();
    }

    saveNotifications() {
        localStorage.setItem(`superacao_notifications_${this.userId}`, JSON.stringify(this.notifications));
    }

    createSampleNotifications() {
        if (this.userType === 'student') {
            this.notifications = [
                {
                    id: 'notif_1',
                    type: 'activity_assigned',
                    title: 'Nova Atividade Atribuída',
                    message: 'Prof. Silva atribuiu uma nova atividade: "Exercícios de Matemática"',
                    from: 'Prof. Silva',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: {
                        type: 'view_activity',
                        data: { activityId: 'group_activity_1' }
                    }
                },
                {
                    id: 'notif_2',
                    type: 'ranking_update',
                    title: 'Parabéns! Você subiu no ranking',
                    message: 'Você subiu 2 posições no ranking da turma!',
                    from: 'Sistema',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: {
                        type: 'view_ranking',
                        data: {}
                    }
                }
            ];
        } else {
            this.notifications = [
                {
                    id: 'notif_1',
                    type: 'student_completed',
                    title: 'Atividade Concluída',
                    message: 'Ana Silva concluiu a atividade "Exercícios de Matemática"',
                    from: 'Sistema',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: {
                        type: 'view_student_progress',
                        data: { studentId: 'student_1', activityId: 'group_activity_1' }
                    }
                },
                {
                    id: 'notif_2',
                    type: 'group_milestone',
                    title: 'Marco do Grupo Atingido',
                    message: 'A turma Matemática 9º A atingiu 80% de conclusão nas atividades desta semana!',
                    from: 'Sistema',
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: {
                        type: 'view_group_analytics',
                        data: { groupId: 'group_1' }
                    }
                }
            ];
        }
        
        this.saveNotifications();
    }

    setupEventListeners() {
        // Listen for notification click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationId = e.target.closest('.notification-item').dataset.notificationId;
                this.handleNotificationClick(notificationId);
            }
        });

        // Listen for mark as read
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mark-read-btn')) {
                e.stopPropagation();
                const notificationId = e.target.closest('.notification-item').dataset.notificationId;
                this.markAsRead(notificationId);
            }
        });

        // Listen for clear all
        document.addEventListener('click', (e) => {
            if (e.target.closest('#clearAllNotifications')) {
                this.clearAllNotifications();
            }
        });
    }

    addNotification(notification) {
        const newNotification = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        
        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.saveNotifications();
        this.updateUnreadCount();
        this.updateNotificationBadge();
        
        // Show desktop notification if supported
        this.showDesktopNotification(newNotification);
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.updateUnreadCount();
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateUnreadCount();
        this.updateNotificationBadge();
        this.renderNotifications();
    }

    clearAllNotifications() {
        if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateUnreadCount();
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }

    updateNotificationBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <h3>Nenhuma notificação</h3>
                    <p>Você está em dia com tudo!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-notification-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4>${notification.title}</h4>
                        <span class="notification-time">${this.getTimeAgo(notification.timestamp)}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-meta">
                        <span class="notification-from">De: ${notification.from}</span>
                        ${!notification.read ? `
                            <button class="mark-read-btn">
                                <i class="fas fa-check"></i>
                                Marcar como lida
                            </button>
                        ` : ''}
                    </div>
                </div>
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            </div>
        `).join('');
    }

    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read
        this.markAsRead(notificationId);

        // Handle action
        if (notification.action) {
            this.executeNotificationAction(notification.action);
        }
    }

    executeNotificationAction(action) {
        switch (action.type) {
            case 'view_activity':
                // Navigate to activity or open activity modal
                if (window.showTaskDetailModal) {
                    window.showTaskDetailModal(action.data.activityId);
                }
                break;
            
            case 'view_ranking':
                // Switch to ranking tab
                if (window.app && window.app.switchTab) {
                    window.app.switchTab('ranking');
                }
                break;
            
            case 'view_student_progress':
                // For teachers - view student progress
                if (this.userType === 'teacher') {
                    console.log('View student progress:', action.data);
                }
                break;
            
            case 'view_group_analytics':
                // For teachers - view group analytics
                if (this.userType === 'teacher' && window.switchSection) {
                    window.switchSection('analytics');
                }
                break;
            
            default:
                console.log('Unknown notification action:', action.type);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'activity_assigned': 'fas fa-tasks',
            'ranking_update': 'fas fa-trophy',
            'student_completed': 'fas fa-check-circle',
            'group_milestone': 'fas fa-flag',
            'message': 'fas fa-envelope',
            'reminder': 'fas fa-clock',
            'achievement': 'fas fa-award'
        };
        
        return icons[type] || 'fas fa-bell';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return diffMinutes < 1 ? 'Agora mesmo' : `${diffMinutes}min atrás`;
        } else if (diffHours < 24) {
            return `${diffHours}h atrás`;
        } else if (diffDays < 7) {
            return `${diffDays}d atrás`;
        } else {
            return time.toLocaleDateString();
        }
    }

    showDesktopNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/app/assets/icon-192x192.png',
                tag: notification.id
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startPeriodicCheck() {
        // Check for new notifications every 30 seconds
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
    }

    async checkForNewNotifications() {
        // In a real app, this would check with the server
        // For now, we'll simulate occasional new notifications
        
        if (Math.random() < 0.1) { // 10% chance every 30 seconds
            this.simulateNewNotification();
        }
    }

    simulateNewNotification() {
        const sampleNotifications = {
            student: [
                {
                    type: 'reminder',
                    title: 'Lembrete de Atividade',
                    message: 'Não se esqueça de completar a atividade de Matemática!',
                    from: 'Sistema'
                },
                {
                    type: 'achievement',
                    title: 'Nova Conquista!',
                    message: 'Você desbloqueou a conquista "Estudante Dedicado"!',
                    from: 'Sistema'
                }
            ],
            teacher: [
                {
                    type: 'student_completed',
                    title: 'Atividade Concluída',
                    message: 'João Santos concluiu a atividade de Física',
                    from: 'Sistema'
                },
                {
                    type: 'message',
                    title: 'Nova Mensagem',
                    message: 'Maria Costa enviou uma dúvida sobre a atividade',
                    from: 'Maria Costa'
                }
            ]
        };

        const notifications = sampleNotifications[this.userType] || [];
        if (notifications.length > 0) {
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            this.addNotification(randomNotification);
        }
    }

    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Global notification functions
let notificationSystem;

function initNotificationSystem() {
    const userType = localStorage.getItem('superacao_user_type');
    const user = JSON.parse(localStorage.getItem('superacao_user') || '{}');
    const userId = user.id || 'default_user';
    
    notificationSystem = new NotificationSystem(userType, userId);
    notificationSystem.requestNotificationPermission();
    
    return notificationSystem;
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'flex';
        if (notificationSystem) {
            notificationSystem.renderNotifications();
        }
    }
}

function closeNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function markAllNotificationsRead() {
    if (notificationSystem) {
        notificationSystem.markAllAsRead();
    }
}

// CSS for notifications
const notificationStyles = `
    <style>
    .notification-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #f44336;
        color: white;
        border-radius: 50%;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: bold;
        display: none;
    }

    .notification-item {
        display: flex;
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .notification-item:hover {
        background: #f5f5f5;
    }

    .notification-item.unread {
        background: #f8f9ff;
        border-left: 4px solid #2196F3;
    }

    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e3f2fd;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: #2196F3;
    }

    .notification-content {
        flex: 1;
    }

    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .notification-header h4 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #333;
    }

    .notification-time {
        font-size: 0.8rem;
        color: #666;
    }

    .notification-message {
        margin: 0 0 8px 0;
        font-size: 0.9rem;
        color: #555;
        line-height: 1.4;
    }

    .notification-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notification-from {
        font-size: 0.8rem;
        color: #888;
    }

    .mark-read-btn {
        background: none;
        border: none;
        color: #2196F3;
        font-size: 0.8rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s ease;
    }

    .mark-read-btn:hover {
        background: #e3f2fd;
    }

    .unread-indicator {
        width: 8px;
        height: 8px;
        background: #2196F3;
        border-radius: 50%;
        margin-left: 8px;
        flex-shrink: 0;
        align-self: flex-start;
        margin-top: 6px;
    }

    .empty-notifications {
        text-align: center;
        padding: 48px 16px;
        color: #666;
    }

    .empty-notifications i {
        font-size: 3rem;
        margin-bottom: 16px;
        color: #ddd;
    }

    .empty-notifications h3 {
        margin-bottom: 8px;
        color: #999;
    }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);