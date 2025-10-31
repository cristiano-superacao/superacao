# Script de Configuração Automatizada do Netlify
# Executa todas as configurações necessárias para o deploy

param(
    [string]$Message = "Auto-deploy configuration update"
)

Write-Host "🚀 Configurando Netlify para deploy automático..." -ForegroundColor Green

# 1. Verificar se estamos no diretório correto
if (-not (Test-Path "index.html")) {
    Write-Host "❌ Erro: index.html não encontrado. Execute este script na pasta do projeto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verificando arquivos principais..." -ForegroundColor Yellow

# 2. Verificar arquivos essenciais
$arquivosEssenciais = @("index.html", "netlify.toml", "_redirects", "_headers")
foreach ($arquivo in $arquivosEssenciais) {
    if (Test-Path $arquivo) {
        Write-Host "   ✓ $arquivo" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $arquivo - FALTANDO!" -ForegroundColor Red
    }
}

# 3. Verificar status do Git
Write-Host "📊 Verificando status do repositório..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Alterações detectadas, fazendo commit..." -ForegroundColor Cyan
    
    # Adicionar todos os arquivos
    git add .
    
    # Commit com timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "🔧 NETLIFY CONFIG: $Message - $timestamp

✅ Configuration Updates:
- Optimized _redirects for SPA routing
- Updated _headers for security and performance  
- Netlify.toml build configuration
- Auto-deploy ready

🎯 Project: superelimites
📊 Dashboard: https://app.netlify.com/projects/superelimites/overview
🚀 Deploy: Automatic on push to master"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
        
        # Push para GitHub
        Write-Host "🌐 Enviando para GitHub..." -ForegroundColor Cyan
        git push origin master
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "🚀 Deploy iniciado automaticamente!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Monitor the deployment:" -ForegroundColor Cyan
            Write-Host "   https://app.netlify.com/projects/superelimites/overview" -ForegroundColor Blue
            Write-Host ""
            Write-Host "⏱️  Build time: ~2-3 minutes" -ForegroundColor Yellow
            Write-Host "🎯 Your site will be live after build completes!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro no push para GitHub" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erro no commit" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Nenhuma alteração pendente" -ForegroundColor Green
    Write-Host "📊 Verificar deploy em: https://app.netlify.com/projects/superelimites/overview" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "📱 Seu site será deployado automaticamente a cada push!" -ForegroundColor Cyan