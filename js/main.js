/**
 * Hayalimdeki Çanakkale - Kısa Film Yarışması
 * Ana JavaScript Dosyası
 */

'use strict';

const APP = {
    name: 'Hayalimdeki Çanakkale',
    version: '1.0.0',
    debug: true
};

function debugLog(message, data = null) {
    if (APP.debug) {
        console.log(`[${APP.name}] ${message}`, data || '');
    }
}

function smoothScrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    const regex = /^(\+90|0)?5\d{9}$/;
    return regex.test(cleanPhone);
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        debugLog(`LocalStorage'a kaydedildi: ${key}`);
    } catch (error) {
        console.error('LocalStorage hatası:', error);
    }
}

function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('LocalStorage okuma hatası:', error);
        return null;
    }
}

function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollTopBtn';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.setAttribute('aria-label', 'Yukarı çık');
    document.body.appendChild(scrollBtn);
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        }, 100);
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    debugLog('Scroll to top butonu başlatıldı');
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                history.pushState(null, null, href);
            }
        });
    });
    
    debugLog('Smooth scroll başlatıldı');
}

function hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.remove();
        }, 500);
        debugLog('Loading overlay gizlendi');
    }
}

function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    debugLog('Aktif navigation highlight yapıldı');
}

function initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (link.hostname !== window.location.hostname) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    debugLog('External linkler yapılandırıldı');
}

function enhanceKeyboardAccessibility() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                modal.classList.remove('active');
            }
            
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
    
    debugLog('Klavye erişilebilirliği geliştirildi');
}

function initPage() {
    debugLog('Sayfa başlatılıyor...');
    
    initScrollToTop();
    initSmoothScroll();
    highlightActiveNav();
    initExternalLinks();
    enhanceKeyboardAccessibility();
    
    setTimeout(hideLoadingOverlay, 500);
    
    debugLog('Sayfa başlatma tamamlandı');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

window.addEventListener('load', () => {
    debugLog('Tüm kaynaklar yüklendi');
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        debugLog('Sayfa gizlendi');
    } else {
        debugLog('Sayfa görünür oldu');
    }
});

window.AppUtils = {
    debugLog,
    smoothScrollTo,
    isElementInViewport,
    sleep,
    isValidEmail,
    isValidPhone,
    saveToStorage,
    loadFromStorage
};