// Advanced Loading System for Nepal Adventures
class LoadingSystem {
    constructor() {
        this.isPageLoading = true;
        this.loadingProgress = 0;
        this.criticalResources = [];
        this.init();
    }

    init() {
        this.createLoadingScreen();
        this.trackResourceLoading();
        this.initializeProgressiveLoading();
    }

    createLoadingScreen() {
        // Create beautiful loading screen
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'nepal-loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-container">
                <div class="loading-logo">
                    <div class="mountain-peaks">
                        <div class="peak peak-1"></div>
                        <div class="peak peak-2"></div>
                        <div class="peak peak-3"></div>
                    </div>
                    <div class="logo-text">Nepal Adventures</div>
                </div>

                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">Loading amazing experiences...</div>
                    <div class="progress-percentage">0%</div>
                </div>

                <div class="loading-tips">
                    <div class="tip active">🏔️ Discovering hidden mountain trails...</div>
                    <div class="tip">🎒 Preparing your adventure gear...</div>
                    <div class="tip">🗺️ Connecting with expert guides...</div>
                    <div class="tip">✨ Creating unforgettable memories...</div>
                </div>
            </div>
        `;

        // Add loading screen styles
        const loadingStyles = `
            #nepal-loading-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg,
                    rgba(44, 85, 48, 0.95) 0%,
                    rgba(74, 124, 89, 0.9) 50%,
                    rgba(30, 58, 32, 0.95) 100%),
                    url('https://images.unsplash.com/photo-1544735716-392fe2489ffa') center/cover no-repeat;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(5px);
                transition: opacity 0.5s ease, visibility 0.5s ease;
            }

            .loading-container {
                text-align: center;
                color: white;
                max-width: 500px;
                padding: 2rem;
            }

            .loading-logo {
                margin-bottom: 3rem;
                animation: logoFloat 3s ease-in-out infinite;
            }

            @keyframes logoFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }

            .mountain-peaks {
                display: flex;
                justify-content: center;
                align-items: flex-end;
                margin-bottom: 1rem;
                height: 60px;
            }

            .peak {
                background: white;
                margin: 0 2px;
                border-radius: 2px 2px 0 0;
                animation: peakGrow 2s ease-in-out infinite;
            }

            .peak-1 {
                width: 8px;
                height: 40px;
                animation-delay: 0s;
            }

            .peak-2 {
                width: 12px;
                height: 60px;
                animation-delay: 0.3s;
            }

            .peak-3 {
                width: 10px;
                height: 45px;
                animation-delay: 0.6s;
            }

            @keyframes peakGrow {
                0%, 100% { transform: scaleY(1); opacity: 0.8; }
                50% { transform: scaleY(1.2); opacity: 1; }
            }

            .logo-text {
                font-size: 2rem;
                font-weight: 700;
                text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
                margin-bottom: 0.5rem;
            }

            .loading-progress {
                margin-bottom: 3rem;
            }

            .progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 1rem;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #d4af37, #fff, #d4af37);
                background-size: 200% 100%;
                animation: progressShine 2s ease-in-out infinite;
                border-radius: 3px;
                width: 0%;
                transition: width 0.3s ease;
            }

            @keyframes progressShine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .progress-text {
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
                opacity: 0.9;
            }

            .progress-percentage {
                font-size: 1.5rem;
                font-weight: 600;
                color: #d4af37;
            }

            .loading-tips {
                position: relative;
                height: 30px;
                overflow: hidden;
            }

            .tip {
                position: absolute;
                width: 100%;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.5s ease;
                font-size: 1rem;
            }

            .tip.active {
                opacity: 1;
                transform: translateY(0);
            }

            .hidden {
                opacity: 0 !important;
                visibility: hidden !important;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .loading-container {
                    padding: 1rem;
                }

                .logo-text {
                    font-size: 1.5rem;
                }

                .mountain-peaks {
                    height: 40px;
                }

                .peak-1 { height: 25px; }
                .peak-2 { height: 40px; }
                .peak-3 { height: 30px; }
            }
        `;

        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = loadingStyles;
        document.head.appendChild(styleSheet);

        // Add to DOM
        document.body.appendChild(loadingScreen);

        // Start tip rotation
        this.startTipRotation();
    }

    startTipRotation() {
        const tips = document.querySelectorAll('.tip');
        let currentTip = 0;

        setInterval(() => {
            tips[currentTip].classList.remove('active');
            currentTip = (currentTip + 1) % tips.length;
            tips[currentTip].classList.add('active');
        }, 2000);
    }

    updateProgress(progress, message) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressPercentage = document.querySelector('.progress-percentage');

        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText && message) progressText.textContent = message;
        if (progressPercentage) progressPercentage.textContent = Math.round(progress) + '%';

        this.loadingProgress = progress;
    }

    trackResourceLoading() {
        let loadedResources = 0;
        let totalResources = 0;

        // Track images
        const images = document.querySelectorAll('img');
        totalResources += images.length;

        images.forEach(img => {
            if (img.complete) {
                loadedResources++;
            } else {
                img.addEventListener('load', () => {
                    loadedResources++;
                    this.updateResourceProgress(loadedResources, totalResources);
                });
            }
        });

        // Track stylesheets
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        totalResources += stylesheets.length;

        stylesheets.forEach(link => {
            link.addEventListener('load', () => {
                loadedResources++;
                this.updateResourceProgress(loadedResources, totalResources);
            });
        });

        // Track scripts
        const scripts = document.querySelectorAll('script[src]');
        totalResources += scripts.length;

        scripts.forEach(script => {
            script.addEventListener('load', () => {
                loadedResources++;
                this.updateResourceProgress(loadedResources, totalResources);
            });
        });

        // Initial progress update
        this.updateResourceProgress(loadedResources, totalResources);
    }

    updateResourceProgress(loaded, total) {
        if (total === 0) return;

        const progress = (loaded / total) * 80; // Reserve 20% for DOM ready
        this.updateProgress(progress, `Loading resources... (${loaded}/${total})`);

        if (loaded === total) {
            this.handleResourcesLoaded();
        }
    }

    handleResourcesLoaded() {
        this.updateProgress(90, 'Finalizing your experience...');

        // Wait for DOM to be fully ready
        if (document.readyState === 'complete') {
            this.finishLoading();
        } else {
            window.addEventListener('load', () => {
                this.finishLoading();
            });
        }
    }

    finishLoading() {
        this.updateProgress(100, 'Welcome to Nepal Adventures!');

        setTimeout(() => {
            this.hideLoadingScreen();
        }, 100); // Much faster hide
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('nepal-loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
                this.isPageLoading = false;
                this.triggerPageLoadedEvent();
            }, 500);
        }
    }

    triggerPageLoadedEvent() {
        // Trigger custom event for page fully loaded
        const event = new CustomEvent('nepalPageLoaded', {
            detail: { loadingTime: performance.now() }
        });
        document.dispatchEvent(event);

        // Start revealing page content with animations
        this.revealPageContent();
    }

    revealPageContent() {
        // Add reveal animations to main content
        const mainContent = document.querySelector('main') || document.body;
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        mainContent.style.transition = 'all 0.8s ease';

        requestAnimationFrame(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        });

        // Staggered reveal for key elements
        const elements = document.querySelectorAll('.hero-section, .adventures-grid, .stats-overview');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';

            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + (index * 150));
        });
    }

    initializeProgressiveLoading() {
        // Much faster loading - skip artificial delays
        setTimeout(() => {
            this.updateProgress(100, 'Ready!');
            this.finishLoading();
        }, 200); // Very quick load
    }

    // Public methods for external use
    static show() {
        if (window.nepalLoadingSystem) {
            const loadingScreen = document.getElementById('nepal-loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
            }
        }
    }

    static hide() {
        if (window.nepalLoadingSystem) {
            window.nepalLoadingSystem.hideLoadingScreen();
        }
    }

    static updateProgress(progress, message) {
        if (window.nepalLoadingSystem) {
            window.nepalLoadingSystem.updateProgress(progress, message);
        }
    }
}

// Initialize loading system immediately
if (document.readyState === 'loading') {
    window.nepalLoadingSystem = new LoadingSystem();
} else {
    // Page already loaded, no need for loading screen
    console.log('Page already loaded, skipping loading screen');
}

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Nepal Adventures loaded in ${Math.round(loadTime)}ms`);

    // Optional: Send performance data to analytics
    if (window.gtag) {
        gtag('event', 'page_load_time', {
            custom_map: { 'load_time': loadTime }
        });
    }
});

// Error handling for failed resources
window.addEventListener('error', (e) => {
    console.warn('Failed to load resource:', e.target);
    // Continue loading even if some resources fail
});

// Export for use in other modules
window.NepalLoadingSystem = LoadingSystem;