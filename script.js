document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    // Funcionalidade para o menu hamburguer
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            // Alterna a classe 'active' para mostrar/esconder o menu
            navMenu.classList.toggle('active');
            
            // Opcional: Altera o ícone do botão (X ou Hamburger)
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times'); // Ícone de 'X' para fechar
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars'); // Ícone Hamburger
            }
        });

        // Oculta o menu ao clicar em um link (apenas no mobile)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 480) {
                    navMenu.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    }

    // Animações de Scroll (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Elementos para animar
    const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .benefit-item, .ia-panel, .ranking-panel');
    animateElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });

    // Smooth scroll para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contador animado para pontuações do ranking
    function animateCounter(element, start, end, duration) {
        let startTime = null;
        
        function animate(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current.toLocaleString('pt-BR') + ' pts';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    // Observar a seção de ranking para iniciar animação dos contadores
    const rankingSection = document.querySelector('.ranking-panel');
    if (rankingSection) {
        const rankingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animar contadores apenas uma vez
                    const scores = entry.target.querySelectorAll('.rank-score');
                    scores.forEach((score, index) => {
                        const targetValue = parseInt(score.textContent.replace(/[^\d]/g, ''));
                        setTimeout(() => {
                            animateCounter(score, 0, targetValue, 1500);
                        }, index * 100);
                    });
                    rankingObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        rankingObserver.observe(rankingSection);
    }

    // Efeito de digitação para o título principal
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Iniciar efeito de digitação no título principal após um delay
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 500);
    }

    // Efeito parallax suave no hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    });

    // Adicionar classe para indicar carregamento completo
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Mostrar smart banner se em mobile
        setTimeout(() => {
            showSmartBanner();
        }, 3000);
    });
});

// Funcionalidades do Modal de Download
function openDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Track modal open
    if (typeof gtag !== 'undefined') {
        gtag('event', 'modal_open', {
            'modal_type': 'download',
            'page_location': window.location.href
        });
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openDemoModal() {
    alert('🎬 Demo em breve! Por enquanto, baixe o app para experimentar todas as funcionalidades.');
    
    // Track demo interest
    if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_interest', {
            'page_location': window.location.href
        });
    }
}

// Fechar modal clicando fora
window.onclick = function(event) {
    const modal = document.getElementById('downloadModal');
    if (event.target === modal) {
        closeDownloadModal();
    }
}

// Detecção de dispositivo e Smart Banner
function detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    
    return 'desktop';
}

function showSmartBanner() {
    const device = detectDevice();
    
    if (device === 'desktop') return;
    
    // Não mostrar se já foi fechado hoje
    const bannerClosed = localStorage.getItem('smartBannerClosed');
    const today = new Date().toDateString();
    
    if (bannerClosed === today) return;
    
    createSmartBanner(device);
}

function createSmartBanner(device) {
    const banner = document.createElement('div');
    banner.className = 'smart-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <div class="app-info">
                <div class="app-icon">🚀</div>
                <div class="app-details">
                    <h4>Superação</h4>
                    <p>Supere seus limites com IA</p>
                </div>
            </div>
            <div class="banner-actions">
                <button class="install-btn" onclick="installApp('${device}')">
                    ${device === 'ios' ? 'Abrir' : 'Instalar'}
                </button>
                <button class="close-banner" onclick="closeBanner()">&times;</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Mostrar banner
    setTimeout(() => {
        banner.classList.add('show');
    }, 500);
}

function installApp(device) {
    const urls = {
        'android': 'https://play.google.com/store/apps/details?id=com.superacao.app',
        'ios': 'https://apps.apple.com/app/superacao/id123456789'
    };
    
    window.open(urls[device], '_blank');
    
    // Track installation attempt
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_install_attempt', {
            'platform': device,
            'source': 'smart_banner'
        });
    }
    
    closeBanner();
}

function closeBanner() {
    const banner = document.querySelector('.smart-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
        
        // Lembrar que foi fechado hoje
        localStorage.setItem('smartBannerClosed', new Date().toDateString());
    }
}

// PWA Installation System
let deferredPrompt;
let installButton;

// Inicializar PWA
function initializePWA() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registrado:', registration);
                })
                .catch((error) => {
                    console.error('❌ Falha no Service Worker:', error);
                });
        });
    }

    // Capturar evento de instalação PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🚀 PWA pode ser instalado');
        e.preventDefault();
        deferredPrompt = e;
        showInstallOption();
    });

    // Detectar se app foi instalado
    window.addEventListener('appinstalled', (e) => {
        console.log('✅ PWA instalado com sucesso');
        hideInstallOption();
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_installed', {
                'method': 'browser_prompt'
            });
        }
    });
}

