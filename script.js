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
// CARROSSEL DE GRUPOS
// ================================

class GroupsCarousel {
    constructor() {
        this.currentIndex = 0;
        this.groupsPerPage = 3;
        this.groups = [];
        this.init();
    }

    init() {
        this.loadGroups();
        this.createCarousel();
        this.setupEventListeners();
        this.updateStats();
        this.startAutoSlide();
    }

    loadGroups() {
        // Dados mock dos grupos - em produção viriam de uma API
        this.groups = [
            {
                id: 'mat9a',
                name: 'Matemática 9º A',
                subject: 'Matemática',
                teacher: 'Prof. Silva',
                students: 28,
                activities: 12,
                completion: 85,
                icon: 'fas fa-calculator',
                color: '#4CAF50'
            },
            {
                id: 'fis1m',
                name: 'Física 1º Médio',
                subject: 'Física',
                teacher: 'Prof. Santos',
                students: 32,
                activities: 8,
                completion: 78,
                icon: 'fas fa-atom',
                color: '#2196F3'
            },
            {
                id: 'qui2m',
                name: 'Química 2º Médio',
                subject: 'Química',
                teacher: 'Prof. Costa',
                students: 25,
                activities: 15,
                completion: 92,
                icon: 'fas fa-flask',
                color: '#FF9800'
            },
            {
                id: 'bio3m',
                name: 'Biologia 3º Médio',
                subject: 'Biologia',
                teacher: 'Prof. Lima',
                students: 30,
                activities: 10,
                completion: 73,
                icon: 'fas fa-dna',
                color: '#8BC34A'
            },
            {
                id: 'hist8a',
                name: 'História 8º A',
                subject: 'História',
                teacher: 'Prof. Oliveira',
                students: 26,
                activities: 14,
                completion: 88,
                icon: 'fas fa-landmark',
                color: '#795548'
            },
            {
                id: 'port7b',
                name: 'Português 7º B',
                subject: 'Português',
                teacher: 'Prof. Ferreira',
                students: 29,
                activities: 11,
                completion: 81,
                icon: 'fas fa-book',
                color: '#E91E63'
            },
            {
                id: 'geo6c',
                name: 'Geografia 6º C',
                subject: 'Geografia',
                teacher: 'Prof. Almeida',
                students: 24,
                activities: 9,
                completion: 76,
                icon: 'fas fa-globe',
                color: '#00BCD4'
            },
            {
                id: 'ing9b',
                name: 'Inglês 9º B',
                subject: 'Inglês',
                teacher: 'Prof. Johnson',
                students: 27,
                activities: 13,
                completion: 89,
                icon: 'fas fa-language',
                color: '#673AB7'
            },
            {
                id: 'art8c',
                name: 'Artes 8º C',
                subject: 'Artes',
                teacher: 'Prof. Ribeiro',
                students: 22,
                activities: 7,
                completion: 94,
                icon: 'fas fa-palette',
                color: '#FF5722'
            },
            {
                id: 'edf7a',
                name: 'Ed. Física 7º A',
                subject: 'Ed. Física',
                teacher: 'Prof. Martins',
                students: 31,
                activities: 6,
                completion: 87,
                icon: 'fas fa-running',
                color: '#FFC107'
            },
            {
                id: 'fil1m',
                name: 'Filosofia 1º Médio',
                subject: 'Filosofia',
                teacher: 'Prof. Souza',
                students: 20,
                activities: 8,
                completion: 82,
                icon: 'fas fa-brain',
                color: '#9C27B0'
            },
            {
                id: 'soc2m',
                name: 'Sociologia 2º Médio',
                subject: 'Sociologia',
                teacher: 'Prof. Pereira',
                students: 23,
                activities: 9,
                completion: 79,
                icon: 'fas fa-users',
                color: '#607D8B'
            }
        ];
    }

