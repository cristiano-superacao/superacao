# 🚀 Configuração de Desenvolvimento - Superação App

## 📋 Setup Rápido

### 1. Pré-requisitos
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- VS Code (recomendado)
- Conta no Netlify
- Conta no Neon (PostgreSQL)

### 2. Instalação Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/superacao.git
cd superacao/superacao-site

# Instale dependências globais (opcional)
npm install -g netlify-cli

# Configure ambiente local
cp .env.example .env
```

### 3. Configuração do Banco
```bash
# Acesse https://neon.tech e crie um database
# Copie a connection string para o .env
DATABASE_URL=postgresql://username:password@host:5432/database
```

### 4. Executar Localmente
```bash
# Desenvolvimento com live reload
netlify dev

# Ou servir arquivos estáticos
python -m http.server 8000
# Acesse: http://localhost:8000
```

---

## ⚙️ Arquivos de Configuração

### .env (Ambiente Local)
```env
# Database
DATABASE_URL=postgresql://username:password@ep-host.neon.tech/neondb
NEON_API_KEY=your_neon_api_key

# Auth
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# APIs Externas (opcional)
WEATHER_API_KEY=your_openweather_api_key
MAPS_API_KEY=your_google_maps_api_key

# Environment
NODE_ENV=development
DEBUG=true
```

### package.json
```json
{
  "name": "superacao-app",
  "version": "1.0.0",
  "description": "Progressive Web App para superação pessoal",
  "main": "index.html",
  "scripts": {
    "dev": "netlify dev",
    "build": "echo 'Build completed - Static files ready'",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write .",
    "deploy": "netlify deploy --prod"
  },
  "keywords": ["pwa", "fitness", "goals", "productivity"],
  "author": "Cristiano Santos",
  "license": "MIT",
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.52.0",
    "prettier": "^3.0.3",
    "@jest/globals": "^29.7.0"
  },
  "dependencies": {},
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### .eslintrc.js
```javascript
module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
        serviceworker: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    globals: {
        'process': 'readonly'
    },
    rules: {
        // Errors
        'no-unused-vars': ['error', { 
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_' 
        }],
        'no-undef': 'error',
        'no-redeclare': 'error',
        
        // Warnings
        'no-console': 'warn',
        'no-debugger': 'warn',
        
        // Style
        'prefer-const': 'error',
        'no-var': 'error',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
        'indent': ['error', 4],
        
        // Best practices
        'eqeqeq': ['error', 'always'],
        'curly': ['error', 'all'],
        'no-magic-numbers': ['warn', { 
            'ignore': [0, 1, -1, 100, 1000],
            'ignoreArrayIndexes': true 
        }]
    }
};
```

### .prettierrc
```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4,
    "useTabs": false,
    "bracketSpacing": true,
    "arrowParens": "avoid",
    "endOfLine": "lf"
}
```

### jest.config.js
```javascript
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    collectCoverageFrom: [
        'app/js/**/*.js',
        '!app/js/**/*.test.js',
        '!**/node_modules/**'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    testPathIgnorePatterns: ['/node_modules/', '/netlify/'],
    verbose: true,
    globals: {
        'localStorage': {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        }
    }
};
```

---

## 🛠️ VS Code Configuration

### .vscode/settings.json
```json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "emmet.includeLanguages": {
        "javascript": "javascriptreact"
    },
    "files.associations": {
        "*.js": "javascript"
    },
    "liveServer.settings.port": 3000,
    "liveServer.settings.root": "/",
    "javascript.preferences.quoteStyle": "single",
    "typescript.preferences.quoteStyle": "single"
}
```

### .vscode/extensions.json
```json
{
    "recommendations": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "ritwickdey.liveserver",
        "ms-vscode.vscode-json",
        "bradlc.vscode-tailwindcss",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense"
    ]
}
```

