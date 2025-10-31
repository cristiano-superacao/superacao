# 🛠️ Troubleshooting & FAQ - Superação App

## 📋 Índice
- [🚨 Problemas Comuns](#-problemas-comuns)
- [❓ Perguntas Frequentes](#-perguntas-frequentes)
- [🔧 Soluções Técnicas](#-soluções-técnicas)
- [📱 Problemas de Dispositivos](#-problemas-de-dispositivos)
- [🌐 Questões de Conectividade](#-questões-de-conectividade)
- [📞 Suporte](#-suporte)

---

## 🚨 Problemas Comuns

### 1. ❌ App não carrega ou tela branca
**Sintomas**: Página carrega mas fica em branco, ou erro de "Página não encontrada"

**Soluções**:
```javascript
// 1. Limpar cache do navegador
// No Chrome: Ctrl+Shift+Del → Limpar dados de navegação

// 2. Verificar JavaScript habilitado
// Configurações → Privacidade → Configurações de site → JavaScript → Permitir

// 3. Forçar atualização
// Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)

// 4. Verificar console do desenvolvedor
// F12 → Console → Procurar por erros em vermelho
```

**Verificação**:
- ✅ Internet funcionando?
- ✅ JavaScript habilitado?
- ✅ Cookies permitidos para o site?
- ✅ Extensões do navegador não bloqueando?

### 2. 📍 GPS não funciona
**Sintomas**: "Localização não disponível", precisão baixa, ou não detecta movimento

**Soluções**:
```javascript
// 1. Verificar permissões
if (navigator.permissions) {
    navigator.permissions.query({name: 'geolocation'})
    .then(result => console.log('GPS:', result.state));
}

// 2. Testar localização manual
navigator.geolocation.getCurrentPosition(
    pos => console.log('✅ GPS OK:', pos.coords),
    err => console.error('❌ GPS Error:', err.message)
);
```

**Configurações por dispositivo**:
- **Android**: Configurações → Local → Ativar "Precisão alta"
- **iPhone**: Ajustes → Privacidade → Serviços de localização → Safari → "Ao usar app"
- **Desktop**: Chrome → ⋮ → Configurações → Privacidade → Configurações de site → Localização

### 3. 🔔 Notificações não aparecem
**Sintomas**: Não recebe lembretes de tarefas ou conquistas

**Diagnóstico**:
```javascript
// Verificar status das notificações
console.log('Notificações:', Notification.permission);

// Testar notificação manual
new Notification('Teste', {
    body: 'Se você vê isso, notificações funcionam!',
    icon: '/app/assets/icon-192.png'
});
```

**Soluções**:
1. **Permitir notificações**: Clicar em "Permitir" quando solicitado
2. **Configurações do sistema**:
   - Windows 10/11: Configurações → Sistema → Notificações
   - macOS: Preferências → Notificações → Chrome/Safari
   - Android: Configurações → Apps → Chrome → Notificações
   - iOS: Ajustes → Notificações → Safari

### 4. 💾 Dados perdidos ou não salvam
**Sintomas**: Tarefas criadas desaparecem, pontuação zerada, perfil resetado

**Verificação do localStorage**:
```javascript
// Abrir console (F12) e executar:
console.log('Usuário:', localStorage.getItem('superacao-user'));
console.log('Tarefas:', localStorage.getItem('superacao-tasks'));
console.log('Espaço usado:', JSON.stringify(localStorage).length + ' bytes');

// Verificar se localStorage funciona
try {
    localStorage.setItem('teste', 'ok');
    localStorage.removeItem('teste');
    console.log('✅ localStorage funcionando');
} catch(e) {
    console.error('❌ localStorage bloqueado:', e);
}
```

**Soluções**:
1. **Modo privado desabilitado**: Não usar navegação anônima/privada
2. **Espaço suficiente**: Limpar dados desnecessários do navegador
3. **Cookies habilitados**: Permitir cookies para o site
4. **Backup manual**: Exportar dados importantes regularmente

### 5. 🐌 App lento ou travando
**Sintomas**: Demora para responder, animações lentas, travamentos

**Diagnóstico de performance**:
```javascript
// Verificar performance no console
console.time('app-load');
// ... após app carregar completamente
console.timeEnd('app-load');

// Verificar uso de memória
if (performance.memory) {
    console.log('Memória usada:', performance.memory.usedJSHeapSize);
}
```

**Otimizações**:
1. **Fechar abas desnecessárias**
2. **Reiniciar navegador**
3. **Limpar cache do app** (Configurações → Armazenamento)
4. **Verificar extensões** que podem estar interferindo
5. **Atualizar navegador** para versão mais recente

---

## ❓ Perguntas Frequentes

### 📱 Instalação & Uso

**Q: Como instalar o app no celular?**
A: 
1. Abra no navegador: `https://seu-site.netlify.app/app/`
2. No Chrome Android: Menu ⋮ → "Adicionar à tela inicial"
3. No Safari iOS: Compartilhar → "Adicionar à tela de início"
4. Aceite a instalação e o ícone aparecerá na tela inicial

**Q: O app funciona offline?**
A: Sim! O Service Worker cacheia os arquivos principais. Funcionalidades disponíveis offline:
- ✅ Visualizar tarefas existentes
- ✅ Criar novas tarefas
- ✅ Usar GPS tracker
- ✅ Ver ranking local
- ❌ Sincronizar dados (necessita internet)

**Q: Posso usar em vários dispositivos?**
A: Atualmente os dados ficam no dispositivo local. Para usar em múltiplos dispositivos:
1. Exporte os dados de um dispositivo
2. Importe no outro dispositivo
3. *Próxima versão terá sincronização automática*

### 🏃‍♂️ GPS & Exercícios

**Q: O GPS consome muita bateria?**
A: O app é otimizado para eficiência:
- 🔋 Usa GPS apenas durante atividades
- 🔋 Desliga automaticamente ao pausar
- 🔋 Configuração de precisão balanceada
- 💡 **Dica**: Usar modo economia de energia do celular durante exercícios longos

**Q: Como melhorar a precisão do GPS?**
A:
1. **Usar ao ar livre** (sinal melhor que em ambientes fechados)
2. **Aguardar alguns segundos** antes de iniciar (GPS precisa "esquentar")
3. **Verificar se há atualizações** do sistema operacional
4. **Limpar cache** do navegador ocasionalmente

**Q: GPS funciona em qualquer lugar?**
A: 
- ✅ **Funciona**: Áreas abertas, parques, ruas, trilhas
- ⚠️ **Limitado**: Shopping centers, prédios, túneis
- ❌ **Não funciona**: Subsolo, áreas sem cobertura celular

### 📊 Pontuação & Ranking

**Q: Como funciona o sistema de pontos?**
A: 
```
📋 Tarefa completada: 10-25 pontos (varia por categoria)
🏃‍♂️ Exercício GPS: 10 pontos por km percorrido
🎯 Meta diária alcançada: 50 pontos bonus
🏆 Sequência de dias: +5 pontos por dia consecutivo
```

**Q: Posso perder pontos?**
A: Não! O sistema é baseado apenas em conquistas positivas. Pontos nunca são subtraídos.

**Q: Como subir no ranking?**
A: 
1. **Complete tarefas diariamente** (consistência é chave)
2. **Use o GPS tracker** (exercícios dão muitos pontos)
3. **Mantenha sequências** (bonus por dias consecutivos)
4. **Varie as atividades** (diferentes categorias)

### 🔐 Privacidade & Segurança

**Q: Meus dados estão seguros?**
A: Sim, múltiplas camadas de proteção:
- 🔒 **Dados locais**: Ficam apenas no seu dispositivo
- 🔒 **HTTPS obrigatório**: Toda comunicação criptografada
- 🔒 **Sem tracking**: Não coletamos dados pessoais
- 🔒 **Open source**: Código disponível para auditoria

**Q: Vocês vendem meus dados?**
A: **Nunca!** Nem coletamos dados vendáveis:
- ❌ Não rastreamos localização permanentemente
- ❌ Não acessamos contatos ou fotos
- ❌ Não fazemos perfil publicitário
- ✅ GPS usado apenas durante exercícios escolhidos por você

---

## 🔧 Soluções Técnicas

### Debug Mode (Desenvolvedores)

Para ativar logs detalhados, abra o console (F12) e execute:
```javascript
// Ativar modo debug
localStorage.setItem('superacao-debug', 'true');
location.reload();

// Verificar logs
console.log('=== SUPERAÇÃO DEBUG ===');
console.log('User:', JSON.parse(localStorage.getItem('superacao-user') || '{}'));
console.log('Tasks:', JSON.parse(localStorage.getItem('superacao-tasks') || '[]'));
console.log('GPS Support:', 'geolocation' in navigator);
console.log('Notifications:', Notification.permission);
console.log('ServiceWorker:', 'serviceWorker' in navigator);
```

### Limpeza Completa de Dados
```javascript
// ⚠️ CUIDADO: Remove TODOS os dados do app
function resetApp() {
    if (confirm('⚠️ Resetar TODOS os dados? Esta ação não pode ser desfeita!')) {
        // Limpar localStorage
        Object.keys(localStorage)
            .filter(key => key.startsWith('superacao-'))
            .forEach(key => localStorage.removeItem(key));
        
        // Limpar cache do ServiceWorker
        if ('serviceWorker' in navigator) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        alert('✅ App resetado! Recarregando...');
        location.reload();
    }
}
// resetApp(); // Descomente para executar
```

### Backup & Restauração
```javascript
// Fazer backup dos dados
function exportData() {
    const data = {
        user: JSON.parse(localStorage.getItem('superacao-user') || '{}'),
        tasks: JSON.parse(localStorage.getItem('superacao-tasks') || '[]'),
        settings: JSON.parse(localStorage.getItem('superacao-settings') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superacao-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Restaurar backup
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        if (data.user) localStorage.setItem('superacao-user', JSON.stringify(data.user));
        if (data.tasks) localStorage.setItem('superacao-tasks', JSON.stringify(data.tasks));
        if (data.settings) localStorage.setItem('superacao-settings', JSON.stringify(data.settings));
        
        alert('✅ Dados restaurados com sucesso!');
        location.reload();
    } catch (e) {
        alert('❌ Erro ao importar: arquivo inválido');
    }
}
```

---

## 📱 Problemas de Dispositivos

### 🤖 Android

**Chrome não permite instalação**:
```javascript
// Verificar se PWA é instalável
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ App instalável detectado');
    e.preventDefault();
    window.installPrompt = e;
});
```

**GPS impreciso**:
1. Ativar "Localização de alta precisão"
2. Permitir "Melhorar precisão da localização"
3. Verificar se Google Play Services está atualizado

**Notificações não funcionam**:
1. Configurações → Apps → Chrome → Notificações → Ativar
2. Verificar se "Não perturbe" não está ativo
3. Testar com outros apps se notificações funcionam

### 🍎 iOS (iPhone/iPad)

**Safari não instala PWA**:
- Certificar que está usando Safari (não Chrome)
- Versão iOS 11.3+ necessária
- Compartilhar → "Adicionar à Tela de Início"

**GPS não funciona no Safari**:
1. Ajustes → Privacidade → Serviços de Localização → Safari → "Ao Usar o App"
2. Aguardar alguns segundos após abrir o app
3. Aceitar permissão quando solicitado

**Notificações limitadas**:
- iOS não suporta notificações PWA completamente
- Usar lembretes nativos do iOS como alternativa

### 🖥️ Desktop (Windows/Mac/Linux)

**Chrome não mostra opção de instalação**:
```javascript
// Verificar se PWA atende critérios
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('ServiceWorkers:', registrations.length);
});
```

**Edge/Firefox limitações**:
- Edge suporta PWA parcialmente
- Firefox não suporta instalação PWA
- Usar Chrome ou Safari para melhor experiência

---

## 🌐 Questões de Conectividade

### Internet Lenta
- App funciona offline após primeira visita
- Dados são sincronizados quando conexão melhora
- GPS funciona sem internet (usa dados locais)

### Bloqueio de Firewall/Proxy
Se o app não carrega em rede corporativa:
```
Portas necessárias: 80 (HTTP), 443 (HTTPS)
Domínios: *.netlify.app, *.neon.tech
APIs: Geolocation (local), Web Notifications (local)
```

### Erro de Certificado SSL
- Verificar data/hora do sistema
- Limpar cache do navegador
- Tentar em modo anônimo

---

## 🛡️ Resolução de Problemas por Categoria

### Categoria: Instalação
| Problema | Sintoma | Solução |
|----------|---------|---------|
| Não aparece opção instalar | Botão "Adicionar" não surge | Aguardar 5-10s, atualizar página |
| Ícone não aparece na tela | App instalou mas sem ícone | Reiniciar dispositivo, verificar pasta de apps |
| Erro "App não pode ser instalado" | Mensagem de erro na instalação | Liberar espaço, verificar permissões |

### Categoria: Funcionalidade
| Problema | Sintoma | Solução |
|----------|---------|---------|
| Tarefas não salvam | Tarefa criada desaparece | Verificar localStorage, não usar modo privado |
| GPS travado em "Procurando..." | Nunca encontra localização | Sair ao ar livre, aguardar 30s, verificar permissões |
| Pontos não calculam | Atividades feitas mas sem pontos | Verificar se tarefa foi marcada como completa |

### Categoria: Performance  
| Problema | Sintoma | Solução |
|----------|---------|---------|
| App lento para carregar | Demora >10s para abrir | Limpar cache, verificar conexão, fechar outras abas |
| Travamentos frequentes | App congela ou não responde | Reiniciar navegador, verificar memória disponível |
| Animações cortadas | Transições não fluidas | Desabilitar extensões, fechar apps desnecessários |

---

## 📞 Suporte

### 🔍 Antes de Contatar Suporte

**Colete estas informações**:
```javascript
// Execute no console (F12) e envie resultado:
const diagnostics = {
    // Informações do navegador
    userAgent: navigator.userAgent,
    language: navigator.language,
    onLine: navigator.onLine,
    
    // Capacidades do dispositivo
    geolocation: 'geolocation' in navigator,
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    localStorage: (() => {
        try { 
            localStorage.setItem('test', '1'); 
            localStorage.removeItem('test'); 
            return true; 
        } catch(e) { 
            return false; 
        }
    })(),
    
    // Estado do app
    user: !!localStorage.getItem('superacao-user'),
    tasks: (JSON.parse(localStorage.getItem('superacao-tasks') || '[]')).length,
    errors: console.error.length || 0,
    
    // Informações da página
    url: location.href,
    timestamp: new Date().toISOString()
};

console.log('=== DIAGNÓSTICO SUPERAÇÃO ===');
console.log(JSON.stringify(diagnostics, null, 2));
```

### 📧 Canais de Suporte

**📚 Documentação**:
- README.md - Visão geral e instalação
- GUIA-DE-USO.md - Manual do usuário detalhado
- DOCUMENTACAO-TECNICA.md - Referência para desenvolvedores

**💬 Comunidade**:
- GitHub Issues - Reportar bugs e sugerir melhorias
- Email: cristiano.s.santos@ba.estudante.senai.br

**🔧 Suporte Técnico**:
- Problemas críticos: Criar issue no GitHub com label "bug"
- Dúvidas de uso: Consultar GUIA-DE-USO.md primeiro
- Sugestões: Criar issue com label "enhancement"

### 📋 Template para Reportar Bugs

```markdown
**Descrição do Bug**
Breve descrição do que aconteceu.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria ter acontecido.

**Screenshots**
Se aplicável, adicione capturas de tela.

**Informações do Dispositivo:**
- OS: [e.g. iOS 15, Android 12, Windows 11]
- Navegador: [e.g. Chrome 91, Safari 14]
- Versão do App: [encontrado em Configurações → Sobre]

**Informações Adicionais**
Qualquer contexto adicional sobre o problema.

**Diagnóstico Técnico**
[Cole o resultado do código de diagnóstico acima]
```

### ⏱️ Tempo de Resposta

- **Bugs críticos** (app não funciona): 24-48h
- **Bugs menores** (funcionalidade específica): 3-5 dias
- **Melhorias/sugestões**: Próxima versão
- **Dúvidas gerais**: 1-2 dias

### 🏥 Status do Sistema

Para verificar se há problemas conhecidos:
1. Acesse a página de status no GitHub
2. Verifique issues abertas
3. Consulte últimas atualizações no CHANGELOG.md

---

**🛠️ Este documento é atualizado frequentemente**  
**📅 Última atualização**: 31/10/2025  
**🔄 Versão do troubleshooting**: 1.0  
**📧 Suporte**: cristiano.s.santos@ba.estudante.senai.br