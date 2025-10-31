# 🔧 Documentação Técnica - Superação App

## 📋 Índice
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [APIs e Integrações](#apis-e-integrações)
- [Componentes Principais](#componentes-principais)
- [Banco de Dados](#banco-de-dados)
- [Deployment](#deployment)
- [Testes](#testes)
- [Contribuição](#contribuição)

---

## 🏗️ Arquitetura do Sistema

### Visão Geral
```mermaid
graph TB
    A[Landing Page] --> B[PWA App]
    B --> C[Service Worker]
    B --> D[Local Storage]
    B --> E[Geolocation API]
    B --> F[Netlify Functions]
    F --> G[Neon PostgreSQL]
    H[GitHub] --> I[Netlify Deploy]
```

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **PWA**: Service Worker, Web App Manifest, Cache API
- **Backend**: Netlify Functions (Serverless)
- **Banco**: Neon PostgreSQL (Serverless)
- **Deploy**: Netlify + GitHub Actions
- **APIs**: Geolocation, Web Notifications, Local Storage

---

## 📁 Estrutura de Arquivos Detalhada

```
superacao-site/
├── 📄 index.html                    # Landing page (entrada principal)
├── 📄 styles.css                    # Estilos da landing page (800 linhas)
├── 📄 script.js                     # JS da landing page (200 linhas)
├── 📄 netlify.toml                  # Config de build/deploy
├── 📄 _redirects                    # Regras de roteamento SPA
├── 📄 404.html                      # Página de erro customizada
├── 📄 package.json                  # Dependências e scripts NPM
├── 📄 README.md                     # Documentação principal
├── 📄 GUIA-DE-USO.md               # Manual do usuário
├── 📄 DOCUMENTACAO-TECNICA.md       # Este arquivo
│
├── 📱 app/                          # Progressive Web App
│   ├── 📄 index.html                # Dashboard principal (950 linhas)
│   ├── 📄 login.html                # Página de autenticação
│   ├── 📄 teacher-dashboard.html    # Dashboard do professor
│   ├── 📄 manifest.json             # Web App Manifest (PWA config)
│   ├── 📄 sw.js                     # Service Worker (cache + offline)
│   │
│   ├── 🎨 css/
│   │   ├── 📄 app.css               # Estilos principais (2600+ linhas)
│   │   ├── 📄 login.css             # Estilos de autenticação
│   │   └── 📄 teacher-dashboard.css # Estilos do dashboard professor
│   │
│   ├── ⚡ js/
│   │   ├── 📄 app.js                # Core do app (1600+ linhas)
│   │   ├── 📄 tasks.js              # Gerenciamento de tarefas
│   │   ├── 📄 ranking.js            # Sistema de ranking/pontuação
│   │   ├── 📄 ai-coach.js           # Coach IA conversacional
│   │   ├── 📄 storage.js            # Persistência local/remota
│   │   ├── 📄 notifications.js      # Sistema de notificações
│   │   ├── 📄 gps-tracker.js        # GPS tracking (800+ linhas)
│   │   ├── 📄 login.js              # Sistema de autenticação
│   │   └── 📄 teacher-dashboard.js  # Dashboard educacional
│   │
│   └── 🖼️ assets/
│       ├── 📄 icon-192.png          # Ícone PWA 192x192
│       ├── 📄 icon-512.png          # Ícone PWA 512x512
│       └── 📄 screenshot.png        # Screenshot para instalação
│
└── 🌐 netlify/functions/            # Serverless Backend
    ├── 📄 auth.js                   # Autenticação JWT
    ├── 📄 db.js                     # Conexão PostgreSQL
    ├── 📄 ranking.js                # API de ranking
    └── 📄 tasks.js                  # API de tarefas
```

---

## 🔌 APIs e Integrações

### Geolocation API
```javascript
// gps-tracker.js - Configuração de GPS
const options = {
    enableHighAccuracy: true,    // Máxima precisão
    timeout: 10000,             // 10s timeout
    maximumAge: 1000           // Cache de 1s
};

navigator.geolocation.watchPosition(
    successCallback,
    errorCallback,
    options
);
```

### Local Storage Structure
```javascript
// Estrutura de dados locais
localStorage.setItem('superacao-user', JSON.stringify({
    id: 'user_123',
    name: 'João Silva',
    email: 'joao@email.com',
    points: 1250,
    level: 5,
    avatar: 'user_circle',
    preferences: {...}
}));

localStorage.setItem('superacao-tasks', JSON.stringify([{
    id: 'task_456',
    title: 'Exercício matinal',
    category: 'exercise',
    completed: false,
    date: '2025-10-31',
    points: 25
}]));
```

### Web Notifications API
```javascript
// notifications.js - Sistema de notificações
async function requestPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

function showNotification(title, options = {}) {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: options.body,
                icon: '/app/assets/icon-192.png',
                badge: '/app/assets/icon-192.png',
                tag: options.tag || 'default',
                requireInteraction: options.persistent || false
            });
        });
    }
}
```

---

## 🧩 Componentes Principais

### 1. App Core (app.js)
```javascript
class SuperacaoApp {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.isOnline = navigator.onLine;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.initializeModules();
        this.checkConnection();
    }

    // Métodos principais...
}
```

### 2. GPS Tracker (gps-tracker.js)
```javascript
class GPSTracker {
    constructor() {
        this.isTracking = false;
        this.totalDistance = 0;
        this.positions = [];
        this.startTime = null;
    }

    startTracking() {
        this.watchId = navigator.geolocation.watchPosition(
            position => this.handlePositionUpdate(position),
            error => this.handleError(error),
            { enableHighAccuracy: true }
        );
    }

    calculateDistance(pos1, pos2) {
        // Fórmula de Haversine para distância GPS
        const R = 6371; // Raio da Terra em km
        // ... cálculo matemático
    }
}
```

### 3. Task Manager (tasks.js)
```javascript
class TaskManager {
    constructor(app) {
        this.app = app;
        this.tasks = [];
    }

    createTask(taskData) {
        const task = {
            id: this.generateId(),
            ...taskData,
            created: new Date().toISOString(),
            completed: false
        };
        
        this.tasks.push(task);
        this.saveToStorage();
        this.renderTasks();
        return task;
    }
}
```

### 4. Ranking System (ranking.js)
```javascript
class RankingSystem {
    calculatePoints(activity) {
        const pointsMap = {
            'task_completed': 10,
            'exercise_completed': 25,
            'study_completed': 15,
            'gps_activity': (distance) => distance * 10
        };
        
        return pointsMap[activity.type] || 5;
    }

    updateUserRank(userId, points) {
        // Atualiza ranking local e remoto
    }
}
```

---

## 🗄️ Banco de Dados (PostgreSQL)

### Schema Principal
```sql
-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    bio TEXT,
    goal VARCHAR(200),
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    start_time TIME,
    end_time TIME,
    date DATE DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Tabela de atividades GPS
CREATE TABLE gps_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(20) NOT NULL, -- walking, running, cycling
    distance DECIMAL(10,3) NOT NULL, -- km com 3 casas decimais
    duration INTEGER NOT NULL, -- segundos
    calories INTEGER,
    avg_speed DECIMAL(5,2), -- km/h
    max_speed DECIMAL(5,2),
    elevation_gain INTEGER, -- metros
    route_data JSONB, -- array de coordenadas GPS
    weather_data JSONB, -- dados meteorológicos opcionais
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ranking
CREATE TABLE ranking_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    rank_position INTEGER,
    period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, all_time
    period_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX idx_gps_activities_user ON gps_activities(user_id, created_at);
CREATE INDEX idx_ranking_period ON ranking_entries(period, period_date, rank_position);
```

### Queries Principais
```sql
-- Buscar ranking atual do usuário
SELECT 
    u.name, 
    u.points, 
    ROW_NUMBER() OVER (ORDER BY u.points DESC) as rank_position
FROM users u 
WHERE u.points > 0 
ORDER BY u.points DESC;

-- Estatísticas do usuário
SELECT 
    COUNT(CASE WHEN completed THEN 1 END) as completed_tasks,
    COUNT(*) as total_tasks,
    SUM(points) as total_points
FROM tasks 
WHERE user_id = $1 AND date = CURRENT_DATE;

-- Histórico de atividades GPS
SELECT 
    activity_type,
    distance,
    duration,
    created_at
FROM gps_activities 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🚀 Deployment e CI/CD

### Netlify Configuration (netlify.toml)
```toml
[build]
  command = "echo 'Build completed'"
  publish = "."

[build.environment]
  NODE_VERSION = "18"

[[functions]]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/app/*"
  to = "/app/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### GitHub Actions Workflow
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './dist'
        production-branch: master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Environment Variables
```bash
# Desenvolvimento local (.env)
DATABASE_URL=postgresql://username:password@localhost:5432/superacao
NETLIFY_AUTH_TOKEN=your_netlify_token
JWT_SECRET=your_jwt_secret_key

# Produção (Netlify)
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=production_secret_key
NODE_ENV=production
```

---

## 🧪 Testes

### Estrutura de Testes
```javascript
// tests/app.test.js
describe('Superacao App Core', () => {
    let app;
    
    beforeEach(() => {
        app = new SuperacaoApp();
        localStorage.clear();
    });
    
    test('should initialize with default user', () => {
        expect(app.currentUser).toBeDefined();
        expect(app.currentUser.points).toBe(0);
    });
    
    test('should create task correctly', () => {
        const task = app.createTask({
            title: 'Test Task',
            category: 'exercise'
        });
        
        expect(task.id).toBeDefined();
        expect(task.title).toBe('Test Task');
        expect(task.completed).toBe(false);
    });
});

// tests/gps-tracker.test.js
describe('GPS Tracker', () => {
    test('should calculate distance correctly', () => {
        const pos1 = { lat: -23.5505, lng: -46.6333 }; // São Paulo
        const pos2 = { lat: -22.9068, lng: -43.1729 }; // Rio de Janeiro
        
        const distance = gpsTracker.calculateDistance(pos1, pos2);
        expect(distance).toBeCloseTo(357, 0); // ~357km
    });
});
```

### Comandos de Teste
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## 🔧 Ferramentas de Desenvolvimento

### ESLint Configuration (.eslintrc.js)
```javascript
module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['eslint:recommended'],
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'prefer-const': 'error'
    }
};
```

### Prettier Configuration (.prettierrc)
```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4
}
```

---

## 🐛 Debug e Logging

### Console Logging Strategy
```javascript
class Logger {
    static log(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SUPERACAO] ${message}`, data);
        }
    }
    
    static error(message, error = null) {
        console.error(`[ERROR] ${message}`, error);
        // Em produção, enviar para serviço de monitoramento
    }
}
```

### Performance Monitoring
```javascript
// Monitoramento de performance
class PerformanceMonitor {
    static measureFunction(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        Logger.log(`${name} took ${end - start} milliseconds`);
        return result;
    }
}
```

---

## 🤝 Guia de Contribuição

### Setup do Ambiente de Desenvolvimento
```bash
# 1. Fork e clone o repositório
git clone https://github.com/seu-usuario/superacao.git
cd superacao/superacao-site

# 2. Instale dependências
npm install

# 3. Configure environment
cp .env.example .env
# Edite .env com suas configurações

# 4. Execute em desenvolvimento
npm run dev

# 5. Execute testes
npm test
```

### Padrões de Commit
```bash
# Tipos de commit
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação, ponto e vírgula, etc
refactor: refatoração de código
test: testes
chore: tarefas de build, configs, etc

# Exemplos
git commit -m "feat: add GPS pause functionality"
git commit -m "fix: resolve task completion bug"
git commit -m "docs: update API documentation"
```

### Pull Request Template
```markdown
## Descrição
Breve descrição das mudanças implementadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## Testes
- [ ] Testes passando localmente
- [ ] Novos testes adicionados (se aplicável)
- [ ] Testado em dispositivos móveis

## Checklist
- [ ] Código segue padrões do projeto
- [ ] Documentação atualizada
- [ ] Sem warnings no console
```

---

## 📚 Recursos Adicionais

### Links Úteis
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Performance Best Practices
- Minimize DOM queries
- Use event delegation
- Implement lazy loading
- Cache API responses
- Optimize images and assets

### Security Considerations
- Validate all inputs
- Sanitize user data
- Use HTTPS everywhere
- Implement proper authentication
- Regular security audits

---

**📝 Documento mantido por**: Equipe Superação  
**🔄 Última atualização**: 31/10/2025  
**📧 Contato**: cristiano.s.santos@ba.estudante.senai.br