// AI Coach System
class AICoach {
    constructor(app) {
        this.app = app;
        this.chatHistory = [];
        this.insights = {
            consistency: '',
            bestTime: '',
            nextGoal: '',
            weeklyProgress: '',
            recommendations: []
        };
        this.loadChatHistory();
        this.generateInsights();
    }

    loadChatHistory() {
        const savedChat = localStorage.getItem('superacao-chat');
        if (savedChat) {
            this.chatHistory = JSON.parse(savedChat);
        } else {
            // Add welcome message
            this.chatHistory = [{
                id: this.generateId(),
                type: 'ai',
                message: 'Olá! Sou seu Coach IA. Estou aqui para ajudar você a superar seus limites. Como posso ajudar hoje?',
                timestamp: new Date().toISOString()
            }];
        }
        this.renderChatHistory();
    }

    saveChatHistory() {
        localStorage.setItem('superacao-chat', JSON.stringify(this.chatHistory));
    }

    generateInsights() {
        const user = this.app.currentUser;
        const tasks = this.app.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        // Consistency Analysis
        this.insights.consistency = this.analyzeConsistency(completedTasks);
        
        // Best Time Analysis
        this.insights.bestTime = this.analyzeBestTime(completedTasks);
        
        // Next Goal Suggestion
        this.insights.nextGoal = this.suggestNextGoal(user, tasks);
        
        // Weekly Progress
        this.insights.weeklyProgress = this.analyzeWeeklyProgress(completedTasks);
        
        // Generate recommendations
        this.insights.recommendations = this.generateRecommendations(user, tasks);
        
        this.updateInsightsDisplay();
    }

    analyzeConsistency(completedTasks) {
        const lastWeekTasks = completedTasks.filter(task => {
            const taskDate = new Date(task.completedAt || task.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return taskDate >= weekAgo;
        });

        const thisWeekCount = lastWeekTasks.length;
        const previousWeekCount = Math.max(thisWeekCount - 2, 0); // Mock previous week
        
        if (thisWeekCount > previousWeekCount) {
            const improvement = Math.round(((thisWeekCount - previousWeekCount) / Math.max(previousWeekCount, 1)) * 100);
            return `Você está ${improvement}% mais consistente esta semana! Continue assim! 🔥`;
        } else if (thisWeekCount === previousWeekCount) {
            return `Mantendo a consistência! ${thisWeekCount} tarefas esta semana. 📈`;
        } else {
            return `Que tal voltarmos ao ritmo da semana passada? Você consegue! 💪`;
        }
    }

    analyzeBestTime(completedTasks) {
        if (completedTasks.length === 0) {
            return 'Complete mais tarefas para descobrir seu melhor horário! 🕐';
        }

        // Analyze completion times
        const timeSlots = {
            'manhã': { count: 0, label: '6h-12h' },
            'tarde': { count: 0, label: '12h-18h' },
            'noite': { count: 0, label: '18h-23h' },
            'madrugada': { count: 0, label: '23h-6h' }
        };

        completedTasks.forEach(task => {
            const hour = parseInt(task.startTime?.split(':')[0] || '9');
            if (hour >= 6 && hour < 12) timeSlots.manhã.count++;
            else if (hour >= 12 && hour < 18) timeSlots.tarde.count++;
            else if (hour >= 18 && hour < 23) timeSlots.noite.count++;
            else timeSlots.madrugada.count++;
        });

        const bestTime = Object.entries(timeSlots).reduce((best, [period, data]) => 
            data.count > best.count ? { period, ...data } : best, 
            { period: 'manhã', count: 0, label: '6h-12h' }
        );

        return `Você é mais produtivo de ${bestTime.label} (${bestTime.period}). 🎯`;
    }

    suggestNextGoal(user, tasks) {
        const suggestions = [
            'Tente aumentar seu tempo de exercício para 45min.',
            'Que tal adicionar uma sessão de meditação diária?',
            'Considere dividir tarefas grandes em blocos menores.',
            'Adicione 15 minutos extras de leitura por dia.',
            'Experimente o método Pomodoro para estudos.',
            'Defina uma meta de 5 tarefas por dia.',
            'Inclua uma atividade relaxante no fim do dia.'
        ];

        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    analyzeWeeklyProgress(completedTasks) {
        const thisWeek = completedTasks.filter(task => {
            const taskDate = new Date(task.completedAt || task.createdAt);
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            return taskDate >= weekStart;
        });

        const totalPoints = thisWeek.reduce((sum, task) => sum + (task.points || 0), 0);
        return `Esta semana: ${thisWeek.length} tarefas, ${totalPoints} pontos! 🏆`;
    }

    generateRecommendations(user, tasks) {
        const recommendations = [];
        
        // Based on streak
        if (user.streak < 3) {
            recommendations.push({
                type: 'consistency',
                title: 'Foque na Consistência',
                message: 'Tente completar pelo menos 1 tarefa por dia por 7 dias.',
                action: 'Criar Meta Diária'
            });
        }

        // Based on task types
        const categories = tasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});

        if (!categories.exercise || categories.exercise < 2) {
            recommendations.push({
                type: 'health',
                title: 'Adicione Exercícios',
                message: 'Atividade física melhora foco e produtividade.',
                action: 'Agendar Exercício'
            });
        }

        if (!categories.meditation || categories.meditation < 2) {
            recommendations.push({
                type: 'mindfulness',
                title: 'Experimente Meditação',
                message: 'Apenas 10 minutos por dia fazem diferença.',
                action: 'Começar Meditação'
            });
        }

        return recommendations;
    }

