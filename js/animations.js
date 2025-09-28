/**
 * Hayalimdeki Çanakkale - Kısa Film Yarışması
 * Animasyon JavaScript
 */

'use strict';

function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: false,
            mirror: true,
            offset: 100,
            delay: 0,
            anchorPlacement: 'top-bottom',
            disable: function() {
                return false;
            }
        });
        
        window.AppUtils?.debugLog('AOS başlatıldı');
    } else {
        console.warn('AOS kütüphanesi yüklenemedi');
    }
}

function refreshAOS() {
    if (typeof AOS !== 'undefined' && AOS.refresh) {
        AOS.refresh();
        window.AppUtils?.debugLog('AOS yenilendi');
    }
}

function animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        const formattedNumber = Math.floor(current).toLocaleString('tr-TR');
        element.textContent = formattedNumber + suffix;
    }, 16);
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-card div:first-child');
    
    if (counters.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                
                const text = entry.target.textContent.trim();
                const numberMatch = text.match(/[\d,.]+/);
                
                if (numberMatch) {
                    const number = parseFloat(numberMatch[0].replace(/[,\.]/g, ''));
                    const suffix = text.replace(numberMatch[0], '').trim();
                    
                    animateCounter(entry.target, number, 2000, suffix);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => observer.observe(counter));
    
    window.AppUtils?.debugLog('Counter animasyonları başlatıldı');
}

function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    
    if (!heroSection) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        window.AppUtils?.debugLog('Parallax devre dışı (reduced motion)');
        return;
    }
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const parallaxSpeed = 0.5;
                
                heroSection.style.backgroundPositionY = `${scrolled * parallaxSpeed}px`;
                
                ticking = false;
            });
            
            ticking = true;
        }
    }, { passive: true });
    
    window.AppUtils?.debugLog('Parallax efekti başlatıldı');
}

function initHoverTilt(selector = '.feature-card, .prize-card') {
    const cards = document.querySelectorAll(selector);
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
        
        card.style.transition = 'transform 0.3s ease';
    });
    
    window.AppUtils?.debugLog('Hover tilt efektleri başlatıldı');
}

function typeWriter(element, text, speed = 50) {
    let index = 0;
    element.textContent = '';
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function addRevealTextCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes revealWord {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

function initAnimations() {
    window.AppUtils?.debugLog('Animasyonlar başlatılıyor...');
    
    initAOS();
    initCounters();
    initParallax();
    initHoverTilt();
    addRevealTextCSS();
    
    window.AppUtils?.debugLog('Animasyonlar başlatıldı');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        refreshAOS();
    }
});

window.AnimationModule = {
    refreshAOS,
    animateCounter,
    typeWriter
};