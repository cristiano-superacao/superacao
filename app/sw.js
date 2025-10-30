// Service Worker for Superação PWA
const CACHE_NAME = 'superacao-app-v1.0.0';
const STATIC_CACHE = 'superacao-static-v1.0.0';
const DYNAMIC_CACHE = 'superacao-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/app/',
    '/app/index.html',
    '/app/css/app.css',
    '/app/js/app.js',
    '/app/js/tasks.js',
    '/app/js/ranking.js',
    '/app/js/ai-coach.js',
    '/app/js/storage.js',
    '/app/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Dynamic content patterns
const API_PATTERNS = [
    /^https:\/\/api\.superacao\.app\//,
    /^https:\/\/cdn\./
];

// Install Event - Cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static files', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // For static files, serve from cache and update in background
                    if (isStaticFile(request.url)) {
                        updateCacheInBackground(request);
                        return cachedResponse;
                    }
                    
                    // For dynamic content, check if it's fresh enough
                    const cacheDate = new Date(cachedResponse.headers.get('date'));
                    const now = new Date();
                    const hoursSinceCached = (now - cacheDate) / (1000 * 60 * 60);
                    
                    if (hoursSinceCached < 1) { // Use cache if less than 1 hour old
                        return cachedResponse;
                    }
                }
                
                // Fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Determine cache strategy
                        if (isStaticFile(request.url)) {
                            caches.open(STATIC_CACHE)
                                .then((cache) => cache.put(request, responseToCache));
                        } else if (isDynamicContent(request.url)) {
                            caches.open(DYNAMIC_CACHE)
                                .then((cache) => cache.put(request, responseToCache));
                        }
                        
                        return response;
                    })
                    .catch((error) => {
                        console.log('Service Worker: Network fetch failed', error);
                        
                        // Return cached version if network fails
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Return offline page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match('/app/offline.html') || 
                                   new Response('App offline. Please check your connection.', {
                                       status: 503,
                                       statusText: 'Service Unavailable'
                                   });
                        }
                        
                        // Return empty response for other requests
                        return new Response('', { status: 503 });
                    });
            })
    );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    } else if (event.tag === 'sync-user-data') {
        event.waitUntil(syncUserData());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação do Superação!',
        icon: '/app/assets/icon-192.png',
        badge: '/app/assets/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir App',
                icon: '/app/assets/action-explore.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/app/assets/action-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Superação', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/app/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open app
        event.waitUntil(
            clients.matchAll().then((clients) => {
                if (clients.length > 0) {
                    return clients[0].focus();
                } else {
                    return clients.openWindow('/app/');
                }
            })
        );
    }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'CACHE_UPDATE') {
        updateCache(event.data.url);
    } else if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearOldCaches();
    }
});

// Utility functions
function isStaticFile(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.includes(ext)) || 
           STATIC_FILES.some(file => url.includes(file));
}

function isDynamicContent(url) {
    return API_PATTERNS.some(pattern => pattern.test(url)) ||
           url.includes('/api/') ||
           url.includes('cdn.');
}

function updateCacheInBackground(request) {
    fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                caches.open(STATIC_CACHE)
                    .then((cache) => cache.put(request, response));
            }
        })
        .catch(() => {
            // Silently fail background updates
        });
}

async function syncTasks() {
    try {
        // Get pending tasks from IndexedDB or localStorage
        const pendingTasks = await getPendingTasks();
        
        if (pendingTasks.length > 0) {
            // Send to server (when API is available)
            // For now, just mark as synced
            await markTasksAsSynced(pendingTasks);
            console.log('Service Worker: Tasks synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: Task sync failed', error);
        throw error; // Will retry the sync
    }
}

async function syncUserData() {
    try {
        // Get pending user data updates
        const pendingUserData = await getPendingUserData();
        
        if (pendingUserData) {
            // Send to server (when API is available)
            // For now, just mark as synced
            await markUserDataAsSynced();
            console.log('Service Worker: User data synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: User data sync failed', error);
        throw error;
    }
}

async function getPendingTasks() {
    // Mock implementation - replace with actual IndexedDB/localStorage access
    return [];
}

async function markTasksAsSynced(tasks) {
    // Mock implementation
    return Promise.resolve();
}

async function getPendingUserData() {
    // Mock implementation
    return null;
}

async function markUserDataAsSynced() {
    // Mock implementation
    return Promise.resolve();
}

function updateCache(url) {
    caches.open(DYNAMIC_CACHE)
        .then((cache) => {
            return fetch(url)
                .then((response) => {
                    if (response.status === 200) {
                        cache.put(url, response);
                    }
                });
        })
        .catch((error) => {
            console.error('Service Worker: Cache update failed', error);
        });
}

function clearOldCaches() {
    caches.keys()
        .then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Old caches cleared');
        });
}

// Periodic background sync (if supported)
if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'daily-sync') {
            event.waitUntil(performDailySync());
        }
    });
}

async function performDailySync() {
    console.log('Service Worker: Performing daily sync');
    
    try {
        // Sync tasks, user data, ranking, etc.
        await Promise.all([
            syncTasks(),
            syncUserData()
        ]);
        
        // Show success notification
        self.registration.showNotification('Dados sincronizados!', {
            body: 'Seus dados foram atualizados com sucesso.',
            icon: '/app/assets/icon-192.png',
            tag: 'sync-success'
        });
        
    } catch (error) {
        console.error('Service Worker: Daily sync failed', error);
        
        // Show error notification
        self.registration.showNotification('Erro na sincronização', {
            body: 'Não foi possível sincronizar seus dados. Tente novamente mais tarde.',
            icon: '/app/assets/icon-192.png',
            tag: 'sync-error'
        });
    }
}

// Performance monitoring
self.addEventListener('install', () => {
    console.log('Service Worker: Performance - Install time:', performance.now());
});

self.addEventListener('activate', () => {
    console.log('Service Worker: Performance - Activate time:', performance.now());
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Loaded successfully');