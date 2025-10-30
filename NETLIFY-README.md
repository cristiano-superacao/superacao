# 🚀 Deploy Automático no Netlify

Este projeto está configurado para deploy automático no **Netlify** com todas as otimizações para PWA (Progressive Web App).

## 📋 Instruções de Deploy

### 1. Conectar com GitHub (Recomendado) 

1. Acesse: [https://app.netlify.com/projects/superelimites/overview](https://app.netlify.com/projects/superelimites/overview)
2. Clique em **"New site from Git"**
3. Conecte com **GitHub**
4. Selecione o repositório **"superacao"**
5. Configure as opções de build:
   - **Branch**: `main`
   - **Build command**: (deixar vazio)
   - **Publish directory**: `.` (ponto - diretório raiz)
6. Clique em **"Deploy site"**

### 2. Deploy Manual (Alternativo)

Se preferir fazer upload manual:

1. Execute o script de verificação:
   ```powershell
   .\deploy.ps1
   ```

2. Compacte todos os arquivos do projeto em um ZIP

3. Vá para Netlify → **"Deploy manually"**

4. Arraste o arquivo ZIP para a área de upload

## 🌐 URLs Após Deploy

- **Site Principal**: `https://[seu-dominio].netlify.app/`
- **Aplicativo PWA**: `https://[seu-dominio].netlify.app/app/`

## ✨ Recursos Configurados

### 📱 Progressive Web App (PWA)
- ✅ **Instalável** como aplicativo nativo
- ✅ **Offline** com Service Worker
- ✅ **Manifest** configurado
- ✅ **Ícones** otimizados

### 🚀 Performance
- ✅ **Cache** otimizado
- ✅ **Compressão** automática
- ✅ **CDN** global do Netlify
- ✅ **Headers** de performance

### 🔒 Segurança
- ✅ **Headers** de segurança
- ✅ **HTTPS** automático
- ✅ **CSP** configurado
- ✅ **XSS** protection

### 🔀 Redirecionamentos
- ✅ **SPA routing** funcionando
- ✅ **URLs amigáveis**
- ✅ **Fallbacks** configurados

## 📁 Arquivos de Configuração

| Arquivo | Função |
|---------|--------|
| `netlify.toml` | Configuração principal do Netlify |
| `_headers` | Headers HTTP customizados |
| `_redirects` | Redirecionamentos e rewrites |
| `deploy.ps1` | Script de verificação (Windows) |
| `deploy.sh` | Script de verificação (Linux/Mac) |

## 🔧 Configurações Avançadas

### Domínio Personalizado
1. Vá em **Site settings** → **Domain management**
2. Clique em **"Add custom domain"**
3. Configure o DNS conforme instruções

### Variáveis de Ambiente
1. Vá em **Site settings** → **Environment variables**
2. Adicione suas variáveis se necessário

### Formulários Netlify
Configurado para capturar submissões de formulários automaticamente.

## 📊 Monitoramento

### Analytics
- **Netlify Analytics** disponível no dashboard
- **Core Web Vitals** automático
- **Deploy previews** para branches

### Logs
- **Function logs** em tempo real
- **Deploy logs** detalhados
- **Error tracking** integrado

## 🛠️ Troubleshooting

### PWA não instala?
- Verifique se `manifest.json` está acessível
- Confirme se `sw.js` está sendo servido corretamente
- Use DevTools → Application → Manifest

### Redirecionamentos não funcionam?
- Verifique o arquivo `_redirects`
- Confirme a sintaxe no `netlify.toml`
- Teste no deploy preview primeiro

### Cache não atualiza?
- Force refresh com `Ctrl+Shift+R`
- Limpe o Service Worker no DevTools
- Verifique os headers de cache

## 🎯 URLs Importantes

- **Dashboard**: https://app.netlify.com/projects/superelimites
- **Documentação**: https://docs.netlify.com/
- **Suporte**: https://www.netlify.com/support/
- **Status**: https://www.netlifystatus.com/

## 🚀 Deploy Imediato

Execute este comando para fazer o deploy agora:

```powershell
# Windows
.\deploy.ps1

# Ou abra o Netlify diretamente
Start-Process "https://app.netlify.com/projects/superelimites/overview"
```

---

**🎉 Projeto otimizado e pronto para produção!**

Todas as configurações estão automatizadas. Basta conectar com GitHub e seu aplicativo estará online em minutos!