    createCarousel() {
        const track = document.getElementById('carouselTrack');
        const indicators = document.getElementById('carouselIndicators');
        
        if (!track || !indicators) return;

        // Criar cards dos grupos
        track.innerHTML = this.groups.map(group => `
            <div class="group-card" onclick="joinGroup('${group.id}')">
                <div class="group-header">
                    <div class="group-icon" style="background: linear-gradient(135deg, ${group.color}, ${this.darkenColor(group.color)})">
                        <i class="${group.icon}"></i>
                    </div>
                    <div class="group-info">
                        <h4>${group.name}</h4>
                        <p>${group.teacher}</p>
                    </div>
                    <div class="group-subject" style="background: ${group.color}">
                        ${group.subject}
                    </div>
                </div>
                <div class="group-stats">
                    <div class="group-stat">
                        <span class="number">${group.students}</span>
                        <span class="label">Alunos</span>
                    </div>
                    <div class="group-stat">
                        <span class="number">${group.activities}</span>
                        <span class="label">Atividades</span>
                    </div>
                    <div class="group-stat">
                        <span class="number">${group.completion}%</span>
                        <span class="label">Conclusão</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Criar indicadores
        const totalPages = Math.ceil(this.groups.length / this.groupsPerPage);
        indicators.innerHTML = Array.from({length: totalPages}, (_, i) => 
            `<div class="indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const indicators = document.querySelectorAll('.indicator');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch/swipe support
        let startX = 0;
        let endX = 0;
        
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            track.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) { // Minimum swipe distance
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            });
        }
    }

    prevSlide() {
        const totalPages = Math.ceil(this.groups.length / this.groupsPerPage);
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : totalPages - 1;
        this.updateCarousel();
    }

    nextSlide() {
        const totalPages = Math.ceil(this.groups.length / this.groupsPerPage);
        this.currentIndex = this.currentIndex < totalPages - 1 ? this.currentIndex + 1 : 0;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const track = document.getElementById('carouselTrack');
        const indicators = document.querySelectorAll('.indicator');
        
        if (track) {
            const cardWidth = 296; // 280px + 16px gap
            const offset = this.currentIndex * (cardWidth * this.groupsPerPage);
            track.style.transform = `translateX(-${offset}px)`;
        }

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    updateStats() {
        const totalGroups = this.groups.length;
        const totalStudents = this.groups.reduce((sum, group) => sum + group.students, 0);
        const totalActivities = this.groups.reduce((sum, group) => sum + group.activities, 0);

        // Animar números
        this.animateNumber('totalGroups', totalGroups);
        this.animateNumber('totalStudents', totalStudents);
        this.animateNumber('totalActivities', totalActivities);
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let currentValue = 0;
        const increment = targetValue / 30; // 30 frames de animação
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue);
            }
        }, 50);
    }

    startAutoSlide() {
        setInterval(() => {
            this.nextSlide();
        }, 5000); // Muda a cada 5 segundos
    }

    darkenColor(color) {
        // Função simples para escurecer uma cor hex
        const num = parseInt(color.slice(1), 16);
        const r = Math.max(0, (num >> 16) - 30);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - 30);
        const b = Math.max(0, (num & 0x0000FF) - 30);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
}

// Função global para entrar no grupo
function joinGroup(groupId) {
    // Redirecionar para a página de login com o código do grupo
    const group = groupsCarousel.groups.find(g => g.id === groupId);
    if (group) {
        // Simular código do grupo baseado no ID
        const groupCode = groupId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
        
        // Tracking do clique no grupo
        if (typeof gtag !== 'undefined') {
            gtag('event', 'group_card_click', {
                'group_id': groupId,
                'group_name': group.name,
                'group_subject': group.subject
            });
        }
        
        // Redirecionar para login com parâmetros
        window.location.href = `./app/login.html?join=${groupCode}&group=${encodeURIComponent(group.name)}`;
    }
}

// Inicializar carrossel quando o DOM estiver pronto
let groupsCarousel;
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        groupsCarousel = new GroupsCarousel();
    }, 100);
});