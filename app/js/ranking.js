// Ranking System
class RankingManager {
    constructor(app) {
        this.app = app;
        this.globalRanking = [];
        this.friendsRanking = [];
        this.currentFilter = 'global';
        this.loadRanking();
    }

    loadRanking() {
        // Check if user is authenticated and get user type
        const userType = localStorage.getItem('superacao_user_type');
        const currentGroup = localStorage.getItem('superacao_current_group');
        
        if (userType === 'teacher') {
            // Teachers see student rankings from their groups
            this.loadTeacherRanking();
        } else {
            // Students see their group or global ranking
            this.loadStudentRanking(currentGroup);
        }
        
        this.generateFriendsRanking();
        this.updateUserRank();
        this.renderRanking();
    }

    loadTeacherRanking() {
        // Load ranking data for teacher view (students from their groups)
        const savedRanking = localStorage.getItem('superacao-teacher-ranking');
        if (savedRanking) {
            this.globalRanking = JSON.parse(savedRanking);
        } else {
            this.createTeacherMockRanking();
        }
    }

    loadStudentRanking(currentGroup) {
        // Load ranking data for student view
        const savedRanking = localStorage.getItem('superacao-ranking');
        if (savedRanking) {
            this.globalRanking = JSON.parse(savedRanking);
        } else {
            this.createStudentMockRanking(currentGroup);
        }
    }

    createTeacherMockRanking() {
        // Create mock ranking data for teacher view
        const studentNames = [
            'Ana Silva', 'João Santos', 'Maria Costa', 'Pedro Lima', 'Lucas Oliveira',
            'Sofia Rodrigues', 'Bruno Almeida', 'Carolina Ferreira', 'Rafael Souza', 'Juliana Martins',
            'Gabriel Pereira', 'Isabella Castro', 'Mateus Silva', 'Larissa Santos', 'Thiago Costa'
        ];

        const groups = ['Matemática 9º A', 'Física 1º Médio', 'Química 2º Médio'];

        this.globalRanking = studentNames.map((name, index) => ({
            id: `student_${index}`,
            name: name,
            points: Math.floor(3000 - (index * 150) + Math.random() * 100),
            rank: index + 1,
            level: this.calculateLevel(3000 - (index * 150)),
            streak: Math.floor(Math.random() * 30) + 1,
            completedTasks: Math.floor(Math.random() * 50) + 10,
            avatar: this.generateAvatar(name),
            isUser: false,
            isStudent: true,
            groupName: groups[index % groups.length],
            lastActive: this.generateLastActive()
        }));

        localStorage.setItem('superacao-teacher-ranking', JSON.stringify(this.globalRanking));
    }

    createStudentMockRanking(currentGroup) {
        // Create mock ranking data for student view
        const savedUser = JSON.parse(localStorage.getItem('superacao_user'));
        const groupInfo = currentGroup ? JSON.parse(currentGroup) : null;
        
        const studentNames = [
            'Ana Silva', 'João Santos', 'Maria Costa', 'Pedro Lima', 'Lucas Oliveira',
            'Sofia Rodrigues', 'Bruno Almeida', 'Carolina Ferreira'
        ];

        this.globalRanking = studentNames.map((name, index) => ({
            id: `student_${index}`,
            name: name,
            points: Math.floor(2500 - (index * 200) + Math.random() * 150),
            rank: index + 1,
            level: this.calculateLevel(2500 - (index * 200)),
            streak: Math.floor(Math.random() * 25) + 1,
            completedTasks: Math.floor(Math.random() * 40) + 5,
            avatar: this.generateAvatar(name),
            isUser: false,
            groupName: groupInfo ? groupInfo.name : 'Sem Grupo',
            lastActive: this.generateLastActive()
        }));

        // Add current user to ranking
        const userRank = Math.floor(Math.random() * 5) + 3; // Random rank between 3-7
        const currentUser = {
            id: 'current_user',
            name: savedUser ? savedUser.name : 'Você',
            points: this.app.currentUser.points,
            rank: userRank,
            level: this.app.currentUser.level,
            streak: this.app.currentUser.streak,
            completedTasks: this.app.currentUser.completedTasks,
            avatar: '👤',
            isUser: true,
            groupName: groupInfo ? groupInfo.name : 'Sem Grupo',
            lastActive: 'Agora'
        };

        // Insert user in correct position
        this.globalRanking.splice(userRank - 1, 0, currentUser);
        
        // Update ranks
        this.globalRanking.forEach((user, index) => {
            user.rank = index + 1;
        });

        this.saveRanking();
    }

