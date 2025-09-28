/**
 * Hayalimdeki Çanakkale - Kısa Film Yarışması
 * Navigation JavaScript
 */

'use strict';

const NavigationState = {
    mobileMenuOpen: false,
    isScrolled: false,
    lastScrollPosition: 0
};

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (!mobileMenu || !mobileMenuBtn) {
        console.error('Mobile menu elementleri bulunamadı');
        return;
    }
    
    NavigationState.mobileMenuOpen = !NavigationState.mobileMenuOpen;
    
    if (NavigationState.mobileMenuOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            mobileMenu.style.opacity = '1';
        }, 10);
        
        window.AppUtils?.debugLog('Mobile menü açıldı');
    } else {
        mobileMenu.style.opacity = '0';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        document.body.style.overflow = '';
        
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
        
        window.AppUtils?.debugLog('Mobile menü kapatıldı');
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (NavigationState.mobileMenuOpen && mobileMenu) {
        NavigationState.mobileMenuOpen = false;
        mobileMenu.style.opacity = '0';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
        
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
    }
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    if (!navbar) return;
    
    const threshold = 50;
    
    if (scrollPosition > threshold && !NavigationState.isScrolled) {
        navbar.classList.add('scrolled');
        NavigationState.isScrolled = true;
    } else if (scrollPosition <= threshold && NavigationState.isScrolled) {
        navbar.classList.remove('scrolled');
        NavigationState.isScrolled = false;
    }
    
    NavigationState.lastScrollPosition = scrollPosition;
}

function trapFocusInMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    
    const focusableElements = mobileMenu.querySelectorAll(
        'a[href], button, textarea, input, select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || !NavigationState.mobileMenuOpen) return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

function initNavigation() {
    window.AppUtils?.debugLog('Navigation başlatılıyor...');
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(closeMobileMenu, 100);
        });
    });
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(() => {
            handleNavbarScroll();
        });
    }, { passive: true });
    
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (NavigationState.mobileMenuOpen && 
            mobileMenu && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth >= 768 && NavigationState.mobileMenuOpen) {
                closeMobileMenu();
            }
        }, 200);
    });
    
    trapFocusInMobileMenu();
    
    window.AppUtils?.debugLog('Navigation başlatma tamamlandı');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

window.NavigationModule = {
    toggleMobileMenu,
    closeMobileMenu,
    state: NavigationState
};