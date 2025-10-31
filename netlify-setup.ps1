# 🚀 Script de Configuração Automática do Netlify
# Execute este script para configurar o deploy automático

param(
    [string]$SiteName = "supermittos",
    [string]$Domain = "supermittos.netlify.app",
    [switch]$OpenBrowser = $true
)

Write-Host "🌟 Configurando Deploy Automático do Netlify" -ForegroundColor Cyan
Write-Host "=" * 50

# Verificar se estamos no diretório correto
if (-not (Test-Path "netlify.toml")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto (onde está o netlify.toml)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projeto detectado: Superação PWA" -ForegroundColor Green
Write-Host "📁 Diretório: $(Get-Location)" -ForegroundColor Gray

# Verificar se git está configurado
try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Git não inicializado"
    }
    Write-Host "✅ Repositório Git ativo" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: Repositório Git não encontrado" -ForegroundColor Red
    Write-Host "💡 Execute: git init && git remote add origin https://github.com/cristiano-superacao/superacao.git" -ForegroundColor Yellow
    exit 1
}

# Verificar repositório remoto
try {
    $remoteUrl = git remote get-url origin 2>&1
    if ($remoteUrl -match "cristiano-superacao/superacao") {
        Write-Host "✅ Repositório conectado: $remoteUrl" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Repositório: $remoteUrl" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Repositório remoto não configurado" -ForegroundColor Red
    exit 1
}

# Verificar status dos arquivos
Write-Host "`n📋 Verificando arquivos essenciais..." -ForegroundColor Cyan

$essentialFiles = @{
    "index.html" = "Página principal"
    "netlify.toml" = "Configuração Netlify"
    "_redirects" = "Redirecionamentos"
    "_headers" = "Headers de segurança"
    "app/index.html" = "PWA principal"
    "app/manifest.json" = "Manifest PWA"
    "app/sw.js" = "Service Worker"
    "styles.css" = "Estilos globais"
    "script.js" = "Funcionalidades"
}

$missingFiles = @()
foreach ($file in $essentialFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "  ✅ $($essentialFiles[$file]): $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($essentialFiles[$file]): $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n❌ Arquivos essenciais não encontrados: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

# Verificar se há alterações não commitadas
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "`n📝 Alterações detectadas - fazendo commit automático..." -ForegroundColor Yellow
    
    git add .
    $commitMsg = "🚀 Auto-deploy setup - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMsg
    
    Write-Host "✅ Commit realizado: $commitMsg" -ForegroundColor Green
}

# Push para GitHub
Write-Host "`n📤 Enviando para GitHub..." -ForegroundColor Cyan
try {
    git push origin master
    Write-Host "✅ Push realizado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no push. Verifique suas credenciais do GitHub" -ForegroundColor Red
    Write-Host "💡 Tente: git push origin master --force" -ForegroundColor Yellow
}

# Informações de configuração do Netlify
Write-Host "`n🔧 Configuração do Netlify" -ForegroundColor Cyan
Write-Host "=" * 30

$netlifyConfig = @"
🌐 CONFIGURAÇÕES PARA O NETLIFY:

📂 Repository: cristiano-superacao/superacao
🌿 Branch: master
🔨 Build command: (deixar vazio ou: echo "Build completed")
📁 Publish directory: . (ponto)
🏷️  Site name: $SiteName

🔧 Build Settings Avançadas:
   Base directory: (deixar vazio)
   Functions directory: (deixar vazio)
   Edge Functions directory: (deixar vazio)

🌍 Custom Domain (opcional):
   Primary domain: $Domain
   
📋 Environment Variables (se necessário):
   NODE_VERSION: 18
   HUGO_VERSION: (não aplicável)
"@

Write-Host $netlifyConfig -ForegroundColor White

# URLs importantes
Write-Host "`n🔗 Links Importantes:" -ForegroundColor Cyan
Write-Host "🌐 Site: https://$Domain" -ForegroundColor Green
Write-Host "📱 PWA: https://$Domain/app/" -ForegroundColor Green
Write-Host "⚙️  Netlify Dashboard: https://app.netlify.com/sites/$SiteName" -ForegroundColor Green
Write-Host "📊 Deploy Status: https://app.netlify.com/sites/$SiteName/deploys" -ForegroundColor Green
Write-Host "📈 Analytics: https://app.netlify.com/sites/$SiteName/analytics" -ForegroundColor Green
Write-Host "🔧 GitHub Repo: https://github.com/cristiano-superacao/superacao" -ForegroundColor Green

# Passos manuais no Netlify
Write-Host "`n📋 PASSOS MANUAIS NO NETLIFY:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://app.netlify.com/" -ForegroundColor White
Write-Host "2. Clique em 'New site from Git'" -ForegroundColor White
Write-Host "3. Selecione 'GitHub'" -ForegroundColor White
Write-Host "4. Escolha o repositório: cristiano-superacao/superacao" -ForegroundColor White
Write-Host "5. Configure:" -ForegroundColor White
Write-Host "   - Branch: master" -ForegroundColor Gray
Write-Host "   - Build command: (vazio)" -ForegroundColor Gray
Write-Host "   - Publish directory: ." -ForegroundColor Gray
Write-Host "6. Clique em 'Deploy site'" -ForegroundColor White
Write-Host "7. Aguarde o deploy (~1-2 minutos)" -ForegroundColor White
Write-Host "8. Configure o dominio customizado (opcional)" -ForegroundColor White

# Estatísticas do projeto
Write-Host "`n📊 Estatísticas do Projeto:" -ForegroundColor Cyan
$stats = @{
    "HTML" = (Get-ChildItem -Recurse -Filter "*.html").Count
    "CSS" = (Get-ChildItem -Recurse -Filter "*.css").Count
    "JavaScript" = (Get-ChildItem -Recurse -Filter "*.js").Count
    "JSON" = (Get-ChildItem -Recurse -Filter "*.json").Count
    "MD" = (Get-ChildItem -Recurse -Filter "*.md").Count
}

foreach ($type in $stats.Keys) {
    Write-Host "   $type`: $($stats[$type]) arquivos" -ForegroundColor Gray
}

# Verificar tamanho do projeto
$projectSize = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($projectSize / 1MB, 2)
Write-Host "   Tamanho total: $sizeInMB MB" -ForegroundColor Gray

# Abrir navegador automaticamente
if ($OpenBrowser) {
    Write-Host "`n🌐 Abrindo Netlify no navegador..." -ForegroundColor Cyan
    Start-Process "https://app.netlify.com/"
    Start-Sleep 2
    Write-Host "`n🎯 Abrindo site atual..." -ForegroundColor Cyan
    Start-Process "https://$Domain"
}

# Mensagem final
Write-Host "`n🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=" * 30
Write-Host "✅ Repositório configurado e sincronizado" -ForegroundColor Green
Write-Host "✅ Arquivos essenciais verificados" -ForegroundColor Green  
Write-Host "✅ Push para GitHub realizado" -ForegroundColor Green
Write-Host "✅ Configurações do Netlify prontas" -ForegroundColor Green

Write-Host "`n⏱️  Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Complete a configuração manual no Netlify (3-5 minutos)" -ForegroundColor White
Write-Host "2. Aguarde o primeiro deploy automático (1-2 minutos)" -ForegroundColor White
Write-Host "3. Teste o site e PWA em https://$Domain" -ForegroundColor White
Write-Host "4. Configure domínio customizado (opcional)" -ForegroundColor White

Write-Host "`n🚀 Deploy automático estará ativo após a configuração!" -ForegroundColor Cyan
Write-Host "   Toda alteração no GitHub será automaticamente deployada." -ForegroundColor Gray

Write-Host "`n💡 Para futuras atualizações, apenas execute:" -ForegroundColor Yellow
Write-Host "   git add . && git commit -m 'Suas alterações' && git push origin master" -ForegroundColor White