// Mostrar opção de instalação
function showInstallOption() {
    // Criar botão de instalação se não existir
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.className = 'pwa-install-btn';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Instalar App</span>
        `;
        installButton.onclick = installPWA;
        
        // Adicionar ao header ou hero section
        const heroSection = document.querySelector('.hero-section .hero-content');
        if (heroSection) {
            heroSection.appendChild(installButton);
        }
    }
    
    // Mostrar botão
    if (installButton) {
        installButton.style.display = 'inline-flex';
        
        // Adicionar também ao modal de download
        updateDownloadModal();
    }
}

// Esconder opção de instalação
function hideInstallOption() {
    if (installButton) {
        installButton.style.display = 'none';
    }
}

// Instalar PWA
async function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`PWA instalação: ${outcome}`);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install_prompt', {
                'outcome': outcome
            });
        }
        
        deferredPrompt = null;
        hideInstallOption();
    } else {
        // Fallback: abrir app em nova aba
        window.open('/app/', '_blank');
    }
}

// Atualizar modal de download com opção PWA
function updateDownloadModal() {
    const downloadOptions = document.querySelector('.download-options');
    if (downloadOptions && deferredPrompt) {
        // Verificar se já tem botão PWA
        const existingPWA = downloadOptions.querySelector('.pwa-install-option');
        if (!existingPWA) {
            const pwaOption = document.createElement('div');
            pwaOption.className = 'download-option pwa-install-option';
            pwaOption.innerHTML = `
                <div class="platform-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="platform-info">
                    <h3>Instalar como App</h3>
                    <p>PWA - Funciona offline</p>
                    <span class="download-size">3MB</span>
                </div>
            `;
            pwaOption.onclick = installPWA;
            
            // Inserir como primeira opção
            downloadOptions.insertBefore(pwaOption, downloadOptions.firstChild);
        }
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', initializePWA);

// Função para tracking aprimorado
function trackDownload(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_download_click', {
            'platform': platform,
            'page_location': window.location.href,
            'timestamp': new Date().toISOString()
        });
    }
    
    // Facebook Pixel (se configurado)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'App Download',
            content_category: platform
        });
    }
}

// Função para tracking de acesso ao painel
function trackAccess(source) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'profile_access', {
            'source': source,
            'page_location': window.location.href,
            'timestamp': new Date().toISOString()
        });
    }
    
    // Facebook Pixel tracking
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AccessProfile', {
            content_name: 'Profile Access',
            source: source
        });
    }
    
    // Store access time for analytics
    try {
        const accessData = {
            timestamp: new Date().toISOString(),
            source: source,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        // Store in localStorage for later analysis
        const previousAccess = JSON.parse(localStorage.getItem('profile_access_history') || '[]');
        previousAccess.push(accessData);
        
        // Keep only last 10 accesses
        if (previousAccess.length > 10) {
            previousAccess.splice(0, previousAccess.length - 10);
        }
        
        localStorage.setItem('profile_access_history', JSON.stringify(previousAccess));
    } catch (error) {
        console.warn('Could not store access data:', error);
    }
    
    console.log(`Profile access tracked: ${source}`);
}

// Compartilhamento nativo (se suportado)
function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'Superação - App de Produtividade',
            text: 'Supere seus limites com este incrível app de produtividade com IA!',
            url: window.location.href
        });
    } else {
        // Fallback para cópia do link
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiado! Compartilhe com seus amigos 🚀');
    }
}

// Feedback do usuário
function collectFeedback() {
    const feedback = prompt('Como podemos melhorar? Deixe sua sugestão:');
    if (feedback) {
        // Aqui você enviaria o feedback para seu backend
        console.log('Feedback coletado:', feedback);
        alert('Obrigado pelo feedback! 🙏');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'feedback_submitted', {
                'feedback_length': feedback.length
            });
        }
    }
}

// ================================
// GOOGLE LOGIN INTEGRATION
// ================================

// Configuração do Google OAuth
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';

// Inicializar Google Sign-In
function initGoogleAuth() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true
        });
    }
}

// Login com Google
function loginWithGoogle() {
    // Track login attempt
    if (typeof gtag !== 'undefined') {
        gtag('event', 'login_attempt', {
            'method': 'google',
            'page_location': window.location.href
        });
    }

    // Verificar se Google SDK está carregado
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt();
    } else {
        // Fallback para simulação (desenvolvimento)
        simulateGoogleLogin();
    }
}

// Simular login Google (para desenvolvimento)
function simulateGoogleLogin() {
    const mockUser = {
        id: 'mock_' + Date.now(),
        name: 'Usuário Exemplo',
        email: 'usuario@exemplo.com',
        picture: '',
        given_name: 'Usuário',
        family_name: 'Exemplo'
    };
    
    handleSuccessfulLogin(mockUser);
}

// Callback do Google Sign-In
function handleGoogleSignIn(response) {
    try {
        // Decodificar JWT token
        const credential = parseJwt(response.credential);
        handleSuccessfulLogin(credential);
    } catch (error) {
        console.error('Erro ao processar login Google:', error);
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
    }
}

// Processar login bem-sucedido
function handleSuccessfulLogin(userData) {
    // Salvar dados do usuário
    const userSession = {
        id: userData.sub || userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture || '',
        given_name: userData.given_name || userData.name.split(' ')[0],
        family_name: userData.family_name || userData.name.split(' ').slice(1).join(' '),
        login_time: new Date().toISOString(),
        login_method: 'google'
    };
    
    // Salvar no localStorage
    localStorage.setItem('superacao_user_session', JSON.stringify(userSession));
    localStorage.setItem('superacao_user_type', 'student'); // Padrão é aluno
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'login_success', {
            'method': 'google',
            'user_id': userSession.id
        });
    }
    
    // Notification
    showNotification(`Bem-vindo, ${userSession.given_name}! 🎉`, 'success');
    
    // Redirecionar para o app
    setTimeout(() => {
        window.location.href = './app/?tab=profile&welcome=true';
    }, 1500);
}

// Decodificar JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        throw new Error('Token inválido');
    }
}

// ================================
// INSTALL MODAL & PWA
// ================================

let deferredInstallPrompt = null;

// Abrir modal de instalação
function openInstallModal() {
    const modal = document.getElementById('installModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        // Criar modal dinamicamente se não existir
        createInstallModal();
    }
    
    // Track modal open
    if (typeof gtag !== 'undefined') {
        gtag('event', 'install_modal_open', {
            'page_location': window.location.href
        });
    }
}

// Criar modal de instalação
function createInstallModal() {
    const modal = document.createElement('div');
    modal.id = 'installModal';
    modal.className = 'modal install-modal';
    modal.innerHTML = `
        <div class="modal-content install-content">
            <div class="modal-header">
                <h2>📱 Instalar Superação</h2>
                <button class="close-btn" onclick="closeInstallModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="install-options">
                    <div class="install-option pwa-install ${deferredInstallPrompt ? 'available' : 'unavailable'}">
                        <div class="option-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <div class="option-content">
                            <h3>Instalar como App</h3>
                            <p>Instale diretamente no seu dispositivo para acesso rápido</p>
                            <button class="btn-install-pwa" onclick="installPWA()" ${!deferredInstallPrompt ? 'disabled' : ''}>
                                <i class="fas fa-download"></i>
                                ${deferredInstallPrompt ? 'Instalar Agora' : 'Não Disponível'}
                            </button>
                        </div>
                    </div>
                    
                    <div class="install-option web-access">
                        <div class="option-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="option-content">
                            <h3>Usar no Navegador</h3>
                            <p>Acesse diretamente pelo navegador sem instalação</p>
                            <a href="./app/" class="btn-web-access" onclick="trackDownload('WebApp')">
                                <i class="fas fa-external-link-alt"></i>
                                Abrir App Web
                            </a>
                        </div>
                    </div>
                    
                    <div class="install-option manual-install">
                        <div class="option-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="option-content">
                            <h3>Instruções Manuais</h3>
                            <p>Como instalar manualmente em diferentes dispositivos</p>
                            <button class="btn-manual-guide" onclick="showManualInstallGuide()">
                                <i class="fas fa-book-open"></i>
                                Ver Guia
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// Fechar modal de instalação
function closeInstallModal() {
    const modal = document.getElementById('installModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Instalar PWA
function installPWA() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        
        deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ PWA instalado com sucesso');
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pwa_install_accepted');
                }
                showNotification('App instalado com sucesso! 🎉', 'success');
                closeInstallModal();
            } else {
                console.log('❌ Instalação PWA cancelada');
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pwa_install_dismissed');
                }
            }
            deferredInstallPrompt = null;
        });
    } else {
        showNotification('Instalação não disponível neste momento', 'warning');
    }
}