### .vscode/launch.json (Debug)
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Chrome",
            "request": "launch",
            "type": "chrome",
            "url": "http://localhost:3000",
            "webRoot": "${workspaceFolder}",
            "sourceMaps": true
        },
        {
            "name": "Debug Jest Tests",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/.bin/jest",
            "args": ["--runInBand"],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        }
    ]
}
```

---

## 🔧 Scripts Úteis

### build-helpers.js
```javascript
// Utilitários para build e desenvolvimento
const fs = require('fs');
const path = require('path');

class BuildHelper {
    static generateServiceWorkerCache() {
        const filesToCache = [];
        
        // Adicionar arquivos principais
        filesToCache.push('/app/index.html');
        filesToCache.push('/app/css/app.css');
        
        // Adicionar JS files
        const jsDir = path.join(__dirname, 'app/js');
        fs.readdirSync(jsDir).forEach(file => {
            if (file.endsWith('.js')) {
                filesToCache.push(`/app/js/${file}`);
            }
        });
        
        return filesToCache;
    }
    
    static updateVersion() {
        const packageJson = require('./package.json');
        const version = packageJson.version;
        const buildTime = new Date().toISOString();
        
        const versionInfo = {
            version,
            buildTime,
            commit: process.env.GIT_COMMIT || 'local-dev'
        };
        
        fs.writeFileSync(
            'app/version.json',
            JSON.stringify(versionInfo, null, 2)
        );
        
        console.log(`✅ Version updated: ${version} (${buildTime})`);
    }
}

module.exports = BuildHelper;
```

### dev-server.js
```javascript
// Servidor de desenvolvimento simples
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // SPA routing - redirecionar para index.html
    if (pathname.startsWith('/app/') && !pathname.includes('.')) {
        pathname = '/app/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('404 - File Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Dev server running at http://localhost:${PORT}`);
    console.log(`📱 App available at http://localhost:${PORT}/app/`);
});
```

---

## 🧪 Configuração de Testes

### tests/setup.js
```javascript
// Setup global para testes
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

// Mock Notification API
global.Notification = {
    permission: 'granted',
    requestPermission: jest.fn(() => Promise.resolve('granted'))
};

// Mock Service Worker
global.navigator.serviceWorker = {
    ready: Promise.resolve({
        showNotification: jest.fn()
    }),
    register: jest.fn(() => Promise.resolve())
};
```

### tests/example.test.js
```javascript
// Exemplo de teste unitário
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('App Core Functionality', () => {
    beforeEach(() => {
        localStorage.clear();
    });
    
    test('should save user data to localStorage', () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com'
        };
        
        localStorage.setItem('superacao-user', JSON.stringify(userData));
        const saved = JSON.parse(localStorage.getItem('superacao-user'));
        
        expect(saved.name).toBe('Test User');
        expect(saved.email).toBe('test@example.com');
    });
});
```

---

## 🚀 Deploy e CI/CD

### .github/workflows/deploy.yml
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run linting
      run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: '.'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📋 Checklist de Desenvolvimento

### ✅ Antes de Commit
- [ ] Código lintado (`npm run lint`)
- [ ] Testes passando (`npm test`)
- [ ] Formatação aplicada (`npm run format`)
- [ ] Sem `console.log` desnecessários
- [ ] Documentação atualizada

### ✅ Antes de Deploy
- [ ] Testes E2E passando
- [ ] Performance verificada
- [ ] PWA funcionando offline
- [ ] Notificações funcionando
- [ ] Banco de dados configurado

### ✅ Monitoramento Pós-Deploy
- [ ] Site carregando corretamente
- [ ] Funções Netlify operacionais
- [ ] Banco de dados conectado
- [ ] Service Worker cacheando
- [ ] Métricas Core Web Vitals

---

**🔧 Configuração mantida por**: Equipe Superação  
**📅 Última atualização**: 31/10/2025  
**🚀 Ambiente**: Desenvolvimento Local + Netlify