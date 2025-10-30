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
// CARROSSEL REMOVIDO - INTERFACE SIMPLIFICADA
// ================================