    createMockRanking() {
        // Create realistic mock ranking data
        const userNames = [
            'ProdutivoGPT', 'FocoTotal', 'MaratonaDiária', 'HábitosMaster', 'ConsistênciaPro',
            'MetasCumpridas', 'FocoTotal2024', 'RotinaProdutiva', 'ObjetivosClaros', 'MotivadorPro',
            'SuperacaoMax', 'LimiteZero', 'MetaAlcançada', 'FocoIntenso', 'VitóriaTotal',
            'ProgressoPro', 'DesafioAceito', 'ConquistaDiária', 'ResultadoPro', 'ExcelênciaTotal'
        ];

        this.globalRanking = userNames.map((name, index) => ({
            id: `user_${index}`,
            name: name,
            points: Math.floor(10000 - (index * 300) + Math.random() * 200),
            rank: index + 1,
            level: this.calculateLevel(10000 - (index * 300)),
            streak: Math.floor(Math.random() * 50) + 1,
            completedTasks: Math.floor(Math.random() * 500) + 50,
            avatar: this.generateAvatar(name),
            isUser: false,
            lastActive: this.generateLastActive()
        }));

        // Add current user to ranking
        const userRank = Math.floor(Math.random() * 15) + 10; // Random rank between 10-25
        const currentUser = {
            id: 'current_user',
            name: this.app.currentUser.name || 'Você',
            points: this.app.currentUser.points,
            rank: userRank,
            level: this.app.currentUser.level,
            streak: this.app.currentUser.streak,
            completedTasks: this.app.currentUser.completedTasks,
            avatar: '👤',
            isUser: true,
            lastActive: 'Agora'
        };

        // Insert user in correct position
        this.globalRanking.splice(userRank - 1, 0, currentUser);
        
        // Update ranks
        this.globalRanking.forEach((user, index) => {
            user.rank = index + 1;
        });

        this.saveRanking();
    }

