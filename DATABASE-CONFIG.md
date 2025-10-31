# Database Configuration - Neon PostgreSQL

## 🗄️ Configuração do Banco de Dados

### 📊 **Neon PostgreSQL Setup (Compatível com Netlify)**

Este projeto está configurado para usar **Neon** (PostgreSQL serverless) que é totalmente compatível com Netlify Functions.

### 🔧 **Configuração Necessária:**

#### 1. **Criar Conta Neon:**
- Acesse: https://neon.tech/
- Crie uma conta gratuita
- Crie um novo projeto

#### 2. **Configurar Variables de Ambiente no Netlify:**
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NEON_DATABASE_URL=seu_connection_string_do_neon
```

#### 3. **Adicionar no Netlify Dashboard:**
- Site Settings → Environment variables
- Adicionar as variáveis acima

### 📋 **Schema do Banco (SQL):**

```sql
-- Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tarefas
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 0,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Ranking
CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Sessões/Auth
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_user_stats_points ON user_stats(total_points DESC);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
```

### ⚡ **Netlify Functions Estrutura:**

```
/netlify/functions/
├── auth/
│   ├── login.js
│   ├── logout.js
│   └── verify.js
├── tasks/
│   ├── create.js
│   ├── list.js
│   ├── update.js
│   └── delete.js
├── ranking/
│   └── get.js
└── utils/
    └── db.js
```

### 🚀 **Como Implementar:**

1. **Execute o SQL** no console do Neon
2. **Configure as variáveis** no Netlify  
3. **Deploy as functions** (arquivos criados automaticamente)
4. **Teste as APIs** via dashboard

### 📱 **Benefícios:**

- ✅ **Serverless** - Escala automaticamente
- ✅ **PostgreSQL** - Banco robusto e confiável  
- ✅ **Netlify Native** - Integração perfeita
- ✅ **Free Tier** - Até 0.5GB gratuito
- ✅ **Global Edge** - Baixa latência mundial

### 🔗 **Links Úteis:**
- **Neon Console:** https://console.neon.tech/
- **Netlify Functions:** https://docs.netlify.com/functions/overview/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---
*Configuração pronta para produção com Neon + Netlify* 🚀