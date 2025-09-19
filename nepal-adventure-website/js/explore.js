// Country Explore Page JavaScript
class CountryExplorer {
    constructor() {
        // Get country from URL parameter or default to nepal
        const urlParams = new URLSearchParams(window.location.search);
        this.currentCountry = urlParams.get('country') || 'nepal';
        this.data = {
            adventures: [],
            guides: [],
            porters: []
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCountry();
        this.loadCountryData();
    }

    setupEventListeners() {
        // Country switcher
        const countrySwitcher = document.getElementById('countrySwitcher');
        if (countrySwitcher) {
            countrySwitcher.value = this.currentCountry;
            countrySwitcher.addEventListener('change', (e) => {
                const selectedCountry = e.target.value;
                this.switchCountry(selectedCountry);
            });
        }

        // Adventure filters
        const typeFilter = document.getElementById('typeFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterAdventures());
        }

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.filterAdventures());
        }

        // Guide tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchGuideTab(tab);
            });
        });

        // Mobile navigation
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
    }

    initializeCountry() {
        const countryData = this.getCountryInfo(this.currentCountry);

        // Update UI elements
        document.getElementById('countryFlag').textContent = countryData.flag;
        document.getElementById('countryName').textContent = countryData.name;
        document.getElementById('countryDescription').textContent = countryData.description;

        // Update page title
        document.title = `Explore ${countryData.name} - Nepal Adventures`;

        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('country', this.currentCountry);
        window.history.replaceState(null, '', url);
    }

    getCountryInfo(countryCode) {
        const countries = {
            'nepal': {
                name: 'Nepal',
                flag: '🇳🇵',
                description: 'Discover the magical Himalayas and rich cultural heritage of Nepal'
            },
            'india': {
                name: 'India',
                flag: '🇮🇳',
                description: 'Explore diverse landscapes from the Himalayas to tropical beaches'
            },
            'china': {
                name: 'China',
                flag: '🇨🇳',
                description: 'Great Wall, ancient temples, and diverse natural wonders await'
            },
            'japan': {
                name: 'Japan',
                flag: '🇯🇵',
                description: 'Land of the Rising Sun - Mount Fuji, cherry blossoms, and tradition'
            },
            'south-korea': {
                name: 'South Korea',
                flag: '🇰🇷',
                description: 'Modern cities, ancient palaces, and beautiful mountain landscapes'
            },
            'thailand': {
                name: 'Thailand',
                flag: '🇹🇭',
                description: 'Tropical paradise with beautiful beaches, temples, and vibrant culture'
            },
            'vietnam': {
                name: 'Vietnam',
                flag: '🇻🇳',
                description: 'Ha Long Bay, lush jungles, and rich historical heritage'
            },
            'indonesia': {
                name: 'Indonesia',
                flag: '🇮🇩',
                description: '17,000 tropical islands with diverse cultures and stunning nature'
            },
            'philippines': {
                name: 'Philippines',
                flag: '🇵🇭',
                description: '7,641 islands of pristine beaches and adventure activities'
            },
            'bhutan': {
                name: 'Bhutan',
                flag: '🇧🇹',
                description: 'The Last Shangri-La - Land of the Thunder Dragon'
            },
            'pakistan': {
                name: 'Pakistan',
                flag: '🇵🇰',
                description: 'K2 peak, Karakoram mountains, and breathtaking northern landscapes'
            },
            'mongolia': {
                name: 'Mongolia',
                flag: '🇲🇳',
                description: 'Nomadic steppes, vast wilderness, and traditional horseback adventures'
            },
            'uae': {
                name: 'UAE',
                flag: '🇦🇪',
                description: 'Modern desert oasis with luxury experiences and adventure sports'
            },
            'saudi-arabia': {
                name: 'Saudi Arabia',
                flag: '🇸🇦',
                description: 'Arabian desert heritage, ancient cities, and sacred pilgrimage sites'
            },
            'iran': {
                name: 'Iran',
                flag: '🇮🇷',
                description: 'Ancient Persian empire heritage with stunning architecture and culture'
            },
            'israel': {
                name: 'Israel',
                flag: '🇮🇱',
                description: 'Holy Land with sacred sites, desert adventures, and modern cities'
            }
        };
        return countries[countryCode] || countries.nepal;
    }

    switchCountry(countryCode) {
        this.currentCountry = countryCode;
        this.initializeCountry();
        this.loadCountryData();

        // Show loading state
        this.showLoadingStates();
    }

    showLoadingStates() {
        document.getElementById('adventuresGrid').innerHTML = '<div class="loading">Loading adventures...</div>';
        document.getElementById('guidesGrid').innerHTML = '<div class="loading">Loading guides...</div>';
        document.getElementById('portersGrid').innerHTML = '<div class="loading">Loading porters...</div>';
    }

    async loadCountryData() {
        try {
            await Promise.all([
                this.loadAdventures(),
                this.loadGuides(),
                this.loadPorters()
            ]);

            this.updateStats();
            this.renderAdventures();
            this.renderGuides();
            this.renderPorters();
        } catch (error) {
            console.error('Error loading country data:', error);
            this.showError();
        }
    }

    async loadAdventures() {
        try {
            const response = await API.adventures.getAll({ country: this.currentCountry });
            this.data.adventures = response.data || [];
        } catch (error) {
            console.error('Error loading adventures:', error);
            this.data.adventures = [];
        }
    }

    async loadGuides() {
        try {
            const response = await API.guides.getAll({ country: this.currentCountry });
            this.data.guides = response.data || [];
        } catch (error) {
            console.error('Error loading guides:', error);
            this.data.guides = [];
        }
    }

    async loadPorters() {
        try {
            const response = await API.porters.getAll({ country: this.currentCountry });
            this.data.porters = response.data || [];
        } catch (error) {
            console.error('Error loading porters:', error);
            this.data.porters = [];
        }
    }

    updateStats() {
        document.getElementById('adventureCount').textContent = this.data.adventures.length;
        document.getElementById('guideCount').textContent = this.data.guides.length;

        // Count unique regions
        const regions = new Set(this.data.adventures.map(a => a.location?.region).filter(Boolean));
        document.getElementById('regionCount').textContent = regions.size;
    }

    renderAdventures() {
        const container = document.getElementById('adventuresGrid');

        if (this.data.adventures.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-mountain"></i>
                    <h3>No adventures available</h3>
                    <p>Adventures for this country are coming soon!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.data.adventures.map(adventure => `
            <div class="adventure-card" onclick="viewAdventure('${adventure._id}')">
                <div class="adventure-image">
                    ${adventure.images?.[0] ?
                        `<img src="${adventure.images[0]}" alt="${adventure.title}">` :
                        `<i class="fas fa-mountain"></i>`
                    }
                    <div class="adventure-badge">${adventure.type}</div>
                </div>
                <div class="adventure-content">
                    <h3>${adventure.title}</h3>
                    <div class="adventure-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${adventure.location?.region || 'Unknown Region'}
                    </div>
                    <div class="adventure-description">
                        ${adventure.shortDescription || adventure.description?.substring(0, 120) + '...'}
                    </div>
                    <div class="adventure-meta">
                        <div class="adventure-details">
                            <span><i class="fas fa-clock"></i> ${adventure.duration?.days || 0} days</span>
                            <span><i class="fas fa-signal"></i> ${adventure.difficulty?.level || 'Moderate'}</span>
                        </div>
                        <div class="adventure-price">$${adventure.pricing?.basePrice || 0}</div>
                    </div>
                    <div class="adventure-actions">
                        <button class="btn-book">Book Now</button>
                        <button class="btn-details">Details</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderGuides() {
        const container = document.getElementById('guidesGrid');

        if (this.data.guides.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-tie"></i>
                    <h3>No guides available</h3>
                    <p>Guides for this country are coming soon!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.data.guides.map(guide => `
            <div class="guide-card">
                <div class="guide-header">
                    <div class="guide-avatar">
                        ${guide.user?.avatar ?
                            `<img src="${guide.user.avatar}" alt="${guide.user?.fullName}">` :
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="guide-info">
                        <h4>${guide.user?.fullName || 'Unknown Guide'}</h4>
                        <div class="guide-specialization">${guide.specializations?.[0] || 'General Guide'}</div>
                        <div class="guide-rating">
                            <div class="stars">
                                ${Array.from({length: 5}, (_, i) =>
                                    `<i class="fas fa-star ${i < (guide.rating?.average || 0) ? 'filled' : ''}"></i>`
                                ).join('')}
                            </div>
                            <span>(${guide.rating?.count || 0})</span>
                        </div>
                    </div>
                </div>
                <div class="guide-details">
                    <strong>Experience:</strong> ${guide.experience?.years || 0} years<br>
                    <strong>Languages:</strong> ${guide.languages?.map(l => l.language).join(', ') || 'Not specified'}
                </div>
                <div class="guide-price">$${guide.pricing?.dailyRate || 0}/day</div>
                <div class="guide-actions">
                    <button class="btn-contact">Contact Guide</button>
                </div>
            </div>
        `).join('');
    }

    renderPorters() {
        const container = document.getElementById('portersGrid');

        if (this.data.porters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hiking"></i>
                    <h3>No porters available</h3>
                    <p>Porters for this country are coming soon!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.data.porters.map(porter => `
            <div class="guide-card">
                <div class="guide-header">
                    <div class="guide-avatar">
                        ${porter.user?.avatar ?
                            `<img src="${porter.user.avatar}" alt="${porter.user?.fullName}">` :
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="guide-info">
                        <h4>${porter.user?.fullName || 'Unknown Porter'}</h4>
                        <div class="guide-specialization">Carrying capacity: ${porter.carryingCapacity || 0}kg</div>
                        <div class="guide-rating">
                            <div class="stars">
                                ${Array.from({length: 5}, (_, i) =>
                                    `<i class="fas fa-star ${i < (porter.rating?.average || 0) ? 'filled' : ''}"></i>`
                                ).join('')}
                            </div>
                            <span>(${porter.rating?.count || 0})</span>
                        </div>
                    </div>
                </div>
                <div class="guide-details">
                    <strong>Experience:</strong> ${porter.experience?.years || 0} years<br>
                    <strong>Max Altitude:</strong> ${porter.maxAltitude || 0}m
                </div>
                <div class="guide-price">$${porter.pricing?.dailyRate || 0}/day</div>
                <div class="guide-actions">
                    <button class="btn-contact">Contact Porter</button>
                </div>
            </div>
        `).join('');
    }

    filterAdventures() {
        const typeFilter = document.getElementById('typeFilter').value;
        const difficultyFilter = document.getElementById('difficultyFilter').value;

        let filteredAdventures = [...this.data.adventures];

        if (typeFilter) {
            filteredAdventures = filteredAdventures.filter(a => a.type === typeFilter);
        }

        if (difficultyFilter) {
            filteredAdventures = filteredAdventures.filter(a => a.difficulty?.level === difficultyFilter);
        }

        // Temporarily update data and re-render
        const originalAdventures = this.data.adventures;
        this.data.adventures = filteredAdventures;
        this.renderAdventures();
        this.data.adventures = originalAdventures; // Restore original data
    }

    switchGuideTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show/hide appropriate content
        const guidesGrid = document.getElementById('guidesGrid');
        const portersGrid = document.getElementById('portersGrid');

        if (tab === 'guides') {
            guidesGrid.style.display = 'grid';
            portersGrid.style.display = 'none';
        } else {
            guidesGrid.style.display = 'none';
            portersGrid.style.display = 'grid';
        }
    }

    showError() {
        document.getElementById('adventuresGrid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading data</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Global functions
function viewAdventure(id) {
    console.log('Viewing adventure:', id);
    // TODO: Navigate to adventure details page
}

function scrollToAdventures() {
    document.querySelector('.adventures-section').scrollIntoView({
        behavior: 'smooth'
    });
}

// Initialize when page loads
let countryExplorer;
document.addEventListener('DOMContentLoaded', () => {
    countryExplorer = new CountryExplorer();
});