    updateInsightsDisplay() {
        document.getElementById('consistencyAnalysis').textContent = this.insights.consistency;
        document.getElementById('bestTimeAnalysis').textContent = this.insights.bestTime;
        document.getElementById('nextGoalSuggestion').textContent = this.insights.nextGoal;
    }

    sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        const userMessage = {
            id: this.generateId(),
            type: 'user',
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        this.chatHistory.push(userMessage);

        // Generate AI response
        setTimeout(() => {
            const aiResponse = this.generateAIResponse(message);
            const aiMessage = {
                id: this.generateId(),
                type: 'ai',
                message: aiResponse,
                timestamp: new Date().toISOString()
            };

            this.chatHistory.push(aiMessage);
            this.saveChatHistory();
            this.renderChatHistory();

            // Track interaction
            this.app.trackEvent('ai_chat_interaction', {
                user_message_length: message.length,
                response_type: this.getResponseType(aiResponse)
            });
        }, 1000 + Math.random() * 2000); // Simulate AI thinking time

        this.saveChatHistory();
        this.renderChatHistory();
        
        // Clear input
        document.getElementById('chatInput').value = '';
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Greeting responses
        if (message.includes('oi') || message.includes('olá') || message.includes('ola')) {
            return this.getRandomResponse([
                'Olá! Como posso ajudar você hoje a superar seus limites?',
                'Oi! Pronto para conquistar novos objetivos?',
                'Olá! Vamos trabalhar juntos para alcançar suas metas!'
            ]);
        }

        // Motivation requests
        if (message.includes('motivação') || message.includes('motivar') || message.includes('desanimado')) {
            return this.getRandomResponse([
                'Lembre-se: cada pequeno passo conta! Você já chegou até aqui, isso mostra sua força. 💪',
                'Os dias difíceis são os que mais fazem a diferença. Continue firme! 🔥',
                'Sua consistência é impressionante! Cada tarefa concluída é uma vitória. 🏆',
                'Você está construindo a melhor versão de si mesmo. Não desista agora! ⭐'
            ]);
        }

        // Progress questions
        if (message.includes('progresso') || message.includes('como estou') || message.includes('desempenho')) {
            const user = this.app.currentUser;
            return `Você está indo muito bem! ${user.completedTasks} tarefas concluídas, ${user.points} pontos conquistados e ${user.streak} dias de consistência. Continue assim! 📈`;
        }

        // Goal setting
        if (message.includes('meta') || message.includes('objetivo') || message.includes('goal')) {
            return this.getRandomResponse([
                'Que tal definir uma meta SMART? Específica, mensurável, alcançável, relevante e com prazo definido! 🎯',
                'Grandes objetivos começam com pequenos passos. Qual seria seu primeiro passo hoje?',
                'Recomendo dividir grandes metas em tarefas menores de 25-45 minutos. Funciona muito bem! ⏰'
            ]);
        }

        // Time management
        if (message.includes('tempo') || message.includes('organizar') || message.includes('produtividade')) {
            return this.getRandomResponse([
                'Experimente a técnica Pomodoro: 25 min focado + 5 min pausa. Funciona muito bem! 🍅',
                'Identifique seu horário de maior produtividade e agende as tarefas mais importantes para esse período.',
                'Que tal começar o dia com a tarefa mais desafiadora? Você terá mais energia! 🌅'
            ]);
        }

        // Exercise and health
        if (message.includes('exercício') || message.includes('exercicio') || message.includes('saúde') || message.includes('corpo')) {
            return this.getRandomResponse([
                'Exercício é investimento em si mesmo! Mesmo 15 minutos fazem diferença. 🏃‍♂️',
                'Corpo ativo = mente ativa! O exercício melhora foco e disposição para todas as tarefas.',
                'Que tal começar com uma caminhada de 10 minutos? É um ótimo primeiro passo! 🚶‍♂️'
            ]);
        }

        // Study tips
        if (message.includes('estudo') || message.includes('estudar') || message.includes('aprender')) {
            return this.getRandomResponse([
                'Estude em blocos de 25-45 minutos com pausas. Seu cérebro agradece! 🧠',
                'Revise o que aprendeu antes de dormir. A consolidação acontece durante o sono! 💤',
                'Ensinar o que aprendeu para alguém é uma das melhores formas de fixar o conhecimento! 📚'
            ]);
        }

        // Stress and overwhelm
        if (message.includes('estresse') || message.includes('cansado') || message.includes('sobrecarregado')) {
            return this.getRandomResponse([
                'Que tal uma pausa de 5 minutos para respirar fundo? Às vezes é tudo que precisamos. 🌬️',
                'Lembre-se: você não precisa fazer tudo hoje. Priorize o que é mais importante. 🎯',
                'Uma sessão rápida de meditação pode fazer maravilhas. Quer que eu te guie? 🧘‍♂️'
            ]);
        }

        // Default responses for general questions
        return this.getRandomResponse([
            'Interessante pergunta! Com base no seu histórico, sugiro focar em consistência pequena e diária. 🎯',
            'Cada pessoa é única! Que tal experimentar diferentes abordagens e ver o que funciona melhor para você? 🔍',
            'Lembre-se: progresso é mais importante que perfeição. Continue avançando! 📈',
            'Ótima reflexão! Como posso ajudar você a transformar isso em uma ação concreta? 💡',
            'Baseado nos seus dados, você tem mostrado grande potencial. Vamos potencializar isso! 🚀'
        ]);
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getResponseType(response) {
        if (response.includes('💪') || response.includes('🔥')) return 'motivational';
        if (response.includes('🎯') || response.includes('📈')) return 'goal_oriented';
        if (response.includes('🧠') || response.includes('⏰')) return 'educational';
        return 'general';
    }

    renderChatHistory() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        container.innerHTML = this.chatHistory.map(msg => `
            <div class="message ${msg.type}-message">
                <div class="message-avatar">
                    ${msg.type === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}
                </div>
                <div class="message-content">
                    <p>${msg.message}</p>
                    <span class="message-time">${this.formatTime(msg.timestamp)}</span>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffMinutes < 1) return 'agora';
        if (diffMinutes < 60) return `${diffMinutes}min`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
        return date.toLocaleDateString('pt-BR');
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Proactive insights based on user behavior
    analyzeUserBehavior() {
        const user = this.app.currentUser;
        const tasks = this.app.tasks || [];
        
        // Check for patterns and send proactive messages
        this.checkForStreakMilestones(user);
        this.checkForProductivityPatterns(tasks);
        this.checkForGoalAchievements(user);
    }

    checkForStreakMilestones(user) {
        const milestones = [3, 7, 14, 30, 60, 100];
        
        if (milestones.includes(user.streak)) {
            const message = {
                id: this.generateId(),
                type: 'ai',
                message: `🎉 Incrível! ${user.streak} dias de consistência! Você está construindo hábitos poderosos. Continue assim!`,
                timestamp: new Date().toISOString(),
                isProactive: true
            };
            
            this.chatHistory.push(message);
            this.saveChatHistory();
            this.renderChatHistory();
        }
    }

    checkForProductivityPatterns(tasks) {
        const recentTasks = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            return taskDate >= threeDaysAgo;
        });

        if (recentTasks.length === 0) {
            const message = {
                id: this.generateId(),
                type: 'ai',
                message: 'Notei que você não tem criado tarefas nos últimos dias. Que tal começar com algo pequeno hoje? Estou aqui para ajudar! 💪',
                timestamp: new Date().toISOString(),
                isProactive: true
            };
            
            this.chatHistory.push(message);
            this.saveChatHistory();
            this.renderChatHistory();
        }
    }

    checkForGoalAchievements(user) {
        // Check for point milestones
        const pointMilestones = [100, 500, 1000, 2500, 5000, 10000];
        
        pointMilestones.forEach(milestone => {
            if (user.points >= milestone && !user.achievements.find(a => a.id === `points_${milestone}`)) {
                const message = {
                    id: this.generateId(),
                    type: 'ai',
                    message: `🏆 Fantástico! Você alcançou ${milestone} pontos! Sua dedicação é inspiradora. Qual será seu próximo objetivo?`,
                    timestamp: new Date().toISOString(),
                    isProactive: true
                };
                
                this.chatHistory.push(message);
                this.saveChatHistory();
                this.renderChatHistory();
            }
        });
    }

    // Daily motivation system
    sendDailyMotivation() {
        const motivations = [
            'Bom dia! Hoje é um novo dia para superar limites. Qual será sua primeira conquista? 🌅',
            'Cada manhã é uma nova oportunidade de crescer. Vamos aproveitar? ☀️',
            'Lembre-se: você é mais forte do que pensa. Prove isso hoje! 💪',
            'Pequenos passos consistentes levam a grandes transformações. Vamos começar? 🚀',
            'Sua jornada de superação continua hoje. Estou aqui para apoiar você! 🎯'
        ];

        const message = {
            id: this.generateId(),
            type: 'ai',
            message: motivations[Math.floor(Math.random() * motivations.length)],
            timestamp: new Date().toISOString(),
            isDaily: true
        };

        // Only send if it's a new day
        const lastDailyMessage = this.chatHistory.find(m => m.isDaily);
        const today = new Date().toDateString();
        
        if (!lastDailyMessage || new Date(lastDailyMessage.timestamp).toDateString() !== today) {
            this.chatHistory.push(message);
            this.saveChatHistory();
            this.renderChatHistory();
        }
    }
}

// Extend main app with AI Coach functionality
SuperacaoApp.prototype.loadAIInsights = function() {
    if (!this.aiCoach) {
        this.aiCoach = new AICoach(this);
    } else {
        this.aiCoach.generateInsights();
    }
};

SuperacaoApp.prototype.sendChatMessage = function() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message && this.aiCoach) {
        this.aiCoach.sendMessage(message);
    }
};