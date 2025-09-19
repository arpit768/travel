// Enhanced Dashboard Management System with Country-Specific Animations
class DashboardManager {
    constructor() {
        // Get country from URL parameter or default to nepal
        const urlParams = new URLSearchParams(window.location.search);
        this.currentCountry = urlParams.get('country') || 'nepal';
        this.currentSection = 'overview';
        this.data = {
            adventures: [],
            guides: [],
            porters: [],
            bookings: []
        };
        this.animationQueue = [];
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupCountrySelector();
        this.initializeCountryFromURL();
        this.setupCountryTheming();
        this.loadInitialData();
        this.startFloatingAnimations();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.switchSection(section);
            });
        });

        // Add buttons
        const addAdventureBtn = document.getElementById('addAdventureBtn');
        if (addAdventureBtn) {
            addAdventureBtn.addEventListener('click', () => this.showAddAdventureModal());
        }

        const addGuideBtn = document.getElementById('addGuideBtn');
        if (addGuideBtn) {
            addGuideBtn.addEventListener('click', () => this.showAddGuideModal());
        }

        const addPorterBtn = document.getElementById('addPorterBtn');
        if (addPorterBtn) {
            addPorterBtn.addEventListener('click', () => this.showAddPorterModal());
        }

        // Filters
        const bookingStatusFilter = document.getElementById('bookingStatusFilter');
        if (bookingStatusFilter) {
            bookingStatusFilter.addEventListener('change', () => this.filterBookings());
        }

        const bookingDateFilter = document.getElementById('bookingDateFilter');
        if (bookingDateFilter) {
            bookingDateFilter.addEventListener('change', () => this.filterBookings());
        }

        // Export button
        const exportBookingsBtn = document.getElementById('exportBookingsBtn');
        if (exportBookingsBtn) {
            exportBookingsBtn.addEventListener('click', () => this.exportBookings());
        }

        // Analytics time range
        const analyticsTimeRange = document.getElementById('analyticsTimeRange');
        if (analyticsTimeRange) {
            analyticsTimeRange.addEventListener('change', () => this.updateAnalytics());
        }
    }

    setupCountrySelector() {
        const currentCountry = document.querySelector('.current-country');
        const dropdown = document.getElementById('countryDropdown');

        currentCountry.addEventListener('click', () => {
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.country-selector-header')) {
                dropdown.classList.remove('show');
            }
        });

        document.querySelectorAll('.country-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const country = e.currentTarget.dataset.country;
                const flag = e.currentTarget.dataset.flag;
                const name = e.currentTarget.querySelector('.country-info .name').textContent;
                const status = e.currentTarget.querySelector('.status').textContent;

                if (status === 'Coming Soon') {
                    this.showNotification(`${name} dashboard is coming soon! Stay tuned for more adventures.`, 'info');
                    return;
                }

                // Check if we're on the main dashboard page or a country-specific page
                const isMainDashboard = window.location.pathname.includes('dashboard.html') && !window.location.pathname.includes('dashboard-');

                if (isMainDashboard) {
                    // Redirect to country-specific dashboard page
                    this.redirectToCountryDashboard(country, name);
                } else {
                    // We're already on a country-specific page, just switch theme
                    this.switchCountry(country, flag, name);
                }

                dropdown.classList.remove('show');
            });
        });
    }

    setupNavigation() {
        // Set initial active states
        this.updateNavigation('overview');
    }

    switchSection(section) {
        this.currentSection = section;

        // Update navigation
        this.updateNavigation(section);

        // Load section content
        this.loadSectionContent(section);
    }

    updateNavigation(activeSection) {
        // Remove all active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Add active state to current section
        const activeNavItem = document.querySelector(`[data-section="${activeSection}"]`).closest('.nav-item');
        activeNavItem.classList.add('active');

        const activeContent = document.getElementById(activeSection);
        activeContent.classList.add('active');
    }

    initializeCountryFromURL() {
        // Set the UI based on current country
        const countryData = this.getCountryData(this.currentCountry);

        if (countryData) {
            // Update UI elements
            document.getElementById('currentFlag').textContent = countryData.flag;
            document.getElementById('currentCountry').textContent = countryData.name;

            // Update active state in dropdown
            document.querySelectorAll('.country-option').forEach(option => {
                option.classList.remove('active');
            });
            const activeOption = document.querySelector(`[data-country="${this.currentCountry}"]`);
            if (activeOption) {
                activeOption.classList.add('active');
            }

            // Update URL without page reload
            const url = new URL(window.location);
            url.searchParams.set('country', this.currentCountry);
            window.history.replaceState(null, '', url);

            console.log(`Dashboard initialized for ${countryData.name}`);

            // Show welcome notification
            setTimeout(() => {
                this.showNotification(`Welcome to ${countryData.name} Dashboard! 🎉`);
            }, 1000);
        }
    }

    getCountryData(countryCode) {
        const countries = {
            'nepal': {
                name: 'Nepal',
                flag: '🇳🇵',
                primary: '#DC143C',
                secondary: '#FFA500',
                accent: '#228B22',
                bg: 'linear-gradient(135deg, #DC143C 0%, #FFA500 100%)',
                cardShadow: '0 10px 30px rgba(220, 20, 60, 0.3)',
                culture: 'himalayan',
                greeting: 'Namaste! Welcome to Nepal Adventures'
            },
            'india': {
                name: 'India',
                flag: '🇮🇳',
                primary: '#FF9933',
                secondary: '#138808',
                accent: '#000080',
                bg: 'linear-gradient(135deg, #FF9933 0%, #138808 50%, #000080 100%)',
                cardShadow: '0 10px 30px rgba(255, 153, 51, 0.3)',
                culture: 'diverse',
                greeting: 'Namaste! Incredible India Awaits'
            },
            'bhutan': {
                name: 'Bhutan',
                flag: '🇧🇹',
                primary: '#FFD700',
                secondary: '#FF4500',
                accent: '#800080',
                bg: 'linear-gradient(135deg, #FFD700 0%, #FF4500 100%)',
                cardShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
                culture: 'thunder_dragon',
                greeting: 'Kuzuzangpo! Land of the Thunder Dragon'
            },
            'tibet': {
                name: 'Tibet',
                flag: '🏔️',
                primary: '#800000',
                secondary: '#FFD700',
                accent: '#4169E1',
                bg: 'linear-gradient(135deg, #800000 0%, #FFD700 100%)',
                cardShadow: '0 10px 30px rgba(128, 0, 0, 0.3)',
                culture: 'roof_of_world',
                greeting: 'Tashi Delek! Roof of the World Adventures'
            }
        };
        return countries[countryCode] || countries.nepal;
    }

    redirectToCountryDashboard(country, name) {
        // Create smooth transition effect before redirect
        document.body.classList.add('country-transition');

        const countryData = this.getCountryData(country);
        this.showNotification(`Redirecting to ${name} Adventures...`, 'info');

        // Create enhanced loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'country-switch-overlay';
        overlay.style.background = countryData.bg;

        overlay.innerHTML = `
            <div class="country-switch-content">
                <div class="country-switch-flag">${countryData.flag}</div>
                <div class="country-switch-title">Welcome to ${name}</div>
                <div class="country-switch-subtitle">${countryData.greeting}</div>
                <div class="loading-spinner"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate overlay in with enhanced effect
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 100);

        // Add particle effects for celebration
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createCountryParticle(countryData);
            }, i * 100);
        }

        // Determine redirect URL based on country
        const redirectUrls = {
            'nepal': 'dashboard.html?country=nepal',
            'india': 'dashboard-india.html',
            'bhutan': 'dashboard-bhutan.html',
            'tibet': 'dashboard-tibet.html'
        };

        // Redirect after animation
        setTimeout(() => {
            window.location.href = redirectUrls[country] || 'dashboard.html?country=nepal';
        }, 2000);
    }

    createCountryParticle(countryData) {
        const particle = document.createElement('div');
        particle.textContent = countryData.flag;
        particle.style.cssText = `
            position: fixed;
            font-size: 1.5rem;
            pointer-events: none;
            z-index: 10001;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight + 50}px;
            animation: particleFloat 3s ease-out forwards;
            opacity: 0.8;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                to {
                    transform: translateY(-${window.innerHeight + 200}px) translateX(${(Math.random() - 0.5) * 300}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
            style.remove();
        }, 3000);
    }

    switchCountry(country, flag, name) {
        this.currentCountry = country;
        const countryData = this.getCountryData(country);

        // Add transition animation to entire dashboard
        document.body.classList.add('country-transition');

        // Update theming with smooth transition
        this.updateCountryTheming(countryData);

        // Update UI with enhanced animations
        this.animateCountrySwitch(flag, name, countryData);

        // Update active state in dropdown
        document.querySelectorAll('.country-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-country="${country}"]`).classList.add('active');

        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('country', country);
        window.history.replaceState(null, '', url);

        // Reload data for new country with staggered animations
        setTimeout(() => {
            this.loadInitialData();
            document.body.classList.remove('country-transition');
        }, 500);

        // Show themed notification
        this.showNotification(countryData.greeting, 'success');

        // Trigger celebration animation
        this.triggerCelebrationAnimation();
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadAdventures(),
                this.loadGuides(),
                this.loadPorters(),
                this.loadBookings()
            ]);

            this.updateOverviewStats();
            this.loadRecentBookings();
            this.loadPopularAdventures();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    async loadAdventures() {
        try {
            const response = await API.adventures.getAll({ country: this.currentCountry });
            this.data.adventures = response.data || [];
            return this.data.adventures;
        } catch (error) {
            console.error('Error loading adventures:', error);
            this.data.adventures = [];
            return [];
        }
    }

    async loadGuides() {
        try {
            const response = await API.guides.getAll({ country: this.currentCountry });
            this.data.guides = response.data || [];
            return this.data.guides;
        } catch (error) {
            console.error('Error loading guides:', error);
            this.data.guides = [];
            return [];
        }
    }

    async loadPorters() {
        try {
            const response = await API.porters.getAll({ country: this.currentCountry });
            this.data.porters = response.data || [];
            return this.data.porters;
        } catch (error) {
            console.error('Error loading porters:', error);
            this.data.porters = [];
            return [];
        }
    }

    async loadBookings() {
        try {
            const response = await API.bookings.getAll({ country: this.currentCountry });
            this.data.bookings = response.data || [];
            return this.data.bookings;
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.data.bookings = [];
            return [];
        }
    }

    updateOverviewStats() {
        // Update stat cards
        document.getElementById('totalAdventures').textContent = this.data.adventures.length;
        document.getElementById('totalGuides').textContent = this.data.guides.length;
        document.getElementById('totalBookings').textContent = this.data.bookings.length;

        // Calculate total revenue
        const totalRevenue = this.data.bookings.reduce((sum, booking) => {
            return sum + (booking.totalAmount || 0);
        }, 0);
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
    }

    loadRecentBookings() {
        const container = document.getElementById('recentBookingsList');
        const recentBookings = this.data.bookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recentBookings.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent bookings found</p>';
            return;
        }

        container.innerHTML = recentBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-info">
                    <h5>${booking.adventure?.title || 'Unknown Adventure'}</h5>
                    <p>${booking.customer?.fullName || 'Unknown Customer'}</p>
                    <small>${new Date(booking.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="booking-status">
                    <span class="status-badge ${booking.status}">${booking.status}</span>
                    <span class="booking-amount">$${booking.totalAmount || 0}</span>
                </div>
            </div>
        `).join('');
    }

    loadPopularAdventures() {
        const container = document.getElementById('popularAdventuresList');
        const popularAdventures = this.data.adventures
            .sort((a, b) => (b.bookings?.length || 0) - (a.bookings?.length || 0))
            .slice(0, 5);

        if (popularAdventures.length === 0) {
            container.innerHTML = '<p class="text-muted">No adventures found</p>';
            return;
        }

        container.innerHTML = popularAdventures.map(adventure => `
            <div class="adventure-item">
                <div class="adventure-info">
                    <h5>${adventure.title}</h5>
                    <p>${adventure.location?.region || 'Unknown Region'}</p>
                    <small>${adventure.type}</small>
                </div>
                <div class="adventure-stats">
                    <span class="booking-count">${adventure.bookings?.length || 0} bookings</span>
                    <span class="adventure-price">$${adventure.pricing?.basePrice || 0}</span>
                </div>
            </div>
        `).join('');
    }

    loadSectionContent(section) {
        switch (section) {
            case 'adventures':
                this.loadAdventuresSection();
                break;
            case 'guides-porters':
                this.loadGuidesPortersSection();
                break;
            case 'bookings':
                this.loadBookingsSection();
                break;
            case 'analytics':
                this.loadAnalyticsSection();
                break;
        }
    }

    loadAdventuresSection() {
        const container = document.getElementById('adventuresContent');

        container.innerHTML = `
            <div class="adventures-filters">
                <div class="filter-group">
                    <select id="adventureTypeFilter">
                        <option value="">All Types</option>
                        <option value="trekking">Trekking</option>
                        <option value="climbing">Climbing</option>
                        <option value="cultural">Cultural</option>
                        <option value="wildlife">Wildlife</option>
                    </select>
                    <select id="adventureRegionFilter">
                        <option value="">All Regions</option>
                        <option value="everest">Everest</option>
                        <option value="annapurna">Annapurna</option>
                        <option value="langtang">Langtang</option>
                    </select>
                    <button class="btn-secondary" id="resetAdventureFilters">Reset Filters</button>
                </div>
            </div>

            <div class="adventures-grid">
                ${this.data.adventures.map(adventure => `
                    <div class="adventure-card">
                        <div class="adventure-image">
                            <img src="${adventure.images?.[0] || '/images/default-adventure.jpg'}" alt="${adventure.title}">
                            <span class="adventure-type-badge">${adventure.type}</span>
                        </div>
                        <div class="adventure-details">
                            <h3>${adventure.title}</h3>
                            <p class="adventure-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${adventure.location?.region || 'Unknown Region'}
                            </p>
                            <p class="adventure-description">${adventure.shortDescription || adventure.description?.substring(0, 120) + '...'}</p>
                            <div class="adventure-meta">
                                <span class="duration">
                                    <i class="fas fa-clock"></i>
                                    ${adventure.duration?.days || 0} days
                                </span>
                                <span class="difficulty">
                                    <i class="fas fa-mountain"></i>
                                    ${adventure.difficulty || 'Moderate'}
                                </span>
                                <span class="price">
                                    <i class="fas fa-dollar-sign"></i>
                                    $${adventure.pricing?.basePrice || 0}
                                </span>
                            </div>
                            <div class="adventure-actions">
                                <button class="action-btn view" onclick="dashboard.viewAdventure('${adventure._id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="action-btn edit" onclick="dashboard.editAdventure('${adventure._id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-btn delete" onclick="dashboard.deleteAdventure('${adventure._id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadGuidesPortersSection() {
        const container = document.getElementById('guidesPortersContent');

        container.innerHTML = `
            <div class="guides-porters-tabs">
                <button class="tab-btn active" data-tab="guides">Guides (${this.data.guides.length})</button>
                <button class="tab-btn" data-tab="porters">Porters (${this.data.porters.length})</button>
            </div>

            <div class="tab-content">
                <div id="guidesTab" class="tab-panel active">
                    <div class="guides-grid">
                        ${this.data.guides.map(guide => `
                            <div class="guide-card">
                                <div class="guide-header">
                                    <div class="guide-avatar">
                                        <img src="${guide.user?.avatar || '/images/default-avatar.png'}" alt="${guide.user?.fullName}">
                                    </div>
                                    <div class="guide-info">
                                        <h4>${guide.user?.fullName || 'Unknown Guide'}</h4>
                                        <p class="guide-specialization">${guide.specializations?.[0] || 'General Guide'}</p>
                                        <div class="guide-rating">
                                            <div class="stars">
                                                ${Array.from({length: 5}, (_, i) =>
                                                    `<i class="fas fa-star ${i < (guide.rating?.average || 0) ? 'filled' : ''}"></i>`
                                                ).join('')}
                                            </div>
                                            <span>(${guide.rating?.count || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="guide-details">
                                    <p><strong>Experience:</strong> ${guide.experience?.years || 0} years</p>
                                    <p><strong>Languages:</strong> ${guide.languages?.map(l => l.language).join(', ') || 'Not specified'}</p>
                                    <p><strong>Daily Rate:</strong> $${guide.pricing?.dailyRate || 0}</p>
                                </div>
                                <div class="guide-actions">
                                    <button class="action-btn view" onclick="dashboard.viewGuide('${guide._id}')">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="action-btn edit" onclick="dashboard.editGuide('${guide._id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="action-btn delete" onclick="dashboard.deleteGuide('${guide._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="portersTab" class="tab-panel">
                    <div class="porters-grid">
                        ${this.data.porters.map(porter => `
                            <div class="porter-card">
                                <div class="porter-header">
                                    <div class="porter-avatar">
                                        <img src="${porter.user?.avatar || '/images/default-avatar.png'}" alt="${porter.user?.fullName}">
                                    </div>
                                    <div class="porter-info">
                                        <h4>${porter.user?.fullName || 'Unknown Porter'}</h4>
                                        <p class="porter-capacity">Capacity: ${porter.capacity?.weight || 0}kg</p>
                                        <div class="porter-rating">
                                            <div class="stars">
                                                ${Array.from({length: 5}, (_, i) =>
                                                    `<i class="fas fa-star ${i < (porter.rating?.average || 0) ? 'filled' : ''}"></i>`
                                                ).join('')}
                                            </div>
                                            <span>(${porter.rating?.count || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="porter-details">
                                    <p><strong>Experience:</strong> ${porter.experience?.years || 0} years</p>
                                    <p><strong>Fitness Level:</strong> ${porter.fitness?.level || 'Not specified'}</p>
                                    <p><strong>Daily Rate:</strong> $${porter.pricing?.dailyRate || 0}</p>
                                </div>
                                <div class="porter-actions">
                                    <button class="action-btn view" onclick="dashboard.viewPorter('${porter._id}')">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="action-btn edit" onclick="dashboard.editPorter('${porter._id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="action-btn delete" onclick="dashboard.deletePorter('${porter._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Setup tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;

                // Update active states
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(tab + 'Tab').classList.add('active');
            });
        });
    }

    loadBookingsSection() {
        const container = document.getElementById('bookingsContent');

        container.innerHTML = `
            <div class="bookings-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Customer</th>
                            <th>Adventure</th>
                            <th>Start Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.bookings.map(booking => `
                            <tr>
                                <td><strong>${booking.bookingNumber || booking._id?.substring(0, 8)}</strong></td>
                                <td>${booking.customer?.fullName || 'Unknown'}</td>
                                <td>${booking.adventure?.title || 'Unknown Adventure'}</td>
                                <td>${new Date(booking.tripDetails?.startDate).toLocaleDateString()}</td>
                                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                                <td>$${booking.totalAmount || 0}</td>
                                <td>
                                    <button class="action-btn view" onclick="dashboard.viewBooking('${booking._id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn edit" onclick="dashboard.editBooking('${booking._id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    ${booking.status === 'pending' ? `
                                        <button class="action-btn delete" onclick="dashboard.cancelBooking('${booking._id}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadAnalyticsSection() {
        const container = document.getElementById('analyticsContent');

        // Update analytics based on current data
        this.updateAnalytics();
    }

    updateAnalytics() {
        // This is where you would typically create charts using Chart.js or similar
        console.log('Analytics updated for', this.currentCountry);
    }

    // Action Methods
    async viewAdventure(id) {
        console.log('Viewing adventure:', id);
        // Implementation for viewing adventure details
    }

    async editAdventure(id) {
        console.log('Editing adventure:', id);
        // Implementation for editing adventure
    }

    async deleteAdventure(id) {
        if (confirm('Are you sure you want to delete this adventure?')) {
            console.log('Deleting adventure:', id);
            // Implementation for deleting adventure
        }
    }

    async viewGuide(id) {
        console.log('Viewing guide:', id);
    }

    async editGuide(id) {
        console.log('Editing guide:', id);
    }

    async deleteGuide(id) {
        if (confirm('Are you sure you want to delete this guide?')) {
            console.log('Deleting guide:', id);
        }
    }

    async viewPorter(id) {
        console.log('Viewing porter:', id);
    }

    async editPorter(id) {
        console.log('Editing porter:', id);
    }

    async deletePorter(id) {
        if (confirm('Are you sure you want to delete this porter?')) {
            console.log('Deleting porter:', id);
        }
    }

    async viewBooking(id) {
        console.log('Viewing booking:', id);
    }

    async editBooking(id) {
        console.log('Editing booking:', id);
    }

    async cancelBooking(id) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            console.log('Cancelling booking:', id);
        }
    }

    filterBookings() {
        console.log('Filtering bookings');
        // Implementation for filtering bookings
    }

    exportBookings() {
        console.log('Exporting bookings');
        // Implementation for exporting bookings data
    }

    showAddAdventureModal() {
        console.log('Showing add adventure modal');
        // Implementation for add adventure modal
    }

    showAddGuideModal() {
        console.log('Showing add guide modal');
        // Implementation for add guide modal
    }

    showAddPorterModal() {
        console.log('Showing add porter modal');
        // Implementation for add porter modal
    }

    showNotification(message, type = 'success') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Enhanced Animation Methods
    setupCountryTheming() {
        // Initialize with current country theme
        const countryData = this.getCountryData(this.currentCountry);
        this.updateCountryTheming(countryData);
    }

    updateCountryTheming(countryData) {
        const root = document.documentElement;
        root.style.setProperty('--current-primary', countryData.primary);
        root.style.setProperty('--current-secondary', countryData.secondary);
        root.style.setProperty('--current-accent', countryData.accent);
        root.style.setProperty('--current-bg', countryData.bg);
        root.style.setProperty('--current-card-shadow', countryData.cardShadow);

        // Add country-specific class to body
        document.body.className = document.body.className.replace(/country-\w+/g, '');
        document.body.classList.add(`country-${this.currentCountry}`);
    }

    animateCountrySwitch(flag, name, countryData) {
        const flagElement = document.getElementById('currentFlag');
        const nameElement = document.getElementById('currentCountry');

        // Animate flag with bounce
        flagElement.style.animation = 'bounce 0.6s ease-out';
        setTimeout(() => {
            flagElement.textContent = flag;
            flagElement.style.animation = '';
        }, 300);

        // Animate name with slide and fade
        nameElement.style.transition = 'all 0.5s ease';
        nameElement.style.opacity = '0';
        nameElement.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            nameElement.textContent = name;
            nameElement.style.opacity = '1';
            nameElement.style.transform = 'translateX(0)';
        }, 250);
    }

    triggerCelebrationAnimation() {
        // Create floating particles for celebration
        for (let i = 0; i < 20; i++) {
            this.createFloatingParticle();
        }

        // Add bounce animation to stats cards
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'bounce 0.8s ease-out';
                setTimeout(() => {
                    card.style.animation = '';
                }, 800);
            }, index * 100);
        });
    }

    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: var(--current-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: floatUp 3s ease-out forwards;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                to {
                    transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
            style.remove();
        }, 3000);
    }

    startFloatingAnimations() {
        // Add continuous floating animations to various elements
        const floatingElements = document.querySelectorAll('.logo i, .country-flag, .user-info i');
        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.5}s`;
        });

        // Staggered card animations on load
        const cards = document.querySelectorAll('.stat-card, .widget, .adventure-card, .guide-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    addHoverAnimations() {
        // Enhanced hover effects for interactive elements
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateX(10px) scale(1.02)';
            });
            link.addEventListener('mouseleave', (e) => {
                e.target.style.transform = '';
            });
        });

        // Magnetic effect for buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            });
            btn.addEventListener('mouseleave', (e) => {
                e.target.style.transform = '';
            });
        });
    }

    animateStatsUpdate() {
        // Animate numbers counting up
        const statNumbers = document.querySelectorAll('.stat-info h3');
        statNumbers.forEach(number => {
            const target = parseInt(number.textContent) || 0;
            const duration = 1000;
            const steps = 30;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                number.textContent = Math.floor(current);
            }, duration / steps);
        });
    }

    addLoadingAnimations() {
        // Enhanced loading states with skeleton screens
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(element => {
            element.innerHTML = `
                <div class="skeleton-loader">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            `;
        });

        // Add skeleton CSS
        const skeletonStyles = document.createElement('style');
        skeletonStyles.textContent = `
            .skeleton-loader {
                padding: 1rem;
            }
            .skeleton-line {
                height: 1rem;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                margin-bottom: 0.5rem;
                border-radius: 4px;
            }
            .skeleton-line:nth-child(1) { width: 100%; }
            .skeleton-line:nth-child(2) { width: 80%; }
            .skeleton-line:nth-child(3) { width: 60%; }
        `;
        document.head.appendChild(skeletonStyles);
    }

    addPageTransitions() {
        // Smooth transitions between sections
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.6s ease-out';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.content-section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Global logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!API.utils.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    dashboard = new DashboardManager();

    // Initialize enhanced animations
    setTimeout(() => {
        dashboard.addHoverAnimations();
        dashboard.addLoadingAnimations();
        dashboard.addPageTransitions();
        dashboard.animateStatsUpdate();
    }, 1000);

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add resize handler for responsive animations
    window.addEventListener('resize', () => {
        dashboard.startFloatingAnimations();
    });

    // Add visibility change handler for performance
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause heavy animations when tab is not visible
            document.body.style.animationPlayState = 'paused';
        } else {
            document.body.style.animationPlayState = 'running';
        }
    });
});