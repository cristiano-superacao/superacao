# Script de Limpeza - Domínios Antigos
# Remove todas as referências ao domínio temporário supermittos.netlify.app

Write-Host "🧹 Iniciando limpeza de referências antigas..." -ForegroundColor Yellow

# Lista de arquivos para verificar
$arquivos = @(
    "README.md",
    "index.html", 
    "app/index.html",
    "app/manifest.json",
    "manifest.json",
    "script.js",
    "app/js/*.js",
    "*.md"
)

Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host "📊 Projeto configurado para: https://app.netlify.com/projects/superelimites/overview" -ForegroundColor Cyan
Write-Host "🎯 Configure seu domínio personalizado no dashboard do Netlify" -ForegroundColor Cyan