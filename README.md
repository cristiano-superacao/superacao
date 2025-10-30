# Superação - Plataforma Educacional Completa

Este projeto contém o site landing page e a aplicação web PWA do Superação, uma plataforma educacional com gamificação e IA que conecta professores e alunos.

## Estrutura do Projeto

```text
superacao-site/
├── index.html              # Landing page principal
├── styles.css              # Estilos da landing page
├── script.js               # JavaScript da landing page (simplificado)
├── app/                    # Aplicação web PWA
│   ├── index.html          # Dashboard do aluno
│   ├── login.html          # Sistema de autenticação
│   ├── teacher-dashboard.html # Dashboard do professor
│   ├── css/                # Estilos da aplicação
│   └── js/                 # JavaScript da aplicação
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker
└── README.md               # Este arquivo
```

## Recursos Implementados

### Landing Page
- ✅ Design responsivo e moderno
- ✅ Interface simplificada (carrossel removido)
- ✅ Sistema "Meu Painel" funcionando corretamente
- ✅ Seções otimizadas (Hero, Recursos, Testimonials, Footer)
- ✅ PWA ready com Service Worker

### Aplicação Web
- ✅ Sistema de autenticação dual (Aluno/Professor)
- ✅ Dashboard diferenciado por tipo de usuário
- ✅ Sistema de tarefas e atividades
- ✅ Ranking e gamificação
- ✅ Sistema de notificações
- ✅ Integração professor-aluno via códigos de grupo

## Para Executar

1. Adicione uma imagem `app-mockup.png` na pasta raiz
2. Abra o arquivo `index.html` em um navegador
3. Ou use um servidor local como Live Server no VS Code

## Próximos Passos

1. **Adicionar imagem real**: Substitua o placeholder por uma imagem real do mockup do aplicativo
2. **Links funcionais**: Adicione os links reais para Google Play e App Store quando disponíveis
3. **Otimizações**: Adicione meta tags para SEO e Open Graph
4. **Analytics**: Adicione Google Analytics se necessário

## Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com Grid e Flexbox
- JavaScript vanilla
- Font Awesome para ícones
- Design responsivo com media queries