    generateFriendsRanking() {
        // Generate a smaller friends ranking (5-8 people)
        const friendsCount = Math.floor(Math.random() * 4) + 5;
        this.friendsRanking = this.globalRanking
            .slice(0, friendsCount)
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));
    }

    saveRanking() {
        localStorage.setItem('superacao-ranking', JSON.stringify(this.globalRanking));
    }

    updateUserRank() {
        const userIndex = this.globalRanking.findIndex(u => u.isUser);
        if (userIndex !== -1) {
            this.globalRanking[userIndex].points = this.app.currentUser.points;
            this.globalRanking[userIndex].streak = this.app.currentUser.streak;
            this.globalRanking[userIndex].completedTasks = this.app.currentUser.completedTasks;
            
            // Sort by points and update ranks
            this.globalRanking.sort((a, b) => b.points - a.points);
            this.globalRanking.forEach((user, index) => {
                user.rank = index + 1;
            });

            // Update user's rank in main app
            this.app.currentUser.rank = this.globalRanking[this.globalRanking.findIndex(u => u.isUser)].rank;
            
            this.saveRanking();
            this.generateFriendsRanking();
        }
    }

    filterRanking(filter) {
        this.currentFilter = filter;
        this.renderRanking();
    }

    renderRanking() {
        const container = document.getElementById('rankingList');
        const userType = localStorage.getItem('superacao_user_type');
        const ranking = this.currentFilter === 'global' ? this.globalRanking : this.friendsRanking;
        
        // Show top 50 for global, all for friends
        const displayRanking = this.currentFilter === 'global' ? ranking.slice(0, 50) : ranking;
        
        container.innerHTML = displayRanking.map(user => `
            <div class="ranking-item ${user.isUser ? 'current-user' : ''}" data-user-id="${user.id}">
                <div class="rank-number ${this.getRankClass(user.rank)}">
                    ${this.getRankDisplay(user.rank)}
                </div>
                <div class="rank-avatar">
                    ${user.avatar}
                </div>
                <div class="rank-info">
                    <h4>${user.name} ${user.isUser ? '(Você)' : ''}</h4>
                    <p>${user.level} • ${user.streak} dias • ${user.completedTasks} tarefas</p>
                    ${user.groupName ? `<small>Grupo: ${user.groupName}</small>` : ''}
                    <small>Ativo: ${user.lastActive}</small>
                </div>
                <div class="rank-points">
                    ${this.formatPoints(user.points)}
                </div>
                ${user.rank <= 3 ? `<div class="rank-medal">${this.getMedal(user.rank)}</div>` : ''}
                ${userType === 'teacher' && user.isStudent ? `
                    <div class="teacher-actions">
                        <button class="action-btn" onclick="viewStudentDetails('${user.id}')" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="sendMessageToStudent('${user.id}')" title="Enviar mensagem">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Add current user highlight if not visible and is student
        if (this.currentFilter === 'global' && userType === 'student') {
            const currentUser = this.globalRanking.find(u => u.isUser);
            if (currentUser && currentUser.rank > 50) {
                container.innerHTML += `
                    <div class="ranking-separator">
                        <span>...</span>
                    </div>
                    <div class="ranking-item current-user" data-user-id="${currentUser.id}">
                        <div class="rank-number">${currentUser.rank}</div>
                        <div class="rank-avatar">${currentUser.avatar}</div>
                        <div class="rank-info">
                            <h4>${currentUser.name} (Você)</h4>
                            <p>${currentUser.level} • ${currentUser.streak} dias • ${currentUser.completedTasks} tarefas</p>
                            ${currentUser.groupName ? `<small>Grupo: ${currentUser.groupName}</small>` : ''}
                            <small>Ativo: ${currentUser.lastActive}</small>
                        </div>
                        <div class="rank-points">
                            ${this.formatPoints(currentUser.points)}
                        </div>
                    </div>
                `;
            }
        }

        this.updateRankingStats();
    }

    updateRankingStats() {
        const currentUser = this.globalRanking.find(u => u.isUser);
        if (currentUser) {
            // Calculate position change (mock)
            const previousRank = parseInt(localStorage.getItem('superacao-previous-rank')) || currentUser.rank;
            const change = previousRank - currentUser.rank;
            
            let changeText = 'Posição mantida';
            if (change > 0) {
                changeText = `+${change} posições hoje`;
            } else if (change < 0) {
                changeText = `${change} posições hoje`;
            }
            
            document.getElementById('positionChange').textContent = changeText;
            localStorage.setItem('superacao-previous-rank', currentUser.rank.toString());
        }
    }

    getRankClass(rank) {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return '';
    }

    getRankDisplay(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    }

    getMedal(rank) {
        const medals = ['', '🏆', '🥈', '🥉'];
        return medals[rank] || '';
    }

    formatPoints(points) {
        if (points >= 1000000) {
            return `${(points / 1000000).toFixed(1)}M`;
        }
        if (points >= 1000) {
            return `${(points / 1000).toFixed(1)}k`;
        }
        return points.toString();
    }

    calculateLevel(points) {
        if (points < 100) return 'Iniciante';
        if (points < 500) return 'Aprendiz'; 
        if (points < 1000) return 'Dedicado';
        if (points < 2500) return 'Focado';
        if (points < 5000) return 'Determinado';
        if (points < 10000) return 'Expert';
        return 'Mestre';
    }

    generateAvatar(name) {
        const avatars = ['👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '🧑‍💼', '🧑‍🎓', '🧑‍💻'];
        return avatars[name.length % avatars.length];
    }

    generateLastActive() {
        const options = [
            'Agora', '5min', '15min', '1h', '2h', '1d', '2d', '3d'
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    addPointsToUser(points) {
        this.updateUserRank();
        this.renderRanking();
        this.app.updateUserStats();
    }

    // Weekly/Monthly ranking reset
    resetRanking(type = 'weekly') {
        if (type === 'weekly') {
            // Reset weekly rankings but keep some points
            this.globalRanking.forEach(user => {
                user.points = Math.floor(user.points * 0.1); // Keep 10% of points
            });
        }
        
        this.updateUserRank();
        this.renderRanking();
        this.app.showNotification(`Ranking ${type === 'weekly' ? 'semanal' : 'mensal'} resetado!`, 'warning');
    }

    // Challenge system
    createChallenge(challengeData) {
        // Create daily/weekly challenges
        const challenge = {
            id: this.generateId(),
            title: challengeData.title,
            description: challengeData.description,
            targetValue: challengeData.target,
            currentValue: 0,
            points: challengeData.points,
            type: challengeData.type, // 'daily', 'weekly', 'monthly'
            startDate: new Date().toISOString(),
            endDate: challengeData.endDate,
            participants: []
        };

        // Save challenge
        const challenges = JSON.parse(localStorage.getItem('superacao-challenges') || '[]');
        challenges.push(challenge);
        localStorage.setItem('superacao-challenges', JSON.stringify(challenges));

        return challenge;
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // League system
    getUserLeague(points) {
        if (points < 500) return { name: 'Bronze', color: '#CD7F32', icon: '🥉' };
        if (points < 1500) return { name: 'Prata', color: '#C0C0C0', icon: '🥈' };
        if (points < 3000) return { name: 'Ouro', color: '#FFD700', icon: '🥇' };
        if (points < 6000) return { name: 'Platina', color: '#E5E4E2', icon: '💎' };
        if (points < 10000) return { name: 'Diamante', color: '#B9F2FF', icon: '💠' };
        return { name: 'Master', color: '#FF6B6B', icon: '👑' };
    }

    getLeagueProgress(points) {
        const thresholds = [0, 500, 1500, 3000, 6000, 10000];
        let currentLeague = 0;
        
        for (let i = 0; i < thresholds.length; i++) {
            if (points >= thresholds[i]) {
                currentLeague = i;
            }
        }
        
        if (currentLeague === thresholds.length - 1) {
            return { progress: 100, nextThreshold: null };
        }
        
        const currentThreshold = thresholds[currentLeague];
        const nextThreshold = thresholds[currentLeague + 1];
        const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        
        return { progress: Math.round(progress), nextThreshold };
    }
}

// Global functions for teacher actions
function viewStudentDetails(studentId) {
    const userType = localStorage.getItem('superacao_user_type');
    if (userType !== 'teacher') return;
    
    console.log('View student details:', studentId);
    // In a real implementation, this would open a modal with student details
    alert('Visualizar detalhes do aluno - Funcionalidade em desenvolvimento');
}

function sendMessageToStudent(studentId) {
    const userType = localStorage.getItem('superacao_user_type');
    if (userType !== 'teacher') return;
    
    console.log('Send message to student:', studentId);
    // In a real implementation, this would open a message composer
    alert('Enviar mensagem para aluno - Funcionalidade em desenvolvimento');
}

// Extend main app with ranking functionality
SuperacaoApp.prototype.loadRanking = function() {
    if (!this.rankingManager) {
        this.rankingManager = new RankingManager(this);
    } else {
        this.rankingManager.loadRanking();
    }
};

SuperacaoApp.prototype.filterRanking = function(filter) {
    if (this.rankingManager) {
        this.rankingManager.filterRanking(filter);
    }
};

SuperacaoApp.prototype.addPointsToRanking = function(points) {
    if (this.rankingManager) {
        this.rankingManager.addPointsToUser(points);
    }
};