// Enhanced Animations and Interactions for Nepal Adventures
class NepalAdventuresEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupNavbarEffects();
        this.setupParallaxEffects();
        this.setupInteractiveElements();
        this.setupLoadingAnimations();
        this.setupPerformanceOptimizations();
        this.setupAccessibilityFeatures();
    }

    // Smooth scroll animations triggered on viewport entry
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');

                    // Add staggered animation delays for child elements
                    const children = entry.target.querySelectorAll('.scroll-reveal');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('revealed');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe all elements that should animate on scroll
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });

        // Auto-add scroll reveal to common elements
        this.autoAddScrollReveal();
    }

    autoAddScrollReveal() {
        const selectors = [
            '.adventure-card',
            '.guide-card',
            '.stat-card',
            '.region-card',
            '.feature-item',
            '.testimonial-card'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                if (!el.classList.contains('scroll-reveal')) {
                    el.classList.add('scroll-reveal', `delay-${Math.min(index % 4 + 1, 4)}`);
                }
            });
        });
    }

    // Enhanced navbar with scroll effects
    setupNavbarEffects() {
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelectorAll('.nav-links a');

        if (!navbar) return;

        let lastScrollY = window.scrollY;
        let isScrollingDown = false;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            isScrollingDown = currentScrollY > lastScrollY;
            lastScrollY = currentScrollY;

            // Add/remove scrolled class
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled', 'nav-enhanced');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll direction
            if (currentScrollY > 500) {
                if (isScrollingDown) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        });

        // Enhanced nav links with better hover effects
        navLinks.forEach(link => {
            link.classList.add('nav-link-enhanced');

            link.addEventListener('mouseenter', () => {
                this.createRippleEffect(link, event);
            });
        });
    }

    // Parallax effects for hero sections
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax-element');

        if (parallaxElements.length === 0) {
            // Auto-add parallax to background elements
            document.querySelectorAll('.hero-section, .country-hero').forEach(el => {
                el.classList.add('parallax-element');
            });
        }

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;

            document.querySelectorAll('.parallax-element').forEach(el => {
                const speed = el.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Interactive hover effects and animations
    setupInteractiveElements() {
        // Enhanced buttons
        document.querySelectorAll('button, .btn').forEach(btn => {
            if (!btn.classList.contains('btn-enhanced')) {
                btn.classList.add('btn-enhanced');
            }

            btn.addEventListener('click', (e) => {
                this.createRippleEffect(btn, e);
            });
        });

        // Enhanced cards
        document.querySelectorAll('.card, .adventure-card, .guide-card').forEach(card => {
            if (!card.classList.contains('card-enhanced')) {
                card.classList.add('card-enhanced');
            }

            card.addEventListener('mouseenter', () => {
                this.addFloatingIcon(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeFloatingIcon(card);
            });
        });

        // Tooltip system
        this.setupTooltips();

        // Floating action button
        this.createFloatingActionButton();
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        // Remove existing ripples
        element.querySelectorAll('.ripple').forEach(r => r.remove());

        element.appendChild(ripple);

        // Add CSS for ripple effect
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => ripple.remove(), 600);
    }

    addFloatingIcon(card) {
        const icon = document.createElement('div');
        icon.className = 'floating-icon';
        icon.innerHTML = '✨';
        icon.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 1.5rem;
            animation: float 2s ease-in-out infinite;
            pointer-events: none;
            z-index: 10;
        `;
        card.style.position = 'relative';
        card.appendChild(icon);
    }

    removeFloatingIcon(card) {
        const icon = card.querySelector('.floating-icon');
        if (icon) {
            icon.remove();
        }
    }

    setupTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.classList.add('tooltip-enhanced');
        });

        // Auto-add tooltips to common elements
        const tooltipElements = [
            { selector: '.difficulty-indicator', text: 'Difficulty Level' },
            { selector: '.rating-stars', text: 'User Rating' },
            { selector: '.price-tag', text: 'Price Information' },
            { selector: '.guide-badge', text: 'Certified Guide' }
        ];

        tooltipElements.forEach(({ selector, text }) => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.hasAttribute('data-tooltip')) {
                    el.setAttribute('data-tooltip', text);
                    el.classList.add('tooltip-enhanced');
                }
            });
        });
    }

    createFloatingActionButton() {
        const fab = document.createElement('button');
        fab.className = 'fab-enhanced';
        fab.innerHTML = '💬';
        fab.setAttribute('aria-label', 'Chat Support');
        fab.setAttribute('data-tooltip', 'Need Help? Chat with us!');

        fab.addEventListener('click', () => {
            this.showChatModal();
        });

        document.body.appendChild(fab);
    }

    showChatModal() {
        // Simple chat modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 400px;
            width: 90%;
            animation: scaleIn 0.3s ease-out;
        `;

        modal.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: #2c5530; margin-bottom: 1rem;">Need Help?</h3>
                <p style="margin-bottom: 1.5rem; color: #666;">
                    We're here to help you plan your perfect Himalayan adventure!
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="window.open('mailto:info@nepaladventures.com')"
                            style="padding: 0.8rem 1.5rem; background: #2c5530; color: white; border: none; border-radius: 10px; cursor: pointer;">
                        📧 Email Us
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            style="padding: 0.8rem 1.5rem; background: #ccc; color: #333; border: none; border-radius: 10px; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            animation: fadeIn 0.3s ease-out;
        `;

        backdrop.addEventListener('click', () => {
            backdrop.remove();
            modal.remove();
        });

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
    }

    // Loading animations for dynamic content
    setupLoadingAnimations() {
        // Enhanced loading spinner
        const originalSpinners = document.querySelectorAll('.loading');
        originalSpinners.forEach(spinner => {
            if (!spinner.classList.contains('loading-spinner-enhanced')) {
                spinner.innerHTML = '<div class="loading-spinner-enhanced"></div>';
            }
        });

        // Progress bars for forms and uploads
        this.setupProgressBars();
    }

    setupProgressBars() {
        document.querySelectorAll('.progress').forEach(progress => {
            progress.classList.add('progress-enhanced');

            // Animate progress on load
            const value = progress.dataset.value || 0;
            progress.style.setProperty('--progress', value + '%');
        });
    }

    // Performance optimizations
    setupPerformanceOptimizations() {
        // Throttle scroll events
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Scroll handling code here
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Lazy load images
        this.setupLazyLoading();

        // Preload critical resources
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    preloadCriticalResources() {
        const criticalImages = [
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = src;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }

    // Accessibility enhancements
    setupAccessibilityFeatures() {
        // Focus management
        this.setupFocusManagement();

        // Keyboard navigation
        this.setupKeyboardNavigation();

        // Screen reader enhancements
        this.setupScreenReaderEnhancements();

        // Reduced motion support
        this.setupReducedMotionSupport();
    }

    setupFocusManagement() {
        // Visual focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add CSS for keyboard navigation
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 3px solid #2c5530 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px rgba(44, 85, 48, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupKeyboardNavigation() {
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal, .dropdown-open').forEach(el => {
                    el.remove();
                });
            }
        });

        // Arrow key navigation for cards
        this.setupArrowKeyNavigation();
    }

    setupArrowKeyNavigation() {
        const cardContainers = document.querySelectorAll('.adventures-grid, .guides-grid');

        cardContainers.forEach(container => {
            const cards = container.querySelectorAll('.adventure-card, .guide-card');
            let currentIndex = 0;

            container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    currentIndex = Math.min(currentIndex + 1, cards.length - 1);
                    cards[currentIndex].focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    currentIndex = Math.max(currentIndex - 1, 0);
                    cards[currentIndex].focus();
                }
            });
        });
    }

    setupScreenReaderEnhancements() {
        // Add ARIA labels to interactive elements
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            const text = btn.textContent.trim();
            if (text) {
                btn.setAttribute('aria-label', text);
            }
        });

        // Live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(liveRegion);

        // Announce dynamic content changes
        window.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
        };
    }

    setupReducedMotionSupport() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Utility methods
    static addCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nepalAdventuresEnhancer = new NepalAdventuresEnhancer();
});

// Additional utility functions for other scripts
window.NepalAdventuresUtils = {
    animateCounter: (element, target, duration = 2000) => {
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    },

    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#2c5530'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};