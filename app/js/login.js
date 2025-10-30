// Sistema de Autenticação - Superação
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.userType = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
        this.showProfileSelection();
    }

    setupEventListeners() {
        // Student Login Form
        document.getElementById('studentLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentLogin();
        });

        // Teacher Login Form
        document.getElementById('teacherLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTeacherLogin();
        });

        // Student Register Form
        document.getElementById('studentRegisterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentRegister();
        });

        // Teacher Register Form
        document.getElementById('teacherRegisterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTeacherRegister();
        });

        // Group Join Form
        document.getElementById('groupJoinForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGroupJoin();
        });

        // Group Code Input - Real-time validation
        document.getElementById('groupCode').addEventListener('input', (e) => {
            this.validateGroupCode(e.target.value);
        });
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('superacao_user');
        const savedUserType = localStorage.getItem('superacao_user_type');
        
        // Check for URL parameters (group join)
        this.checkUrlParameters();
        
        if (savedUser && savedUserType) {
            this.currentUser = JSON.parse(savedUser);
            this.userType = savedUserType;
            this.redirectToApp();
        }
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const joinCode = urlParams.get('join');
        const groupName = urlParams.get('group');
        
        if (joinCode) {
            // Pre-select student profile and fill group code
            this.selectProfile('student');
            
            // Fill group code input if it exists
            setTimeout(() => {
                const groupCodeInput = document.getElementById('groupCode');
                if (groupCodeInput) {
                    groupCodeInput.value = joinCode;
                    this.validateGroupCode(joinCode);
                }
                
                // Show group name hint if available
                if (groupName) {
                    this.showGroupNameHint(decodeURIComponent(groupName));
                }
            }, 100);
        }
    }

    showGroupNameHint(groupName) {
        const groupCodeContainer = document.querySelector('.group-code-container');
        if (groupCodeContainer) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'group-name-hint';
            hintDiv.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>Entrando no grupo: <strong>${groupName}</strong></span>
            `;
            groupCodeContainer.appendChild(hintDiv);
        }
    }

    showLoading(show = true) {
        const loading = document.getElementById('loginLoading');
        loading.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Navigation Methods
    showProfileSelection() {
        this.hideAllForms();
        document.getElementById('profileSelection').classList.add('active');
    }

    showStudentLogin() {
        this.hideAllForms();
        document.getElementById('studentLogin').classList.add('active');
    }

    showTeacherLogin() {
        this.hideAllForms();
        document.getElementById('teacherLogin').classList.add('active');
    }

    showStudentRegister() {
        this.hideAllForms();
        document.getElementById('studentRegister').classList.add('active');
    }

    showTeacherRegister() {
        this.hideAllForms();
        document.getElementById('teacherRegister').classList.add('active');
    }

    showGroupJoin() {
        this.hideAllForms();
        document.getElementById('groupJoin').classList.add('active');
    }

    hideAllForms() {
        const forms = document.querySelectorAll('.profile-selection, .auth-form');
        forms.forEach(form => form.classList.remove('active'));
    }

    // Authentication Methods
    async handleStudentLogin() {
        const email = document.getElementById('studentEmail').value;
        const password = document.getElementById('studentPassword').value;
        const remember = document.getElementById('rememberStudent').checked;

        if (!this.validateEmail(email)) {
            this.showError('Por favor, insira um e-mail válido');
            return;
        }

        if (password.length < 6) {
            this.showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        this.showLoading();

        try {
            // Simulate API call
            await this.delay(2000);

            // Mock authentication
            const user = await this.authenticateStudent(email, password);
            
            if (user) {
                this.currentUser = user;
                this.userType = 'student';
                
                if (remember) {
                    localStorage.setItem('superacao_user', JSON.stringify(user));
                    localStorage.setItem('superacao_user_type', 'student');
                }
                
                this.showSuccess('Login realizado com sucesso!');
                await this.delay(1000);
                this.redirectToApp();
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleTeacherLogin() {
        const email = document.getElementById('teacherEmail').value;
        const password = document.getElementById('teacherPassword').value;
        const remember = document.getElementById('rememberTeacher').checked;

        if (!this.validateEmail(email)) {
            this.showError('Por favor, insira um e-mail válido');
            return;
        }

        this.showLoading();

        try {
            await this.delay(2000);
            
            const user = await this.authenticateTeacher(email, password);
            
            if (user) {
                this.currentUser = user;
                this.userType = 'teacher';
                
                if (remember) {
                    localStorage.setItem('superacao_user', JSON.stringify(user));
                    localStorage.setItem('superacao_user_type', 'teacher');
                }
                
                this.showSuccess('Login realizado com sucesso!');
                await this.delay(1000);
                this.redirectToTeacherDashboard();
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleStudentRegister() {
        const name = document.getElementById('studentName').value;
        const email = document.getElementById('studentRegisterEmail').value;
        const password = document.getElementById('studentRegisterPassword').value;
        const grade = document.getElementById('studentGrade').value;
        const agreeTerms = document.getElementById('agreeTermsStudent').checked;

        if (!name.trim()) {
            this.showError('Por favor, insira seu nome');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Por favor, insira um e-mail válido');
            return;
        }

        if (password.length < 6) {
            this.showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (!grade) {
            this.showError('Por favor, selecione sua série/ano');
            return;
        }

        if (!agreeTerms) {
            this.showError('Você deve aceitar os termos de uso');
            return;
        }

        this.showLoading();

        try {
            await this.delay(2000);
            
            const user = await this.registerStudent({
                name,
                email,
                password,
                grade
            });
            
            this.currentUser = user;
            this.userType = 'student';
            
            localStorage.setItem('superacao_user', JSON.stringify(user));
            localStorage.setItem('superacao_user_type', 'student');
            
            this.showSuccess('Conta criada com sucesso!');
            await this.delay(1000);
            this.redirectToApp();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleTeacherRegister() {
        const name = document.getElementById('teacherName').value;
        const email = document.getElementById('teacherRegisterEmail').value;
        const institution = document.getElementById('teacherInstitution').value;
        const subject = document.getElementById('teacherSubject').value;
        const password = document.getElementById('teacherRegisterPassword').value;
        const agreeTerms = document.getElementById('agreeTermsTeacher').checked;

        if (!name.trim()) {
            this.showError('Por favor, insira seu nome');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Por favor, insira um e-mail válido');
            return;
        }

        if (!agreeTerms) {
            this.showError('Você deve aceitar os termos de uso');
            return;
        }

        this.showLoading();

        try {
            await this.delay(2000);
            
            const user = await this.registerTeacher({
                name,
                email,
                institution,
                subject,
                password
            });
            
            this.currentUser = user;
            this.userType = 'teacher';
            
            localStorage.setItem('superacao_user', JSON.stringify(user));
            localStorage.setItem('superacao_user_type', 'teacher');
            
            this.showSuccess('Conta de professor criada com sucesso!');
            await this.delay(1000);
            this.redirectToTeacherDashboard();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleGroupJoin() {
        const groupCode = document.getElementById('groupCode').value.toUpperCase();

        if (groupCode.length !== 6) {
            this.showError('O código do grupo deve ter 6 caracteres');
            return;
        }

        this.showLoading();

        try {
            await this.delay(1500);
            
            const group = await this.validateAndJoinGroup(groupCode);
            
            if (group) {
                // Store group info for later use
                localStorage.setItem('superacao_pending_group', JSON.stringify(group));
                
                this.showSuccess(`Entrando no grupo "${group.name}"...`);
                await this.delay(1000);
                
                // Redirect to student registration with group context
                this.showStudentRegister();
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async validateGroupCode(code) {
        if (code.length === 6) {
            try {
                const group = await this.getGroupInfo(code.toUpperCase());
                if (group) {
                    this.showGroupInfo(group);
                }
            } catch (error) {
                this.hideGroupInfo();
            }
        } else {
            this.hideGroupInfo();
        }
    }

    showGroupInfo(group) {
        const groupInfo = document.getElementById('groupInfo');
        const groupName = document.getElementById('groupName');
        const groupDescription = document.getElementById('groupDescription');
        const groupMembers = document.getElementById('groupMembers');
        const groupTasks = document.getElementById('groupTasks');

        groupName.textContent = group.name;
        groupDescription.textContent = group.description;
        groupMembers.textContent = group.memberCount;
        groupTasks.textContent = group.taskCount;

        groupInfo.style.display = 'block';
    }

    hideGroupInfo() {
        document.getElementById('groupInfo').style.display = 'none';
    }

    // API Simulation Methods
    async authenticateStudent(email, password) {
        // Mock authentication
        if (email === 'aluno@exemplo.com' && password === '123456') {
            return {
                id: 1,
                name: 'João Silva',
                email: email,
                grade: '9ano',
                points: 1250,
                rank: 15,
                level: 'Intermediário',
                streak: 7,
                completedTasks: 45,
                totalHours: 32,
                achievements: 8
            };
        }
        throw new Error('E-mail ou senha incorretos');
    }

    async authenticateTeacher(email, password) {
        if (email === 'professor@escola.com' && password === '123456') {
            return {
                id: 1,
                name: 'Prof. Maria Santos',
                email: email,
                institution: 'Escola Estadual Silva',
                subject: 'Matemática',
                groups: [],
                totalStudents: 0,
                totalActivities: 0
            };
        }
        throw new Error('E-mail ou senha incorretos');
    }

    async registerStudent(userData) {
        // Mock registration
        return {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            grade: userData.grade,
            points: 0,
            rank: null,
            level: 'Iniciante',
            streak: 0,
            completedTasks: 0,
            totalHours: 0,
            achievements: 0,
            createdAt: new Date().toISOString()
        };
    }

    async registerTeacher(userData) {
        return {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            institution: userData.institution,
            subject: userData.subject,
            groups: [],
            totalStudents: 0,
            totalActivities: 0,
            createdAt: new Date().toISOString()
        };
    }

    async getGroupInfo(groupCode) {
        // Mock group data
        const mockGroups = {
            'ABC123': {
                id: 'ABC123',
                name: 'Matemática 9º A',
                description: 'Turma de Matemática do 9º ano A',
                teacher: 'Prof. Maria Santos',
                memberCount: 28,
                taskCount: 12
            }
        };

        if (mockGroups[groupCode]) {
            return mockGroups[groupCode];
        }
        throw new Error('Código do grupo não encontrado');
    }

    async validateAndJoinGroup(groupCode) {
        return this.getGroupInfo(groupCode);
    }

    // Utility Methods
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    redirectToApp() {
        if (this.userType === 'student') {
            window.location.href = 'index.html';
        } else {
            window.location.href = 'teacher-dashboard.html';
        }
    }

    redirectToTeacherDashboard() {
        window.location.href = 'teacher-dashboard.html';
    }

    // Google OAuth (placeholder)
    async loginWithGoogle(userType) {
        this.showLoading();
        
        try {
            await this.delay(2000);
            
            // Mock Google login success
            const mockUser = userType === 'student' ? {
                id: 'google_' + Date.now(),
                name: 'Usuário Google',
                email: 'usuario@gmail.com',
                grade: '9ano',
                points: 0,
                provider: 'google'
            } : {
                id: 'google_' + Date.now(),
                name: 'Professor Google',
                email: 'professor@gmail.com',
                institution: 'Escola Via Google',
                subject: 'Geral',
                provider: 'google'
            };
            
            this.currentUser = mockUser;
            this.userType = userType;
            
            localStorage.setItem('superacao_user', JSON.stringify(mockUser));
            localStorage.setItem('superacao_user_type', userType);
            
            this.showSuccess('Login com Google realizado!');
            await this.delay(1000);
            this.redirectToApp();
            
        } catch (error) {
            this.showError('Erro no login com Google');
        } finally {
            this.showLoading(false);
        }
    }
}

// Global Functions (called from HTML)
let authSystem;

document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});

function selectProfile(type) {
    if (type === 'student') {
        authSystem.showStudentLogin();
    } else if (type === 'teacher') {
        authSystem.showTeacherLogin();
    }
}

function showProfileSelection() {
    authSystem.showProfileSelection();
}

function showStudentLogin() {
    authSystem.showStudentLogin();
}

function showTeacherLogin() {
    authSystem.showTeacherLogin();
}

function showStudentRegister() {
    authSystem.showStudentRegister();
}

function showTeacherRegister() {
    authSystem.showTeacherRegister();
}

function showGroupJoin() {
    authSystem.showGroupJoin();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function loginWithGoogle(userType) {
    authSystem.loginWithGoogle(userType);
}

// Add notification styles dynamically
const notificationStyles = `
    <style>
    .error-notification, .success-notification {
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
    
    .error-notification {
        background: linear-gradient(135deg, #f44336, #d32f2f);
    }
    
    .success-notification {
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
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
    
    @media (max-width: 480px) {
        .error-notification, .success-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);