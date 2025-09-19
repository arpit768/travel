// Main JavaScript for Nepal Adventures

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const body = document.body;

// Create mobile navigation
function createMobileNav() {
    // Create mobile nav overlay
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = `
        <a href="#home">Home</a>
        <a href="#adventures">Adventures</a>
        <a href="#guides">Guides & Porters</a>
        <a href="#gear">Gear Rental</a>
        <a href="#about">About</a>
        <a href="pages/login.html">Login</a>
        <a href="pages/register.html">Register</a>
    `;
    body.appendChild(mobileNav);

    return mobileNav;
}

// Mobile Navigation Toggle
let mobileNav;

if (hamburger) {
    mobileNav = createMobileNav();

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        body.classList.toggle('nav-open');
    });

    // Close mobile nav when clicking on links
    mobileNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            body.classList.remove('nav-open');
        }
    });
}

// Country Selection
function selectCountry() {
    const countrySelect = document.getElementById('countrySelect');
    const selectedCountry = countrySelect.value;

    if (selectedCountry === 'nepal' || selectedCountry === 'india') {
        // Redirect to user-facing explore page
        window.location.href = `pages/explore.html?country=${selectedCountry}`;
    } else {
        alert('This country is coming soon! Currently available: Nepal and India.');
    }
}

// Adventure Card Click Handler
document.querySelectorAll('.adventure-card').forEach(card => {
    card.addEventListener('click', function() {
        const adventureType = this.getAttribute('data-type');
        window.location.href = `pages/adventures.html?type=${adventureType}`;
    });
});

// Smooth Scrolling for Navigation Links
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

// Enhanced Navigation on Scroll
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for styling
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Hide navbar on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
});

// Enhanced Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in class to all sections and cards
    document.querySelectorAll('section, .adventure-card, .step').forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });
});

