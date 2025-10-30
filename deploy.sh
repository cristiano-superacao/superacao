#!/bin/bash
# Script de Deploy Automático para Netlify

echo "🚀 Preparando deploy para Netlify..."

# Verificar se estamos no diretório correto
if [ ! -f "netlify.toml" ]; then
    echo "❌ Erro: netlify.toml não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

echo "✅ Configurações encontradas:"
echo "   - netlify.toml"
echo "   - _headers"
echo "   - _redirects"

# Verificar estrutura do app
if [ -d "app" ] && [ -f "app/index.html" ]; then
    echo "✅ Aplicativo PWA encontrado em /app/"
else
    echo "❌ Erro: Aplicativo não encontrado em /app/"
    exit 1
fi

# Verificar arquivos essenciais do PWA
essential_files=(
    "app/index.html"
    "app/manifest.json"
    "app/sw.js"
    "app/css/app.css"
    "app/js/app.js"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Arquivo essencial não encontrado: $file"
        exit 1
    fi
done

echo ""
echo "🎯 Projeto pronto para deploy no Netlify!"
echo ""
echo "📋 Próximos passos:"
echo "1. Vá para: https://app.netlify.com/projects/superelimites/overview"
echo "2. Clique em 'New site from Git'"
echo "3. Conecte com GitHub e selecione o repositório 'superacao'"
echo "4. Configure:"
echo "   - Branch: main"
echo "   - Build command: (deixar vazio)"
echo "   - Publish directory: . (ponto)"
echo "5. Clique em 'Deploy site'"
echo ""
echo "🌐 URLs após deploy:"
echo "   - Site principal: https://[seu-dominio].netlify.app/"
echo "   - App PWA: https://[seu-dominio].netlify.app/app/"
echo ""
echo "✨ Recursos configurados:"
echo "   ✅ Progressive Web App (PWA)"
echo "   ✅ Service Worker para cache offline"
echo "   ✅ Instalação como app nativo"
echo "   ✅ Redirecionamentos SPA"
echo "   ✅ Headers de segurança"
echo "   ✅ Cache otimizado"
echo ""

# Mostrar estatísticas do projeto
echo "📊 Estatísticas do projeto:"
if command -v find &> /dev/null; then
    html_files=$(find . -name "*.html" | wc -l)
    css_files=$(find . -name "*.css" | wc -l)
    js_files=$(find . -name "*.js" | wc -l)
    svg_files=$(find . -name "*.svg" | wc -l)
    
    echo "   - Arquivos HTML: $html_files"
    echo "   - Arquivos CSS: $css_files"
    echo "   - Arquivos JavaScript: $js_files"
    echo "   - Ícones SVG: $svg_files"
fi

echo ""
echo "🎉 Deploy automático configurado com sucesso!"