// Mostrar guia de instalação manual
function showManualInstallGuide() {
    const guideContent = `
        <div class="manual-guide">
            <h3>📱 Como Instalar Manualmente</h3>
            
            <div class="guide-section">
                <h4>🤖 Android (Chrome)</h4>
                <ol>
                    <li>Toque no menu (⋮) do navegador</li>
                    <li>Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
                    <li>Confirme a instalação</li>
                </ol>
            </div>
            
            <div class="guide-section">
                <h4>🍎 iOS (Safari)</h4>
                <ol>
                    <li>Toque no botão de compartilhar (📤)</li>
                    <li>Selecione "Adicionar à Tela de Início"</li>
                    <li>Toque em "Adicionar"</li>
                </ol>
            </div>
            
            <div class="guide-section">
                <h4>💻 Desktop (Chrome/Edge)</h4>
                <ol>
                    <li>Clique no ícone de instalação na barra de endereços</li>
                    <li>Ou use Ctrl+Shift+A (Chrome)</li>
                    <li>Confirme a instalação</li>
                </ol>
            </div>
        </div>
    `;
    
    // Substituir conteúdo do modal temporariamente
    const modalBody = document.querySelector('#installModal .modal-body');
    const originalContent = modalBody.innerHTML;
    
    modalBody.innerHTML = guideContent + `
        <div class="guide-actions">
            <button class="btn-back" onclick="restoreInstallModal('${originalContent.replace(/'/g, "\\'")}')">
                <i class="fas fa-arrow-left"></i> Voltar
            </button>
        </div>
    `;
}

