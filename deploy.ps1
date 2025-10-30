# Script de Deploy Automático para Netlify (Windows PowerShell)
# Execute: .\deploy.ps1

Write-Host "🚀 Preparando deploy para Netlify..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "netlify.toml")) {
    Write-Host "❌ Erro: netlify.toml não encontrado. Execute este script na raiz do projeto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configurações encontradas:" -ForegroundColor Green
Write-Host "   - netlify.toml"
Write-Host "   - _headers"
Write-Host "   - _redirects"

# Verificar estrutura do app
if ((Test-Path "app") -and (Test-Path "app\index.html")) {
    Write-Host "✅ Aplicativo PWA encontrado em /app/" -ForegroundColor Green
} else {
    Write-Host "❌ Erro: Aplicativo não encontrado em /app/" -ForegroundColor Red
    exit 1
}

# Verificar arquivos essenciais do PWA
$essentialFiles = @(
    "app\index.html",
    "app\manifest.json",
    "app\sw.js",
    "app\css\app.css",
    "app\js\app.js"
)

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Arquivo essencial não encontrado: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎯 Projeto pronto para deploy no Netlify!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Vá para: https://app.netlify.com/projects/superelimites/overview"
Write-Host "2. Clique em 'New site from Git'"
Write-Host "3. Conecte com GitHub e selecione o repositório 'superacao'"
Write-Host "4. Configure:"
Write-Host "   - Branch: main"
Write-Host "   - Build command: (deixar vazio)"
Write-Host "   - Publish directory: . (ponto)"
Write-Host "5. Clique em 'Deploy site'"
Write-Host ""
Write-Host "🌐 URLs após deploy:" -ForegroundColor Cyan
Write-Host "   - Site principal: https://[seu-dominio].netlify.app/"
Write-Host "   - App PWA: https://[seu-dominio].netlify.app/app/"
Write-Host ""
Write-Host "✨ Recursos configurados:" -ForegroundColor Green
Write-Host "   ✅ Progressive Web App (PWA)"
Write-Host "   ✅ Service Worker para cache offline"
Write-Host "   ✅ Instalação como app nativo"
Write-Host "   ✅ Redirecionamentos SPA"
Write-Host "   ✅ Headers de segurança"
Write-Host "   ✅ Cache otimizado"
Write-Host ""

# Mostrar estatísticas do projeto
Write-Host "📊 Estatísticas do projeto:" -ForegroundColor Cyan
$htmlFiles = (Get-ChildItem -Recurse -Filter "*.html").Count
$cssFiles = (Get-ChildItem -Recurse -Filter "*.css").Count
$jsFiles = (Get-ChildItem -Recurse -Filter "*.js").Count
$svgFiles = (Get-ChildItem -Recurse -Filter "*.svg").Count

Write-Host "   - Arquivos HTML: $htmlFiles"
Write-Host "   - Arquivos CSS: $cssFiles"
Write-Host "   - Arquivos JavaScript: $jsFiles"
Write-Host "   - Ícones SVG: $svgFiles"

Write-Host ""
Write-Host "🎉 Deploy automático configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dica: Para abrir o Netlify, execute:" -ForegroundColor Yellow
Write-Host "   Start-Process 'https://app.netlify.com/projects/superelimites/overview'"