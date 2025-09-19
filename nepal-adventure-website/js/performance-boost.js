/**
 * Performance Boost JavaScript
 * Optimized animations and faster UI interactions
 */

class PerformanceBoost {
    constructor() {
        this.animationFrameId = null;
        this.intersectionObserver = null;
        this.resizeObserver = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Performance settings
        this.settings = {
            animationDuration: this.isReducedMotion ? 0 : 150,
            fastDuration: this.isReducedMotion ? 0 : 100,
            ultraFastDuration: this.isReducedMotion ? 0 : 80,
            staggerDelay: this.isReducedMotion ? 0 : 30,
            debounceDelay: 16, // 60fps
            throttleDelay: 16
        };

        this.init();
    }

    init() {
        this.setupFastScrollReveal();
        this.setupOptimizedHovers();
        this.setupFastRippleEffects();
        this.setupQuickInteractions();
        this.setupPerformanceOptimizations();
        this.setupLazyLoading();
        this.monitorPerformance();
    }

    /**
     * Setup ultra-fast scroll reveal animations
     */
    setupFastScrollReveal() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target, index);
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all reveal elements
        document.querySelectorAll('[data-reveal]').forEach(el => {
            this.intersectionObserver.observe(el);
        });

        // Auto-detect elements that should be animated
        document.querySelectorAll('.adventure-card, .feature-card, .stat, .guide-card').forEach((el, index) => {
            el.dataset.reveal = 'true';
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `all ${this.settings.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            this.intersectionObserver.observe(el);
        });
    }

    /**
     * Animate element with staggered timing
     */
    animateElement(element, index = 0) {
        const delay = index * this.settings.staggerDelay;

        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('revealed');
        }, delay);
    }

    /**
     * Setup optimized hover effects
     */
    setupOptimizedHovers() {
        const hoverElements = document.querySelectorAll('.btn, .adventure-card, .feature-card, .guide-card');

        hoverElements.forEach(element => {
            // Add GPU acceleration
            element.style.transform = 'translateZ(0)';
            element.style.backfaceVisibility = 'hidden';
            element.style.willChange = 'transform';

            // Ultra-fast hover
            element.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    element.style.transition = `transform ${this.settings.ultraFastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

                    if (element.classList.contains('btn')) {
                        element.style.transform = 'translateY(-2px) translateZ(0)';
                    } else {
                        element.style.transform = 'translateY(-4px) translateZ(0)';
                    }
                }
            }, { passive: true });

            element.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    element.style.transition = `transform ${this.settings.fastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                    element.style.transform = 'translateY(0) translateZ(0)';
                }
            }, { passive: true });

            // Active state
            element.addEventListener('mousedown', () => {
                if (!this.isReducedMotion) {
                    element.style.transition = `transform 50ms cubic-bezier(0.4, 0, 0.2, 1)`;
                    element.style.transform = 'scale(0.98) translateZ(0)';
                }
            }, { passive: true });

            element.addEventListener('mouseup', () => {
                if (!this.isReducedMotion) {
                    element.style.transition = `transform ${this.settings.ultraFastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                    element.style.transform = 'scale(1) translateZ(0)';
                }
            }, { passive: true });
        });
    }

    /**
     * Setup fast ripple effects
     */
    setupFastRippleEffects() {
        const rippleElements = document.querySelectorAll('.btn, .region-tab, .adventure-card');

        rippleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                if (this.isReducedMotion) return;

                const ripple = this.createFastRipple(e, element);
                element.appendChild(ripple);

                // Remove ripple faster
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.remove();
                    }
                }, 300);
            }, { passive: true });
        });
    }

    /**
     * Create fast ripple effect
     */
    createFastRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0) translateZ(0);
            animation: fastRipple 300ms ease-out;
            z-index: 1000;
        `;

        // Ensure element has relative positioning
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';

        return ripple;
    }

    /**
     * Setup quick interactions
     */
    setupQuickInteractions() {
        // Fast dropdown toggle
        document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
            const dropdown = document.querySelector(trigger.dataset.dropdownTrigger);
            if (dropdown) {
                trigger.addEventListener('click', () => {
                    this.toggleDropdownFast(dropdown);
                });
            }
        });

        // Fast tab switching
        document.querySelectorAll('.region-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTabFast(tab);
            });
        });

        // Fast modal handling
        document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modalTrigger;
                this.openModalFast(modalId);
            });
        });
    }

    /**
     * Fast dropdown toggle
     */
    toggleDropdownFast(dropdown) {
        const isOpen = dropdown.classList.contains('open');

        if (isOpen) {
            dropdown.style.transition = `all ${this.settings.ultraFastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            dropdown.classList.remove('open');
        } else {
            dropdown.style.transition = `all ${this.settings.fastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            dropdown.classList.add('open');
        }
    }

    /**
     * Fast tab switching
     */
    switchTabFast(activeTab) {
        const targetRegion = activeTab.dataset.region;
        const allTabs = document.querySelectorAll('.region-tab');
        const allGroups = document.querySelectorAll('.adventure-group');

        // Update active tab instantly
        allTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.style.transition = `all ${this.settings.ultraFastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        });
        activeTab.classList.add('active');

        // Switch groups with minimal delay
        allGroups.forEach(group => {
            group.style.transition = `all ${this.settings.fastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            group.classList.remove('active');
        });

        setTimeout(() => {
            const targetGroup = document.querySelector(`[data-region="${targetRegion}"]`);
            if (targetGroup) {
                targetGroup.classList.add('active');
            }
        }, 50);
    }

    /**
     * Fast modal opening
     */
    openModalFast(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.transition = `all ${this.settings.fastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            modal.classList.add('show');
            document.body.classList.add('modal-open');

            // Focus management
            const firstInput = modal.querySelector('input, button, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), this.settings.fastDuration);
            }
        }
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Debounced scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }

            scrollTimeout = requestAnimationFrame(() => {
                this.handleScroll();
            });
        }, { passive: true });

        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, this.settings.debounceDelay);
        }, { passive: true });

        // Optimize images
        this.optimizeImages();

        // Preload critical resources
        this.preloadCriticalResources();
    }

    /**
     * Handle optimized scroll
     */
    handleScroll() {
        const scrollY = window.pageYOffset;
        const navbar = document.querySelector('.navbar');

        if (navbar) {
            navbar.style.transition = `all ${this.settings.ultraFastDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    /**
     * Handle optimized resize
     */
    handleResize() {
        // Close any open dropdowns
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });

        // Recalculate layouts if needed
        if (window.perfectUI) {
            window.perfectUI.updateParallax?.();
        }
    }

    /**
     * Setup lazy loading
     */
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImageFast(img);
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Load image with fast transition
     */
    loadImageFast(img) {
        img.style.transition = `opacity ${this.settings.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        img.style.opacity = '0';

        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = img.dataset.src;
            img.style.opacity = '1';
            img.dataset.loaded = 'true';
        };
        tempImg.src = img.dataset.src;
    }

    /**
     * Optimize images
     */
    optimizeImages() {
        document.querySelectorAll('img').forEach(img => {
            // Add loading transition
            img.style.transition = `opacity ${this.settings.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

            if (!img.complete) {
                img.style.opacity = '0';
                img.onload = () => {
                    img.style.opacity = '1';
                };
            }
        });
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        // Preload critical images
        const criticalImages = [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src + '?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            document.head.appendChild(link);
        });
    }

    /**
     * Monitor performance
     */
    monitorPerformance() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            // Monitor largest contentful paint
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log(`LCP: ${entry.startTime}ms`);
                    }
                });
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor first input delay
            const fidObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    console.log(`FID: ${entry.processingStart - entry.startTime}ms`);
                });
            });

            fidObserver.observe({ entryTypes: ['first-input'] });
        }
    }

    /**
     * Add performance boost classes dynamically
     */
    addPerformanceClasses() {
        // Add GPU acceleration to key elements
        document.querySelectorAll('.navbar, .hero, .adventure-card, .btn').forEach(el => {
            el.classList.add('gpu-boost');
        });

        // Add quick hover to interactive elements
        document.querySelectorAll('.btn, .adventure-card, .feature-card').forEach(el => {
            el.classList.add('quick-hover');
        });

        // Add fast loading to buttons
        document.querySelectorAll('.btn').forEach(el => {
            el.classList.add('fast-loading');
        });
    }

    /**
     * Cleanup method
     */
    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// Initialize performance boost when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceBoost = new PerformanceBoost();

    // Add performance classes
    window.performanceBoost.addPerformanceClasses();

    // Performance debugging (remove in production)
    if (window.location.search.includes('debug=performance')) {
        const perfOverlay = document.createElement('div');
        perfOverlay.className = 'perf-overlay show';
        perfOverlay.innerHTML = 'Performance Monitor Active';
        document.body.appendChild(perfOverlay);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.performanceBoost) {
        window.performanceBoost.cleanup();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceBoost;
}