// Restaurar conteúdo original do modal
function restoreInstallModal(originalContent) {
    const modalBody = document.querySelector('#installModal .modal-body');
    modalBody.innerHTML = originalContent.replace(/\\'/g, "'");
}

// Capturar evento de instalação PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('💾 PWA pode ser instalado');
    
    // Atualizar interface se o modal estiver aberto
    const pwaOption = document.querySelector('.pwa-install');
    const installBtn = document.querySelector('.btn-install-pwa');
    if (pwaOption && installBtn) {
        pwaOption.classList.remove('unavailable');
        pwaOption.classList.add('available');
        installBtn.disabled = false;
        installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar Agora';
    }
});

// ================================
// UTILITY FUNCTIONS & SESSION MANAGEMENT
// ================================

// Obter usuário atual
function getCurrentUser() {
    try {
        const userSession = localStorage.getItem('superacao_user_session');
        return userSession ? JSON.parse(userSession) : null;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}

// Logout do usuário
function logout() {
    localStorage.removeItem('superacao_user_session');
    localStorage.removeItem('superacao_user_type');
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'logout', {
            'method': 'manual'
        });
    }
    
    showNotification('Logout realizado com sucesso!', 'success');
    
    // Recarregar página para resetar estado
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Sistema de Notificações
function showNotification(message, type = 'success', duration = 3000) {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria a notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Adiciona ao corpo da página
    document.body.appendChild(notification);
    
    // Remove automaticamente após o tempo especificado
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Função para verificar compatibilidade do PWA
function checkPWACompatibility() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    return {
        canInstall: (isChrome || isEdge || isFirefox) && !isStandalone,
        isStandalone,
        isIOS,
        isAndroid,
        browser: isChrome ? 'Chrome' : isEdge ? 'Edge' : isFirefox ? 'Firefox' : 'Unknown'
    };
}

// Função para atualizar UI baseada no status de login
function updateUIForUser(user) {
    const loginButton = document.querySelector('.btn-login-header');
    if (loginButton && user) {
        loginButton.innerHTML = `
            <i class="fab fa-google"></i>
            <span>Olá, ${user.given_name || user.name.split(' ')[0]}</span>
        `;
        loginButton.onclick = () => {
            window.location.href = 'app/';
        };
        
        // Adicionar título com nome completo
        loginButton.title = `Logado como ${user.name} - Clique para acessar o painel`;
    }
}

// Aguarda o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar autenticação Google
    initGoogleAuth();
    
    // Configurar eventos dos botões
    const loginButton = document.querySelector('#loginButton, .btn-login-header');
    
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            const user = getCurrentUser();
            if (user) {
                // Se já está logado, ir para o painel
                window.location.href = 'app/';
            } else {
                // Se não está logado, fazer login
                loginWithGoogle();
            }
        });
    }
    
    // Verificar se já está logado
    const user = getCurrentUser();
    if (user) {
        console.log('Usuário já logado:', user.name);
        updateUIForUser(user);
    }
    
    // Configurar listener para PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        console.log('PWA pode ser instalado');
    });
    
    // Listener para quando o PWA for instalado
    window.addEventListener('appinstalled', () => {
        console.log('PWA foi instalado com sucesso');
        showNotification('App instalado com sucesso! Você pode encontrá-lo na sua tela inicial.', 'success', 5000);
        deferredInstallPrompt = null;
        
        // Fechar modal se estiver aberto
        const modal = document.querySelector('.install-modal');
        if (modal) {
            modal.remove();
        }
    });
    
    // Detectar se está rodando como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Rodando como PWA instalado');
    }
    
    // Inicializar outros sistemas
    initializePWA();
    
    // Mostrar smart banner em dispositivos móveis
    if (window.innerWidth <= 768) {
        setTimeout(showSmartBanner, 2000);
    }
});

// Fechar modal quando clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('installModal');
    if (modal && e.target === modal) {
        closeInstallModal();
    }
});

// ================================
// CARROSSEL REMOVIDO - INTERFACE SIMPLIFICADA
// ================================