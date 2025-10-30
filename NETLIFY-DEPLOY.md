# Arquivo de configuração para deploy no Netlify
# Site: https://app.netlify.com/projects/superelimites

# Este projeto está configurado para:
# - Deploy automático via GitHub
# - PWA (Progressive Web App) funcional
# - Redirecionamentos para SPA
# - Headers de segurança e performance

## Instruções de Deploy:

### 1. Conectar com GitHub:
- Vá para https://app.netlify.com/projects/superelimites/overview
- Clique em "New site from Git"
- Conecte com GitHub e selecione o repositório "superacao"

### 2. Configurações de Build:
- Branch: main
- Build command: (deixar vazio ou "echo 'Static site ready'")
- Publish directory: . (ponto - diretório raiz)

### 3. Configurações Avançadas:
- O arquivo netlify.toml já está configurado com todas as otimizações
- Redirecionamentos para SPA funcionando
- Headers de segurança configurados
- Cache otimizado para performance

### 4. URLs após deploy:
- Site Principal: https://[seu-dominio].netlify.app/
- Aplicativo PWA: https://[seu-dominio].netlify.app/app/

### 5. Recursos Configurados:
✅ Progressive Web App (PWA)
✅ Service Worker para cache offline
✅ Manifest.json para instalação
✅ Redirecionamentos SPA
✅ Headers de segurança
✅ Otimização de cache
✅ Compressão automática

### 6. Domínio Personalizado (Opcional):
- Vá em Site settings → Domain management
- Adicione seu domínio personalizado
- Configure DNS conforme instruções do Netlify

## Monitoramento:
- Netlify Analytics disponível no dashboard
- Core Web Vitals automático
- Deploy previews para branches

## Suporte:
- Documentação: https://docs.netlify.com/
- Suporte: https://www.netlify.com/support/