// Loading states for buttons
function addLoadingState(button, text = 'Loading...') {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = `<span class="loading-spinner"></span> ${text}`;

    return () => {
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Enhanced country selection system
let selectedCountryData = {
    country: 'nepal',
    flag: '🇳🇵',
    name: 'Nepal'
};

// Country data
const countryData = {
    nepal: { flag: '🇳🇵', name: 'Nepal', available: true, type: 'Mountain Adventures' },
    india: { flag: '🇮🇳', name: 'India', available: true, type: 'Mountain Adventures' },
    bhutan: { flag: '🇧🇹', name: 'Bhutan', available: false, type: 'Mountain Adventures' },
    pakistan: { flag: '🇵🇰', name: 'Pakistan', available: false, type: 'Mountain Adventures' },
    japan: { flag: '🇯🇵', name: 'Japan', available: false, type: 'Cultural Journeys' },
    'south-korea': { flag: '🇰🇷', name: 'South Korea', available: false, type: 'Cultural Journeys' },
    china: { flag: '🇨🇳', name: 'China', available: false, type: 'Cultural Journeys' },
    mongolia: { flag: '🇲🇳', name: 'Mongolia', available: false, type: 'Cultural Journeys' },
    thailand: { flag: '🇹🇭', name: 'Thailand', available: false, type: 'Tropical Paradise' },
    vietnam: { flag: '🇻🇳', name: 'Vietnam', available: false, type: 'Tropical Paradise' },
    indonesia: { flag: '🇮🇩', name: 'Indonesia', available: false, type: 'Tropical Paradise' },
    philippines: { flag: '🇵🇭', name: 'Philippines', available: false, type: 'Tropical Paradise' },
    uae: { flag: '🇦🇪', name: 'UAE', available: false, type: 'Desert & Heritage' },
    'saudi-arabia': { flag: '🇸🇦', name: 'Saudi Arabia', available: false, type: 'Desert & Heritage' },
    iran: { flag: '🇮🇷', name: 'Iran', available: false, type: 'Desert & Heritage' },
    israel: { flag: '🇮🇱', name: 'Israel', available: false, type: 'Desert & Heritage' }
};

// Initialize country selection and region tabs
document.addEventListener('DOMContentLoaded', () => {
    initializeCountryDropdown();
    initializeRegionTabs();
});

function initializeCountryDropdown() {
    const dropdown = document.getElementById('countryDropdown');
    const dropdownSelected = document.getElementById('dropdownSelected');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const searchInput = document.getElementById('countrySearch');
    const allOptions = document.querySelectorAll('.dropdown-option');

    // Toggle dropdown
    dropdownSelected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');

        if (dropdown.classList.contains('active')) {
            searchInput.focus();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Handle option selection
    allOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();

            const country = this.getAttribute('data-country');
            const flag = this.getAttribute('data-flag');
            const type = this.getAttribute('data-type');
            const name = this.querySelector('.option-name').textContent;
            const isAvailable = this.classList.contains('available');

            if (isAvailable) {
                selectCountryFromDropdown(country, flag, name, type);
                dropdown.classList.remove('active');
            } else {
                showNotification(`${name} adventures coming soon! Currently available: Nepal and India.`, 'info');
                dropdown.classList.remove('active');
            }
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();

        allOptions.forEach(option => {
            const countryName = option.querySelector('.option-name').textContent.toLowerCase();
            const description = option.querySelector('.option-description').textContent.toLowerCase();

            if (countryName.includes(searchTerm) || description.includes(searchTerm) || searchTerm === '') {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });
    });

    // Clear search when dropdown closes
    dropdown.addEventListener('click', (e) => {
        if (!dropdown.classList.contains('active')) {
            searchInput.value = '';
            // Reset all options visibility
            allOptions.forEach(option => option.style.display = 'flex');
        }
    });
}

function selectCountryFromDropdown(country, flag, name) {
    const description = getCountryDescription(country);

    // Update selected display
    document.querySelector('.selected-flag').textContent = flag;
    document.querySelector('.selected-name').textContent = name;
    document.querySelector('.selected-description').textContent = description;

    // Update selected country data
    selectedCountryData = {
        country: country,
        flag: flag,
        name: name,
        description: description
    };

    // Update hero title
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        heroTitle.textContent = `Discover the Magic of ${name}`;
    }

    // Animation effect
    const selectedDisplay = document.querySelector('.selected-country-display');
    selectedDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => {
        selectedDisplay.style.transform = 'scale(1)';
    }, 200);

    showNotification(`${name} selected! Ready to explore amazing adventures.`, 'success');
}

function getCountryDescription(country) {
    const descriptions = {
        'nepal': 'Home of Mount Everest & Himalayas',
        'india': 'Incredible diversity & rich culture',
        'bhutan': 'Land of Thunder Dragon',
        'china': 'Great Wall & ancient wonders',
        'indonesia': '17,000 tropical islands',
        'iran': 'Ancient Persian heritage',
        'israel': 'Holy Land heritage sites',
        'japan': 'Land of Rising Sun',
        'mongolia': 'Nomadic steppes adventure',
        'pakistan': 'K2 & Karakoram mountains',
        'philippines': '7,641 island paradise',
        'saudi-arabia': 'Arabian desert heritage',
        'south-korea': 'K-Culture & modern cities',
        'thailand': 'Beautiful beaches & temples',
        'uae': 'Modern desert oasis',
        'vietnam': 'Ha Long Bay & rich history'
    };
    return descriptions[country] || 'Amazing adventures await';
}

