/**
 * Perfect UI Interactions
 * Advanced UI components and interactions for Nepal Adventures
 */

class PerfectUI {
    constructor() {
        this.initializeUI();
        this.setupInteractions();
        this.setupAnimations();
        this.setupResponsive();
    }

    initializeUI() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupComponents();
            });
        } else {
            this.setupComponents();
        }
    }

    setupComponents() {
        this.setupNavigation();
        this.setupCountrySelector();
        this.setupAdventureTabs();
        this.setupScrollEffects();
        this.setupLoadingStates();
        this.setupMicroInteractions();
    }

    setupNavigation() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Navbar scroll effects
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavbar = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });

        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navLinks2 = document.querySelector('.nav-links');

        if (hamburger && navLinks2) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks2.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }
    }

    setupCountrySelector() {
        const dropdown = document.getElementById('countryDropdown');
        const selected = document.getElementById('dropdownSelected');
        const options = document.getElementById('dropdownOptions');
        const searchInput = document.getElementById('countrySearch');

        if (!dropdown || !selected || !options) return;

        // Toggle dropdown
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');

            if (dropdown.classList.contains('open')) {
                searchInput?.focus();
                this.trackEvent('country_selector_opened');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const countryOptions = options.querySelectorAll('.dropdown-option');

                countryOptions.forEach(option => {
                    const countryName = option.querySelector('.option-name').textContent.toLowerCase();
                    const description = option.querySelector('.option-description').textContent.toLowerCase();

                    if (countryName.includes(searchTerm) || description.includes(searchTerm)) {
                        option.style.display = 'flex';
                    } else {
                        option.style.display = 'none';
                    }
                });
            });
        }

        // Country selection
        const countryOptions = options.querySelectorAll('.dropdown-option');
        countryOptions.forEach(option => {
            option.addEventListener('click', () => {
                const flag = option.querySelector('.option-flag').textContent;
                const name = option.querySelector('.option-name').textContent;
                const description = option.querySelector('.option-description').textContent;
                const isAvailable = option.classList.contains('available');

                if (!isAvailable) {
                    this.showNotification('info', 'Coming Soon', `${name} will be available soon!`);
                    return;
                }

                // Update selected display
                const selectedFlag = selected.querySelector('.selected-flag');
                const selectedName = selected.querySelector('.selected-name');
                const selectedDescription = selected.querySelector('.selected-description');

                selectedFlag.textContent = flag;
                selectedName.textContent = name;
                selectedDescription.textContent = description;

                // Close dropdown
                dropdown.classList.remove('open');

                // Track selection
                this.trackEvent('country_selected', { country: name });

                // Show success message
                this.showNotification('success', 'Country Selected', `Great choice! ${name} offers amazing adventures.`);

                // Update adventures based on selection
                this.updateAdventuresByCountry(name.toLowerCase());
            });
        });
    }

    setupAdventureTabs() {
        const tabs = document.querySelectorAll('.region-tab');
        const groups = document.querySelectorAll('.adventure-group');

        if (!tabs.length || !groups.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetRegion = tab.getAttribute('data-region');

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active group with animation
                groups.forEach(group => {
                    group.classList.remove('active');
                });

                // Delay to allow fade out - faster transition
                setTimeout(() => {
                    const targetGroup = document.querySelector(`[data-region="${targetRegion}"]`);
                    if (targetGroup) {
                        targetGroup.classList.add('active');
                    }
                }, 100);

                // Track tab change
                this.trackEvent('adventure_tab_changed', { region: targetRegion });
            });
        });
    }

    setupScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');

                    // Stagger animations for child elements - faster
                    const children = entry.target.querySelectorAll('.adventure-card, .stat, .feature-card');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 50);
                    });
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.hero-stats, .adventure-grid, .features-grid, .steps');
        animateElements.forEach(el => observer.observe(el));

        // Parallax effect for hero background
        let parallaxTicking = false;
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero');

            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }

            parallaxTicking = false;
        };

        const requestParallaxTick = () => {
            if (!parallaxTicking) {
                requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        };

        window.addEventListener('scroll', requestParallaxTick, { passive: true });
    }

    setupLoadingStates() {
        // Add loading states to buttons
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-adventure');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.classList.contains('loading')) return;

                // Add loading state
                button.classList.add('loading');
                const originalText = button.innerHTML;

                // Create loading content
                button.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <span>Loading...</span>
                    </div>
                `;

                // Simulate loading - faster response
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.innerHTML = originalText;
                }, 800);
            });
        });
    }

    setupMicroInteractions() {
        // Ripple effect for clickable elements
        const addRippleEffect = (element) => {
            element.addEventListener('click', (e) => {
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                    z-index: 1000;
                `;

                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 400);
            });
        };

        // Add ripple to buttons and cards
        const rippleElements = document.querySelectorAll('.btn-primary, .btn-secondary, .adventure-card, .region-tab');
        rippleElements.forEach(addRippleEffect);

        // Hover effects for cards
        const cards = document.querySelectorAll('.adventure-card, .feature-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // Magnetic effect for buttons
        const magneticButtons = document.querySelectorAll('.btn-large, .btn-adventure');
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    setupAnimations() {
        // Add CSS for ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            .animate-in {
                animation: fadeInUp 0.4s ease-out forwards;
            }

            .loading {
                pointer-events: none;
                opacity: 0.8;
            }

            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupResponsive() {
        // Handle responsive changes
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Close dropdowns on resize
        const dropdowns = document.querySelectorAll('.custom-dropdown.open');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
        });

        // Update parallax calculations
        this.updateParallax();
    }

    updateAdventuresByCountry(country) {
        // Update adventure content based on selected country
        const adventureCards = document.querySelectorAll('.adventure-card');

        adventureCards.forEach(card => {
            const countries = card.querySelector('.adventure-countries');
            if (countries) {
                const countryText = countries.textContent.toLowerCase();
                if (countryText.includes(country)) {
                    card.style.display = 'block';
                    card.classList.add('highlight');
                    setTimeout(() => {
                        card.classList.remove('highlight');
                    }, 1000);
                } else {
                    card.style.opacity = '0.6';
                }
            }
        });
    }

    showNotification(type, title, message, duration = 5000) {
        // Use the global error handler for notifications
        if (window.errorHandler) {
            window.errorHandler.showNotification(type, title, message, duration);
        }
    }

    trackEvent(eventName, data = {}) {
        // Use the global SEO performance manager for tracking
        if (window.seoPerformanceManager) {
            window.seoPerformanceManager.trackEvent(eventName, data);
        }
    }

    // Public API methods
    openCountrySelector() {
        const dropdown = document.getElementById('countryDropdown');
        if (dropdown) {
            dropdown.classList.add('open');
        }
    }

    selectCountry(countryName) {
        const option = document.querySelector(`[data-country="${countryName.toLowerCase()}"]`);
        if (option) {
            option.click();
        }
    }

    switchAdventureTab(region) {
        const tab = document.querySelector(`[data-region="${region}"]`);
        if (tab) {
            tab.click();
        }
    }
}

// Initialize Perfect UI
window.addEventListener('DOMContentLoaded', () => {
    window.perfectUI = new PerfectUI();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerfectUI;
}