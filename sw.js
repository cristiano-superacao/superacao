// Service Worker para PWA Superação
const CACHE_NAME = 'superacao-site-v1.2.0';
const RUNTIME_CACHE = 'superacao-runtime';

// Recursos para cache imediato
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/app-mockup.svg',
    '/app/',
    '/app/index.html',
    '/app/manifest.json',
    '/app/css/app.css',
    '/app/js/app.js'
];

// Recursos externos
const EXTERNAL_CACHE_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                // Cache recursos estáticos
                console.log('📦 Service Worker: Fazendo cache dos recursos estáticos');
                await cache.addAll(STATIC_CACHE_URLS);
                
                // Cache recursos externos (com tratamento de erro)
                console.log('🌐 Service Worker: Fazendo cache dos recursos externos');
                for (const url of EXTERNAL_CACHE_URLS) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Falha ao cachear: ${url}`, error);
                    }
                }
                
                console.log('✅ Service Worker: Instalação completa');
            } catch (error) {
                console.error('❌ Service Worker: Falha na instalação', error);
            }
        })()
    );
    
    // Forçar ativação imediata
    self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Ativando...');
    
    event.waitUntil(
        (async () => {
            try {
                // Limpar caches antigos
                const cacheNames = await caches.keys();
                const deletePromises = cacheNames
                    .filter(cacheName => 
                        cacheName.startsWith('superacao-') && 
                        cacheName !== CACHE_NAME && 
                        cacheName !== RUNTIME_CACHE
                    )
                    .map(cacheName => {
                        console.log(`🗑️ Removendo cache antigo: ${cacheName}`);
                        return caches.delete(cacheName);
                    });
                
                await Promise.all(deletePromises);
                console.log('✅ Service Worker: Ativação completa');
            } catch (error) {
                console.error('❌ Service Worker: Falha na ativação', error);
            }
        })()
    );
    
    // Assumir controle imediato
    return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Pular requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Pular requisições não-http
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        (async () => {
            try {
                // Tentar buscar no cache primeiro
                const cachedResponse = await caches.match(request);
                
                // Para recursos do app, priorizar cache
                if (isAppResource(request.url)) {
                    if (cachedResponse) {
                        // Atualizar cache em background
                        updateCacheInBackground(request);
                        return cachedResponse;
                    }
                }
                
                // Tentar rede primeiro para outros recursos
                try {
                    const networkResponse = await fetch(request);
                    
                    // Salvar resposta bem-sucedida no cache runtime
                    if (networkResponse.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(request, networkResponse.clone());
                    }
                    
                    return networkResponse;
                } catch (networkError) {
                    // Rede falhou, tentar cache
                    if (cachedResponse) {
                        console.log(`📱 Servindo do cache (offline): ${request.url}`);
                        return cachedResponse;
                    }
                    
                    // Se for navegação, retornar página offline
                    if (request.mode === 'navigate') {
                        return getOfflinePage();
                    }
                    
                    throw networkError;
                }
            } catch (error) {
                console.error('❌ Service Worker: Erro no fetch', error);
                
                // Fallback para navegação
                if (request.mode === 'navigate') {
                    return getOfflinePage();
                }
                
                throw error;
            }
        })()
    );
});

// Verificar se é recurso do app
function isAppResource(url) {
    return url.includes('/app/') || 
           url.includes('/styles.css') || 
           url.includes('/script.js') ||
           url.endsWith('/');
}

// Atualizar cache em background
async function updateCacheInBackground(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response);
        }
    } catch (error) {
        console.warn('⚠️ Falha na atualização de cache em background:', error);
    }
}

// Página offline
async function getOfflinePage() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const offlinePage = await cache.match('/index.html');
        
        if (offlinePage) {
            return offlinePage;
        }
        
        // Fallback básico
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Superação - Offline</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f0f0f0;
                    }
                    .offline-message {
                        background: white;
                        padding: 40px;
                        border-radius: 15px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        max-width: 400px;
                        margin: 0 auto;
                    }
                    .emoji { font-size: 3em; margin-bottom: 20px; }
                    h1 { color: #4CAF50; margin-bottom: 20px; }
                    button {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <div class="emoji">📱</div>
                    <h1>Superação</h1>
                    <p>Você está offline, mas o app ainda funciona!</p>
                    <p>Seus dados estão salvos localmente.</p>
                    <button onclick="window.location.reload()">Tentar Novamente</button>
                    <br><br>
                    <a href="/app/" style="color: #4CAF50;">Ir para o App</a>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Erro ao carregar página offline:', error);
        return new Response('App offline', { status: 200 });
    }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
    }
});

// Limpar todos os caches
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Todos os caches limpos');
    } catch (error) {
        console.error('❌ Erro ao limpar caches:', error);
    }
}

console.log('🚀 Service Worker carregado - Superação PWA');