function selectCountry(country, data) {
    // Update selected country data
    selectedCountryData = {
        country: country,
        flag: data.flag,
        name: data.name
    };

    // Update UI
    document.querySelectorAll('.country-option').forEach(option => {
        option.classList.remove('active');
    });

    document.querySelector(`[data-country="${country}"]`).classList.add('active');

    // Update selected country display
    document.querySelector('.selected-flag').textContent = data.flag;
    document.querySelector('.selected-name').textContent = data.name;

    // Update hero title if needed
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        heroTitle.textContent = `Discover the Magic of ${data.name}`;
    }

    // Smooth animation
    const countryDisplay = document.querySelector('.country-display');
    countryDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
        countryDisplay.style.transform = 'scale(1)';
    }, 200);

    showNotification(`${data.name} selected! Ready to start your adventure.`, 'success');
}

// Start adventure function
window.startAdventure = function() {
    const button = document.querySelector('.selected-country-info .btn-primary');

    // All Asian countries are now supported with individual interfaces
    const countryRoutes = {
        'nepal': 'pages/explore.html?country=nepal',
        'india': 'pages/explore.html?country=india',
        'china': 'pages/explore.html?country=china',
        'japan': 'pages/explore.html?country=japan',
        'south-korea': 'pages/explore.html?country=south-korea',
        'thailand': 'pages/explore.html?country=thailand',
        'vietnam': 'pages/explore.html?country=vietnam',
        'indonesia': 'pages/explore.html?country=indonesia',
        'philippines': 'pages/explore.html?country=philippines',
        'bhutan': 'pages/explore.html?country=bhutan',
        'pakistan': 'pages/explore.html?country=pakistan',
        'mongolia': 'pages/explore.html?country=mongolia',
        'uae': 'pages/explore.html?country=uae',
        'saudi-arabia': 'pages/explore.html?country=saudi-arabia',
        'iran': 'pages/explore.html?country=iran',
        'israel': 'pages/explore.html?country=israel'
    };

    const route = countryRoutes[selectedCountryData.country];

    if (route) {
        const removeLoading = addLoadingState(button, 'Starting Adventure...');

        setTimeout(() => {
            window.location.href = route;
        }, 1000);

        showNotification(`Launching ${selectedCountryData.name} adventures interface...`, 'success');
    } else {
        showNotification('Country interface is being prepared. Please try again soon.', 'info');
    }
};

// Legacy function for compatibility
window.selectCountry = window.startAdventure;

// Region tabs functionality
function initializeRegionTabs() {
    const regionTabs = document.querySelectorAll('.region-tab');
    const adventureGroups = document.querySelectorAll('.adventure-group');

    regionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const region = this.getAttribute('data-region');

            // Update active tab
            regionTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active adventure group
            adventureGroups.forEach(group => {
                group.classList.remove('active');
                if (group.getAttribute('data-region') === region) {
                    group.classList.add('active');
                }
            });

            // Update title
            const regionNames = {
                'mountains': 'Mountain Adventures',
                'cultural': 'Cultural Journeys',
                'tropical': 'Tropical Paradise',
                'desert': 'Desert & Heritage'
            };

            const title = document.getElementById('adventures-title');
            if (title) {
                title.textContent = `${regionNames[region]} in Asia`;
            }

            // Smooth scroll animation for cards
            const activeCards = document.querySelectorAll('.adventure-group.active .adventure-card');
            activeCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    });
}

// Custom notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.innerHTML = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--white);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-heavy);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        }
        .notification.show {
            transform: translateX(0);
        }
        .notification-content {
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .notification-info { border-left: 4px solid var(--primary-color); }
        .notification-success { border-left: 4px solid var(--success-color); }
        .notification-warning { border-left: 4px solid var(--warning-color); }
        .notification-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.5;
        }
        .notification-close:hover {
            opacity: 1;
        }
    `;

    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Prevent body scroll when mobile nav is open
const originalStyle = window.getComputedStyle(body).overflow;

const preventBodyScroll = () => {
    body.style.overflow = 'hidden';
};

const allowBodyScroll = () => {
    body.style.overflow = originalStyle;
};

// Add to mobile nav toggle
if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
        if (mobileNav.classList.contains('active')) {
            preventBodyScroll();
        } else {
            allowBodyScroll();
        }
    });
}